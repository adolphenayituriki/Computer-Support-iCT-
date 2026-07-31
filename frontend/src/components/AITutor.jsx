import { useState, useRef, useEffect, Fragment } from 'react';
import { useAuth } from '../AuthContext';
import { useLang } from '../LanguageContext';
import API_BASE, { AI_API_BASE } from '../api';
import AIMarkdown from './AIMarkdown';
import {
  FaRobot, FaUser, FaPaperPlane, FaComments, FaArrowLeft, FaBookOpen,
  FaCopy, FaCheck, FaGraduationCap, FaRegLightbulb, FaChevronRight, FaSearch
} from 'react-icons/fa';

const QUICK_TOPICS = [
  'Explain fractions',
  'What is photosynthesis?',
  'How does gravity work?',
  'What is an algorithm?',
  'Tell me about atoms',
  'Grammar basics',
];

const WELCOME_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'French', 'Kinyarwanda'];

const SUBJECT_COLORS = {
  Mathematics: '#FFCE08',
  Physics: '#5694F7',
  Chemistry: '#10b981',
  Biology: '#8b5cf6',
  'Computer Science': '#06b6d4',
  English: '#f59e0b',
  French: '#ec4899',
  Kinyarwanda: '#ef4444',
  Geography: '#14b8a6',
  History: '#d946ef',
  General: '#64748b',
};

