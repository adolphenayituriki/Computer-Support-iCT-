import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLang } from '../LanguageContext';
import API_BASE, { AI_API_BASE } from '../api';
import AITutor from './AITutor';
import AIQuiz from './AIQuiz';
import AITopicWorkspace from './AITopicWorkspace';
import AIResources from './AIResources';
import {
  FaRobot, FaImage, FaVideo, FaHeadphones, FaFlask, FaQuestionCircle,
  FaPuzzlePiece, FaChartLine, FaRoute, FaLanguage, FaMicroscope,
  FaChalkboardTeacher, FaBrain, FaTachometerAlt, FaCog, FaSignOutAlt,
  FaHome, FaBookOpen, FaGraduationCap, FaStar, FaCalendarAlt,
  FaClock, FaCheckCircle, FaArrowRight, FaUser, FaBell,
  FaLaptop, FaGlobe, FaLightbulb, FaRocket, FaComments, FaFire,
  FaBars, FaTimes, FaSearch, FaTools, FaEnvelope, FaEnvelopeOpen,
  FaCheck, FaTrash, FaEdit, FaKey
} from 'react-icons/fa';

const FEATURES = [
  { icon: <FaRobot />, key: 1, color: '#6B7280', action: 'tutor' },
  { icon: <FaImage />, key: 2, color: '#6B7280', action: 'topic' },
  { icon: <FaVideo />, key: 3, color: '#6B7280', action: 'topic' },
  { icon: <FaHeadphones />, key: 4, color: '#6B7280', action: 'topic' },
  { icon: <FaFlask />, key: 5, color: '#6B7280', action: 'topic' },
  { icon: <FaQuestionCircle />, key: 6, color: '#6B7280', action: 'quiz' },
  { icon: <FaPuzzlePiece />, key: 7, color: '#6B7280', action: 'topic' },
  { icon: <FaBrain />, key: 8, color: '#6B7280', action: 'topic' },
  { icon: <FaChartLine />, key: 9, color: '#6B7280', action: 'progress' },
  { icon: <FaRoute />, key: 10, color: '#6B7280', action: null },
  { icon: <FaLanguage />, key: 11, color: '#6B7280', action: null },
  { icon: <FaMicroscope />, key: 12, color: '#6B7280', action: null },
  { icon: <FaChalkboardTeacher />, key: 13, color: '#6B7280', action: null },
];

const SIDEBAR = [
  { key: 'overview', icon: <FaTachometerAlt />, labelEn: 'Overview', labelRw: 'Igice' },
  { key: 'topic', icon: <FaTools />, labelEn: 'AI Tools', labelRw: 'Ibikoresho bya AI' },
  { key: 'tutor', icon: <FaComments />, labelEn: 'AI Tutor', labelRw: 'Uwigisha wa AI' },
  { key: 'quiz', icon: <FaQuestionCircle />, labelEn: 'Quizzes', labelRw: 'Ibibazo' },
  { key: 'resources', icon: <FaBookOpen />, labelEn: 'Resources', labelRw: 'Inkwando' },
  { key: 'progress', icon: <FaChartLine />, labelEn: 'My Progress', labelRw: 'Ibikorwa byanje' },
  { key: 'profile', icon: <FaUser />, labelEn: 'Profile', labelRw: 'Umwirondoro' },
  { key: 'settings', icon: <FaCog />, labelEn: 'Settings', labelRw: 'Amategeko' },
];

