# RAG Prompt Templates for StudyBuddy

This document contains production-ready prompt templates for the RAG-enabled tutoring system.

## System Prompt (Static)

```
You are TutorGPT, an educational assistant. Your goal is to teach, explain, quiz, and guide the user. ALWAYS:

1. **Use Evidence**: If you make a factual claim, cite the exact source fragment provided in CONTEXT (prefix with [source:id]).

2. **Stepwise Instruction**: For problem solving, break down solutions into clear steps with explanations.

3. **Graduated Hints**: Provide hints before full solutions unless user explicitly asks "show solution".

4. **Adapt to Level**: Adjust tone and vocabulary based on LEVEL:
   - child: Simple language, everyday examples, avoid jargon
   - highschool: Standard academic language, relatable examples
   - college: Technical precision, domain-specific terminology
   - expert: Advanced concepts, assume deep background knowledge

5. **Concise but Thorough**: For long solutions, provide a summary first, then details.

6. **Admit Uncertainty**: If CONTEXT lacks information, say "I don't know from the provided sources" and suggest how to verify.

7. **Never Hallucinate**: Do not invent facts, sources, or citations. Only use information from CONTEXT.
```

---

## Context Block Template (Runtime)

This block is dynamically built from top-K vector search results:

```
[CONTEXT-START]
#1 [source:{{doc1.id}} | page:{{doc1.page}} | score:{{doc1.score}}]
{{doc1.snippet}}

#2 [source:{{doc2.id}} | page:{{doc2.page}} | score:{{doc2.score}}]
{{doc2.snippet}}

#3 [source:{{doc3.id}} | page:{{doc3.page}} | score:{{doc3.score}}]
{{doc3.snippet}}

... (continue for K results, typically K=5)

[CONTEXT-END]
```

**Token Budget Management**:
- Each chunk: ~200-500 tokens
- Total context: ~1000-2500 tokens for K=5
- Adjust K dynamically based on query complexity

---

## User Prompt Wrapper

### Template Structure
```
User Level: {{LEVEL}}
Mode: {{MODE}}
Conversation History:
{{HISTORY}}

User Query: {{USER_QUERY}}

Instruction: {{MODE_SPECIFIC_INSTRUCTION}}
```

### Mode-Specific Instructions

#### **Explain Mode**
```
Instruction: Answer the User Query using information from CONTEXT. 
- Provide a clear, well-structured explanation appropriate for {{LEVEL}} level.
- Use analogies and examples to clarify complex concepts.
- Cite sources inline as [source:ID] for all factual claims.
- If multiple perspectives exist, present them objectively.
```

#### **Solve Mode**
```
Instruction: Solve the problem in the User Query using CONTEXT if relevant.
- First, provide a 1-2 sentence plan outlining your approach.
- Then, show a step-by-step solution with clear numbering.
- After each step, explain the reasoning and any formulas/concepts used.
- Cite sources [source:ID] when using facts or methods from CONTEXT.
- End with a final answer summary.
```

#### **Hint Mode**
```
Instruction: Provide a hint for the User Query without giving away the full solution.
- Offer a gentle nudge in the right direction.
- Ask a guiding question or point to a relevant concept.
- Do not solve the problem completely.
- Cite [source:ID] if referencing material from CONTEXT.
```

#### **Quiz Mode**
```
Instruction: Generate {{N}} quiz questions based on User Query and CONTEXT.
- Create multiple-choice questions with 4 options (A, B, C, D).
- Mark the correct answer clearly.
- Provide a brief explanation for the correct answer.
- Cite sources [source:ID] for factual questions.
- Vary difficulty appropriately for {{LEVEL}} level.

Format each question as:
Q1: [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct: [Letter]
Explanation: [Brief explanation with source citation]
```

---

## Example Prompts by Mode

### Example 1: Explain Mode (High School, Physics)

**System Prompt**: [Standard TutorGPT prompt]

**Context**:
```
[CONTEXT-START]
#1 [source:physics_textbook_ch3 | page:42 | score:0.89]
Newton's Second Law states that the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. Mathematically: F = ma, where F is force in Newtons, m is mass in kg, and a is acceleration in m/s².

#2 [source:physics_textbook_ch3 | page:43 | score:0.85]
When multiple forces act on an object, the net force is the vector sum of all forces. If forces are balanced (net force = 0), the object remains at constant velocity or at rest (Newton's First Law).
[CONTEXT-END]
```

**User Prompt**:
```
User Level: highschool
Mode: explain
User Query: Explain Newton's Second Law and how it relates to force and acceleration.

Instruction: Answer the User Query using information from CONTEXT. Provide a clear explanation appropriate for highschool level. Use analogies and examples. Cite sources inline as [source:ID] for all factual claims.
```

---

### Example 2: Solve Mode (College, Calculus)

**Context**:
```
[CONTEXT-START]
#1 [source:calc_notes_integration | page:12 | score:0.92]
Integration by parts formula: ∫u dv = uv - ∫v du. Choose u as the function that simplifies when differentiated, and dv as the function easy to integrate.

#2 [source:calc_notes_integration | page:13 | score:0.88]
For integrals involving x^n * trig(x), set u = x^n and dv = trig(x)dx. This reduces the polynomial degree with each application.
[CONTEXT-END]
```

**User Prompt**:
```
User Level: college
Mode: solve
User Query: Solve ∫ x² sin(x) dx using integration by parts.

Instruction: Solve the problem in the User Query using CONTEXT.
- First, provide a 1-2 sentence plan.
- Then, show step-by-step solution.
- After each step, explain reasoning.
- Cite sources [source:ID] when using methods from CONTEXT.
- End with final answer summary.
```

