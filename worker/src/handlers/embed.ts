/**
 * Embedding Generation Handler
 */

import { Hono } from 'hono';
import { Env } from '../index';
import { generateEmbedding } from '../utils/api';

export const embedHandler = new Hono<{ Bindings: Env }>();

interface EmbedRequest {
  text: string;
}

embedHandler.post('/', async (c) => {
  try {
    const body: EmbedRequest = await c.req.json();
    const { text } = body;

    if (!text) {
      return c.json({
        success: false,
        error: 'Text is required'
      }, 400);
    }

    // Generate embedding
    const embedding = await generateEmbedding(text, c.env);

    return c.json({
      success: true,
      data: {
        embedding,
        dimensions: embedding.length
      }
    });

  } catch (error: any) {
    console.error('Embedding generation error:', error);
    return c.json({
      success: false,
      error: error.message || 'Failed to generate embedding'
    }, 500);
  }
});