export default function AILearningDashboard() {
  const { t } = useLang();
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [progressData, setProgressData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const token = () => localStorage.getItem('cshub_token');

  useEffect(() => {
    fetchProgress();
    fetchNotifications();
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/progress`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) setProgressData(await res.json());
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/notifications`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unread);
      }
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch(`${AI_API_BASE}/api/ai/notifications/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`${AI_API_BASE}/api/ai/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const openFeature = (action) => {
    if (action === 'tutor') setTab('tutor');
    else if (action === 'quiz') setTab('quiz');
    else if (action === 'progress') setTab('progress');
    else if (action === 'topic') setTab('topic');
    setSidebarOpen(false);
  };

  const handleNav = (key) => {
    setTab(key);
    setSidebarOpen(false);
    setShowNotifications(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setTab('topic');
      setSearchActive(false);
      setSearchQuery('');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg('');
    try {
      await updateProfile(profileForm);
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileMsg(err.message || 'Failed to update profile.');
    }
    setProfileSaving(false);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('New passwords do not match.');
      setPasswordSaving(false);
      return;
    }
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMsg('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg(err.message || 'Failed to change password.');
    }
    setPasswordSaving(false);
  };

  const stats = [
    { icon: <FaComments />, value: progressData?.recentSessions?.length || 0, label: 'AI Sessions', color: '#6B7280' },
    { icon: <FaQuestionCircle />, value: progressData?.summary?.totalQuizzes || 0, label: 'Quizzes Done', color: '#6B7280' },
    { icon: <FaChartLine />, value: `${progressData?.summary?.avgScore || 0}%`, label: 'Avg Score', color: '#6B7280' },
    { icon: <FaStar />, value: progressData?.profile?.totalPoints || 0, label: 'Points', color: '#6B7280' },
  ];

  const tabTitles = {
    overview: 'Overview', topic: 'AI Tools', tutor: 'AI Tutor', quiz: 'Quizzes',
    resources: 'Resources', progress: 'My Progress', profile: 'Profile', settings: 'Settings',
  };

  return (
    <div className="ai-dash">
      {sidebarOpen && <div className="ai-dash-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`ai-dash-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="ai-dash-sidebar-header">
          <div className="ai-dash-logo">
            <FaRobot size={28} />
            <span>AI Learning</span>
          </div>
          <button className="ai-dash-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>
        <nav className="ai-dash-nav">
          {SIDEBAR.map((item) => (
            <button
              key={item.key}
              className={`ai-dash-nav-item${tab === item.key ? ' active' : ''}`}
              onClick={() => handleNav(item.key)}
            >
              {item.icon}
              <span>{lang === 'rw' ? item.labelRw : item.labelEn}</span>
            </button>
          ))}
        </nav>
        <div className="ai-dash-sidebar-footer">
          <button className="ai-dash-nav-item" onClick={() => navigate('/')}>
            <FaHome /> <span>{t('nav.backHome')}</span>
          </button>
          <button className="ai-dash-nav-item" onClick={() => { logout(); navigate('/'); }}>
            <FaSignOutAlt /> <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      <main className="ai-dash-main">
        <header className="ai-dash-topbar">
          <button className="ai-dash-menu-btn" onClick={() => setSidebarOpen(true)}>
            <FaBars />
          </button>
          <div className="ai-dash-topbar-left">
            <h1>{tabTitles[tab]}</h1>
          </div>
          <form className="ai-dash-search" onSubmit={handleSearchSubmit} ref={searchRef}>
            <FaSearch className="ai-dash-search-icon" />
            <input
              type="text"
              placeholder="Search any topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchActive(true)}
              className="ai-dash-search-input"
            />
            {searchQuery && (
              <button type="button" className="ai-dash-search-clear" onClick={() => setSearchQuery('')}>
                <FaTimes />
              </button>
            )}
          </form>
          <div className="ai-dash-topbar-right" ref={notifRef}>
            <button
              className="ai-dash-topbar-btn ai-dash-notif-btn"
              title="Notifications"
              onClick={() => { setShowNotifications(!showNotifications); if (unreadCount > 0) markAllRead(); }}
            >
              <FaBell />
              {unreadCount > 0 && <span className="ai-dash-notif-badge">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="ai-dash-notif-dropdown">
                <div className="ai-dash-notif-header">
                  <h3>Notifications</h3>
                  {notifications.length > 0 && (
                    <button className="ai-dash-notif-mark-read" onClick={markAllRead}>
                      <FaCheck /> Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="ai-dash-notif-empty">No notifications yet</p>
                ) : (
                  <div className="ai-dash-notif-list">
                    {notifications.map((n) => (
                      <div key={n._id} className={`ai-dash-notif-item ${n.read ? '' : 'unread'}`}>
                        <div className="ai-dash-notif-icon">
                          {n.type === 'topic' ? <FaTools /> : n.type === 'quiz' ? <FaQuestionCircle /> : n.type === 'streak' ? <FaFire /> : <FaBell />}
                        </div>
                        <div className="ai-dash-notif-content">
                          <strong>{n.title}</strong>
                          <p>{n.message}</p>
                          <small>{new Date(n.createdAt).toLocaleString()}</small>
                        </div>
                        <button className="ai-dash-notif-delete" onClick={() => deleteNotification(n._id)}>
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button className="ai-dash-avatar-btn" onClick={() => handleNav('profile')}>
              <div className="ai-dash-avatar">{initials}</div>
            </button>
          </div>
        </header>

        <div className="ai-dash-content">
          {tab === 'overview' && (
            <>
              <div className="ai-dash-welcome">
                <div className="ai-dash-welcome-text">
                  <h2>Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h2>
                  <p>Your AI-powered learning journey continues. {progressData?.profile?.streak > 0 ? `You have a ${progressData.profile.streak}-day streak! Keep it up!` : 'Start learning to build your streak!'}</p>
                </div>
                <button className="btn" onClick={() => handleNav('topic')}>
                  <FaTools style={{ marginRight: '0.5rem' }} /> Explore AI Tools
                </button>
              </div>

              <div className="ai-dash-stats">
                {stats.map((s, i) => (
                  <div className="ai-dash-stat-card" key={i}>
                    <div className="ai-dash-stat-icon" style={{ color: s.color }}>{s.icon}</div>
                    <div className="ai-dash-stat-info">
                      <strong>{s.value}</strong>
                      <span>{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ai-dash-section">
                <h3><FaClock style={{ marginRight: '0.5rem' }} /> Quick Access</h3>
                <div className="ai-dash-quick-grid">
                  <button className="ai-dash-quick-card" onClick={() => handleNav('topic')}>
                    <div className="ai-dash-quick-icon" style={{ color: '#6B7280' }}><FaTools /></div>
                    <span>AI Tools</span>
                  </button>
                  <button className="ai-dash-quick-card" onClick={() => handleNav('tutor')}>
                    <div className="ai-dash-quick-icon" style={{ color: '#6B7280' }}><FaRobot /></div>
                    <span>AI Tutor</span>
                  </button>
                  <button className="ai-dash-quick-card" onClick={() => handleNav('quiz')}>
                    <div className="ai-dash-quick-icon" style={{ color: '#6B7280' }}><FaQuestionCircle /></div>
                    <span>Quiz Generator</span>
                  </button>
                  <button className="ai-dash-quick-card" onClick={() => handleNav('progress')}>
                    <div className="ai-dash-quick-icon" style={{ color: '#6B7280' }}><FaChartLine /></div>
                    <span>My Progress</span>
                  </button>
                  <button className="ai-dash-quick-card" onClick={() => handleNav('profile')}>
                    <div className="ai-dash-quick-icon" style={{ color: '#6B7280' }}><FaUser /></div>
                    <span>My Profile</span>
                  </button>
                  <button className="ai-dash-quick-card" onClick={() => handleNav('resources')}>
                    <div className="ai-dash-quick-icon" style={{ color: '#6B7280' }}><FaBookOpen /></div>
                    <span>Resources</span>
                  </button>
                  <button className="ai-dash-quick-card" onClick={() => handleNav('topic')}>
                    <div className="ai-dash-quick-icon" style={{ color: '#6B7280' }}><FaImage /></div>
                    <span>AI Image Gen</span>
                  </button>
                </div>
              </div>

              {progressData?.recentSessions?.length > 0 && (
                <div className="ai-dash-section">
                  <h3><FaLightbulb style={{ marginRight: '0.5rem' }} /> Recent Sessions</h3>
                  <div className="ai-dash-activity-list">
                    {progressData.recentSessions.map((s, i) => (
                      <div className="ai-dash-activity-item" key={i}>
                        <div className="ai-dash-activity-icon" style={{ color: '#6B7280' }}><FaComments /></div>
                        <div className="ai-dash-activity-info">
                          <span>{s.subject} — {s.messages} messages</span>
                          <small>{new Date(s.date).toLocaleDateString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'topic' && <AITopicWorkspace onBack={() => setTab('overview')} />}

          {tab === 'tutor' && <AITutor />}

          {tab === 'quiz' && <AIQuiz />}

          {tab === 'resources' && <AIResources onBack={() => setTab('overview')} />}

          {tab === 'features' && (
            <div className="ai-dash-features">
              <div className="ai-dash-section">
                <h2>All AI Tools</h2>
                <p className="ai-dash-features-sub">13 powerful AI-driven tools to transform how students learn</p>
                <div className="ai-dash-features-grid">
                  {FEATURES.map((f) => (
                    <div className="ai-dash-feature-card" key={f.key}>
                      <div className="ai-dash-feature-icon" style={{ color: f.color }}>{f.icon}</div>
                      <h3>{t(`aiLearning.feature${f.key}Title`)}</h3>
                      <p>{t(`aiLearning.feature${f.key}Desc`)}</p>
                      {f.action ? (
                        <button className="ai-dash-feature-btn" onClick={() => openFeature(f.action)}>
                          Open <FaArrowRight />
                        </button>
                      ) : (
                        <span className="ai-dash-feature-coming">Coming Soon</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'progress' && (
            <div className="ai-dash-progress">
              <div className="ai-dash-section">
                <h2>My Learning Progress</h2>
                <p>Track your learning journey across all AI tools and subjects.</p>
                {progressData && (
                  <>
                    <div className="ai-dash-stats" style={{ marginBottom: '1.5rem' }}>
                      <div className="ai-dash-stat-card">
                        <div className="ai-dash-stat-icon" style={{ color: '#6B7280' }}><FaStar /></div>
                        <div className="ai-dash-stat-info">
                          <strong>{progressData.profile.totalPoints}</strong>
                          <span>Total Points</span>
                        </div>
                      </div>
                      <div className="ai-dash-stat-card">
                        <div className="ai-dash-stat-icon" style={{ color: '#6B7280' }}><FaFire /></div>
                        <div className="ai-dash-stat-info">
                          <strong>{progressData.profile.streak}</strong>
                          <span>Day Streak</span>
                        </div>
                      </div>
                      <div className="ai-dash-stat-card">
                        <div className="ai-dash-stat-icon" style={{ color: '#6B7280' }}><FaQuestionCircle /></div>
                        <div className="ai-dash-stat-info">
                          <strong>{progressData.summary.totalQuizzes}</strong>
                          <span>Quizzes</span>
                        </div>
                      </div>
                      <div className="ai-dash-stat-card">
                        <div className="ai-dash-stat-icon" style={{ color: '#6B7280' }}><FaClock /></div>
                        <div className="ai-dash-stat-info">
                          <strong>{progressData.summary.totalStudyMinutes}m</strong>
                          <span>Study Time</span>
                        </div>
                      </div>
                    </div>
                    {progressData.subjects.length > 0 ? (
                      <div className="ai-dash-progress-grid">
                        {progressData.subjects.map((s) => (
                          <div className="ai-dash-progress-card" key={s.subject}>
                            <div className="ai-dash-progress-header">
                              <FaBookOpen size={24} style={{ color: '#6B7280' }} />
                              <span>{s.subject}</span>
                            </div>
                            <div className="ai-dash-progress-bar">
                              <div className="ai-dash-progress-fill" style={{ width: `${s.averageScore}%` }}></div>
                            </div>
                            <small>{s.totalQuizzes} quizzes — Avg: {s.averageScore}% — {s.totalStudyMinutes}m studied</small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="ai-dash-progress-grid">
                        {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English'].map((subject) => (
                          <div className="ai-dash-progress-card" key={subject}>
                            <div className="ai-dash-progress-header">
                              <FaBookOpen size={24} style={{ color: '#6B7280' }} />
                              <span>{subject}</span>
                            </div>
                            <div className="ai-dash-progress-bar">
                              <div className="ai-dash-progress-fill" style={{ width: '0%' }}></div>
                            </div>
                            <small>Start learning to track progress</small>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="ai-dash-profile">
              <div className="ai-dash-section">
                <h2><FaUser style={{ marginRight: '0.5rem' }} /> My Profile</h2>
                <div className="ai-dash-profile-header">
                  <div className="ai-dash-profile-avatar">{initials}</div>
                  <div>
                    <h3>{user?.name || 'Student'}</h3>
                    <p>{user?.email}</p>
                    <div className="ai-dash-profile-stats">
                      <span><FaStar style={{ color: '#6B7280' }} /> {progressData?.profile?.totalPoints || 0} points</span>
                      <span><FaFire style={{ color: '#6B7280' }} /> {progressData?.profile?.streak || 0} day streak</span>
                      <span><FaQuestionCircle style={{ color: '#6B7280' }} /> {progressData?.summary?.totalQuizzes || 0} quizzes</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ai-dash-section">
                <h3><FaEdit style={{ marginRight: '0.5rem' }} /> Edit Profile</h3>
                <form className="ai-dash-profile-form" onSubmit={handleProfileSave}>
                  <div className="ai-dash-form-group">
                    <label>Full Name</label>
                    <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div className="ai-dash-form-group">
                    <label>Email</label>
                    <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                  </div>
                  {profileMsg && <p className={`ai-dash-form-msg ${profileMsg.includes('success') ? 'success' : 'error'}`}>{profileMsg}</p>}
                  <button type="submit" className="ai-dash-form-btn" disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
              <div className="ai-dash-section">
                <h3><FaKey style={{ marginRight: '0.5rem' }} /> Change Password</h3>
                <form className="ai-dash-profile-form" onSubmit={handlePasswordSave}>
                  <div className="ai-dash-form-group">
                    <label>Current Password</label>
                    <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                  </div>
                  <div className="ai-dash-form-group">
                    <label>New Password</label>
                    <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                  </div>
                  <div className="ai-dash-form-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                  </div>
                  {passwordMsg && <p className={`ai-dash-form-msg ${passwordMsg.includes('success') ? 'success' : 'error'}`}>{passwordMsg}</p>}
                  <button type="submit" className="ai-dash-form-btn" disabled={passwordSaving}>
                    {passwordSaving ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="ai-dash-settings">
              <div className="ai-dash-section">
                <h2>Account Settings</h2>
                <div className="ai-dash-settings-card">
                  <div className="ai-dash-settings-row">
                    <FaUser size={20} />
                    <div>
                      <strong>Name</strong>
                      <span>{user?.name || 'Not set'}</span>
                    </div>
                  </div>
                  <div className="ai-dash-settings-row">
                    <FaGlobe size={20} />
                    <div>
                      <strong>Email</strong>
                      <span>{user?.email || 'Not set'}</span>
                    </div>
                  </div>
                  <div className="ai-dash-settings-row">
                    <FaLaptop size={20} />
                    <div>
                      <strong>Account Type</strong>
                      <span>AI Learning Platform — Student</span>
                    </div>
                  </div>
                  <div className="ai-dash-settings-row">
                    <FaStar size={20} />
                    <div>
                      <strong>Total Points</strong>
                      <span>{progressData?.profile?.totalPoints || 0} points</span>
                    </div>
                  </div>
                  <div className="ai-dash-settings-row">
                    <FaCalendarAlt size={20} />
                    <div>
                      <strong>Current Streak</strong>
                      <span>{progressData?.profile?.streak || 0} days</span>
                    </div>
                  </div>
                  <div className="ai-dash-settings-row">
                    <FaEnvelope size={20} />
                    <div>
                      <strong>Notifications</strong>
                      <span>{unreadCount} unread</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
