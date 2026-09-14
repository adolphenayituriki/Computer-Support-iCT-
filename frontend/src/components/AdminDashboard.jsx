import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminCourses from './AdminCourses';
import AdminPayments from './AdminPayments';
import AdminChatView from './AdminChatView';
import LiveSessionsAdmin from './LiveSessionsAdmin';
import HelpModal from './HelpModal';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaTicketAlt, FaUsers, FaLightbulb, FaEnvelope, FaUserTie, FaTrash, FaCheckCircle, FaUndo, FaTimes, FaEye, FaEyeSlash, FaSave, FaEdit, FaPlus, FaSearch, FaCheck, FaBan, FaReply, FaComments, FaNewspaper, FaImage, FaYoutube, FaBookOpen, FaChartBar, FaChartLine, FaStar, FaLink, FaCode, FaBars, FaAngleLeft, FaAngleRight, FaCog, FaQuestionCircle, FaSignOutAlt, FaBell, FaUserShield, FaCalendarAlt, FaSpinner, FaExclamationTriangle, FaDownload, FaVideo } from 'react-icons/fa';
import { Menu, Search, Bell, Settings, LogOut, ShieldCheck } from 'lucide-react';
import API_BASE from '../api';
import { cn } from '../lib/utils';
import { groupByMonth, MonthHeader, MonthFilter, monthLabel } from './MonthGroup';

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

const STATUS_COLOR_MAP = {
  open: 'bg-cshub-blue/10 text-cshub-blue border-cshub-blue/20',
  'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  'pending_review': 'bg-amber-100 text-amber-700 border-amber-200',
  new: 'bg-cshub-blue/10 text-cshub-blue border-cshub-blue/20',
  reviewed: 'bg-cshub-blue/10 text-cshub-blue border-cshub-blue/20',
  read: 'bg-cshub-blue/10 text-cshub-blue border-cshub-blue/20',
  responded: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  implemented: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-100 text-red-600 border-red-200',
};

function StatusBadge({ status }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-px text-[10px] font-medium whitespace-nowrap', STATUS_COLOR_MAP[status] || 'border-slate-200 bg-slate-50 text-slate-600')}>
      {status}
    </span>
  );
}

