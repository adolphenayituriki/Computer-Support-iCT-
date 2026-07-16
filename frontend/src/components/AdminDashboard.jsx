import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminChatView from './AdminChatView';
import HelpModal from './HelpModal';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaTicketAlt, FaUsers, FaLightbulb, FaEnvelope, FaUserTie, FaTrash, FaCheckCircle, FaUndo, FaTimes, FaEye, FaEyeSlash, FaSave, FaEdit, FaPlus, FaSearch, FaCheck, FaBan, FaReply, FaComments, FaNewspaper, FaImage, FaYoutube, FaBookOpen, FaChartBar, FaStar, FaBold, FaItalic, FaHeading, FaListUl, FaListOl, FaPalette, FaFont, FaLink, FaCode, FaBars, FaAngleLeft, FaAngleRight, FaCog, FaQuestionCircle, FaSignOutAlt, FaBell, FaUserShield, FaCalendarAlt, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import API_BASE from '../api';

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

const token = () => localStorage.getItem('cshub_token');
const TICKET_STATUSES = ['open', 'in-progress', 'resolved', 'closed'];
const SUGGESTION_STATUSES = ['pending', 'reviewed', 'implemented'];
const CONTACT_STATUSES = ['new', 'read', 'responded'];
const TEAM_STATUSES = ['pending', 'approved', 'rejected'];
const sortByDate = (arr) => [...arr].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

  const itemId = item._id || item.id;

  const handleUpdate = async () => {
    setSaving(true);
    const urlMap = {
      suggestion: `/api/admin/suggestions/${itemId}`,
      contact: `/api/admin/contacts/${itemId}`,
      team: `/api/admin/team-apps/${itemId}`,
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
    const res = await fetch(`${API_BASE}/api/admin/${type === 'suggestion' ? 'suggestions' : 'tickets'}/${itemId}/messages`, {
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
              {item.applicantType && <p>Type: {item.applicantType}</p>}
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
  const [loading, setLoading] = useState(true);

  const tid = (t) => t.id || t._id;

  const fetchData = () => {
    setLoading(true);
    api('/api/admin/tickets').then((d) => { setTickets(d); setLoading(false); }).catch(() => setLoading(false));
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

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
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
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api('/api/admin/users').then((d) => { setUsers(sortByDate(d)); setLoading(false); }).catch(() => setLoading(false));
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
    const res = await api(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(editForm) });
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
      {loading ? (
        <Loading />
      ) : users.length === 0 ? (
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
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api('/api/admin/suggestions').then((d) => { setItems(sortByDate(d)); setLoading(false); }).catch(() => setLoading(false));
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
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
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
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api('/api/admin/contacts').then((d) => { setItems(sortByDate(d)); setLoading(false); }).catch(() => setLoading(false));
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
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
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
  const [submitting, setSubmitting] = useState(false);
  const [chattingId, setChattingId] = useState(null);
  const [assignId, setAssignId] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [showAssign, setShowAssign] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api('/api/admin/team-apps').then((d) => { setItems(sortByDate(d)); setLoading(false); }).catch(() => setLoading(false));
  };

  const fetchBeneficiaries = () => {
    api('/api/admin/beneficiaries').then((d) => setBeneficiaries(sortByDate(d))).catch(() => {});
  };

  useEffect(() => { fetchData(); fetchBeneficiaries(); }, []);

  const handleStatus = async (id, status) => {
    setSubmitting(true);
    const res = await api(`/api/admin/team-apps/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    setSubmitting(false);
    if (res.error) return showToast(res.error, 'error');
    setItems((prev) => prev.map((i) => (i.id === id || i._id === id ? { ...i, status } : i)));
    showToast(`Application ${status}.`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    setDeletingId(id);
    await fetch(`${API_BASE}/api/admin/team-apps/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setItems((prev) => prev.filter((i) => i.id !== id && i._id !== id));
    setDeletingId(null);
    showToast('Application deleted.');
  };

  const handleChat = async (id) => {
    setChattingId(id);
    try {
      const res = await api(`/api/admin/team-apps/${id}/conversation`, { method: 'POST' });
      setChattingId(null);
      if (res.error) return showToast(res.error, 'error');
      if (res._id) {
        window.dispatchEvent(new CustomEvent('opencode-navigate-tab', { detail: { tab: 'chat' } }));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('opencode-select-conversation', { detail: { id: res._id, type: 'direct' } }));
        }, 200);
      }
    } catch (err) {
      setChattingId(null);
      showToast('Failed to start chat: ' + err.message, 'error');
    }
  };

  const handleAssign = async (beneficiaryId, teamAppId) => {
    const app = items.find((i) => tid(i) === teamAppId);
    await api(`/api/admin/beneficiaries/${beneficiaryId}`, {
      method: 'PUT',
      body: JSON.stringify({ assignedTo: teamAppId, assignedToName: app?.name || '', status: 'in-progress' }),
    });
    fetchBeneficiaries();
    showToast('Beneficiary assigned.');
    setShowAssign(null);
  };

  const tid = (i) => i.id || i._id;

  const unassignedBeneficiaries = beneficiaries.filter((b) => !b.assignedTo);

  return (
    <>
      {showAssign && (
        <div className="modal-overlay" onClick={() => setShowAssign(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Assign Beneficiary</h3>
              <button className="ticket-action-btn" onClick={() => setShowAssign(null)}><FaTimes /></button>
            </div>
            {unassignedBeneficiaries.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No unassigned beneficiaries available.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {unassignedBeneficiaries.map((b) => (
                  <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '0.85rem' }}>{b.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{b.issue?.slice(0, 60)}</div>
                    </div>
                    <button className="btn btn-sm" onClick={() => handleAssign(b._id, showAssign)}>Assign</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {detail && <DetailModal item={detail} type="team" onClose={() => setDetail(null)} onUpdated={fetchData} />}
      <h3><FaUserTie style={{ color: '#16a34a' }} /> Team Applications ({items.length})</h3>
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
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
                  {item.applicantType ? ` • ${item.applicantType}` : ''}
                  {item.education ? ` • ${item.education}` : ''}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="admin-list-actions">
                {item.status === 'pending' && (
                  <>
                    <button className="ticket-action-btn" title="Approve" disabled={submitting} onClick={() => handleStatus(tid(item), 'approved')} style={{ color: '#047857' }}><FaCheckCircle /></button>
                    <button className="ticket-action-btn" title="Reject" disabled={submitting} onClick={() => handleStatus(tid(item), 'rejected')} style={{ color: '#dc2626' }}><FaBan /></button>
                  </>
                )}
                {item.status === 'approved' && (
                  <button className="ticket-action-btn" title="Reject" disabled={submitting} onClick={() => handleStatus(tid(item), 'rejected')} style={{ color: '#dc2626' }}><FaBan /></button>
                )}
                {item.status === 'rejected' && (
                  <button className="ticket-action-btn" title="Approve" disabled={submitting} onClick={() => handleStatus(tid(item), 'approved')} style={{ color: '#047857' }}><FaUndo /></button>
                )}
                {item.status === 'approved' && (
                  <button className="ticket-action-btn" title="Chat" disabled={chattingId === tid(item)} onClick={() => handleChat(tid(item))} style={{ color: '#3b82f6' }}>{chattingId === tid(item) ? <span className="btn-spinner"></span> : <FaComments />}</button>
                )}
                {item.status === 'approved' && (
                  <button className="ticket-action-btn" title="Assign Beneficiary" onClick={() => setShowAssign(tid(item))} style={{ color: '#8b5cf6' }}><FaUserTie /></button>
                )}
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
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api('/api/admin/news').then((d) => { setItems(sortByDate(d)); setLoading(false); }).catch(() => setLoading(false));
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
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
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

function AdminTestimonials() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [submittingId, setSubmittingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api('/api/admin/testimonials').then((d) => { setItems(sortByDate(d)); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    setSubmittingId(id);
    const res = await api(`/api/admin/testimonials/${id}/approve`, { method: 'PUT' });
    setSubmittingId(null);
    if (res.error) return showToast(res.error, 'error');
    setItems((prev) => prev.map((i) => (i._id === id || i.id === id ? { ...i, approved: true } : i)));
    showToast('Testimonial approved.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    setSubmittingId(id);
    await fetch(`${API_BASE}/api/admin/testimonials/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setItems((prev) => prev.filter((i) => i._id !== id && i.id !== id));
    setSubmittingId(null);
    showToast('Testimonial deleted.');
  };

  const nid = (i) => i._id || i.id;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3><FaStar style={{ color: '#FFCE08' }} /> Testimonials ({items.length})</h3>
      </div>
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="empty-state"><FaStar size={36} style={{ color: '#d1d5db' }} /><p>No testimonials yet.</p></div>
      ) : (
        <div className="admin-list">
          {items.map((item) => (
            <div key={nid(item)} className="admin-list-item">
              <div className="admin-list-main">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong>{item.name}</strong>
                  {item.role && <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>&mdash; {item.role}</span>}
                  {item.approved ? (
                    <span style={{ fontSize: '0.7rem', background: '#d1fae5', color: '#047857', padding: '0.1rem 0.4rem', borderRadius: '999px' }}><FaCheck /> Approved</span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#b45309', padding: '0.1rem 0.4rem', borderRadius: '999px' }}>Pending</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.15rem', marginTop: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar key={s} size={11} style={{ color: s <= item.rating ? '#FFCE08' : '#d1d5db' }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>&ldquo;{item.content?.slice(0, 200)}&rdquo;</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="admin-list-actions">
                {!item.approved && (
                  <button className="ticket-action-btn" title="Approve" disabled={submittingId === nid(item)} onClick={() => handleApprove(nid(item))} style={{ color: '#047857' }}>{submittingId === nid(item) ? <span className="btn-spinner"></span> : <FaCheckCircle />}</button>
                )}
                <button className="ticket-action-btn" title="Delete" disabled={submittingId === nid(item)} onClick={() => handleDelete(nid(item))} style={{ color: '#ef4444' }}>{submittingId === nid(item) ? <span className="btn-spinner"></span> : <FaTrash />}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const COLORS = ['#FFCE08', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ec4899', '#1e293b'];
const FONT_SIZES = ['14px', '16px', '18px', '20px', '24px', '32px'];

function MarkdownEditor({ value, onChange }) {
  const [mode, setMode] = useState('edit');
  const [showColors, setShowColors] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const textareaRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const closeDropdowns = (e) => {
      if (editorRef.current && !editorRef.current.contains(e.target)) {
        setShowColors(false);
        setShowSizes(false);
      }
    };
    document.addEventListener('mousedown', closeDropdowns);
    return () => document.removeEventListener('mousedown', closeDropdowns);
  }, []);

  const insert = (before, after = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = value.substring(start, end);
    const next = value.substring(0, start) + before + sel + after + value.substring(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  };

  const insertBlock = (prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start) === -1 ? value.length : value.indexOf('\n', start);
    const line = value.substring(lineStart, lineEnd);
    const next = value.substring(0, lineStart) + prefix + line + value.substring(lineEnd);
    onChange(next);
  };

  return (
    <div className="md-editor" ref={editorRef}>
      <div className="md-toolbar">
        <div className="md-toolbar-group">
          <button type="button" className="md-btn" title="Bold" onClick={() => insert('**', '**')}><FaBold /></button>
          <button type="button" className="md-btn" title="Italic" onClick={() => insert('*', '*')}><FaItalic /></button>
          <button type="button" className="md-btn" title="Heading" onClick={() => insertBlock('## ')}><FaHeading /></button>
          <button type="button" className="md-btn" title="Bullet list" onClick={() => insertBlock('- ')}><FaListUl /></button>
          <button type="button" className="md-btn" title="Numbered list" onClick={() => insertBlock('1. ')}><FaListOl /></button>
          <button type="button" className="md-btn" title="Link" onClick={() => insert('[', '](url)')}><FaLink /></button>
          <button type="button" className="md-btn" title="Code block" onClick={() => insert('```\n', '\n```')}><FaCode /></button>
        </div>
        <span className="md-separator" />
        <div className="md-toolbar-group">
          <div className="md-dropdown-wrap">
            <button type="button" className={`md-btn${showColors ? ' active' : ''}`} title="Text color" onClick={() => { setShowColors(!showColors); setShowSizes(false); }}><FaPalette /></button>
            {showColors && (
              <div className="md-dropdown">
                <div className="md-color-grid">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="md-color-swatch"
                      title={c}
                      style={{ background: c }}
                      onClick={() => { insert(`<span style="color:${c}">`, '</span>'); setShowColors(false); }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="md-dropdown-wrap">
            <button type="button" className={`md-btn${showSizes ? ' active' : ''}`} title="Font size" onClick={() => { setShowSizes(!showSizes); setShowColors(false); }}><FaFont /></button>
            {showSizes && (
              <div className="md-dropdown md-size-list">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="md-size-option"
                    style={{ fontSize: s }}
                    onClick={() => { insert(`<span style="font-size:${s}">`, '</span>'); setShowSizes(false); }}
                  >Aa</button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="md-tabs">
          <button type="button" className={`md-tab${mode === 'edit' ? ' active' : ''}`} onClick={() => setMode('edit')}>Write</button>
          <button type="button" className={`md-tab${mode === 'preview' ? ' active' : ''}`} onClick={() => setMode('preview')}>Preview</button>
        </div>
      </div>
      {mode === 'preview' ? (
        <div className="md-preview course-content">
          {value ? <ReactMarkdown rehypePlugins={[rehypeRaw]}>{value}</ReactMarkdown> : <span className="md-preview-empty">Your preview will appear here as you write...</span>}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          className="md-textarea"
          rows="6"
          placeholder="Write your course content here — markdown and HTML are both supported."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function AdminCourses() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', content: '', category: 'general', difficulty: 'beginner', estimatedTime: '', published: true, tags: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', content: '', category: 'general', difficulty: 'beginner', estimatedTime: '', published: true, tags: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api('/api/admin/courses').then((d) => { setItems(sortByDate(d)); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.description.trim()) return showToast('Title and description are required.', 'error');
    setSubmitting(true);
    const res = await api('/api/admin/courses', { method: 'POST', body: JSON.stringify({ ...createForm, tags: createForm.tags ? createForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] }) });
    setSubmitting(false);
    if (res.error) return showToast(res.error, 'error');
    showToast('Course created.');
    setShowCreate(false);
    setCreateForm({ title: '', description: '', content: '', category: 'general', difficulty: 'beginner', estimatedTime: '', published: true, tags: '' });
    fetchData();
  };

  const handleUpdate = async (id) => {
    setSubmitting(true);
    const body = { ...editForm, tags: editForm.tags ? editForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] };
    const res = await api(`/api/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    setSubmitting(false);
    if (res.error) return showToast(res.error, 'error');
    setItems((prev) => prev.map((i) => (i._id === id || i.id === id ? { ...i, ...body } : i)));
    setEditingId(null);
    showToast('Course updated.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    setDeletingId(id);
    await fetch(`${API_BASE}/api/admin/courses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setItems((prev) => prev.filter((i) => i._id !== id && i.id !== id));
    setDeletingId(null);
    showToast('Course deleted.');
  };

  const nid = (i) => i._id || i.id;

  const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
  const CATEGORIES = ['general', 'hardware', 'software', 'network', 'virus', 'training'];

  return (
    <>
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}><FaPlus /> Create Course</h3>
              <button className="ticket-action-btn" onClick={() => setShowCreate(false)}><FaTimes /></button>
            </div>
            <form onSubmit={handleCreate}>
              <input placeholder="Title *" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required />
              <textarea rows="2" placeholder="Short description *" value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} required />
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.7rem' }}>
                <select value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={createForm.difficulty} onChange={(e) => setCreateForm({ ...createForm, difficulty: e.target.value })} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <input placeholder="Estimated time (e.g. '5 min read')" value={createForm.estimatedTime} onChange={(e) => setCreateForm({ ...createForm, estimatedTime: e.target.value })} />
              <input placeholder="Tags (comma-separated)" value={createForm.tags} onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })} />
              <MarkdownEditor value={createForm.content} onChange={(v) => setCreateForm({ ...createForm, content: v })} />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#4b5563', marginBottom: '0.7rem' }}>
                <input type="checkbox" checked={createForm.published} onChange={(e) => setCreateForm({ ...createForm, published: e.target.checked })} />
                Published
              </label>
              <button type="submit" className="btn" style={{ width: '100%' }} disabled={submitting}>{submitting ? <><span className="btn-spinner"></span> Creating...</> : <><FaPlus /> Create Course</>}</button>
            </form>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3><FaBookOpen style={{ color: '#06b6d4' }} /> Courses ({items.length})</h3>
        <button className="btn btn-sm" onClick={() => setShowCreate(true)}><FaPlus /> New Course</button>
      </div>
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="empty-state"><FaBookOpen size={36} style={{ color: '#d1d5db' }} /><p>No courses created yet.</p></div>
      ) : (
        <div className="admin-list">
          {items.map((item) => (
            <div key={nid(item)} className="admin-list-item">
              {editingId === nid(item) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" />
                  <textarea rows="2" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Short description" />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={editForm.difficulty} onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                      {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <input value={editForm.estimatedTime} onChange={(e) => setEditForm({ ...editForm, estimatedTime: e.target.value })} placeholder="Estimated time" />
                  <input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} placeholder="Tags (comma-separated)" />
                  <MarkdownEditor value={editForm.content} onChange={(v) => setEditForm({ ...editForm, content: v })} />
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
                      {!item.published && <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#b45309', padding: '0.1rem 0.4rem', borderRadius: '999px' }}>Draft</span>}
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{item.description?.slice(0, 100) || 'No description'}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{item.category} &middot; {item.difficulty} {item.estimatedTime ? `· ${item.estimatedTime}` : ''}</span>
                  </div>
                  <div className="admin-list-actions">
                    <button className="ticket-action-btn" title="Edit" onClick={() => { setEditingId(nid(item)); setEditForm({ title: item.title, description: item.description, content: item.content, category: item.category, difficulty: item.difficulty, estimatedTime: item.estimatedTime || '', published: item.published, tags: item.tags?.join(', ') || '' }); }}><FaEdit /></button>
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

function AdminBeneficiaries() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [teams, setTeams] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ status: 'open', assignedTo: '', notes: '' });
  const [deletingId, setDeletingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api('/api/admin/beneficiaries').then((d) => { setItems(sortByDate(d)); setLoading(false); }).catch(() => setLoading(false));
    api('/api/admin/team-apps').then((all) => setTeams(sortByDate(all).filter((t) => t.status === 'approved'))).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdate = async (id) => {
    setSavingId(id);
    const res = await api(`/api/admin/beneficiaries/${id}`, { method: 'PUT', body: JSON.stringify(editForm) });
    setSavingId(null);
    if (res.error) return showToast(res.error, 'error');
    setItems((prev) => prev.map((i) => (i._id === id || i.id === id ? { ...i, ...editForm } : i)));
    setEditingId(null);
    showToast('Beneficiary updated.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this beneficiary record?')) return;
    setDeletingId(id);
    await fetch(`${API_BASE}/api/admin/beneficiaries/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setItems((prev) => prev.filter((i) => i._id !== id && i.id !== id));
    setDeletingId(null);
    showToast('Beneficiary deleted.');
  };

  const nid = (i) => i._id || i.id;

  const BSTATUSES = ['open', 'in-progress', 'resolved', 'closed'];
  const statusColors = { open: { bg: '#fee2e2', color: '#dc2626' }, 'in-progress': { bg: '#fef3c7', color: '#b45309' }, resolved: { bg: '#d1fae5', color: '#047857' }, closed: { bg: '#e5e7eb', color: '#4b5563' } };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3><FaUserTie style={{ color: '#8b5cf6' }} /> Beneficiaries ({items.length})</h3>
      </div>
      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="empty-state"><FaUserTie size={36} style={{ color: '#d1d5db' }} /><p>No beneficiaries yet.</p></div>
      ) : (
        <div className="admin-list">
          {items.map((item) => (
            <div key={nid(item)} className="admin-list-item">
              {editingId === nid(item) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                    {BSTATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={editForm.assignedTo} onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                    <option value="">Unassigned</option>
                    {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                  <textarea rows="2" placeholder="Admin notes" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm" disabled={savingId === nid(item)} onClick={() => handleUpdate(nid(item))}>{savingId === nid(item) ? <span className="btn-spinner"></span> : <><FaSave /> Save</>}</button>
                    <button className="btn btn-sm btn-outline" onClick={() => setEditingId(null)}><FaTimes /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="admin-list-main">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong>{item.name}</strong>
                      <span style={{ fontSize: '0.7rem', background: (statusColors[item.status] || statusColors.open).bg, color: (statusColors[item.status] || statusColors.open).color, padding: '0.1rem 0.4rem', borderRadius: '999px' }}>{item.status}</span>
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{item.issue?.slice(0, 120)}</span>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {item.phone || item.email ? `${item.phone || item.email} ` : ''}
                      {item.location ? ` • ${item.location}` : ''}
                      {item.assignedToName ? ` • Assigned to: ${item.assignedToName}` : ' • Unassigned'}
                      &middot; {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="admin-list-actions">
                    <button className="ticket-action-btn" title="Edit" onClick={() => { setEditingId(nid(item)); setEditForm({ status: item.status, assignedTo: item.assignedTo || '', notes: item.notes || '' }); }}><FaEdit /></button>
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

function AnalyticsView({ stats, ticketChart, appChart, onNavigate }) {
  const max = Math.max(...Object.values(stats), 1);
  const cards = [
    { key: 'tickets', label: 'Tickets', count: stats.tickets, icon: <FaTicketAlt />, color: '#3b82f6', bg: '#eff6ff' },
    { key: 'users', label: 'Users', count: stats.users, icon: <FaUsers />, color: '#10b981', bg: '#ecfdf5' },
    { key: 'suggestions', label: 'Suggestions', count: stats.suggestions, icon: <FaLightbulb />, color: '#f59e0b', bg: '#fffbeb' },
    { key: 'contacts', label: 'Messages', count: stats.contacts, icon: <FaEnvelope />, color: '#8b5cf6', bg: '#f5f3ff' },
    { key: 'teams', label: 'Applications', count: stats.teams, icon: <FaUserTie />, color: '#06b6d4', bg: '#ecfeff' },
    { key: 'beneficiaries', label: 'Beneficiaries', count: stats.beneficiaries, icon: <FaUserTie />, color: '#ec4899', bg: '#fdf2f8' },
    { key: 'news', label: 'News', count: stats.news, icon: <FaNewspaper />, color: '#FFCE08', bg: '#fefce8' },
    { key: 'courses', label: 'Courses', count: stats.courses, icon: <FaBookOpen />, color: '#14b8a6', bg: '#f0fdfa' },
    { key: 'testimonials', label: 'Testimonials', count: stats.testimonials, icon: <FaStar />, color: '#f97316', bg: '#fff7ed' },
  ];
  return (
    <>
      <div className="adm-page-header">
        <div><h1>Analytics</h1><p>Overview of your platform activity</p></div>
      </div>
      <div className="adm-stats-grid">
        {cards.map((c) => (
          <div key={c.key} className="adm-stat-card" onClick={() => onNavigate && onNavigate(c.key)}>
            <div className="adm-stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
            <div className="adm-stat-info"><strong>{c.count}</strong><span>{c.label}</span></div>
          </div>
        ))}
      </div>
      <div className="adm-chart-section">
        <div className="adm-chart-header"><FaChartBar /> Overview</div>
        <div className="adm-chart-bars">
          {cards.map((item) => {
            const pct = (item.count / max) * 100;
            return (
              <div key={item.key} className="adm-chart-row" onClick={() => onNavigate && onNavigate(item.key)}>
                <span className="adm-chart-label">{item.label}</span>
                <div className="adm-chart-track"><div className="adm-chart-fill" style={{ width: `${pct}%`, background: item.color }} /></div>
                <span className="adm-chart-count">{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>
      {(stats.tickets > 0 || stats.teams > 0) && (
        <div className="adm-chart-row-group">
          {stats.tickets > 0 && (
            <div className="adm-chart-sub-card">
              <h4>Ticket Status</h4>
              <div className="adm-chart-sub-items">
                <div className="adm-chart-sub-item"><span style={{ background: '#f59e0b' }} />Open / In Progress <strong>{ticketChart.open}</strong></div>
                <div className="adm-chart-sub-item"><span style={{ background: '#3b82f6' }} />Resolved <strong>{ticketChart.resolved}</strong></div>
                <div className="adm-chart-sub-item"><span style={{ background: '#9ca3af' }} />Closed <strong>{ticketChart.closed}</strong></div>
              </div>
            </div>
          )}
          {stats.teams > 0 && (
            <div className="adm-chart-sub-card">
              <h4>Application Status</h4>
              <div className="adm-chart-sub-items">
                <div className="adm-chart-sub-item"><span style={{ background: '#f59e0b' }} />Pending <strong>{appChart.pending}</strong></div>
                <div className="adm-chart-sub-item"><span style={{ background: '#10b981' }} />Approved <strong>{appChart.approved}</strong></div>
                <div className="adm-chart-sub-item"><span style={{ background: '#ef4444' }} />Rejected <strong>{appChart.rejected}</strong></div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function AdminInvites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/session-invites`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error('Failed to load invites');
      const data = await res.json();
      setInvites(Array.isArray(data?.invites) ? data.invites : Array.isArray(data) ? data : []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  useEffect(() => { fetchInvites(); }, []);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await fetch(`${API_BASE}/api/session-invites/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status }),
      });
      setInvites((prev) => prev.map((inv) => inv._id === id ? { ...inv, status } : inv));
    } catch { }
    setUpdatingId(null);
  };

  const deleteInvite = async (id) => {
    if (!confirm('Delete this registration?')) return;
    try {
      await fetch(`${API_BASE}/api/session-invites/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      setInvites((prev) => prev.filter((inv) => inv._id !== id));
    } catch { }
  };

  const resendEmail = async (id) => {
    setUpdatingId(id);
    try {
      await fetch(`${API_BASE}/api/session-invites/${id}/resend-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
      });
      setInvites((prev) => prev.map((inv) => inv._id === id ? { ...inv, emailSent: true } : inv));
    } catch { }
    setUpdatingId(null);
  };

  const filtered = statusFilter === 'all' ? invites : invites.filter((inv) => inv.status === statusFilter);
  const counts = { all: invites.length, new: invites.filter((i) => i.status === 'new').length, contacted: invites.filter((i) => i.status === 'contacted').length, confirmed: invites.filter((i) => i.status === 'confirmed').length };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const statusColors = { new: '#f59e0b', contacted: '#3b82f6', confirmed: '#10b981' };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['all', 'new', 'contacted', 'confirmed'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '0.4rem 0.9rem', borderRadius: '8px', border: statusFilter === s ? '2px solid #5694F7' : '2px solid #e2e8f0', background: statusFilter === s ? '#5694F7' : '#fff', color: statusFilter === s ? '#fff' : '#64748b', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}><FaSpinner className="spin" style={{ fontSize: '1.5rem' }} /></div>
      ) : error ? (
        <div style={{ padding: '1.5rem', background: '#fef2f2', borderRadius: '10px', color: '#dc2626' }}><FaExclamationTriangle /> {error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No registrations found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((inv) => (
            <div key={inv._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <strong style={{ color: '#0f172a' }}>{inv.name}</strong>
                    <span style={{ display: 'inline-block', padding: '0.15rem 0.55rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 600, background: `${statusColors[inv.status]}15`, color: statusColors[inv.status], border: `1px solid ${statusColors[inv.status]}30` }}>
                      {inv.status}
                    </span>
                    {inv.emailSent && <span style={{ fontSize: '0.68rem', color: '#10b981' }}>📧 sent</span>}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <span>📧 {inv.email}</span>
                    {inv.phone && <span>📱 {inv.phone}</span>}
                    <span>📅 {formatDate(inv.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                    Level: <strong style={{ color: '#475569' }}>{inv.level || '—'}</strong>
                    {inv.heardFrom && <> · Heard via: <strong style={{ color: '#475569' }}>{inv.heardFrom}</strong></>}
                  </div>
                  {inv.interests?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                      {inv.interests.map((i) => (
                        <span key={i} style={{ padding: '0.15rem 0.5rem', borderRadius: '50px', fontSize: '0.68rem', background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>{i}</span>
                      ))}
                    </div>
                  )}
                  {inv.suggestion && <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.4rem', fontStyle: 'italic' }}>"{inv.suggestion}"</div>}
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                  {inv.status === 'new' && (
                    <button disabled={updatingId === inv._id} onClick={() => updateStatus(inv._id, 'contacted')} title="Mark as Contacted" style={{ padding: '0.4rem', background: '#3b82f615', border: '1px solid #3b82f640', borderRadius: '8px', color: '#3b82f6', cursor: 'pointer' }}><FaCheck /></button>
                  )}
                  {inv.status === 'contacted' && (
                    <button disabled={updatingId === inv._id} onClick={() => updateStatus(inv._id, 'confirmed')} title="Confirm" style={{ padding: '0.4rem', background: '#10b98115', border: '1px solid #10b98140', borderRadius: '8px', color: '#10b981', cursor: 'pointer' }}><FaCheck /></button>
                  )}
                  <button disabled={updatingId === inv._id} onClick={() => resendEmail(inv._id)} title="Resend Email" style={{ padding: '0.4rem', background: '#f59e0b15', border: '1px solid #f59e0b40', borderRadius: '8px', color: '#f59e0b', cursor: 'pointer' }}><FaEnvelope /></button>
                  <button onClick={() => deleteInvite(inv._id)} title="Delete" style={{ padding: '0.4rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', cursor: 'pointer' }}><FaTrash /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="page-loader" style={{ minHeight: '60vh' }}>
      <img src="/LOGO IMAGE.png" alt="CS Hub" className="page-loader-logo" style={{ width: 72, height: 72 }} />
      <div className="page-loader-text" style={{ color: '#6b7280' }}>Loading...</div>
      <div className="loading-spinner-circle" />
    </div>
  );
}

const SIDEBAR_GROUPS = [
  { label: 'MAIN', items: [
    { key: 'analytics', icon: <FaChartBar />, label: 'Analytics' },
    { key: 'tickets', icon: <FaTicketAlt />, label: 'Tickets' },
    { key: 'users', icon: <FaUsers />, label: 'Users' },
    { key: 'chat', icon: <FaComments />, label: 'Chat' },
  ]},
  { label: 'MANAGEMENT', items: [
    { key: 'contacts', icon: <FaEnvelope />, label: 'Contacts' },
    { key: 'teams', icon: <FaUserTie />, label: 'Applications' },
    { key: 'suggestions', icon: <FaLightbulb />, label: 'Suggestions' },
    { key: 'news', icon: <FaNewspaper />, label: 'News' },
    { key: 'courses', icon: <FaBookOpen />, label: 'Courses' },
    { key: 'beneficiaries', icon: <FaUserTie />, label: 'Beneficiaries' },
    { key: 'testimonials', icon: <FaStar />, label: 'Testimonials' },
    { key: 'invites', icon: <FaCalendarAlt />, label: 'Session Invites' },
  ]},
];

export default function AdminDashboard() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [tab, setTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [pwdForm, setPwdForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileTab, setProfileTab] = useState('profile');
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const isMobile = useIsMobile();
  const [stats, setStats] = useState({ users: 0, tickets: 0, suggestions: 0, contacts: 0, teams: 0, news: 0, courses: 0, beneficiaries: 0, testimonials: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const h = (e) => setTab(e.detail.tab);
    window.addEventListener('opencode-navigate-tab', h);
    return () => window.removeEventListener('opencode-navigate-tab', h);
  }, []);

  useEffect(() => {
    if (user) setProfileForm({ name: user.name || '', email: user.email || '' });
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const handleProfileSave = async () => {
    setProfileLoading(true);
    try {
      await updateProfile(profileForm.name, profileForm.email);
      showToast('Profile updated successfully.');
      setProfileEditOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (pwdForm.newPwd !== pwdForm.confirm) { showToast('Passwords do not match.', 'error'); return; }
    if (pwdForm.newPwd.length < 6) { showToast('Password must be at least 6 characters.', 'error'); return; }
    setProfileLoading(true);
    try {
      await changePassword(pwdForm.current, pwdForm.newPwd);
      showToast('Password changed successfully.');
      setPwdForm({ current: '', newPwd: '', confirm: '' });
    } catch (err) {
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const [ticketChart, setTicketChart] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [appChart, setAppChart] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const endpoints = [
      ['users', '/api/admin/users'],
      ['tickets', '/api/admin/tickets'],
      ['suggestions', '/api/admin/suggestions'],
      ['contacts', '/api/admin/contacts'],
      ['teams', '/api/admin/team-apps'],
      ['news', '/api/admin/news'],
      ['courses', '/api/admin/courses'],
      ['beneficiaries', '/api/admin/beneficiaries'],
      ['testimonials', '/api/admin/testimonials'],
    ];
    Promise.allSettled(endpoints.map(([_, url]) => api(url)))
      .then((results) => {
        const s = { users: 0, tickets: 0, suggestions: 0, contacts: 0, teams: 0, news: 0, courses: 0, beneficiaries: 0, testimonials: 0 };
        results.forEach((r, i) => {
          if (r.status === 'fulfilled' && Array.isArray(r.value)) s[endpoints[i][0]] = r.value.length;
        });
        setStats(s);
        const ticketsArr = results[1].status === 'fulfilled' && Array.isArray(results[1].value) ? results[1].value : [];
        setTicketChart({
          open: ticketsArr.filter((t) => t.status === 'open' || t.status === 'in-progress').length,
          resolved: ticketsArr.filter((t) => t.status === 'resolved').length,
          closed: ticketsArr.filter((t) => t.status === 'closed').length,
        });
        const teamsArr = results[4].status === 'fulfilled' && Array.isArray(results[4].value) ? results[4].value : [];
        setAppChart({
          pending: teamsArr.filter((t) => t.status === 'pending').length,
          approved: teamsArr.filter((t) => t.status === 'approved').length,
          rejected: teamsArr.filter((t) => t.status === 'rejected').length,
        });
        setStatsLoading(false);
      });
  }, []);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const [contactsRes, suggestionsRes, ticketsRes, teamsRes] = await Promise.allSettled([
        api('/api/admin/contacts'),
        api('/api/admin/suggestions'),
        api('/api/admin/tickets'),
        api('/api/admin/team-apps'),
      ]);
      const items = [];
      const newContacts = contactsRes.status === 'fulfilled' && Array.isArray(contactsRes.value) ? contactsRes.value.filter(c => c.status === 'new') : [];
      newContacts.forEach(c => items.push({ id: c._id, type: 'contact', icon: '✉️', title: c.subject || 'New contact message', sub: `${c.name} — ${new Date(c.createdAt).toLocaleString()}`, tab: 'contacts', status: c.status }));
      const newSuggestions = suggestionsRes.status === 'fulfilled' && Array.isArray(suggestionsRes.value) ? suggestionsRes.value.filter(s => s.status === 'pending') : [];
      newSuggestions.forEach(s => items.push({ id: s._id, type: 'suggestion', icon: '💡', title: s.title || 'New suggestion', sub: `${s.user?.name || 'User'} — ${new Date(s.createdAt).toLocaleString()}`, tab: 'suggestions', status: s.status }));
      const openTickets = ticketsRes.status === 'fulfilled' && Array.isArray(ticketsRes.value) ? ticketsRes.value.filter(t => t.status === 'open') : [];
      openTickets.slice(0, 10).forEach(t => items.push({ id: t._id, type: 'ticket', icon: '🎫', title: t.title || 'New ticket', sub: `${t.user?.name || 'User'} — ${new Date(t.createdAt).toLocaleString()}`, tab: 'tickets', status: t.status }));
      const pendingTeams = teamsRes.status === 'fulfilled' && Array.isArray(teamsRes.value) ? teamsRes.value.filter(t => t.status === 'pending') : [];
      pendingTeams.forEach(t => items.push({ id: t._id, type: 'team', icon: '👤', title: t.name || 'New application', sub: `${t.email || ''} — ${new Date(t.createdAt).toLocaleString()}`, tab: 'teams', status: t.status }));
      setNotifications(items);
      setUnreadCount(items.length);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const handleNotifClick = (item) => {
    setNotifOpen(false);
    setTab(item.tab);
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  const pageTitles = {
    analytics: { title: 'Analytics', sub: 'Overview of your platform activity' },
    tickets: { title: 'Tickets', sub: 'Manage and track all support requests' },
    users: { title: 'Users', sub: 'Manage user accounts and permissions' },
    suggestions: { title: 'Suggestions', sub: 'Review and manage user suggestions' },
    contacts: { title: 'Contacts', sub: 'View and respond to contact messages' },
    teams: { title: 'Applications', sub: 'Review team applications' },
    chat: { title: 'Chat', sub: 'Communicate with users in real-time' },
    news: { title: 'News', sub: 'Create and manage news articles' },
    courses: { title: 'Courses', sub: 'Manage courses and learning materials' },
    beneficiaries: { title: 'Beneficiaries', sub: 'Track and manage beneficiaries' },
    testimonials: { title: 'Testimonials', sub: 'Review and approve testimonials' },
    invites: { title: 'Session Invites', sub: 'Manage session registrations' },
  };

  const currentPage = pageTitles[tab] || pageTitles.analytics;

  const renderContent = () => {
    if (tab === 'analytics') {
      return statsLoading ? (
        <Loading />
      ) : (
        <AnalyticsView stats={stats} ticketChart={ticketChart} appChart={appChart} onNavigate={(t) => setTab(t)} />
      );
    }
    if (tab === 'tickets') return <AdminTickets />;
    if (tab === 'users') return <AdminUsers />;
    if (tab === 'suggestions') return <AdminSuggestions />;
    if (tab === 'contacts') return <AdminContacts />;
    if (tab === 'teams') return <AdminTeams />;
    if (tab === 'chat') return <AdminChatView />;
    if (tab === 'beneficiaries') return <AdminBeneficiaries />;
    if (tab === 'news') return <AdminNews />;
    if (tab === 'courses') return <AdminCourses />;
    if (tab === 'testimonials') return <AdminTestimonials />;
    if (tab === 'invites') return <AdminInvites />;
    return null;
  };

  return (
    <div className="adm-layout">
      {sidebarOpen && isMobile && <div className="adm-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`adm-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="adm-sidebar-header">
          <div className="adm-sidebar-logo">
            <img src="/LOGO IMAGE.png" alt="CS Hub" />
            <div>
              <strong>CS Hub</strong>
              <span>Admin Panel</span>
            </div>
          </div>
        </div>
        <div className="adm-sidebar-user">
          <div className="adm-sidebar-avatar">{initials}</div>
          <div className="adm-sidebar-user-info">
            <span className="adm-sidebar-user-name">{user?.name || 'Admin'}</span>
            <span className="adm-sidebar-user-role">Administrator</span>
          </div>
        </div>
        <nav className="adm-sidebar-nav">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.label} className="adm-sidebar-group">
              <div className="adm-sidebar-group-label">{group.label}</div>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  className={`adm-sidebar-item${tab === item.key ? ' active' : ''}`}
                  onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                >
                  <span className="adm-sidebar-item-icon">{item.icon}</span>
                  <span className="adm-sidebar-item-label">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <button className="adm-sidebar-item" onClick={() => { setHelpOpen(true); setSidebarOpen(false); }}>
            <span className="adm-sidebar-item-icon"><FaQuestionCircle /></span>
            <span className="adm-sidebar-item-label">Help</span>
          </button>
          <button className="adm-sidebar-item" onClick={handleLogout}>
            <span className="adm-sidebar-item-icon"><FaSignOutAlt /></span>
            <span className="adm-sidebar-item-label">Logout</span>
          </button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-header">
          <button className="adm-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
          <div className="adm-header-search">
            <FaSearch />
            <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="adm-header-right">
            <div className="adm-header-notif" ref={notifRef}>
              <button className="adm-header-icon" title="Notifications" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}>
                <FaBell />
                {unreadCount > 0 && <span className="adm-header-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="adm-notif-dropdown">
                  <div className="adm-notif-dropdown-header">
                    <strong>Notifications</strong>
                    {unreadCount > 0 && <span className="adm-notif-count">{unreadCount} new</span>}
                  </div>
                  <div className="adm-notif-dropdown-list">
                    {notifications.length === 0 ? (
                      <div className="adm-notif-empty">No new notifications</div>
                    ) : (
                      notifications.slice(0, 15).map((n) => (
                        <button key={`${n.type}-${n.id}`} className="adm-notif-item" onClick={() => handleNotifClick(n)}>
                          <span className="adm-notif-icon">{n.icon}</span>
                          <div className="adm-notif-content">
                            <div className="adm-notif-title">{n.title}</div>
                            <div className="adm-notif-sub">{n.sub}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="adm-notif-dropdown-footer">
                      <button onClick={() => { setNotifOpen(false); setTab('contacts'); }}>View all</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="adm-header-user" ref={profileRef}>
              <button className="adm-header-user-btn" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="adm-header-avatar">{initials}</div>
                <span className="adm-header-name">{user?.name || 'Admin'}</span>
              </button>
              {profileOpen && (
                <div className="adm-profile-dropdown">
                  <div className="adm-profile-dropdown-header">
                    <div className="adm-profile-dropdown-avatar">{initials}</div>
                    <div>
                      <div className="adm-profile-dropdown-name">{user?.name || 'Admin'}</div>
                      <div className="adm-profile-dropdown-email">{user?.email || ''}</div>
                      <span className="adm-profile-role-badge"><FaUserShield /> Administrator</span>
                    </div>
                  </div>
                  <div className="adm-profile-dropdown-divider"></div>
                  <button className="adm-profile-dropdown-item" onClick={() => { setProfileEditOpen(true); setProfileTab('profile'); setProfileOpen(false); }}>
                    <FaEdit /> Edit Profile
                  </button>
                  <button className="adm-profile-dropdown-item" onClick={() => { setProfileEditOpen(true); setProfileTab('password'); setProfileOpen(false); }}>
                    <FaCog /> Settings & Password
                  </button>
                  <div className="adm-profile-dropdown-divider"></div>
                  <button className="adm-profile-dropdown-item adm-profile-dropdown-logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="adm-content">
          {renderContent()}
        </main>
      </div>

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}

      {profileEditOpen && (
        <div className="adm-modal-overlay" onClick={() => setProfileEditOpen(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h3>{profileTab === 'password' ? 'Change Password' : 'Edit Profile'}</h3>
              <button className="adm-modal-close" onClick={() => setProfileEditOpen(false)}><FaTimes /></button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-profile-tabs">
                <button className={`adm-profile-tab${profileTab === 'profile' ? ' active' : ''}`} onClick={() => setProfileTab('profile')}>Profile</button>
                <button className={`adm-profile-tab${profileTab === 'password' ? ' active' : ''}`} onClick={() => setProfileTab('password')}>Password</button>
              </div>
              {profileTab === 'profile' ? (
                <div className="adm-profile-form">
                  <div className="adm-profile-avatar-large">{initials}</div>
                  <label className="adm-form-label">Full Name</label>
                  <input className="adm-form-input" type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  <label className="adm-form-label">Email</label>
                  <input className="adm-form-input" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                  <button className="adm-btn adm-btn-primary" onClick={handleProfileSave} disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="adm-profile-form">
                  <label className="adm-form-label">Current Password</label>
                  <input className="adm-form-input" type="password" value={pwdForm.current} onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} />
                  <label className="adm-form-label">New Password</label>
                  <input className="adm-form-input" type="password" value={pwdForm.newPwd} onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })} />
                  <label className="adm-form-label">Confirm New Password</label>
                  <input className="adm-form-input" type="password" value={pwdForm.confirm} onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} />
                  <button className="adm-btn adm-btn-primary" onClick={handlePasswordChange} disabled={profileLoading}>
                    {profileLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