---

### Example 3: Hint Mode (High School, Chemistry)

**User Prompt**:
```
User Level: highschool
Mode: hint
User Query: I'm stuck on balancing this equation: C₃H₈ + O₂ → CO₂ + H₂O

Instruction: Provide a hint without giving away the full solution. Offer a gentle nudge. Do not solve completely.
```

**Expected Response**:
```
Here's a hint to get you started:

When balancing combustion reactions, try this order:
1. Balance carbon (C) atoms first
2. Then hydrogen (H) atoms
3. Finally, balance oxygen (O) atoms last

Start by looking at how many carbon atoms are in C₃H₈. How many CO₂ molecules would you need to balance them?

Try this first step and let me know what you get!
```

---

### Example 4: Quiz Mode

**Context**:
```
[CONTEXT-START]
#1 [source:bio_notes_cells | page:5 | score:0.91]
Mitochondria are the powerhouses of the cell, producing ATP through cellular respiration. They have a double membrane structure and contain their own DNA.

#2 [source:bio_notes_cells | page:6 | score:0.87]
The nucleus contains the cell's genetic material (DNA) and controls cell activities. It is surrounded by a nuclear envelope with pores for molecular transport.
[CONTEXT-END]
```

**User Prompt**:
```
User Level: highschool
Mode: quiz
User Query: Generate 3 questions about cell organelles

Instruction: Generate 3 quiz questions based on User Query and CONTEXT. Create multiple-choice with 4 options. Mark correct answer. Provide brief explanation with source citation.
```

**Expected Response**:
```
Q1: What is the primary function of mitochondria?
A) Protein synthesis
B) ATP production through cellular respiration
C) DNA storage
D) Waste removal
Correct: B
Explanation: Mitochondria are known as the powerhouses of the cell because they produce ATP through cellular respiration [source:bio_notes_cells].

Q2: Which organelle contains the cell's genetic material?
A) Mitochondria
B) Ribosome
C) Nucleus
D) Golgi apparatus
Correct: C
Explanation: The nucleus contains the cell's DNA and controls cell activities [source:bio_notes_cells].

Q3: What unique feature do mitochondria have that other organelles lack?
A) Double membrane
B) Own DNA
C) Ability to divide
D) All of the above
Correct: D
Explanation: Mitochondria have a double membrane structure, contain their own DNA, and can divide independently [source:bio_notes_cells].
```

---

## Temperature Settings by Mode

| Mode     | Temperature | Reasoning                                    |
|----------|-------------|----------------------------------------------|
| Explain  | 0.3 - 0.6   | Balance accuracy with engaging explanations  |
| Solve    | 0.0 - 0.2   | Maximum precision for step-by-step solutions |
| Hint     | 0.4 - 0.7   | Creative but still on-topic hints            |
| Quiz     | 0.2 - 0.4   | Varied questions but factually accurate      |

---

## Safety & Hallucination Mitigation

### Detection Rules

1. **Source Citation Check**: Every factual claim must have `[source:ID]` tag.
2. **Context Boundary**: LLM should never reference information not in CONTEXT.
3. **Confidence Scoring**: Flag responses with < 0.7 retrieval score as "low confidence".

### Response Validation

```typescript
function validateResponse(response: string, context: DocChunk[]): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Check for source citations
  const citationMatches = response.match(/\[source:([^\]]+)\]/g);
  if (!citationMatches && context.length > 0) {
    warnings.push("Response lacks source citations despite available context");
  }
  
  // Check cited sources exist
  if (citationMatches) {
    const sourceIds = context.map(c => c.id);
    for (const citation of citationMatches) {
      const id = citation.match(/\[source:([^\]]+)\]/)?.[1];
      if (id && !sourceIds.includes(id)) {
        warnings.push(`Invalid source citation: ${id}`);
      }
    }
  }
  
  // Flag definitive statements without context
  const definitivePatterns = [
    /^(The answer is|It is definitely|Always|Never)/i,
    /\b(fact|proven|scientifically|undoubtedly)\b/i
  ];
  
  if (context.length === 0) {
    for (const pattern of definitivePatterns) {
      if (pattern.test(response)) {
        warnings.push("Definitive statement without source context");
        break;
      }
    }
  }
  
  return {
    valid: warnings.length === 0,
    warnings
  };
}
```

---

## Prompt Optimization Tips

1. **Keep System Prompt Stable**: Don't modify frequently; cache it.
2. **Chunk Size**: 300-500 tokens per chunk for best retrieval.
3. **Top-K Selection**: K=3 for simple queries, K=7 for complex multi-faceted questions.
4. **History Truncation**: Keep last 3-5 exchanges maximum to save tokens.
5. **Streaming**: Break long responses into chunks with source references at boundaries.

---

## Token Budget Calculator

```typescript
function calculateTokenBudget(options: {
  maxTokens: number;
  mode: string;
  level: string;
}): {
  systemPrompt: number;
  context: number;
  userPrompt: number;
  completion: number;
} {
  const SYSTEM_PROMPT_TOKENS = 200;
  const USER_WRAPPER_TOKENS = 100;
  const COMPLETION_BUFFER = options.mode === 'solve' ? 800 : 400;
  
  const availableForContext = options.maxTokens - 
    SYSTEM_PROMPT_TOKENS - 
    USER_WRAPPER_TOKENS - 
    COMPLETION_BUFFER;
  
  return {
    systemPrompt: SYSTEM_PROMPT_TOKENS,
    context: Math.max(500, availableForContext),
    userPrompt: USER_WRAPPER_TOKENS,
    completion: COMPLETION_BUFFER
  };
}
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-31  
**Maintained by**: StudyBuddy Team
