/**
 * Provider Adapter with Fallback Logic
 */

import type { Env } from '../index';

interface ProviderRequest {
  prompt: string;
  temperature: number;
  maxTokens: number;
  stream: boolean;
}

interface ProviderResponse {
  content: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const PROVIDERS = [
  { name: 'gemini', priority: 1, enabled: true },
  { name: 'huggingface', priority: 2, enabled: true }
];

export async function callProvider(env: Env, request: ProviderRequest): Promise<ProviderResponse> {
  const sortedProviders = PROVIDERS
    .filter(p => p.enabled)
    .sort((a, b) => a.priority - b.priority);

  for (const provider of sortedProviders) {
    try {
      if (provider.name === 'gemini') {
        return await callGemini(env, request);
      } else if (provider.name === 'huggingface') {
        return await callHuggingFace(env, request);
      }
    } catch (error) {
      console.error(`Provider ${provider.name} failed:`, error);
      // Continue to next provider
    }
  }

  throw new Error('All providers failed');
}

async function callGemini(env: Env, request: ProviderRequest): Promise<ProviderResponse> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: request.prompt }
          ]
        }
      ],
      generationConfig: {
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json() as any;
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return {
    content,
    provider: 'gemini',
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount || Math.floor(request.prompt.length / 4),
      completionTokens: data.usageMetadata?.candidatesTokenCount || Math.floor(content.length / 4),
      totalTokens: data.usageMetadata?.totalTokenCount || Math.floor((request.prompt.length + content.length) / 4),
    },
  };
}

async function callHuggingFace(env: Env, request: ProviderRequest): Promise<ProviderResponse> {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: request.prompt,
        parameters: {
          temperature: request.temperature,
          max_new_tokens: request.maxTokens,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.statusText}`);
  }

  const data = await response.json() as any[];
  const content = data[0]?.generated_text || '';

  return {
    content,
    provider: 'huggingface',
    usage: {
      promptTokens: Math.floor(request.prompt.length / 4),
      completionTokens: Math.floor(content.length / 4),
      totalTokens: Math.floor((request.prompt.length + content.length) / 4),
    },
  };
}
