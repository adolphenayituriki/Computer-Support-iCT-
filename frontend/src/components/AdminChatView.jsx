import { useState, useEffect, useRef } from 'react';
import { useToast } from '../ToastContext';
import { FaComments, FaPlus, FaTrash, FaReply, FaPaperPlane, FaUser } from 'react-icons/fa';
import API_BASE from '../api';

const token = () => localStorage.getItem('cshub_token');

function api(url, opts = {}) {
  return fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...opts.headers },
    ...opts,
  }).then((r) => r.json());
}

export default function AdminChatView() {
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const msgEndRef = useRef(null);

  const fetchConvs = () => {
    api('/api/admin/conversations').then((data) => {
      if (!data.error) {
        setConversations(data);
        if (data.length > 0 && !activeId) setActiveId(data[0]._id);
      }
    });
  };

  useEffect(() => { fetchConvs(); }, []);

  useEffect(() => {
    if (activeId) {
      api('/api/admin/conversations')
        .then((convs) => {
          const found = convs.find((c) => c._id === activeId);
          if (found) setActiveConv(found);
        });
    } else {
      setActiveConv(null);
    }
  }, [activeId]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = async () => {
    if (!text.trim() || !activeId) return;
    setSending(true);
    const res = await api(`/api/admin/conversations/${activeId}/messages`, { method: 'POST', body: JSON.stringify({ text }) });
    setSending(false);
    if (res.error) return showToast(res.error, 'error');
    setText('');
    setActiveConv(res);
    fetchConvs();
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await api(`/api/admin/conversations/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    if (activeId === id) { setActiveId(null); setActiveConv(null); }
    fetchConvs();
  };

  const handleCreate = async () => {
    if (!selectedUserId) return;
    setCreating(true);
    const res = await api('/api/admin/conversations', { method: 'POST', body: JSON.stringify({ userId: selectedUserId }) });
    setCreating(false);
    if (res.error) return showToast(res.error, 'error');
    setShowNew(false);
    setSelectedUserId('');
    setActiveId(res._id);
    fetchConvs();
  };

  const openNew = () => {
    api('/api/admin/users').then((data) => {
      if (!data.error) setUsers(data);
    });
    setShowNew(true);
  };

  const activeConv2 = activeConv;

  return (
    <div className="admin-chat-wrap">
      {/* New conversation modal */}
      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3>Start Conversation</h3>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} style={{ width: '100%', margin: '1rem 0', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              <option value="">Select a user...</option>
              {users.map((u) => <option key={u.id || u._id} value={u.id || u._id}>{u.name} ({u.email})</option>)}
            </select>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" style={{ background: '#e5e7eb', color: '#374151' }} onClick={() => setShowNew(false)}>Cancel</button>
              <button className="btn btn-sm" disabled={!selectedUserId || creating} onClick={handleCreate}>{creating ? <span className="btn-spinner"></span> : 'Start'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-chat-layout">
        {/* Conversation list */}
        <div className="admin-chat-sidebar">
          <div className="admin-chat-sidebar-header">
            <h3><FaComments /> Conversations</h3>
          </div>
          <button className="admin-chat-new-btn" onClick={openNew}><FaPlus /> New Chat</button>
          <div className="admin-chat-list">
            {conversations.length === 0 ? (
              <p style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>No conversations yet. Start a new chat with a user.</p>
            ) : (
              conversations.map((c) => (
                <div
                  key={c._id}
                  className={`admin-chat-item${activeId === c._id ? ' active' : ''}`}
                  onClick={() => setActiveId(c._id)}
                >
                  <div className="admin-chat-item-avatar"><FaUser /></div>
                  <div className="admin-chat-item-info">
                    <strong>{c.userName}</strong>
                    <span>{c.userEmail}</span>
                    {c.messages.length > 0 && <small>{c.messages[c.messages.length - 1].text.slice(0, 40)}...</small>}
                  </div>
                  <button className="admin-chat-item-del" onClick={(e) => { e.stopPropagation(); handleDelete(c._id); }} disabled={deletingId === c._id}>
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="admin-chat-main">
          {!activeId || !activeConv2 ? (
            <div className="admin-chat-empty">
              <FaComments size={48} style={{ color: '#d1d5db' }} />
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              <div className="admin-chat-header">
                <FaUser /> {activeConv2.userName}
                <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 400 }}>{activeConv2.userEmail}</span>
              </div>
              <div className="admin-chat-messages">
                {activeConv2.messages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem', fontSize: '0.85rem' }}>No messages yet. Send the first message.</p>
                ) : (
                  activeConv2.messages.map((m, i) => (
                    <div key={i} className={`chat-msg ${m.sender === 'admin' ? 'chat-msg-admin' : 'chat-msg-user'}`}>
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
    </div>
  );
}
