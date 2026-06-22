import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar({ onLoginClick, onRegisterClick }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <nav>
        <a href="/" className="logo">
          <img src="/final-logo.jpg" alt="CS hub (iCT)" className="logo-img" />
          <span className="logo-text">
            <span className="logo-cs">CS H</span><span className="logo-ub">ub</span> <span className="logo-paren">(</span><span className="logo-ub">i</span><span className="logo-ct">CT</span><span className="logo-paren">)</span>
            <small>COMPUTER SUPPORT</small>
          </span>
        </a>
        <ul className={`nav-links${open ? ' active' : ''}`}>
          <li><a href="/#home" className={active === 'home' ? 'active' : ''} onClick={() => setOpen(false)}>Home</a></li>
          <li><a href="/#services" className={active === 'services' ? 'active' : ''} onClick={() => setOpen(false)}>Services</a></li>
          <li><a href="/#about" className={active === 'about' ? 'active' : ''} onClick={() => setOpen(false)}>About</a></li>
          <li><a href="/#contact" className={active === 'contact' ? 'active' : ''} onClick={() => setOpen(false)}>Contact</a></li>
          {user ? (
            <>
              <li><a href="/dashboard" onClick={() => setOpen(false)}>Dashboard</a></li>
              {user.isAdmin && <li><a href="/admin" onClick={() => setOpen(false)}>Admin</a></li>}
              <li><button className="btn logout-btn" onClick={handleLogout}>Logout</button></li>
            </>
          ) : (
            <>
              <li>
                <button className="btn-link" onClick={() => { setOpen(false); onLoginClick(); }}>
                  Sign In
                </button>
              </li>
              <li>
                <button className="btn-link nav-cta" onClick={() => { setOpen(false); onRegisterClick(); }}>
                  Get Started
                </button>
              </li>
            </>
          )}
        </ul>
        <button className="hamburger" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          &#9776;
        </button>
      </nav>
    </header>
  );
}
