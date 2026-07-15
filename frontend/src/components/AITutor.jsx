import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useLang } from '../LanguageContext';
import API_BASE, { AI_API_BASE } from '../api';
import {
  FaRobot, FaUser, FaPaperPlane, FaSpinner, FaComments, FaArrowLeft, FaBookOpen
} from 'react-icons/fa';

const QUICK_TOPICS = [
  'Explain fractions',
  'What is photosynthesis?',
  'How does gravity work?',
  'What is an algorithm?',
  'Tell me about atoms',
  'Grammar basics',
];

export default function AITutor() {
  const { user } = useAuth();
  const { t } = useLang();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list');
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);
  const token = () => localStorage.getItem('cshub_token');

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    return (
      <div className="ai-tutor">
        <div className="ai-tutor-header">
          <FaComments size={20} />
          <h3>AI Tutor Sessions</h3>
          <button className="btn btn-sm" onClick={startNewSession}>New Chat</button>
        </div>
        {sessions.length === 0 ? (
          <div className="ai-tutor-empty">
            <FaRobot size={48} />
            <p>No sessions yet. Start a conversation with your AI tutor!</p>
            <button className="btn" onClick={startNewSession}>Start First Chat</button>
          </div>
        ) : (
          <div className="ai-tutor-session-list">
            {sessions.map((s) => (
              <button key={s._id} className="ai-tutor-session-item" onClick={() => loadSession(s)}>
                <FaBookOpen size={16} />
                <div>
                  <strong>{s.subject || 'General'}</strong>
                  <small>{s.totalMessages} messages — {new Date(s.createdAt).toLocaleDateString()}</small>
                </div>
              </button>
            ))}
          </div>
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
          {activeSession && <small>{activeSession.subject || 'General'}</small>}
        </div>
      </div>

      <div className="ai-tutor-messages">
        {messages.length === 0 && (
          <div className="ai-tutor-welcome">
            <FaRobot size={40} />
            <h4>Hi! I'm your AI Tutor</h4>
            <p>Ask me anything about Mathematics, Physics, Chemistry, Biology, Computer Science, English, or Geography.</p>
            <div className="ai-tutor-quick-topics">
              {QUICK_TOPICS.map((topic) => (
                <button key={topic} className="ai-tutor-quick-btn" onClick={() => sendMessage(topic)}>
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`ai-tutor-msg ${msg.role}`}>
            <div className="ai-tutor-msg-icon">
              {msg.role === 'user' ? <FaUser size={14} /> : <FaRobot size={14} />}
            </div>
            <div className="ai-tutor-msg-content">
              {msg.content.split('\n').map((line, j) => (
                <p key={j}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="ai-tutor-msg assistant">
            <div className="ai-tutor-msg-icon"><FaRobot size={14} /></div>
            <div className="ai-tutor-msg-content ai-tutor-typing">
              <FaSpinner className="fa-spin" /> Thinking...
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
          {loading ? <FaSpinner className="fa-spin" /> : <FaPaperPlane />}
        </button>
      </div>
    </div>
  );
}
