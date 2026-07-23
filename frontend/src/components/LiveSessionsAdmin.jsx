import { useState, useEffect } from 'react';
import { FaPlus, FaVideo, FaCalendarAlt, FaClock, FaUsers, FaPlay, FaStop, FaTrash, FaEdit, FaTimes, FaEye, FaSpinner } from 'react-icons/fa';
import { cn } from '../lib/utils';
import API_BASE from '../api';
import { useToast } from '../ToastContext';
import JitsiRoom from './JitsiRoom';

const api = async (url, opts = {}) => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers };
  try { const res = await fetch(`${API_BASE}${url}`, { ...opts, headers }); return await res.json(); } catch { return { error: 'Network error' }; }
};

const STATUSES = { scheduled: 'bg-blue-100 text-blue-600', live: 'bg-emerald-100 text-emerald-600', ended: 'bg-slate-100 text-slate-500', cancelled: 'bg-red-100 text-red-500' };

export default function LiveSessionsAdmin() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editSession, setEditSession] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', scheduledAt: '', duration: 60, settings: { enableChat: true, enableScreenShare: true, enableRecording: false, muteParticipants: false, maxParticipants: 100 } });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = () => {
    setLoading(true);
    api('/api/admin/live-sessions').then((d) => { setSessions(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showToast('Title required.', 'error');
    if (!form.scheduledAt) return showToast('Schedule time required.', 'error');
    setSubmitting(true);
    const body = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() };
    const res = editSession ? await api(`/api/admin/live-sessions/${editSession._id}`, { method: 'PUT', body: JSON.stringify(body) }) : await api('/api/admin/live-sessions', { method: 'POST', body: JSON.stringify(body) });
    setSubmitting(false);
    if (res.error) return showToast(res.error, 'error');
    showToast(editSession ? 'Session updated.' : 'Session created.');
    setShowCreate(false); setEditSession(null);
    setForm({ title: '', description: '', scheduledAt: '', duration: 60, settings: { enableChat: true, enableScreenShare: true, enableRecording: false, muteParticipants: false, maxParticipants: 100 } });
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session?')) return;
    const res = await api(`/api/admin/live-sessions/${id}`, { method: 'DELETE' });
    if (res.error) return showToast(res.error, 'error');
    showToast('Session deleted.'); fetchData();
  };

  const handleStart = async (id) => {
    const res = await api(`/api/admin/live-sessions/${id}/start`, { method: 'POST' });
    if (res.error) return showToast(res.error, 'error');
    showToast('Session is now live!'); fetchData();
  };

  const handleEnd = async (id) => {
    const res = await api(`/api/admin/live-sessions/${id}/end`, { method: 'POST' });
    if (res.error) return showToast(res.error, 'error');
    showToast('Session ended.'); fetchData();
    setActiveRoom(null);
  };

  const openEdit = (s) => {
    setForm({
      title: s.title, description: s.description || '',
      scheduledAt: s.scheduledAt ? new Date(s.scheduledAt).toISOString().slice(0, 16) : '',
      duration: s.duration || 60,
      settings: { ...form.settings, ...(s.settings || {}) },
    });
    setEditSession(s); setShowCreate(true);
  };

  const joinAsHost = (s) => {
    setActiveRoom(s);
  };

  if (activeRoom) {
    return (
      <div className="fixed inset-0 z-[999] bg-slate-950">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-slate-900/95 px-4 py-2 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center gap-3">
            <FaVideo className="h-4 w-4 text-emerald-400" />
            <div>
              <h3 className="text-xs font-bold text-white">{activeRoom.title}</h3>
              <p className="text-[10px] text-slate-400">You are hosting this session</p>
            </div>
          </div>
          <button onClick={() => handleEnd(activeRoom._id)} className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600">
            <FaStop className="text-[10px]" /> End Session
          </button>
        </div>
        <div className="h-full pt-10">
          <JitsiRoom roomName={activeRoom.jitsiRoomId} displayName={activeRoom.hostName || 'Host'} onMeetingEnd={() => handleEnd(activeRoom._id)} settings={activeRoom.settings || {}} />
        </div>
      </div>
    );
  }

  const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10";
  const selectCls = "w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none bg-white";

  return (
    <div className="space-y-3">
      {showCreate && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => { setShowCreate(false); setEditSession(null); }}>
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-bold text-slate-900">{editSession ? 'Edit Session' : 'Schedule New Session'}</h3>
              <button onClick={() => { setShowCreate(false); setEditSession(null); }} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
              <input className={inputCls} placeholder="Session title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <textarea rows="2" className={cn(inputCls, "resize-none")} placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-slate-500 uppercase">Date & Time *</label>
                  <input type="datetime-local" className={inputCls} value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold text-slate-500 uppercase">Duration (min)</label>
                  <input type="number" min="5" max="480" className={inputCls} value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 60 })} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-slate-500 uppercase">Max Participants</label>
                <input type="number" min="2" max="500" className={inputCls} value={form.settings.maxParticipants} onChange={(e) => setForm({ ...form, settings: { ...form.settings, maxParticipants: parseInt(e.target.value) || 100 } })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-[11px] text-slate-600">
                  <input type="checkbox" className="rounded" checked={form.settings.enableChat} onChange={(e) => setForm({ ...form, settings: { ...form.settings, enableChat: e.target.checked } })} /> Chat
                </label>
                <label className="flex items-center gap-2 text-[11px] text-slate-600">
                  <input type="checkbox" className="rounded" checked={form.settings.enableScreenShare} onChange={(e) => setForm({ ...form, settings: { ...form.settings, enableScreenShare: e.target.checked } })} /> Screen Share
                </label>
                <label className="flex items-center gap-2 text-[11px] text-slate-600">
                  <input type="checkbox" className="rounded" checked={form.settings.enableRecording} onChange={(e) => setForm({ ...form, settings: { ...form.settings, enableRecording: e.target.checked } })} /> Recording
                </label>
                <label className="flex items-center gap-2 text-[11px] text-slate-600">
                  <input type="checkbox" className="rounded" checked={form.settings.muteParticipants} onChange={(e) => setForm({ ...form, settings: { ...form.settings, muteParticipants: e.target.checked } })} /> Mute Joiners
                </label>
              </div>
              <button type="submit" className="w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50" disabled={submitting}>
                {submitting ? 'Saving...' : editSession ? 'Update Session' : 'Create Session'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><FaVideo className="h-3.5 w-3.5 text-red-500" /> Live Sessions ({sessions.length})</h3>
        <button onClick={() => { setForm({ title: '', description: '', scheduledAt: '', duration: 60, settings: { enableChat: true, enableScreenShare: true, enableRecording: false, muteParticipants: false, maxParticipants: 100 } }); setEditSession(null); setShowCreate(true); }} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800"><FaPlus /> New Session</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10"><FaSpinner className="h-5 w-5 animate-spin text-slate-300" /></div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center">
          <FaVideo className="mb-2 h-8 w-8 text-slate-200" />
          <p className="text-xs text-slate-400">No live sessions yet.</p>
          <p className="text-[10px] text-slate-300 mt-1">Schedule your first session to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s._id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="text-xs font-semibold text-slate-800 truncate">{s.title}</strong>
                    <span className={cn("rounded-full px-2 py-px text-[9px] font-semibold capitalize", STATUSES[s.status] || STATUSES.scheduled)}>{s.status}</span>
                  </div>
                  {s.description && <p className="text-[11px] text-slate-500 truncate">{s.description}</p>}
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1"><FaCalendarAlt className="text-[8px]" /> {new Date(s.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><FaClock className="text-[8px]" /> {new Date(s.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="flex items-center gap-1"><FaClock className="text-[8px]" /> {s.duration}min</span>
                    <span className="flex items-center gap-1"><FaUsers className="text-[8px]" /> {s.participants?.length || 0} joined</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                  {s.status === 'scheduled' && (
                    <button onClick={() => handleStart(s._id)} className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-emerald-600"><FaPlay className="text-[8px]" /> Start</button>
                  )}
                  {s.status === 'live' && (
                    <button onClick={() => joinAsHost(s)} className="flex items-center gap-1 rounded-lg bg-blue-500 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-blue-600 animate-pulse"><FaEye className="text-[8px]" /> Join</button>
                  )}
                  {s.status === 'live' && (
                    <button onClick={() => handleEnd(s._id)} className="flex items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-red-600"><FaStop className="text-[8px]" /> End</button>
                  )}
                  {s.status === 'scheduled' && (
                    <button onClick={() => openEdit(s)} className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"><FaEdit className="text-[10px]" /></button>
                  )}
                  <button onClick={() => handleDelete(s._id)} className="h-6 w-6 flex items-center justify-center rounded-md text-red-400 hover:bg-red-50"><FaTrash className="text-[10px]" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
