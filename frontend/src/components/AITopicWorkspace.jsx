import { useState, useEffect, useRef } from 'react';
import API_BASE from '../api';
import { useAuth } from '../AuthContext';

export default function AITopicWorkspace({ onBack }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTool, setActiveTool] = useState('lesson');
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    loadHistory();
    inputRef.current?.focus();
  }, []);

  async function loadHistory() {
    try {
      const res = await fetch(`${API_BASE}/api/ai/topics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('cshub_token')}` },
      });
      if (res.ok) setHistory(await res.json());
    } catch {}
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setTopic(null);
    setActiveTool('lesson');
    setShowFlashcards(false);
    setFlashcardIdx(0);
    setFlashcardFlipped(false);
    try {
      const res = await fetch(`${API_BASE}/api/ai/topics/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('cshub_token')}`,
        },
        body: JSON.stringify({ title: query.trim(), level: 'beginner' }),
      });
      const data = await res.json();
      if (res.ok) {
        setTopic(data);
        loadHistory();
      }
    } catch {}
    setLoading(false);
  }

  function handleHistoryClick(t) {
    setTopic(t);
    setActiveTool('lesson');
    setQuery(t.title);
    setShowFlashcards(false);
    setFlashcardIdx(0);
    setFlashcardFlipped(false);
  }

  const TOOLS = [
    { id: 'lesson', icon: '📖', label: 'AI Lesson' },
    { id: 'image', icon: '🖼️', label: 'AI Image' },
    { id: 'video', icon: '🎬', label: 'AI Video' },
    { id: 'audio', icon: '🔊', label: 'AI Audio' },
    { id: 'quiz', icon: '📝', label: 'AI Quiz' },
    { id: 'flashcards', icon: '🃏', label: 'Flashcards' },
  ];

  function renderToolContent() {
    if (!topic) return null;
    switch (activeTool) {
      case 'lesson':
        return (
          <div className="topic-lesson">
            <div className="topic-lesson-summary">
              <h3>📖 Lesson Summary</h3>
              <p>{topic.lesson?.summary}</p>
            </div>
            {topic.lesson?.sections?.map((s, i) => (
              <div key={i} className="topic-lesson-section">
                <h4>{s.heading}</h4>
                <p>{s.content}</p>
              </div>
            ))}
          </div>
        );
      case 'image':
        return (
          <div className="topic-image">
            <h3>🖼️ AI Generated Image</h3>
            <p className="topic-image-prompt">{topic.image?.prompt}</p>
            {topic.image?.url && (
              <img src={topic.image.url} alt={topic.image?.alt || topic.title} className="topic-image-img" />
            )}
            <div className="topic-image-actions">
              <button onClick={() => {
                const link = document.createElement('a');
                link.href = topic.image.url;
                link.download = `${topic.title.replace(/\s+/g, '_')}.svg`;
                link.click();
              }} className="topic-action-btn">⬇ Download Image</button>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="topic-video">
            <h3>🎬 AI Educational Video</h3>
            <div className="topic-video-player">
              <div className="topic-video-placeholder">
                <span className="topic-video-play">▶</span>
                <p>{topic.video?.title}</p>
                <span className="topic-video-duration">{topic.video?.duration}</span>
              </div>
            </div>
            <p className="topic-video-note">Video content generated for: {topic.title}</p>
          </div>
        );
      case 'audio':
        return (
          <div className="topic-audio">
            <h3>🔊 AI Audio Learning</h3>
            <div className="topic-audio-player">
              <div className="topic-audio-visual">
                {[...Array(20)].map((_, i) => (
                  <span key={i} className="topic-audio-bar" style={{ animationDelay: `${i * 0.05}s`, height: `${12 + Math.random() * 20}px` }} />
                ))}
              </div>
              <p className="topic-audio-duration">⏱ {topic.audio?.duration}</p>
            </div>
            <div className="topic-audio-transcript">
              <h4>Transcript</h4>
              <p>{topic.audio?.transcript}</p>
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
      default:
        return null;
    }
  }

  return (
    <div className="topic-workspace">
      <div className="topic-workspace-header">
        <button onClick={onBack} className="topic-back-btn">← Back</button>
        <h2>AI Tools</h2>
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
        <p className="topic-search-hint">AI will generate: lesson, image, video, audio, quiz & flashcards for any topic</p>
      </form>

      {loading && (
        <div className="topic-loading">
          <div className="topic-loading-spinner" />
          <p>Generating AI content for "{query}"...</p>
          <div className="topic-loading-steps">
            <span className="topic-loading-step done">📖 Creating lesson</span>
            <span className="topic-loading-step done">🖼️ Generating image</span>
            <span className="topic-loading-step active">🎬 Building video</span>
            <span className="topic-loading-step">🔊 Recording audio</span>
            <span className="topic-loading-step">📝 Writing quiz</span>
            <span className="topic-loading-step">🃏 Making flashcards</span>
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
          <h3>Recent Topics</h3>
          <div className="topic-history-list">
            {history.map((t) => (
              <button key={t._id} className="topic-history-item" onClick={() => handleHistoryClick(t)}>
                <span className="topic-history-icon">
                  {t.subject === 'math' ? '📐' : t.subject === 'physics' ? '⚡' : t.subject === 'biology' ? '🧬' : t.subject === 'computer_science' ? '💻' : t.subject === 'chemistry' ? '⚗️' : t.subject === 'english' ? '📚' : '🌍'}
                </span>
                <div>
                  <strong>{t.title}</strong>
                  <span>{t.subject} • {new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && !topic && history.length === 0 && (
        <div className="topic-empty">
          <div className="topic-empty-icon">🎯</div>
          <h3>What do you want to learn?</h3>
          <p>Type any topic above and AI will generate a complete learning package — lesson, image, video, audio, quiz & flashcards.</p>
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
