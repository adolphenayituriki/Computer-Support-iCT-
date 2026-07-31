import { useState } from 'react';
import { AI_API_BASE } from '../api';
import {
  FaRoute, FaSpinner, FaRedo, FaLightbulb, FaGraduationCap,
  FaCheckCircle, FaBriefcase, FaExclamationTriangle
} from 'react-icons/fa';

const SUBJECTS = [
  { key: 'Mathematics', color: '#FFCE08', icon: '📐' },
  { key: 'Physics', color: '#5694F7', icon: '⚡' },
  { key: 'Chemistry', color: '#10b981', icon: '⚗️' },
  { key: 'Biology', color: '#8b5cf6', icon: '🧬' },
  { key: 'Computer Science', color: '#06b6d4', icon: '💻' },
  { key: 'English', color: '#f59e0b', icon: '📚' },
  { key: 'Geography', color: '#ef4444', icon: '🗺️' },
  { key: 'History', color: '#d946ef', icon: '🏛️' },
  { key: 'Kinyarwanda', color: '#14b8a6', icon: '🗣️' },
  { key: 'French', color: '#6366f1', icon: '🇫🇷' },
];

const LEVELS = ['Primary', 'Secondary O-Level', 'Secondary A-Level', 'University'];

export default function AICareer() {
  const [subjects, setSubjects] = useState([]);
  const [level, setLevel] = useState('Secondary A-Level');
  const [interests, setInterests] = useState('');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const token = () => localStorage.getItem('cshub_token');

  const toggleSubject = (key) =>
    setSubjects((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));

  const generate = async () => {
    if (loading) return;
    if (!interests.trim() && subjects.length === 0) {
      setError('Tell us your interests or pick at least one favourite subject.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/careers/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ interests, subjects, level, goals }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed.');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError('');
  };

  const scoreColor = (s) => (s >= 85 ? '#10b981' : s >= 70 ? '#f59e0b' : '#5694F7');

  return (
    <div className="ai-career">
      <div className="ai-dash-page-header">
        <span className="ai-dash-page-header-icon" style={{ backgroundColor: '#06b6d41f', color: '#06b6d4' }}><FaRoute /></span>
        <div>
          <h2>AI Career Guidance</h2>
          <p>Discover career pathways that match your interests, favourite subjects and goals.</p>
        </div>
      </div>

      {!result ? (
        <div className="ai-career-form">
          <div className="ai-career-field">
            <label>Favourite subjects</label>
            <div className="ai-career-subjects">
              {SUBJECTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`ai-career-chip${subjects.includes(s.key) ? ' active' : ''}`}
                  style={{ '--c': s.color }}
                  onClick={() => toggleSubject(s.key)}
                >
                  <span className="ai-career-chip-icon">{s.icon}</span> {s.key}
                </button>
              ))}
            </div>
          </div>
          <div className="ai-career-row">
            <div className="ai-career-field">
              <label>Education level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="ai-career-field grow">
              <label>Interests & hobbies</label>
              <input
                type="text"
                placeholder="e.g. technology, drawing, solving puzzles, sports..."
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>
          </div>
          <div className="ai-career-field">
            <label>Career goals <span className="ai-career-optional">(optional)</span></label>
            <textarea
              placeholder="e.g. I want to become a doctor or a software engineer..."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
            />
          </div>
          {error && <div className="ai-career-error"><FaExclamationTriangle /> {error}</div>}
          <button className="ai-career-submit" onClick={generate} disabled={loading}>
            {loading ? <><FaSpinner className="fa-spin" /> Analyzing your profile...</> : <><FaRoute /> Explore Careers</>}
          </button>
        </div>
      ) : (
        <div className="ai-career-results">
          <div className="ai-career-results-head">
            <h3>Your Recommended Pathways</h3>
            <button className="ai-career-reset" onClick={reset}><FaRedo /> Try again</button>
          </div>
          {result.summary && (
            <div className="ai-career-summary"><FaLightbulb /> {result.summary}</div>
          )}
          <div className="ai-career-grid">
            {result.careers.map((c, i) => (
              <div key={i} className="ai-career-card">
                <div className="ai-career-card-head">
                  <div className="ai-career-card-title">
                    <span className="ai-career-card-badge">{i + 1}</span>
                    <div>
                      <h4>{c.title}</h4>
                      <span className="ai-career-field-tag">{c.field}</span>
                    </div>
                  </div>
                  <div className="ai-career-score" style={{ color: scoreColor(c.matchScore) }}>
                    <strong>{c.matchScore}%</strong>
                    <span>match</span>
                  </div>
                </div>
                {c.description && <p className="ai-career-desc">{c.description}</p>}
                {c.subjects.length > 0 && (
                  <div className="ai-career-block">
                    <span className="ai-career-label"><FaGraduationCap /> Focus on these subjects</span>
                    <div className="ai-career-tags">
                      {c.subjects.map((s, j) => <span key={j} className="ai-career-tag">{s}</span>)}
                    </div>
                  </div>
                )}
                {c.skills.length > 0 && (
                  <div className="ai-career-block">
                    <span className="ai-career-label"><FaCheckCircle /> Skills to build now</span>
                    <div className="ai-career-tags">
                      {c.skills.map((s, j) => <span key={j} className="ai-career-tag alt">{s}</span>)}
                    </div>
                  </div>
                )}
                {c.studyPath && (
                  <div className="ai-career-block">
                    <span className="ai-career-label"><FaRoute /> Study path</span>
                    <p className="ai-career-text">{c.studyPath}</p>
                  </div>
                )}
                {c.opportunities && (
                  <div className="ai-career-block">
                    <span className="ai-career-label"><FaBriefcase /> Opportunities</span>
                    <p className="ai-career-text">{c.opportunities}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
