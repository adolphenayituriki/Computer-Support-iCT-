import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { AI_API_BASE } from '../api';
import {
  FaFileAlt, FaSpinner, FaTrash, FaEye, FaHome, FaPen,
  FaCopy, FaCheck, FaLightbulb, FaBookOpen, FaListUl
} from 'react-icons/fa';

export default function AINotesGenerator() {
  const { user } = useAuth();
  const [mode, setMode] = useState('menu');
  const [inputText, setInputText] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState(null);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const token = () => localStorage.getItem('cshub_token');

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/notes/history`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) setHistory(await res.json());
    } catch {}
  };

  const generateFromText = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/notes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ text: inputText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to generate notes.'); setLoading(false); return; }
      setNote(data);
      setMode('view');
      fetchHistory();
    } catch { setError('Could not connect to AI backend.'); }
    setLoading(false);
  };

  const generateFromTopic = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/notes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to generate notes.'); setLoading(false); return; }
      setNote(data);
      setMode('view');
      fetchHistory();
    } catch { setError('Could not connect to AI backend.'); }
    setLoading(false);
  };

  const loadNote = async (n) => {
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/notes/${n._id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) { setNote(await res.json()); setMode('view'); }
    } catch {}
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${AI_API_BASE}/api/ai/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      setHistory((prev) => prev.filter((n) => n._id !== id));
      if (note?._id === id) { setNote(null); setMode('menu'); }
    } catch {}
  };

  const copyToClipboard = () => {
    if (!note) return;
    const n = note.notes;
    let text = `${n.title}\n\nSummary: ${n.summary}\n\n`;
    n.headings.forEach((h) => { text += `${h.heading}\n${h.content}\n\n`; });
    if (n.definitions.length) { text += 'Definitions:\n'; n.definitions.forEach((d) => { text += `  ${d.term}: ${d.definition}\n`; }); text += '\n'; }
    if (n.keyTakeaways.length) { text += 'Key Takeaways:\n'; n.keyTakeaways.forEach((k) => { text += `  • ${k}\n`; }); }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const goHome = () => { setMode('menu'); setNote(null); setInputText(''); setTopic(''); setError(''); };

  if (mode === 'view' && note) {
    const n = note.notes;
    return (
      <div className="ai-notes">
        <div className="ai-notes-header">
          <button className="ai-notes-back-btn" onClick={goHome}><FaHome /> Back</button>
          <h3>{n.title}</h3>
          <div className="ai-notes-actions">
            <button className="ai-notes-action-btn" onClick={copyToClipboard} title="Copy notes">
              {copied ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
        </div>

        <div className="ai-notes-meta">
          <span className="ai-notes-subject-badge">{note.subject}</span>
          <span className="ai-notes-level-badge">{note.level}</span>
          <span className="ai-notes-date">{new Date(note.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="ai-notes-content">
          <div className="ai-notes-section ai-notes-summary">
            <h4><FaBookOpen /> Summary</h4>
            <p>{n.summary}</p>
          </div>

          {n.headings.map((h, i) => (
            <div key={i} className="ai-notes-section">
              <h4><FaListUl /> {h.heading}</h4>
              <p>{h.content}</p>
              {h.bulletPoints.length > 0 && (
                <ul className="ai-notes-bullets">
                  {h.bulletPoints.map((bp, j) => <li key={j}>{bp}</li>)}
                </ul>
              )}
            </div>
          ))}

          {n.definitions.length > 0 && (
            <div className="ai-notes-section ai-notes-defs">
              <h4><FaPen /> Key Definitions</h4>
              {n.definitions.map((d, i) => (
                <div key={i} className="ai-notes-def">
                  <strong>{d.term}:</strong> {d.definition}
                </div>
              ))}
            </div>
          )}

          {n.keyTakeaways.length > 0 && (
            <div className="ai-notes-section ai-notes-takeaways">
              <h4><FaLightbulb /> Key Takeaways</h4>
              <ul className="ai-notes-bullets">
                {n.keyTakeaways.map((k, i) => <li key={i}>{k}</li>)}
              </ul>
            </div>
          )}

          {note.references && note.references.length > 0 && (
            <div className="ai-notes-section ai-notes-references">
              <h4><FaBookOpen /> Scholar References</h4>
              <div className="ai-notes-references-list">
                {note.references.map((ref, i) => (
                  <div key={i} className="ai-notes-reference-item">
                    <div className="ai-notes-reference-header">
                      <span className="ai-notes-reference-num">{i + 1}</span>
                      <a href={ref.url} target="_blank" rel="noopener noreferrer" className="ai-notes-reference-title">
                        {ref.title}
                      </a>
                    </div>
                    <p className="ai-notes-reference-authors">{ref.authorsVenue}</p>
                    {ref.snippet && <p className="ai-notes-reference-snippet">{ref.snippet}</p>}
                    {ref.citations > 0 && <span className="ai-notes-reference-citations">📊 {ref.citations} citations</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="ai-notes-footer">
          <button className="btn btn-outline btn-sm" onClick={goHome}>New Notes</button>
          <button className="ai-notes-delete-btn" onClick={() => deleteNote(note._id)}><FaTrash /> Delete</button>
        </div>
      </div>
    );
  }

  if (mode === 'text' || mode === 'topic') {
    return (
      <div className="ai-notes">
        <div className="ai-notes-header">
          <button className="ai-notes-back-btn" onClick={goHome}><FaHome /> Back</button>
          <h3>{mode === 'text' ? 'Generate Notes from Text' : 'Generate Notes from Topic'}</h3>
        </div>

        {error && <div className="ai-notes-error">{error}</div>}

        {mode === 'text' ? (
          <div className="ai-notes-input-area">
            <textarea
              className="ai-notes-textarea"
              placeholder="Paste your text here... (lecture notes, article, textbook content, etc.)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={10}
            />
            <button className="btn" onClick={generateFromText} disabled={!inputText.trim() || loading}>
              {loading ? <><FaSpinner className="fa-spin" /> Generating...</> : <><FaFileAlt /> Generate Notes</>}
            </button>
          </div>
        ) : (
          <div className="ai-notes-input-area">
            <input
              type="text"
              className="ai-notes-input"
              placeholder="Enter a topic... e.g. Photosynthesis, Python Programming, World War II..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateFromTopic()}
            />
            <div className="ai-notes-topic-suggestions">
              {['Photosynthesis', 'Algebra Basics', 'Newton\'s Laws', 'HTML & CSS', 'Cell Biology'].map((s) => (
                <button key={s} className="ai-notes-suggestion" onClick={() => setTopic(s)}>{s}</button>
              ))}
            </div>
            <button className="btn" onClick={generateFromTopic} disabled={!topic.trim() || loading}>
              {loading ? <><FaSpinner className="fa-spin" /> Generating...</> : <><FaFileAlt /> Generate Notes</>}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ai-notes">
      <div className="ai-notes-header">
        <FaFileAlt size={20} />
        <h3>Notes Generator</h3>
      </div>
      <p className="ai-notes-sub">Generate organized study notes from text or any topic</p>

      <div className="ai-notes-modes">
        <button className="ai-notes-mode-card" onClick={() => setMode('text')}>
          <div className="ai-notes-mode-icon" style={{ color: '#5694F7' }}><FaPen /></div>
          <h4>From Text</h4>
          <p>Paste lecture notes, articles, or textbook content</p>
        </button>
        <button className="ai-notes-mode-card" onClick={() => setMode('topic')}>
          <div className="ai-notes-mode-icon" style={{ color: '#10b981' }}><FaLightbulb /></div>
          <h4>From Topic</h4>
          <p>Enter any subject and AI will create notes</p>
        </button>
      </div>

      {history.length > 0 && (
        <div className="ai-notes-history">
          <h4>Saved Notes</h4>
          <div className="ai-notes-history-list">
            {history.map((n) => (
              <div key={n._id} className="ai-notes-history-item">
                <button className="ai-notes-history-main" onClick={() => loadNote(n)}>
                  <FaFileAlt size={16} />
                  <div>
                    <strong>{n.title}</strong>
                    <small>{n.subject} • {new Date(n.createdAt).toLocaleDateString()}</small>
                  </div>
                </button>
                <button className="ai-notes-history-delete" onClick={() => deleteNote(n._id)}><FaTrash /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