const timeAgo = (date) => {
  const d = new Date(date);
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

const sessionGroupLabel = (date) => {
  const d = new Date(date);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfDay = new Date(d);
  startOfDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((startOfToday - startOfDay) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 6) return 'This week';
  return 'Earlier';
};

const lastMessagePreview = (s) => {
  const msgs = s.messages || [];
  const last = msgs[msgs.length - 1];
  if (!last?.content) return 'No messages yet — tap to start chatting';
  const text = String(last.content).replace(/\s+/g, ' ').trim();
  const prefix = last.role === 'user' ? 'You: ' : '';
  return prefix + (text.length > 70 ? text.slice(0, 70) + '…' : text);
};

function TypingDots() {
  return (
    <span className="ai-tutor-typing-dots">
      <span /><span /><span />
    </span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button className={`ai-tutor-copy-btn${copied ? ' copied' : ''}`} onClick={copy} title="Copy response">
      {copied ? <FaCheck /> : <FaCopy />}
    </button>
  );
}

export default function AITutor() {
  const { user } = useAuth();
  const { t } = useLang();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list');
  const [dotTick, setDotTick] = useState(0);
  const [sessionQuery, setSessionQuery] = useState('');
  const [sessionSubject, setSessionSubject] = useState('All');
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);
  const token = () => localStorage.getItem('cshub_token');

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setDotTick((n) => (n + 1) % 4), 350);
    return () => clearInterval(t);
  }, [loading]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/sessions`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {}
  };

  const startNewSession = () => {
    setActiveSession(null);
    setMessages([]);
    setView('chat');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const loadSession = async (session) => {
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/sessions/${session._id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSession(data);
        setMessages(data.messages || []);
        setView('chat');
      }
    } catch {}
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          message: msg,
          sessionId: activeSession?._id,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        if (!activeSession) {
          setActiveSession({ _id: data.sessionId, subject: data.subject });
        }
        fetchSessions();
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Could not reach the server. Please check your connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (view === 'list') {
    const totalMessages = sessions.reduce((acc, s) => acc + (s.totalMessages || 0), 0);
    const availableSubjects = ['All', ...Array.from(new Set(sessions.map((s) => s.subject || 'General')))];
    const filteredSessions = sessions.filter((s) => {
      const q = sessionQuery.trim().toLowerCase();
      const matchesQuery = !q || `${s.subject || 'General'} ${lastMessagePreview(s)}`.toLowerCase().includes(q);
      const matchesSubject = sessionSubject === 'All' || (s.subject || 'General') === sessionSubject;
      return matchesQuery && matchesSubject;
    });
    const groups = filteredSessions.reduce((acc, s) => {
      const label = sessionGroupLabel(s.createdAt);
      if (!acc[label]) acc[label] = [];
      acc[label].push(s);
      return acc;
    }, {});
    const groupOrder = ['Today', 'Yesterday', 'This week', 'Earlier'];

    return (
      <div className="ai-tutor">
        <div className="ai-tutor-header">
          <FaComments size={20} />
          <div className="ai-tutor-header-info">
            <h3>AI Tutor Sessions</h3>
            <span>{sessions.length} conversation{sessions.length === 1 ? '' : 's'} · {totalMessages} messages</span>
          </div>
          <button className="btn btn-sm" onClick={startNewSession}>New Chat</button>
        </div>
        {sessions.length === 0 ? (
          <div className="ai-tutor-empty">
            <FaRobot size={48} />
            <p>No sessions yet. Start a conversation with your AI tutor!</p>
            <button className="btn" onClick={startNewSession}>Start First Chat</button>
            <div className="ai-tutor-empty-topics">
              {QUICK_TOPICS.slice(0, 3).map((topic) => (
                <button key={topic} className="ai-tutor-quick-btn" onClick={() => { startNewSession(); setTimeout(() => sendMessage(topic), 50); }}>
                  <FaRegLightbulb size={12} /> {topic}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="ai-tutor-filter-bar">
              <div className="ai-tutor-filter-search">
                <FaSearch size={12} />
                <input
                  type="text"
                  value={sessionQuery}
                  onChange={(e) => setSessionQuery(e.target.value)}
                  placeholder={`Filter ${sessions.length} conversations...`}
                />
              </div>
              <div className="ai-tutor-filter-chips">
                {availableSubjects.map((sub) => {
                  const c = SUBJECT_COLORS[sub] || SUBJECT_COLORS.General;
                  const active = sessionSubject === sub;
                  return (
                    <button
                      key={sub}
                      className={`ai-tutor-filter-chip${active ? ' active' : ''}`}
                      onClick={() => setSessionSubject(sub)}
                      style={{ color: c, borderColor: c + (active ? 'aa' : '55'), backgroundColor: active ? c + '1a' : 'transparent' }}
                    >{sub}</button>
                  );
                })}
              </div>
            </div>
            {filteredSessions.length === 0 ? (
              <div className="ai-tutor-empty">
                <FaSearch size={40} />
                <p>No sessions match your filter{sessionQuery.trim() ? ` for "${sessionQuery.trim()}"` : ''}.</p>
                <button className="btn btn-sm" onClick={() => { setSessionQuery(''); setSessionSubject('All'); }}>Clear filters</button>
              </div>
            ) : (
              <div className="ai-tutor-session-list">
                <table className="ai-tutor-table">
                  <thead>
                    <tr>
                      <th className="ai-tutor-th-subject">Subject</th>
                      <th className="ai-tutor-th-preview">Last message</th>
                      <th className="ai-tutor-th-msgs">Msgs</th>
                      <th className="ai-tutor-th-time">When</th>
                      <th className="ai-tutor-th-action"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupOrder.filter((label) => groups[label]).map((label) => (
                      <Fragment key={label}>
                        <tr className="ai-tutor-table-group">
                          <td colSpan={5}>{label}</td>
                        </tr>
                        {groups[label].map((s) => {
                          const color = SUBJECT_COLORS[s.subject] || SUBJECT_COLORS.General;
                          return (
                            <tr key={s._id} className="ai-tutor-table-row" onClick={() => loadSession(s)}>
                              <td className="ai-tutor-td-subject">
                                <div className="ai-tutor-td-subject-inner">
                                  <span className="ai-tutor-session-icon" style={{ backgroundColor: color + '1f', color }}>
                                    <FaBookOpen size={13} />
                                  </span>
                                  <strong>{s.subject || 'General'}</strong>
                                </div>
                              </td>
                              <td className="ai-tutor-td-preview">{lastMessagePreview(s)}</td>
                              <td className="ai-tutor-td-msgs">
                                <span className="ai-tutor-session-count" style={{ color }}><FaComments size={10} /> {s.totalMessages}</span>
                              </td>
                              <td className="ai-tutor-td-time">{timeAgo(s.createdAt)}</td>
                              <td className="ai-tutor-td-action"><FaChevronRight size={12} /></td>
                            </tr>
                          );
                        })}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="ai-tutor">
      <div className="ai-tutor-chat-header">
        <button className="ai-tutor-back" onClick={() => { setView('list'); fetchSessions(); }}>
          <FaArrowLeft />
        </button>
        <FaRobot size={20} className="ai-tutor-avatar-icon" />
        <div>
          <strong>AI Tutor</strong>
          {activeSession && (
            <span
              className="ai-tutor-subject-badge"
              style={{ color: SUBJECT_COLORS[activeSession.subject] || SUBJECT_COLORS.General, borderColor: (SUBJECT_COLORS[activeSession.subject] || SUBJECT_COLORS.General) + '55', backgroundColor: (SUBJECT_COLORS[activeSession.subject] || SUBJECT_COLORS.General) + '12' }}
            >{activeSession.subject || 'General'}</span>
          )}
        </div>
      </div>

      <div className="ai-tutor-messages">
        {messages.length === 0 && (
          <div className="ai-tutor-welcome">
            <div className="ai-tutor-welcome-bot">
              <FaRobot size={40} />
            </div>
            <h4>Hi! I'm your AI Tutor</h4>
            <p>Ask me anything about your subjects — Mathematics, Physics, Chemistry, Biology, Computer Science, English, French, or Kinyarwanda.</p>
            <div className="ai-tutor-welcome-chips">
              {WELCOME_SUBJECTS.map((s) => (
                <span
                  key={s}
                  className="ai-tutor-welcome-chip"
                  style={{ color: SUBJECT_COLORS[s], borderColor: SUBJECT_COLORS[s] + '55', backgroundColor: SUBJECT_COLORS[s] + '12' }}
                >{s}</span>
              ))}
            </div>
            <div className="ai-tutor-quick-topics">
              {QUICK_TOPICS.map((topic) => (
                <button key={topic} className="ai-tutor-quick-btn" onClick={() => sendMessage(topic)}>
                  <FaRegLightbulb size={12} /> {topic}
                </button>
              ))}
            </div>
            <div className="ai-tutor-welcome-tip">
              <FaGraduationCap size={14} />
              Pro tip: math like matrices renders beautifully — try "teach me matrices"
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`ai-tutor-msg ${msg.role}`}>
            <div className="ai-tutor-msg-icon">
              {msg.role === 'user' ? <FaUser size={14} /> : <FaRobot size={14} />}
            </div>
            <div className="ai-tutor-msg-body">
              <div className="ai-tutor-msg-content">
                {msg.role === 'assistant' ? (
                  <AIMarkdown>{msg.content}</AIMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              {msg.role === 'assistant' && <CopyButton text={msg.content} />}
            </div>
          </div>
        ))}
        {loading && (
          <div className="ai-tutor-msg assistant">
            <div className="ai-tutor-msg-icon"><FaRobot size={14} /></div>
            <div className="ai-tutor-msg-content ai-tutor-typing">
              <TypingDots />
              <span className="ai-tutor-typing-label">{'Thinking' + '.'.repeat(dotTick)}</span>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      <div className="ai-tutor-input-area">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button className="ai-tutor-send" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
          <FaPaperPlane />
        </button>
      </div>
      <div className="ai-tutor-footer">
        <span>Powered by <strong>Gemini AI</strong></span>
        <span className="ai-tutor-footer-dot">•</span>
        <span>Press Enter to send</span>
      </div>
    </div>
  );
}
