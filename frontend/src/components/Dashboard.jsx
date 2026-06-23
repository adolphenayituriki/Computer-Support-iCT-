import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaTicketAlt, FaClock, FaCheckCircle, FaExclamationCircle, FaTrash, FaEdit, FaSave, FaTimes, FaEye, FaEyeSlash, FaUndo, FaLightbulb, FaUser, FaKey } from 'react-icons/fa';

const token = () => localStorage.getItem('cshub_token');

function TicketsView({ tickets, setTickets }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: '', description: '', category: 'general' });
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filter, setFilter] = useState('all');
  const [viewTicket, setViewTicket] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/tickets', {
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
    }
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
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
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return;
    try {
      const res = await fetch(`/api/tickets/${id}`, {
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
      await fetch(`/api/tickets/${id}`, {
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

  if (viewTicket) {
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
            <button type="submit" className="btn">Submit Request</button>
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
                <div key={t.id} className="ticket-item">
                  <div className="ticket-top">
                    <span className={`ticket-status status-${t.status}`}>
                      {t.status === 'in-progress' ? 'IN PROGRESS' : t.status.toUpperCase()}
                    </span>
                    <span className="ticket-category">{t.category}</span>
                    <div className="ticket-actions">
                      <button className="ticket-action-btn" title="View" onClick={() => setViewTicket(t)}><FaEye /></button>
                      <button className="ticket-action-btn" title="Edit" onClick={() => startEdit(t)}><FaEdit /></button>
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
                        <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }} onClick={() => handleUpdate(t.id)}><FaSave /> Save</button>
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

  useEffect(() => {
    fetch('/api/suggestions', { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => r.json())
      .then(setSuggestions)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('');
    try {
      const res = await fetch('/api/suggestions', {
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
    }
  };

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
          <button type="submit" className="btn">Submit Suggestion</button>
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
              <div key={s.id} className="ticket-item" style={{ borderLeftColor: '#60a5fa' }}>
                <h4 style={{ color: '#1e1b4b', fontSize: '0.95rem', marginBottom: '0.25rem' }}>{s.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.5' }}>{s.description}</p>
                <span className="ticket-date">
                  {new Date(s.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileView() {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });
  const [showPwd, setShowPwd] = useState({ current: false, newPwd: false, confirm: false });

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });
    try {
      await updateProfile(profile.name, profile.email);
      showToast('Profile updated successfully!');
    } catch (err) {
      setProfileMsg({ text: err.message, type: 'error' });
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ text: '', type: '' });
    if (pwd.newPwd !== pwd.confirm) {
      return setPwdMsg({ text: 'New passwords do not match.', type: 'error' });
    }
    try {
      await changePassword(pwd.current, pwd.newPwd);
      setPwd({ current: '', newPwd: '', confirm: '' });
      showToast('Password changed successfully!');
    } catch (err) {
      setPwdMsg({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="profile-grid">
      <div className="profile-card">
        <div className="profile-card-header">
          <FaUser className="profile-card-icon" />
          <h3>Edit Profile</h3>
        </div>
        <form onSubmit={handleProfile} className="profile-form">
          <div className="profile-field">
            <label>Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>
          <div className="profile-field">
            <label>Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
          </div>
          {profileMsg.text && (
            <p className={`profile-msg ${profileMsg.type === 'error' ? 'profile-msg-error' : 'profile-msg-success'}`}>{profileMsg.text}</p>
          )}
          <button type="submit" className="btn btn-sm">Save Changes</button>
        </form>
      </div>

      <div className="profile-card">
        <div className="profile-card-header">
          <FaKey className="profile-card-icon" />
          <h3>Change Password</h3>
        </div>
        <form onSubmit={handlePassword} className="profile-form">
          <div className="profile-field">
            <label>Current password</label>
            <div className="dash-pwd-wrapper">
              <input
                type={showPwd.current ? 'text' : 'password'}
                value={pwd.current}
                onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                required
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd({ ...showPwd, current: !showPwd.current })}>
                {showPwd.current ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="profile-field">
            <label>New password (min 6 chars)</label>
            <div className="dash-pwd-wrapper">
              <input
                type={showPwd.newPwd ? 'text' : 'password'}
                value={pwd.newPwd}
                onChange={(e) => setPwd({ ...pwd, newPwd: e.target.value })}
                required
                minLength={6}
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd({ ...showPwd, newPwd: !showPwd.newPwd })}>
                {showPwd.newPwd ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="profile-field">
            <label>Confirm new password</label>
            <div className="dash-pwd-wrapper">
              <input
                type={showPwd.confirm ? 'text' : 'password'}
                value={pwd.confirm}
                onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                required
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })}>
                {showPwd.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          {pwdMsg.text && (
            <p className={`profile-msg ${pwdMsg.type === 'error' ? 'profile-msg-error' : 'profile-msg-success'}`}>{pwdMsg.text}</p>
          )}
          <button type="submit" className="btn btn-sm">Update Password</button>
        </form>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState('tickets');

  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="dashboard">
      <div className="dash-welcome">
        <div className="dash-avatar">{initials}</div>
        <div>
          <h2>Welcome, {user?.name}</h2>
          <p>Submit and manage your support requests, share suggestions, and update your profile.</p>
        </div>
      </div>

      <div className="dash-tabs">
        <button className={`dash-tab${tab === 'tickets' ? ' active' : ''}`} onClick={() => setTab('tickets')}>
          <FaTicketAlt /> Support Tickets
        </button>
        <button className={`dash-tab${tab === 'suggestions' ? ' active' : ''}`} onClick={() => setTab('suggestions')}>
          <FaLightbulb /> Suggestions
        </button>
        <button className={`dash-tab${tab === 'profile' ? ' active' : ''}`} onClick={() => setTab('profile')}>
          <FaUser /> Profile & Security
        </button>
      </div>

      {tab === 'tickets' ? (
        <TicketsView tickets={tickets} setTickets={setTickets} />
      ) : tab === 'suggestions' ? (
        <SuggestionsView />
      ) : (
        <ProfileView />
      )}
    </div>
  );
}
