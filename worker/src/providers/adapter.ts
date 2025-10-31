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
  { name: 'openrouter', priority: 1, enabled: true },
  { name: 'huggingface', priority: 2, enabled: true }
];

export async function callProvider(env: Env, request: ProviderRequest): Promise<ProviderResponse> {
  const sortedProviders = PROVIDERS
    .filter(p => p.enabled)
    .sort((a, b) => a.priority - b.priority);

  for (const provider of sortedProviders) {
    try {
      if (provider.name === 'openrouter') {
        return await callOpenRouter(env, request);
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

async function callOpenRouter(env: Env, request: ProviderRequest): Promise<ProviderResponse> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://studybuddy.app',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages: [{ role: 'user', content: request.prompt }],
      temperature: request.temperature,
      max_tokens: request.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    provider: 'openrouter',
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
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

  const data = await response.json();
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
