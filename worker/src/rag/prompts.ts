/**
 * RAG Prompt Builder
 */

export interface PromptContext {
  systemPrompt: string;
  context: Array<{ id: string; text: string; page?: number; score?: number }>;
  userQuery: string;
  level: string;
  mode: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export function buildPrompt(ctx: PromptContext): string {
  let prompt = `${ctx.systemPrompt}\n\n`;

  // Add context if available
  if (ctx.context.length > 0) {
    prompt += `[CONTEXT-START]\n`;
    ctx.context.forEach((doc, idx) => {
      prompt += `#${idx + 1} [source:${doc.id}`;
      if (doc.page) prompt += ` | page:${doc.page}`;
      if (doc.score) prompt += ` | score:${doc.score.toFixed(3)}`;
      prompt += `]\n${doc.text}\n\n`;
    });
    prompt += `[CONTEXT-END]\n\n`;
  }

  // Add conversation history
  if (ctx.conversationHistory && ctx.conversationHistory.length > 0) {
    prompt += `Previous conversation:\n`;
    ctx.conversationHistory.slice(-5).forEach(msg => {
      prompt += `${msg.role}: ${msg.content}\n`;
    });
    prompt += `\n`;
  }

  // Add user query with instructions
  prompt += `User Level: ${ctx.level}\n`;
  prompt += `Mode: ${ctx.mode}\n`;
  prompt += `User query: ${ctx.userQuery}\n\n`;
  prompt += `Instruction: Answer the User Query using CONTEXT. `;
  
  if (ctx.mode === 'solve') {
    prompt += `First produce a 1-2 sentence plan, then show step-by-step solution. Provide a brief explanation after each step. `;
  } else if (ctx.mode === 'quiz') {
    prompt += `Generate multiple-choice questions with 4 options each and mark correct answers. `;
  } else if (ctx.mode === 'hint') {
    prompt += `Provide a gentle hint without giving away the full solution. `;
  }
  
  prompt += `Do not invent sources; if solution uses content from CONTEXT, cite it inline as [source:ID].`;

  return prompt;
}
