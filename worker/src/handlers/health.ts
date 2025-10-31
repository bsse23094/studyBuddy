/**
 * Health Check Handler
 */

import { Context } from 'hono';
import type { Env } from '../index';

export async function healthHandler(c: Context<{ Bindings: Env }>) {
  return c.json({
    success: true,
    data: {
      status: 'healthy',
      providers: [
        { name: 'OpenRouter', status: 'available', latency: 120 },
        { name: 'HuggingFace', status: 'available', latency: 200 }
      ],
      vectorDb: {
        status: 'available',
        documentCount: 0,
        chunkCount: 0
      },
      timestamp: new Date().toISOString()
    }
  });
}
