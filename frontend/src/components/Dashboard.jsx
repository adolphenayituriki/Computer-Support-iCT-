import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import UserChatView from './UserChatView';
import { FaTicketAlt, FaClock, FaCheckCircle, FaExclamationCircle, FaTrash, FaEdit, FaSave, FaTimes, FaEye, FaUndo, FaLightbulb, FaReply, FaComments, FaUserTie, FaHandshake, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBars, FaTachometerAlt, FaListUl, FaUsers, FaClipboardList } from 'react-icons/fa';
import API_BASE from '../api';

const token = () => localStorage.getItem('cshub_token');

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
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...editForm } : t)));
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
        setTickets((prev) => prev.filter((t) => t.id !== id));
        if (viewTicket?.id === id) setViewTicket(null);
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
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      if (viewTicket?.id === id) setViewTicket((prev) => ({ ...prev, status }));
      showToast(status === 'closed' ? 'Ticket resolved!' : 'Ticket reopened.');
    } catch {}
  };

  const startEdit = (t) => {
    setEditingId(t.id);
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
      const res = await fetch(`${API_BASE}/api/tickets/${viewTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ text: replyText }),
      });
      const data = await res.json();
      if (res.ok) {
        setViewTicket(data);
        setTickets((prev) => prev.map((t) => (t.id === data.id ? data : t)));
        setReplyText('');
      } else {
        showToast('Failed to send.', 'error');
      }
    } catch { showToast('Could not reach server.', 'error'); }
    setSendingReply(false);
  };

  if (viewTicket) {
    const msgs = viewTicket.messages || [];
    return (
      <>
        <div className="dash-welcome" style={{ marginTop: '1.5rem' }}>
          <button className="btn btn-outline" onClick={() => setViewTicket(null)} style={{ marginRight: '1rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
            <FaTimes /> Back
          </button>
          <div>
            <h2 style={{ fontSize: '1.2rem' }}>{viewTicket.title}</h2>
            <span className={`ticket-status status-${viewTicket.status}`}>
              {viewTicket.status.toUpperCase()}
            </span>
            <span className="ticket-category" style={{ marginLeft: '0.5rem' }}>{viewTicket.category}</span>
          </div>
        </div>
        <div className="dash-card" style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '1rem', lineHeight: '1.7', color: '#334155', marginBottom: '1.5rem' }}>{viewTicket.description}</p>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            Submitted {new Date(viewTicket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            {viewTicket.status === 'open' && (
              <button className="btn" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }} onClick={() => handleStatus(viewTicket.id, 'closed')}>
                <FaCheckCircle style={{ marginRight: '0.4rem' }} /> Mark Resolved
              </button>
            )}
            {viewTicket.status === 'closed' && (
              <button className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }} onClick={() => handleStatus(viewTicket.id, 'open')}>
                <FaUndo style={{ marginRight: '0.4rem' }} /> Reopen
              </button>
            )}
            <button className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => { handleDelete(viewTicket.id); }}>
              <FaTrash style={{ marginRight: '0.4rem' }} /> Delete
            </button>
          </div>
        </div>
        <div className="dash-card" style={{ marginTop: '1rem' }}>
          <h4 style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaReply style={{ transform: 'scaleX(-1)' }} /> Conversation ({msgs.length})</h4>
          <div className="msg-thread">
            {msgs.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>No messages yet.</p>
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
            <div ref={msgEndRef} />
          </div>
          <div className="msg-reply-form" style={{ marginTop: '0.7rem' }}>
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
                <div key={t.id} className="ticket-item" style={{ cursor: 'pointer' }} onClick={() => setViewTicket(t)}>
                  <div className="ticket-top">
                    <span className={`ticket-status status-${t.status}`}>
                      {t.status === 'in-progress' ? 'IN PROGRESS' : t.status.toUpperCase()}
                    </span>
                    <span className="ticket-category">{t.category}</span>
                    <div className="ticket-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="ticket-action-btn" title="View" onClick={() => setViewTicket(t)}><FaEye /></button>
                      <button className="ticket-action-btn" title="Edit" onClick={() => startEdit(t)}><FaEdit /></button>
                      <button className="ticket-action-btn" title="Delete" onClick={() => handleDelete(t.id)} style={{ color: '#ef4444' }}><FaTrash /></button>
                    </div>
                  </div>

                  {editingId === t.id ? (
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
                        <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} disabled={savingId === t.id} onClick={() => handleUpdate(t.id)}>{savingId === t.id ? <><span className="btn-spinner"></span></> : <><FaSave /> Save</>}</button>
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
                            <button className="btn-link" style={{ fontSize: '0.78rem', color: '#16a34a' }} onClick={() => handleStatus(t.id, 'resolved')}>
                              <FaCheckCircle style={{ marginRight: '0.3rem' }} /> Resolve
                            </button>
                          )}
                          {t.status === 'resolved' && (
                            <button className="btn-link" style={{ fontSize: '0.78rem', color: '#f59e0b' }} onClick={() => handleStatus(t.id, 'open')}>
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
      const res = await fetch(`${API_BASE}/api/suggestions/${viewSug.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ text: sugReplyText }),
      });
      const data = await res.json();
      if (res.ok) {
        setViewSug(data);
        setSuggestions((prev) => prev.map((s) => (s.id === data.id ? data : s)));
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

  if (viewSug) {
    const msgs = viewSug.messages || [];
    return (
      <div className="dashboard-grid">
        <div className="dash-card request-card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button className="btn btn-outline btn-sm" onClick={() => setViewSug(null)}><FaTimes /> Back</button>
            <h3 style={{ margin: 0 }}>{viewSug.title}</h3>
          </div>
          <p style={{ lineHeight: '1.7', color: '#334155', marginBottom: '1rem' }}>{viewSug.description}</p>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
            {new Date(viewSug.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>

          <h4 style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaReply style={{ transform: 'scaleX(-1)' }} /> Conversation ({msgs.length})</h4>
          <div className="msg-thread">
            {msgs.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>No messages yet.</p>
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
            <div ref={sugMsgEndRef} />
          </div>
          <div className="msg-reply-form" style={{ marginTop: '0.7rem' }}>
            <input
              type="text"
              placeholder="Type your reply..."
              value={sugReplyText}
              onChange={(e) => setSugReplyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSugReply(); } }}
            />
            <button className="btn btn-sm" disabled={sugSendingReply || !sugReplyText.trim()} onClick={handleSugReply}>{sugSendingReply ? <span className="btn-spinner"></span> : 'Send'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      <div className="dash-card request-card">
        <h3><FaLightbulb style={{ marginRight: '0.5rem', color: '#FFCE08' }} /> Suggest a Service</h3>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
          Tell us what support or service you want us to add. We review every suggestion.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="What service would you like to see?"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            rows="4"
            placeholder="Describe your idea in detail..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <button type="submit" className="btn" disabled={suggesting}>{suggesting ? <><span className="btn-spinner"></span> Submitting...</> : 'Submit Suggestion'}</button>
        </form>
        {feedback && <p className="form-feedback" style={{ marginTop: '0.8rem' }}>{feedback}</p>}
      </div>

      <div className="dash-card tickets-card">
        <h3>My Suggestions ({suggestions.length})</h3>
        {suggestions.length === 0 ? (
          <div className="empty-state">
            <FaLightbulb size={40} style={{ color: '#d1d5db' }} />
            <p>No suggestions yet.</p>
            <span>Share your ideas to help us improve.</span>
          </div>
        ) : (
          <div className="ticket-list">
            {suggestions.map((s) => (
              <div key={s.id} className="ticket-item" style={{ borderLeftColor: '#60a5fa', cursor: 'pointer' }} onClick={() => setViewSug(s)}>
                <h4 style={{ color: '#1e1b4b', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{s.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.5' }}>{s.description}</p>
                <span className="ticket-date">
                  {new Date(s.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                {(s.messages || []).length > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#60a5fa', marginLeft: '0.5rem' }}>
                    <FaReply style={{ transform: 'scaleX(-1)', marginRight: '0.2rem' }} />{s.messages.length}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <button className="dash-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
          <FaBars />
        </button>
        <div className={`dash-sidebar${sidebarOpen ? ' open' : ''}`} role="navigation" aria-label="Dashboard navigation">
          <div className="dash-sidebar-header">
            <div className="dash-sidebar-avatar">{initials}</div>
            <div className="dash-sidebar-name">{user?.name}</div>
            <div className="dash-sidebar-role">{sidebarRole}</div>
          </div>
          <div className="dash-sidebar-nav">
            {sidebarTabs.map((t) => (
              <button
                key={t.key}
                className={`dash-sidebar-tab${tab === t.key ? ' active' : ''}`}
                onClick={() => { setTab(t.key); setSidebarOpen(false); }}
              >
                <span className="dash-sidebar-tab-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="dash-main">
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
