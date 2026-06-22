import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaTicketAlt, FaUsers, FaLightbulb, FaEnvelope, FaUserTie, FaTrash, FaCheckCircle, FaUndo, FaTimes, FaEye, FaSave, FaEdit } from 'react-icons/fa';

const token = () => localStorage.getItem('cshub_token');

function AdminTickets() {
  const { showToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewTicket, setViewTicket] = useState(null);

  const fetchData = () => {
    fetch('/api/admin/tickets', { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json()).then(setTickets).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdate = async (id) => {
    await fetch(`/api/admin/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(editForm),
    });
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...editForm } : t)));
    setEditingId(null);
    setEditForm({});
    showToast('Ticket updated.');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    await fetch(`/api/admin/tickets/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    setTickets((prev) => prev.filter((t) => t.id !== id));
    if (viewTicket?.id === id) setViewTicket(null);
    showToast('Ticket deleted.');
  };

  const handleStatus = async (id, status) => {
    await fetch(`/api/admin/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    if (viewTicket?.id === id) setViewTicket((prev) => ({ ...prev, status }));
    showToast(status === 'closed' ? 'Ticket resolved.' : 'Ticket reopened.');
  };

  const filtered = tickets.filter((t) => {
    if (filter === 'open') return t.status === 'open';
    if (filter === 'closed') return t.status === 'closed';
    return true;
  });

  if (viewTicket) {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <button className="btn btn-sm btn-outline" onClick={() => setViewTicket(null)}><FaTimes /> Back</button>
          <h3 style={{ margin: 0 }}>{viewTicket.title}</h3>
          <span className={`ticket-status status-${viewTicket.status}`}>{viewTicket.status === 'open' ? 'OPEN' : 'RESOLVED'}</span>
          <span className="ticket-category">{viewTicket.category}</span>
        </div>
        <div className="dash-card">
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.3rem' }}>By <strong>{viewTicket.userName}</strong></p>
          <p style={{ lineHeight: '1.7', color: '#334155', marginBottom: '1rem' }}>{viewTicket.description}</p>
          <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
            {new Date(viewTicket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {viewTicket.status === 'open' && (
              <button className="btn btn-sm" onClick={() => handleStatus(viewTicket.id, 'closed')}><FaCheckCircle /> Mark Resolved</button>
            )}
            {viewTicket.status === 'closed' && (
              <button className="btn btn-sm btn-outline" onClick={() => handleStatus(viewTicket.id, 'open')}><FaUndo /> Reopen</button>
            )}
            <button className="btn btn-sm btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => { handleDelete(viewTicket.id); }}><FaTrash /> Delete</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0 }}>All Tickets ({tickets.length})</h3>
        <div className="dash-filters">
          {['all', 'open', 'closed'].map((f) => (
            <button key={f} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><FaTicketAlt size={36} style={{ color: '#d1d5db' }} /><p>No tickets found.</p></div>
      ) : (
        <div className="ticket-list">
          {filtered.map((t) => (
            <div key={t.id} className="ticket-item admin-ticket-item">
              <div className="ticket-top">
                <span className={`ticket-status status-${t.status}`}>{t.status === 'open' ? 'OPEN' : 'RESOLVED'}</span>
                <span className="ticket-category">{t.category}</span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.3rem' }}>{t.userName}</span>
                <div className="ticket-actions">
                  <button className="ticket-action-btn" title="View" onClick={() => setViewTicket(t)}><FaEye /></button>
                  <button className="ticket-action-btn" title="Edit" onClick={() => { setEditingId(t.id); setEditForm({ title: t.title, description: t.description, category: t.category }); }}><FaEdit /></button>
                  <button className="ticket-action-btn" title="Delete" onClick={() => handleDelete(t.id)} style={{ color: '#ef4444' }}><FaTrash /></button>
                </div>
              </div>
              {editingId === t.id ? (
                <div className="ticket-edit-form">
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
                    <button className="btn btn-sm" onClick={() => handleUpdate(t.id)}><FaSave /> Save</button>
                    <button className="btn btn-sm btn-outline" onClick={() => setEditingId(null)}><FaTimes /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 style={{ fontSize: '0.9rem' }}>{t.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="ticket-date">{new Date(t.createdAt).toLocaleDateString()}</span>
                    {t.status === 'open' && (
                      <button className="btn-link" style={{ fontSize: '0.78rem', color: '#16a34a' }} onClick={() => handleStatus(t.id, 'closed')}><FaCheckCircle /> Resolve</button>
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

function AdminUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);

  const fetchData = () => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json()).then(setUsers).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? All their data will be lost.')) return;
    await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast('User deleted.');
  };

  return (
    <>
      <h3>Users ({users.length})</h3>
      {users.length === 0 ? (
        <div className="empty-state"><FaUsers size={36} style={{ color: '#d1d5db' }} /><p>No users.</p></div>
      ) : (
        <div className="admin-list">
          {users.map((u) => (
            <div key={u.id} className="admin-list-item">
              <div className="admin-list-main">
                <strong>{u.name}</strong>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>{u.email}</span>
                {u.isAdmin && <span className="admin-badge">Admin</span>}
              </div>
              <div className="admin-list-actions">
                {!u.isAdmin && (
                  <button className="ticket-action-btn" title="Delete" onClick={() => handleDelete(u.id)} style={{ color: '#ef4444' }}><FaTrash /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function AdminList({ title, icon, fetchUrl, emptyMsg }) {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch(fetchUrl, { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json()).then(setItems).catch(() => {});
  }, [fetchUrl]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    await fetch(`${fetchUrl}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token()}` },
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast('Deleted.');
  };

  return (
    <>
      <h3>{icon} {title} ({items.length})</h3>
      {items.length === 0 ? (
        <div className="empty-state">{icon}<p>{emptyMsg}</p></div>
      ) : (
        <div className="admin-list">
          {items.map((item) => (
            <div key={item.id} className="admin-list-item">
              <div className="admin-list-main">
                <strong>{item.name || item.userName || item.title}</strong>
                <span style={{ fontSize: '0.82rem', color: '#6b7280' }}>
                  {item.email || item.description?.slice(0, 80)}
                  {item.location ? ` — ${item.location}` : ''}
                  {item.education ? ` • ${item.education}` : ''}
                </span>
                {'createdAt' in item && (
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="admin-list-actions">
                <button className="ticket-action-btn" title="Delete" onClick={() => handleDelete(item.id)} style={{ color: '#ef4444' }}><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('tickets');

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'A';

  return (
    <div className="dashboard admin-dashboard">
      <div className="dash-welcome">
        <div className="dash-avatar">{initials}</div>
        <div>
          <h2>Admin Dashboard</h2>
          <p>Manage everything — tickets, users, suggestions, contacts, and applications.</p>
        </div>
      </div>

      <div className="dash-tabs">
        <button className={`dash-tab${tab === 'tickets' ? ' active' : ''}`} onClick={() => setTab('tickets')}><FaTicketAlt /> Tickets</button>
        <button className={`dash-tab${tab === 'users' ? ' active' : ''}`} onClick={() => setTab('users')}><FaUsers /> Users</button>
        <button className={`dash-tab${tab === 'suggestions' ? ' active' : ''}`} onClick={() => setTab('suggestions')}><FaLightbulb /> Suggestions</button>
        <button className={`dash-tab${tab === 'contacts' ? ' active' : ''}`} onClick={() => setTab('contacts')}><FaEnvelope /> Contacts</button>
        <button className={`dash-tab${tab === 'teams' ? ' active' : ''}`} onClick={() => setTab('teams')}><FaUserTie /> Applications</button>
      </div>

      <div className="admin-panel">
        {tab === 'tickets' && <AdminTickets />}
        {tab === 'users' && <AdminUsers />}
        {tab === 'suggestions' && <AdminList title="Suggestions" icon={<FaLightbulb style={{ color: '#FFCE08' }} />} fetchUrl="/api/admin/suggestions" emptyMsg="No suggestions." />}
        {tab === 'contacts' && <AdminList title="Contact Messages" icon={<FaEnvelope style={{ color: '#60a5fa' }} />} fetchUrl="/api/admin/contacts" emptyMsg="No messages." />}
        {tab === 'teams' && <AdminList title="Team Applications" icon={<FaUserTie style={{ color: '#16a34a' }} />} fetchUrl="/api/admin/team-apps" emptyMsg="No applications." />}
      </div>
    </div>
  );
}
