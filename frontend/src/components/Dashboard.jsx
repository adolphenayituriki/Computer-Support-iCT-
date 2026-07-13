import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useSidebar } from '../SidebarContext';
import { useToast } from '../ToastContext';
import UserChatView from './UserChatView';
import SettingsModal from './SettingsModal';
import HelpModal from './HelpModal';
import { FaTicketAlt, FaClock, FaCheckCircle, FaExclamationCircle, FaTrash, FaEdit, FaSave, FaTimes, FaEye, FaUndo, FaLightbulb, FaReply, FaComments, FaUserTie, FaHandshake, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBars, FaTachometerAlt, FaListUl, FaUsers, FaClipboardList, FaCog, FaAngleLeft, FaAngleRight, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
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

  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in-progress').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
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
    <div className="dash-modal-overlay" onClick={() => setViewTicket(null)}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dash-modal-close" onClick={() => setViewTicket(null)}><FaTimes /></button>
        <div className="dash-modal-header">
          <h2>{viewTicket.title}</h2>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
            <span className={`ticket-status status-${viewTicket.status}`}>{viewTicket.status.toUpperCase()}</span>
            <span className="ticket-category">{viewTicket.category}</span>
          </div>
        </div>
        <div className="dash-modal-body">
          <p className="dash-modal-desc">{viewTicket.description}</p>
          <p className="dash-modal-date">Submitted {new Date(viewTicket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {viewTicket.status === 'open' && (
              <button className="btn btn-sm" onClick={() => handleStatus(tid(viewTicket), 'closed')}><FaCheckCircle style={{ marginRight: '0.3rem' }} /> Mark Resolved</button>
            )}
            {viewTicket.status === 'closed' && (
              <button className="btn btn-outline btn-sm" onClick={() => handleStatus(tid(viewTicket), 'open')}><FaUndo style={{ marginRight: '0.3rem' }} /> Reopen</button>
            )}
            <button className="btn btn-outline btn-sm" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => { handleDelete(tid(viewTicket)); }}><FaTrash style={{ marginRight: '0.3rem' }} /> Delete</button>
          </div>
        </div>
        <div className="dash-modal-conv">
          <h4><FaReply style={{ transform: 'scaleX(-1)' }} /> Conversation ({viewTicket.messages?.length || 0})</h4>
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
  ) : null;

  return (
    <>
      <div className="dash-stats">
        <div className="dash-stat-card">
          <FaTicketAlt className="dash-stat-icon" />
          <div><strong>{tickets.length}</strong><span>Total Tickets</span></div>
        </div>
        <div className="dash-stat-card">
          <FaExclamationCircle className="dash-stat-icon" style={{ color: '#f59e0b' }} />
          <div><strong>{openTickets}</strong><span>Open / In Progress</span></div>
        </div>
        <div className="dash-stat-card">
          <FaCheckCircle className="dash-stat-icon" style={{ color: '#16a34a' }} />
          <div><strong>{resolvedTickets}</strong><span>Resolved / Closed</span></div>
        </div>
        <div className="dash-stat-card">
          <FaClock className="dash-stat-icon" style={{ color: '#3b82f6' }} />
          <div><strong>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong><span>{new Date().getFullYear()}</span></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dash-card request-card">
          <h3>New Support Request</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title (e.g. Laptop won't boot)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="general">General</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="virus">Virus / Malware</option>
              <option value="network">Network</option>
              <option value="training">Training</option>
            </select>
            <textarea
              rows="4"
              placeholder="Describe your issue in detail..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
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
                        <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} disabled={savingId === tid(t)} onClick={() => handleUpdate(tid(t))}>{savingId === tid(t) ? <><span className="btn-spinner"></span></> : <><FaSave /> Save</>}</button>
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
    <div className="dash-modal-overlay" onClick={() => setViewSug(null)}>
      <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dash-modal-close" onClick={() => setViewSug(null)}><FaTimes /></button>
        <div className="dash-modal-header">
          <h2>{viewSug.title}</h2>
        </div>
        <div className="dash-modal-body">
          <p className="dash-modal-desc">{viewSug.description}</p>
          <p className="dash-modal-date">{new Date(viewSug.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="dash-modal-conv">
          <h4><FaReply style={{ transform: 'scaleX(-1)' }} /> Conversation ({viewSug.messages?.length || 0})</h4>
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
  ) : null;

  return (
    <div className="dashboard-grid">
      <div className="sug-form-card">
        <div className="sug-form-header">
          <FaLightbulb className="sug-form-icon" />
          <div>
            <h3>Suggest a Service</h3>
            <p>Tell us what support or service you want us to add. We review every suggestion.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="What service would you like to see?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            rows="3"
            placeholder="Describe your idea in detail..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
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
      {sugModalContent}
    </div>
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
                    <select
                      value={b.status}
                      onChange={(e) => updateBeneficiaryStatus(b._id || b.id, e.target.value)}
                      className="beneficiary-status-select"
                    >
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
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState('tickets');
  const [teamData, setTeamData] = useState(null);
  const [teamLoading, setTeamLoading] = useState(true);
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('cshub_token');
    fetch(`${API_BASE}/api/auth/team-status`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setTeamData(data); setTeamLoading(false); })
      .catch(() => setTeamLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const tok = localStorage.getItem('cshub_token');
    fetch(`${API_BASE}/api/tickets`, { headers: { Authorization: `Bearer ${tok}` } })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTickets(data); })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setSidebarOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const handleLogout = () => {
    localStorage.removeItem('cshub_token');
    navigate('/');
  };

  const sidebarTabs = [
    { key: 'tickets', icon: <FaTicketAlt />, label: 'Support Tickets' },
    { key: 'suggestions', icon: <FaLightbulb />, label: 'Suggestions' },
    { key: 'chat', icon: <FaComments />, label: 'Messages' },
  ];

  if (teamData?.isTeamMember) {
    sidebarTabs.push({ key: 'team', icon: <FaUserTie />, label: 'Team Dashboard' });
  }

  const sidebarRole = teamData?.isTeamMember ? 'Team Member' : 'User Dashboard';

  return (
    <div className="dashboard">
      <div className="dash-layout">
        {sidebarOpen && <div className="dash-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
        <div className={`dash-sidebar${sidebarOpen ? ' open' : ''}${sidebarCollapsed ? ' collapsed' : ''}`} role="navigation" aria-label="Dashboard navigation">
          <button className="dash-sidebar-collapse" onClick={() => setSidebarCollapsed((v) => !v)} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {sidebarCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
          </button>
          <button className="dash-sidebar-rail-avatar" onClick={() => setSidebarOpen(true)} title={user?.name}>
            {initials}
          </button>
          <div className="dash-sidebar-header">
            <div className="dash-sidebar-avatar">{initials}</div>
            <div className={`dash-sidebar-name${sidebarCollapsed ? ' collapsed' : ''}`}>{user?.name}</div>
            <div className={`dash-sidebar-role${sidebarCollapsed ? ' collapsed' : ''}`}>{sidebarRole}</div>
          </div>
          <div className="dash-sidebar-nav">
            {sidebarTabs.map((t) => (
              <button
                key={t.key}
                className={`dash-sidebar-tab${tab === t.key ? ' active' : ''}`}
                onClick={() => {
                  if (isMobile && !sidebarOpen) {
                    setSidebarOpen(true);
                  } else {
                    setTab(t.key);
                    setSidebarOpen(false);
                  }
                }}
                title={sidebarCollapsed ? t.label : undefined}
              >
                <span className="dash-sidebar-tab-icon">{t.icon}</span>
                <span className={`dash-sidebar-tab-label${sidebarCollapsed ? ' collapsed' : ''}`}>{t.label}</span>
              </button>
            ))}
          </div>
          <div className="dash-sidebar-nav-bottom">
            <button className="dash-sidebar-tab" onClick={() => { if (isMobile && !sidebarOpen) { setSidebarOpen(true); } else { setSettingsOpen(true); setSidebarOpen(false); } }} title={sidebarCollapsed ? 'Settings' : undefined}>
              <span className="dash-sidebar-tab-icon"><FaCog /></span>
              <span className={`dash-sidebar-tab-label${sidebarCollapsed ? ' collapsed' : ''}`}>Settings</span>
            </button>
            <button className="dash-sidebar-tab" onClick={() => { if (isMobile && !sidebarOpen) { setSidebarOpen(true); } else { setHelpOpen(true); setSidebarOpen(false); } }} title={sidebarCollapsed ? 'Help' : undefined}>
              <span className="dash-sidebar-tab-icon"><FaQuestionCircle /></span>
              <span className={`dash-sidebar-tab-label${sidebarCollapsed ? ' collapsed' : ''}`}>Help</span>
            </button>
            <button className="dash-sidebar-tab" onClick={() => { if (isMobile && !sidebarOpen) { setSidebarOpen(true); } else { handleLogout(); } }} title={sidebarCollapsed ? 'Logout' : undefined}>
              <span className="dash-sidebar-tab-icon"><FaSignOutAlt /></span>
              <span className={`dash-sidebar-tab-label${sidebarCollapsed ? ' collapsed' : ''}`}>Logout</span>
            </button>
          </div>
          <button className="dash-sidebar-expand-btn" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle sidebar" title="Toggle sidebar">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 512" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><path d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34z"></path></svg>
          </button>
        </div>

        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
        {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}

        <div className="dash-main">
          <div className="dash-top-tabs">
            {sidebarTabs.map((t) => (
              <button
                key={t.key}
                className={`dash-top-tab${tab === t.key ? ' active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                <span className="dash-top-tab-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
          {teamData?.application && !teamData.isTeamMember && (
            <div className="dash-card" style={{ marginBottom: '1rem', padding: '1rem 1.2rem', borderLeft: `4px solid ${teamData.application.status === 'rejected' ? '#ef4444' : '#f59e0b'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                <FaUserTie style={{ fontSize: '1.2rem', color: teamData.application.status === 'rejected' ? '#ef4444' : '#f59e0b' }} />
                <div>
                  <strong style={{ fontSize: '0.95rem' }}>Team Application — <span style={{ textTransform: 'uppercase', color: teamData.application.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>{teamData.application.status}</span></strong>
                  <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '2px 0 0' }}>
                    {teamData.application.status === 'pending' ? 'Your application is being reviewed. We\'ll notify you by email once a decision is made.' : 'Your application was not approved at this time. You may reapply in the future.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          {tab === 'tickets' ? (
            <TicketsView tickets={tickets} setTickets={setTickets} />
          ) : tab === 'suggestions' ? (
            <SuggestionsView />
          ) : tab === 'chat' ? (
            <UserChatView />
          ) : tab === 'team' && teamData?.isTeamMember ? (
            <TeamView teamData={teamData} setTeamData={setTeamData} />
          ) : (
            <UserChatView />
          )}
        </div>
      </div>
    </div>
  );
}
