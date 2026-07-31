import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLang } from '../LanguageContext';
import API_BASE, { AI_API_BASE } from '../api';
import AITutor from './AITutor';
import AIQuiz from './AIQuiz';
import AITopicWorkspace from './AITopicWorkspace';
import AIResources from './AIResources';
import AICareer from './AICareer';
import AITeacherAssistant from './AITeacherAssistant';
import {
  FaRobot, FaChartLine, FaTachometerAlt, FaCog, FaSignOutAlt,
  FaHome, FaBookOpen, FaStar, FaCalendarAlt,
  FaClock, FaUser, FaBell,
  FaLightbulb, FaComments, FaFire,
  FaBars, FaTimes, FaSearch, FaTools, FaEnvelope,
  FaCheck, FaTrash, FaEdit, FaKey, FaQuestionCircle, FaGlobe, FaLaptop, FaPhone, FaRoute, FaChalkboardTeacher
} from 'react-icons/fa';

const SIDEBAR_GROUPS = [
  {
    label: 'Dashboard',
    labelRw: 'Ikigega',
    items: [
      { key: 'overview', icon: <FaTachometerAlt />, labelEn: 'Overview', labelRw: 'Igice', roles: ['learner', 'admin'] },
      { key: 'progress', icon: <FaChartLine />, labelEn: 'My Progress', labelRw: 'Ibikorwa byanje', roles: ['learner'] },
      { key: 'profile', icon: <FaUser />, labelEn: 'Profile', labelRw: 'Umwirondoro', roles: ['learner', 'admin'] },
      { key: 'settings', icon: <FaCog />, labelEn: 'Settings', labelRw: 'Amategeko', roles: ['learner', 'admin'] },
    ],
  },
  {
    label: 'AI Tools',
    labelRw: 'Ibikoresho bya AI',
    items: [
      { key: 'topic', icon: <FaTools />, labelEn: 'AI Tools', labelRw: 'Ibikoresho bya AI', roles: ['learner'] },
      { key: 'tutor', icon: <FaComments />, labelEn: 'AI Tutor', labelRw: 'Uwigisha wa AI', roles: ['learner'] },
      { key: 'quiz', icon: <FaQuestionCircle />, labelEn: 'Quizzes', labelRw: 'Ibibazo', roles: ['learner'] },
      { key: 'resources', icon: <FaBookOpen />, labelEn: 'Resources', labelRw: 'Inkwando', roles: ['learner', 'admin'] },
      { key: 'career', icon: <FaRoute />, labelEn: 'Career Guidance', labelRw: "Umutwe w'akazi", roles: ['learner'] },
      { key: 'teacher', icon: <FaChalkboardTeacher />, labelEn: 'Teacher Assistant', labelRw: "Umufasha w'umwarimu", roles: ['admin'] },
    ],
  },
];

const SUBJECT_INFO = {
  mathematics: { label: 'Mathematics', color: '#FFCE08', icon: '📐' },
  math: { label: 'Mathematics', color: '#FFCE08', icon: '📐' },
  physics: { label: 'Physics', color: '#5694F7', icon: '⚡' },
  chemistry: { label: 'Chemistry', color: '#10b981', icon: '⚗️' },
  biology: { label: 'Biology', color: '#8b5cf6', icon: '🧬' },
  computer_science: { label: 'Computer Science', color: '#06b6d4', icon: '💻' },
  english: { label: 'English', color: '#f59e0b', icon: '📚' },
  geography: { label: 'Geography', color: '#ef4444', icon: '🗺️' },
  history: { label: 'History', color: '#d946ef', icon: '🏛️' },
  general: { label: 'General', color: '#64748b', icon: '🌍' },
};

const subjectInfo = (s) => SUBJECT_INFO[(s || '').toLowerCase()] || { label: s || 'General', color: '#64748b', icon: '📖' };

const subjectStatus = (quizzes, pct) => {
  if (pct >= 80) return { label: 'Mastered', color: '#10b981' };
  if (pct >= 50) return { label: 'In progress', color: '#f59e0b' };
  if (quizzes > 0) return { label: 'Needs practice', color: '#ef4444' };
  return { label: 'Not started', color: '#9ca3af' };
};

