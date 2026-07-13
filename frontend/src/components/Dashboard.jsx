import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import UserChatView from './UserChatView';
import HelpModal from './HelpModal';
import {
  FaTicketAlt, FaClock, FaCheckCircle, FaExclamationCircle, FaTrash, FaEdit,
  FaSave, FaTimes, FaEye, FaUndo, FaLightbulb, FaReply, FaComments, FaUserTie,
  FaHandshake, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBars, FaTachometerAlt,
  FaCog, FaQuestionCircle, FaSignOutAlt, FaSearch, FaBell, FaUserShield
} from 'react-icons/fa';
import API_BASE from '../api';

const token = () => localStorage.getItem('cshub_token');

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

const SIDEBAR_GROUPS = [
  {
    label: 'MAIN',
    items: [
      { key: 'dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
      { key: 'tickets', icon: <FaTicketAlt />, label: 'Tickets' },
      { key: 'suggestions', icon: <FaLightbulb />, label: 'Suggestions' },
      { key: 'chat', icon: <FaComments />, label: 'Messages' },
    ],
  },
];

function TicketsView({ tickets, setTickets }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', category: 'general' });
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filter, setFilter] = useState('all');
  const [viewTicket, setViewTicket] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const msgEndRef = useRef(null);
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [viewTicket?.messages]);

  const tid = (t) => t?.id || t?._id;

  useEffect(() => {
    if (viewTicket) {
      fetch(`${API_BASE}/api/tickets/${tid(viewTicket)}`, { headers: { Authorization: `Bearer ${token()}` } })
        .then((r) => r.json())
        .then((data) => { if (!data.error) setViewTicket(data); })
        .catch(() => {});
    }
  }, [viewTicket?.id || viewTicket?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setTickets((prev) => [data, ...prev]);
        setForm({ title: '', description: '', category: 'general' });
        showToast('Support request submitted!');
      } else {
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setMessage('Could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id) => {
    setSavingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setTickets((prev) => prev.map((t) => (tid(t) === id ? { ...t, ...editForm } : t)));
        setEditingId(null);
        setEditForm({});
        showToast('Ticket updated!');
      }
    } catch {} finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        setTickets((prev) => prev.filter((t) => (t.id || t._id) !== id));
        if ((viewTicket?.id || viewTicket?._id) === id) setViewTicket(null);
        showToast('Ticket deleted.');
      }
    } catch {}
  };

  const handleStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status }),
      });
      setTickets((prev) => prev.map((t) => (tid(t) === id ? { ...t, status } : t)));
      if (tid(viewTicket) === id) setViewTicket((prev) => ({ ...prev, status }));
      showToast(status === 'closed' ? 'Ticket resolved!' : 'Ticket reopened.');
    } catch {}
  };

  const startEdit = (t) => {
    setEditingId(tid(t));
    setEditForm({ title: t.title, description: t.description, category: t.category });
  };

  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'in-progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  const filteredTickets = tickets.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'open') return t.status === 'open' || t.status === 'in-progress';
    if (filter === 'closed') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`${API_BASE}/api/tickets/${tid(viewTicket)}/messages`, {
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
        showToast('Failed to send.', 'error');
      }
    } catch { showToast('Could not reach server.', 'error'); }
    setSendingReply(false);
  };

  const modalContent = viewTicket ? (
    <div className="adm-modal-overlay" onClick={() => setViewTicket(null)}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <h3>{viewTicket.title}</h3>
          <button className="adm-modal-close" onClick={() => setViewTicket(null)}><FaTimes /></button>
        </div>
        <div className="adm-modal-body">
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span className={`ticket-status status-${viewTicket.status}`}>{viewTicket.status.toUpperCase()}</span>
            <span className="ticket-category">{viewTicket.category}</span>
          </div>
          <p style={{ color: '#6b7280', lineHeight: 1.6, marginBottom: '0.5rem' }}>{viewTicket.description}</p>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Submitted {new Date(viewTicket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {viewTicket.status === 'open' && (
              <button className="btn btn-sm" onClick={() => handleStatus(tid(viewTicket), 'closed')}><FaCheckCircle style={{ marginRight: '0.3rem' }} /> Mark Resolved</button>
            )}
            {viewTicket.status === 'closed' && (
              <button className="btn btn-outline btn-sm" onClick={() => handleStatus(tid(viewTicket), 'open')}><FaUndo style={{ marginRight: '0.3rem' }} /> Reopen</button>
            )}
            <button className="btn btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDelete(tid(viewTicket))}><FaTrash style={{ marginRight: '0.3rem' }} /> Delete</button>
          </div>
          <div style={{ marginTop: '1.2rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.9rem', color: '#374151' }}><FaReply style={{ transform: 'scaleX(-1)', marginRight: '0.4rem' }} />Conversation ({viewTicket.messages?.length || 0})</h4>
            <div className="msg-thread">
              {(!viewTicket.messages || viewTicket.messages.length === 0) ? (
                <p style={{ fontSize: '0.85rem', color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>No messages yet.</p>
              ) : (
                viewTicket.messages.map((m, i) => (
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
            <div className="msg-reply-form" style={{ marginTop: '0.7rem' }}>
              <input type="text" placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }} />
              <button className="btn btn-sm" disabled={sendingReply || !replyText.trim()} onClick={handleSendReply}>{sendingReply ? <span className="btn-spinner"></span> : 'Send'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="adm-page-header">
        <h2>Support Tickets</h2>
        <p>Manage your support requests and track their status.</p>
      </div>
      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><FaTicketAlt /></div>
          <div className="adm-stat-info"><strong>{tickets.length}</strong><span>Total</span></div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><FaExclamationCircle /></div>
          <div className="adm-stat-info"><strong>{openCount}</strong><span>Open</span></div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><FaCheckCircle /></div>
          <div className="adm-stat-info"><strong>{resolvedCount}</strong><span>Resolved</span></div>
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="dash-card request-card">
          <h3>New Support Request</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Title (e.g. Laptop won't boot)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="general">General</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="virus">Virus / Malware</option>
              <option value="network">Network</option>
              <option value="training">Training</option>
            </select>
            <textarea rows="4" placeholder="Describe your issue in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <button type="submit" className="btn" disabled={submitting}>{submitting ? <><span className="btn-spinner"></span> Submitting...</> : 'Submit Request'}</button>
          </form>
          {message && <p className="form-feedback">{message}</p>}
        </div>
        <div className="dash-card tickets-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>My Tickets ({tickets.length})</h3>
            <div className="dash-filters">
              {['all', 'open', 'closed'].map((f) => (
                <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {filteredTickets.length === 0 ? (
            <div className="empty-state">
              <FaTicketAlt size={40} style={{ color: '#d1d5db' }} />
              <p>No {filter !== 'all' ? filter : ''} tickets yet.</p>
              <span>Fill in the form to create your first ticket.</span>
            </div>
          ) : (
            <div className="ticket-list">
              {filteredTickets.map((t) => (
                <div key={tid(t)} className="ticket-item" style={{ cursor: 'pointer' }} onClick={() => setViewTicket(t)}>
                  <div className="ticket-top">
                    <span className={`ticket-status status-${t.status}`}>
                      {t.status === 'in-progress' ? 'IN PROGRESS' : t.status.toUpperCase()}
                    </span>
                    <span className="ticket-category">{t.category}</span>
                    <div className="ticket-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="ticket-action-btn" title="View" onClick={() => setViewTicket(t)}><FaEye /></button>
                      <button className="ticket-action-btn" title="Edit" onClick={() => startEdit(t)}><FaEdit /></button>
                      <button className="ticket-action-btn" title="Delete" onClick={() => handleDelete(tid(t))} style={{ color: '#ef4444' }}><FaTrash /></button>
                    </div>
                  </div>
                  {editingId === tid(t) ? (
                    <div className="ticket-edit-form" onClick={(e) => e.stopPropagation()}>
                      <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                      <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                        <option value="general">General</option>
                        <option value="hardware">Hardware</option>
                        <option value="software">Software</option>
                        <option value="virus">Virus / Malware</option>
                        <option value="network">Network</option>
                        <option value="training">Training</option>
                      </select>
                      <textarea rows="2" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} disabled={savingId === tid(t)} onClick={() => handleUpdate(tid(t))}>{savingId === tid(t) ? <span className="btn-spinner"></span> : <><FaSave /> Save</>}</button>
                        <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => setEditingId(null)}><FaTimes /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4>{t.title}</h4>
                      <p>{t.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.3rem' }}>
                        <span className="ticket-date">
                          {new Date(t.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <div onClick={(e) => e.stopPropagation()}>
                          {(t.status === 'open' || t.status === 'in-progress') && (
                            <button className="btn-link" style={{ fontSize: '0.78rem', color: '#16a34a' }} onClick={() => handleStatus(tid(t), 'resolved')}>
                              <FaCheckCircle style={{ marginRight: '0.3rem' }} /> Resolve
                            </button>
                          )}
                          {t.status === 'resolved' && (
                            <button className="btn-link" style={{ fontSize: '0.78rem', color: '#f59e0b' }} onClick={() => handleStatus(tid(t), 'open')}>
                              <FaUndo style={{ marginRight: '0.3rem' }} /> Reopen
                            </button>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {modalContent}
    </>
  );
}

function SuggestionsView() {
  const { showToast } = useToast();
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [feedback, setFeedback] = useState('');
  const [viewSug, setViewSug] = useState(null);
  const [sugReplyText, setSugReplyText] = useState('');
  const [sugSendingReply, setSugSendingReply] = useState(false);
  const sugMsgEndRef = useRef(null);
  useEffect(() => { sugMsgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [viewSug?.messages]);

  const sid = (s) => s?.id || s?._id;

  useEffect(() => {
    if (viewSug) {
      fetch(`${API_BASE}/api/suggestions/${sid(viewSug)}`, { headers: { Authorization: `Bearer ${token()}` } })
        .then((r) => r.json())
        .then((data) => { if (!data.error) setViewSug(data); })
        .catch(() => {});
    }
  }, [viewSug?.id || viewSug?._id]);

  useEffect(() => {
    fetch(`${API_BASE}/api/suggestions`, { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json())
      .then(setSuggestions)
      .catch(() => {});
  }, []);

  const [suggesting, setSuggesting] = useState(false);

  const handleSugReply = async () => {
    if (!sugReplyText.trim()) return;
    setSugSendingReply(true);
    try {
      const res = await fetch(`${API_BASE}/api/suggestions/${sid(viewSug)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ text: sugReplyText }),
      });
      const data = await res.json();
      if (res.ok) {
        setViewSug(data);
        setSuggestions((prev) => prev.map((s) => (sid(s) === sid(data) ? data : s)));
        setSugReplyText('');
      } else {
        showToast('Failed to send.', 'error');
      }
    } catch { showToast('Could not reach server.', 'error'); }
    setSugSendingReply(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');
    setSuggesting(true);
    try {
      const res = await fetch(`${API_BASE}/api/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuggestions((prev) => [{ id: Date.now(), ...form, createdAt: new Date().toISOString() }, ...prev]);
        setForm({ title: '', description: '' });
        showToast('Suggestion submitted! We review every idea.');
      } else {
        showToast(data.error || 'Something went wrong.', 'error');
      }
    } catch {
      showToast('Could not reach the server.', 'error');
    } finally {
      setSuggesting(false);
    }
  };

  const sugModalContent = viewSug ? (
    <div className="adm-modal-overlay" onClick={() => setViewSug(null)}>
      <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <h3>{viewSug.title}</h3>
          <button className="adm-modal-close" onClick={() => setViewSug(null)}><FaTimes /></button>
        </div>
        <div className="adm-modal-body">
          <p style={{ color: '#6b7280', lineHeight: 1.6, marginBottom: '0.5rem' }}>{viewSug.description}</p>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '1.2rem' }}>{new Date(viewSug.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.6rem', fontSize: '0.9rem', color: '#374151' }}><FaReply style={{ transform: 'scaleX(-1)', marginRight: '0.4rem' }} />Conversation ({viewSug.messages?.length || 0})</h4>
            <div className="msg-thread">
              {(!viewSug.messages || viewSug.messages.length === 0) ? (
                <p style={{ fontSize: '0.85rem', color: '#6b7280', textAlign: 'center', padding: '1rem 0' }}>No messages yet.</p>
              ) : (
                viewSug.messages.map((m, i) => (
                  <div key={i} className={`msg-bubble ${m.sender === 'admin' ? 'msg-admin' : 'msg-user'}`}>
                    <div className="msg-header">
                      <strong>{m.senderName}</strong>
                      <span>{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <p>{m.text}</p>
                  </div>
                ))
              )}
              <div ref={sugMsgEndRef} />
            </div>
            <div className="msg-reply-form" style={{ marginTop: '0.7rem' }}>
              <input type="text" placeholder="Type your reply..." value={sugReplyText} onChange={(e) => setSugReplyText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSugReply(); } }} />
              <button className="btn btn-sm" disabled={sugSendingReply || !sugReplyText.trim()} onClick={handleSugReply}>{sugSendingReply ? <span className="btn-spinner"></span> : 'Send'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="adm-page-header">
        <h2>Suggestions</h2>
        <p>Share your ideas to help us improve our services.</p>
      </div>
      <div className="dashboard-grid">
        <div className="sug-form-card">
          <div className="sug-form-header">
            <FaLightbulb className="sug-form-icon" />
            <div>
              <h3>Suggest a Service</h3>
              <p>Tell us what support or service you want us to add.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="What service would you like to see?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea rows="3" placeholder="Describe your idea in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <button type="submit" className="btn" disabled={suggesting}>{suggesting ? <><span className="btn-spinner"></span> Submitting...</> : 'Submit Suggestion'}</button>
          </form>
          {feedback && <p className="form-feedback" style={{ marginTop: '0.8rem' }}>{feedback}</p>}
        </div>
        <div className="sug-list-card">
          <h3>My Suggestions <span className="sug-count">{suggestions.length}</span></h3>
          {suggestions.length === 0 ? (
            <div className="empty-state">
              <FaLightbulb size={36} style={{ color: 'rgba(255,255,255,0.12)' }} />
              <p>No suggestions yet.</p>
              <span>Share your ideas to help us improve.</span>
            </div>
          ) : (
            <div className="sug-list">
              {suggestions.map((s) => (
                <div key={sid(s)} className="sug-item" onClick={() => setViewSug(s)}>
                  <div className="sug-item-top">
                    <h4>{s.title}</h4>
                    {(s.messages || []).length > 0 && (
                      <span className="sug-reply-count">
                        <FaReply style={{ transform: 'scaleX(-1)' }} /> {s.messages.length}
                      </span>
                    )}
                  </div>
                  <p>{s.description}</p>
                  <div className="sug-item-meta">
                    <span className="sug-date">
                      {new Date(s.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {sugModalContent}
    </>
  );
}

function TeamView({ teamData, setTeamData }) {
  const { application: app, beneficiaries } = teamData;
  const [subTab, setSubTab] = useState('overview');
  const [teamTickets, setTeamTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  useEffect(() => {
    if (subTab === 'tickets') {
      setTicketsLoading(true);
      fetch(`${API_BASE}/api/tickets/all`, { headers: { Authorization: `Bearer ${token()}` } })
        .then((r) => r.json())
        .then((data) => { setTeamTickets(data); setTicketsLoading(false); })
        .catch(() => setTicketsLoading(false));
    }
  }, [subTab]);

  function updateBeneficiaryStatus(id, status) {
    fetch(`${API_BASE}/api/beneficiaries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    }).then(() => {
      setTeamData((prev) => ({
        ...prev,
        beneficiaries: prev.beneficiaries.map((b) => (b._id === id || b.id === id ? { ...b, status } : b)),
      }));
    }).catch((e) => console.log(e));
  }

  const subTabs = [
    { key: 'overview', icon: <FaTachometerAlt />, label: 'Overview' },
    { key: 'beneficiaries', icon: <FaHandshake />, label: `Beneficiaries (${beneficiaries.length})` },
    { key: 'tickets', icon: <FaTicketAlt />, label: 'All Tickets' },
  ];

  return (
    <>
      <div className="adm-page-header">
        <h2>Team Dashboard</h2>
        <p>Manage your team profile and assigned beneficiaries.</p>
      </div>
      <div className="team-dash">
        <div className="team-dash-sub-nav">
          {subTabs.map((st) => (
            <button key={st.key} className={`team-sub-tab${subTab === st.key ? ' active' : ''}`} onClick={() => setSubTab(st.key)}>
              {st.icon} {st.label}
            </button>
          ))}
        </div>
        {subTab === 'overview' && (
          <div className="team-overview-grid">
            <div className="team-dash-card">
              <h3><FaUserTie style={{ color: '#06b6d4' }} /> My Profile</h3>
              <div className="team-dash-info">
                <p><strong>{app.name}</strong></p>
                <p><FaEnvelope /> {app.email}</p>
                {app.phone && <p><FaPhone /> {app.phone}</p>}
                {app.location && <p><FaMapMarkerAlt /> {app.location}</p>}
                {app.involvement && <p>Role: <strong>{app.involvement}</strong></p>}
                {app.applicantType && <p>Type: <strong>{app.applicantType}</strong></p>}
                {app.skills?.length > 0 && <p className="team-dash-skills">{app.skills.map((s) => <span key={s}>{s}</span>)}</p>}
              </div>
            </div>
            <div className="team-stats-grid">
              <div className="team-stat-card">
                <FaHandshake size={24} color="#8b5cf6" />
                <span className="team-stat-num">{beneficiaries.length}</span>
                <span className="team-stat-label">Beneficiaries</span>
              </div>
              <div className="team-stat-card">
                <FaCheckCircle size={24} color="#10b981" />
                <span className="team-stat-num">{beneficiaries.filter((b) => b.status === 'resolved' || b.status === 'closed').length}</span>
                <span className="team-stat-label">Resolved</span>
              </div>
              <div className="team-stat-card">
                <FaClock size={24} color="#f59e0b" />
                <span className="team-stat-num">{beneficiaries.filter((b) => b.status === 'in-progress').length}</span>
                <span className="team-stat-label">In Progress</span>
              </div>
              <div className="team-stat-card">
                <FaExclamationCircle size={24} color="#ef4444" />
                <span className="team-stat-num">{beneficiaries.filter((b) => b.status === 'open').length}</span>
                <span className="team-stat-label">Open</span>
              </div>
            </div>
          </div>
        )}
        {subTab === 'beneficiaries' && (
          <div className="team-dash-card">
            <h3><FaHandshake style={{ color: '#8b5cf6' }} /> Assigned Beneficiaries ({beneficiaries.length})</h3>
            {beneficiaries.length === 0 ? (
              <div className="empty-state"><FaHandshake size={32} style={{ color: '#d1d5db' }} /><p>No beneficiaries assigned yet.</p></div>
            ) : (
              <div className="team-dash-list">
                {beneficiaries.map((b) => (
                  <div key={b._id || b.id} className="team-dash-item">
                    <div className="team-dash-item-main">
                      <strong>{b.name}</strong>
                      <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{b.issue?.slice(0, 120)}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{b.location} {b.phone ? `• ${b.phone}` : ''}</span>
                    </div>
                    <div className="team-dash-item-actions">
                      <select value={b.status} onChange={(e) => updateBeneficiaryStatus(b._id || b.id, e.target.value)} className="beneficiary-status-select">
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <span className={`ticket-status ${b.status === 'resolved' || b.status === 'closed' ? 'status-resolved' : b.status === 'in-progress' ? 'status-in-progress' : 'status-open'}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {subTab === 'tickets' && (
          <div className="team-dash-card">
            <h3><FaTicketAlt style={{ color: '#f59e0b' }} /> All Support Tickets</h3>
            {ticketsLoading ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Loading tickets...</p>
            ) : teamTickets.length === 0 ? (
              <div className="empty-state"><FaTicketAlt size={32} style={{ color: '#d1d5db' }} /><p>No tickets in the system.</p></div>
            ) : (
              <div className="team-dash-list">
                {teamTickets.map((t) => (
                  <div key={t._id} className="team-dash-item">
                    <div className="team-dash-item-main">
                      <strong>{t.title}</strong>
                      <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{t.description?.slice(0, 100)}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>by {t.userName} • {t.category}</span>
                    </div>
                    <span className={`ticket-status ${t.status === 'resolved' || t.status === 'closed' ? 'status-resolved' : t.status === 'in-progress' ? 'status-in-progress' : 'status-open'}`}>{t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function DashboardView({ tickets, user }) {
  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'in-progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const yearStr = new Date().getFullYear();
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const recentTickets = tickets.slice(0, 5);
  const maxTicket = Math.max(tickets.length, 1);

  return (
    <>
      <div className="adm-page-header" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', color: '#fff', borderRadius: '12px', padding: '1.8rem 2rem' }}>
        <h2 style={{ color: '#fff', margin: '0 0 0.3rem' }}>{greeting}, {user?.name?.split(' ')[0] || 'there'}!</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}>Here's an overview of your support activity.</p>
      </div>

      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><FaTicketAlt /></div>
          <div className="adm-stat-info"><strong>{tickets.length}</strong><span>Total Tickets</span></div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><FaExclamationCircle /></div>
          <div className="adm-stat-info"><strong>{openCount}</strong><span>Open / In Progress</span></div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><FaCheckCircle /></div>
          <div className="adm-stat-info"><strong>{resolvedCount}</strong><span>Resolved / Closed</span></div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}><FaClock /></div>
          <div className="adm-stat-info"><strong>{todayStr}</strong><span>{yearStr}</span></div>
        </div>
      </div>

      <div className="adm-chart-section">
        <div className="adm-chart-header"><FaTicketAlt /> Ticket Status</div>
        <div className="adm-chart-bars">
          {[
            { label: 'Open', count: tickets.filter((t) => t.status === 'open').length, color: '#f59e0b' },
            { label: 'In Progress', count: tickets.filter((t) => t.status === 'in-progress').length, color: '#3b82f6' },
            { label: 'Resolved', count: tickets.filter((t) => t.status === 'resolved').length, color: '#10b981' },
            { label: 'Closed', count: tickets.filter((t) => t.status === 'closed').length, color: '#6b7280' },
          ].map((item) => (
            <div key={item.label} className="adm-chart-row">
              <span className="adm-chart-label">{item.label}</span>
              <div className="adm-chart-track">
                <div className="adm-chart-fill" style={{ width: `${(item.count / maxTicket) * 100}%`, background: item.color }} />
              </div>
              <span className="adm-chart-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="adm-chart-row-group">
        <div className="adm-chart-sub-card">
          <h4>Recent Tickets</h4>
          {recentTickets.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}>
              <FaTicketAlt size={28} style={{ color: '#d1d5db' }} />
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem' }}>No tickets yet.</p>
            </div>
          ) : (
            <div className="adm-chart-sub-items">
              {recentTickets.map((t) => (
                <div key={t._id || t.id} className="adm-chart-sub-item">
                  <span style={{ background: t.status === 'open' ? '#f59e0b' : t.status === 'in-progress' ? '#3b82f6' : t.status === 'resolved' ? '#10b981' : '#6b7280' }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title || 'Untitled'}</span>
                  <strong style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>{t.status}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="adm-chart-sub-card">
          <h4>Categories</h4>
          {tickets.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}>
              <FaLightbulb size={28} style={{ color: '#d1d5db' }} />
              <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem' }}>No data yet.</p>
            </div>
          ) : (
            <div className="adm-chart-sub-items">
              {['general', 'hardware', 'software', 'virus', 'network', 'training'].map((cat) => {
                const count = tickets.filter((t) => t.category === cat).length;
                if (count === 0) return null;
                return (
                  <div key={cat} className="adm-chart-sub-item">
                    <span style={{ background: '#3b82f6' }} />
                    <span style={{ flex: 1, textTransform: 'capitalize' }}>{cat}</span>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [tab, setTab] = useState('dashboard');
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
  const [tickets, setTickets] = useState([]);
  const [teamData, setTeamData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

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

  useEffect(() => {
    if (!user) return;
    const t = localStorage.getItem('cshub_token');
    fetch(`${API_BASE}/api/auth/team-status`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((data) => setTeamData(data))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const t = localStorage.getItem('cshub_token');
    fetch(`${API_BASE}/api/tickets`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTickets(data); })
      .catch(() => {});
  }, [user]);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (tickets.length > 0) {
      const openTickets = tickets.filter(t => t.status === 'open');
      const items = openTickets.map(t => ({
        id: t._id || t.id, type: 'ticket', icon: '🎫',
        title: t.title || 'Ticket update',
        sub: `${t.category || 'general'} — ${new Date(t.createdAt).toLocaleString()}`,
      }));
      setNotifications(items);
      setUnreadCount(items.length);
    }
  }, [tickets]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const handleNotifClick = (item) => {
    setNotifOpen(false);
    setTab('tickets');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const sidebarGroups = [...SIDEBAR_GROUPS];
  if (teamData?.isTeamMember) {
    sidebarGroups.push({
      label: 'ACCOUNT',
      items: [{ key: 'team', icon: <FaUserTie />, label: 'Team Dashboard' }],
    });
  }

  const filteredTickets = searchQuery.trim()
    ? tickets.filter((t) => t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase()) || t.category?.toLowerCase().includes(searchQuery.toLowerCase()))
    : tickets;

  return (
    <div className="adm-layout">
      {sidebarOpen && isMobile && <div className="adm-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`adm-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="adm-sidebar-header">
          <div className="adm-sidebar-logo">
            <img src="/LOGO IMAGE.png" alt="CS Hub" />
            <div>
              <strong>CS Hub</strong>
              <span>User Panel</span>
            </div>
          </div>
        </div>
        <div className="adm-sidebar-user">
          <div className="adm-sidebar-avatar">{initials}</div>
          <div className="adm-sidebar-user-info">
            <span className="adm-sidebar-user-name">{user?.name || 'User'}</span>
            <span className="adm-sidebar-user-role">{teamData?.isTeamMember ? 'Team Member' : 'User'}</span>
          </div>
        </div>
        <nav className="adm-sidebar-nav">
          {sidebarGroups.map((group) => (
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
                      <button onClick={() => { setNotifOpen(false); setTab('tickets'); }}>View all</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="adm-header-user" ref={profileRef}>
              <button className="adm-header-user-btn" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="adm-header-avatar">{initials}</div>
                <span className="adm-header-name">{user?.name || 'User'}</span>
              </button>
              {profileOpen && (
                <div className="adm-profile-dropdown">
                  <div className="adm-profile-dropdown-header">
                    <div className="adm-profile-dropdown-avatar">{initials}</div>
                    <div>
                      <div className="adm-profile-dropdown-name">{user?.name || 'User'}</div>
                      <div className="adm-profile-dropdown-email">{user?.email || ''}</div>
                      <span className="adm-profile-role-badge"><FaUserShield /> {teamData?.isTeamMember ? 'Team Member' : 'User'}</span>
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
          {teamData?.application && !teamData.isTeamMember && (
            <div className="dash-card" style={{ marginBottom: '1rem', padding: '1rem 1.2rem', borderLeft: `4px solid ${teamData.application.status === 'rejected' ? '#ef4444' : '#f59e0b'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                <FaUserTie style={{ fontSize: '1.2rem', color: teamData.application.status === 'rejected' ? '#ef4444' : '#f59e0b' }} />
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>Team Application — <span style={{ textTransform: 'uppercase', color: teamData.application.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>{teamData.application.status}</span></strong>
                  <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '2px 0 0' }}>
                    {teamData.application.status === 'pending' ? 'Your application is being reviewed.' : 'Your application was not approved at this time.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          {tab === 'dashboard' ? (
            <DashboardView tickets={searchQuery.trim() ? filteredTickets : tickets} user={user} />
          ) : tab === 'tickets' ? (
            <TicketsView tickets={searchQuery.trim() ? filteredTickets : tickets} setTickets={setTickets} />
          ) : tab === 'suggestions' ? (
            <SuggestionsView />
          ) : tab === 'chat' ? (
            <UserChatView />
          ) : tab === 'team' && teamData?.isTeamMember ? (
            <TeamView teamData={teamData} setTeamData={setTeamData} />
          ) : (
            <UserChatView />
          )}
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
