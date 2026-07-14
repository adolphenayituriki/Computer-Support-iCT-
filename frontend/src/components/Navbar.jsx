import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { FaUser, FaBell, FaClock, FaShieldAlt, FaHeadset, FaLaptop } from 'react-icons/fa';

import SettingsModal from './SettingsModal';

const NOTIFY_ITEMS = [
  { icon: <FaClock />, text: <>Mon – Fri, 8AM – 5PM | WhatsApp: <strong>+250 780 505 948</strong></> },
  { icon: <FaLaptop />, text: <>Remote support now available — no need to move from your desk</> },
  { icon: <FaShieldAlt />, text: <>Never share your password. Our team will never ask for it.</> },
  { icon: <FaHeadset />, text: <>24/7 Emergency Support — Call <strong>+250 780 505 948</strong></> },
];

export default function Navbar({ onLoginClick, onRegisterClick }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifyIdx, setNotifyIdx] = useState(0);
  const [notifyFading, setNotifyFading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  const menuRef = useRef(null);
  const hideTimer = useRef(null);

  const isNews = location.pathname === '/news';
  const isCourses = location.pathname === '/courses';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isNews) { setActive('news'); return; }
    if (isCourses) { setActive('courses'); return; }
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isNews, isCourses]);

  useEffect(() => {
    if (!scrolled || isDashboard) return;
    const interval = setInterval(() => {
      setNotifyFading(true);
      setTimeout(() => {
        setNotifyIdx((prev) => (prev + 1) % NOTIFY_ITEMS.length);
        setNotifyFading(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [scrolled, isDashboard]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/');
  };

  const handleMouseEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowProfileMenu(true);
  };

  const handleMouseLeave = () => {
    hideTimer.current = setTimeout(() => setShowProfileMenu(false), 250);
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <header className={(scrolled && !isDashboard) ? 'scrolled' : isDashboard ? 'dash-header' : ''}>
      {scrolled && !isDashboard && (
        <div className="nav-notify-bar">
          <span className={`nav-notify-content${notifyFading ? ' fading' : ''}`}>
            <span className="nav-notify-icon">{NOTIFY_ITEMS[notifyIdx].icon}</span>
            {NOTIFY_ITEMS[notifyIdx].text}
          </span>
          <div className="nav-notify-dots">
            {NOTIFY_ITEMS.map((_, i) => (
              <span key={i} className={`nav-notify-dot${i === notifyIdx ? ' active' : ''}`} onClick={() => { setNotifyFading(true); setTimeout(() => { setNotifyIdx(i); setNotifyFading(false); }, 300); }} />
            ))}
          </div>
        </div>
      )}
      <nav>
        <a href="/" className="logo">
          <img src="/LOGO IMAGE.png" alt="CS hub (iCT)" className="logo-img" />
          <span className="logo-text">
            <span className="logo-cs">CS H</span><span className="logo-ub">ub</span> <span className="logo-paren">(</span><span className="logo-ub">i</span><span className="logo-ct">CT</span><span className="logo-paren">)</span>
            <small>COMPUTER SUPPORT</small>
          </span>
        </a>
        <ul className={`nav-links${open ? ' active' : ''}`}>
          {isDashboard ? (
            <>
              <li><a href="/" onClick={() => setOpen(false)}><span style={{ fontSize: '0.85rem' }}>&larr;</span> Back to Home</a></li>
              <li><a href="/dashboard" onClick={() => setOpen(false)}>Dashboard</a></li>
              <li className="nav-profile-wrap" ref={menuRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button className="nav-avatar" onClick={() => setShowProfileMenu((v) => !v)}>
                  {initials}
                </button>
                {showProfileMenu && (
                  <div className="nav-profile-menu" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <div className="nav-profile-name">{user?.name}</div>
                    <button onClick={() => { setShowProfileMenu(false); setShowSettings(true); }}>Settings</button>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </li>
              <li className="nav-mobile-only"><button className="nav-mobile-settings" onClick={() => { setOpen(false); setShowSettings(true); }}>Settings</button></li>
              <li className="nav-mobile-only"><button className="nav-mobile-logout" onClick={() => { setOpen(false); handleLogout(); }}>Logout</button></li>
            </>
          ) : user ? (
            <>
              <li><a href="/#home" className={active === 'home' ? 'active' : ''} onClick={() => setOpen(false)}>Home</a></li>
              <li><a href="/#services" className={active === 'services' ? 'active' : ''} onClick={() => setOpen(false)}>Services</a></li>
              <li><a href="/news" className={active === 'news' ? 'active' : ''} onClick={() => setOpen(false)}>News</a></li>
              <li><a href="/courses" className={active === 'courses' ? 'active' : ''} onClick={() => setOpen(false)}>Courses</a></li>
              <li><a href="/#about" className={active === 'about' ? 'active' : ''} onClick={() => setOpen(false)}>About Us</a></li>
              <li><a href="/#contact" className={active === 'contact' ? 'active' : ''} onClick={() => setOpen(false)}>Contact</a></li>
              <li className="nav-profile-wrap" ref={menuRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button className="nav-avatar" onClick={() => setShowProfileMenu((v) => !v)}>
                  {initials}
                </button>
                {showProfileMenu && (
                  <div className="nav-profile-menu" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <div className="nav-profile-name">{user?.name}</div>
                    <button onClick={() => { setShowProfileMenu(false); navigate('/dashboard'); }}>Go to Dashboard</button>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </li>
              <li className="nav-mobile-only"><button className="nav-mobile-dashboard" onClick={() => { setOpen(false); navigate('/dashboard'); }}>Go to Dashboard</button></li>
              <li className="nav-mobile-only"><button className="nav-mobile-logout" onClick={() => { setOpen(false); handleLogout(); }}>Logout</button></li>
            </>
          ) : (
            <>
              <li><a href="/#home" className={active === 'home' ? 'active' : ''} onClick={() => setOpen(false)}>Home</a></li>
              <li><a href="/news" className={active === 'news' ? 'active' : ''} onClick={() => setOpen(false)}>News</a></li>
              <li><a href="/courses" className={active === 'courses' ? 'active' : ''} onClick={() => setOpen(false)}>Courses</a></li>
              <li><a href="/#about" className={active === 'about' ? 'active' : ''} onClick={() => setOpen(false)}>About Us</a></li>
              <li><a href="/#contact" className={active === 'contact' ? 'active' : ''} onClick={() => setOpen(false)}>Contact</a></li>
              <li className="nav-cta-wrap"><button className="nav-cta-btn" onClick={() => { setOpen(false); onLoginClick(); }}><FaUser /> Sign In</button></li>
            </>
          )}
        </ul>
        <button className={`hamburger${open ? ' open' : ''}`} aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        {open && <div className="nav-overlay" onClick={() => setOpen(false)} />}
      </nav>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </header>
  );
}
