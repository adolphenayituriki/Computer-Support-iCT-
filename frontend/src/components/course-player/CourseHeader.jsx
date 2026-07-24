import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBars, FaCheckCircle, FaCaretDown, FaBookOpen, FaThLarge, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';
import SettingsModal from '../SettingsModal';

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-orange-100 text-orange-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function CourseHeader({ course, activeLesson, courseProgress, isCompleted, onBack, onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef(null);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      <div className="relative z-30 border-b border-slate-200 bg-white/90 backdrop-blur-lg shrink-0">
        <div className="flex items-center gap-3 px-4 lg:px-6 h-14">
          <a href="/" className="flex items-center gap-2 shrink-0 no-underline">
            <img src="/LOGO IMAGE.png" alt="CS hub (iCT)" className="h-9 w-9 rounded-full object-cover shrink-0" loading="lazy" />
            <span className="hidden sm:block text-[1.1rem] font-[800] leading-tight">
              <span style={{ color: '#3b82f6' }}>CS H</span><span style={{ color: '#6b7280' }}>ub</span>{' '}
              <span style={{ color: '#6b7280', fontWeight: 600 }}>(</span><span style={{ color: '#6b7280' }}>i</span><span style={{ color: '#3b82f6' }}>CT</span><span style={{ color: '#6b7280', fontWeight: 600 }}>)</span>
              <small style={{ display: 'block', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.5px', color: '#6b7280' }}>COMPUTER SUPPORT</small>
            </span>
          </a>

          <div className="w-px h-5 bg-slate-200 shrink-0" />

          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-700 transition-colors shrink-0">
            <FaArrowLeft size={12} />
            <span className="text-[10px] font-medium hidden sm:inline">Back</span>
          </button>

          <button onClick={onToggleSidebar} className="lg:hidden inline-flex items-center text-slate-400 hover:text-slate-700 transition-colors shrink-0">
            <FaBars size={15} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-medium text-slate-400 truncate">{course.title}</div>
            <h1 className="text-sm font-bold text-slate-900 truncate">{activeLesson?.title || 'Course'}</h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeLesson?.readingTime && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                {activeLesson.readingTime}
              </span>
            )}

            <span className={`hidden sm:inline-flex text-[10px] font-semibold px-2.5 py-1 rounded-full ${DIFFICULTY_COLORS[course.difficulty] || DIFFICULTY_COLORS.beginner}`}>
              {course.difficulty}
            </span>

            <div className="hidden sm:flex items-center gap-2">
              <div className="w-20">
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${courseProgress}%`,
                      background: courseProgress >= 100 ? '#10b981' : 'linear-gradient(90deg, #FFCE08, #f59e0b)',
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: courseProgress >= 100 ? '#10b981' : '#FFCE08' }}>
                {courseProgress}%
              </span>
            </div>

            {isCompleted && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                <FaCheckCircle size={9} /> Done
              </span>
            )}

            {/* Profile Menu */}
            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 text-amber-900 text-[11px] font-bold flex items-center justify-center hover:shadow-md transition-shadow cursor-pointer"
                >
                  {initials}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                    </div>
                    <button
                      onClick={() => { setMenuOpen(false); navigate('/courses'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <FaBookOpen size={12} className="text-slate-400" /> All Courses
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <FaThLarge size={12} className="text-slate-400" /> Dashboard
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setShowSettings(true); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <FaCog size={12} className="text-slate-400" /> Settings
                    </button>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt size={12} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
