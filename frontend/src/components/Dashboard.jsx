import { useState, useEffect, useRef, useCallback } from 'react';
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
  FaTicketAlt, FaClock, FaCheckCircle, FaExclamationCircle, FaExclamationTriangle, FaTrash, FaEdit,
  FaSave, FaTimes, FaEye, FaUndo, FaLightbulb, FaReply, FaComments, FaUserTie,
  FaHandshake, FaMapMarkerAlt, FaPhone, FaEnvelope, FaBars, FaTachometerAlt,
  FaCog, FaQuestionCircle, FaSignOutAlt, FaSearch, FaBell, FaUserShield, FaHome,
  FaBook, FaShieldAlt, FaVirus, FaWifi, FaLaptop, FaMicrosoft, FaHdd, FaKeyboard,
  FaCloud, FaHeadphones, FaGraduationCap, FaWhatsapp, FaExternalLinkAlt, FaPlus, FaWrench, FaUsers, FaHeadset, FaRocket, FaSpinner, FaChevronRight, FaPlay
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
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setViewTicket(null)}>
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur px-5 py-4 rounded-t-2xl">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 truncate">{viewTicket.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('inline-flex items-center rounded-full px-2 py-px text-[10px] font-bold', viewTicket.status === 'open' ? 'bg-blue-100 text-blue-700' : viewTicket.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : viewTicket.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}>{viewTicket.status === 'in-progress' ? 'IN PROGRESS' : viewTicket.status?.toUpperCase()}</span>
              <span className="rounded-md bg-slate-100 px-1.5 py-px text-[10px] font-medium text-slate-500 capitalize">{viewTicket.category}</span>
            </div>
          </div>
          <button onClick={() => setViewTicket(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"><FaTimes className="text-xs" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-600 leading-relaxed">{viewTicket.description}</p>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><FaClock className="text-[8px]" /> Submitted {new Date(viewTicket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {viewTicket.status === 'open' && (
              <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-600 hover:shadow-md transition-all" onClick={() => handleStatus(tid(viewTicket), 'resolved')}><FaCheckCircle className="text-[10px]" /> Mark Resolved</button>
            )}
            {viewTicket.status === 'closed' && (
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-all" onClick={() => handleStatus(tid(viewTicket), 'open')}><FaUndo className="text-[10px]" /> Reopen</button>
            )}
            <button className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 transition-all" onClick={() => handleDelete(tid(viewTicket))}><FaTrash className="text-[10px]" /> Delete</button>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-3"><FaComments className="text-slate-400" /> Conversation <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500">{viewTicket.messages?.length || 0}</span></h5>
            <div className="space-y-2.5 max-h-56 overflow-y-auto rounded-xl bg-slate-50 p-3">
              {(!viewTicket.messages || viewTicket.messages.length === 0) ? (
                <div className="flex flex-col items-center py-4 text-center">
                  <FaComments className="mb-2 h-5 w-5 text-slate-200" />
                  <p className="text-xs text-slate-400">No messages yet. Start the conversation below.</p>
                </div>
              ) : (
                viewTicket.messages.map((m, i) => (
                  <div key={i} className={cn('rounded-xl p-3 text-xs', m.sender === 'admin' ? 'bg-slate-900 text-white ml-4' : 'bg-white border border-slate-200 mr-4 shadow-sm')}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold', m.sender === 'admin' ? 'bg-white/10 text-white' : 'bg-amber-100 text-amber-700')}>{m.senderName?.[0]?.toUpperCase() || 'U'}</div>
                        <strong className={cn('text-[10px] font-semibold', m.sender === 'admin' ? 'text-slate-300' : 'text-slate-700')}>{m.senderName}</strong>
                      </div>
                      <span className="text-[9px] text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <p className={cn('leading-relaxed', m.sender === 'admin' ? 'text-slate-200' : 'text-slate-600')}>{m.text}</p>
                  </div>
                ))
              )}
              <div ref={msgEndRef} />
            </div>
            <div className="flex gap-2 mt-3">
              <input type="text" className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10" placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }} />
              <button className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed" disabled={sendingReply || !replyText.trim()} onClick={handleSendReply}>{sendingReply ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white inline-block" /> : 'Send'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h1 className="text-sm font-bold text-slate-900">Support Tickets</h1>
        <button onClick={() => document.getElementById('new-ticket-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm">
          <FaPlus className="text-[9px]" /> New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500 text-sm"><FaTicketAlt /></div>
          <div className="min-w-0">
            <strong className="block text-sm font-extrabold text-slate-900">{tickets.length}</strong>
            <span className="text-[10px] text-slate-500 font-medium">Total</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-100 bg-amber-50 p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-500 text-sm"><FaExclamationCircle /></div>
          <div className="min-w-0">
            <strong className="block text-sm font-extrabold text-amber-700">{openCount}</strong>
            <span className="text-[10px] text-amber-600/70 font-medium">Open</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50 p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-500 text-sm"><FaCheckCircle /></div>
          <div className="min-w-0">
            <strong className="block text-sm font-extrabold text-emerald-700">{resolvedCount}</strong>
            <span className="text-[10px] text-emerald-600/70 font-medium">Resolved</span>
          </div>
        </div>
      </div>

      {/* New Ticket Form */}
      <div id="new-ticket-form" className="rounded-xl border border-slate-200 bg-white mb-3 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 bg-slate-900 px-4 py-2">
          <FaPlus className="text-[10px] text-white/60" />
          <h3 className="text-[11px] font-bold text-white">New Support Request</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-3 space-y-2">
          <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-cshub-yellow focus:bg-white focus:ring-2 focus:ring-cshub-yellow/20" placeholder="Title (e.g. Laptop won't boot)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {[
              { value: 'general', icon: FaHeadset, label: 'General', color: 'text-slate-500', active: 'bg-slate-900 text-white border-slate-900' },
              { value: 'hardware', icon: FaCog, label: 'Hardware', color: 'text-blue-500', active: 'bg-blue-600 text-white border-blue-600' },
              { value: 'software', icon: FaRocket, label: 'Software', color: 'text-violet-500', active: 'bg-violet-600 text-white border-violet-600' },
              { value: 'virus', icon: FaExclamationTriangle, label: 'Virus', color: 'text-red-500', active: 'bg-red-500 text-white border-red-500' },
              { value: 'network', icon: FaWifi, label: 'Network', color: 'text-cyan-500', active: 'bg-cyan-600 text-white border-cyan-600' },
              { value: 'training', icon: FaGraduationCap, label: 'Training', color: 'text-amber-500', active: 'bg-amber-500 text-white border-amber-500' },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = form.category === cat.value;
              return (
                <button key={cat.value} type="button" onClick={() => setForm({ ...form, category: cat.value })}
                  className={cn('flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition-all',
                    isActive ? cat.active : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  )}>
                  <Icon className="text-[11px]" /> {cat.label}
                </button>
              );
            })}
          </div>
          <textarea rows="2" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none resize-none transition-all placeholder:text-slate-400 focus:border-cshub-yellow focus:bg-white focus:ring-2 focus:ring-cshub-yellow/20" placeholder="Describe your issue..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="flex items-center justify-between">
            {message ? (
              <p className="text-[11px] text-red-500 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />{message}</p>
            ) : <span />}
            <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-slate-800 disabled:opacity-50" disabled={submitting}>
              {submitting ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <><FaPlus className="text-[9px]" /> Submit</>}
            </button>
          </div>
        </form>
      </div>

      {/* Tickets List */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-100">
          <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
            <FaTicketAlt className="text-slate-400 text-[10px]" /> My Tickets
            <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-slate-100 px-1 text-[9px] font-bold text-slate-600">{tickets.length}</span>
          </div>
          <div className="flex gap-1">
            {['all', 'open', 'closed'].map((f) => (
              <button key={f} className={cn('rounded-md px-2 py-1 text-[10px] font-medium transition-all', filter === f ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100')} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'open' && openCount > 0 && <span className={cn('ml-1 inline-flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[8px] font-bold', filter === f ? 'bg-white/20' : 'bg-amber-100 text-amber-700')}>{openCount}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="p-3">
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
              <FaTicketAlt className="mb-2 h-5 w-5 text-slate-300" />
              <p className="text-xs font-semibold text-slate-500">No {filter !== 'all' ? filter : ''} tickets yet</p>
              <p className="text-[10px] text-slate-400">Submit a request above to get started.</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {filteredTickets.map((t) => {
                const catIcons = { hardware: FaCog, software: FaRocket, virus: FaExclamationTriangle, network: FaCloud, training: FaGraduationCap, general: FaHeadset };
                const CatIcon = catIcons[t.category] || FaHeadset;
                return (
                <div key={tid(t)} className={cn('group flex items-center gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5 transition-all hover:border-slate-200 hover:bg-slate-50/50 cursor-pointer', editingId === tid(t) && 'ring-2 ring-slate-900/10')} onClick={() => setViewTicket(t)}>
                  {editingId === tid(t) ? (
                    <div className="flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-slate-900" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                      <div className="flex gap-2">
                        <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[10px] text-slate-700 outline-none bg-white">
                          <option value="general">General</option>
                          <option value="hardware">Hardware</option>
                          <option value="software">Software</option>
                          <option value="virus">Virus</option>
                          <option value="network">Network</option>
                          <option value="training">Training</option>
                        </select>
                        <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-[10px] text-slate-700 outline-none bg-white">
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <div className="flex gap-1.5">
                        <button className="rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-slate-800" disabled={savingId === tid(t)} onClick={() => handleUpdate(tid(t))}>{savingId === tid(t) ? '...' : 'Save'}</button>
                        <button className="rounded-md border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-50" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px]', t.status === 'open' ? 'bg-blue-50 text-blue-500' : t.status === 'in-progress' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500')}>
                        <CatIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={cn('inline-flex rounded-full px-1.5 py-px text-[8px] font-bold tracking-wide', t.status === 'open' ? 'bg-blue-100 text-blue-700' : t.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : t.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}>
                            {t.status === 'in-progress' ? 'IN PROGRESS' : t.status.toUpperCase()}
                          </span>
                          <span className="text-[9px] text-slate-400 capitalize">{t.category}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-800 truncate">{t.title}</h4>
                      </div>
                      <span className="text-[9px] text-slate-400 shrink-0 hidden sm:block">{new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {(t.status === 'open' || t.status === 'in-progress') && (
                          <button className="rounded-md bg-emerald-50 px-1.5 py-1 text-[9px] font-bold text-emerald-600 hover:bg-emerald-100 transition-colors" onClick={() => handleStatus(tid(t), 'resolved')}><FaCheckCircle className="inline mr-0.5 text-[7px]" />Resolve</button>
                        )}
                        {t.status === 'resolved' && (
                          <button className="rounded-md bg-amber-50 px-1.5 py-1 text-[9px] font-bold text-amber-600 hover:bg-amber-100 transition-colors" onClick={() => handleStatus(tid(t), 'open')}><FaUndo className="inline mr-0.5 text-[7px]" />Reopen</button>
                        )}
                        <button className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600" onClick={() => setViewTicket(t)}><FaEye className="text-[9px]" /></button>
                        <button className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600" onClick={() => startEdit(t)}><FaEdit className="text-[9px]" /></button>
                        <button className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50" onClick={() => handleDelete(tid(t))}><FaTrash className="text-[9px]" /></button>
                      </div>
                    </>
                  )}
                </div>
              );})}
            </div>
          )}
        </div>
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
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setViewSug(null)}>
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3 rounded-t-xl">
          <h3 className="text-sm font-bold text-slate-900 truncate">{viewSug.title}</h3>
          <button onClick={() => setViewSug(null)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200"><FaTimes /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">{viewSug.description}</p>
          <p className="text-[10px] text-slate-400">{new Date(viewSug.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <div className="border-t border-slate-100 pt-3">
            <h5 className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-2"><FaReply className="scale-x-[-1]" /> Conversation ({viewSug.messages?.length || 0})</h5>
            <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg bg-slate-50 p-3">
              {(!viewSug.messages || viewSug.messages.length === 0) ? (
                <p className="text-center text-xs text-slate-400 py-2">No messages yet.</p>
              ) : (
                viewSug.messages.map((m, i) => (
                  <div key={i} className={cn('rounded-lg p-2.5 text-xs', m.sender === 'admin' ? 'bg-slate-900 text-white ml-6' : 'bg-white border border-slate-200 mr-6')}>
                    <div className="flex items-center justify-between mb-1">
                      <strong className={cn('text-[10px] font-semibold', m.sender === 'admin' ? 'text-slate-300' : 'text-slate-700')}>{m.senderName}</strong>
                      <span className="text-[9px] text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <p className={cn('leading-relaxed', m.sender === 'admin' ? 'text-slate-200' : 'text-slate-600')}>{m.text}</p>
                  </div>
                ))
              )}
              <div ref={sugMsgEndRef} />
            </div>
            <div className="flex gap-2 mt-2">
              <input type="text" className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-slate-900" placeholder="Type reply..." value={sugReplyText} onChange={(e) => setSugReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSugReply(); } }} />
              <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50" disabled={sugSendingReply || !sugReplyText.trim()} onClick={handleSugReply}>{sugSendingReply ? '...' : 'Send'}</button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500"><FaLightbulb /></div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-0.5">Suggest a Service</h3>
              <p className="text-xs text-slate-500">Tell us what support or service you want us to add.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" placeholder="What service would you like to see?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea rows="3" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none resize-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" placeholder="Describe your idea in detail..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <button type="submit" className="w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50" disabled={suggesting}>{suggesting ? 'Submitting...' : 'Submit Suggestion'}</button>
          </form>
          {feedback && <p className="mt-2 text-xs text-emerald-600">{feedback}</p>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3">My Suggestions <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">{suggestions.length}</span></h3>
          {suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-slate-200">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50"><FaLightbulb className="h-5 w-5 text-violet-400" /></div>
              <p className="mt-2.5 text-xs font-semibold text-slate-600">No suggestions yet.</p>
              <p className="text-[10px] text-slate-400">Share your ideas to help us improve.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
              {suggestions.map((s) => (
                <div key={sid(s)} className="rounded-lg border border-slate-100 bg-slate-50 p-3 cursor-pointer hover:bg-white hover:border-slate-200 transition-colors" onClick={() => setViewSug(s)}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-semibold text-slate-800 truncate">{s.title}</h4>
                    {(s.messages || []).length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                        <FaReply style={{ transform: 'scaleX(-1)' }} /> {s.messages.length}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-1.5">{s.description}</p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(s.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
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
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Team Dashboard</h2>
          <p className="text-[10px] text-slate-400">Manage your team profile and assigned beneficiaries.</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          {subTabs.map((st) => (
            <button key={st.key} className={cn('flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-all shrink-0', subTab === st.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')} onClick={() => setSubTab(st.key)}>
              {st.icon} {st.label}
            </button>
          ))}
        </div>
        {subTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3"><FaUserTie className="text-slate-400" /> My Profile</h3>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-slate-800">{app.name}</p>
                <p className="text-xs text-slate-600 flex items-center gap-1.5"><FaEnvelope className="text-slate-400" /> {app.email}</p>
                {app.phone && <p className="text-xs text-slate-600 flex items-center gap-1.5"><FaPhone className="text-slate-400" /> {app.phone}</p>}
                {app.location && <p className="text-xs text-slate-600 flex items-center gap-1.5"><FaMapMarkerAlt className="text-slate-400" /> {app.location}</p>}
                {app.involvement && <p className="text-xs text-slate-600">Role: <strong className="text-slate-800">{app.involvement}</strong></p>}
                {app.applicantType && <p className="text-xs text-slate-600">Type: <strong className="text-slate-800">{app.applicantType}</strong></p>}
                {app.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {app.skills.map((s) => <span key={s} className="rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5">{s}</span>)}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col items-center gap-1 text-center">
                <FaHandshake className="h-5 w-5 text-slate-400" />
                <span className="text-lg font-extrabold text-slate-900">{beneficiaries.length}</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Beneficiaries</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col items-center gap-1 text-center">
                <FaCheckCircle className="h-5 w-5 text-emerald-400" />
                <span className="text-lg font-extrabold text-slate-900">{beneficiaries.filter((b) => b.status === 'resolved' || b.status === 'closed').length}</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Resolved</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col items-center gap-1 text-center">
                <FaClock className="h-5 w-5 text-blue-400" />
                <span className="text-lg font-extrabold text-slate-900">{beneficiaries.filter((b) => b.status === 'in-progress').length}</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">In Progress</span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col items-center gap-1 text-center">
                <FaExclamationCircle className="h-5 w-5 text-amber-400" />
                <span className="text-lg font-extrabold text-slate-900">{beneficiaries.filter((b) => b.status === 'open').length}</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Open</span>
              </div>
            </div>
          </div>
        )}
        {subTab === 'beneficiaries' && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3"><FaHandshake className="text-slate-400" /> Assigned Beneficiaries ({beneficiaries.length})</h3>
            {beneficiaries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-slate-200">
                <FaHandshake className="h-8 w-8 text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No beneficiaries assigned yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {beneficiaries.map((b) => (
                  <div key={b._id || b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-slate-100">
                    <div className="min-w-0 flex-1">
                      <strong className="block text-xs font-semibold text-slate-800 truncate">{b.name}</strong>
                      <span className="text-[11px] text-slate-500 block">{b.issue?.slice(0, 120)}</span>
                      <span className="text-[10px] text-slate-400">{b.location} {b.phone ? `• ${b.phone}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select value={b.status} onChange={(e) => updateBeneficiaryStatus(b._id || b.id, e.target.value)} className="rounded-md border border-slate-200 px-2 py-1 text-[10px] text-slate-600 outline-none bg-white">
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <span className={cn('inline-flex items-center rounded-full px-2 py-px text-[10px] font-semibold', b.status === 'resolved' || b.status === 'closed' ? 'bg-emerald-100 text-emerald-700' : b.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {subTab === 'tickets' && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3"><FaTicketAlt className="text-slate-400" /> All Support Tickets</h3>
            {ticketsLoading ? (
              <p className="text-center text-xs text-slate-400 py-8">Loading tickets...</p>
            ) : teamTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl border border-dashed border-slate-200">
                <FaTicketAlt className="h-8 w-8 text-slate-200 mb-2" />
                <p className="text-xs text-slate-400">No tickets in the system.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {teamTickets.map((t) => (
                  <div key={t._id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-100">
                    <div className="min-w-0 flex-1">
                      <strong className="block text-xs font-semibold text-slate-800">{t.title}</strong>
                      <span className="text-[11px] text-slate-500 block">{t.description?.slice(0, 100)}</span>
                      <span className="text-[10px] text-slate-400">by {t.userName} • {t.category}</span>
                    </div>
                    <span className={cn('inline-flex items-center rounded-full px-2 py-px text-[10px] font-semibold shrink-0', t.status === 'resolved' || t.status === 'closed' ? 'bg-emerald-100 text-emerald-700' : t.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>{t.status}</span>
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
      <div className="flex items-center justify-between gap-3 mb-3">
        <h1 className="text-sm font-bold text-slate-900">Analytics</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
        {[
          { label: 'Tickets', count: tickets.length, icon: FaTicketAlt, bg: 'bg-blue-50', text: 'text-blue-500' },
          { label: 'Open', count: openCount, icon: FaExclamationCircle, bg: 'bg-amber-50', text: 'text-amber-500' },
          { label: 'Resolved', count: resolvedCount, icon: FaCheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-500' },
          { label: 'Suggestions', count: suggestionsCount || 0, icon: FaLightbulb, bg: 'bg-violet-50', text: 'text-violet-500' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5">
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm', s.bg, s.text)}><s.icon /></div>
            <div className="min-w-0">
              <strong className="block text-sm font-extrabold text-slate-900">{s.count}</strong>
              <span className="text-[10px] text-slate-500 font-medium">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Status */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 mb-3">
        <div className="text-[11px] font-bold text-slate-900 mb-2 flex items-center gap-1.5"><FaTicketAlt className="text-slate-400 text-[10px]" /> Ticket Status</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Open', count: tickets.filter((t) => t.status === 'open').length, color: 'bg-amber-500', ring: 'ring-amber-100', text: 'text-amber-700' },
            { label: 'In Progress', count: tickets.filter((t) => t.status === 'in-progress').length, color: 'bg-blue-500', ring: 'ring-blue-100', text: 'text-blue-700' },
            { label: 'Resolved', count: tickets.filter((t) => t.status === 'resolved').length, color: 'bg-emerald-500', ring: 'ring-emerald-100', text: 'text-emerald-700' },
            { label: 'Closed', count: tickets.filter((t) => t.status === 'closed').length, color: 'bg-slate-400', ring: 'ring-slate-100', text: 'text-slate-600' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
              <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full ring-4', item.color, item.ring)} />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-medium text-slate-500 block">{item.label}</span>
              </div>
              <strong className={cn('text-sm font-extrabold', item.text)}>{item.count}</strong>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        {tickets.length > 0 && (
          <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100 mt-3">
            <div className="bg-amber-500 transition-all duration-500" style={{ width: `${(tickets.filter((t) => t.status === 'open').length / tickets.length) * 100}%` }} />
            <div className="bg-blue-500 transition-all duration-500" style={{ width: `${(tickets.filter((t) => t.status === 'in-progress').length / tickets.length) * 100}%` }} />
            <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(tickets.filter((t) => t.status === 'resolved').length / tickets.length) * 100}%` }} />
            <div className="bg-slate-400 transition-all duration-500" style={{ width: `${(tickets.filter((t) => t.status === 'closed').length / tickets.length) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <h4 className="text-[11px] font-bold text-slate-900 mb-2 flex items-center gap-1.5"><FaClock className="text-slate-400 text-[10px]" /> Recent Tickets</h4>
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
              <FaTicketAlt className="mb-1.5 h-4 w-4 text-slate-300" />
              <p className="text-[10px] text-slate-400">No tickets yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {tickets.slice(0, 5).map((t) => (
                <div key={t._id || t.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: t.status === 'open' ? '#f59e0b' : t.status === 'in-progress' ? '#3b82f6' : t.status === 'resolved' ? '#10b981' : '#6b7280' }} />
                  <span className="flex-1 text-[11px] text-slate-700 truncate">{t.title || 'Untitled'}</span>
                  <span className={cn('text-[8px] font-bold uppercase tracking-wide shrink-0', t.status === 'open' ? 'text-amber-600' : t.status === 'in-progress' ? 'text-blue-600' : t.status === 'resolved' ? 'text-emerald-600' : 'text-slate-500')}>{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <h4 className="text-[11px] font-bold text-slate-900 mb-2 flex items-center gap-1.5"><FaCog className="text-slate-400 text-[10px]" /> Categories</h4>
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
              <FaCog className="mb-1.5 h-4 w-4 text-slate-300" />
              <p className="text-[10px] text-slate-400">No data yet.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {[
                { cat: 'general', icon: FaHeadset, color: 'text-slate-500' },
                { cat: 'hardware', icon: FaCog, color: 'text-blue-500' },
                { cat: 'software', icon: FaRocket, color: 'text-violet-500' },
                { cat: 'virus', icon: FaExclamationTriangle, color: 'text-red-500' },
                { cat: 'network', icon: FaWifi, color: 'text-cyan-500' },
                { cat: 'training', icon: FaGraduationCap, color: 'text-amber-500' },
              ].map(({ cat, icon: Icon, color }) => {
                const count = tickets.filter((t) => t.category === cat).length;
                if (count === 0) return null;
                const pct = Math.round((count / tickets.length) * 100);
                return (
                  <div key={cat} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors">
                    <Icon className={cn('text-[11px] shrink-0', color)} />
                    <span className="flex-1 text-[11px] text-slate-700 capitalize">{cat}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{pct}%</span>
                    <strong className="text-[11px] font-bold text-slate-900 w-5 text-right">{count}</strong>
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
      <div className="flex flex-col md:flex-row items-center gap-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 mb-4 overflow-hidden relative">
        <div className="flex-1 text-white relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold text-white/80 mb-3"><FaHeadset /> Help Center</div>
          <h2 className="text-lg font-extrabold mb-1">How can we help you?</h2>
          <p className="text-xs text-white/50 mb-4">Find answers, get support, and explore our services — all in one place.</p>
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-1.5 rounded-lg bg-cshub-yellow px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-amber-400 transition-colors" onClick={() => setTab?.('tickets')}>
              <FaTicketAlt /> Submit a Ticket
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors" onClick={() => setTab?.('chat')}>
              <FaComments /> Live Chat
            </button>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center relative z-10">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border border-white/10" />
            <div className="absolute inset-2 h-20 w-20 rounded-full border border-white/5" />
            <FaHeadset className="absolute inset-0 m-auto h-8 w-8 text-cshub-yellow" />
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickLinks.map((link) => (
            link.href ? (
              <a key={link.label} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:shadow-sm transition-all">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 text-white text-sm">{link.icon}</div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-slate-800">{link.label}</span>
                  <span className="block text-[10px] text-slate-400">{link.desc}</span>
                </div>
                <FaChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
              </a>
            ) : (
              <button key={link.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:shadow-sm transition-all text-left w-full" onClick={() => setTab?.(link.tab)}>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-600 text-white text-sm">{link.icon}</div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-slate-800">{link.label}</span>
                  <span className="block text-[10px] text-slate-400">{link.desc}</span>
                </div>
                <FaChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
              </button>
            )
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><FaQuestionCircle /> Frequently Asked Questions</h3>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 h-8 w-48 md:w-56">
            <FaSearch className="text-slate-400 text-xs shrink-0" />
            <input type="text" placeholder="Search questions..." value={faqSearch} onChange={(e) => setFaqSearch(e.target.value)} className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {filteredFaqs.length === 0 && (
            <div className="text-center py-6 text-xs text-slate-400">No matching questions found.</div>
          )}
          {filteredFaqs.map((faq, i) => (
            <div key={i} className={cn('rounded-xl border bg-white transition-all', openFaq === i ? 'border-slate-300 shadow-sm' : 'border-slate-200')}>
              <button className="flex items-center justify-between gap-3 w-full px-4 py-3 text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="text-xs font-semibold text-slate-800">{faq.q}</span>
                <FaChevronRight className={cn('h-3 w-3 text-slate-400 shrink-0 transition-transform', openFaq === i && 'rotate-90')} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-2">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><FaRocket /> Services We Offer</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 text-sm">{svc.icon}</div>
              <div className="min-w-0">
                <strong className="block text-xs font-semibold text-slate-800">{svc.name}</strong>
                <span className="block text-[10px] text-slate-500 leading-relaxed">{svc.desc}</span>
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

  const fetchCourses = useCallback(() => {
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

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchCourses();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchCourses]);

  useEffect(() => {
    const handleFocus = () => fetchCourses();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchCourses]);

  const enriched = enrollments.map((e) => {
    const courseId = e.enrollment?.courseId?._id || e.enrollment?.courseId;
    const backendProgress = e.progress?.progress || 0;
    const backendCompleted = e.progress?.completed || false;

    let localStorageProgress = 0;
    let localStorageCompleted = false;
    try {
      const lessonsData = localStorage.getItem(`cshub-lessons-${courseId}`);
      const assessmentPassed = localStorage.getItem(`cshub-assessment-${courseId}`) === 'true';
      if (lessonsData) {
        const completedIds = JSON.parse(lessonsData);
        if (Array.isArray(completedIds) && completedIds.length > 0) {
          localStorageProgress = Math.min(95, completedIds.length * 8);
          if (assessmentPassed) localStorageProgress = 100;
        }
      }
    } catch { /* ignore */ }

    const progress = Math.max(backendProgress, localStorageProgress);
    const completed = backendCompleted || localStorageCompleted || progress >= 100;

    return {
      enrollment: e.enrollment,
      course: e.enrollment?.courseId,
      progress,
      completed,
      sections: e.progress?.sections || {},
      enrolledAt: e.enrollment?.enrolledAt,
    };
  }).filter((e) => e.course);

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
          <TooltipProvider delayDuration={0}>
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
          </TooltipProvider>
        </aside>

      <div className={cn('flex flex-1 flex-col lg:ml-[280px] transition-all duration-300', collapsed && 'lg:ml-[68px]')}>
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-lg lg:px-5">
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

        <main className="flex-1 p-3 lg:p-4">
          {teamData?.application && !teamData.isTeamMember && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 mb-4" style={{ borderLeft: `4px solid ${teamData.application.status === 'rejected' ? '#ef4444' : '#f59e0b'}` }}>
              <FaUserTie className="h-4 w-4 shrink-0" style={{ color: teamData.application.status === 'rejected' ? '#ef4444' : '#f59e0b' }} />
              <div>
                <strong className="text-xs font-bold text-slate-800">Team Application — <span style={{ textTransform: 'uppercase', color: teamData.application.status === 'rejected' ? '#ef4444' : '#f59e0b' }}>{teamData.application.status}</span></strong>
                <p className="text-[11px] text-slate-500">
                  {teamData.application.status === 'pending' ? 'Your application is being reviewed.' : 'Your application was not approved at this time.'}
                </p>
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
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setProfileEditOpen(false)}>
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-bold text-slate-900">{profileTab === 'password' ? 'Change Password' : 'Edit Profile'}</h3>
              <button onClick={() => setProfileEditOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200">
                <FaTimes />
              </button>
            </div>
            <div className="px-5 py-4">
              <div className="mb-4 flex gap-0.5 rounded-lg bg-slate-100 p-0.5">
                <button className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${profileTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setProfileTab('profile')}>Profile</button>
                <button className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${profileTab === 'password' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setProfileTab('password')}>Password</button>
              </div>
              {profileTab === 'profile' ? (
                <div className="flex flex-col gap-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cshub-yellow to-amber-500 text-sm font-bold text-slate-900">{initials}</div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">Full Name</label>
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none transition-all focus:border-cshub-yellow focus:ring-2 focus:ring-cshub-yellow/20" type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">Email</label>
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none transition-all focus:border-cshub-yellow focus:ring-2 focus:ring-cshub-yellow/20" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                  </div>
                  <button className="mt-0.5 w-full rounded-lg bg-cshub-yellow py-2 text-xs font-bold text-slate-900 transition-colors hover:bg-amber-400 disabled:opacity-50" onClick={handleProfileSave} disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">Current Password</label>
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none transition-all focus:border-cshub-yellow focus:ring-2 focus:ring-cshub-yellow/20" type="password" value={pwdForm.current} onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">New Password</label>
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none transition-all focus:border-cshub-yellow focus:ring-2 focus:ring-cshub-yellow/20" type="password" value={pwdForm.newPwd} onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">Confirm New Password</label>
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none transition-all focus:border-cshub-yellow focus:ring-2 focus:ring-cshub-yellow/20" type="password" value={pwdForm.confirm} onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} />
                  </div>
                  <button className="mt-0.5 w-full rounded-lg bg-cshub-yellow py-2 text-xs font-bold text-slate-900 transition-colors hover:bg-amber-400 disabled:opacity-50" onClick={handlePasswordChange} disabled={profileLoading}>
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