export default function AILearningDashboard() {
  const { t } = useLang();
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = user?.isAdmin ? 'admin' : 'learner';
  const roleTabs = SIDEBAR_GROUPS
    .flatMap((group) => group.items)
    .filter((item) => item.roles.includes(role))
    .map((item) => item.key);
  const defaultTab = user?.isAdmin ? 'teacher' : 'overview';
  const [tab, setTab] = useState(() => searchParams.get('tab') || defaultTab);
  const [progressData, setProgressData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [lastSearch, setLastSearch] = useState('');
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMsgType, setProfileMsgType] = useState('');
  const [passwordMsgType, setPasswordMsgType] = useState('');
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const token = () => localStorage.getItem('cshub_token');
  const navGroups = SIDEBAR_GROUPS
    .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(role)) }))
    .filter((group) => group.items.length > 0);

  useEffect(() => {
    if (!roleTabs.includes(tab)) setTab(defaultTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    fetchProgress();
    fetchNotifications();
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
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

  const notifWasOpen = useRef(false);
  useEffect(() => {
    if (notifWasOpen.current && !showNotifications && unreadCount > 0) markAllRead();
    notifWasOpen.current = showNotifications;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNotifications]);

  const handleNav = (key) => {
    setTab(key);
    setSidebarOpen(false);
    setShowNotifications(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLastSearch(searchQuery.trim());
      setSearchTrigger((t) => t + 1);
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
      await updateProfile(profileForm.name, profileForm.email, profileForm.phone);
      setProfileMsg('Profile updated successfully!');
      setProfileMsgType('success');
    } catch (err) {
      setProfileMsg(err.message || 'Failed to update profile.');
      setProfileMsgType('error');
    }
    setProfileSaving(false);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg('New passwords do not match.');
      setPasswordMsgType('error');
      setPasswordSaving(false);
      return;
    }
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMsg('Password changed successfully!');
      setPasswordMsgType('success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMsg(err.message || 'Failed to change password.');
      setPasswordMsgType('error');
    }
    setPasswordSaving(false);
  };

  const stats = [
    { icon: <FaComments />, value: progressData ? progressData.recentSessions?.length || 0 : '—', label: 'AI Sessions', color: '#6B7280' },
    { icon: <FaQuestionCircle />, value: progressData ? progressData.summary?.totalQuizzes || 0 : '—', label: 'Quizzes Done', color: '#6B7280' },
    { icon: <FaChartLine />, value: progressData ? `${progressData.summary?.avgScore || 0}%` : '—', label: 'Avg Score', color: '#6B7280' },
    { icon: <FaStar />, value: progressData ? progressData.profile?.totalPoints || 0 : '—', label: 'Points', color: '#6B7280' },
  ];

  const tabTitles = {
    overview: 'Overview', topic: 'AI Tools', tutor: 'AI Tutor', quiz: 'Quizzes',
    resources: 'Resources', progress: 'My Progress', profile: 'Profile', settings: 'Settings',
    career: 'AI Career Guidance', teacher: 'AI Teacher Assistant',
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
          {navGroups.map((group) => (
            <div key={group.label} className="ai-dash-nav-group">
              <div className="ai-dash-nav-group-label">{lang === 'rw' ? group.labelRw : group.label}</div>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  className={`ai-dash-nav-item${tab === item.key ? ' active' : ''}`}
                  onClick={() => handleNav(item.key)}
                >
                  {item.icon}
                  <span>{lang === 'rw' ? item.labelRw : item.labelEn}</span>
                </button>
              ))}
            </div>
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
              onClick={() => setShowNotifications(!showNotifications)}
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
          {tab === 'overview' && (user?.isAdmin ? (
            <>
              <div className="ai-dash-welcome">
                <div className="ai-dash-welcome-text">
                  <h2>Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!</h2>
                  <p>Your AI-powered teaching toolkit is ready. Generate lesson plans, exams, worksheets and more.</p>
                </div>
                <button className="btn" onClick={() => handleNav('teacher')}>
                  <FaChalkboardTeacher style={{ marginRight: '0.5rem' }} /> Open Teacher Assistant
                </button>
              </div>

              <div className="ai-dash-section">
                <h3><FaClock style={{ marginRight: '0.5rem' }} /> Quick Access</h3>
                <div className="ai-dash-quick-grid">
                  <button className="ai-dash-quick-card" onClick={() => handleNav('teacher')}>
                    <div className="ai-dash-quick-icon" style={{ color: '#6B7280' }}><FaChalkboardTeacher /></div>
                    <span>Teacher Assistant</span>
                  </button>
                  <button className="ai-dash-quick-card" onClick={() => handleNav('profile')}>
                    <div className="ai-dash-quick-icon" style={{ color: '#6B7280' }}><FaUser /></div>
                    <span>My Profile</span>
                  </button>
                  <button className="ai-dash-quick-card" onClick={() => handleNav('settings')}>
                    <div className="ai-dash-quick-icon" style={{ color: '#6B7280' }}><FaCog /></div>
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
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
                          <span>{s.subject ? s.subject.charAt(0).toUpperCase() + s.subject.slice(1) : 'General'} — {s.messages} messages</span>
                          <small>{new Date(s.date).toLocaleDateString()}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ))}
          )}

          {tab === 'topic' && (
            <AITopicWorkspace
              onBack={() => setTab('overview')}
              initialQuery={lastSearch}
              autoSearchTrigger={searchTrigger}
            />
          )}

          {tab === 'tutor' && <AITutor />}

          {tab === 'quiz' && <AIQuiz />}

          {tab === 'resources' && <AIResources onBack={() => setTab('overview')} />}

          {tab === 'career' && <AICareer />}

          {tab === 'teacher' && (user?.isAdmin ? <AITeacherAssistant /> : (
            <div className="ai-teacher-denied">
              <FaChalkboardTeacher />
              <h3>Teachers only</h3>
              <p>The AI Teacher Assistant is available for teachers and administrators.</p>
            </div>
          ))}

          {tab === 'progress' && (
            <div className="ai-dash-progress">
              <div className="ai-dash-section">
                <div className="ai-dash-page-header">
                  <span className="ai-dash-page-header-icon" style={{ backgroundColor: '#8b5cf61f', color: '#8b5cf6' }}><FaChartLine /></span>
                  <div>
                    <h2>My Learning Progress</h2>
                    <p>Track your learning journey across all AI tools and subjects.</p>
                  </div>
                </div>
                {progressData ? (
                  <>
                    <div className="ai-dash-stats" style={{ marginBottom: '1.5rem' }}>
                      <div className="ai-dash-stat-card">
                        <div className="ai-dash-stat-icon" style={{ color: '#FFCE08' }}><FaStar /></div>
                        <div className="ai-dash-stat-info">
                          <strong>{progressData.profile.totalPoints}</strong>
                          <span>Total Points</span>
                        </div>
                      </div>
                      <div className="ai-dash-stat-card">
                        <div className="ai-dash-stat-icon" style={{ color: '#ef4444' }}><FaFire /></div>
                        <div className="ai-dash-stat-info">
                          <strong>{progressData.profile.streak}</strong>
                          <span>Day Streak</span>
                        </div>
                      </div>
                      <div className="ai-dash-stat-card">
                        <div className="ai-dash-stat-icon" style={{ color: '#8b5cf6' }}><FaQuestionCircle /></div>
                        <div className="ai-dash-stat-info">
                          <strong>{progressData.summary.totalQuizzes}</strong>
                          <span>Quizzes</span>
                        </div>
                      </div>
                      <div className="ai-dash-stat-card">
                        <div className="ai-dash-stat-icon" style={{ color: '#10b981' }}><FaClock /></div>
                        <div className="ai-dash-stat-info">
                          <strong>{progressData.summary.totalStudyMinutes}m</strong>
                          <span>Study Time</span>
                        </div>
                      </div>
                    </div>

                    <div className="ai-dash-section-head">
                      <h3>Subject Progress</h3>
                      <span className="ai-dash-subject-count">{progressData.subjects.length} subject{progressData.subjects.length === 1 ? '' : 's'}</span>
                    </div>
                    {progressData.subjects.length > 0 ? (
                      <div className="ai-dash-progress-grid">
                        {progressData.subjects.map((s) => {
                          const info = subjectInfo(s.subject);
                          const pct = s.averageScore || 0;
                          const status = subjectStatus(s.totalQuizzes, pct);
                          return (
                            <div className="ai-dash-progress-card" key={s.subject}>
                              <div className="ai-dash-progress-card-head">
                                <span className="ai-dash-progress-subject-icon" style={{ backgroundColor: info.color + '1f', color: info.color }}>{info.icon}</span>
                                <div className="ai-dash-progress-subject-info">
                                  <strong>{info.label}</strong>
                                  <span style={{ color: status.color }}>{status.label}</span>
                                </div>
                                <span className="ai-dash-progress-avg" style={{ backgroundColor: pct >= 80 ? '#10b9811a' : pct >= 50 ? '#f59e0b1a' : pct > 0 ? '#ef44441a' : '#f3f4f6', color: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : pct > 0 ? '#ef4444' : '#9ca3af' }}>{pct}%</span>
                              </div>
                              <div className="ai-dash-progress-bar">
                                <div className="ai-dash-progress-fill" style={{ width: `${pct}%`, backgroundColor: pct > 0 ? info.color : '#e5e7eb' }} />
                              </div>
                              <div className="ai-dash-progress-meta">
                                <span className="ai-dash-progress-quiz-count" style={{ color: info.color }}>{s.totalQuizzes} quiz{s.totalQuizzes === 1 ? '' : 'zes'}</span>
                                <span className="ai-dash-progress-sep">•</span>
                                <span>{s.totalStudyMinutes}m studied</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="ai-dash-progress-grid">
                        {['mathematics', 'physics', 'chemistry', 'biology', 'computer_science', 'english'].map((slug) => {
                          const info = subjectInfo(slug);
                          return (
                            <div className="ai-dash-progress-card" key={slug}>
                              <div className="ai-dash-progress-card-head">
                                <span className="ai-dash-progress-subject-icon" style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}>{info.icon}</span>
                                <div className="ai-dash-progress-subject-info">
                                  <strong>{info.label}</strong>
                                  <span style={{ color: '#9ca3af' }}>Not started</span>
                                </div>
                                <span className="ai-dash-progress-avg" style={{ backgroundColor: '#f3f4f6', color: '#9ca3af' }}>0%</span>
                              </div>
                              <div className="ai-dash-progress-bar">
                                <div className="ai-dash-progress-fill" style={{ width: '0%' }} />
                              </div>
                              <div className="ai-dash-progress-meta">
                                <span>Start a quiz to begin tracking</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {progressData.recentSessions?.length > 0 && (
                      <div className="ai-dash-section" style={{ marginTop: '1.5rem' }}>
                        <h3><FaLightbulb style={{ marginRight: '0.5rem' }} /> Recent Activity</h3>
                        <div className="ai-dash-activity-list">
                          {progressData.recentSessions.map((s, i) => (
                            <div className="ai-dash-activity-item" key={i}>
                              <div className="ai-dash-activity-icon" style={{ color: '#6B7280' }}><FaComments /></div>
                              <div className="ai-dash-activity-info">
                                <span>{s.subject ? subjectInfo(s.subject).label : 'General'} — {s.messages} messages</span>
                                <small>{new Date(s.date).toLocaleDateString()}</small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="ai-dash-progress-loading">Loading your progress...</p>
                )}
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div className="ai-dash-profile">
              <div className="ai-dash-page-header">
                <span className="ai-dash-page-header-icon" style={{ backgroundColor: '#8b5cf61f', color: '#8b5cf6' }}><FaUser /></span>
                <div>
                  <h2>My Profile</h2>
                  <p>Manage your personal details and account security</p>
                </div>
              </div>

              {/* Profile Card */}
              <div className="ai-dash-profile-card">
                <div className="ai-dash-profile-card-bg"></div>
                <div className="ai-dash-profile-card-content">
                  <div className="ai-dash-profile-avatar-wrap">
                    <div className="ai-dash-profile-avatar-lg">{initials}</div>
                    <span className="ai-dash-profile-badge">{user?.isAdmin ? 'Admin' : 'Learner'}</span>
                  </div>
                  <div className="ai-dash-profile-info">
                    <h2>{user?.name || 'Student'}</h2>
                    {user?.email && <p className="ai-dash-profile-email"><FaEnvelope style={{ marginRight: '0.35rem' }} />{user.email}</p>}
                    {user?.phone && <p className="ai-dash-profile-email"><FaPhone style={{ marginRight: '0.35rem' }} />{user.phone}</p>}
                    {!user?.phone && !user?.email && <p className="ai-dash-profile-email">No contact set — add your email or phone below</p>}
                    <p className="ai-dash-profile-joined">
                      Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="ai-dash-profile-stats-grid">
                  <div className="ai-dash-profile-stat-card">
                    <FaStar className="stat-icon" style={{ color: '#FFCE08' }} />
                    <div className="stat-value">{progressData?.profile?.totalPoints || 0}</div>
                    <div className="stat-label">Points</div>
                  </div>
                  <div className="ai-dash-profile-stat-card">
                    <FaFire className="stat-icon" style={{ color: '#ef4444' }} />
                    <div className="stat-value">{progressData?.profile?.streak || 0}</div>
                    <div className="stat-label">Day Streak</div>
                  </div>
                  <div className="ai-dash-profile-stat-card">
                    <FaQuestionCircle className="stat-icon" style={{ color: '#3b82f6' }} />
                    <div className="stat-value">{progressData?.summary?.totalQuizzes || 0}</div>
                    <div className="stat-label">Quizzes</div>
                  </div>
                  <div className="ai-dash-profile-stat-card">
                    <FaBookOpen className="stat-icon" style={{ color: '#10b981' }} />
                    <div className="stat-value">{progressData?.summary?.totalStudyMinutes || 0}m</div>
                    <div className="stat-label">Study Time</div>
                  </div>
                </div>
              </div>

              {/* Edit Profile */}
              <div className="ai-dash-section">
                <div className="ai-dash-section-head">
                  <h3><FaEdit style={{ marginRight: '0.45rem' }} /> Edit Profile</h3>
                  <span className="ai-dash-subject-count">Personal details</span>
                </div>
                <form className="ai-dash-profile-form" onSubmit={handleProfileSave}>
                  <div className="ai-dash-form-row">
                    <div className="ai-dash-form-group">
                      <label>Full Name</label>
                      <input type="text" value={profileForm.name} placeholder="Your full name" onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                    </div>
                    <div className="ai-dash-form-group">
                      <label>Email Address</label>
                      <input type="email" value={profileForm.email} placeholder="you@example.com" onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="ai-dash-form-group">
                    <label>Phone Number</label>
                    <input type="tel" value={profileForm.phone} placeholder="+250 7XX XXX XXX" onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  </div>
                  {profileMsg && <p className={`ai-dash-form-msg ${profileMsgType}`}>{profileMsg}</p>}
                  <button type="submit" className="ai-dash-form-btn" disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="ai-dash-section">
                <div className="ai-dash-section-head">
                  <h3><FaKey style={{ marginRight: '0.45rem' }} /> Change Password</h3>
                  <span className="ai-dash-subject-count">Security</span>
                </div>
                <form className="ai-dash-profile-form" onSubmit={handlePasswordSave}>
                  <div className="ai-dash-form-group">
                    <label>Current Password</label>
                    <input type="password" value={passwordForm.currentPassword} placeholder="Enter current password" onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                  </div>
                  <div className="ai-dash-form-group">
                    <label>New Password</label>
                    <input type="password" value={passwordForm.newPassword} placeholder="At least 6 characters" onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                  </div>
                  <div className="ai-dash-form-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={passwordForm.confirmPassword} placeholder="Repeat the new password" onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                  </div>
                  {passwordMsg && <p className={`ai-dash-form-msg ${passwordMsgType}`}>{passwordMsg}</p>}
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
