import { useState, useEffect, useRef } from 'react';
import AdminChatView from './AdminChatView';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaTicketAlt, FaUsers, FaLightbulb, FaEnvelope, FaUserTie, FaTrash, FaCheckCircle, FaUndo, FaTimes, FaEye, FaEyeSlash, FaSave, FaEdit, FaPlus, FaSearch, FaCheck, FaBan, FaReply, FaComments, FaNewspaper, FaImage, FaYoutube } from 'react-icons/fa';
import API_BASE from '../api';

const token = () => localStorage.getItem('cshub_token');
const TICKET_STATUSES = ['open', 'in-progress', 'resolved', 'closed'];
const SUGGESTION_STATUSES = ['pending', 'reviewed', 'implemented'];
const CONTACT_STATUSES = ['new', 'read', 'responded'];
const TEAM_STATUSES = ['pending', 'approved', 'rejected'];

function api(url, opts = {}) {
  return fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...opts.headers },
    ...opts,
  }).then((r) => r.json());
}

function StatusBadge({ status, type }) {
  const colors = {
    open: { bg: '#dbeafe', color: '#1d4ed8' },
    'in-progress': { bg: '#fef3c7', color: '#b45309' },
    resolved: { bg: '#d1fae5', color: '#047857' },
    closed: { bg: '#e5e7eb', color: '#4b5563' },
    pending: { bg: '#fef3c7', color: '#b45309' },
    reviewed: { bg: '#dbeafe', color: '#1d4ed8' },
    implemented: { bg: '#d1fae5', color: '#047857' },
    new: { bg: '#fee2e2', color: '#dc2626' },
    read: { bg: '#dbeafe', color: '#1d4ed8' },
    responded: { bg: '#d1fae5', color: '#047857' },
    approved: { bg: '#d1fae5', color: '#047857' },
    rejected: { bg: '#fee2e2', color: '#dc2626' },
  };
  const c = colors[status] || { bg: '#e5e7eb', color: '#4b5563' };
  return <span style={{ background: c.bg, color: c.color, padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{status}</span>;
}

function CreateTicketModal({ onClose, onCreated }) {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ userId: '', title: '', description: '', category: 'general', status: 'open' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/api/admin/users').then(setUsers).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return showToast('Title and description required.', 'error');
    setLoading(true);
    const res = await api('/api/admin/tickets', { method: 'POST', body: JSON.stringify(form) });
    setLoading(false);
    if (res.error) return showToast(res.error, 'error');
    showToast('Ticket created.');
    onCreated();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Create Ticket</h3>
          <button className="ticket-action-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} style={{ width: '100%', marginBottom: '0.7rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
            <option value="">Assign to yourself (Admin)</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="general">General</option><option value="hardware">Hardware</option><option value="software">Software</option>
            <option value="virus">Virus / Malware</option><option value="network">Network</option><option value="training">Training</option>
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea rows="3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>{loading ? <><span className="btn-spinner"></span> Creating...</> : <><FaPlus /> Create Ticket</>}</button>
        </form>
      </div>
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', isAdmin: false });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return showToast('All fields required.', 'error');
    setLoading(true);
    const res = await api('/api/admin/users', { method: 'POST', body: JSON.stringify(form) });
    setLoading(false);
    if (res.error) return showToast(res.error, 'error');
    showToast('User created.');
    onCreated();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Create User</h3>
          <button className="ticket-action-btn" onClick={onClose}><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <div className="pwd-wrapper">
            <input type={showPwd ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.5rem' }}>
            <input type="checkbox" checked={form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} />
            Admin privileges
          </label>
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>{loading ? <><span className="btn-spinner"></span> Creating...</> : <><FaPlus /> Create User</>}</button>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ item, type, onClose, onUpdated }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ ...item });
  const [saving, setSaving] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [currentItem, setCurrentItem] = useState(item);
  const msgEndRef = useRef(null);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [currentItem?.messages]);

  const handleUpdate = async () => {
    setSaving(true);
    const urlMap = {
      suggestion: `${API_BASE}/api/admin/suggestions/${item.id}`,
      contact: `${API_BASE}/api/admin/contacts/${item.id}`,
      team: `${API_BASE}/api/admin/team-apps/${item.id}`,
    };
    const res = await api(urlMap[type], { method: 'PUT', body: JSON.stringify(form) });
    setSaving(false);
    if (res.error) return showToast(res.error, 'error');
    showToast('Updated.');
    onUpdated();
    onClose();
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    const res = await fetch(`${API_BASE}/api/admin/${type === 'suggestion' ? 'suggestions' : 'tickets'}/${item.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ text: replyText }),
    });
    const data = await res.json();
    if (res.ok) {
      setCurrentItem(data);
      setReplyText('');
    } else {
      showToast('Failed to send.', 'error');
    }
    setSendingReply(false);
  };

  const statusOpts = {
    suggestion: SUGGESTION_STATUSES,
    contact: CONTACT_STATUSES,
    team: TEAM_STATUSES,
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>{item.userName || item.name || item.title}</h3>
          <button className="ticket-action-btn" onClick={onClose}><FaTimes /></button>
        </div>
        {type === 'suggestion' && (
          <>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.5rem' }}><strong>{currentItem.title}</strong></p>
            <p style={{ lineHeight: '1.6', color: '#334155', marginBottom: '1rem' }}>{currentItem.description}</p>
            <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: '100%', marginBottom: '0.7rem' }}>
              {statusOpts[type].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn" style={{ width: '100%', marginBottom: '1rem' }} disabled={saving} onClick={handleUpdate}>{saving ? <><span className="btn-spinner"></span> Saving...</> : <><FaSave /> Save</>}</button>
            <h5 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaReply style={{ transform: 'scaleX(-1)' }} /> Conversation</h5>
            <div className="msg-thread" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '0.7rem' }}>
              {(currentItem.messages || []).length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: '#9ca3af', textAlign: 'center', padding: '0.5rem 0' }}>No messages yet.</p>
              ) : (
                currentItem.messages.map((m, i) => (
                  <div key={i} className={`msg-bubble ${m.sender === 'admin' ? 'msg-admin' : 'msg-user'}`}>
                    <div className="msg-header">
                      <strong>{m.senderName}</strong>
                      <span>{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <p>{m.text}</p>
                  </div>
                ))
              )}
              <div ref={msgEndRef} />
            </div>
            <div className="msg-reply-form">
              <input
                type="text"
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
              />
              <button className="btn btn-sm" disabled={sendingReply || !replyText.trim()} onClick={handleSendReply}>{sendingReply ? <span className="btn-spinner"></span> : 'Send'}</button>
            </div>
          </>
        )}
        {type === 'contact' && (
          <>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.3rem' }}><strong>{item.name}</strong> — {item.email}</p>
            <p style={{ lineHeight: '1.6', color: '#334155', marginBottom: '1rem' }}>{item.message}</p>
            <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '0.8rem' }}>{new Date(item.createdAt).toLocaleString()}</p>
            <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: '100%', marginBottom: '0.7rem' }}>
              {statusOpts[type].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn" style={{ width: '100%' }} disabled={saving} onClick={handleUpdate}>{saving ? <><span className="btn-spinner"></span> Saving...</> : <><FaSave /> Save</>}</button>
          </>
        )}
        {type === 'team' && (
          <>
            <div style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '1rem', lineHeight: '1.7' }}>
              <p><strong>{item.name}</strong> — {item.email}</p>
              {item.phone && <p>Phone: {item.phone}</p>}
              <p>Education: {item.education}</p>
              <p>Location: {item.location}</p>
              <p>Involvement: {item.involvement}</p>
              {item.skills?.length > 0 && <p>Skills: {item.skills.join(', ')}</p>}
              <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.8rem 0' }} />
              <p style={{ fontStyle: 'italic' }}>"{item.message}"</p>
            </div>
            <label style={{ fontSize: '0.8rem', color: '#6b7280' }}>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: '100%', marginBottom: '0.7rem' }}>
              {statusOpts[type].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn" style={{ width: '100%' }} disabled={saving} onClick={handleUpdate}>{saving ? <><span className="btn-spinner"></span> Saving...</> : <><FaSave /> Save</>}</button>
          </>
        )}
      </div>
    </div>
  );
}

function AdminTickets() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewTicket, setViewTicket] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const fetchData = () => {
    api('/api/admin/tickets').then(setTickets).catch(() => {});
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    const res = await fetch(`${API_BASE}/api/admin/tickets/${tid(viewTicket)}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ text: replyText }),
    });
    const data = await res.json();
    if (res.ok) {
      setViewTicket(data);
      setTickets((prev) => prev.map((t) => (tid(t) === tid(data) ? data : t)));
      setReplyText('');
    } else {
      showToast(res.error || 'Failed to send.', 'error');
    }
    setSendingReply(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdate = async (id) => {
    setSavingId(id);
    await fetch(`${API_BASE}/api/admin/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(editForm),
    });
    setTickets((prev) => prev.map((t) => (t._id === id || t.id === id ? { ...t, ...editForm } : t)));
    setEditingId(null);
    setEditForm({});
    setSavingId(null);
    showToast('Ticket updated.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    setDeletingId(id);
    await fetch(`${API_BASE}/api/admin/tickets/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    setTickets((prev) => prev.filter((t) => t.id !== id && t._id !== id));
    if (viewTicket?.id === id || viewTicket?._id === id) setViewTicket(null);
    setDeletingId(null);
    showToast('Ticket deleted.');
  };

  const handleStatus = async (id, status) => {
    setUpdatingId(id);
    await fetch(`${API_BASE}/api/admin/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    setTickets((prev) => prev.map((t) => (t.id === id || t._id === id ? { ...t, status } : t)));
    if (viewTicket?.id === id || viewTicket?._id === id) setViewTicket((prev) => ({ ...prev, status }));
    setUpdatingId(null);
    showToast(`Status changed to ${status}.`);
  };

  const tid = (t) => t.id || t._id;

  const filtered = tickets.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [viewTicket?.messages]);

  if (viewTicket) {
    const msgs = viewTicket.messages || [];
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-sm btn-outline" onClick={() => setViewTicket(null)}><FaTimes /> Back</button>
          <h3 style={{ margin: 0 }}>{viewTicket.title}</h3>
          <StatusBadge status={viewTicket.status} />
          <span className="ticket-category">{viewTicket.category}</span>
        </div>
        <div className="dash-card">
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.3rem' }}>By <strong>{viewTicket.userName}</strong></p>
          <p style={{ lineHeight: '1.7', color: '#334155', marginBottom: '1rem' }}>{viewTicket.description}</p>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
            {new Date(viewTicket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <select value={viewTicket.status} disabled={updatingId === tid(viewTicket)} onChange={(e) => handleStatus(tid(viewTicket), e.target.value)} style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.8rem' }}>
              {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn btn-sm btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} disabled={deletingId === tid(viewTicket)} onClick={() => { handleDelete(tid(viewTicket)); }}>{deletingId === tid(viewTicket) ? <><span className="btn-spinner"></span></> : <><FaTrash /> Delete</>}</button>
          </div>
        </div>
        <div className="dash-card" style={{ marginTop: '1rem' }}>
          <h4 style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaReply style={{ transform: 'scaleX(-1)' }} /> Conversation ({msgs.length})</h4>
          <div className="msg-thread">
            {msgs.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>No messages yet. Reply to start a conversation.</p>
            ) : (
              msgs.map((m, i) => (
                <div key={i} className={`msg-bubble ${m.sender === 'admin' ? 'msg-admin' : 'msg-user'}`}>
                  <div className="msg-header">
                    <strong>{m.senderName}</strong>
                    <span>{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <p>{m.text}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="msg-reply-form">
            <input
              type="text"
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
            />
            <button className="btn btn-sm" disabled={sendingReply || !replyText.trim()} onClick={handleSendReply}>{sendingReply ? <span className="btn-spinner"></span> : 'Send'}</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} onCreated={fetchData} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ margin: 0 }}>All Tickets ({tickets.length})</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="dash-filters">
            {['all', ...TICKET_STATUSES].map((f) => (
              <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-sm" onClick={() => setShowCreate(true)}><FaPlus /> New Ticket</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><FaTicketAlt size={36} style={{ color: '#d1d5db' }} /><p>No tickets found.</p></div>
      ) : (
        <div className="ticket-list">
          {filtered.map((t) => (
            <div key={tid(t)} className="ticket-item admin-ticket-item" style={{ cursor: 'pointer' }} onClick={() => setViewTicket(t)}>
              <div className="ticket-top">
                <StatusBadge status={t.status} />
                <span className="ticket-category">{t.category}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.3rem' }}>{t.userName}</span>
                <div className="ticket-actions" onClick={(e) => e.stopPropagation()}>
                  <button className="ticket-action-btn" title="View" onClick={() => setViewTicket(t)}><FaEye /></button>
                  <button className="ticket-action-btn" title="Edit" onClick={() => { setEditingId(tid(t)); setEditForm({ title: t.title, description: t.description, category: t.category, status: t.status }); }}><FaEdit /></button>
                  <button className="ticket-action-btn" title="Delete" disabled={deletingId === tid(t)} onClick={() => handleDelete(tid(t))} style={{ color: '#ef4444' }}>{deletingId === tid(t) ? <span className="btn-spinner"></span> : <FaTrash />}</button>
                </div>
              </div>
              {editingId === tid(t) ? (
                <div className="ticket-edit-form" onClick={(e) => e.stopPropagation()}>
                  <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                  <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                    <option value="general">General</option><option value="hardware">Hardware</option><option value="software">Software</option>
                    <option value="virus">Virus / Malware</option><option value="network">Network</option><option value="training">Training</option>
                  </select>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <textarea rows="2" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm" disabled={savingId === tid(t)} onClick={() => handleUpdate(tid(t))}>{savingId === tid(t) ? <><span className="btn-spinner"></span></> : <><FaSave /> Save</>}</button>
                    <button className="btn btn-sm btn-outline" onClick={() => setEditingId(null)}><FaTimes /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 style={{ fontSize: '0.9rem' }}>{t.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="ticket-date">{new Date(t.createdAt).toLocaleDateString()}</span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <select value={t.status} disabled={updatingId === tid(t)} onChange={(e) => handleStatus(tid(t), e.target.value)} style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '0.75rem' }}>
                        {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const fetchData = () => {
    api('/api/admin/users').then(setUsers).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? All their data will be lost.')) return;
    setDeletingId(id);
    await fetch(`${API_BASE}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    setUsers((prev) => prev.filter((u) => u.id !== id && u._id !== id));
    setDeletingId(null);
    showToast('User deleted.');
  };

  const handleUpdate = async (id) => {
    setSavingId(id);
    const res = await api(`${API_BASE}/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(editForm) });
    setSavingId(null);
    if (res.error) return showToast(res.error, 'error');
    setUsers((prev) => prev.map((u) => (u.id === id || u._id === id ? res : u)));
    setEditingId(null);
    setEditForm({});
    showToast('User updated.');
  };

  const uid = (u) => u.id || u._id;

  return (
    <>
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={fetchData} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>Users ({users.length})</h3>
        <button className="btn btn-sm" onClick={() => setShowCreate(true)}><FaPlus /> New User</button>
      </div>
      {users.length === 0 ? (
        <div className="empty-state"><FaUsers size={36} style={{ color: '#d1d5db' }} /><p>No users.</p></div>
      ) : (
        <div className="admin-list">
          {users.map((u) => (
            <div key={uid(u)} className="admin-list-item">
              {editingId === uid(u) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
                  <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={editForm.isAdmin} onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })} />
                    Admin
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm" disabled={savingId === uid(u)} onClick={() => handleUpdate(uid(u))}>{savingId === uid(u) ? <><span className="btn-spinner"></span></> : <><FaSave /> Save</>}</button>
                    <button className="btn btn-sm btn-outline" onClick={() => setEditingId(null)}><FaTimes /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="admin-list-main">
                    <strong>{u.name}</strong>
                    <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{u.email}</span>
                    {u.isAdmin && <span className="admin-badge">Admin</span>}
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Created: {new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="admin-list-actions">
                    <button className="ticket-action-btn" title="Edit" onClick={() => { setEditingId(uid(u)); setEditForm({ name: u.name, email: u.email, isAdmin: u.isAdmin }); }}><FaEdit /></button>
                    {!u.isAdmin && (
                      <button className="ticket-action-btn" title="Delete" disabled={deletingId === uid(u)} onClick={() => handleDelete(uid(u))} style={{ color: '#ef4444' }}>{deletingId === uid(u) ? <span className="btn-spinner"></span> : <FaTrash />}</button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AdminSuggestions() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [detail, setDetail] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = () => {
    api('/api/admin/suggestions').then(setItems).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this suggestion?')) return;
    setDeletingId(id);
    await fetch(`${API_BASE}/api/admin/suggestions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setItems((prev) => prev.filter((i) => i.id !== id && i._id !== id));
    setDeletingId(null);
    showToast('Suggestion deleted.');
  };

  const sid = (i) => i.id || i._id;

  return (
    <>
      {detail && <DetailModal item={detail} type="suggestion" onClose={() => setDetail(null)} onUpdated={fetchData} />}
      <h3><FaLightbulb style={{ color: '#FFCE08' }} /> Suggestions ({items.length})</h3>
      {items.length === 0 ? (
        <div className="empty-state"><FaLightbulb size={36} style={{ color: '#d1d5db' }} /><p>No suggestions.</p></div>
      ) : (
        <div className="admin-list">
          {items.map((item) => (
            <div key={sid(item)} className="admin-list-item">
              <div className="admin-list-main">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong>{item.title}</strong>
                  <StatusBadge status={item.status} type="suggestion" />
                </div>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{item.userName} — {item.description?.slice(0, 100)}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="admin-list-actions">
                <button className="ticket-action-btn" title="View / Respond" onClick={() => setDetail(item)}><FaEye /></button>
                <button className="ticket-action-btn" title="Delete" disabled={deletingId === sid(item)} onClick={() => handleDelete(sid(item))} style={{ color: '#ef4444' }}>{deletingId === sid(item) ? <span className="btn-spinner"></span> : <FaTrash />}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AdminContacts() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [detail, setDetail] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = () => {
    api('/api/admin/contacts').then(setItems).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    setDeletingId(id);
    await fetch(`${API_BASE}/api/admin/contacts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setItems((prev) => prev.filter((i) => i.id !== id && i._id !== id));
    setDeletingId(null);
    showToast('Message deleted.');
  };

  const cid = (i) => i.id || i._id;

  return (
    <>
      {detail && <DetailModal item={detail} type="contact" onClose={() => setDetail(null)} onUpdated={fetchData} />}
      <h3><FaEnvelope style={{ color: '#60a5fa' }} /> Contact Messages ({items.length})</h3>
      {items.length === 0 ? (
        <div className="empty-state"><FaEnvelope size={36} style={{ color: '#d1d5db' }} /><p>No messages.</p></div>
      ) : (
        <div className="admin-list">
          {items.map((item) => (
            <div key={cid(item)} className="admin-list-item">
              <div className="admin-list-main">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong>{item.name}</strong>
                  <StatusBadge status={item.status} type="contact" />
                </div>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{item.email} — {item.message?.slice(0, 100)}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="admin-list-actions">
                <button className="ticket-action-btn" title="View" onClick={() => setDetail(item)}><FaEye /></button>
                <button className="ticket-action-btn" title="Delete" disabled={deletingId === cid(item)} onClick={() => handleDelete(cid(item))} style={{ color: '#ef4444' }}>{deletingId === cid(item) ? <span className="btn-spinner"></span> : <FaTrash />}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AdminTeams() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [detail, setDetail] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = () => {
    api('/api/admin/team-apps').then(setItems).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    setDeletingId(id);
    await fetch(`${API_BASE}/api/admin/team-apps/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setItems((prev) => prev.filter((i) => i.id !== id && i._id !== id));
    setDeletingId(null);
    showToast('Application deleted.');
  };

  const tid = (i) => i.id || i._id;

  return (
    <>
      {detail && <DetailModal item={detail} type="team" onClose={() => setDetail(null)} onUpdated={fetchData} />}
      <h3><FaUserTie style={{ color: '#16a34a' }} /> Team Applications ({items.length})</h3>
      {items.length === 0 ? (
        <div className="empty-state"><FaUserTie size={36} style={{ color: '#d1d5db' }} /><p>No applications.</p></div>
      ) : (
        <div className="admin-list">
          {items.map((item) => (
            <div key={tid(item)} className="admin-list-item">
              <div className="admin-list-main">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong>{item.name}</strong>
                  <StatusBadge status={item.status} type="team" />
                </div>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                  {item.email} — {item.location}
                  {item.education ? ` • ${item.education}` : ''}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="admin-list-actions">
                <button className="ticket-action-btn" title="View Details" onClick={() => setDetail(item)}><FaEye /></button>
                <button className="ticket-action-btn" title="Delete" disabled={deletingId === tid(item)} onClick={() => handleDelete(tid(item))} style={{ color: '#ef4444' }}>{deletingId === tid(item) ? <span className="btn-spinner"></span> : <FaTrash />}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AdminNews() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', mediaType: 'text', mediaUrl: '', published: true });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', content: '', mediaType: 'text', mediaUrl: '', published: true });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = () => {
    api('/api/admin/news').then(setItems).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) return showToast('Title is required.', 'error');
    setSubmitting(true);
    const res = await api('/api/admin/news', { method: 'POST', body: JSON.stringify(createForm) });
    setSubmitting(false);
    if (res.error) return showToast(res.error, 'error');
    showToast('News created.');
    setShowCreate(false);
    setCreateForm({ title: '', content: '', mediaType: 'text', mediaUrl: '', published: true });
    fetchData();
  };

  const handleUpdate = async (id) => {
    setSubmitting(true);
    const res = await api(`/api/admin/news/${id}`, { method: 'PUT', body: JSON.stringify(editForm) });
    setSubmitting(false);
    if (res.error) return showToast(res.error, 'error');
    setItems((prev) => prev.map((i) => (i._id === id || i.id === id ? { ...i, ...editForm } : i)));
    setEditingId(null);
    showToast('News updated.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this news item?')) return;
    setDeletingId(id);
    await fetch(`${API_BASE}/api/admin/news/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setItems((prev) => prev.filter((i) => i._id !== id && i.id !== id));
    setDeletingId(null);
    showToast('News deleted.');
  };

  const nid = (i) => i._id || i.id;

  return (
    <>
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}><FaPlus /> Create News</h3>
              <button className="ticket-action-btn" onClick={() => setShowCreate(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleCreate}>
              <input placeholder="Title *" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required />
              <select value={createForm.mediaType} onChange={(e) => setCreateForm({ ...createForm, mediaType: e.target.value })} style={{ width: '100%', marginBottom: '0.7rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                <option value="text">Text / Article</option>
                <option value="image">Image</option>
                <option value="video">Video (YouTube)</option>
              </select>
              {createForm.mediaType !== 'text' && (
                <input placeholder={createForm.mediaType === 'image' ? 'Image URL' : 'YouTube Video URL'} value={createForm.mediaUrl} onChange={(e) => setCreateForm({ ...createForm, mediaUrl: e.target.value })} style={{ marginBottom: '0.7rem' }} />
              )}
              <textarea rows="5" placeholder="Content (optional — click to expand on site)" value={createForm.content} onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.7rem' }}>
                <input type="checkbox" checked={createForm.published} onChange={(e) => setCreateForm({ ...createForm, published: e.target.checked })} />
                Published
              </label>
              <button type="submit" className="btn" style={{ width: '100%' }} disabled={submitting}>{submitting ? <><span className="btn-spinner"></span> Creating...</> : <><FaPlus /> Create News</>}</button>
            </form>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3><FaNewspaper style={{ color: '#FFCE08' }} /> News ({items.length})</h3>
        <button className="btn btn-sm" onClick={() => setShowCreate(true)}><FaPlus /> New Post</button>
      </div>
      {items.length === 0 ? (
        <div className="empty-state"><FaNewspaper size={36} style={{ color: '#d1d5db' }} /><p>No news posted yet.</p></div>
      ) : (
        <div className="admin-list">
          {items.map((item) => (
            <div key={nid(item)} className="admin-list-item">
              {editingId === nid(item) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" />
                  <select value={editForm.mediaType} onChange={(e) => setEditForm({ ...editForm, mediaType: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                  {(editForm.mediaType === 'image' || editForm.mediaType === 'video') && (
                    <input value={editForm.mediaUrl} onChange={(e) => setEditForm({ ...editForm, mediaUrl: e.target.value })} placeholder={editForm.mediaType === 'image' ? 'Image URL' : 'YouTube URL'} />
                  )}
                  <textarea rows="3" value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} placeholder="Content" />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <input type="checkbox" checked={editForm.published} onChange={(e) => setEditForm({ ...editForm, published: e.target.checked })} />
                    Published
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm" disabled={submitting} onClick={() => handleUpdate(nid(item))}>{submitting ? <><span className="btn-spinner"></span></> : <><FaSave /> Save</>}</button>
                    <button className="btn btn-sm btn-outline" onClick={() => setEditingId(null)}><FaTimes /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="admin-list-main">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>{item.title}</strong>
                      {item.mediaType === 'image' && <span style={{ fontSize: '0.7rem', background: '#dbeafe', color: '#1d4ed8', padding: '0.1rem 0.4rem', borderRadius: '999px' }}><FaImage /> Photo</span>}
                      {item.mediaType === 'video' && <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#dc2626', padding: '0.1rem 0.4rem', borderRadius: '999px' }}><FaYoutube /> Video</span>}
                      {!item.published && <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#b45309', padding: '0.1rem 0.4rem', borderRadius: '999px' }}>Draft</span>}
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{item.content?.slice(0, 100) || 'No content'}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(item.createdAt).toLocaleDateString()} by {item.author}</span>
                  </div>
                  <div className="admin-list-actions">
                    <button className="ticket-action-btn" title="Edit" onClick={() => { setEditingId(nid(item)); setEditForm({ title: item.title, content: item.content, mediaType: item.mediaType, mediaUrl: item.mediaUrl, published: item.published }); }}><FaEdit /></button>
                    <button className="ticket-action-btn" title="Delete" disabled={deletingId === nid(item)} onClick={() => handleDelete(nid(item))} style={{ color: '#ef4444' }}>{deletingId === nid(item) ? <span className="btn-spinner"></span> : <FaTrash />}</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('tickets');
  const [stats, setStats] = useState({ users: 0, tickets: 0, suggestions: 0, contacts: 0, teams: 0, news: 0 });

  useEffect(() => {
    Promise.all([
      api('/api/admin/users'),
      api('/api/admin/tickets'),
      api('/api/admin/suggestions'),
      api('/api/admin/contacts'),
      api('/api/admin/team-apps'),
      api('/api/admin/news'),
    ]).then(([users, tickets, suggestions, contacts, teams, news]) => {
      setStats({ users: users.length, tickets: tickets.length, suggestions: suggestions.length, contacts: contacts.length, teams: teams.length, news: news.length });
    }).catch(() => {});
  }, []);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  return (
    <div className="dashboard admin-dashboard">
      <div className="dash-welcome">
        <div className="dash-avatar">{initials}</div>
        <div>
          <h2>Admin Dashboard</h2>
          <p>Full CRUD management — tickets, users, suggestions, contacts, and applications.</p>
        </div>
      </div>

      <div className="dash-stats">
        <div className="dash-stat-card">
          <FaTicketAlt className="dash-stat-icon" />
          <div><strong>{stats.tickets}</strong><span>Tickets</span></div>
        </div>
        <div className="dash-stat-card">
          <FaUsers className="dash-stat-icon" style={{ color: '#3b82f6' }} />
          <div><strong>{stats.users}</strong><span>Users</span></div>
        </div>
        <div className="dash-stat-card">
          <FaLightbulb className="dash-stat-icon" style={{ color: '#f59e0b' }} />
          <div><strong>{stats.suggestions}</strong><span>Suggestions</span></div>
        </div>
        <div className="dash-stat-card">
          <FaEnvelope className="dash-stat-icon" style={{ color: '#8b5cf6' }} />
          <div><strong>{stats.contacts}</strong><span>Messages</span></div>
        </div>
        <div className="dash-stat-card">
          <FaUserTie className="dash-stat-icon" style={{ color: '#06b6d4' }} />
          <div><strong>{stats.teams}</strong><span>Applications</span></div>
        </div>
        <div className="dash-stat-card">
          <FaNewspaper className="dash-stat-icon" style={{ color: '#FFCE08' }} />
          <div><strong>{stats.news}</strong><span>News</span></div>
        </div>
      </div>

      <div className="dash-tabs">
        <button className={`dash-tab${tab === 'tickets' ? ' active' : ''}`} onClick={() => setTab('tickets')}><FaTicketAlt /> Tickets</button>
        <button className={`dash-tab${tab === 'users' ? ' active' : ''}`} onClick={() => setTab('users')}><FaUsers /> Users</button>
        <button className={`dash-tab${tab === 'suggestions' ? ' active' : ''}`} onClick={() => setTab('suggestions')}><FaLightbulb /> Suggestions</button>
        <button className={`dash-tab${tab === 'contacts' ? ' active' : ''}`} onClick={() => setTab('contacts')}><FaEnvelope /> Contacts</button>
        <button className={`dash-tab${tab === 'teams' ? ' active' : ''}`} onClick={() => setTab('teams')}><FaUserTie /> Applications</button>
        <button className={`dash-tab${tab === 'chat' ? ' active' : ''}`} onClick={() => setTab('chat')}><FaComments /> Chat</button>
        <button className={`dash-tab${tab === 'news' ? ' active' : ''}`} onClick={() => setTab('news')}><FaNewspaper /> News</button>
      </div>

      <div className="admin-panel">
        {tab === 'tickets' && <AdminTickets />}
        {tab === 'users' && <AdminUsers />}
        {tab === 'suggestions' && <AdminSuggestions />}
        {tab === 'contacts' && <AdminContacts />}
        {tab === 'teams' && <AdminTeams />}
        {tab === 'chat' && <AdminChatView />}
        {tab === 'news' && <AdminNews />}
      </div>
    </div>
  );
}
