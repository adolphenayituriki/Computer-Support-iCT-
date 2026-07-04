import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaComments, FaPaperPlane } from 'react-icons/fa';
import API_BASE from '../api';

const token = () => localStorage.getItem('cshub_token');

function api(url, opts = {}) {
  return fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...opts.headers },
    ...opts,
  }).then((r) => r.json());
}

export default function UserChatView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [conv, setConv] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const msgEndRef = useRef(null);

  const fetchConv = () => {
    api('/api/conversations').then((data) => {
      if (!data.error) setConv(data);
    });
  };

  useEffect(() => { fetchConv(); }, []);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages]);

  const handleSend = async () => {
    if (!text.trim() || !conv) return;
    setSending(true);
    const res = await api(`/api/conversations/${conv._id}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
    setSending(false);
    if (res.error) return showToast(res.error, 'error');
    setText('');
    setConv(res);
  };

  return (
    <div className="user-chat-wrap">
      <div className="user-chat-main">
        <div className="admin-chat-header">
          <FaComments /> Messages with Admin
        </div>
        {!conv ? (
          <div className="admin-chat-empty">
            <FaComments size={48} style={{ color: '#d1d5db' }} />
            <p>No conversation yet. The admin will contact you here.</p>
            <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>You can also start by submitting a support ticket or suggestion.</p>
          </div>
        ) : (
          <>
            <div className="admin-chat-messages">
              {conv.messages.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem', fontSize: '0.85rem' }}>No messages yet. Say hello!</p>
              ) : (
                conv.messages.map((m, i) => (
                  <div key={i} className={`chat-msg ${m.sender === 'user' ? 'chat-msg-admin' : 'chat-msg-user'}`}>
                    <div className="chat-msg-sender">{m.senderName}</div>
                    <div className="chat-msg-text">{m.text}</div>
                    <div className="chat-msg-time">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                ))
              )}
              <div ref={msgEndRef} />
            </div>
            <div className="admin-chat-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <button className="btn btn-sm" disabled={sending || !text.trim()} onClick={handleSend}>
                {sending ? <span className="btn-spinner"></span> : <FaPaperPlane />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
