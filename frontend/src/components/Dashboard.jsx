import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import UserChatView from './UserChatView';
import GroupChatView from './GroupChatView';
import HelpModal from './HelpModal';
import { cn } from '../lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  FaTicketAlt, FaClock, FaCheckCircle, FaExclamationCircle, FaTrash, FaEdit,
  FaSave, FaTimes, FaEye, FaUndo, FaLightbulb, FaReply, FaComments, FaUserTie,
  FaHandshake, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBars, FaTachometerAlt,
  FaCog, FaQuestionCircle, FaSignOutAlt, FaSearch, FaBell, FaUserShield, FaHome,
  FaBook, FaShieldAlt, FaVirus, FaWifi, FaLaptop, FaMicrosoft, FaHdd, FaKeyboard,
  FaCloud, FaHeadphones, FaGraduationCap, FaWhatsapp, FaExternalLinkAlt, FaPlus, FaWrench, FaUsers, FaHeadset, FaRocket, FaSpinner, FaChevronRight
} from 'react-icons/fa';
import { LayoutDashboard, Ticket, MessageSquare, Lightbulb, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
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
    label: 'Overview',
    items: [
      { key: 'analytics', icon: LayoutDashboard, label: 'Dashboard', color: 'text-indigo-400' },
      { key: 'courses', icon: FaGraduationCap, label: 'My Courses', color: 'text-sky-400' },
      { key: 'tickets', icon: Ticket, label: 'Tickets', color: 'text-amber-400' },
      { key: 'suggestions', icon: Lightbulb, label: 'Suggestions', color: 'text-orange-400' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { key: 'chat', icon: MessageSquare, label: 'Messages', color: 'text-emerald-400' },
      { key: 'group-chat', icon: FaUsers, label: 'Group Chat', color: 'text-violet-400' },
      { key: 'help', icon: FaBook, label: 'Help Center', color: 'text-cyan-400' },
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
        <div><h1>Support Tickets</h1><p>Manage your support requests and track their status.</p></div>
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

      <div className="adm-chart-section" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}><FaPlus /> New Support Request</div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input type="text" placeholder="Title (e.g. Laptop won't boot)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="general">General</option>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="virus">Virus / Malware</option>
            <option value="network">Network</option>
            <option value="training">Training</option>
          </select>
          <textarea rows="3" placeholder="Describe your issue in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn" disabled={submitting}>{submitting ? <><span className="btn-spinner"></span> Submitting...</> : <><FaPlus /> Submit Request</>}</button>
          </div>
          {message && <p className="form-feedback">{message}</p>}
        </form>
      </div>

      <div className="adm-chart-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaTicketAlt /> My Tickets ({tickets.length})</div>
          <div className="dash-filters">
            {['all', 'open', 'closed'].map((f) => (
              <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {filteredTickets.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <FaTicketAlt size={24} style={{ color: '#3b82f6' }} />
            </div>
            <p style={{ marginTop: '1rem', fontWeight: 600 }}>No {filter !== 'all' ? filter : ''} tickets yet.</p>
            <span>Submit a support request above to get started.</span>
          </div>
        ) : (
          <div className="ticket-list">
            {filteredTickets.map((t) => (
              <div key={tid(t)} className="ticket-item" onClick={() => setViewTicket(t)}>
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
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1f2937', margin: '0.5rem 0 0.25rem' }}>{t.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{t.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {new Date(t.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <div onClick={(e) => e.stopPropagation()}>
                        {(t.status === 'open' || t.status === 'in-progress') && (
                          <button className="btn-link" style={{ fontSize: '0.78rem', color: '#10b981' }} onClick={() => handleStatus(tid(t), 'resolved')}>
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
      {modalContent}
    </>
  );
}

function SuggestionsView({ onCountChange }) {
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
      .then((data) => { setSuggestions(data); onCountChange?.(data.length); })
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
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <FaLightbulb size={24} style={{ color: '#8b5cf6' }} />
              </div>
              <p style={{ marginTop: '1rem', fontWeight: 600 }}>No suggestions yet.</p>
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
              <h3><FaUserTie style={{ color: '#6B7280' }} /> My Profile</h3>
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
                <FaHandshake size={24} color="#6B7280" />
                <span className="team-stat-num">{beneficiaries.length}</span>
                <span className="team-stat-label">Beneficiaries</span>
              </div>
              <div className="team-stat-card">
                <FaCheckCircle size={24} color="#6B7280" />
                <span className="team-stat-num">{beneficiaries.filter((b) => b.status === 'resolved' || b.status === 'closed').length}</span>
                <span className="team-stat-label">Resolved</span>
              </div>
              <div className="team-stat-card">
                <FaClock size={24} color="#6B7280" />
                <span className="team-stat-num">{beneficiaries.filter((b) => b.status === 'in-progress').length}</span>
                <span className="team-stat-label">In Progress</span>
              </div>
              <div className="team-stat-card">
                <FaExclamationCircle size={24} color="#6B7280" />
                <span className="team-stat-num">{beneficiaries.filter((b) => b.status === 'open').length}</span>
                <span className="team-stat-label">Open</span>
              </div>
            </div>
          </div>
        )}
        {subTab === 'beneficiaries' && (
          <div className="team-dash-card">
            <h3><FaHandshake style={{ color: '#6B7280' }} /> Assigned Beneficiaries ({beneficiaries.length})</h3>
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
            <h3><FaTicketAlt style={{ color: '#6B7280' }} /> All Support Tickets</h3>
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

function DashboardView({ tickets, suggestionsCount, user }) {
  const openCount = tickets.filter((t) => t.status === 'open' || t.status === 'in-progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length;
  const maxTicket = Math.max(tickets.length, 1);

  return (
    <>
      <div className="adm-page-header">
        <div><h1>Analytics</h1><p>Overview of your support activity</p></div>
      </div>

      <div className="adm-stats-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><FaTicketAlt /></div>
          <div className="adm-stat-info"><strong>{tickets.length}</strong><span>Tickets</span></div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}><FaExclamationCircle /></div>
          <div className="adm-stat-info"><strong>{openCount}</strong><span>Open</span></div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><FaCheckCircle /></div>
          <div className="adm-stat-info"><strong>{resolvedCount}</strong><span>Resolved</span></div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}><FaLightbulb /></div>
          <div className="adm-stat-info"><strong>{suggestionsCount || 0}</strong><span>Suggestions</span></div>
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
          {tickets.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem 1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <FaTicketAlt size={20} style={{ color: '#3b82f6' }} />
              </div>
              <p style={{ marginTop: '0.7rem', fontSize: '0.85rem' }}>No tickets yet.</p>
            </div>
          ) : (
            <div className="adm-chart-sub-items">
              {tickets.slice(0, 5).map((t) => (
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
            <div className="empty-state" style={{ padding: '1.5rem 1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <FaLightbulb size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <p style={{ marginTop: '0.7rem', fontSize: '0.85rem' }}>No data yet.</p>
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

function HelpCenterView({ setTab }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [faqSearch, setFaqSearch] = useState('');

  const faqs = [
    { q: 'How do I submit a support ticket?', a: 'Go to the Tickets tab and fill out the form with your issue title, category, and description. Our team will respond through the ticket conversation.' },
    { q: 'How do I suggest a new service?', a: 'Navigate to the Suggestions tab and describe the service or feature you\'d like us to add. We review every suggestion.' },
    { q: 'How can I contact support quickly?', a: 'Use the WhatsApp button (bottom-right) to reach us instantly, or call +250 780 505 948. You can also message us directly through the Messages tab.' },
    { q: 'What services does CS Hub offer?', a: 'We provide repair & troubleshooting, software installation, virus removal, network fixes, hardware upgrades, peripheral setup, data backup, security setup, email/cloud configuration, and computer training.' },
    { q: 'How do I change my password?', a: 'Click your profile icon in the top-right corner, select Settings, then switch to the Password tab to update it.' },
    { q: 'Can I track my support requests?', a: 'Yes! The Analytics tab shows your ticket statistics, and the Tickets tab lets you filter by status (open, in-progress, resolved, closed) and view conversations.' },
    { q: 'How do I join the CS Hub team?', a: 'Click "Join Our Team" on the homepage or footer. Fill out the application form with your skills and experience. Admins will review and respond.' },
    { q: 'Is my data secure?', a: 'Yes. We use JWT authentication, encrypted passwords, and secure API endpoints. Your personal data is never shared with third parties.' },
  ];

  const filteredFaqs = faqs.filter((f) =>
    !faqSearch || f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const quickLinks = [
    { icon: <FaTicketAlt />, label: 'Submit Ticket', desc: 'Report an issue', tab: 'tickets', color: '#6B7280', gradient: 'linear-gradient(135deg, #6B7280, #4b5563)' },
    { icon: <FaLightbulb />, label: 'Suggest Idea', desc: 'Share feedback', tab: 'suggestions', color: '#6B7280', gradient: 'linear-gradient(135deg, #6B7280, #4b5563)' },
    { icon: <FaComments />, label: 'Message Us', desc: 'Chat with us', tab: 'chat', color: '#6B7280', gradient: 'linear-gradient(135deg, #6B7280, #4b5563)' },
    { icon: <FaWhatsapp />, label: 'WhatsApp', desc: 'Join community', href: 'https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN', color: '#6B7280', gradient: 'linear-gradient(135deg, #6B7280, #4b5563)' },
    { icon: <FaPhone />, label: 'Call Us', desc: '+250 780 505 948', href: 'tel:+250780505948', color: '#6B7280', gradient: 'linear-gradient(135deg, #6B7280, #4b5563)' },
  ];

  const services = [
    { icon: <FaWrench />, name: 'Repair & Troubleshooting', desc: 'Laptop/PC optimization, crash diagnosis, hardware advice', color: '#6B7280' },
    { icon: <FaLaptop />, name: 'Software Installation', desc: 'Office, browsers, antivirus, school apps, drivers', color: '#6B7280' },
    { icon: <FaVirus />, name: 'Virus Removal', desc: 'Malware, trojan, ransomware removal & security setup', color: '#6B7280' },
    { icon: <FaShieldAlt />, name: 'Security Setup', desc: 'Antivirus, firewall, encryption, privacy hardening', color: '#6B7280' },
    { icon: <FaWifi />, name: 'Network Support', desc: 'Wi-Fi, router, DNS, VPN configuration & fixes', color: '#6B7280' },
    { icon: <FaHdd />, name: 'Hardware Upgrade', desc: 'RAM, SSD, GPU upgrades with professional install', color: '#6B7280' },
    { icon: <FaKeyboard />, name: 'Peripheral Setup', desc: 'Printers, scanners, webcams, USB devices', color: '#6B7280' },
    { icon: <FaEnvelope />, name: 'Email & Cloud', desc: 'Gmail, Outlook, Google Drive, OneDrive setup', color: '#6B7280' },
    { icon: <FaCloud />, name: 'Data Backup', desc: 'Automated backup strategy, local & cloud', color: '#6B7280' },
    { icon: <FaHeadphones />, name: 'Remote Support', desc: 'Instant remote desktop help from our technicians', color: '#6B7280' },
  ];

  return (
    <>
      <div className="hc-hero">
        <div className="hc-hero-content">
          <div className="hc-hero-badge"><FaHeadset /> Help Center</div>
          <h2>How can we help you?</h2>
          <p>Find answers, get support, and explore our services — all in one place.</p>
          <div className="hc-hero-actions">
            <button className="hc-hero-btn primary" onClick={() => setTab?.('tickets')}>
              <FaTicketAlt /> Submit a Ticket
            </button>
            <button className="hc-hero-btn secondary" onClick={() => setTab?.('chat')}>
              <FaComments /> Live Chat
            </button>
          </div>
        </div>
        <div className="hc-hero-illustration">
          <div className="hc-hero-circles">
            <div className="hc-hero-circle c1" />
            <div className="hc-hero-circle c2" />
            <div className="hc-hero-circle c3" />
            <FaHeadset className="hc-hero-icon" />
          </div>
        </div>
      </div>

      <div className="hc-section">
        <h3 className="hc-section-title">Quick Actions</h3>
        <div className="hc-quick-grid">
          {quickLinks.map((link) => (
            link.href ? (
              <a key={link.label} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="hc-quick-card">
                <div className="hc-quick-icon" style={{ background: link.gradient }}>{link.icon}</div>
                <div className="hc-quick-text">
                  <span className="hc-quick-label">{link.label}</span>
                  <span className="hc-quick-desc">{link.desc}</span>
                </div>
                <FaChevronRight className="hc-quick-arrow" />
              </a>
            ) : (
              <button key={link.label} className="hc-quick-card" onClick={() => setTab?.(link.tab)}>
                <div className="hc-quick-icon" style={{ background: link.gradient }}>{link.icon}</div>
                <div className="hc-quick-text">
                  <span className="hc-quick-label">{link.label}</span>
                  <span className="hc-quick-desc">{link.desc}</span>
                </div>
                <FaChevronRight className="hc-quick-arrow" />
              </button>
            )
          ))}
        </div>
      </div>

      <div className="hc-section">
        <div className="hc-section-header">
          <h3 className="hc-section-title"><FaQuestionCircle /> Frequently Asked Questions</h3>
          <div className="hc-faq-search">
            <FaSearch />
            <input type="text" placeholder="Search questions..." value={faqSearch} onChange={(e) => setFaqSearch(e.target.value)} />
          </div>
        </div>
        <div className="hc-faq-list">
          {filteredFaqs.length === 0 && (
            <div className="hc-faq-empty">No matching questions found.</div>
          )}
          {filteredFaqs.map((faq, i) => (
            <div key={i} className={`hc-faq-item${openFaq === i ? ' open' : ''}`}>
              <button className="hc-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <span className={`hc-faq-chevron${openFaq === i ? ' rotated' : ''}`}><FaChevronRight /></span>
              </button>
              <div className="hc-faq-answer-wrap">
                {openFaq === i && <div className="hc-faq-a">{faq.a}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hc-section">
        <h3 className="hc-section-title"><FaRocket /> Services We Offer</h3>
        <div className="hc-services-grid">
          {services.map((svc) => (
            <div key={svc.name} className="hc-service-card">
              <div className="hc-service-icon" style={{ background: `${svc.color}12`, color: svc.color }}>{svc.icon}</div>
              <div className="hc-service-text">
                <strong>{svc.name}</strong>
                <span>{svc.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function MyCoursesView() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const tokenVal = localStorage.getItem('cshub_token');
    if (!tokenVal) { setLoading(false); return; }

    fetch(`${API_BASE}/api/enrollments/my`, {
      headers: { Authorization: `Bearer ${tokenVal}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setEnrollments(data);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  const enriched = enrollments.map((e) => ({
    enrollment: e.enrollment,
    course: e.enrollment?.courseId,
    progress: e.progress?.progress || 0,
    completed: e.progress?.completed || false,
    sections: e.progress?.sections || {},
    enrolledAt: e.enrollment?.enrolledAt,
  })).filter((e) => e.course);

  const filtered = filter === 'all' ? enriched
    : filter === 'completed' ? enriched.filter((e) => e.completed)
    : filter === 'progress' ? enriched.filter((e) => !e.completed && e.progress > 0)
    : enriched;

  const completedCount = enriched.filter((e) => e.completed).length;
  const progressCount = enriched.filter((e) => !e.completed && e.progress > 0).length;

  const getActionButton = (e) => {
    if (e.completed) return { label: 'Review Course', bg: '#10b981', color: '#fff' };
    if (e.progress > 0) return { label: 'Resume Course', bg: 'linear-gradient(135deg, #FFCE08, #f59e0b)', color: '#1e293b' };
    return { label: 'Start Learning', bg: 'linear-gradient(135deg, #FFCE08, #f59e0b)', color: '#1e293b' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <FaSpinner className="animate-spin" style={{ fontSize: '1.5rem', color: '#94a3b8' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <FaExclamationCircle style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Failed to load courses</h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{error}</p>
      </div>
    );
  }

  if (enriched.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <FaGraduationCap style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>No Courses Yet</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Enroll in courses to start learning and track your progress here.</p>
        <button onClick={() => window.open('/courses', '_blank')} style={{ padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #FFCE08, #f59e0b)', color: '#1e293b', border: 'none', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
          Browse Courses
        </button>
      </div>
    );
  }

  const modalItem = selectedCourse ? enriched.find((e) => (e.course?._id || e.course?.id) === selectedCourse) : null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>My Courses</h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0' }}>{enriched.length} enrolled &middot; {completedCount} completed &middot; {progressCount} in progress</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding: '0.4rem 0.85rem', borderRadius: '8px', border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: filter === f.key ? '#FFCE08' : '#f1f5f9',
                color: filter === f.key ? '#1e293b' : '#64748b',
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((e) => {
          const c = e.course;
          const pct = e.progress;
          const btn = getActionButton(e);
          return (
            <div key={e.enrollment?._id || e.course?._id}
              className="group rounded-xl border border-slate-200 bg-white overflow-hidden transition-all hover:shadow-md hover:border-slate-300 cursor-pointer flex flex-col"
              onClick={() => setSelectedCourse(c._id || c.id)}>
              <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 relative">
                {c.thumbnail ? (
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaGraduationCap className="text-3xl text-slate-200" />
                  </div>
                )}
                {e.completed && (
                  <div className="absolute top-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white">
                    <FaCheckCircle size={8} /> Done
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${c.category === 'hardware' ? 'bg-blue-100 text-blue-700' : c.category === 'software' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                    {c.category}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${c.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-700' : c.difficulty === 'intermediate' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                    {c.difficulty}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-slate-700 leading-tight">{c.title}</h3>
                <p className="text-[10px] text-slate-500 mb-2 line-clamp-2 flex-1 leading-relaxed">{c.description}</p>

                {!e.completed && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-semibold text-slate-500">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500 ease-out" style={{
                        width: `${pct}%`,
                        background: pct >= 100 ? '#10b981' : 'linear-gradient(90deg, #FFCE08, #f59e0b)',
                      }} />
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-slate-800 transition-colors">
                    {e.completed ? <><FaCheckCircle size={9} /> Review</> : pct > 0 ? <><FaPlay size={9} /> Continue</> : <><FaPlay size={9} /> Start</>}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modalItem && (
        <div className="adm-modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="adm-modal" style={{ maxWidth: '520px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header" style={{ padding: '0.75rem 1.25rem' }}>
              <h3 style={{ fontSize: '0.9rem', margin: 0 }}>{modalItem.course.title}</h3>
              <button className="adm-modal-close" onClick={() => setSelectedCourse(null)}><FaTimes /></button>
            </div>
            <div style={{ overflow: 'auto', flex: 1 }}>
              {modalItem.course.thumbnail && (
                <div style={{ width: '100%', height: '140px', overflow: 'hidden' }}>
                  <img src={modalItem.course.thumbnail} alt={modalItem.course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${modalItem.course.category === 'hardware' ? 'bg-blue-100 text-blue-700' : modalItem.course.category === 'software' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                    {modalItem.course.category}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${modalItem.course.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-700' : modalItem.course.difficulty === 'intermediate' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                    {modalItem.course.difficulty}
                  </span>
                  {modalItem.course.estimatedTime && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400"><FaClock size={9} /> {modalItem.course.estimatedTime}</span>
                  )}
                </div>

                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1rem' }}>{modalItem.course.description}</p>

                {!modalItem.completed && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#374151' }}>Progress</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: modalItem.completed ? '#10b981' : '#FFCE08' }}>{modalItem.progress}%</span>
                    </div>
                    <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '999px', transition: 'width 0.5s ease', background: modalItem.completed ? '#10b981' : 'linear-gradient(90deg, #FFCE08, #f59e0b)', width: `${modalItem.progress}%` }} />
                    </div>
                  </div>
                )}

                {modalItem.completed && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl mb-4 border border-emerald-200">
                    <FaCheckCircle className="text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-700">Course completed! You can review the material anytime.</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => { setSelectedCourse(null); window.open(`/courses/${modalItem.course._id || modalItem.course.id}`, '_blank'); }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all"
                    style={{ background: getActionButton(modalItem).bg, color: getActionButton(modalItem).color }}>
                    {getActionButton(modalItem).label}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
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
  const [tab, setTab] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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
  const [suggestionsCount, setSuggestionsCount] = useState(0);

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

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (dy > 60) return;
      if (dx > 70 && touchStartX < 40 && !sidebarOpen) {
        setSidebarOpen(true);
      } else if (dx < -70 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarOpen]);

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

  const pageTitles = {
    analytics: { title: 'Dashboard', sub: 'Welcome back, ' + (user?.name?.split(' ')[0] || 'User') },
    courses: { title: 'My Courses', sub: 'Continue learning where you left off' },
    tickets: { title: 'Tickets', sub: 'Submit and track support requests' },
    suggestions: { title: 'Suggestions', sub: 'Share your ideas with us' },
    chat: { title: 'Messages', sub: 'Real-time support chat' },
    'group-chat': { title: 'Group Chat', sub: 'Community group messaging' },
    help: { title: 'Help Center', sub: 'Find answers and guides' },
    team: { title: 'Team Dashboard', sub: 'Team member overview' },
  };

  const currentPage = pageTitles[tab] || pageTitles.analytics;

  const sidebarGroups = [...SIDEBAR_GROUPS];
  if (teamData?.isTeamMember) {
    sidebarGroups.push({
      label: 'ACCOUNT',
      items: [{ key: 'team', icon: FaUserTie, label: 'Team Dashboard', color: 'text-purple-400' }],
    });
  }

  const filteredTickets = searchQuery.trim()
    ? tickets.filter((t) => t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase()) || t.category?.toLowerCase().includes(searchQuery.toLowerCase()))
    : tickets;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <TooltipProvider delayDuration={0}>
        {sidebarOpen && isMobile && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={cn(
          'fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-slate-950 text-white transition-all duration-300 ease-in-out',
          'border-r border-white/5',
          collapsed ? 'w-[68px]' : 'w-[280px]',
          'max-lg:-translate-x-full max-lg:shadow-2xl',
          sidebarOpen && 'max-lg:translate-x-0',
        )}>
          {/* Header */}
          <div className={cn('flex items-center gap-3 border-b border-white/5', collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3')}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white p-0.5 shadow-lg shadow-black/20">
              <img src="/LOGO IMAGE.png" alt="CS Hub" className="h-full w-full rounded-[9px] object-contain" loading="lazy" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold tracking-tight text-white">CS Hub (iCT)</div>
                <div className="text-[10px] font-medium text-slate-500">User Panel</div>
              </div>
            )}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className={cn(
                'hidden lg:flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white',
                collapsed && 'hidden',
              )}
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
          </div>

          {/* Collapsed toggle */}
          {collapsed && (
            <div className="flex justify-center py-1.5">
              <button
                onClick={() => setCollapsed(false)}
                className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* User info (expanded only) */}
          {!collapsed && (
            <div className="mx-3 mt-3 flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2.5 border border-white/5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-yellow-400 text-xs font-bold text-slate-900">{initials}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-white truncate">{user?.name || 'User'}</div>
                <div className="text-[10px] text-slate-500">{teamData?.isTeamMember ? 'Team Member' : 'User'}</div>
              </div>
            </div>
          )}

          {/* Nav */}
          <ScrollArea className="flex-1 px-2 py-1">
            <nav className="flex flex-col gap-0.5">
              {sidebarGroups.map((group) => (
                <div key={group.label} className="mb-1">
                  {!collapsed && (
                    <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                      {group.label}
                    </div>
                  )}
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = tab === item.key;
                    const btn = (
                      <button
                        key={item.key}
                        onClick={() => { setTab(item.key); setSidebarOpen(false); }}
                        className={cn(
                          'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                          collapsed && 'justify-center px-0 py-2.5',
                          isActive
                            ? 'bg-white/[0.08] text-white'
                            : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-yellow-400 shadow-sm shadow-yellow-400/30" />
                        )}
                        <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-colors', isActive ? item.color : 'text-slate-500 group-hover:text-slate-300')} />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </button>
                    );
                    if (collapsed) {
                      return (
                        <Tooltip key={item.key}>
                          <TooltipTrigger asChild>{btn}</TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>{item.label}</TooltipContent>
                        </Tooltip>
                      );
                    }
                    return btn;
                  })}
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-white/5 px-2 py-2">
            {!collapsed ? (
              <>
                <button onClick={() => { setHelpOpen(true); setSidebarOpen(false); }}
                  className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                    'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                  )}>
                  <FaQuestionCircle className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                  <span>Help</span>
                </button>
                <button onClick={handleLogout}
                  className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                    'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                  )}>
                  <FaSignOutAlt className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                  <span>Logout</span>
                </button>
                <div className="mt-2 text-center text-[10px] font-medium text-slate-700">CS Hub v2.0</div>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={handleLogout}
                    className="flex w-full justify-center rounded-lg py-2.5 text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white">
                    <FaSignOutAlt className="h-[18px] w-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>Logout</TooltipContent>
              </Tooltip>
            )}
          </div>
        </aside>
      </TooltipProvider>

      <div className={cn('flex flex-1 flex-col transition-all duration-300', collapsed ? 'lg:ml-[68px]' : 'lg:ml-[280px]')}>
        <header className="sticky top-[80px] z-30 flex h-12 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-lg lg:px-5">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
          <div className="flex flex-col min-w-0">
            <h2 className="text-sm font-bold text-slate-900 leading-tight">{currentPage.title}</h2>
            <span className="text-[10px] text-slate-400">{currentPage.sub}</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 h-8 w-52 transition-all focus-within:border-cshub-yellow focus-within:bg-white focus-within:ring-2 focus-within:ring-cshub-yellow/20">
              <FaSearch className="text-slate-400 text-xs shrink-0" />
              <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" />
            </div>
            <div className="relative" ref={notifRef}>
              <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-cshub-yellow hover:text-cshub-yellow" title="Notifications" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}>
                <FaBell />
                {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl shadow-black/10 z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    {unreadCount > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">{unreadCount} new</span>}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-400">No new notifications</div>
                    ) : (
                      notifications.slice(0, 15).map((n) => (
                        <button key={`${n.type}-${n.id}`} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50" onClick={() => handleNotifClick(n)}>
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm">{n.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-slate-900 truncate">{n.title}</div>
                            <div className="text-[10px] text-slate-400">{n.sub}</div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="border-t border-slate-100 px-4 py-2 text-center">
                      <button className="text-xs font-medium text-amber-600 hover:text-amber-700" onClick={() => { setNotifOpen(false); setTab('tickets'); }}>View all</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="relative" ref={profileRef}>
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 h-8 transition-colors hover:border-cshub-yellow" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-amber-400 to-yellow-400 text-[10px] font-bold text-slate-900">{initials}</div>
                <span className="text-xs font-medium text-slate-700 hidden sm:inline">{user?.name || 'User'}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl shadow-black/10 z-50">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-400 text-sm font-bold text-slate-900">{initials}</div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">{user?.name || 'User'}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user?.email || ''}</div>
                      <span className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600"><FaUserShield className="text-[8px]" /> {teamData?.isTeamMember ? 'Team Member' : 'User'}</span>
                    </div>
                  </div>
                  <div className="py-1">
                    <button className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900" onClick={() => { setProfileEditOpen(true); setProfileTab('profile'); setProfileOpen(false); }}>
                      <FaCog className="text-[11px] text-slate-400" /> Settings
                    </button>
                    <button className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900" onClick={() => { setProfileOpen(false); navigate('/'); }}>
                      <FaHome className="text-[11px] text-slate-400" /> Back to Home
                    </button>
                    <div className="my-1 border-t border-slate-100"></div>
                    <button className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50" onClick={handleLogout}>
                      <FaSignOutAlt className="text-[11px]" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-5 bg-slate-50">
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
          {tab === 'analytics' ? (
            <DashboardView tickets={searchQuery.trim() ? filteredTickets : tickets} suggestionsCount={suggestionsCount} user={user} />
          ) : tab === 'courses' ? (
            <MyCoursesView />
          ) : tab === 'tickets' ? (
            <TicketsView tickets={searchQuery.trim() ? filteredTickets : tickets} setTickets={setTickets} />
          ) : tab === 'suggestions' ? (
            <SuggestionsView onCountChange={setSuggestionsCount} />
          ) : tab === 'chat' ? (
            <UserChatView />
          ) : tab === 'group-chat' ? (
            <GroupChatView />
          ) : tab === 'help' ? (
            <HelpCenterView setTab={setTab} />
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
