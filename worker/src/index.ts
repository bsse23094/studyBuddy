import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  GEMINI_API_KEY: string;
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
      gemini: c.env.GEMINI_API_KEY ? 'configured' : 'missing',
      cache: 'available'
    }
  });
});

app.get('/', (c) => {
  return c.json({
    name: 'StudyBuddy API',
    version: '2.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/chat',
      'POST /api/quiz/generate',
      'POST /api/flashcards/generate',
      'POST /api/documents/analyze',
      'POST /api/answers/evaluate',
      'POST /api/flashcards/schedule',
      'POST /api/progress/analytics',
      'POST /api/concepts/cluster',
      'POST /api/routine/generate'
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

    // Call Gemini API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    // Check if API key is available
    if (!c.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return c.json({ 
        success: false, 
        error: 'AI service not configured. Please contact support.' 
      }, 500);
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${c.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\n${userMessage}` }
              ]
            }
          ],
          generationConfig: {
            temperature: parseFloat(c.env.DEFAULT_TEMPERATURE || '0.7'),
            maxOutputTokens: parseInt(c.env.MAX_TOKENS || '2048'),
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini error:', response.status, errorText);
        
        // Handle specific error codes
        if (response.status === 429) {
          return c.json({ 
            success: false, 
            error: 'Rate limit exceeded. Please wait a moment before trying again.' 
          }, 429);
        }
        
        if (response.status === 401 || response.status === 403) {
          const keySet = c.env.GEMINI_API_KEY ? 'set' : 'missing';
          console.error('Auth error - API key status:', keySet, 'Response:', errorText);
          return c.json({ 
            success: false, 
            error: 'Authentication failed. Please contact support.',
            debug: c.env.ENVIRONMENT === 'development' ? { status: response.status, keySet, details: errorText } : undefined
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
          error: 'Unable to process your request. Please try again.',
          debug: c.env.ENVIRONMENT === 'development' ? { status: response.status, details: errorText } : undefined
        }, 500);
      }

      const data = await response.json() as any;
      let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
                modelUsed: 'gemini-2.0-flash',
                error: 'empty_response'
              }
            },
            sources: []
          },
          meta: {
            timestamp: new Date().toISOString(),
            provider: 'gemini'
          }
        });
      }

      // Return in format expected by frontend
      return c.json({
        success: true,
        data: {
          conversationId: conversationId || `conv_${Date.now()}`,
          message: {
            id: `msg_${Date.now()}`,
            role: 'assistant',
            content: reply.trim(),
            timestamp: new Date().toISOString(),
            meta: {
              mode,
              modelUsed: 'gemini-2.0-flash'
            }
          },
          sources: []
        },
        meta: {
          timestamp: new Date().toISOString(),
          provider: 'gemini'
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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${c.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `You are a quiz generator. Return only valid JSON.\n\n${prompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini quiz error:', response.status, errorText);
        
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
      let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!content || content.trim().length === 0) {
        return c.json({ 
          success: false, 
          error: 'AI returned empty response. Please try again.' 
        }, 500);
      }

      // Clean up any markdown code blocks
      content = content
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${c.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `You are a flashcard generator. Return only valid JSON.\n\n${prompt}` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini flashcard error:', response.status, errorText);
        
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
      let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!content || content.trim().length === 0) {
        return c.json({ 
          success: false, 
          error: 'AI returned empty response. Please try again.' 
        }, 500);
      }

      // Clean up any markdown code blocks
      content = content
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
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

// Document Analysis & Content Ingestion
app.post('/api/documents/analyze', async (c) => {
  try {
    const body = await c.req.json();
    const { content, fileName } = body;

    if (!content || content.trim().length === 0) {
      return c.json({ success: false, error: 'Content is required' }, 400);
    }

    // Extract key information using AI
    const analysisPrompt = `Analyze this educational content and extract:
1. Main topics (3-5 key topics)
2. Difficulty level (beginner/intermediate/advanced)
3. Subject area
4. Key concepts (5-10 concepts)
5. Suggested tags

Content:
${content.substring(0, 3000)}

Return ONLY a valid JSON object with this structure:
{
  "topics": ["topic1", "topic2"],
  "difficulty": "intermediate",
  "subject": "subject name",
  "concepts": ["concept1", "concept2"],
  "tags": ["tag1", "tag2"],
  "summary": "brief summary"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${c.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `You are a content analyzer. Return only valid JSON.\n\n${analysisPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const data = await response.json() as any;
    let analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up any markdown code blocks
    analysisText = analysisText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    
    // Parse JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      topics: ['General'],
      difficulty: 'intermediate',
      subject: 'Unknown',
      concepts: [],
      tags: [],
      summary: 'Content analysis unavailable'
    };

    return c.json({
      success: true,
      data: {
        fileName,
        analysis,
        wordCount: content.split(/\s+/).length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Document analysis error:', error);
    return c.json({ success: false, error: 'Failed to analyze document' }, 500);
  }
});

// Answer Evaluation & Feedback
app.post('/api/answers/evaluate', async (c) => {
  try {
    const body = await c.req.json();
    const { question, correctAnswer, studentAnswer } = body;

    if (!question || !studentAnswer) {
      return c.json({ success: false, error: 'Question and student answer are required' }, 400);
    }

    const evaluationPrompt = `Evaluate this student's answer:

Question: ${question}
${correctAnswer ? `Correct Answer: ${correctAnswer}` : ''}
Student's Answer: ${studentAnswer}

Provide:
1. Score (0-100)
2. Feedback (specific, constructive)
3. Strengths (what they got right)
4. Improvements (what to work on)
5. IsCorrect (true/false)

Return ONLY a valid JSON object:
{
  "score": 85,
  "isCorrect": true,
  "feedback": "detailed feedback",
  "strengths": ["point1", "point2"],
  "improvements": ["suggestion1", "suggestion2"]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${c.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `You are an educational evaluator. Return only valid JSON.\n\n${evaluationPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Evaluation failed');
    }

    const data = await response.json() as any;
    let evalText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up any markdown code blocks
    evalText = evalText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    
    const jsonMatch = evalText.match(/\{[\s\S]*\}/);
    const evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      score: 50,
      isCorrect: false,
      feedback: 'Unable to evaluate answer',
      strengths: [],
      improvements: ['Please try again']
    };

    return c.json({
      success: true,
      data: {
        evaluation,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Answer evaluation error:', error);
    return c.json({ success: false, error: 'Failed to evaluate answer' }, 500);
  }
});

// Smart Flashcard Scheduling
app.post('/api/flashcards/schedule', async (c) => {
  try {
    const body = await c.req.json();
    const { flashcards, performanceHistory } = body;

    if (!flashcards || !Array.isArray(flashcards)) {
      return c.json({ success: false, error: 'Flashcards array is required' }, 400);
    }

    // Implement spaced repetition algorithm (SM-2 simplified)
    const now = new Date().getTime();
    const scheduledCards = flashcards.map((card: any) => {
      const lastReview = card.lastReviewed ? new Date(card.lastReviewed).getTime() : 0;
      const daysSinceReview = (now - lastReview) / (1000 * 60 * 60 * 24);
      
      // Get performance data
      const performance = performanceHistory?.[card.id] || { correct: 0, total: 0 };
      const successRate = performance.total > 0 ? performance.correct / performance.total : 0;
      
      // Calculate interval (SM-2 inspired)
      let interval = card.interval || 1;
      let easeFactor = card.easeFactor || 2.5;
      
      if (successRate >= 0.8) {
        interval = Math.ceil(interval * easeFactor);
        easeFactor = Math.min(easeFactor + 0.1, 3.0);
      } else if (successRate >= 0.6) {
        interval = Math.ceil(interval * 1.2);
      } else {
        interval = 1; // Reset if struggling
        easeFactor = Math.max(easeFactor - 0.2, 1.3);
      }
      
      // Calculate priority (higher = more urgent to review)
      const priority = daysSinceReview >= interval ? 100 - (successRate * 100) : 
                      Math.max(0, 50 - (interval - daysSinceReview) * 10);
      
      return {
        ...card,
        interval,
        easeFactor,
        priority: Math.round(priority),
        dueDate: new Date(now + interval * 24 * 60 * 60 * 1000).toISOString(),
        isDue: daysSinceReview >= interval,
        confidence: successRate
      };
    });

    // Sort by priority (descending)
    scheduledCards.sort((a, b) => b.priority - a.priority);

    return c.json({
      success: true,
      data: {
        scheduledCards,
        dueCount: scheduledCards.filter(c => c.isDue).length,
        totalCards: scheduledCards.length,
        reviewRecommendation: scheduledCards.slice(0, 10), // Top 10 to review
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Flashcard scheduling error:', error);
    return c.json({ success: false, error: 'Failed to schedule flashcards' }, 500);
  }
});

// Progress Analytics & Insights
app.post('/api/progress/analytics', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, performanceData, timeRange } = body;

    if (!performanceData) {
      return c.json({ success: false, error: 'Performance data is required' }, 400);
    }

    // Generate natural language insights
    const insightsPrompt = `Analyze this student's performance data and provide insights:

Data: ${JSON.stringify(performanceData, null, 2)}

Generate insights in this JSON format:
{
  "summary": "Overall performance summary",
  "achievements": ["achievement1", "achievement2"],
  "improvements": ["area1", "area2"],
  "trends": ["trend1", "trend2"],
  "recommendations": ["rec1", "rec2"],
  "strengths": ["strength1", "strength2"],
  "focusAreas": ["area1", "area2"]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${c.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `You are an educational analytics assistant. Return only valid JSON.\n\n${insightsPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Analytics generation failed');
    }

    const data = await response.json() as any;
    let insightsText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up any markdown code blocks
    insightsText = insightsText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    
    const jsonMatch = insightsText.match(/\{[\s\S]*\}/);
    const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      summary: 'Analysis unavailable',
      achievements: [],
      improvements: [],
      trends: [],
      recommendations: [],
      strengths: [],
      focusAreas: []
    };

    // Calculate basic statistics
    const stats = {
      totalQuizzes: performanceData.quizzes?.length || 0,
      averageScore: performanceData.quizzes?.reduce((sum: number, q: any) => sum + (q.score || 0), 0) / (performanceData.quizzes?.length || 1),
      totalFlashcards: performanceData.flashcards?.reviewed || 0,
      studyStreak: performanceData.streak || 0,
      totalStudyTime: performanceData.totalTime || 0
    };

    return c.json({
      success: true,
      data: {
        insights,
        stats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Progress analytics error:', error);
    return c.json({ success: false, error: 'Failed to generate analytics' }, 500);
  }
});

// Concept Clustering & Topic Mapping
app.post('/api/concepts/cluster', async (c) => {
  try {
    const body = await c.req.json();
    const { concepts, materials } = body;

    if (!concepts || !Array.isArray(concepts)) {
      return c.json({ success: false, error: 'Concepts array is required' }, 400);
    }

    // Use AI to cluster related concepts
    const clusterPrompt = `Group these educational concepts into logical clusters:

Concepts: ${concepts.join(', ')}

Return a JSON object with clustered concepts:
{
  "clusters": [
    {
      "name": "Cluster Name",
      "concepts": ["concept1", "concept2"],
      "description": "Brief description",
      "difficulty": "beginner/intermediate/advanced"
    }
  ],
  "relationships": [
    {"from": "concept1", "to": "concept2", "type": "prerequisite/related"}
  ]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${c.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `You are a concept mapping specialist. Return only valid JSON.\n\n${clusterPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1200,
        }
      })
    });

    if (!response.ok) {
      throw new Error('Clustering failed');
    }

    const data = await response.json() as any;
    let clusterText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up any markdown code blocks
    clusterText = clusterText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim();
    
    const jsonMatch = clusterText.match(/\{[\s\S]*\}/);
    const clustering = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      clusters: [],
      relationships: []
    };

    return c.json({
      success: true,
      data: {
        clustering,
        totalConcepts: concepts.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Concept clustering error:', error);
    return c.json({ success: false, error: 'Failed to cluster concepts' }, 500);
  }
});

// Routine Generation endpoint
app.post('/api/routine/generate', async (c) => {
  try {
    const body = await c.req.json();
    const { preferences, activities } = body;

    if (!preferences) {
      return c.json({ success: false, error: 'Preferences are required' }, 400);
    }

    // Build AI prompt for routine generation
    const activityList = activities?.map((a: any) => 
      `- ${a.name} (${a.suggestedDuration} min, ${a.category}${a.isOptional ? ', optional' : ''})`
    ).join('\n') || '';

    const prompt = `Create an optimized daily schedule with these constraints:

Wake up: ${preferences.wakeUpTime}
Sleep: ${preferences.sleepTime}
Study goal: ${preferences.studyGoalHours} hours
School/Work: ${preferences.schoolOrWorkHours} hours starting at ${preferences.schoolOrWorkStartTime}
Priority: ${preferences.priorityLevel}
Break style: ${preferences.breakPreference}

Activities to schedule:
${activityList}

Requirements:
1. Schedule must fit within wake-sleep times
2. Include all non-optional activities
3. Add ${preferences.breakPreference === 'pomodoro' ? '25-min study blocks with 5-min breaks' : preferences.breakPreference === 'frequent-short' ? '15-min breaks every 90 minutes' : '30-min breaks every 2-3 hours'}
4. Optimize for ${preferences.priorityLevel} lifestyle
5. Ensure adequate meal times and rest

Provide the schedule in this exact format for each block:
[HH:MM-HH:MM] Activity Name | Category | Notes

Example:
[07:00-08:00] Morning Routine | essential | Get ready, breakfast
[08:00-10:00] Deep Study | study | Focus time, no distractions

Also provide 3-5 productivity tips at the end.`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${c.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `You are a productivity expert helping students create optimal daily schedules. Be specific with times and practical with recommendations.\n\n${prompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini error:', response.status, errorText);
      return c.json({ 
        success: false, 
        error: 'Failed to generate routine schedule' 
      }, 500);
    }

    const data = await response.json() as any;
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!aiResponse || aiResponse.trim().length === 0) {
      return c.json({
        success: false,
        error: 'AI generated empty response'
      }, 500);
    }

    return c.json({
      success: true,
      data: {
        schedule: aiResponse,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Routine generation error:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to generate routine' 
    }, 500);
  }
});

export default app;
