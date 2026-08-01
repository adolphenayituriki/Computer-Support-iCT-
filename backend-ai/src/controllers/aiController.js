import AIProfile from '../models/AIProfile.js';
import Quiz from '../models/Quiz.js';
import LearningSession from '../models/LearningSession.js';
import LearningProgress from '../models/LearningProgress.js';
import TopicSession from '../models/TopicSession.js';
import Notification from '../models/Notification.js';
import Resource from '../models/Resource.js';
import * as gemini from '../services/gemini.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOAD_DIR = join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Kinyarwanda', 'French', 'Geography', 'History'];

export { SUBJECTS };

function detectSubjectFromText(text) {
  const lower = (text || '').toLowerCase();
  if (/\b(math|algebra|geometry|calculus|trigonometry|equation|fraction|percent|probability|statistics)\b/.test(lower)) return 'Mathematics';
  if (/\b(physics|force|energy|velocity|acceleration|newton|electromagnetic|quantum|thermodynamics)\b/.test(lower)) return 'Physics';
  if (/\b(chemistry|atom|molecule|element|compound|reaction|acid|base|bond|periodic table|organic)\b/.test(lower)) return 'Chemistry';
  if (/\b(biology|cell|dna|rna|gene|protein|organism|ecosystem|evolution|photosynthesis|anatomy)\b/.test(lower)) return 'Biology';
  if (/\b(computer|programming|algorithm|software|database|network|html|python|javascript|machine learning|artificial intelligence)\b/.test(lower)) return 'Computer Science';
  if (/\b(grammar|noun|verb|adjective|essay|literature|poetry|novel|reading comprehension|writing)\b/.test(lower)) return 'English';
  if (/\b(geography|continent|country|climate|ocean|river|mountain|population|map|latitude|longitude)\b/.test(lower)) return 'Geography';
  if (/\b(history|civilization|empire|war|revolution|colonial|ancient|medieval|modern history)\b/.test(lower)) return 'History';
  return 'General';
}

function extractTextFromContent(content, maxLen = 8000) {
  if (!content) return '';
  const cleaned = content.replace(/\s+/g, ' ').trim();
  return cleaned.length > maxLen ? cleaned.substring(0, maxLen) : cleaned;
}

