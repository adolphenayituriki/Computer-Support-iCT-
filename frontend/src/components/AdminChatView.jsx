import { useState, useEffect, useRef } from 'react';
import { useToast } from '../ToastContext';
import { FaComments, FaPlus, FaPaperPlane, FaTicketAlt, FaLightbulb, FaTimes } from 'react-icons/fa';
import { cn } from '../lib/utils';
import API_BASE from '../api';

const token = () => localStorage.getItem('cshub_token');

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

function typeMeta(type) {
  if (type === 'direct') return { label: 'Chat', Icon: FaComments };
  if (type === 'suggestion') return { label: 'Suggestion', Icon: FaLightbulb };
  return { label: 'Ticket', Icon: FaTicketAlt };
}

export default function AdminChatView() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const msgEndRef = useRef(null);

  const fetchAll = async () => {
    setLoading(true);
    const [direct, suggestions, tickets] = await Promise.all([
      api('/api/admin/conversations'),
      api('/api/admin/suggestions'),
      api('/api/admin/tickets'),
    ]);

    const all = [];

    if (!direct.error) {
      for (const c of direct) {
        all.push({
          _id: c._id,
          type: 'direct',
          userId: c.userId,
          userName: c.userName,
          userEmail: c.userEmail,
          title: 'Direct Message',
          status: null,
          messages: c.messages || [],
          lastMsg: c.messages?.length > 0 ? c.messages[c.messages.length - 1] : null,
          lastActivity: c.lastActivity || c.createdAt,
        });
      }
    }

    if (!suggestions.error) {
      for (const s of suggestions) {
        if (s.messages && s.messages.length > 0) {
          all.push({
            _id: s._id,
            type: 'suggestion',
            userId: s.userId,
            userName: s.userName,
            userEmail: '',
            title: s.title,
            status: s.status,
            messages: s.messages || [],
            lastMsg: s.messages[s.messages.length - 1],
            lastActivity: s.messages[s.messages.length - 1]?.createdAt || s.createdAt,
          });
        }
      }
    }

    if (!tickets.error) {
      for (const t of tickets) {
        if (t.messages && t.messages.length > 0) {
          all.push({
            _id: t._id,
            type: 'ticket',
            userId: t.userId,
            userName: t.userName,
            userEmail: '',
            title: t.title,
            status: t.status,
            messages: t.messages || [],
            lastMsg: t.messages[t.messages.length - 1],
            lastActivity: t.messages[t.messages.length - 1]?.createdAt || t.createdAt,
          });
        }
      }
    }

    all.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    setItems(all);
    setLoading(false);

    if (all.length > 0 && !activeId) {
      setActiveId(all[0]._id);
      setActiveType(all[0].type);
      setActiveConv(all[0]);
    }
  };

  useEffect(() => {
    fetchAll();
    const h = (e) => {
      setActiveId(e.detail.id);
      setActiveType(e.detail.type || 'direct');
      fetchAll();
    };
    window.addEventListener('opencode-select-conversation', h);
    return () => window.removeEventListener('opencode-select-conversation', h);
  }, []);

  useEffect(() => {
    if (activeId && activeType) {
      const found = items.find((i) => i._id === activeId && i.type === activeType);
      if (found) setActiveConv(found);
    } else {
      setActiveConv(null);
    }
  }, [activeId, activeType, items]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const handleSend = async () => {
    if (!text.trim() || !activeId || !activeType) return;
    setSending(true);

    let endpoint = '';
    if (activeType === 'direct') endpoint = `/api/admin/conversations/${activeId}/messages`;
    else if (activeType === 'suggestion') endpoint = `/api/admin/suggestions/${activeId}/messages`;
    else if (activeType === 'ticket') endpoint = `/api/admin/tickets/${activeId}/messages`;

    const res = await api(endpoint, { method: 'POST', body: JSON.stringify({ text }) });
    setSending(false);
    if (res.error) return showToast(res.error, 'error');
    setText('');
    fetchAll();
  };

  const handleCreate = async () => {
    if (!selectedUserId) return;
    setCreating(true);
    const res = await api('/api/admin/conversations', { method: 'POST', body: JSON.stringify({ userId: selectedUserId }) });
    setCreating(false);
    if (res.error) return showToast(res.error, 'error');
    const conv = {
      _id: res._id,
      type: 'direct',
      userId: res.userId,
      userName: res.userName,
      userEmail: res.userEmail,
      title: 'Direct Message',
      status: null,
      messages: res.messages || [],
      lastMsg: null,
      lastActivity: res.lastActivity || res.createdAt,
    };
    setItems((prev) => [conv, ...prev]);
    setActiveId(conv._id);
    setActiveType('direct');
    setActiveConv(conv);
    setShowNew(false);
    setSelectedUserId('');
  };

  const openNew = async () => {
    setShowNew(true);
    setLoadingUsers(true);
    const data = await api('/api/admin/users');
    setLoadingUsers(false);
    if (data.error) {
      showToast(data.error, 'error');
      setUsers([]);
    } else {
      setUsers(data);
    }
  };

  const handleSelect = (item) => {
    setActiveId(item._id);
    setActiveType(item.type);
    setActiveConv(item);
  };

  const activeMeta = activeConv ? typeMeta(activeConv.type) : null;

  return (
    <div className="space-y-3 animate-in fade-in">
      {showNew && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setShowNew(false)}>
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Start Direct Conversation</h3>
              <button onClick={() => setShowNew(false)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200"><FaTimes /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} disabled={loadingUsers} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none bg-white">
                <option value="">{loadingUsers ? 'Loading users...' : 'Select a user...'}</option>
                {users.map((u) => <option key={u.id || u._id} value={u.id || u._id}>{u.name} ({u.email})</option>)}
              </select>
              <div className="flex items-center justify-end gap-2">
                <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50" onClick={() => setShowNew(false)}>Cancel</button>
                <button className="rounded-lg bg-cshub-blue px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3f7ee8] disabled:opacity-50" disabled={!selectedUserId || creating} onClick={handleCreate}>
                  {creating ? 'Creating...' : 'Start'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-180px)] min-h-[420px] overflow-hidden rounded-xl border border-slate-200 bg-white">
        {/* Conversation list */}
        <div className="flex w-full max-w-[320px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/60">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><FaComments className="h-3.5 w-3.5 text-slate-400" /> Conversations</h3>
            <button onClick={openNew} className="flex items-center gap-1 rounded-lg bg-cshub-blue px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-[#3f7ee8]"><FaPlus className="text-[9px]" /> New</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-10"><div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" /></div>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-400">
                No conversations yet. Messages from suggestions and tickets will appear here automatically.
              </p>
            ) : (
              <div className="space-y-1">
                {items.map((item) => {
                  const { label, Icon } = typeMeta(item.type);
                  const isActive = activeId === item._id && activeType === item.type;
                  return (
                    <button
                      key={`${item.type}-${item._id}`}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors',
                        isActive ? 'bg-white shadow-sm border border-slate-200' : 'hover:bg-white',
                      )}
                    >
                      <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', isActive ? 'bg-cshub-blue text-white' : 'bg-slate-200 text-slate-500')}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <strong className={cn('truncate text-xs font-semibold', isActive ? 'text-slate-900' : 'text-slate-700')}>{item.userName}</strong>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">{label}</span>
                          {item.status && <span className="text-[9px] text-slate-400">·</span>}
                          {item.status && <span className="text-[9px] font-medium text-slate-500">{item.status}</span>}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.lastMsg ? item.lastMsg.text : item.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat pane */}
        <div className="flex min-w-0 flex-1 flex-col">
          {!activeConv ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-300"><FaComments className="h-5 w-5" /></div>
              <p className="text-xs text-slate-400">{loading ? 'Loading...' : 'Select a conversation to start chatting'}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 border-b border-slate-200 bg-white px-4 py-3">
                {activeMeta && <activeMeta.Icon className="h-4 w-4 text-slate-400" />}
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold text-slate-900">{activeConv.userName}</h4>
                  <p className="truncate text-[10px] text-slate-400">
                    {activeConv.title}
                    {activeConv.status && <> · {activeConv.status}</>}
                  </p>
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto bg-slate-50/40 p-4">
                {activeConv.messages.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">No messages yet. Send the first message.</p>
                ) : (
                  activeConv.messages.map((m, i) => (
                    <div key={i} className={cn('flex flex-col', m.sender === 'admin' ? 'items-end' : 'items-start')}>
                      <div className={cn(
                        'max-w-[75%] rounded-xl px-3 py-2 text-xs',
                        m.sender === 'admin' ? 'bg-cshub-blue text-slate-100 rounded-br-sm' : 'bg-white border border-slate-200 rounded-bl-sm',
                      )}>
                        <div className={cn('mb-0.5 flex items-center justify-between gap-3', m.sender === 'admin' ? 'text-slate-300' : 'text-slate-400')}>
                          <strong className="text-[10px] font-semibold">{m.senderName}</strong>
                          <span className="text-[9px]">{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                        <p className={cn('leading-relaxed', m.sender === 'admin' ? 'text-slate-200' : 'text-slate-600')}>{m.text}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={msgEndRef} />
              </div>

              <div className="flex items-center gap-2 border-t border-slate-200 bg-white px-4 py-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400 focus:bg-white"
                />
                <button disabled={sending || !text.trim()} onClick={handleSend} className="flex h-9 w-9 items-center justify-center rounded-lg bg-cshub-blue text-white transition-colors hover:bg-[#3f7ee8] disabled:opacity-40">
                  {sending ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <FaPaperPlane className="h-3.5 w-3.5" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}