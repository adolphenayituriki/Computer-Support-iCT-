import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLang } from '../LanguageContext';
import { FaUser, FaBell, FaClock, FaShieldAlt, FaHeadset, FaLaptop, FaGlobe, FaCaretDown, FaBookOpen, FaRobot } from 'react-icons/fa';

import SettingsModal from './SettingsModal';
import AILearningModal from './AILearningModal';

const NOTIFY_ITEMS_EN = [
  { icon: <FaClock />, text: <>Mon – Fri, 8AM – 5PM | WhatsApp: <strong>+250 780 505 948</strong></> },
  { icon: <FaLaptop />, text: <>Remote support now available — no need to move from your desk</> },
  { icon: <FaShieldAlt />, text: <>Never share your password. Our team will never ask for it.</> },
  { icon: <FaHeadset />, text: <>24/7 Emergency Support — Call <strong>+250 780 505 948</strong></> },
];

const NOTIFY_ITEMS_RW = [
  { icon: <FaClock />, text: <>Ku wa mbere – Ku wa gatanu, 8:00 – 17:00 | WhatsApp: <strong>+250 780 505 948</strong></> },
  { icon: <FaLaptop />, text: <>Ubufasha bwa kure buraboneka — nta kuburimbo bwarakeneye</> },
  { icon: <FaShieldAlt />, text: <>Ntimugire amakuru y'ibanga. Ikipe yacu ntizababaza.</> },
  { icon: <FaHeadset />, text: <>Ubufasha bw'akanyuma 24/7 — Fona <strong>+250 780 505 948</strong></> },
];

export default function Navbar({ onLoginClick, onRegisterClick }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAILearning, setShowAILearning] = useState(false);
  const [notifyIdx, setNotifyIdx] = useState(0);
  const [notifyFading, setNotifyFading] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const { user, logout } = useAuth();
  const { lang, t, toggleLang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  const menuRef = useRef(null);
  const hideTimer = useRef(null);
  const coursesTimer = useRef(null);

  const NOTIFY_ITEMS = lang === 'rw' ? NOTIFY_ITEMS_RW : NOTIFY_ITEMS_EN;

  const isNews = location.pathname === '/news';
  const isCourses = location.pathname === '/courses' || location.pathname === '/ai-learning';

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

  const handleCoursesEnter = () => {
    if (coursesTimer.current) clearTimeout(coursesTimer.current);
    setCoursesOpen(true);
  };

  const handleCoursesLeave = () => {
    coursesTimer.current = setTimeout(() => setCoursesOpen(false), 200);
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
              <li><a href="/" onClick={() => setOpen(false)}><span style={{ fontSize: '0.85rem' }}>&larr;</span> {t('nav.backHome')}</a></li>
              <li><a href="/dashboard" onClick={() => setOpen(false)}>{t('nav.dashboard')}</a></li>
              <li className="nav-profile-wrap" ref={menuRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button className="nav-avatar" onClick={() => setShowProfileMenu((v) => !v)}>
                  {initials}
                </button>
                {showProfileMenu && (
                  <div className="nav-profile-menu" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <div className="nav-profile-name">{user?.name}</div>
                    <button onClick={() => { setShowProfileMenu(false); setShowSettings(true); }}>{t('nav.settings')}</button>
                    <button onClick={handleLogout}>{t('nav.logout')}</button>
                  </div>
                )}
              </li>
              <li className="nav-mobile-only"><button className="nav-mobile-settings" onClick={() => { setOpen(false); setShowSettings(true); }}>{t('nav.settings')}</button></li>
              <li className="nav-mobile-only"><button className="nav-mobile-logout" onClick={() => { setOpen(false); handleLogout(); }}>{t('nav.logout')}</button></li>
            </>
          ) : user ? (
            <>
              <li><a href="/#home" className={active === 'home' ? 'active' : ''} onClick={() => setOpen(false)}>{t('nav.home')}</a></li>
              <li><a href="/#services" className={active === 'services' ? 'active' : ''} onClick={() => setOpen(false)}>{t('nav.services')}</a></li>
              <li><a href="/news" className={active === 'news' ? 'active' : ''} onClick={() => setOpen(false)}>{t('nav.news')}</a></li>
              <li className={`nav-dropdown${coursesOpen ? ' open' : ''}`} onMouseEnter={handleCoursesEnter} onMouseLeave={handleCoursesLeave}>
                <button className={`nav-dropdown-trigger${isCourses ? ' active' : ''}`} onClick={() => setCoursesOpen((v) => !v)}>
                  {t('nav.courses')} <FaCaretDown className="nav-caret" />
                </button>
                {coursesOpen && (
                  <div className="nav-dropdown-menu">
                    <a href="/courses" onClick={() => { setOpen(false); setCoursesOpen(false); }}>
                      <FaBookOpen /> {t('navDropdown.knowledgeBase')}
                    </a>
                    <button className="nav-dropdown-item-btn" onClick={() => { setOpen(false); setCoursesOpen(false); setShowAILearning(true); }}>
                      <FaRobot /> {t('navDropdown.aiLearning')}
                    </button>
                  </div>
                )}
              </li>
              <li><a href="/#about" className={active === 'about' ? 'active' : ''} onClick={() => setOpen(false)}>{t('nav.about')}</a></li>
              <li><a href="/#contact" className={active === 'contact' ? 'active' : ''} onClick={() => setOpen(false)}>{t('nav.contact')}</a></li>
              <li className="nav-profile-wrap" ref={menuRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button className="nav-avatar" onClick={() => setShowProfileMenu((v) => !v)}>
                  {initials}
                </button>
                {showProfileMenu && (
                  <div className="nav-profile-menu" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <div className="nav-profile-name">{user?.name}</div>
                    <button onClick={() => { setShowProfileMenu(false); navigate('/dashboard'); }}>{t('nav.goToDashboard')}</button>
                    <button onClick={handleLogout}>{t('nav.logout')}</button>
                  </div>
                )}
              </li>
              <li className="nav-mobile-only"><button className="nav-mobile-dashboard" onClick={() => { setOpen(false); navigate('/dashboard'); }}>{t('nav.goToDashboard')}</button></li>
              <li className="nav-mobile-only"><button className="nav-mobile-logout" onClick={() => { setOpen(false); handleLogout(); }}>{t('nav.logout')}</button></li>
            </>
          ) : (
            <>
              <li><a href="/#home" className={active === 'home' ? 'active' : ''} onClick={() => setOpen(false)}>{t('nav.home')}</a></li>
              <li><a href="/news" className={active === 'news' ? 'active' : ''} onClick={() => setOpen(false)}>{t('nav.news')}</a></li>
              <li className={`nav-dropdown${coursesOpen ? ' open' : ''}`} onMouseEnter={handleCoursesEnter} onMouseLeave={handleCoursesLeave}>
                <button className={`nav-dropdown-trigger${isCourses ? ' active' : ''}`} onClick={() => setCoursesOpen((v) => !v)}>
                  {t('nav.courses')} <FaCaretDown className="nav-caret" />
                </button>
                {coursesOpen && (
                  <div className="nav-dropdown-menu">
                    <a href="/courses" onClick={() => { setOpen(false); setCoursesOpen(false); }}>
                      <FaBookOpen /> {t('navDropdown.knowledgeBase')}
                    </a>
                    <button className="nav-dropdown-item-btn" onClick={() => { setOpen(false); setCoursesOpen(false); setShowAILearning(true); }}>
                      <FaRobot /> {t('navDropdown.aiLearning')}
                    </button>
                  </div>
                )}
              </li>
              <li><a href="/#about" className={active === 'about' ? 'active' : ''} onClick={() => setOpen(false)}>{t('nav.about')}</a></li>
              <li><a href="/#contact" className={active === 'contact' ? 'active' : ''} onClick={() => setOpen(false)}>{t('nav.contact')}</a></li>
              <li className="nav-cta-wrap"><button className="nav-cta-btn" onClick={() => { setOpen(false); onLoginClick(); }}><FaUser /> {t('nav.signIn')}</button></li>
            </>
          )}
        </ul>
        <button className="nav-lang-btn" onClick={toggleLang} title={lang === 'en' ? 'Switch to Kinyarwanda' : 'Switch to English'}>
          <FaGlobe /> {lang === 'en' ? 'RW' : 'EN'}
        </button>
        <button className={`hamburger${open ? ' open' : ''}`} aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        {open && <div className="nav-overlay" onClick={() => setOpen(false)} />}
      </nav>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      <AILearningModal open={showAILearning} onClose={() => setShowAILearning(false)} />
    </header>
  );
}
