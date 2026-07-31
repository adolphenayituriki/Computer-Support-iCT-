import { useState } from 'react';
import { AI_API_BASE } from '../api';
import AIMarkdown from './AIMarkdown';
import {
  FaChalkboardTeacher, FaSpinner, FaFileDownload, FaCopy, FaCheck,
  FaRegFileAlt, FaClipboardList, FaFileSignature, FaSlideshare, FaClipboardCheck,
  FaExclamationTriangle
} from 'react-icons/fa';

const DOC_TYPES = [
  { key: 'lessonPlan', label: 'Lesson Plan', icon: <FaRegFileAlt />, hint: 'Objectives, structure & assessment' },
  { key: 'worksheet', label: 'Worksheet', icon: <FaClipboardList />, hint: 'Practice questions + answer key' },
  { key: 'exam', label: 'Exam / Test', icon: <FaFileSignature />, hint: 'Full paper with marking scheme' },
  { key: 'presentation', label: 'Presentation', icon: <FaSlideshare />, hint: 'Slide-by-slide outline' },
  { key: 'markingGuide', label: 'Marking Guide', icon: <FaClipboardCheck />, hint: 'Rubric & feedback criteria' },
];

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Kinyarwanda', 'French', 'Geography', 'History'];
const LEVELS = ['Primary', 'Secondary O-Level', 'Secondary A-Level', 'University'];

export default function AITeacherAssistant() {
  const [docType, setDocType] = useState('lessonPlan');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Secondary O-Level');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const token = () => localStorage.getItem('cshub_token');

  const generate = async () => {
    if (loading) return;
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/teacher/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          type: docType,
          subject,
          topic,
          level,
          count: ['worksheet', 'exam'].includes(docType) ? count : 0,
        }),
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

  const copyDoc = async () => {
    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const downloadDoc = () => {
    const blob = new Blob([result.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/[^a-z0-9]+/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ai-teacher">
      <div className="ai-dash-page-header">
        <span className="ai-dash-page-header-icon" style={{ backgroundColor: '#8b5cf61f', color: '#8b5cf6' }}><FaChalkboardTeacher /></span>
        <div>
          <h2>AI Teacher Assistant</h2>
          <p>Generate lesson plans, worksheets, exams and marking guides for your classes.</p>
        </div>
      </div>

      <div className="ai-teacher-form">
        <div className="ai-teacher-field">
          <label>Document type</label>
          <div className="ai-teacher-types">
            {DOC_TYPES.map((d) => (
              <button
                key={d.key}
                type="button"
                className={`ai-teacher-type${docType === d.key ? ' active' : ''}`}
                onClick={() => setDocType(d.key)}
              >
                <span className="ai-teacher-type-icon">{d.icon}</span>
                <strong>{d.label}</strong>
                <small>{d.hint}</small>
              </button>
            ))}
          </div>
        </div>
        <div className="ai-teacher-row">
          <div className="ai-teacher-field">
            <label>Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="ai-teacher-field">
            <label>Class level</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="ai-teacher-row">
          <div className="ai-teacher-field grow">
            <label>Topic</label>
            <input
              type="text"
              placeholder="e.g. Photosynthesis, Quadratic Equations, The Water Cycle..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          {['worksheet', 'exam'].includes(docType) && (
            <div className="ai-teacher-field narrow">
              <label>Number of questions</label>
              <input type="number" min={5} max={50} value={count} onChange={(e) => setCount(e.target.value)} />
            </div>
          )}
        </div>
        {error && <div className="ai-teacher-error"><FaExclamationTriangle /> {error}</div>}
        <button className="ai-teacher-submit" onClick={generate} disabled={loading}>
          {loading ? <><FaSpinner className="fa-spin" /> Generating your document...</> : <><FaChalkboardTeacher /> Generate Document</>}
        </button>
      </div>

      {loading && <div className="topic-loading-bar"><div className="topic-loading-bar-fill" /></div>}

      {result && (
        <div className="ai-teacher-doc">
          <div className="ai-teacher-doc-head">
            <h3>{result.title}</h3>
            <div className="ai-teacher-doc-actions">
              <button className="ai-teacher-doc-btn" onClick={copyDoc}>
                {copied ? <><FaCheck /> Copied</> : <><FaCopy /> Copy</>}
              </button>
              <button className="ai-teacher-doc-btn primary" onClick={downloadDoc}>
                <FaFileDownload /> Download .md
              </button>
            </div>
          </div>
          <div className="ai-teacher-doc-body">
            <AIMarkdown>{result.content}</AIMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
