/**
 * Chat Handler - RAG-enabled conversational endpoint
 */

import { Context } from 'hono';
import type { Env } from '../index';
import { buildPrompt } from '../rag/prompts';
import { searchDocuments } from '../rag/vector-search';
import { callProvider } from '../providers/adapter';

export async function chatHandler(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json();
    const { conversationId, messages, options } = body;

    // Extract user query
    const userMessage = messages[messages.length - 1];
    
    // Vector search for relevant context
    const searchResults = await searchDocuments(
      c.env,
      userMessage.content,
      options.topK || 5
    );

    // Build RAG prompt
    const prompt = buildPrompt({
      systemPrompt: getSystemPrompt(),
      context: searchResults,
      userQuery: userMessage.content,
      level: options.level,
      mode: options.mode,
      conversationHistory: messages.slice(0, -1)
    });

    // Call AI provider with fallback
    const response = await callProvider(c.env, {
      prompt,
      temperature: options.temperature || c.env.DEFAULT_TEMPERATURE,
      maxTokens: options.maxTokens || c.env.MAX_TOKENS,
      stream: options.stream || false
    });

    return c.json({
      success: true,
      data: {
        conversationId: conversationId || generateId(),
        message: {
          id: generateId(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
          meta: {
            mode: options.mode,
            level: options.level,
            sourceRefs: searchResults.map(r => ({
              id: r.id,
              docId: r.docId,
              snippet: r.text.substring(0, 200),
              page: r.page,
              score: r.score
            }))
          }
        },
        sources: searchResults,
        usage: response.usage
      },
      meta: {
        timestamp: new Date().toISOString(),
        provider: response.provider,
        tokensUsed: response.usage.totalTokens
      }
    });

  } catch (error: unknown) {
    console.error('Chat handler error:', error);
    return c.json({
      success: false,
      error: {
        code: 'CHAT_ERROR',
        message: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, 500);
  }
}

function getSystemPrompt(): string {
  return `You are TutorGPT, an educational assistant. Your goal is to teach, explain, quiz, and guide the user. ALWAYS:
- Use evidence: if you make a factual claim, cite the exact source fragment provided in CONTEXT (prefix with [source:id]).
- Prefer stepwise instruction for problem solving.
- Provide hints before full solutions unless user asks "show solution".
- Adjust tone and vocabulary based on LEVEL (child | highschool | college | expert).
- Keep answers concise but thorough; when giving long solutions provide a short summary first.
- If the context lacks the information asked, say "I don't know from the provided sources" and offer a way to verify or search.`;
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
