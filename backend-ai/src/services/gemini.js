import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';

function getApiKey() {
  return process.env.GEMINI_API_KEY || '';
}

const genAI = new GoogleGenerativeAI(getApiKey());

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
  maxOutputTokens: 8192,
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

  simulation: `You are an expert at building interactive educational simulations and animated visualizations for the Computer Support Hub learning platform.

Your job: given a topic, build ONE self-contained HTML document that teaches how the thing works through an interactive animation or simulation (e.g. animated photosynthesis, water cycle, electric circuit, digestive system, Python loop, networking handshake).

Requirements:
- Output a COMPLETE HTML document (doctype, html, head, body) using only inline <style> and <script>. No external files, no CDN links, no images, no fonts, no network requests.
- Use inline SVG for the visuals (shapes, arrows, labels) and CSS animations or vanilla JavaScript for motion.
- Make it INTERACTIVE: include play/pause/restart controls, plus at least one clickable element (a button that triggers a step, a slider, or clickable parts).
- Add clear labels and short captions so a student understands each stage.
- Design it to fill a 860x520 viewport area and adapt to the container width.
- Use a light, friendly educational style with a cohesive color palette. Keep the layout clean and readable for secondary-school students.
- Keep the document COMPACT (under ~15 KB). Prioritize a few clear, labeled animated stages over elaborate features.
- The entire document must work standalone when loaded inside a sandboxed iframe (no same-origin access, no localStorage).
- Return ONLY the raw HTML document. No markdown, no code fences, no commentary.`,

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

export async function generateTopicContent(topic, level = 'secondary', resourceContext = '') {
  if (!isAvailable()) return null;

  try {
    const model = getModel();
    let prompt = `Create comprehensive learning content for the topic "${topic}" tailored to ${level} students.
- Use vocabulary, depth and examples appropriate for ${level} students.
- Keep explanations clear and well-structured for that education level.
- Questions and flashcards must match the expected difficulty of ${level}.

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

    if (resourceContext) {
      prompt += `

The school has uploaded the following curriculum resources for this subject. Use them to align the content with the curriculum, reference their topics, and avoid contradicting them:
${resourceContext}`;
    }

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

function cleanHtml(text) {
  let cleaned = (text || '').trim();
  cleaned = cleaned.replace(/^```(?:html|HTML)?\s*/g, '').replace(/```\s*$/g, '').trim();
  const docStart = cleaned.indexOf('<!DOCTYPE');
  const htmlStart = cleaned.indexOf('<html');
  const htmlEnd = cleaned.lastIndexOf('</html>');
  if (htmlEnd !== -1) {
    const from = docStart !== -1 ? docStart : htmlStart !== -1 ? htmlStart : 0;
    return cleaned.substring(from, htmlEnd + 7);
  }
  return cleaned;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const QUOTA_RE = /429|quota|rate limit|resource exhausted/i;

export async function generateSimulation(topic, level = 'beginner') {
  if (!isAvailable()) return null;

  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const model = getModel();
      const prompt = `Topic: "${topic}" (${level} level)

Build an interactive simulation or animated visualization that explains HOW this topic works, step by step.

${SYSTEM_PROMPTS.simulation}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const html = cleanHtml(response.text());

      if (html.length < 200 || !html.includes('<')) return null;
      return {
        title: `Simulation: ${topic}`,
        description: `An interactive simulation explaining how ${topic} works.`,
        html,
      };
    } catch (err) {
      lastErr = err;
      const isQuota = QUOTA_RE.test(err.message || '');
      console.error(`[Gemini] generateSimulation attempt ${attempt + 1} failed:`, err.message);
      if (attempt < 2) await sleep(isQuota ? 12000 : 2000);
    }
  }
  if (lastErr && QUOTA_RE.test(lastErr.message || '')) {
    throw new Error('AI usage limit reached for today. Please try again later.');
  }
  return null;
}

async function runWithRetry(buildPrompt, parseResponse) {
  if (!isAvailable()) return null;

  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const model = getModel();
      const result = await model.generateContent(buildPrompt());
      const response = await result.response;
      const parsed = parseResponse(response.text());
      if (parsed !== null && parsed !== undefined) return parsed;
    } catch (err) {
      lastErr = err;
      const isQuota = QUOTA_RE.test(err.message || '');
      console.error(`[Gemini] attempt ${attempt + 1} failed:`, err.message);
      if (attempt < 2) await sleep(isQuota ? 12000 : 2000);
    }
  }
  if (lastErr && QUOTA_RE.test(lastErr.message || '')) {
    throw new Error('AI usage limit reached for today. Please try again later.');
  }
  return null;
}

