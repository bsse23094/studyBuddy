import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  OPENROUTER_API_KEY: string;
  HF_API_KEY?: string;
  CACHE: KVNamespace;
  RATE_LIMIT: KVNamespace;
  ENVIRONMENT: string;
  MAX_TOKENS: string;
  DEFAULT_TEMPERATURE: string;
  ALLOWED_ORIGINS: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use('/*', async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  const corsMiddleware = cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  });
  return corsMiddleware(c, next);
});

app.get('/api/health', (c) => {
  return c.json({
    success: true,
    status: 'healthy',
    services: {
      openRouter: c.env.OPENROUTER_API_KEY ? 'configured' : 'missing',
      cache: 'available'
    }
  });
});

app.get('/', (c) => {
  return c.json({
    name: 'StudyBuddy API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/chat',
      'POST /api/quiz/generate',
      'POST /api/flashcards/generate'
    ]
  });
});

// Chat endpoint
app.post('/api/chat', async (c) => {
  try {
    const body = await c.req.json();
    
    // Support both formats: simple {message, mode} and full {messages, options}
    let userMessage: string;
    let mode: string;
    let conversationId: string | undefined;
    
    if (body.messages && Array.isArray(body.messages)) {
      // Frontend format: {conversationId, messages: [...], options: {...}}
      const lastMessage = body.messages[body.messages.length - 1];
      userMessage = lastMessage.content;
      mode = body.options?.mode || 'explain';
      conversationId = body.conversationId;
    } else {
      // Simple format: {message, mode, context}
      userMessage = body.message;
      mode = body.mode || 'explain';
    }

    if (!userMessage || userMessage.trim().length === 0) {
      return c.json({ 
        success: false, 
        error: 'Message is required and cannot be empty' 
      }, 400);
    }

    // Validate message length (prevent abuse)
    if (userMessage.length > 5000) {
      return c.json({ 
        success: false, 
        error: 'Message is too long. Please keep it under 5000 characters.' 
      }, 400);
    }

    // Validate mode
    const validModes = ['explain', 'solve', 'hint', 'quiz'];
    if (!validModes.includes(mode)) {
      mode = 'explain'; // Default to explain if invalid
    }

    // Build prompt based on mode
    let systemPrompt = '';
    switch (mode) {
      case 'solve':
        systemPrompt = 'You are a helpful tutor. Solve this problem step-by-step, showing your work clearly.';
        break;
      case 'hint':
        systemPrompt = 'You are a helpful tutor. Provide a helpful hint to guide the student, without giving away the full answer.';
        break;
      case 'quiz':
        systemPrompt = 'You are a helpful tutor. Ask a relevant quiz question based on this topic.';
        break;
      default:
        systemPrompt = 'You are a helpful tutor. Explain this concept clearly and concisely.';
    }

    const fullPrompt = body.context 
      ? `${systemPrompt}\n\nContext: ${body.context}\n\nStudent question: ${userMessage}`
      : `${systemPrompt}\n\nStudent question: ${userMessage}`;

    // Call OpenRouter API with reliable FREE model
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${c.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://studybuddy.app',
          'X-Title': 'StudyBuddy'
        },
        body: JSON.stringify({
          model: 'nousresearch/hermes-3-llama-3.1-405b:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: parseInt(c.env.MAX_TOKENS || '500'),
          temperature: parseFloat(c.env.DEFAULT_TEMPERATURE || '0.7')
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter error:', response.status, errorText);
        
        // Handle specific error codes
        if (response.status === 429) {
          return c.json({ 
            success: false, 
            error: 'Rate limit exceeded. Please wait 60 seconds before trying again.' 
          }, 429);
        }
        
        if (response.status === 401 || response.status === 403) {
          return c.json({ 
            success: false, 
            error: 'Authentication failed. Please contact support.' 
          }, 500);
        }
        
        if (response.status >= 500) {
          return c.json({ 
            success: false, 
            error: 'AI service is temporarily unavailable. Please try again in a moment.' 
          }, 503);
        }

        return c.json({ 
          success: false, 
          error: 'Unable to process your request. Please try again.' 
        }, 500);
      }

      const data = await response.json() as any;
      let reply = data.choices?.[0]?.message?.content || '';

      // Check if we got empty response
      if (!reply || reply.trim().length === 0) {
        return c.json({
          success: true,
          data: {
            conversationId: conversationId || `conv_${Date.now()}`,
            message: {
              id: `msg_${Date.now()}`,
              role: 'assistant',
              content: 'I apologize, but I was unable to generate a response. Could you please rephrase your question or provide more details?',
              timestamp: new Date().toISOString(),
              meta: {
                mode,
                modelUsed: 'nousresearch/hermes-3-llama-3.1-405b:free',
                error: 'empty_response'
              }
            },
            sources: []
          },
          meta: {
            timestamp: new Date().toISOString(),
            provider: 'openrouter'
          }
        });
      }

      // Clean up ALL Mistral model formatting tags
      reply = reply
        .replace(/<\/?s>/gi, '')                                    // Remove <s> and </s>
        .replace(/\[\/?(OUT|INST|OST|B_INST|E_INST)\]/gi, '')      // Remove all instruction tags
        .replace(/\[\/s>/gi, '')                                    // Remove [/s>
        .replace(/^\s+|\s+$/g, '')                                  // Trim whitespace
        .trim();

      // Check again after cleanup
      if (reply.length === 0) {
        reply = 'I apologize, but I encountered an issue generating a proper response. Could you please try rephrasing your question?';
      }

      // Return in format expected by frontend
      return c.json({
        success: true,
        data: {
          conversationId: conversationId || `conv_${Date.now()}`,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: reply,
            timestamp: new Date().toISOString(),
            meta: {
              mode,
              modelUsed: 'nousresearch/hermes-3-llama-3.1-405b:free'
            }
          },
          sources: []
        },
        meta: {
          timestamp: new Date().toISOString(),
          provider: 'openrouter'
        }
      });

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Handle timeout
      if (error.name === 'AbortError') {
        return c.json({ 
          success: false, 
          error: 'Request timed out. The AI service is taking too long to respond. Please try again.' 
        }, 504);
      }
      
      // Handle other errors
      console.error('Chat error:', error);
      return c.json({ 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      }, 500);
    }
  } catch (error) {
    console.error('Chat outer error:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Quiz generation endpoint
app.post('/api/quiz/generate', async (c) => {
  try {
    const body = await c.req.json();
    const { topic, difficulty = 'medium', count = 5 } = body;

    // Validation
    if (!topic || topic.trim().length === 0) {
      return c.json({ 
        success: false, 
        error: 'Topic is required' 
      }, 400);
    }

    if (topic.length > 200) {
      return c.json({ 
        success: false, 
        error: 'Topic is too long (max 200 characters)' 
      }, 400);
    }

    if (count < 1 || count > 20) {
      return c.json({ 
        success: false, 
        error: 'Question count must be between 1 and 20' 
      }, 400);
    }

    const prompt = `Generate ${count} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level. 
    
Format as JSON array:
[
  {
    "question": "Question text?",
    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
    "correctAnswer": 0,
    "explanation": "Brief explanation"
  }
]

Only return valid JSON, no other text.`;

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout for quiz generation

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${c.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://studybuddy.app',
          'X-Title': 'StudyBuddy'
        },
        body: JSON.stringify({
          model: 'nousresearch/hermes-3-llama-3.1-405b:free',
          messages: [
            { role: 'system', content: 'You are a quiz generator. Return only valid JSON.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1500,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter quiz error:', response.status, errorText);
        
        if (response.status === 429) {
          return c.json({ 
            success: false, 
            error: 'Too many requests. Please wait a moment and try again.' 
          }, 429);
        }
        
        if (response.status >= 500) {
          return c.json({ 
            success: false, 
            error: 'AI service is temporarily unavailable. Please try again in a moment.' 
          }, 503);
        }

        return c.json({ 
          success: false, 
          error: 'Unable to generate quiz. Please try again.' 
        }, 500);
      }

      const data = await response.json() as any;
      let content = data.choices?.[0]?.message?.content || '';
      
      if (!content || content.trim().length === 0) {
        return c.json({ 
          success: false, 
          error: 'AI returned empty response. Please try again.' 
        }, 500);
      }

      // Clean up Mistral model formatting tags
      content = content
        .replace(/<\/?s>/gi, '')
        .replace(/\[\/?(OUT|INST|OST|B_INST|E_INST)\]/gi, '')
        .replace(/\[\/s>/gi, '')
        .trim();
    
      // Extract JSON from response
      let questions = [];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('No JSON array found in response');
        }
        questions = JSON.parse(jsonMatch[0]);
        
        if (!Array.isArray(questions) || questions.length === 0) {
          throw new Error('Invalid or empty questions array');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return c.json({ 
          success: false, 
          error: 'Unable to parse quiz questions. Please try again.' 
        }, 500);
      }

      // Randomize options for each question to avoid pattern bias
      questions = questions.map((q: any) => {
        if (!q.options || !Array.isArray(q.options)) return q;
        
        const correctAnswerIndex = q.correctAnswer || 0;
        const correctAnswerText = q.options[correctAnswerIndex];
        
        // Shuffle options using Fisher-Yates algorithm
        const shuffledOptions = [...q.options];
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        
        // Find new index of correct answer
        const newCorrectIndex = shuffledOptions.findIndex(opt => opt === correctAnswerText);
        
        return {
          ...q,
          options: shuffledOptions,
          correctAnswer: newCorrectIndex
        };
      });

      return c.json({
        success: true,
        data: {
          questions,
          topic,
          difficulty,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        return c.json({ 
          success: false, 
          error: 'Quiz generation timed out. Please try a simpler topic or fewer questions.' 
        }, 504);
      }
      
      console.error('Quiz generation error:', error);
      return c.json({ 
        success: false, 
        error: 'An unexpected error occurred while generating quiz.' 
      }, 500);
    }
  } catch (error) {
    console.error('Quiz outer error:', error);
    return c.json({ success: false, error: 'Failed to generate quiz' }, 500);
  }
});

// Flashcard generation endpoint
app.post('/api/flashcards/generate', async (c) => {
  try {
    const body = await c.req.json();
    const { topic, count = 10 } = body;

    // Validation
    if (!topic || topic.trim().length === 0) {
      return c.json({ 
        success: false, 
        error: 'Topic is required' 
      }, 400);
    }

    if (topic.length > 200) {
      return c.json({ 
        success: false, 
        error: 'Topic is too long (max 200 characters)' 
      }, 400);
    }

    if (count < 1 || count > 30) {
      return c.json({ 
        success: false, 
        error: 'Flashcard count must be between 1 and 30' 
      }, 400);
    }

    const prompt = `Generate ${count} flashcards about "${topic}". 
    
Format as JSON array:
[
  {
    "front": "Question or term",
    "back": "Answer or definition",
    "category": "${topic}"
  }
]

Only return valid JSON, no other text.`;

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${c.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://studybuddy.app',
          'X-Title': 'StudyBuddy'
        },
        body: JSON.stringify({
          model: 'nousresearch/hermes-3-llama-3.1-405b:free',
          messages: [
            { role: 'system', content: 'You are a flashcard generator. Return only valid JSON.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1500,
          temperature: 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter flashcard error:', response.status, errorText);
        
        if (response.status === 429) {
          return c.json({ 
            success: false, 
            error: 'Too many requests. Please wait a moment and try again.' 
          }, 429);
        }
        
        if (response.status >= 500) {
          return c.json({ 
            success: false, 
            error: 'AI service is temporarily unavailable. Please try again in a moment.' 
          }, 503);
        }

        return c.json({ 
          success: false, 
          error: 'Unable to generate flashcards. Please try again.' 
        }, 500);
      }

      const data = await response.json() as any;
      let content = data.choices?.[0]?.message?.content || '';
      
      if (!content || content.trim().length === 0) {
        return c.json({ 
          success: false, 
          error: 'AI returned empty response. Please try again.' 
        }, 500);
      }

      // Clean up Mistral model formatting tags
      content = content
        .replace(/<\/?s>/gi, '')
        .replace(/\[\/?(OUT|INST|OST|B_INST|E_INST)\]/gi, '')
        .replace(/\[\/s>/gi, '')
        .trim();
    
      // Extract JSON from response
      let flashcards = [];
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error('No JSON array found in response');
        }
        flashcards = JSON.parse(jsonMatch[0]);
        
        if (!Array.isArray(flashcards) || flashcards.length === 0) {
          throw new Error('Invalid or empty flashcards array');
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return c.json({ 
          success: false, 
          error: 'Unable to parse flashcards. Please try again.' 
        }, 500);
      }

      return c.json({
        success: true,
        data: {
          flashcards,
          topic,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        return c.json({ 
          success: false, 
          error: 'Flashcard generation timed out. Please try a simpler topic or fewer flashcards.' 
        }, 504);
      }
      
      console.error('Flashcard generation error:', error);
      return c.json({ 
        success: false, 
        error: 'An unexpected error occurred while generating flashcards.' 
      }, 500);
    }
  } catch (error) {
    console.error('Flashcard outer error:', error);
    return c.json({ success: false, error: 'Failed to generate flashcards' }, 500);
  }
});

export default app;