async function findRelevantResources(query, subject, limit = 3) {
  const filter = { status: 'ready', content: { $ne: '' } };
  if (subject && subject !== 'general') filter.subject = subject;
  const resources = await Resource.find(filter).sort({ createdAt: -1 }).limit(20);
  if (resources.length === 0) return [];
  const lower = (query || '').toLowerCase();
  const scored = resources.map((r) => {
    const contentLower = (r.content || '').toLowerCase();
    const titleLower = (r.title || '').toLowerCase();
    let score = 0;
    const words = lower.split(/\s+/).filter((w) => w.length > 2);
    for (const w of words) {
      if (titleLower.includes(w)) score += 3;
      const regex = new RegExp(w, 'gi');
      const matches = contentLower.match(regex);
      if (matches) score += matches.length;
    }
    return { resource: r, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((s) => s.resource);
}

function generatePlaceholderImage(title) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'>
    <defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' style='stop-color:#6366F1'/><stop offset='100%' style='stop-color:#818CF8'/>
    </linearGradient></defs>
    <rect width='800' height='500' fill='url(%23g)' rx='12'/>
    <text x='400' y='230' font-family='Arial,sans-serif' font-size='28' fill='white' text-anchor='middle' font-weight='bold'>${title.substring(0, 40)}</text>
    <text x='400' y='280' font-family='Arial,sans-serif' font-size='16' fill='rgba(255,255,255,0.7)' text-anchor='middle'>AI Generated Learning Content</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function generateImageUrl(prompt, title) {
  const text = (prompt || `Educational visualization of ${title}`).replace(/["\\]/g, ' ').trim().substring(0, 300);
  if (!text) return generatePlaceholderImage(title);
  const seed = Math.floor(Math.random() * 100000);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=800&height=500&nologo=true&seed=${seed}`;
}

export async function getProfile(req, res) {
  try {
    let profile = await AIProfile.findOne({ userId: req.user.id });
    if (!profile) {
      profile = await AIProfile.create({ userId: req.user.id });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { level, grade, subjects, language, dailyGoalMinutes } = req.body;
    const profile = await AIProfile.findOneAndUpdate(
      { userId: req.user.id },
      { level, grade, subjects, language, dailyGoalMinutes },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function tutorChat(req, res) {
  try {
    const { message, sessionId, subject: reqSubject } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    let session;
    if (sessionId) {
      session = await LearningSession.findById(sessionId);
    }

    const historyMessages = session ? session.messages.slice(-10) : [];
    const subject = reqSubject || 'general';

    const reply = await gemini.tutorChat(
      [...historyMessages, { role: 'user', content: message }],
      subject
    );

    if (!reply) {
      return res.status(503).json({ error: 'AI service is currently unavailable. Please try again later.' });
    }

    const relevantResources = await findRelevantResources(message, subject, 2);
    let finalReply = reply;
    if (relevantResources.length > 0) {
      const resourceRefs = relevantResources.map((r) => `"${r.title}" (${r.subject})`).join(', ');
      finalReply += `\n\n📚 Related resources you can study: ${resourceRefs}`;
    }

    if (!session) {
      session = await LearningSession.create({
        userId: req.user.id,
        subject,
        messages: [
          { role: 'user', content: message },
          { role: 'assistant', content: finalReply },
        ],
        totalMessages: 2,
      });
    } else {
      session.messages.push({ role: 'user', content: message });
      session.messages.push({ role: 'assistant', content: finalReply });
      session.totalMessages = session.messages.length;
      await session.save();
    }

    const progress = await LearningProgress.findOneAndUpdate(
      { userId: req.user.id, subject },
      { $inc: { completedLessons: 1, totalStudyMinutes: 2 }, lastStudied: new Date() },
      { new: true, upsert: true }
    );

    res.json({ reply: finalReply, sessionId: session._id, subject, progress, resourcesReferenced: relevantResources.length, aiProvider: 'gemini' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function generateQuiz(req, res) {
  try {
    const { subject, topic, level, count = 5 } = req.body;
    if (!subject) return res.status(400).json({ error: 'Subject is required.' });

    const questions = await gemini.generateQuizQuestions(subject, topic || '', count, level || 'secondary');
    if (!questions) {
      return res.status(503).json({ error: 'AI quiz generation is currently unavailable. Please try again later.' });
    }

    const quiz = await Quiz.create({
      userId: req.user.id,
      subject,
      level: level || 'secondary',
      questions,
      totalQuestions: questions.length,
    });

    const safeQuestions = quiz.questions.map((q) => ({
      text: q.text,
      options: q.options,
    }));

    res.json({ quizId: quiz._id, questions: safeQuestions, subject, totalQuestions: quiz.totalQuestions, aiGenerated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function submitQuiz(req, res) {
  try {
    const { quizId, answers, timeTaken } = req.body;
    if (!quizId || !answers) return res.status(400).json({ error: 'Quiz ID and answers are required.' });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    if (quiz.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your quiz.' });

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score++;
    });

    quiz.score = score;
    quiz.answers = answers;
    quiz.completed = true;
    quiz.timeTaken = timeTaken || 0;
    await quiz.save();

    const progress = await LearningProgress.findOneAndUpdate(
      { userId: req.user.id, subject: quiz.subject },
      {
        $inc: { totalQuizzes: 1 },
        lastStudied: new Date(),
      },
      { new: true, upsert: true }
    );

    const allQuizzes = await Quiz.find({ userId: req.user.id, subject: quiz.subject, completed: true });
    const avgScore = allQuizzes.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) / allQuizzes.length;
    progress.averageScore = Math.round(avgScore);
    await progress.save();

    const profile = await AIProfile.findOne({ userId: req.user.id });
    if (profile) {
      const pointsEarned = score * 10;
      profile.totalPoints += pointsEarned;
      const today = new Date().toDateString();
      const lastActive = profile.lastActiveDate ? profile.lastActiveDate.toDateString() : '';
      if (lastActive !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (lastActive === yesterday) {
          profile.streak += 1;
        } else if (lastActive !== today) {
          profile.streak = 1;
        }
        profile.lastActiveDate = new Date();
      }
      await profile.save();
    }

    const results = quiz.questions.map((q, i) => ({
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      userAnswer: answers[i],
      correct: answers[i] === q.correctIndex,
    }));

    res.json({ score, total: quiz.totalQuestions, percentage: Math.round((score / quiz.totalQuestions) * 100), results, timeTaken: timeTaken || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getQuizById(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found.' });
    if (quiz.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your quiz.' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getQuizHistory(req, res) {
  try {
    const quizzes = await Quiz.find({ userId: req.user.id, completed: true }).sort({ createdAt: -1 }).limit(20);
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProgress(req, res) {
  try {
    const progress = await LearningProgress.find({ userId: req.user.id });
    const profile = await AIProfile.findOne({ userId: req.user.id }) || await AIProfile.create({ userId: req.user.id });
    const sessions = await LearningSession.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(5);

    const totalQuizzes = progress.reduce((sum, p) => sum + p.totalQuizzes, 0);
    const totalStudyMinutes = progress.reduce((sum, p) => sum + p.totalStudyMinutes, 0);
    const avgScore = progress.length > 0 ? Math.round(progress.reduce((sum, p) => sum + p.averageScore, 0) / progress.length) : 0;

    res.json({
      profile: {
        streak: profile.streak,
        totalPoints: profile.totalPoints,
        badges: profile.badges,
      },
      subjects: progress,
      summary: { totalQuizzes, totalStudyMinutes, avgScore, totalSubjects: progress.length },
      recentSessions: sessions.map((s) => ({ subject: s.subject, messages: s.totalMessages, date: s.createdAt })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSessions(req, res) {
  try {
    const sessions = await LearningSession.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(10);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSession(req, res) {
  try {
    const session = await LearningSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    if (session.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not your session.' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function processTopic(req, res) {
  try {
    const { title, level, useResources } = req.body;
    if (!title || title.trim().length < 2) return res.status(400).json({ error: 'Please enter a topic (at least 2 characters).' });

    const VALID_LEVELS = ['Primary', 'O-Level', 'A-Level', 'TVET', 'University', 'beginner', 'intermediate', 'advanced'];
    const safeLevel = VALID_LEVELS.includes(level) ? level : 'O-Level';

    let resourceContext = '';
    if (useResources) {
      try {
        const resources = await Resource.find({ status: 'ready' })
          .select('title subject type description')
          .sort({ createdAt: -1 })
          .limit(20);
        if (resources.length > 0) {
          resourceContext = resources
            .map((r) => `- ${r.title} (${r.subject || 'General'}, ${r.type})${r.description ? `: ${r.description}` : ''}`)
            .join('\n');
        }
      } catch (err) {
        console.error('[processTopic] resource context error:', err.message);
      }
    }

    const geminiContent = await gemini.generateTopicContent(title, safeLevel, resourceContext);
    if (!geminiContent) {
      return res.status(503).json({ error: 'AI content generation is currently unavailable. Please try again later.' });
    }

    const imageUrl = generateImageUrl(geminiContent.imagePrompt, title);
    const lesson = { summary: geminiContent.summary, sections: geminiContent.sections };
    const quizData = geminiContent.quiz.map((q) => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    }));
    const flashcardData = geminiContent.flashcards.map((f) => ({
      front: f.front,
      back: f.back,
    }));
    const imagePrompt = geminiContent.imagePrompt || `Educational visualization of ${title}`;

    const transcript = `Welcome to this AI audio lesson on "${title}". ${lesson.summary} ${lesson.sections.map((s) => s.heading + ': ' + s.content).join(' ')}`;

    const topic = await TopicSession.create({
      userId: req.user.id,
      title: title.trim(),
      subject: 'General',
      level: safeLevel,
      status: 'completed',
      lesson,
      image: { url: imageUrl, prompt: imagePrompt, alt: `AI illustration for ${title}` },
      video: { url: '', title: `Video: ${title}`, duration: '10:00' },
      audio: { url: '', transcript, duration: '10:00' },
      quiz: quizData,
      flashcards: flashcardData,
      tags: [safeLevel],
    });

    await Notification.create({
      userId: req.user.id,
      title: 'Topic Generated',
      message: `Your learning content for "${title.trim()}" is ready!`,
      type: 'topic',
      link: '',
    });

    res.json({ ...topic.toObject(), aiGenerated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function proxyImage(req, res) {
  try {
    const { url } = req.query;
    if (!url || !/^https:\/\/image\.pollinations\.ai\/prompt\//.test(url)) {
      return res.status(400).json({ error: 'Invalid image URL.' });
    }
    const upstream = await fetch(url, { signal: AbortSignal.timeout(90000) });
    if (!upstream.ok) {
      return res.status(502).json({ error: 'Image provider returned an error.' });
    }
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch image.' });
  }
}

export async function generateSimulation(req, res) {
  try {
    const { title, level } = req.body;
    if (!title || title.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide a topic title.' });
    }
    const escaped = title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let simulation;
    try {
      simulation = await gemini.generateSimulation(title.trim(), level || 'secondary');
    } catch (err) {
      return res.status(503).json({ error: err.message });
    }
    if (!simulation) {
      return res.status(503).json({ error: 'Simulation generation is currently unavailable. Please try again later.' });
    }
    const topic = await TopicSession.findOneAndUpdate(
      { userId: req.user.id, title: { $regex: new RegExp(`^${escaped}$`, 'i') } },
      { $set: { simulation } },
      { new: true, sort: { createdAt: -1 } }
    );
    res.json({ ...simulation, topicId: topic?._id || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function generateCareerGuidance(req, res) {
  try {
    const { interests, subjects, level, goals } = req.body || {};
    const list = Array.isArray(subjects) ? subjects.filter((s) => typeof s === 'string' && s.trim()) : [];
    if (!interests?.trim() && list.length === 0) {
      return res.status(400).json({ error: 'Please tell us about your interests or favourite subjects.' });
    }
    let result;
    try {
      result = await gemini.generateCareerGuidance({
        interests: (interests || '').trim(),
        subjects: list.slice(0, 6),
        level: (level || 'Secondary').trim(),
        goals: (goals || '').trim(),
      });
    } catch (err) {
      return res.status(503).json({ error: err.message });
    }
    if (!result || !result.careers || result.careers.length === 0) {
      return res.status(503).json({ error: 'Career guidance is currently unavailable. Please try again later.' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function generateTeacherDoc(req, res) {
  try {
    const { type, subject, topic, level, count } = req.body || {};
    if (!topic?.trim()) {
      return res.status(400).json({ error: 'Please provide a topic.' });
    }
    let result;
    try {
      result = await gemini.generateTeacherDoc({
        type: type || 'lessonPlan',
        subject: (subject || '').trim(),
        topic: topic.trim(),
        level: (level || 'Secondary').trim(),
        count: Number(count) || 0,
      });
    } catch (err) {
      return res.status(503).json({ error: err.message });
    }
    if (!result) {
      return res.status(503).json({ error: 'Document generation is currently unavailable. Please try again later.' });
    }
    res.json({ title: `${topic.trim()} — ${type || 'lessonPlan'}`, content: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTopicHistory(req, res) {
  try {
    const topics = await TopicSession.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getTopicById(req, res) {
  try {
    const topic = await TopicSession.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });
    if (topic.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized.' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteTopic(req, res) {
  try {
    const topic = await TopicSession.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!topic) return res.status(404).json({ error: 'Topic not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function dedupeTopics(req, res) {
  try {
    const topics = await TopicSession.find({ userId: req.user.id }).sort({ createdAt: 1 });
    const seen = new Map();
    const toDelete = [];
    for (const t of topics) {
      const key = (t.title || '').trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) toDelete.push(t._id);
      else seen.set(key, t._id);
    }
    if (toDelete.length > 0) {
      await TopicSession.deleteMany({ _id: { $in: toDelete } });
    }
    res.json({ deleted: toDelete.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(30);
    const unread = await Notification.countDocuments({ userId: req.user.id, read: false });
    res.json({ notifications, unread });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function markNotificationsRead(req, res) {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteNotification(req, res) {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function uploadResource(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const { title, subject, description } = req.body;
    let content = '';
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const pdfData = await pdfParse(req.file.buffer);
      content = extractTextFromContent(pdfData.text, 10000);
    } catch { content = `[PDF uploaded: ${req.file.originalname}.]`; }

    const detectedSubject = subject || detectSubjectFromText(content + ' ' + (title || ''));
    const resource = await Resource.create({
      title: title || req.file.originalname.replace(/\.pdf$/i, ''),
      type: 'book', subject: detectedSubject, description: description || '',
      filePath: req.file.path, fileOriginalName: req.file.originalname,
      content, contentLength: content.length, status: 'ready',
      addedBy: req.user.id,
    });
    res.json(resource);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function addLinkResource(req, res) {
  try {
    const { url, title, subject, description } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required.' });
    let content = '';
    let extractedTitle = title;
    try {
      const axiosMod = (await import('axios')).default;
      const cheerio = await import('cheerio');
      const response = await axiosMod.get(url, { timeout: 10000, headers: { 'User-Agent': 'CSHubBot/1.0' } });
      const $ = cheerio.load(response.data);
      $('script, style, nav, footer, header, .ad, .ads, .sidebar, .menu, .navigation, .cookie, .popup, .modal').remove();
      if (!title) extractedTitle = $('title').text().trim() || $('h1').first().text().trim() || url;
      const paragraphs = [];
      $('p, h1, h2, h3, h4, li, td, th, blockquote, article, section, main').each((_, el) => {
        const text = $(el).text().trim();
        if (text.length > 10) paragraphs.push(text);
      });
      content = extractTextFromContent(paragraphs.join(' '), 10000);
    } catch { content = `[Linked resource: ${url}.]`; }

    const detectedSubject = subject || detectSubjectFromText(content + ' ' + (extractedTitle || ''));
    const resource = await Resource.create({
      title: extractedTitle || 'Untitled Link',
      type: 'link', subject: detectedSubject, description: description || '',
      linkUrl: url, content, contentLength: content.length, status: 'ready',
      addedBy: req.user.id,
    });
    res.json(resource);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function deleteResource(req, res) {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });
    if (resource.filePath) { try { fs.unlinkSync(resource.filePath); } catch {} }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getResources(req, res) {
  try {
    const resources = await Resource.find({ status: 'ready' }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getResourceById(req, res) {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });
    res.json(resource);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function generateQuizFromResource(req, res) {
  try {
    const { count = 5 } = req.body;
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });

    const questions = await gemini.generateResourceQuiz(resource.content, resource.title, resource.subject, count);
    if (!questions) {
      return res.status(503).json({ error: 'AI quiz generation is currently unavailable. Please try again later.' });
    }

    const quiz = await Quiz.create({
      userId: req.user.id, subject: resource.subject, level: 'secondary',
      questions, totalQuestions: questions.length, resourceId: resource._id,
    });
    resource.quizzesGenerated += 1;
    await resource.save();
    res.json({ quizId: quiz._id, questions: quiz.questions.map((q) => ({ text: q.text, options: q.options })), subject: resource.subject, totalQuestions: quiz.totalQuestions, resourceTitle: resource.title, aiGenerated: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function generateFlashcardsFromResource(req, res) {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });

    const flashcards = await gemini.generateResourceFlashcards(resource.content, resource.title, resource.subject);
    if (!flashcards) {
      return res.status(503).json({ error: 'AI flashcard generation is currently unavailable. Please try again later.' });
    }

    resource.flashcardsGenerated += 1;
    await resource.save();
    res.json({ flashcards, resourceTitle: resource.title, subject: resource.subject, aiGenerated: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function generateSummaryFromResource(req, res) {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });

    const summary = await gemini.generateResourceSummary(resource.content, resource.title);
    if (!summary) {
      return res.status(503).json({ error: 'AI summary generation is currently unavailable. Please try again later.' });
    }

    res.json({ ...summary, resourceTitle: resource.title, subject: resource.subject, aiGenerated: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function chatAboutResource(req, res) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required.' });
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });

    const reply = await gemini.chatAboutResourceContent(message, resource.content, resource.title, resource.subject);
    if (!reply) {
      return res.status(503).json({ error: 'AI chat is currently unavailable. Please try again later.' });
    }

    res.json({ reply, resourceTitle: resource.title, subject: resource.subject, aiGenerated: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

export async function adminGetResources(req, res) {
  try {
    const resources = await Resource.find({}).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) { res.status(500).json({ error: err.message }); }
}
