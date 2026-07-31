import { useState, useEffect, useRef } from 'react';
import API_BASE, { AI_API_BASE } from '../api';
import { useAuth } from '../AuthContext';
import AIMarkdown from './AIMarkdown';

const LOAD_STEPS = [
  { icon: '📖', label: 'Creating lesson' },
  { icon: '🖼️', label: 'Generating image' },
  { icon: '🎬', label: 'Building video' },
  { icon: '🔊', label: 'Recording audio' },
  { icon: '📝', label: 'Writing quiz' },
  { icon: '🃏', label: 'Making flashcards' },
];

const EDUCATION_LEVELS = [
  { value: 'Primary', label: 'Primary (P1–P6)' },
  { value: 'O-Level', label: 'Ordinary Level (S1–S3)' },
  { value: 'A-Level', label: 'Advanced Level (S4–S6)' },
  { value: 'TVET', label: 'TVET' },
  { value: 'University', label: 'University' },
];

const SUBJECT_INFO = {
  general: { label: 'General', color: '#64748b', icon: '🌍' },
  math: { label: 'Mathematics', color: '#FFCE08', icon: '📐' },
  physics: { label: 'Physics', color: '#5694F7', icon: '⚡' },
  chemistry: { label: 'Chemistry', color: '#10b981', icon: '⚗️' },
  biology: { label: 'Biology', color: '#8b5cf6', icon: '🧬' },
  computer_science: { label: 'Computer Science', color: '#06b6d4', icon: '💻' },
  english: { label: 'English', color: '#f59e0b', icon: '📚' },
  french: { label: 'French', color: '#ec4899', icon: '🇫🇷' },
  kinyarwanda: { label: 'Kinyarwanda', color: '#ef4444', icon: '🇷🇼' },
  geography: { label: 'Geography', color: '#14b8a6', icon: '🗺️' },
  history: { label: 'History', color: '#d946ef', icon: '🏛️' },
};

const subjectInfo = (s) => SUBJECT_INFO[s] || { label: s || 'General', color: '#64748b', icon: '🌍' };