function CreateTicketModal({ onClose, onCreated }) {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ userId: '', title: '', description: '', category: 'general', status: 'open' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api('/api/admin/users').then(setUsers).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return showToast('Title and description required.', 'error');
    setLoading(true);
    const res = await api('/api/admin/tickets', { method: 'POST', body: JSON.stringify(form) });
    setLoading(false);
    if (res.error) return showToast(res.error, 'error');
    showToast('Ticket created.'); onCreated(); onClose();
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-bold text-slate-900">Create Ticket</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200"><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <select value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none bg-white">
            <option value="">Assign to yourself (Admin)</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-cshub-blue focus:ring-2 focus:ring-slate-900/10" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none bg-white">
              <option value="general">General</option><option value="hardware">Hardware</option><option value="software">Software</option>
              <option value="virus">Virus</option><option value="network">Network</option><option value="training">Training</option>
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none bg-white">
              {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <textarea rows="3" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none resize-none focus:border-cshub-blue focus:ring-2 focus:ring-slate-900/10" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <button type="submit" className="w-full rounded-lg bg-cshub-blue py-2 text-xs font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={loading}>
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
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
    showToast('User created.'); onCreated(); onClose();
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="text-sm font-bold text-slate-900">Create User</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200"><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-cshub-blue focus:ring-2 focus:ring-slate-900/10" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="email" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-cshub-blue focus:ring-2 focus:ring-slate-900/10" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-10 text-sm text-slate-800 outline-none focus:border-cshub-blue focus:ring-2 focus:ring-slate-900/10" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600" onClick={() => setShowPwd(!showPwd)}>
              {showPwd ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
            </button>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" className="rounded" checked={form.isAdmin} onChange={(e) => setForm({ ...form, isAdmin: e.target.checked })} />
            Admin privileges
          </label>
          <button type="submit" className="w-full rounded-lg bg-cshub-blue py-2 text-xs font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
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
    const urlMap = { suggestion: `/api/admin/suggestions/${itemId}`, contact: `/api/admin/contacts/${itemId}`, team: `/api/admin/team-apps/${itemId}` };
    const res = await api(urlMap[type], { method: 'PUT', body: JSON.stringify(form) });
    setSaving(false);
    if (res.error) return showToast(res.error, 'error');
    showToast('Updated.'); onUpdated(); onClose();
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    const res = await fetch(`${API_BASE}/api/admin/${type === 'suggestion' ? 'suggestions' : 'tickets'}/${itemId}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ text: replyText }),
    });
    const data = await res.json();
    if (res.ok) { setCurrentItem(data); setReplyText(''); } else { showToast('Failed to send.', 'error'); }
    setSendingReply(false);
  };

  const statusOpts = { suggestion: SUGGESTION_STATUSES, contact: CONTACT_STATUSES, team: TEAM_STATUSES };

  const renderMessages = (messages) => (
    <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg bg-slate-50 p-3">
      {(!messages || messages.length === 0) ? (
        <p className="text-center text-xs text-slate-400 py-2">No messages yet.</p>
      ) : messages.map((m, i) => (
        <div key={i} className={cn('rounded-lg p-2.5 text-xs', m.sender === 'admin' ? 'bg-cshub-blue text-white ml-6' : 'bg-white border border-slate-200 mr-6')}>
          <div className="flex items-center justify-between mb-1">
            <strong className={cn('text-[10px] font-semibold', m.sender === 'admin' ? 'text-slate-300' : 'text-slate-700')}>{m.senderName}</strong>
            <span className="text-[9px] text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
          </div>
          <p className={cn('leading-relaxed', m.sender === 'admin' ? 'text-slate-200' : 'text-slate-600')}>{m.text}</p>
        </div>
      ))}
      <div ref={msgEndRef} />
    </div>
  );

  const renderReplyForm = (onSend) => (
    <div className="flex gap-2 mt-2">
      <input type="text" className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-cshub-blue" placeholder="Type reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }} />
      <button className="rounded-lg bg-cshub-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={sendingReply || !replyText.trim()} onClick={onSend}>{sendingReply ? '...' : 'Send'}</button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3 rounded-t-xl">
          <h3 className="text-sm font-bold text-slate-900 truncate">{item.userName || item.name || item.title}</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200"><FaTimes /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {type === 'suggestion' && (
            <>
              <p className="text-xs font-semibold text-slate-700">{currentItem.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{currentItem.description}</p>
              <label className="text-[10px] font-medium text-slate-400 uppercase">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none bg-white">
                {statusOpts[type].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="w-full rounded-lg bg-cshub-blue py-2 text-xs font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={saving} onClick={handleUpdate}>{saving ? 'Saving...' : 'Save'}</button>
              <h5 className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700"><FaReply className="scale-x-[-1]" /> Conversation</h5>
              {renderMessages(currentItem.messages)}
              {renderReplyForm(handleSendReply)}
            </>
          )}
          {type === 'contact' && (
            <>
              <p className="text-xs text-slate-500"><strong className="text-slate-700">{item.name}</strong> — {item.email}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
              <p className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
              <label className="text-[10px] font-medium text-slate-400 uppercase">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none bg-white">
                {statusOpts[type].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="w-full rounded-lg bg-cshub-blue py-2 text-xs font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={saving} onClick={handleUpdate}>{saving ? 'Saving...' : 'Save'}</button>
            </>
          )}
          {type === 'team' && (
            <>
              <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
                <p><strong className="text-slate-800">{item.name}</strong> — {item.email}</p>
                {item.phone && <p>Phone: {item.phone}</p>}
                <p>Education: {item.education}</p>
                <p>Location: {item.location}</p>
                {item.applicantType && <p>Type: {item.applicantType}</p>}
                <p>Involvement: {item.involvement}</p>
                {item.skills?.length > 0 && <p>Skills: {item.skills.join(', ')}</p>}
                <hr className="border-slate-100 my-2" />
                <p className="italic text-slate-500">&ldquo;{item.message}&rdquo;</p>
              </div>
              <label className="text-[10px] font-medium text-slate-400 uppercase">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none bg-white">
                {statusOpts[type].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button className="w-full rounded-lg bg-cshub-blue py-2 text-xs font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={saving} onClick={handleUpdate}>{saving ? 'Saving...' : 'Save'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminTickets() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
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
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ text: replyText }),
    });
    const data = await res.json();
    if (res.ok) { setViewTicket(data); setTickets((prev) => prev.map((t) => (tid(t) === tid(data) ? data : t))); setReplyText(''); }
    else { showToast(res.error || 'Failed to send.', 'error'); }
    setSendingReply(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdate = async (id) => {
    setSavingId(id);
    await fetch(`${API_BASE}/api/admin/tickets/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(editForm) });
    setTickets((prev) => prev.map((t) => (t._id === id || t.id === id ? { ...t, ...editForm } : t)));
    setEditingId(null); setEditForm({}); setSavingId(null); showToast('Ticket updated.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    setDeletingId(id);
    await fetch(`${API_BASE}/api/admin/tickets/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setTickets((prev) => prev.filter((t) => t.id !== id && t._id !== id));
    if (viewTicket?.id === id || viewTicket?._id === id) setViewTicket(null);
    setDeletingId(null); showToast('Ticket deleted.');
  };

  const handleStatus = async (id, status) => {
    setUpdatingId(id);
    await fetch(`${API_BASE}/api/admin/tickets/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ status }) });
    setTickets((prev) => prev.map((t) => (t.id === id || t._id === id ? { ...t, status } : t)));
    if (viewTicket?.id === id || viewTicket?._id === id) setViewTicket((prev) => ({ ...prev, status }));
    setUpdatingId(null); showToast(`Status changed to ${status}.`);
  };

  const filtered = tickets.filter((t) => (filter === 'all' || t.status === filter) && (monthFilter === 'all' || monthLabel(t.createdAt) === monthFilter));
  const messagesEndRef = useRef(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [viewTicket?.messages]);

  if (viewTicket) {
    const msgs = viewTicket.messages || [];
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewTicket(null)} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"><FaTimes /> Back</button>
          <h3 className="text-sm font-bold text-slate-900 truncate">{viewTicket.title}</h3>
          <StatusBadge status={viewTicket.status} />
          <span className="rounded-full bg-slate-100 px-2 py-px text-[10px] font-medium text-slate-500">{viewTicket.category}</span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">By <strong className="text-slate-700">{viewTicket.userName}</strong></p>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">{viewTicket.description}</p>
          <p className="mt-2 text-[10px] text-slate-400">{new Date(viewTicket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <div className="mt-3 flex items-center gap-2">
            <select value={viewTicket.status} disabled={updatingId === tid(viewTicket)} onChange={(e) => handleStatus(tid(viewTicket), e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-700 outline-none bg-white">
              {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[11px] font-medium text-red-500 hover:bg-red-50 disabled:opacity-50" disabled={deletingId === tid(viewTicket)} onClick={() => handleDelete(tid(viewTicket))}>
              {deletingId === tid(viewTicket) ? '...' : <><FaTrash /> Delete</>}
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700"><FaReply className="scale-x-[-1]" /> Conversation ({msgs.length})</h4>
          <div className="space-y-2 max-h-56 overflow-y-auto rounded-lg bg-slate-50 p-3">
            {msgs.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-3">No messages yet. Reply to start a conversation.</p>
            ) : msgs.map((m, i) => (
              <div key={i} className={cn('rounded-lg p-2.5 text-xs', m.sender === 'admin' ? 'bg-cshub-blue text-white ml-6' : 'bg-white border border-slate-200 mr-6')}>
                <div className="flex items-center justify-between mb-1">
                  <strong className={cn('text-[10px] font-semibold', m.sender === 'admin' ? 'text-slate-300' : 'text-slate-700')}>{m.senderName}</strong>
                  <span className="text-[9px] text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <p className={cn('leading-relaxed', m.sender === 'admin' ? 'text-slate-200' : 'text-slate-600')}>{m.text}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 mt-2">
            <input type="text" className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-cshub-blue" placeholder="Type reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }} />
            <button className="rounded-lg bg-cshub-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={sendingReply || !replyText.trim()} onClick={handleSendReply}>{sendingReply ? '...' : 'Send'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} onCreated={fetchData} />}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-semibold text-slate-900">All Tickets ({tickets.length})</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {['all', ...TICKET_STATUSES].map((f) => (
              <button key={f} className={cn('rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors', filter === f ? 'bg-cshub-blue text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50')} onClick={() => setFilter(f)}>
                {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-cshub-blue px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#3f7ee8]"><FaPlus /> New</button>
        </div>
      </div>

      {tickets.length > 0 && <MonthFilter items={tickets} value={monthFilter} onChange={setMonthFilter} />}

      {loading ? <Loading /> : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center"><FaTicketAlt className="mb-2 h-8 w-8 text-slate-200" /><p className="text-xs text-slate-400">No tickets found.</p></div>
      ) : (
        <div className="space-y-6">
          {groupByMonth(filtered).map((g) => (
            <div key={g.label} className="space-y-2">
              <MonthHeader label={g.label} count={g.list.length} />
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {g.list.map((t) => (
                  <div key={tid(t)} className={cn('rounded-xl border border-slate-200 bg-white p-3 transition-all hover:shadow-sm', editingId === tid(t) && 'ring-1 ring-cshub-blue')}>
              {editingId === tid(t) ? (
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-cshub-blue" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none bg-white">
                      <option value="general">General</option><option value="hardware">Hardware</option><option value="software">Software</option>
                      <option value="virus">Virus</option><option value="network">Network</option><option value="training">Training</option>
                    </select>
                    <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none bg-white">
                      {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <textarea rows="2" className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none resize-none focus:border-cshub-blue" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-cshub-blue px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={savingId === tid(t)} onClick={() => handleUpdate(tid(t))}>{savingId === tid(t) ? '...' : 'Save'}</button>
                    <button className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="cursor-pointer" onClick={() => setViewTicket(t)}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusBadge status={t.status} />
                      <span className="rounded-full bg-slate-100 px-2 py-px text-[10px] font-medium text-slate-500">{t.category}</span>
                      <span className="text-[10px] text-slate-400 truncate">{t.userName}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="View" onClick={() => setViewTicket(t)}><FaEye className="text-[10px]" /></button>
                      <button className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Edit" onClick={() => { setEditingId(tid(t)); setEditForm({ title: t.title, description: t.description, category: t.category, status: t.status }); }}><FaEdit className="text-[10px]" /></button>
                      <button className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50" title="Delete" disabled={deletingId === tid(t)} onClick={() => handleDelete(tid(t))}>{deletingId === tid(t) ? '...' : <FaTrash className="text-[10px]" />}</button>
                    </div>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800">{t.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</span>
                    <select value={t.status} disabled={updatingId === tid(t)} onChange={(e) => { e.stopPropagation(); handleStatus(tid(t), e.target.value); }} className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 outline-none bg-white" onClick={(e) => e.stopPropagation()}>
                      {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
    await fetch(`${API_BASE}/api/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setUsers((prev) => prev.filter((u) => u.id !== id && u._id !== id));
    setDeletingId(null); showToast('User deleted.');
  };

  const handleUpdate = async (id) => {
    setSavingId(id);
    const res = await api(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(editForm) });
    setSavingId(null);
    if (res.error) return showToast(res.error, 'error');
    setUsers((prev) => prev.map((u) => (u.id === id || u._id === id ? res : u)));
    setEditingId(null); setEditForm({}); showToast('User updated.');
  };

  const uid = (u) => u.id || u._id;

  return (
    <div className="space-y-3">
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={fetchData} />}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Users ({users.length})</h3>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-cshub-blue px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#3f7ee8]"><FaPlus /> New User</button>
      </div>
      {loading ? <Loading /> : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center"><FaUsers className="mb-2 h-8 w-8 text-slate-200" /><p className="text-xs text-slate-400">No users.</p></div>
      ) : (
        <div className="space-y-6">
          {groupByMonth(users).map((g) => (
            <div key={g.label} className="space-y-2">
              <MonthHeader label={g.label} count={g.list.length} />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {g.list.map((u) => (
                  <div key={uid(u)} className="rounded-xl border border-slate-200 bg-white p-3">
              {editingId === uid(u) ? (
                <div className="space-y-2">
                  <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-cshub-blue focus:ring-2 focus:ring-cshub-blue/20" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" />
                  <input className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-cshub-blue focus:ring-2 focus:ring-cshub-blue/20" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" />
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" className="rounded accent-cshub-blue" checked={editForm.isAdmin} onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })} /> Admin
                  </label>
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-cshub-blue px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={savingId === uid(u)} onClick={() => handleUpdate(uid(u))}>{savingId === uid(u) ? '...' : 'Save'}</button>
                    <button className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cshub-blue/10 text-[11px] font-bold text-cshub-blue">
                    {(u.name || 'U').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <strong className="truncate text-xs font-semibold text-slate-800">{u.name}</strong>
                      {u.isAdmin && <span className="shrink-0 rounded-full bg-cshub-blue/10 px-1.5 py-px text-[9px] font-medium text-cshub-blue">Admin</span>}
                    </div>
                    <span className="block truncate text-[11px] text-slate-500">{u.email}</span>
                    <span className="text-[10px] text-slate-400">Created: {new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-cshub-blue/10 hover:text-cshub-blue" title="Edit" onClick={() => { setEditingId(uid(u)); setEditForm({ name: u.name, email: u.email, isAdmin: u.isAdmin }); }}><FaEdit className="text-[10px]" /></button>
                    {!u.isAdmin && <button className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50" title="Delete" disabled={deletingId === uid(u)} onClick={() => handleDelete(uid(u))}>{deletingId === uid(u) ? '...' : <FaTrash className="text-[10px]" />}</button>}
                  </div>
                </div>
              )}
            </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
    setDeletingId(null); showToast('Suggestion deleted.');
  };

  const sid = (i) => i.id || i._id;

  return (
    <div className="space-y-3">
      {detail && <DetailModal item={detail} type="suggestion" onClose={() => setDetail(null)} onUpdated={fetchData} />}
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><FaLightbulb className="h-3.5 w-3.5 text-slate-400" /> Suggestions ({items.length})</h3>
      {loading ? <Loading /> : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center"><FaLightbulb className="mb-2 h-8 w-8 text-slate-200" /><p className="text-xs text-slate-400">No suggestions.</p></div>
      ) : (
        <div className="space-y-6">
          {groupByMonth(items).map((g) => (
            <div key={g.label} className="space-y-2">
              <MonthHeader label={g.label} count={g.list.length} />
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {g.list.map((item) => (
                  <div key={sid(item)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-semibold text-slate-800 truncate">{item.title}</strong>
                    <StatusBadge status={item.status} />
                  </div>
                  <span className="text-[11px] text-slate-500 block">{item.userName} — {item.description?.slice(0, 100)}</span>
                  <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="View" onClick={() => setDetail(item)}><FaEye className="text-[10px]" /></button>
                  <button className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50" title="Delete" disabled={deletingId === sid(item)} onClick={() => handleDelete(sid(item))}>{deletingId === sid(item) ? '...' : <FaTrash className="text-[10px]" />}</button>
                </div>
              </div>
            </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
    setDeletingId(null); showToast('Message deleted.');
  };

  const cid = (i) => i.id || i._id;

  return (
    <div className="space-y-3">
      {detail && <DetailModal item={detail} type="contact" onClose={() => setDetail(null)} onUpdated={fetchData} />}
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><FaEnvelope className="h-3.5 w-3.5 text-slate-400" /> Contact Messages ({items.length})</h3>
      {loading ? <Loading /> : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center"><FaEnvelope className="mb-2 h-8 w-8 text-slate-200" /><p className="text-xs text-slate-400">No messages.</p></div>
      ) : (
        <div className="space-y-6">
          {groupByMonth(items).map((g) => (
            <div key={g.label} className="space-y-2">
              <MonthHeader label={g.label} count={g.list.length} />
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {g.list.map((item) => (
                  <div key={cid(item)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-semibold text-slate-800 truncate">{item.name}</strong>
                    <StatusBadge status={item.status} />
                  </div>
                  <span className="text-[11px] text-slate-500 block">{item.email} — {item.message?.slice(0, 100)}</span>
                  <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="View" onClick={() => setDetail(item)}><FaEye className="text-[10px]" /></button>
                  <button className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50" title="Delete" disabled={deletingId === cid(item)} onClick={() => handleDelete(cid(item))}>{deletingId === cid(item) ? '...' : <FaTrash className="text-[10px]" />}</button>
                </div>
              </div>
            </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminTeams() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [detail, setDetail] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [chattingId, setChattingId] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [showAssign, setShowAssign] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api('/api/admin/team-apps').then((d) => { setItems(sortByDate(d)); setLoading(false); }).catch(() => setLoading(false));
  };

  const fetchBeneficiaries = () => { api('/api/admin/beneficiaries').then((d) => setBeneficiaries(sortByDate(d))).catch(() => {}); };

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
    setDeletingId(null); showToast('Application deleted.');
  };

  const handleChat = async (id) => {
    setChattingId(id);
    try {
      const res = await api(`/api/admin/team-apps/${id}/conversation`, { method: 'POST' });
      setChattingId(null);
      if (res.error) return showToast(res.error, 'error');
      if (res._id) {
        window.dispatchEvent(new CustomEvent('opencode-navigate-tab', { detail: { tab: 'chat' } }));
        setTimeout(() => { window.dispatchEvent(new CustomEvent('opencode-select-conversation', { detail: { id: res._id, type: 'direct' } })); }, 200);
      }
    } catch (err) { setChattingId(null); showToast('Failed to start chat: ' + err.message, 'error'); }
  };

  const handleAssign = async (beneficiaryId, teamAppId) => {
    const app = items.find((i) => tid(i) === teamAppId);
    await api(`/api/admin/beneficiaries/${beneficiaryId}`, { method: 'PUT', body: JSON.stringify({ assignedTo: teamAppId, assignedToName: app?.name || '', status: 'in-progress' }) });
    fetchBeneficiaries(); showToast('Beneficiary assigned.'); setShowAssign(null);
  };

  const tid = (i) => i.id || i._id;
  const unassignedBeneficiaries = beneficiaries.filter((b) => !b.assignedTo);

  return (
    <div className="space-y-3">
      {showAssign && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setShowAssign(null)}>
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-bold text-slate-900">Assign Beneficiary</h3>
              <button onClick={() => setShowAssign(null)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200"><FaTimes /></button>
            </div>
            <div className="px-5 py-4">
              {unassignedBeneficiaries.length === 0 ? (
                <p className="text-xs text-slate-400">No unassigned beneficiaries available.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {unassignedBeneficiaries.map((b) => (
                    <div key={b._id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <div className="min-w-0">
                        <strong className="block text-xs font-semibold text-slate-800 truncate">{b.name}</strong>
                        <div className="text-[10px] text-slate-500 truncate">{b.issue?.slice(0, 60)}</div>
                      </div>
                      <button className="rounded-lg bg-cshub-blue px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#3f7ee8] shrink-0" onClick={() => handleAssign(b._id, showAssign)}>Assign</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {detail && <DetailModal item={detail} type="team" onClose={() => setDetail(null)} onUpdated={fetchData} />}
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><FaUserTie className="h-3.5 w-3.5 text-slate-400" /> Team Applications ({items.length})</h3>
      {loading ? <Loading /> : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center"><FaUserTie className="mb-2 h-8 w-8 text-slate-200" /><p className="text-xs text-slate-400">No applications.</p></div>
      ) : (
        <div className="space-y-6">
          {groupByMonth(items).map((g) => (
            <div key={g.label} className="space-y-2">
              <MonthHeader label={g.label} count={g.list.length} />
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {g.list.map((item) => (
                  <div key={tid(item)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-semibold text-slate-800 truncate">{item.name}</strong>
                    <StatusBadge status={item.status} />
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {item.email} — {item.location}
                    {item.applicantType ? ` · ${item.applicantType}` : ''}
                    {item.education ? ` · ${item.education}` : ''}
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 flex-wrap justify-end">
                  {item.status === 'pending' && (
                    <>
                      <button className="h-6 w-6 flex items-center justify-center rounded-md text-emerald-500 hover:bg-emerald-50" title="Approve" disabled={submitting} onClick={() => handleStatus(tid(item), 'approved')}><FaCheckCircle className="text-[10px]" /></button>
                      <button className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50" title="Reject" disabled={submitting} onClick={() => handleStatus(tid(item), 'rejected')}><FaBan className="text-[10px]" /></button>
                    </>
                  )}
                  {item.status === 'approved' && <button className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50" title="Reject" disabled={submitting} onClick={() => handleStatus(tid(item), 'rejected')}><FaBan className="text-[10px]" /></button>}
                  {item.status === 'rejected' && <button className="h-6 w-6 flex items-center justify-center rounded-md text-emerald-500 hover:bg-emerald-50" title="Approve" disabled={submitting} onClick={() => handleStatus(tid(item), 'approved')}><FaUndo className="text-[10px]" /></button>}
                  {item.status === 'approved' && <button className="h-6 w-6 flex items-center justify-center rounded-md text-cshub-blue hover:bg-blue-50" title="Chat" disabled={chattingId === tid(item)} onClick={() => handleChat(tid(item))}>{chattingId === tid(item) ? '...' : <FaComments className="text-[10px]" />}</button>}
                  {item.status === 'approved' && <button className="h-6 w-6 flex items-center justify-center rounded-md text-cshub-blue hover:bg-blue-50" title="Assign" onClick={() => setShowAssign(tid(item))}><FaUserTie className="text-[10px]" /></button>}
                  <button className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="View" onClick={() => setDetail(item)}><FaEye className="text-[10px]" /></button>
                  <button className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50" title="Delete" disabled={deletingId === tid(item)} onClick={() => handleDelete(tid(item))}>{deletingId === tid(item) ? '...' : <FaTrash className="text-[10px]" />}</button>
                </div>
              </div>
            </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
    showToast('News created.'); setShowCreate(false);
    setCreateForm({ title: '', content: '', mediaType: 'text', mediaUrl: '', published: true }); fetchData();
  };

  const handleUpdate = async (id) => {
    setSubmitting(true);
    const res = await api(`/api/admin/news/${id}`, { method: 'PUT', body: JSON.stringify(editForm) });
    setSubmitting(false);
    if (res.error) return showToast(res.error, 'error');
    setItems((prev) => prev.map((i) => (i._id === id || i.id === id ? { ...i, ...editForm } : i)));
    setEditingId(null); showToast('News updated.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this news item?')) return;
    setDeletingId(id);
    await fetch(`${API_BASE}/api/admin/news/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setItems((prev) => prev.filter((i) => i._id !== id && i.id !== id));
    setDeletingId(null); showToast('News deleted.');
  };

  const nid = (i) => i._id || i.id;

  const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-cshub-blue focus:ring-2 focus:ring-slate-900/10";
  const selectCls = "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none bg-white";

  return (
    <div className="space-y-3">
      {showCreate && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-bold text-slate-900">Create News</h3>
              <button onClick={() => setShowCreate(false)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200"><FaTimes /></button>
            </div>
            <form onSubmit={handleCreate} className="px-5 py-4 space-y-3">
              <input className={inputCls} placeholder="Title *" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} required />
              <select value={createForm.mediaType} onChange={(e) => setCreateForm({ ...createForm, mediaType: e.target.value })} className={selectCls}>
                <option value="text">Text / Article</option><option value="image">Image</option><option value="video">Video (YouTube)</option>
              </select>
              {createForm.mediaType !== 'text' && <input className={inputCls} placeholder={createForm.mediaType === 'image' ? 'Image URL' : 'YouTube Video URL'} value={createForm.mediaUrl} onChange={(e) => setCreateForm({ ...createForm, mediaUrl: e.target.value })} />}
              <textarea rows="4" className={cn(inputCls, "resize-none")} placeholder="Content (optional)" value={createForm.content} onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })} />
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" className="rounded" checked={createForm.published} onChange={(e) => setCreateForm({ ...createForm, published: e.target.checked })} /> Published
              </label>
              <button type="submit" className="w-full rounded-lg bg-cshub-blue py-2 text-xs font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={submitting}>{submitting ? 'Creating...' : 'Create News'}</button>
            </form>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><FaNewspaper className="h-3.5 w-3.5 text-slate-400" /> News ({items.length})</h3>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 rounded-lg bg-cshub-blue px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#3f7ee8]"><FaPlus /> New Post</button>
      </div>
      {loading ? <Loading /> : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center"><FaNewspaper className="mb-2 h-8 w-8 text-slate-200" /><p className="text-xs text-slate-400">No news posted yet.</p></div>
      ) : (
        <div className="space-y-6">
          {groupByMonth(items).map((g) => (
            <div key={g.label} className="space-y-2">
              <MonthHeader label={g.label} count={g.list.length} />
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {g.list.map((item) => (
                  <div key={nid(item)} className={cn("rounded-xl border border-slate-200 bg-white px-3.5 py-2.5", editingId === nid(item) && "ring-1 ring-cshub-blue")}>
              {editingId === nid(item) ? (
                <div className="space-y-2">
                  <input className={inputCls} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" />
                  <select value={editForm.mediaType} onChange={(e) => setEditForm({ ...editForm, mediaType: e.target.value })} className={selectCls}>
                    <option value="text">Text</option><option value="image">Image</option><option value="video">Video</option>
                  </select>
                  {(editForm.mediaType === 'image' || editForm.mediaType === 'video') && <input className={inputCls} value={editForm.mediaUrl} onChange={(e) => setEditForm({ ...editForm, mediaUrl: e.target.value })} placeholder={editForm.mediaType === 'image' ? 'Image URL' : 'YouTube URL'} />}
                  <textarea rows="3" className={cn(inputCls, "resize-none")} value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} placeholder="Content" />
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" className="rounded" checked={editForm.published} onChange={(e) => setEditForm({ ...editForm, published: e.target.checked })} /> Published
                  </label>
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-cshub-blue px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={submitting} onClick={() => handleUpdate(nid(item))}>{submitting ? '...' : 'Save'}</button>
                    <button className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-semibold text-slate-800 truncate">{item.title}</strong>
                      {item.mediaType === 'image' && <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-px text-[9px] font-medium text-slate-600"><FaImage /> Photo</span>}
                      {item.mediaType === 'video' && <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-px text-[9px] font-medium text-slate-600"><FaYoutube /> Video</span>}
                      {!item.published && <span className="rounded-full bg-slate-100 px-1.5 py-px text-[9px] font-medium text-slate-600">Draft</span>}
                    </div>
                    <span className="text-[11px] text-slate-500 block">{item.content?.slice(0, 100) || 'No content'}</span>
                    <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()} by {item.author}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Edit" onClick={() => { setEditingId(nid(item)); setEditForm({ title: item.title, content: item.content, mediaType: item.mediaType, mediaUrl: item.mediaUrl, published: item.published }); }}><FaEdit className="text-[10px]" /></button>
                    <button className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50" title="Delete" disabled={deletingId === nid(item)} onClick={() => handleDelete(nid(item))}>{deletingId === nid(item) ? '...' : <FaTrash className="text-[10px]" />}</button>
                  </div>
                </div>
              )}
            </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
    setSubmittingId(null); showToast('Testimonial deleted.');
  };

  const nid = (i) => i._id || i.id;

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><FaStar className="h-3.5 w-3.5 text-slate-400" /> Testimonials ({items.length})</h3>
      {loading ? <Loading /> : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center"><FaStar className="mb-2 h-8 w-8 text-slate-200" /><p className="text-xs text-slate-400">No testimonials yet.</p></div>
      ) : (
        <div className="space-y-6">
          {groupByMonth(items).map((g) => (
            <div key={g.label} className="space-y-2">
              <MonthHeader label={g.label} count={g.list.length} />
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {g.list.map((item) => (
                  <div key={nid(item)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-semibold text-slate-800 truncate">{item.name}</strong>
                    {item.role && <span className="text-[11px] text-slate-500">— {item.role}</span>}
                    {item.approved ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-px text-[9px] font-medium text-emerald-700"><FaCheck /> Approved</span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-1.5 py-px text-[9px] font-medium text-amber-700">Pending</span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => <FaStar key={s} size={10} className={s <= item.rating ? 'text-slate-700' : 'text-slate-200'} />)}
                  </div>
                  <span className="text-[11px] text-slate-500 block">&ldquo;{item.content?.slice(0, 200)}&rdquo;</span>
                  <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!item.approved && <button className="h-6 w-6 flex items-center justify-center rounded-md text-emerald-500 hover:bg-emerald-50" title="Approve" disabled={submittingId === nid(item)} onClick={() => handleApprove(nid(item))}>{submittingId === nid(item) ? '...' : <FaCheckCircle className="text-[10px]" />}</button>}
                  <button className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50" title="Delete" disabled={submittingId === nid(item)} onClick={() => handleDelete(nid(item))}>{submittingId === nid(item) ? '...' : <FaTrash className="text-[10px]" />}</button>
                </div>
              </div>
            </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
    setEditingId(null); showToast('Beneficiary updated.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this beneficiary record?')) return;
    setDeletingId(id);
    await fetch(`${API_BASE}/api/admin/beneficiaries/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setItems((prev) => prev.filter((i) => i._id !== id && i.id !== id));
    setDeletingId(null); showToast('Beneficiary deleted.');
  };

  const nid = (i) => i._id || i.id;
  const BSTATUSES = ['open', 'in-progress', 'resolved', 'closed'];
  const bStatusColors = { open: 'bg-cshub-blue/10 text-cshub-blue', 'in-progress': 'bg-amber-100 text-amber-700', resolved: 'bg-emerald-100 text-emerald-700', closed: 'bg-slate-100 text-slate-500' };

  const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-cshub-blue focus:ring-2 focus:ring-slate-900/10";
  const selectCls = "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none bg-white";

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><FaUserTie className="h-3.5 w-3.5 text-slate-400" /> Beneficiaries ({items.length})</h3>
      {loading ? <Loading /> : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center"><FaUserTie className="mb-2 h-8 w-8 text-slate-200" /><p className="text-xs text-slate-400">No beneficiaries yet.</p></div>
      ) : (
        <div className="space-y-6">
          {groupByMonth(items).map((g) => (
            <div key={g.label} className="space-y-2">
              <MonthHeader label={g.label} count={g.list.length} />
              <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {g.list.map((item) => (
                  <div key={nid(item)} className={cn("rounded-xl border border-slate-200 bg-white px-3.5 py-2.5", editingId === nid(item) && "ring-1 ring-cshub-blue")}>
              {editingId === nid(item) ? (
                <div className="space-y-2">
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className={selectCls}>
                    {BSTATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={editForm.assignedTo} onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })} className={selectCls}>
                    <option value="">Unassigned</option>
                    {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                  <textarea rows="2" className={cn(inputCls, "resize-none")} placeholder="Admin notes" value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-cshub-blue px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={savingId === nid(item)} onClick={() => handleUpdate(nid(item))}>{savingId === nid(item) ? '...' : 'Save'}</button>
                    <button className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-semibold text-slate-800 truncate">{item.name}</strong>
                      <span className={cn("rounded-full px-1.5 py-px text-[9px] font-semibold", bStatusColors[item.status] || bStatusColors.open)}>{item.status}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">{item.issue?.slice(0, 120)}</span>
                    <span className="text-[10px] text-slate-400">
                      {item.phone || item.email ? `${item.phone || item.email} ` : ''}
                      {item.location ? ` · ${item.location}` : ''}
                      {item.assignedToName ? ` · Assigned: ${item.assignedToName}` : ' · Unassigned'}
                      · {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Edit" onClick={() => { setEditingId(nid(item)); setEditForm({ status: item.status, assignedTo: item.assignedTo || '', notes: item.notes || '' }); }}><FaEdit className="text-[10px]" /></button>
                    <button className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50" title="Delete" disabled={deletingId === nid(item)} onClick={() => handleDelete(nid(item))}>{deletingId === nid(item) ? '...' : <FaTrash className="text-[10px]" />}</button>
                  </div>
                </div>
              )}
            </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const size = 84;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circum = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
          {total > 0 &&
            data.map((d, i) => {
              const len = (d.value / total) * circum;
              const slice = (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={d.color}
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(len - 2, 0)} ${circum}`}
                  strokeDashoffset={-acc}
                />
              );
              acc += len;
              return slice;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-900">{total}</span>
          <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-400">Total</span>
        </div>
      </div>
      <div className="grid w-full grid-cols-3 gap-1">
        {data.map((d) => (
          <div key={d.label} className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-[10px] font-semibold text-slate-700">{d.value}</span>
            </div>
            <div className="truncate text-[9px] text-slate-400">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsView({ stats, ticketChart, appChart, datasets = {}, onNavigate, user }) {
  const totalItems = Object.values(stats).reduce((a, b) => a + b, 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    { key: 'tickets', label: 'Tickets', count: stats.tickets, icon: FaTicketAlt },
    { key: 'users', label: 'Users', count: stats.users, icon: FaUsers },
    { key: 'suggestions', label: 'Suggestions', count: stats.suggestions, icon: FaLightbulb },
    { key: 'contacts', label: 'Messages', count: stats.contacts, icon: FaEnvelope },
    { key: 'teams', label: 'Applications', count: stats.teams, icon: FaUserTie },
    { key: 'beneficiaries', label: 'Beneficiaries', count: stats.beneficiaries, icon: FaUserTie },
    { key: 'news', label: 'News', count: stats.news, icon: FaNewspaper },
    { key: 'courses', label: 'Courses', count: stats.courses, icon: FaBookOpen },
    { key: 'testimonials', label: 'Testimonials', count: stats.testimonials, icon: FaStar },
    { key: 'payments', label: 'Payments', count: stats.payments, icon: FaDownload },
  ];
  const barMax = Math.max(...statCards.map((c) => c.count), 1);

  const hasActivity = totalItems > 0;
  const alerts = [];
  if (ticketChart.open > 0) alerts.push({ icon: FaTicketAlt, title: `${ticketChart.open} open ticket${ticketChart.open !== 1 ? 's' : ''} need attention`, sub: 'Support queue', nav: 'tickets', tone: 'bg-cshub-blue/10 text-cshub-blue' });
  if (appChart.pending > 0) alerts.push({ icon: FaUserTie, title: `${appChart.pending} application${appChart.pending !== 1 ? 's' : ''} pending review`, sub: 'Team applications', nav: 'teams', tone: 'bg-amber-100 text-amber-700' });
  if (stats.contacts > 0) alerts.push({ icon: FaEnvelope, title: 'Messages waiting for reply', sub: 'Contact form', nav: 'contacts', tone: 'bg-cshub-blue/10 text-cshub-blue' });
  if (stats.suggestions > 0) alerts.push({ icon: FaLightbulb, title: 'Suggestions to review', sub: 'Community feedback', nav: 'suggestions', tone: 'bg-cshub-blue/10 text-cshub-blue' });
  const needAttentionCount = ticketChart.open + appChart.pending + stats.contacts + stats.suggestions;

  const chartMetrics = [
    { key: 'users', label: 'Users', dataKey: 'users' },
    { key: 'tickets', label: 'Support', dataKey: 'tickets' },
    { key: 'messages', label: 'Messages', dataKey: 'contacts' },
    { key: 'apps', label: 'Applications', dataKey: 'teams' },
    { key: 'payments', label: 'Payments', dataKey: 'payments' },
  ];
  const periods = [
    { label: '7D', days: 7 },
    { label: '28D', days: 28 },
    { label: '90D', days: 90 },
  ];
  const [metricKey, setMetricKey] = useState('users');
  const [periodDays, setPeriodDays] = useState(28);
  const activeMetric = chartMetrics.find((m) => m.key === metricKey) || chartMetrics[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayBuckets = [];
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dayBuckets.push(d);
  }
  const counts = dayBuckets.map((d) => {
    const list = datasets[activeMetric.dataKey] || [];
    return list.filter((r) => {
      const dt = new Date(r.createdAt);
      return !isNaN(dt) && dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth() && dt.getDate() === d.getDate();
    }).length;
  });
  const maxCount = Math.max(1, ...counts);
  const rangeTotal = counts.reduce((a, b) => a + b, 0);
  const rangeStart = new Date(dayBuckets[0]);
  const prevTheshold = new Date(rangeStart);
  prevTheshold.setDate(rangeStart.getDate() - periodDays);
  const prevTotal = (datasets[activeMetric.dataKey] || []).filter((r) => {
    const dt = new Date(r.createdAt);
    return !isNaN(dt) && dt >= prevTheshold && dt < rangeStart;
  }).length;
  const delta = prevTotal > 0 ? Math.round(((rangeTotal - prevTotal) / prevTotal) * 100) : null;
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const labelStep = Math.ceil(periodDays / 6);

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Greeting */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 lg:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 lg:text-xl">{greeting}, {user?.name?.split(' ')[0] || 'Admin'}</h1>
            <p className="mt-0.5 text-xs text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-xl font-bold text-slate-900">{totalItems}</div>
              <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Total Items</div>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-xl font-bold text-cshub-blue">{needAttentionCount}</div>
              <div className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Need Review</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-10">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => onNavigate(c.key)}
              className="rounded-xl border border-slate-200 bg-white p-3 text-left transition-all hover:border-slate-300 hover:shadow-sm"
            >
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-cshub-blue/10 text-cshub-blue">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="text-lg font-bold text-slate-900">{c.count}</div>
              <div className="text-[10px] font-medium text-slate-400">{c.label}</div>
            </button>
          );
        })}
      </div>

      {/* Activity Trend */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FaChartLine className="h-4 w-4 text-cshub-blue" />
              <h3 className="text-sm font-semibold text-slate-900">Activity Overview</h3>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{rangeTotal}</span>
              <span className="text-[11px] text-slate-400">{activeMetric.label} in the last {periodDays} days</span>
              {delta !== null && (
                <span className={cn('text-[11px] font-semibold', delta >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                  {delta >= 0 ? '\u25B2' : '\u25BC'} {Math.abs(delta)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {chartMetrics.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetricKey(m.key)}
                  className={cn('rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors', metricKey === m.key ? 'bg-white text-cshub-blue shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {periods.map((p) => (
                <button
                  key={p.days}
                  onClick={() => setPeriodDays(p.days)}
                  className={cn('rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors', periodDays === p.days ? 'bg-white text-cshub-blue shadow-sm' : 'text-slate-500 hover:text-slate-700')}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex h-40 items-end gap-px">
          {counts.map((c, i) => {
            const d = dayBuckets[i];
            const isToday = i === counts.length - 1;
            return (
              <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
                <div className="pointer-events-none absolute left-1/2 top-0 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-[10px] font-medium text-white group-hover:block">
                  {fmt(d)} · {c}
                </div>
                <div
                  className={cn('w-full rounded-t-[3px] transition-colors', isToday ? 'bg-[#3f7ee8]' : 'bg-cshub-blue/70 group-hover:bg-cshub-blue')}
                  style={{ height: `${Math.max((c / maxCount) * 100, c > 0 ? 4 : 0)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex gap-px">
          {counts.map((_, i) => (
            <div key={i} className="flex-1">
              {(i % labelStep === 0 || i === counts.length - 1) ? (
                <span className="text-[9px] text-slate-400">{fmt(dayBuckets[i])}</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* System Analysis */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Distribution bars */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaChartBar className="h-4 w-4 text-cshub-blue" />
              <h3 className="text-sm font-semibold text-slate-900">System Analysis</h3>
            </div>
            <span className="text-[10px] font-medium text-slate-400">Total {totalItems} items</span>
          </div>
          <div className="space-y-1.5">
            {statCards.map((item) => {
              const pct = (item.count / barMax) * 100;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className="group flex w-full items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-50"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cshub-blue/10 text-cshub-blue">
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  <span className="w-24 shrink-0 truncate text-left text-[11px] font-medium text-slate-500 group-hover:text-slate-700">{item.label}</span>
                  <div className="h-3.5 flex-1 overflow-hidden rounded-md bg-slate-100">
                    <div
                      className="flex h-full items-center justify-end rounded-md bg-cshub-blue pr-1 transition-all duration-500 ease-out group-hover:bg-[#3f7ee8]"
                      style={{ width: `${Math.max(pct, item.count > 0 ? 6 : 0)}%` }}
                    >
                      {pct > 12 && <span className="text-[9px] font-bold text-white">{item.count}</span>}
                    </div>
                  </div>
                  {pct <= 12 && <span className="w-6 shrink-0 text-right text-[11px] font-semibold text-slate-600">{item.count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Donut breakdowns */}
        <div className="space-y-3 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
              <FaTicketAlt className="text-slate-400" /> Ticket Status
            </h4>
            {stats.tickets > 0 ? (
              <DonutChart
                data={[
                  { label: 'Open', value: ticketChart.open, color: '#5694F7' },
                  { label: 'Resolved', value: ticketChart.resolved, color: '#94A3B8' },
                  { label: 'Closed', value: ticketChart.closed, color: '#CBD5E1' },
                ]}
              />
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">No tickets yet.</div>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h4 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
              <FaUserTie className="text-slate-400" /> Applications
            </h4>
            {stats.teams > 0 ? (
              <DonutChart
                data={[
                  { label: 'Pending', value: appChart.pending, color: '#F59E0B' },
                  { label: 'Approved', value: appChart.approved, color: '#10B981' },
                  { label: 'Rejected', value: appChart.rejected, color: '#EF4444' },
                ]}
              />
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">No applications yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaBell className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
          </div>
          {alerts.length > 0 && (
            <span className="rounded-full bg-cshub-blue/10 px-2 py-0.5 text-[10px] font-semibold text-cshub-blue">{alerts.length} to review</span>
          )}
        </div>
        <div className="space-y-1">
          {alerts.map((a, i) => (
            <button key={i} onClick={() => onNavigate(a.nav)} className="flex w-full max-w-3xl items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-slate-50">
              <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md', a.tone)}><a.icon className="h-3 w-3" /></span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-700">{a.title}</div>
                <div className="text-[10px] text-slate-400">{a.sub}</div>
              </div>
            </button>
          ))}
          {alerts.length === 0 && hasActivity && (
            <div className="flex max-w-3xl items-center gap-2.5 rounded-lg bg-emerald-50 px-3 py-3">
              <FaCheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
              <div>
                <div className="text-xs font-medium text-emerald-700">You're all caught up</div>
                <div className="text-[10px] text-emerald-500">Nothing needs your attention right now.</div>
              </div>
            </div>
          )}
          {alerts.length === 0 && !hasActivity && (
            <div className="py-4 text-center">
              <FaChartBar className="mx-auto mb-1 h-6 w-6 text-slate-200" />
              <p className="text-xs font-medium text-slate-400">No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminInvites() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [emailModal, setEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingEmails, setSendingEmails] = useState(false);

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
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ status }),
      });
      setInvites((prev) => prev.map((inv) => inv._id === id ? { ...inv, status } : inv));
    } catch { }
    setUpdatingId(null);
  };

  const deleteInvite = async (id) => {
    if (!confirm('Delete this registration?')) return;
    try {
      await fetch(`${API_BASE}/api/session-invites/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
      setInvites((prev) => prev.filter((inv) => inv._id !== id));
    } catch { }
  };

  const resendEmail = async (id) => {
    setUpdatingId(id);
    try {
      await fetch(`${API_BASE}/api/session-invites/${id}/resend-email`, { method: 'POST', headers: { Authorization: `Bearer ${token()}` } });
      setInvites((prev) => prev.map((inv) => inv._id === id ? { ...inv, emailSent: true } : inv));
    } catch { }
    setUpdatingId(null);
  };

  const resendAllEmails = async () => {
    if (!confirm(`Send emails to all ${invites.length} registrations?`)) return;
    setUpdatingId('all');
    try {
      const res = await fetch(`${API_BASE}/api/session-invites/resend-all`, {
        method: 'POST', headers: { Authorization: `Bearer ${token()}` },
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error('Server returned unexpected response. Please try again.'); }
      alert(`Done! Sent: ${data.sent}, Failed: ${data.failed}`);
      fetchInvites();
    } catch { }
    setUpdatingId(null);
  };

  const sendCustomEmails = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) return;
    setSendingEmails(true);
    try {
      const res = await fetch(`${API_BASE}/api/session-invites/send-custom-email`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ subject: emailSubject.trim(), message: emailMessage.trim() }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(`Server returned unexpected response. Please try again.`); }
      if (!res.ok) throw new Error(data.error || 'Failed to send emails');
      alert(`Done! Sent: ${data.sent}, Failed: ${data.failed}`);
      setEmailModal(false); setEmailSubject(''); setEmailMessage('');
    } catch (e) { alert(`Error: ${e.message}`); }
    setSendingEmails(false);
  };

  const exportToExcel = () => {
    const headers = ['Name', 'Email', 'Phone', 'Level', 'Status', 'Interests', 'Suggestion', 'Heard From', 'Email Sent', 'Registration Date'];
    const rows = invites.map((inv) => [
      inv.name, inv.email, inv.phone || '', inv.level || '', inv.status,
      (inv.interests || []).join('; '), inv.suggestion || '', inv.heardFrom || '',
      inv.emailSent ? 'Yes' : 'No', new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url;
    link.download = `session-invites-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  const filtered = invites.filter((inv) => (statusFilter === 'all' || inv.status === statusFilter) && (monthFilter === 'all' || monthLabel(inv.createdAt) === monthFilter));
  const counts = { all: invites.length, new: invites.filter((i) => i.status === 'new').length, contacted: invites.filter((i) => i.status === 'contacted').length, confirmed: invites.filter((i) => i.status === 'confirmed').length };
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const invStatusColors = { new: 'bg-cshub-blue/10 text-cshub-blue border-cshub-blue/20', contacted: 'bg-amber-100 text-amber-700 border-amber-200', confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200' };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button disabled={invites.length === 0} onClick={() => setEmailModal(true)} className="flex items-center gap-1.5 rounded-lg bg-cshub-yellow px-3 py-1.5 text-[11px] font-semibold text-slate-900 hover:brightness-110 disabled:opacity-50"><FaEnvelope /> Send All Emails</button>
        <button disabled={invites.length === 0} onClick={exportToExcel} className="flex items-center gap-1.5 rounded-lg bg-cshub-blue px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50"><FaDownload /> Export</button>
        <div className="flex gap-1 flex-wrap">
          {['all', 'new', 'contacted', 'confirmed'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors', statusFilter === s ? 'bg-cshub-blue text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50')}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s] || 0})
            </button>
          ))}
        </div>
      </div>

      {invites.length > 0 && <MonthFilter items={invites} value={monthFilter} onChange={setMonthFilter} />}

      {loading ? (
        <div className="flex items-center justify-center py-10"><FaSpinner className="h-5 w-5 animate-spin text-slate-300" /></div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-xs text-red-600"><FaExclamationTriangle className="mr-1" /> {error}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center"><p className="text-xs text-slate-400">No registrations found.</p></div>
      ) : (
        <div className="space-y-6">
          {groupByMonth(filtered).map((g) => (
            <div key={g.label} className="space-y-2">
              <MonthHeader label={g.label} count={g.list.length} />
              <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                {g.list.map((inv) => (
                  <div key={inv._id} className="rounded-xl border border-slate-200 bg-white p-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <strong className="truncate text-xs font-semibold text-slate-800">{inv.name}</strong>
                    <span className={cn("rounded-full border px-1.5 py-px text-[9px] font-semibold shrink-0", invStatusColors[inv.status] || invStatusColors.new)}>{inv.status}</span>
                    {inv.emailSent && <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-px text-[9px] font-medium text-slate-500">sent</span>}
                  </div>
                  <div className="mt-0.5 truncate text-[11px] text-slate-500">
                    {inv.email}
                    {inv.phone && <span className="text-slate-400"> · {inv.phone}</span>}
                    <span className="text-slate-400"> · {formatDate(inv.createdAt)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="rounded-md bg-slate-100 px-1.5 py-px font-medium text-slate-600">{inv.level || '—'}</span>
                    {inv.heardFrom && <span>Heard via: <span className="text-slate-500">{inv.heardFrom}</span></span>}
                  </div>
                  {inv.interests?.length > 0 && (
                    <div className="mt-1 flex max-w-full flex-wrap gap-1">
                      {inv.interests.map((i) => <span key={i} className="rounded-full bg-slate-100 px-2 py-px text-[9px] text-slate-500">{i}</span>)}
                    </div>
                  )}
                  {inv.suggestion && <div className="mt-1 truncate text-[11px] text-slate-500">&ldquo;{inv.suggestion}&rdquo;</div>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {inv.status === 'new' && <button disabled={updatingId === inv._id} onClick={() => updateStatus(inv._id, 'contacted')} title="Mark as Contacted" className="h-7 w-7 flex items-center justify-center rounded-lg bg-cshub-blue/10 text-cshub-blue hover:bg-cshub-blue/20 disabled:opacity-50"><FaCheck className="text-[10px]" /></button>}
                  {inv.status === 'contacted' && <button disabled={updatingId === inv._id} onClick={() => updateStatus(inv._id, 'confirmed')} title="Confirm" className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 disabled:opacity-50"><FaCheck className="text-[10px]" /></button>}
                  <button disabled={updatingId === inv._id} onClick={() => resendEmail(inv._id)} title="Resend Email" className="h-7 w-7 flex items-center justify-center rounded-lg bg-cshub-blue/10 text-cshub-blue hover:bg-cshub-blue/20 disabled:opacity-50"><FaEnvelope className="text-[10px]" /></button>
                  <button onClick={() => deleteInvite(inv._id)} title="Delete" className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500"><FaTrash className="text-[10px]" /></button>
                </div>
              </div>
            </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {emailModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => !sendingEmails && setEmailModal(false)}>
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-bold text-slate-900">Send Email to All Registrations</h3>
              <button disabled={sendingEmails} onClick={() => setEmailModal(false)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200"><FaTimes /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs text-slate-500">This will send your email to all <strong className="text-slate-700">{invites.length}</strong> registered participants.</p>
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-slate-500 uppercase">Subject</label>
                <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-cshub-blue focus:ring-2 focus:ring-slate-900/10" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="e.g. Session Schedule Update" disabled={sendingEmails} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-slate-500 uppercase">Message</label>
                <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none resize-none focus:border-cshub-blue focus:ring-2 focus:ring-slate-900/10" value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Write your message here..." rows={5} disabled={sendingEmails} />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button disabled={sendingEmails} onClick={() => setEmailModal(false)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50">Cancel</button>
                <button disabled={sendingEmails || !emailSubject.trim() || !emailMessage.trim()} onClick={sendCustomEmails} className="flex items-center gap-1.5 rounded-lg bg-cshub-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50">
                  {sendingEmails ? <><FaSpinner className="animate-spin" /> Sending...</> : <><FaEnvelope /> Send to All ({invites.length})</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <img src="/LOGO IMAGE.png" alt="CS Hub" className="h-16 w-16 rounded-2xl shadow-lg" loading="lazy" />
      <div className="flex items-center gap-2 text-slate-400">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-cshub-yellow" />
        <span className="text-sm font-medium">Loading...</span>
      </div>
    </div>
  );
}

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
  const [stats, setStats] = useState({ users: 0, tickets: 0, suggestions: 0, contacts: 0, teams: 0, news: 0, courses: 0, beneficiaries: 0, testimonials: 0, liveSessions: 0, payments: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const h = (e) => setTab(e.detail.tab);
    window.addEventListener('opencode-navigate-tab', h);
    return () => window.removeEventListener('opencode-navigate-tab', h);
  }, []);

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
  const [datasets, setDatasets] = useState({});

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
      ['liveSessions', '/api/admin/live-sessions'],
      ['payments', '/api/admin/payments'],
    ];
    Promise.allSettled(endpoints.map(([_, url]) => api(url)))
      .then((results) => {
        const s = { users: 0, tickets: 0, suggestions: 0, contacts: 0, teams: 0, news: 0, courses: 0, beneficiaries: 0, testimonials: 0, liveSessions: 0, payments: 0 };
        results.forEach((r, i) => {
          if (r.status === 'fulfilled' && Array.isArray(r.value)) s[endpoints[i][0]] = r.value.length;
        });
        setStats(s);
        const ds = {};
        endpoints.forEach(([k], i) => {
          if (results[i].status === 'fulfilled' && Array.isArray(results[i].value)) ds[k] = results[i].value;
        });
        setDatasets(ds);
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
  const [readNotifs, setReadNotifs] = useState(new Set());

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
      setUnreadCount(items.filter(i => !readNotifs.has(`${i.type}-${i.id}`)).length);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [readNotifs]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    if (notifOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const markNotifRead = (key) => {
    setReadNotifs(prev => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllNotifsRead = () => {
    const keys = notifications.map(n => `${n.type}-${n.id}`);
    setReadNotifs(prev => {
      const next = new Set(prev);
      keys.forEach(k => next.add(k));
      return next;
    });
    setUnreadCount(0);
  };

  const handleNotifClick = (item) => {
    markNotifRead(`${item.type}-${item.id}`);
    setNotifOpen(false);
    setTab(item.tab);
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  const pageTitles = {
    analytics: { title: 'Dashboard', sub: 'Welcome back, ' + (user?.name?.split(' ')[0] || 'Admin') },
    tickets: { title: 'Tickets', sub: 'Manage and track all support requests' },
    users: { title: 'Users', sub: 'Manage user accounts and permissions' },
    suggestions: { title: 'Suggestions', sub: 'Review and manage user suggestions' },
    contacts: { title: 'Contacts', sub: 'View and respond to contact messages' },
    teams: { title: 'Applications', sub: 'Review team applications' },
    chat: { title: 'Chat', sub: 'Communicate with users in real-time' },
    news: { title: 'News', sub: 'Create and manage news articles' },
    courses: { title: 'Courses', sub: 'Manage courses and learning materials' },
    payments: { title: 'Payments', sub: 'Review and manage certificate payments' },
    'live-sessions': { title: 'Live Sessions', sub: 'Manage live lectures and student rooms' },
    beneficiaries: { title: 'Beneficiaries', sub: 'Track and manage beneficiaries' },
    testimonials: { title: 'Testimonials', sub: 'Review and approve testimonials' },
    invites: { title: 'Session Invites', sub: 'Manage session registrations' },
    settings: { title: 'Settings', sub: 'Manage your profile and preferences' },
  };

  const currentPage = pageTitles[tab] || pageTitles.analytics;

  const renderContent = () => {
    if (tab === 'analytics') {
      return statsLoading ? (
        <Loading />
      ) : (
        <AnalyticsView stats={stats} ticketChart={ticketChart} appChart={appChart} datasets={datasets} onNavigate={(t) => setTab(t)} user={user} />
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
    if (tab === 'payments') return <AdminPayments />;
    if (tab === 'testimonials') return <AdminTestimonials />;
    if (tab === 'invites') return <AdminInvites />;
    if (tab === 'live-sessions') return <LiveSessionsAdmin />;
    if (tab === 'settings') {
      setProfileEditOpen(true);
      setProfileTab('profile');
      setTab('analytics');
      return null;
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <AdminSidebar
        activeTab={tab}
        onTabChange={setTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <div className="flex flex-1 flex-col lg:ml-[280px] transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-lg lg:px-5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex flex-col min-w-0">
            <h2 className="text-sm font-bold text-slate-900 leading-tight">{currentPage.title}</h2>
            <span className="text-[10px] text-slate-400">{currentPage.sub}</span>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Search */}
            <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 h-8 w-52 transition-all focus-within:border-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-200">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Settings */}
            <button
              onClick={() => { setProfileEditOpen(true); setProfileTab('password'); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl shadow-black/10 animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <div className="flex items-center gap-1.5">
                      {unreadCount > 0 && <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">{unreadCount} new</span>}
                      {unreadCount > 0 && (
                        <button onClick={markAllNotifsRead} className="text-[10px] font-semibold text-cshub-yellow hover:underline">
                          Mark all read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center">
                        <Bell className="mx-auto mb-1.5 h-6 w-6 text-slate-300" />
                        <p className="text-xs font-medium text-slate-500">No new notifications</p>
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((n) => {
                        const key = `${n.type}-${n.id}`;
                        const isRead = readNotifs.has(key);
                        return (
                          <button
                            key={key}
                            onClick={() => handleNotifClick(n)}
                            className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 border-b border-slate-50 ${isRead ? 'opacity-50' : ''}`}
                          >
                            <span className="text-sm shrink-0 mt-0.5">{n.icon}</span>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium text-slate-800 truncate">{n.title}</div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">{n.sub}</div>
                            </div>
                            {!isRead && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="border-t border-slate-100 px-3 py-2 text-center">
                      <button onClick={() => { setNotifOpen(false); setTab('contacts'); }} className="text-[10px] font-semibold text-cshub-yellow hover:underline">
                        View all
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:block">Logout</span>
            </button>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white py-1 pl-1 pr-2.5 transition-colors hover:bg-slate-50"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cshub-yellow text-[10px] font-bold text-slate-900">
                  {initials}
                </div>
                <span className="hidden sm:block text-xs font-semibold text-slate-700">{user?.name || 'Admin'}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-black/10 animate-in fade-in z-50">
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cshub-yellow text-xs font-bold text-slate-900">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">{user?.name || 'Admin'}</div>
                        <div className="text-[10px] text-slate-400 truncate">{user?.email || ''}</div>
                        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                          <ShieldCheck className="h-2 w-2" /> Admin
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { setProfileEditOpen(true); setProfileTab('profile'); setProfileOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                    <FaEdit className="text-xs text-slate-400" /> Edit Profile
                  </button>
                  <button onClick={() => { setProfileEditOpen(true); setProfileTab('password'); setProfileOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
                    <Settings className="h-3.5 w-3.5 text-slate-400" /> Settings & Password
                  </button>
                  <div className="my-0.5 border-t border-slate-100" />
                  <button onClick={handleLogout} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-3 lg:p-4">
          {renderContent()}
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
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cshub-yellow text-sm font-bold text-slate-900">{initials}</div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">Full Name</label>
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200" type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">Email</label>
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200" type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                  </div>
                  <button className="mt-0.5 w-full rounded-lg bg-cshub-blue py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3f7ee8] disabled:opacity-50" onClick={handleProfileSave} disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">Current Password</label>
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200" type="password" value={pwdForm.current} onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">New Password</label>
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200" type="password" value={pwdForm.newPwd} onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">Confirm New Password</label>
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200" type="password" value={pwdForm.confirm} onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} />
                  </div>
                  <button className="mt-0.5 w-full rounded-lg bg-cshub-blue py-2 text-xs font-semibold text-white transition-colors hover:bg-[#3f7ee8] disabled:opacity-50" onClick={handlePasswordChange} disabled={profileLoading}>
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