export async function generateCareerGuidance(input) {
  const { interests, subjects, level, goals } = input || {};
  return runWithRetry(() => {
    const prompt = `You are an AI career guidance counselor for students in Rwanda using the Computer Support Hub learning platform.

Student profile:
- Education level: ${level || 'Secondary'}
- Interests / hobbies: ${interests || 'Not specified'}
- Subjects they enjoy: ${subjects && subjects.length ? subjects.join(', ') : 'Not specified'}
- Career goals / aspirations: ${goals || 'Not specified'}

Recommend 4 realistic career pathways that fit this student's profile. For each career provide:
- title: the career name
- field: broad field (e.g. ICT, Engineering, Medicine, Business)
- description: 1-2 sentences about the role
- subjects: array of school subjects most relevant to start focusing on now
- skills: array of 3-4 key skills the student should develop
- studyPath: a brief step-by-step path from secondary school to that career in Rwanda
- opportunities: where this career can take them (local + global job outlook)
- matchScore: a number from 55 to 99 showing how well it matches the profile

Return ONLY a valid JSON object (no markdown, no code fences):
{
  "summary": "A short paragraph explaining how these careers match the student's profile.",
  "careers": [
    {
      "title": "Career Name",
      "field": "Field",
      "description": "Short description",
      "subjects": ["Subject 1", "Subject 2"],
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "studyPath": "Step-by-step path",
      "opportunities": "Job outlook",
      "matchScore": 85
    }
  ]
}`;
    return prompt;
  }, (text) => {
    const parsed = parseJson(text);
    if (parsed && Array.isArray(parsed.careers)) {
      return {
        summary: typeof parsed.summary === 'string' ? parsed.summary : '',
        careers: parsed.careers.slice(0, 4).map((c) => ({
          title: c.title || 'Career',
          field: c.field || 'General',
          description: c.description || '',
          subjects: Array.isArray(c.subjects) ? c.subjects.slice(0, 5) : [],
          skills: Array.isArray(c.skills) ? c.skills.slice(0, 4) : [],
          studyPath: c.studyPath || '',
          opportunities: c.opportunities || '',
          matchScore: typeof c.matchScore === 'number' ? Math.min(99, Math.max(55, c.matchScore)) : 75,
        })),
      };
    }
    return null;
  });
}

const TEACHER_DOC_TYPES = {
  lessonPlan: {
    label: 'Lesson Plan',
    instructions: `Create a complete lesson plan with these sections:
1. Lesson title, subject, topic, class level, duration
2. Learning objectives (measurable, using Bloom's taxonomy)
3. Teaching materials / resources needed
4. Lesson structure: Introduction / motivation (5-10 min), Development with activities and questions (main body), Conclusion / summary
5. Differentiation for slow and fast learners
6. Assessment methods and an evaluation question
7. Homework / follow-up activity
Use tables where useful. Align with the Rwandan national curriculum.`,
  },
  worksheet: {
    label: 'Worksheet',
    instructions: `Create a student worksheet with:
1. Header: subject, topic, class level, student name and date lines
2. Clear instructions for each section
3. Numbered questions of mixed types (multiple choice, short answer, fill-in-the-blank, matching, word problems)
4. Vary difficulty from easy to challenging
5. An answer key / marking notes at the end
Use tables where useful.`,
  },
  exam: {
    label: 'Exam / Test Paper',
    instructions: `Create an exam paper with:
1. Header: subject, class level, duration, total marks
2. Exam instructions for students
3. Numbered questions across multiple sections with marks per question and total marks per section
4. A marking scheme with answers and mark allocation
Use tables where useful.`,
  },
  presentation: {
    label: 'Presentation Outline',
    instructions: `Create a slide-by-slide presentation outline with:
1. Title slide details
2. One section per slide with slide title, bullet points of key content, and speaker notes
3. Suggestions for visuals or diagrams on each slide
4. A closing slide with summary and discussion questions
Use clear numbered slides.`,
  },
  markingGuide: {
    label: 'Marking Guide / Rubric',
    instructions: `Create a marking guide with:
1. Overall assessment criteria for the topic
2. A scoring rubric table with criteria, levels of performance, and point ranges
3. Common student mistakes and how to give useful feedback
4. Suggestions for assigning grades
Use tables where useful.`,
  },
};

export async function generateTeacherDoc(input) {
  const { type, subject, topic, level, count } = input || {};
  const docType = TEACHER_DOC_TYPES[type] || TEACHER_DOC_TYPES.lessonPlan;

  return runWithRetry(() => {
    const countLine = count ? `- Include approximately ${count} questions/items.` : '';
    const prompt = `You are an expert teaching assistant for secondary-school teachers in Rwanda. Create high-quality, ready-to-use teaching material.

Document type: ${docType.label}
Subject: ${subject || 'General'}
Topic: ${topic || 'General'}
Class level: ${level || 'Secondary'}
${countLine}

${docType.instructions}

Write in clear English with markdown formatting (## headings, **bold**, bullet lists, tables). Return ONLY the document content itself. No commentary, no intro, no code fences.`;
    return prompt;
  }, (text) => {
    const cleaned = (text || '').trim();
    if (cleaned.length < 50) return null;
    return cleaned;
  });
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