const timeAgo = (date) => {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const toolsGenerated = (t) => {
  let n = 0;
  if (t.lesson?.summary || t.lesson?.sections?.length) n++;
  if (t.image?.url) n++;
  if (t.video?.url || t.video?.title) n++;
  if (t.audio?.transcript) n++;
  if (t.quiz?.length) n++;
  if (t.flashcards?.length) n++;
  if (t.simulation?.html) n++;
  return n;
};

export default function AITopicWorkspace({ onBack, initialQuery = '', autoSearchTrigger = 0 }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('O-Level');
  const [useResources, setUseResources] = useState(true);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTool, setActiveTool] = useState('lesson');
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioRate, setAudioRate] = useState(1);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgSeed, setImgSeed] = useState(0);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');
  const [simFullscreen, setSimFullscreen] = useState(false);
  const inputRef = useRef(null);
  const audioCleanupRef = useRef(null);

  useEffect(() => {
    loadHistory();
    inputRef.current?.focus();
  }, []);

  useEffect(() => () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    setAudioPlaying(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, [topic]);

  useEffect(() => {
    setImgLoading(false);
    setImgError(false);
    setImgSeed(0);
    setSimError('');
    setSimFullscreen(false);
  }, [topic]);

  useEffect(() => {
    if (activeTool === 'image' && topic?.image?.url) {
      setImgError(false);
      setImgLoading(true);
    }
  }, [activeTool, topic, imgSeed]);

  const toggleAudio = () => {
    if (!('speechSynthesis' in window) || !topic?.audio?.transcript) return;
    const synth = window.speechSynthesis;
    if (audioPlaying) {
      synth.cancel();
      setAudioPlaying(false);
      return;
    }
    const clean = topic.audio.transcript
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = audioRate;
    utter.pitch = 1;
    utter.onend = () => setAudioPlaying(false);
    utter.onerror = () => setAudioPlaying(false);
    audioCleanupRef.current = utter;
    synth.speak(utter);
    setAudioPlaying(true);
  };

  useEffect(() => {
    if (!loading) return;
    setLoadStep(0);
    const t = setInterval(() => {
      setLoadStep((s) => {
        if (s >= LOAD_STEPS.length) return s;
        return s + 1;
      });
    }, 900);
    return () => clearInterval(t);
  }, [loading]);

  async function loadHistory() {
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/topics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('cshub_token')}` },
      });
      if (res.ok) setHistory(await res.json());
    } catch {}
  }

  async function runSearch(title) {
    if (!title || !title.trim() || loading) return;
    setLoading(true);
    setTopic(null);
    setActiveTool('lesson');
    setShowFlashcards(false);
    setFlashcardIdx(0);
    setFlashcardFlipped(false);
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/topics/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cshub_token')}`,
        },
        body: JSON.stringify({ title: title.trim(), level, useResources }),
      });
      const data = await res.json();
      if (res.ok) {
        setTopic(data);
        loadHistory();
      }
    } catch {}
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) runSearch(query);
  }

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      runSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, autoSearchTrigger]);

  function handleHistoryClick(t) {
    setTopic(t);
    setActiveTool('lesson');
    setQuery(t.title);
    setShowFlashcards(false);
    setFlashcardIdx(0);
    setFlashcardFlipped(false);
  }

  async function deleteTopic(id, title) {
    if (!window.confirm(`Delete "${title}" from your history?`)) return;
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/topics/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('cshub_token')}` },
      });
      if (res.ok) loadHistory();
      else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Could not delete this topic.');
      }
    } catch {
      alert('Connection error. Please try again.');
    }
  }

  async function clearDuplicates() {
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/topics/duplicates`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('cshub_token')}` },
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.deleted > 0) {
          loadHistory();
        } else {
          alert('No duplicate topics found.');
        }
      }
    } catch {}
  }

  function imageSrcWithSeed() {
    const url = topic?.image?.url;
    if (!url || !imgSeed) return url;
    if (url.startsWith('data:image/svg')) return url;
    try {
      const u = new URL(url);
      u.searchParams.set('seed', imgSeed);
      return u.toString();
    } catch {
      return url;
    }
  }

  function handleRegenerateImage() {
    if (!topic?.image?.url) return;
    setImgSeed(Math.floor(Math.random() * 100000) || 1);
    setImgError(false);
    setImgLoading(true);
  }

  async function handleDownloadImage() {
    const url = topic?.image?.url;
    if (!url) return;
    const base = `${(topic.title || 'topic').replace(/\s+/g, '_')}`;
    if (url.startsWith('data:image/svg')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${base}.svg`;
      link.click();
      return;
    }
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/proxy-image?url=${encodeURIComponent(url)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('cshub_token')}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${base}.${ext}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {}
  }

  async function handleGenerateSimulation() {
    if (!topic || simLoading) return;
    setSimLoading(true);
    setSimError('');
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/simulations/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cshub_token')}`,
        },
        body: JSON.stringify({ title: topic.title, level }),
      });
      const data = await res.json();
      if (res.ok && data.html) {
        setTopic((prev) => ({ ...prev, simulation: { title: data.title, description: data.description, html: data.html } }));
      } else {
        setSimError(data.error || 'Generation failed. Please try again.');
      }
    } catch {
      setSimError('Connection error. Please try again.');
    }
    setSimLoading(false);
  }

  const TOOLS = [
    { id: 'lesson', icon: '📖', label: 'AI Lesson' },
    { id: 'image', icon: '🖼️', label: 'AI Image' },
    { id: 'video', icon: '🎬', label: 'AI Video' },
    { id: 'audio', icon: '🔊', label: 'AI Audio' },
    { id: 'quiz', icon: '📝', label: 'AI Quiz' },
    { id: 'flashcards', icon: '🃏', label: 'Flashcards' },
    { id: 'simulation', icon: '🧪', label: 'Simulation' },
  ];

  function renderToolContent() {
    if (!topic) return null;
    switch (activeTool) {
      case 'lesson':
        return (
          <div className="topic-lesson">
            <div className="topic-lesson-summary">
              <h3>📖 Lesson Summary</h3>
              <AIMarkdown>{topic.lesson?.summary}</AIMarkdown>
            </div>
            {topic.lesson?.sections?.map((s, i) => (
              <div key={i} className="topic-lesson-section">
                <h4>{i + 1}. {s.heading}</h4>
                <AIMarkdown>{s.content}</AIMarkdown>
              </div>
            ))}
          </div>
        );
      case 'image': {
        const imgSrc = imageSrcWithSeed();
        const imgHidden = imgLoading || imgError;
        return (
          <div className="topic-image">
            <h3>🖼️ AI Generated Image</h3>
            <p className="topic-image-prompt">{topic.image?.prompt}</p>
            <div className="topic-image-frame">
              {imgSrc && imgLoading && (
                <div className="topic-image-loader">
                  <span className="topic-image-loader-art">🎨</span>
                  <p>AI is painting your image...</p>
                  <div className="topic-loading-bar"><div className="topic-loading-bar-fill" /></div>
                </div>
              )}
              {imgSrc && imgError && (
                <div className="topic-image-error">
                  <span>⚠️</span>
                  <p>Couldn't load the image. Check your internet connection, then try again.</p>
                </div>
              )}
              {imgSrc && (
                <img
                  src={imgSrc}
                  alt={topic.image?.alt || topic.title}
                  className="topic-image-img"
                  loading="lazy"
                  onLoad={() => { setImgLoading(false); setImgError(false); }}
                  onError={() => { setImgLoading(false); setImgError(true); }}
                  style={imgHidden ? { display: 'none' } : {}}
                />
              )}
            </div>
            <div className="topic-image-actions">
              <button onClick={handleRegenerateImage} className="topic-action-btn" disabled={!topic.image?.url}>🔄 Regenerate</button>
              <button onClick={handleDownloadImage} className="topic-action-btn" disabled={!topic.image?.url}>⬇ Download Image</button>
            </div>
          </div>
        );
      }
      case 'video': {
        const videoSearch = encodeURIComponent(topic.title || '');
        return (
          <div className="topic-video">
            <h3>🎬 AI Educational Video</h3>
            <div className="topic-video-frame">
              <iframe
                src={`https://www.youtube.com/embed?listType=search&list=${videoSearch}`}
                title={`AI curated videos: ${topic.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <p className="topic-video-note">AI curated the best YouTube videos for: <strong>{topic.title}</strong></p>
            <div className="topic-image-actions">
              <a
                className="topic-action-btn"
                href={`https://www.youtube.com/results?search_query=${videoSearch}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                ▶ Watch on YouTube
              </a>
            </div>
          </div>
        );
      }
      case 'audio':
        return (
          <div className="topic-audio">
            <h3>🔊 AI Audio Learning</h3>
            <div className="topic-audio-player">
              <button
                className={`topic-audio-play ${audioPlaying ? 'playing' : ''}`}
                onClick={toggleAudio}
                disabled={!('speechSynthesis' in window)}
              >
                {audioPlaying ? '⏸' : '▶'}
              </button>
              <div className={`topic-audio-visual ${audioPlaying ? 'active' : ''}`}>
                {[...Array(24)].map((_, i) => (
                  <span key={i} className="topic-audio-bar" style={{ animationDelay: `${i * 0.05}s` }} />
                ))}
              </div>
              <div className="topic-audio-controls">
                <div className="topic-audio-rate">
                  {[0.75, 1, 1.25, 1.5].map((r) => (
                    <button
                      key={r}
                      className={`topic-audio-rate-btn ${audioRate === r ? 'active' : ''}`}
                      onClick={() => { setAudioRate(r); }}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
                <p className="topic-audio-status">{audioPlaying ? 'Playing...' : 'Ready to play'}</p>
              </div>
            </div>
            <div className="topic-audio-transcript">
              <h4>Transcript</h4>
              <AIMarkdown>{topic.audio?.transcript}</AIMarkdown>
            </div>
          </div>
        );
      case 'quiz':
        return (
          <div className="topic-quiz">
            <h3>📝 Topic Quiz</h3>
            <p className="topic-quiz-count">{topic.quiz?.length || 0} questions</p>
            {topic.quiz?.map((q, qi) => (
              <div key={qi} className="topic-quiz-question">
                <p><strong>Q{qi + 1}.</strong> {q.question}</p>
                <div className="topic-quiz-options">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`topic-quiz-opt ${oi === q.correctIndex ? 'correct' : ''}`}>
                      <span className="topic-quiz-letter">{String.fromCharCode(65 + oi)}</span> {opt}
                    </div>
                  ))}
                </div>
                <p className="topic-quiz-explanation">💡 {q.explanation}</p>
              </div>
            ))}
          </div>
        );
      case 'flashcards':
        return (
          <div className="topic-flashcards">
            <h3>🃏 Flashcards</h3>
            {topic.flashcards && topic.flashcards.length > 0 && (
              <>
                <div
                  className={`topic-flashcard ${flashcardFlipped ? 'flipped' : ''}`}
                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                >
                  <div className="topic-flashcard-inner">
                    <div className="topic-flashcard-front">
                      <span className="topic-flashcard-label">Question</span>
                      <p>{topic.flashcards[flashcardIdx]?.front}</p>
                      <span className="topic-flashcard-hint">Tap to flip</span>
                    </div>
                    <div className="topic-flashcard-back">
                      <span className="topic-flashcard-label">Answer</span>
                      <p>{topic.flashcards[flashcardIdx]?.back}</p>
                      <span className="topic-flashcard-hint">Tap to flip</span>
                    </div>
                  </div>
                </div>
                <div className="topic-flashcard-nav">
                  <button onClick={() => { setFlashcardIdx(Math.max(0, flashcardIdx - 1)); setFlashcardFlipped(false); }} disabled={flashcardIdx === 0} className="topic-flashcard-btn">← Prev</button>
                  <span>{flashcardIdx + 1} / {topic.flashcards.length}</span>
                  <button onClick={() => { setFlashcardIdx(Math.min(topic.flashcards.length - 1, flashcardIdx + 1)); setFlashcardFlipped(false); }} disabled={flashcardIdx === topic.flashcards.length - 1} className="topic-flashcard-btn">Next →</button>
                </div>
              </>
            )}
          </div>
        );
      case 'simulation':
        return (
          <div className="topic-simulation">
            <h3>🧪 Interactive Simulation</h3>
            {topic.simulation?.description && <p className="topic-image-prompt">{topic.simulation.description}</p>}
            {!topic.simulation?.html && (
              <div className="topic-simulation-empty">
                <div className="topic-simulation-icon">🧪</div>
                <p>Generate an interactive animation that shows how <strong>{topic.title}</strong> works, step by step.</p>
                {simError && <p className="topic-simulation-error">⚠️ {simError}</p>}
                <button className="topic-action-btn" onClick={handleGenerateSimulation} disabled={simLoading}>
                  {simLoading ? '⏳ Generating simulation...' : '▶ Generate Simulation'}
                </button>
                {simLoading && <div className="topic-loading-bar"><div className="topic-loading-bar-fill" /></div>}
              </div>
            )}
            {topic.simulation?.html && (
              <>
                <div className={`topic-simulation-frame ${simFullscreen ? 'fullscreen' : ''}`}>
                  <iframe
                    srcDoc={topic.simulation.html}
                    title={topic.simulation.title || `Simulation: ${topic.title}`}
                    sandbox="allow-scripts"
                    loading="lazy"
                  />
                  <button className="topic-simulation-fullscreen" onClick={() => setSimFullscreen(!simFullscreen)}>
                    {simFullscreen ? '✕ Close' : '⛶ Fullscreen'}
                  </button>
                </div>
                <div className="topic-image-actions">
                  <button onClick={handleGenerateSimulation} className="topic-action-btn" disabled={simLoading}>
                    {simLoading ? '⏳ Regenerating...' : '🔄 Regenerate'}
                  </button>
                </div>
              </>
            )}
          </div>
        );
      default:
        return null;
    }
  }

  const uniqueHistory = history.filter(
    (t, i) => history.findIndex((x) => (x.title || '').trim().toLowerCase() === (t.title || '').trim().toLowerCase()) === i
  );

  return (
    <div className="topic-workspace">
      <div className="topic-workspace-header">
        <button onClick={onBack} className="topic-back-btn">← Back</button>
        <div className="topic-workspace-heading">
          <h2>AI Tools</h2>
          <span>Generate a complete learning package for any topic</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="topic-search-form">
        <div className="topic-search-bar">
          <span className="topic-search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter any topic... e.g. Photosynthesis, Python Programming, World War II..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="topic-search-input"
          />
          <button type="submit" className="topic-search-btn" disabled={!query.trim() || loading}>
            {loading ? '⏳' : '→'}
          </button>
        </div>
        <div className="topic-search-options">
          <label className="topic-level-field">
            <span className="topic-level-label">Education level</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="topic-level-select"
              disabled={loading}
            >
              {EDUCATION_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </label>
          <label className="topic-resource-toggle">
            <input
              type="checkbox"
              checked={useResources}
              onChange={(e) => setUseResources(e.target.checked)}
              disabled={loading}
            />
            <span>Align with uploaded curriculum resources</span>
          </label>
        </div>
        <p className="topic-search-hint">AI will generate: lesson, image, video, audio, quiz, flashcards & simulations for any topic</p>
      </form>

      {loading && (
        <div className="topic-loading">
          <div className="topic-loading-orbit">
            <div className="topic-loading-spinner" />
            <div className="topic-loading-core">🤖</div>
          </div>
          <p className="topic-loading-title">Generating AI content for "<strong>{query}</strong>" ({level})...</p>
          <div className="topic-loading-steps">
            {LOAD_STEPS.map((step, i) => (
              <span
                key={step.label}
                className={`topic-loading-step ${i < loadStep ? 'done' : ''} ${i === loadStep ? 'active' : ''}`}
              >
                {i < loadStep ? '✅' : i === loadStep ? '⏳' : step.icon} {step.label}
              </span>
            ))}
          </div>
          <div className="topic-loading-bar">
            <div className="topic-loading-bar-fill" style={{ width: `${Math.min(100, (loadStep / LOAD_STEPS.length) * 100)}%` }} />
          </div>
        </div>
      )}

      {!loading && topic && (
        <div className="topic-result">
          <div className="topic-result-header">
            <h2>{topic.title}</h2>
            <div className="topic-result-meta">
              <span className="topic-subject-badge">{topic.subject}</span>
              <span className="topic-level-badge">{topic.level}</span>
            </div>
          </div>

          <div className="topic-tools-tabs">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                className={`topic-tool-tab ${activeTool === tool.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTool(tool.id);
                  if (tool.id === 'flashcards') { setShowFlashcards(true); setFlashcardIdx(0); setFlashcardFlipped(false); }
                }}
              >
                <span>{tool.icon}</span> {tool.label}
              </button>
            ))}
          </div>

          <div className="topic-tool-content">
            {renderToolContent()}
          </div>
        </div>
      )}

      {!loading && !topic && history.length > 0 && (
        <div className="topic-history">
          <div className="topic-history-header">
            <h3>Recent Topics</h3>
            <div className="topic-history-actions">
              {history.length > uniqueHistory.length && (
                <button
                  className="topic-history-clear-btn"
                  onClick={clearDuplicates}
                  title={`Delete ${history.length - uniqueHistory.length} older duplicate(s)`}
                >
                  🧹 Clear duplicates ({history.length - uniqueHistory.length})
                </button>
              )}
              <span className="topic-history-count">{uniqueHistory.length} unique</span>
            </div>
          </div>
          <div className="topic-history-grid">
            {uniqueHistory.map((t) => {
              const info = subjectInfo(t.subject);
              const tools = toolsGenerated(t);
              return (
                <div
                  key={t._id}
                  className="topic-history-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleHistoryClick(t)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleHistoryClick(t); } }}
                >
                  <button
                    className="topic-history-card-delete"
                    title="Delete from history"
                    onClick={(e) => { e.stopPropagation(); deleteTopic(t._id, t.title); }}
                  >
                    🗑
                  </button>
                  <span className="topic-history-card-top">
                    <span className="topic-history-card-icon" style={{ backgroundColor: info.color + '1f', color: info.color }}>
                      {info.icon}
                    </span>
                    <span className="topic-history-card-chip" style={{ color: info.color, borderColor: info.color + '55' }}>
                      {info.label}
                    </span>
                  </span>
                  <strong className="topic-history-card-title">{t.title}</strong>
                  <span className="topic-history-card-meta">
                    <span className="topic-history-card-tools" style={{ color: info.color }}>{tools} tool{tools === 1 ? '' : 's'}</span>
                    <span className="topic-history-card-sep">•</span>
                    <span className="topic-history-card-time">{timeAgo(t.createdAt)}</span>
                    <span className="topic-history-card-arrow">→</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && !topic && history.length === 0 && (
        <div className="topic-empty">
          <div className="topic-empty-icon">🎯</div>
          <h3>What do you want to learn?</h3>
          <p>Type any topic above and AI will generate a complete learning package — lesson, image, video, audio, quiz, flashcards & interactive simulations.</p>
          <div className="topic-suggestions">
            {['Photosynthesis', 'Python Programming', 'World War II', 'Algebra Basics', 'Climate Change'].map((s) => (
              <button key={s} className="topic-suggestion-btn" onClick={() => { setQuery(s); }}>{s}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
