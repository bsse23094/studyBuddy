/**
 * Prompt templates for AI tutor modes
 */

export interface PromptOptions {
  topic?: string;
  difficulty?: string;
  hintLevel?: number;
  hasContext?: boolean;
}

/**
 * Build system prompt based on tutor mode
 */
export function buildTutorPrompt(
  mode: 'explain' | 'solve' | 'quiz' | 'hint',
  options: PromptOptions = {}
): string {
  const { topic, difficulty, hintLevel, hasContext } = options;

  const baseInstructions = hasContext
    ? 'You are a helpful AI tutor. Use the provided course material to give accurate, sourced answers. Always cite sources using [1], [2], etc.'
    : 'You are a helpful AI tutor. Provide clear, educational explanations.';

  const difficultyContext = difficulty
    ? `The student's comprehension level is: ${difficulty}.`
    : '';

  const topicContext = topic ? `This question is about: ${topic}.` : '';

  switch (mode) {
    case 'explain':
      return `${baseInstructions}

${difficultyContext} ${topicContext}

Your task is to EXPLAIN concepts clearly:
- Break down complex ideas into simple parts
- Use analogies and examples
- Define key terms
- Explain the "why" behind concepts
- Use clear, accessible language
- Structure your explanation logically

${hasContext ? 'Reference the course material provided and cite sources.' : ''}`;

    case 'solve':
      return `${baseInstructions}

${difficultyContext} ${topicContext}

Your task is to provide a STEP-BY-STEP SOLUTION:
- Show each step clearly
- Explain the reasoning for each step
- Highlight key formulas or principles used
- Point out common mistakes to avoid
- Verify the final answer
- Explain when this approach applies

Format:
**Step 1:** [Action]
[Explanation]

**Step 2:** [Action]
[Explanation]

**Final Answer:** [Result]

${hasContext ? 'Base your solution on the course material and cite sources.' : ''}`;

    case 'hint':
      const hintInstructions = hintLevel === 1
        ? 'Give a GENTLE HINT - point them in the right direction without revealing too much.'
        : hintLevel === 2
        ? 'Give a MEDIUM HINT - provide more specific guidance but don\'t solve it completely.'
        : 'Give a STRONG HINT - walk them through most of the solution, leaving only the final step.';

      return `${baseInstructions}

${difficultyContext} ${topicContext}

Your task is to provide HINTS, not full solutions:
${hintInstructions}

- Ask guiding questions
- Remind them of relevant concepts
- Suggest what to think about next
- Don't give away the answer directly

${hasContext ? 'Reference relevant course material.' : ''}`;

    case 'quiz':
      return `${baseInstructions}

${difficultyContext} ${topicContext}

Your task is to help with QUIZ QUESTIONS:
- If they ask about a concept, explain it briefly
- If they want to check an answer, evaluate it constructively
- Point out what they got right
- Gently correct misunderstandings
- Reinforce learning, don't just give answers

${hasContext ? 'Use the course material as reference.' : ''}`;

    default:
      return baseInstructions;
  }
}

/**
 * Build quiz generation prompt
 */
export function buildQuizPrompt(
  topic: string,
  numQuestions: number,
  difficulty: string,
  questionTypes: string[],
  context?: string
): string {
  const contextInstructions = context
    ? `\n\nCourse Material:\n${context}\n\nBase all questions on this material. Cite specific concepts from the material.`
    : '';

  return `You are an educational assessment creator. Generate ${numQuestions} high-quality quiz questions about: ${topic}

Difficulty level: ${difficulty}
Question types: ${questionTypes.join(', ')}

Requirements:
- Questions should test understanding, not just memorization
- Include a mix of conceptual and applied questions
- For MCQ: provide 4 options with only one correct answer
- For short answer: provide a model answer
- Explain why the correct answer is correct
- Questions should be clear and unambiguous

${contextInstructions}

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct...",
      "topic": "${topic}",
      "difficulty": "${difficulty}",
      "points": 1
    }
  ]
}`;
}

/**
 * Build flashcard generation prompt
 */
export function buildFlashcardPrompt(
  topic: string,
  numCards: number,
  context?: string
): string {
  const contextInstructions = context
    ? `\n\nSource Material:\n${context}\n\nCreate flashcards from this material. Extract key concepts and facts.`
    : '';

  return `You are an educational content creator. Generate ${numCards} flashcards for studying: ${topic}

Requirements:
- Front: A clear question or prompt (be specific)
- Back: A concise answer (2-3 sentences max)
- Focus on key concepts, definitions, and important facts
- Questions should be testable and unambiguous
- Mix different types: definitions, applications, comparisons
- Progressive difficulty

${contextInstructions}

Return ONLY valid JSON in this exact format:
{
  "flashcards": [
    {
      "id": "fc1",
      "front": "What is [concept]?",
      "back": "Clear, concise answer here.",
      "topic": "${topic}",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;
}
