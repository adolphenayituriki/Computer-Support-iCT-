import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { FaUser } from 'react-icons/fa';

import SettingsModal from './SettingsModal';

export default function Navbar({ onLoginClick, onRegisterClick }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <header className={(scrolled && !isDashboard) ? 'scrolled' : isDashboard ? 'dash-header' : ''}>
      <nav>
        <a href="/" className="logo">
          <img src="/final-logo.jpg" alt="CS hub (iCT)" className="logo-img" />
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
              <li className="nav-profile-wrap" ref={menuRef}>
                <button className="nav-avatar" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                  {initials}
                </button>
                {showProfileMenu && (
                  <div className="nav-profile-menu">
                    <div className="nav-profile-name">{user?.name}</div>
                    <button onClick={() => { setShowProfileMenu(false); setShowSettings(true); }}>Settings</button>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </li>
            </>
          ) : user ? (
            <>
              <li><a href="/#home" className={active === 'home' ? 'active' : ''} onClick={() => setOpen(false)}>Home</a></li>
              <li><a href="/#services" className={active === 'services' ? 'active' : ''} onClick={() => setOpen(false)}>Services</a></li>
              <li><a href="/#about" className={active === 'about' ? 'active' : ''} onClick={() => setOpen(false)}>About Us</a></li>
              <li><a href="/#contact" className={active === 'contact' ? 'active' : ''} onClick={() => setOpen(false)}>Contact</a></li>
              <li className="nav-profile-wrap" ref={menuRef}>
                <button className="nav-avatar" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                  {initials}
                </button>
                {showProfileMenu && (
                  <div className="nav-profile-menu">
                    <div className="nav-profile-name">{user?.name}</div>
                    <button onClick={() => { setShowProfileMenu(false); setShowSettings(true); }}>Settings</button>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li><a href="/#home" onClick={() => setOpen(false)}>Home</a></li>
              <li><a href="/#about" onClick={() => setOpen(false)}>About Us</a></li>
              <li><a href="/#contact" onClick={() => setOpen(false)}>Contact</a></li>
              <li><button className="nav-avatar nav-avatar-guest" onClick={() => { setOpen(false); onLoginClick(); }}><FaUser /></button></li>
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
