import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MODEL = 'gemini-flash-latest';
const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
];

const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 4096,
};

function getModel() {
  return genAI.getGenerativeModel({ model: MODEL, safetySettings: SAFETY_SETTINGS, generationConfig: GENERATION_CONFIG });
}

function isAvailable() {
  return !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10;
}

function cleanJson(text) {
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }
  const arrStart = cleaned.indexOf('[');
  const arrEnd = cleaned.lastIndexOf(']');
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart && (start === -1)) {
    cleaned = cleaned.substring(arrStart, arrEnd + 1);
  }
  return cleaned;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = cleanJson(text);
    try {
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  }
}

const SYSTEM_PROMPTS = {
  tutor: `You are an expert AI tutor for the Computer Support Hub learning platform. You help students from primary school to university level.

Subjects you teach: Mathematics, Physics, Chemistry, Biology, Computer Science, English, Kinyarwanda, French, Geography, History.

Guidelines:
- Respond in clear, simple language appropriate for the student's level
- Provide step-by-step explanations with examples
- Use analogies and real-world applications
- Encourage critical thinking with follow-up questions
- Be patient, supportive, and positive
- If asked in Kinyarwanda or French, respond in the same language
- Keep answers focused and educational
- Suggest practice exercises when relevant
- Maximum 500 words per response unless the student asks for more detail`,

  quiz: `You are an AI quiz generator for the Computer Support Hub learning platform. Create educational multiple-choice quiz questions.

Guidelines:
- Each question must have exactly 4 options
- One correct answer with the correctIndex (0-3)
- Include a brief explanation for the correct answer
- Questions should test understanding, not just memorization
- Difficulty should match the specified level
- Return ONLY valid JSON array, no markdown, no code fences`,

  topic: `You are an AI educational content creator for the Computer Support Hub learning platform. Generate comprehensive learning content for any topic.

Guidelines:
- Create structured lesson content with summary and sections
- Include a summary paragraph
- Create 3-4 sections with heading and detailed content
- Generate 3 quiz questions (multiple choice, 4 options each)
- Generate 3 flashcards (front/back pairs)
- Suggest a relevant image prompt for visualization
- Return ONLY valid JSON matching the specified structure`,

  resource: `You are an AI study assistant. Given a learning resource, help students understand it better by answering questions, generating quizzes, flashcards, and summaries based on the content.

Guidelines:
- Base all responses strictly on the provided content
- When asked questions, reference specific parts of the material
- Generate accurate, relevant study materials
- Be concise and educational`,
};

export async function tutorChat(messages, subject = null) {
  if (!isAvailable()) return null;

  try {
    const model = getModel();
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPTS.tutor }] },
        { role: 'model', parts: [{ text: 'Understood. I am ready to tutor students as an AI assistant for the Computer Support Hub.' }] },
      ],
      systemInstruction: { role: 'user', parts: [{ text: SYSTEM_PROMPTS.tutor }] },
    });

    const contextPrefix = subject ? `[Subject: ${subject}]\n` : '';
    const result = await chat.sendMessage(contextPrefix + messages.map(m =>
      `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`
    ).join('\n'));

    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('[Gemini] tutorChat error:', err.message);
    return null;
  }
}

