import { useState, useEffect, useRef } from 'react';
import { useToast } from '../ToastContext';
import { FaComments, FaPlus, FaPaperPlane, FaTicketAlt, FaLightbulb } from 'react-icons/fa';
import API_BASE from '../api';

const token = () => localStorage.getItem('cshub_token');

function api(url, opts = {}) {
  return fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...opts.headers },
    ...opts,
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) return { error: data.error || `Request failed (${r.status})` };
    return data;
  });
}

export default function AdminChatView() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const msgEndRef = useRef(null);

  const fetchAll = async () => {
    setLoading(true);
    const [direct, suggestions, tickets] = await Promise.all([
      api('/api/admin/conversations'),
      api('/api/admin/suggestions'),
      api('/api/admin/tickets'),
    ]);

    const all = [];

    if (!direct.error) {
      for (const c of direct) {
        all.push({
          _id: c._id,
          type: 'direct',
          userId: c.userId,
          userName: c.userName,
          userEmail: c.userEmail,
          title: 'Direct Message',
          status: null,
          messages: c.messages || [],
          lastMsg: c.messages?.length > 0 ? c.messages[c.messages.length - 1] : null,
          lastActivity: c.lastActivity || c.createdAt,
        });
      }
    }

    if (!suggestions.error) {
      for (const s of suggestions) {
        if (s.messages && s.messages.length > 0) {
          all.push({
            _id: s._id,
            type: 'suggestion',
            userId: s.userId,
            userName: s.userName,
            userEmail: '',
            title: s.title,
            status: s.status,
            messages: s.messages || [],
            lastMsg: s.messages[s.messages.length - 1],
            lastActivity: s.messages[s.messages.length - 1]?.createdAt || s.createdAt,
          });
        }
      }
    }

    if (!tickets.error) {
      for (const t of tickets) {
        if (t.messages && t.messages.length > 0) {
          all.push({
            _id: t._id,
            type: 'ticket',
            userId: t.userId,
            userName: t.userName,
            userEmail: '',
            title: t.title,
            status: t.status,
            messages: t.messages || [],
            lastMsg: t.messages[t.messages.length - 1],
            lastActivity: t.messages[t.messages.length - 1]?.createdAt || t.createdAt,
          });
        }
      }
    }

    all.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    setItems(all);
    setLoading(false);

    if (all.length > 0 && !activeId) {
      setActiveId(all[0]._id);
      setActiveType(all[0].type);
      setActiveConv(all[0]);
    }
  };

  useEffect(() => {
    fetchAll();
    const h = (e) => {
      setActiveId(e.detail.id);
      setActiveType(e.detail.type || 'direct');
      fetchAll();
    };
    window.addEventListener('opencode-select-conversation', h);
    return () => window.removeEventListener('opencode-select-conversation', h);
  }, []);

  useEffect(() => {
    if (activeId && activeType) {
      const found = items.find((i) => i._id === activeId && i.type === activeType);
      if (found) setActiveConv(found);
    } else {
      setActiveConv(null);
    }
  }, [activeId, activeType, items]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = async () => {
    if (!text.trim() || !activeId || !activeType) return;
    setSending(true);

    let endpoint = '';
    if (activeType === 'direct') endpoint = `/api/admin/conversations/${activeId}/messages`;
    else if (activeType === 'suggestion') endpoint = `/api/admin/suggestions/${activeId}/messages`;
    else if (activeType === 'ticket') endpoint = `/api/admin/tickets/${activeId}/messages`;

    const res = await api(endpoint, { method: 'POST', body: JSON.stringify({ text }) });
    setSending(false);
    if (res.error) return showToast(res.error, 'error');
    setText('');
    fetchAll();
  };

  const handleCreate = async () => {
    if (!selectedUserId) return;
    setCreating(true);
    const res = await api('/api/admin/conversations', { method: 'POST', body: JSON.stringify({ userId: selectedUserId }) });
    setCreating(false);
    if (res.error) return showToast(res.error, 'error');
    const conv = {
      _id: res._id,
      type: 'direct',
      userId: res.userId,
      userName: res.userName,
      userEmail: res.userEmail,
      title: 'Direct Message',
      status: null,
      messages: res.messages || [],
      lastMsg: null,
      lastActivity: res.lastActivity || res.createdAt,
    };
    setItems((prev) => [conv, ...prev]);
    setActiveId(conv._id);
    setActiveType('direct');
    setActiveConv(conv);
    setShowNew(false);
    setSelectedUserId('');
  };

  const openNew = async () => {
    setShowNew(true);
    setLoadingUsers(true);
    const data = await api('/api/admin/users');
    setLoadingUsers(false);
    if (data.error) {
      showToast(data.error, 'error');
      setUsers([]);
    } else {
      setUsers(data);
    }
  };

  const handleSelect = (item) => {
    setActiveId(item._id);
    setActiveType(item.type);
    setActiveConv(item);
  };

  const typeIcon = (type) => {
    if (type === 'direct') return <FaComments style={{ color: '#3b82f6' }} />;
    if (type === 'suggestion') return <FaLightbulb style={{ color: '#f59e0b' }} />;
    return <FaTicketAlt style={{ color: '#10b981' }} />;
  };

  const typeLabel = (type) => {
    if (type === 'direct') return 'Chat';
    if (type === 'suggestion') return 'Suggestion';
    return 'Ticket';
  };

  const statusColor = (s) => {
    const m = {
      pending: '#b45309', reviewed: '#1d4ed8', implemented: '#047857',
      open: '#1d4ed8', 'in-progress': '#b45309', resolved: '#047857', closed: '#4b5563',
    };
    return m[s] || '#6b7280';
  };

  return (
    <div className="admin-chat-wrap">
      {showNew && (
        <div className="modal-overlay" onClick={() => setShowNew(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3>Start Direct Conversation</h3>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} disabled={loadingUsers} style={{ width: '100%', margin: '1rem 0', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
              <option value="">{loadingUsers ? 'Loading users...' : 'Select a user...'}</option>
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
        <div className="admin-chat-sidebar">
          <div className="admin-chat-sidebar-header">
            <h3><FaComments /> All Conversations</h3>
          </div>
          <button className="admin-chat-new-btn" onClick={openNew}><FaPlus /> New Direct Chat</button>
          <div className="admin-chat-list">
            {loading ? (
              <p style={{ padding: '1rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</p>
            ) : items.length === 0 ? (
              <p style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center' }}>
                No conversations yet. Messages from suggestions and tickets will appear here automatically.
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.type}-${item._id}`}
                  className={`admin-chat-item${activeId === item._id && activeType === item.type ? ' active' : ''}`}
                  onClick={() => handleSelect(item)}
                >
                  <div className="admin-chat-item-avatar">{typeIcon(item.type)}</div>
                  <div className="admin-chat-item-info">
                    <strong>{item.userName}</strong>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                      <span className="admin-chat-type-badge" style={{ background: item.type === 'direct' ? '#dbeafe' : item.type === 'suggestion' ? '#fef3c7' : '#d1fae5', color: item.type === 'direct' ? '#1d4ed8' : item.type === 'suggestion' ? '#b45309' : '#047857' }}>{typeLabel(item.type)}</span>
                      {item.status && <span style={{ fontSize: '0.65rem', color: statusColor(item.status), fontWeight: 600 }}>{item.status}</span>}
                    </span>
                    <small>{item.lastMsg ? item.lastMsg.text.slice(0, 45) : item.title.slice(0, 45)}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-chat-main">
          {!activeConv ? (
            <div className="admin-chat-empty">
              <FaComments size={48} style={{ color: '#d1d5db' }} />
              <p>{loading ? 'Loading...' : 'Select a conversation to start chatting'}</p>
            </div>
          ) : (
            <>
              <div className="admin-chat-header">
                {typeIcon(activeConv.type)}
                {activeConv.userName}
                <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 400, marginLeft: '0.3rem' }}>
                  {activeConv.title}
                  {activeConv.status && <> &middot; {activeConv.status}</>}
                </span>
              </div>
              <div className="admin-chat-messages">
                {activeConv.messages.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem', fontSize: '0.85rem' }}>No messages yet. Send the first message.</p>
                ) : (
                  activeConv.messages.map((m, i) => (
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
