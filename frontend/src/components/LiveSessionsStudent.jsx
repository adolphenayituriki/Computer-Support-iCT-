import { useState, useEffect } from 'react';
import { FaVideo, FaCalendarAlt, FaClock, FaUsers, FaSignOutAlt, FaSpinner, FaSearch, FaCopy, FaCheck, FaLink } from 'react-icons/fa';
import { cn } from '../lib/utils';
import API_BASE from '../api';
import { useAuth } from '../AuthContext';
import JitsiRoom from './JitsiRoom';

const api = async (url, opts = {}) => {
  const jwt = localStorage.getItem('cshub_token');
  const headers = { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}), ...opts.headers };
  try { const res = await fetch(`${API_BASE}${url}`, { ...opts, headers }); return await res.json(); } catch { return { error: 'Network error' }; }
};

export default function LiveSessionsStudent() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState(null);
  const [search, setSearch] = useState('');
  const [joiningId, setJoiningId] = useState(null);
  const [copied, setCopied] = useState(null);

  const fetchData = () => {
    setLoading(true);
    api('/api/live-sessions').then((d) => { setSessions(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleJoin = async (session) => {
    setJoiningId(session._id);
    const res = await api(`/api/live-sessions/${session._id}/join`, { method: 'POST' });
    setJoiningId(null);
    if (res.error) return alert(res.error);
    setActiveRoom(session);
  };

  const handleLeave = () => {
    if (activeRoom) {
      api(`/api/live-sessions/${activeRoom._id}/leave`, { method: 'POST' }).catch(() => {});
    }
    setActiveRoom(null);
    fetchData();
  };

  const copyLink = (session) => {
    const url = `https://meet.jit.si/${session.jitsiRoomId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(session._id);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {});
  };

  const filtered = sessions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.title?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.hostName?.toLowerCase().includes(q);
  });

  const liveSessions = filtered.filter((s) => s.status === 'live');
  const upcomingSessions = filtered.filter((s) => s.status === 'scheduled');
  const endedSessions = filtered.filter((s) => s.status === 'ended');

  if (activeRoom) {
    return (
      <div className="fixed inset-0 z-[999] bg-slate-950">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-slate-900/95 px-4 py-2 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center gap-3">
            <FaVideo className="h-4 w-4 text-emerald-400 animate-pulse" />
            <div>
              <h3 className="text-xs font-bold text-white">{activeRoom.title}</h3>
              <p className="text-[10px] text-slate-400">Hosted by {activeRoom.hostName}</p>
            </div>
          </div>
          <button onClick={handleLeave} className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600">
            <FaSignOutAlt className="text-[10px]" /> Leave
          </button>
        </div>
        <div className="h-full pt-10">
          <JitsiRoom
            roomName={activeRoom.jitsiRoomId}
            displayName={user?.name || 'Student'}
            email={user?.email}
            onMeetingEnd={handleLeave}
            settings={activeRoom.settings || {}}
          />
        </div>
      </div>
    );
  }

  const renderSessionCard = (s) => (
    <div key={s._id} className="rounded-xl border border-slate-200 bg-white p-3 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <strong className="text-xs font-semibold text-slate-800 truncate">{s.title}</strong>
            {s.status === 'live' && <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-px text-[9px] font-bold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE</span>}
            {s.status === 'scheduled' && <span className="rounded-full bg-blue-100 px-2 py-px text-[9px] font-semibold text-blue-600">Upcoming</span>}
            {s.status === 'ended' && <span className="rounded-full bg-slate-100 px-2 py-px text-[9px] font-semibold text-slate-500">Ended</span>}
          </div>
          {s.description && <p className="text-[11px] text-slate-500 truncate">{s.description}</p>}
          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 flex-wrap">
            <span className="flex items-center gap-1"><FaCalendarAlt className="text-[8px]" /> {new Date(s.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><FaClock className="text-[8px]" /> {new Date(s.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="flex items-center gap-1"><FaClock className="text-[8px]" /> {s.duration}min</span>
            <span className="flex items-center gap-1"><FaUsers className="text-[8px]" /> {s.participants?.length || 0}</span>
          </div>
          <span className="text-[10px] text-slate-300 mt-0.5 block">by {s.hostName}</span>
          {s.status === 'live' && s.jitsiRoomId && (
            <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1 border border-emerald-100">
              <FaLink className="h-2.5 w-2.5 text-emerald-400 shrink-0" />
              <span className="text-[9px] text-emerald-600 font-mono truncate">https://meet.jit.si/{s.jitsiRoomId}</span>
            </div>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          {(s.status === 'live' || s.status === 'scheduled') && (
            <button
              onClick={() => copyLink(s)}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold transition-colors",
                copied === s._id
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              {copied === s._id ? <><FaCheck className="text-[8px]" /> Copied</> : <><FaCopy className="text-[8px]" /> Copy Link</>}
            </button>
          )}
          {(s.status === 'live' || s.status === 'scheduled') ? (
            <button
              onClick={() => s.status === 'live' ? handleJoin(s) : null}
              disabled={joiningId === s._id || s.status === 'scheduled'}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors",
                s.status === 'live'
                  ? "bg-emerald-500 text-white hover:bg-emerald-600 animate-pulse"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              {joiningId === s._id ? <FaSpinner className="animate-spin text-[10px]" /> : <FaVideo className="text-[10px]" />}
              {s.status === 'live' ? 'Join Now' : 'Not Started'}
            </button>
          ) : (
            <span className="text-[10px] text-slate-300">Session ended</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><FaVideo className="h-3.5 w-3.5 text-red-500" /> Live Sessions</h3>
        <div className="relative">
          <FaSearch className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-300" />
          <input className="rounded-lg border border-slate-200 bg-white py-1.5 pl-7 pr-3 text-[11px] text-slate-700 outline-none focus:border-slate-900 w-48" placeholder="Search sessions..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10"><FaSpinner className="h-5 w-5 animate-spin text-slate-300" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center">
          <FaVideo className="mb-2 h-8 w-8 text-slate-200" />
          <p className="text-xs text-slate-400">{search ? 'No sessions match your search.' : 'No live sessions available right now.'}</p>
          {!search && <p className="text-[10px] text-slate-300 mt-1">Check back later for upcoming sessions.</p>}
        </div>
      ) : (
        <>
          {liveSessions.length > 0 && (
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase tracking-wider"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Now ({liveSessions.length})</h4>
              <div className="space-y-2">{liveSessions.map(renderSessionCard)}</div>
            </div>
          )}
          {upcomingSessions.length > 0 && (
            <div>
              <h4 className="mb-2 text-[11px] font-bold text-blue-600 uppercase tracking-wider">Upcoming ({upcomingSessions.length})</h4>
              <div className="space-y-2">{upcomingSessions.map(renderSessionCard)}</div>
            </div>
          )}
          {endedSessions.length > 0 && (
            <div>
              <h4 className="mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Past Sessions ({endedSessions.length})</h4>
              <div className="space-y-2">{endedSessions.map(renderSessionCard)}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
