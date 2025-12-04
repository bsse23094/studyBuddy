/**
 * AI Provider API utilities with fallback support
 */

export interface AIProvider {
  name: string;
  baseUrl: string;
  model: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * Call AI provider with automatic fallback
 */
export async function callAIProvider(
  messages: ChatMessage[],
  env: any,
  options: {
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  } = {}
): Promise<Response> {
  const temperature = options.temperature ?? parseFloat(env.DEFAULT_TEMPERATURE || '0.7');
  const maxTokens = options.maxTokens ?? parseInt(env.MAX_TOKENS || '2048');
  const stream = options.stream ?? false;

  // Try OpenRouter first (primary provider)
  if (env.OPENROUTER_API_KEY) {
    try {
      return await callOpenRouter(messages, env.OPENROUTER_API_KEY, {
        temperature,
        maxTokens,
        stream
      });
    } catch (error) {
      console.error('OpenRouter failed:', error);
    }
  }

  // Fallback to Hugging Face
  if (env.HF_API_KEY) {
    try {
      return await callHuggingFace(messages, env.HF_API_KEY, {
        temperature,
        maxTokens
      });
    } catch (error) {
      console.error('Hugging Face failed:', error);
    }
  }

  throw new Error('No AI provider available. Please configure OPENROUTER_API_KEY or HF_API_KEY');
}

/**
 * OpenRouter API call (supports multiple models with unified API)
 */
async function callOpenRouter(
  messages: ChatMessage[],
  apiKey: string,
  options: { temperature: number; maxTokens: number; stream: boolean }
): Promise<Response> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://github.com/yourusername/studybuddy',
      'X-Title': 'StudyBuddy AI Tutor'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.1-8b-instruct:free', // Free tier model
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      stream: options.stream
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  return response;
}

/**
 * Hugging Face Inference API call (fallback)
 */
async function callHuggingFace(
  messages: ChatMessage[],
  apiKey: string,
  options: { temperature: number; maxTokens: number }
): Promise<Response> {
  // Convert chat messages to prompt text
  const prompt = messages
    .map(m => `${m.role === 'system' ? 'System' : m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  const response = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: options.temperature,
          max_new_tokens: options.maxTokens,
          return_full_text: false
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} - ${error}`);
  }

  // Convert HF response to OpenAI-compatible format
  const hfResponse = await response.json() as any;
  const text = Array.isArray(hfResponse) ? hfResponse[0]?.generated_text : hfResponse.generated_text;

  return new Response(
    JSON.stringify({
      choices: [{
        message: {
          role: 'assistant',
          content: text || ''
        },
        finish_reason: 'stop'
      }]
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Generate embeddings for text (for RAG)
 */
export async function generateEmbedding(
  text: string,
  env: any
): Promise<number[]> {
  // Try Gemini embedding endpoint
  if (env.GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text }] }
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        return data.embedding?.values || [];
      }
    } catch (error) {
      console.error('Gemini embedding failed:', error);
    }
  }

  // Fallback to simple TF-IDF style vector (not ideal but works)
  return simpleEmbedding(text);
}

/**
 * Fallback: Simple embedding using word frequency (lightweight)
 */
function simpleEmbedding(text: string, dimensions: number = 384): number[] {
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const vector = new Array(dimensions).fill(0);
  
  words.forEach((word, idx) => {
    const hash = hashString(word);
    for (let i = 0; i < 3; i++) {
      const index = (hash + i * 7) % dimensions;
      vector[index] += 1 / Math.sqrt(words.length);
    }
  });
  
  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
}

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  
  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}