export async function generateQuizQuestions(subject, topic, count = 5, level = 'secondary') {
  if (!isAvailable()) return null;

  try {
    const model = getModel();
    const prompt = `Generate ${count} multiple-choice quiz questions for ${subject}${topic ? ` on the topic "${topic}"` : ''} at ${level} level.

Return ONLY a valid JSON array of objects with this structure:
[
  {
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this is correct."
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJson(text);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, count).map((q, i) => ({
        text: q.text || `Question ${i + 1}`,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        explanation: q.explanation || 'Review the material for the correct answer.',
      }));
    }
    return null;
  } catch (err) {
    console.error('[Gemini] generateQuizQuestions error:', err.message);
    return null;
  }
}

export async function generateTopicContent(topic, level = 'beginner') {
  if (!isAvailable()) return null;

  try {
    const model = getModel();
    const prompt = `Create comprehensive learning content for the topic "${topic}" at ${level} level.

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "summary": "A paragraph summarizing the topic",
  "sections": [
    { "heading": "Section Title", "content": "Detailed section content explaining key concepts" }
  ],
  "quiz": [
    { "question": "Question?", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "Explanation" }
  ],
  "flashcards": [
    { "front": "Question or term", "back": "Answer or definition" }
  ],
  "imagePrompt": "A text description for generating an AI image about this topic"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJson(text);

    if (parsed && parsed.summary) {
      return {
        summary: parsed.summary || `Study material for ${topic}.`,
        sections: Array.isArray(parsed.sections) ? parsed.sections.slice(0, 4) : [{ heading: 'Overview', content: parsed.summary || `Content about ${topic}.` }],
        quiz: Array.isArray(parsed.quiz) ? parsed.quiz.slice(0, 5).map((q) => ({
          question: q.question || q.text || 'Sample question?',
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          explanation: q.explanation || 'Review the material.',
        })) : [],
        flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards.slice(0, 5).map((f) => ({
          front: f.front || 'Term',
          back: f.back || 'Definition',
        })) : [],
        imagePrompt: parsed.imagePrompt || `Educational visualization of ${topic}`,
      };
    }
    return null;
  } catch (err) {
    console.error('[Gemini] generateTopicContent error:', err.message);
    return null;
  }
}

export async function generateResourceQuiz(content, title, subject, count = 5) {
  if (!isAvailable()) return null;

  try {
    const model = getModel();
    const prompt = `Based on this educational content about "${title}" (${subject}), generate ${count} multiple-choice quiz questions.

Content: "${content.substring(0, 3000)}"

Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "text": "Question?",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "Why this is correct based on the content."
  }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJson(text);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, count).map((q, i) => ({
        text: q.text || `Question ${i + 1}`,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        explanation: q.explanation || 'Based on the resource content.',
      }));
    }
    return null;
  } catch (err) {
    console.error('[Gemini] generateResourceQuiz error:', err.message);
    return null;
  }
}

export async function generateResourceFlashcards(content, title, subject) {
  if (!isAvailable()) return null;

  try {
    const model = getModel();
    const prompt = `Based on this educational content about "${title}" (${subject}), generate 5-6 flashcards for study.

Content: "${content.substring(0, 3000)}"

Return ONLY a valid JSON array of objects with this structure:
[
  { "front": "Question or term", "back": "Answer or definition" }
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJson(text);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 6).map((f) => ({
        front: f.front || 'Term',
        back: f.back || 'Definition',
      }));
    }
    return null;
  } catch (err) {
    console.error('[Gemini] generateResourceFlashcards error:', err.message);
    return null;
  }
}

export async function generateResourceSummary(content, title) {
  if (!isAvailable()) return null;

  try {
    const model = getModel();
    const prompt = `Summarize this educational content in a clear, structured way.

Title: "${title}"

Content: "${content.substring(0, 3000)}"

Return ONLY a valid JSON object with this structure:
{
  "title": "Summary: ${title}",
  "overview": "A 2-3 sentence overview of the material",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJson(text);

    if (parsed && parsed.overview) {
      return {
        title: parsed.title || `Summary: ${title}`,
        overview: parsed.overview,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.slice(0, 5) : ['Review the material for key points.'],
      };
    }
    return null;
  } catch (err) {
    console.error('[Gemini] generateResourceSummary error:', err.message);
    return null;
  }
}

export async function chatAboutResourceContent(message, content, title, subject) {
  if (!isAvailable()) return null;

  try {
    const model = getModel();
    const prompt = `You are an AI study assistant helping a student with "${title}" (${subject}).

Resource content: "${content.substring(0, 3000)}"

Student question: "${message}"

Answer the student's question based ONLY on the provided content. If the content doesn't contain relevant information, say so and offer general guidance. Be concise and educational.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('[Gemini] chatAboutResourceContent error:', err.message);
    return null;
  }
}

export { isAvailable };
