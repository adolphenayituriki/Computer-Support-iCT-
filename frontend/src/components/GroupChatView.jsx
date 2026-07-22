import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaUsers, FaPaperPlane, FaExclamationCircle, FaRedo } from 'react-icons/fa';
import API_BASE from '../api';

const token = () => localStorage.getItem('cshub_token');

function apiFetch(url, opts = {}) {
  return fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...opts.headers },
    ...opts,
  }).then((r) => r.json());
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return isToday ? time : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
}

const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#f97316'];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  return (name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function GroupChatView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retries, setRetries] = useState(0);
  const prevCountRef = useRef(0);
  const msgEndRef = useRef(null);
  const inputRef = useRef(null);
  const retryTimerRef = useRef(null);

  const fetchChat = useCallback(async () => {
    try {
      const data = await apiFetch('/api/group-chat');
      if (data && !data.error) {
        setChat(data);
        setError(null);
        setRetries(0);
      } else if (data?.error) {
        setError(data.error);
      }
    } catch {
      setError('Could not connect to server. The backend may be starting up.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchChat(); }, [fetchChat]);

  useEffect(() => {
    if (error && retries < 5) {
      const delay = Math.min(1000 * Math.pow(2, retries), 30000);
      retryTimerRef.current = setTimeout(() => {
        setRetries((r) => r + 1);
        fetchChat();
      }, delay);
      return () => clearTimeout(retryTimerRef.current);
    }
  }, [error, retries, fetchChat]);

  useEffect(() => {
    if (!error && !loading) {
      const interval = setInterval(fetchChat, 4000);
      return () => clearInterval(interval);
    }
  }, [error, loading, fetchChat]);

  useEffect(() => {
    if (msgEndRef.current) {
      msgEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.messages?.length]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const msg = text.trim();
    setText('');
    setSending(true);
    try {
      const res = await apiFetch('/api/group-chat/messages', { method: 'POST', body: JSON.stringify({ text: msg }) });
      if (res.error) {
        setText(msg);
        return showToast(res.error, 'error');
      }
      setChat(res);
      setError(null);
    } catch {
      setText(msg);
      showToast('Failed to send — server may be starting up. Try again in a moment.', 'error');
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleRetry = () => {
    setRetries(0);
    setError(null);
    setLoading(true);
    fetchChat();
  };

  if (loading) {
    return (
      <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="uc-chat-wrap">
          <div className="uc-chat-header"><FaUsers /> CS Hub Community</div>
          <div className="uc-chat-loading">
            <div className="btn-spinner" style={{ width: '22px', height: '22px' }} />
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.75rem' }}>Connecting to server...</p>
          </div>
        </div>
      </div>
    );
  }

  const myId = user?.id || user?._id;

  return (
    <div className="dash-card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="uc-chat-wrap">
        <div className="uc-chat-header">
          <FaUsers /> CS Hub Community
          <span className="uc-chat-status uc-chat-status--live"><span className="uc-live-dot" /> Live</span>
        </div>

        {error && (
          <div className="uc-chat-error">
            <FaExclamationCircle />
            <div style={{ flex: 1 }}>
              <strong>Connection issue</strong>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>{error}</p>
              {retries > 0 && retries < 5 && (
                <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.6, marginTop: '2px' }}>
                  Retrying in a moment... (attempt {retries}/5)
                </p>
              )}
            </div>
            <button onClick={handleRetry}><FaRedo /> Retry</button>
          </div>
        )}

        <div className="uc-chat-messages">
          {(!chat?.messages || chat.messages.length === 0) ? (
            <div className="uc-chat-empty">
              <div className="uc-chat-empty-icon uc-chat-empty-icon--green"><FaUsers size={26} /></div>
              <p className="uc-chat-empty-title">Welcome to CS Hub Community!</p>
              <p className="uc-chat-empty-sub">Be the first to start the conversation.</p>
            </div>
          ) : (
            chat.messages.map((m, i) => {
              const isMine = m.sender === myId || m.sender === user?.email;
              const prevMsg = i > 0 ? chat.messages[i - 1] : null;
              const sameSender = prevMsg && prevMsg.sender === m.sender;
              return (
                <div key={i} className={`uc-msg ${isMine ? 'uc-msg-sent' : 'uc-msg-received'} ${sameSender ? 'uc-msg-consecutive' : ''}`}>
                  {!sameSender && (
                    <div className="uc-msg-avatar" style={{ background: getAvatarColor(m.senderName) }}>
                      {getInitials(m.senderName)}
                    </div>
                  )}
                  <div className="uc-msg-body">
                    {!sameSender && <div className="uc-msg-sender">{isMine ? 'You' : (m.senderName || 'Unknown')}</div>}
                    <div className="uc-msg-text">{m.text}</div>
                    <div className="uc-msg-time">{formatTime(m.createdAt)}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={msgEndRef} />
        </div>

        <div className="uc-chat-input">
          <input
            ref={inputRef}
            type="text"
            placeholder="Say something to the community..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            autoFocus
          />
          <button
            className="uc-send-btn"
            disabled={sending || !text.trim()}
            onClick={handleSend}
            title="Send"
          >
            {sending ? <span className="btn-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> : <FaPaperPlane />}
          </button>
        </div>
      </div>
    </div>
  );
}
