import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaEye, FaEyeSlash, FaUserGraduate, FaChalkboardTeacher, FaTimes, FaRobot, FaArrowRight, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function AILearningAuthModal({ open, onClose }) {
  const { login, loginByPhone, register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tab, setTab] = useState('login');
  const [role, setRole] = useState('');
  const [loginMethod, setLoginMethod] = useState('email');
  const [registerMethod, setRegisterMethod] = useState('email');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ password: false, confirm: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!role) { setError('Please select your role.'); return; }
    setLoading(true);
    try {
      let data;
      if (loginMethod === 'email') {
        data = await login(form.email, form.password);
      } else {
        data = await loginByPhone(form.phone);
      }
      localStorage.setItem('cshub_ai_role', role);
      showToast(`Welcome back, ${data.user.name}!`);
      onClose();
      navigate('/ai-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!role) { setError('Please select your role.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const data = await register(form.name, form.email || undefined, form.password, form.phone || undefined);
      localStorage.setItem('cshub_ai_role', role);
      showToast(`Welcome, ${data.user.name}! Account created.`);
      onClose();
      navigate('/ai-dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 focus:bg-white";

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 pt-6 pb-10 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-32 h-32 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-300 rounded-full blur-3xl" />
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <FaTimes size={14} />
          </button>
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border border-white/20">
              <FaRobot size={30} className="text-white" />
            </div>
            <h2 className="text-xl font-extrabold text-white">AI Learning Platform</h2>
            <p className="text-sm text-blue-200 mt-1">Join as a Student or Teacher</p>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Role Selection */}
          <div className="flex gap-3 mb-5">
            <button
              className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${role === 'student' ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100' : 'border-slate-200 hover:border-slate-300'}`}
              onClick={() => setRole('student')}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === 'student' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <FaUserGraduate size={18} />
              </div>
              <div className="text-left">
                <span className={`text-sm font-bold block ${role === 'student' ? 'text-blue-600' : 'text-slate-600'}`}>Student</span>
                <span className="text-[10px] text-slate-400">Learn with AI tools</span>
              </div>
            </button>
            <button
              className={`flex-1 flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${role === 'teacher' ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100' : 'border-slate-200 hover:border-slate-300'}`}
              onClick={() => setRole('teacher')}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${role === 'teacher' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <FaChalkboardTeacher size={18} />
              </div>
              <div className="text-left">
                <span className={`text-sm font-bold block ${role === 'teacher' ? 'text-blue-600' : 'text-slate-600'}`}>Teacher</span>
                <span className="text-[10px] text-slate-400">Create & manage classes</span>
              </div>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
            <button className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => { setTab('login'); setError(''); }}>
              Sign In
            </button>
            <button className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => { setTab('register'); setError(''); }}>
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-center font-medium">{error}</div>
          )}

          {tab === 'login' ? (
            <>
              {/* Login method toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all border ${loginMethod === 'email' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  onClick={() => { setLoginMethod('email'); setError(''); }}
                >
                  <FaEnvelope size={13} /> Email
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all border ${loginMethod === 'phone' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  onClick={() => { setLoginMethod('phone'); setError(''); }}
                >
                  <FaPhone size={13} /> Phone
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                {loginMethod === 'email' ? (
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className={inputClass}
                  />
                ) : (
                  <input
                    type="tel"
                    placeholder="Phone number (e.g. 0780505948)"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    className={inputClass}
                  />
                )}
                <div className="relative">
                  <input
                    type={showPwd.password ? 'text' : 'password'}
                    placeholder={loginMethod === 'phone' ? 'No password needed — OTP sent to phone' : 'Password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={loginMethod === 'email'}
                    disabled={loginMethod === 'phone'}
                    className={`${inputClass} pr-10 ${loginMethod === 'phone' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {loginMethod === 'email' && (
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPwd({ ...showPwd, password: !showPwd.password })}>
                      {showPwd.password ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  )}
                </div>
                <button type="submit" disabled={loading || !role} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                  {loading ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>Sign In <FaArrowRight size={12} /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Register method toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all border ${registerMethod === 'email' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  onClick={() => { setRegisterMethod('email'); setError(''); }}
                >
                  <FaEnvelope size={13} /> Email
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all border ${registerMethod === 'phone' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  onClick={() => { setRegisterMethod('phone'); setError(''); }}
                >
                  <FaPhone size={13} /> Phone
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className={inputClass}
                />
                {registerMethod === 'email' ? (
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className={inputClass}
                  />
                ) : (
                  <input
                    type="tel"
                    placeholder="Phone number (e.g. 0780505948)"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    className={inputClass}
                  />
                )}
                <div className="relative">
                  <input
                    type={showPwd.password ? 'text' : 'password'}
                    placeholder="Password (min 6 chars)"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className={`${inputClass} pr-10`}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPwd({ ...showPwd, password: !showPwd.password })}>
                    {showPwd.password ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPwd.confirm ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={form.confirm}
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    required
                    className={`${inputClass} pr-10`}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })}>
                    {showPwd.confirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                <button type="submit" disabled={loading || !role} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                  {loading ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>Create Account <FaArrowRight size={12} /></>
                  )}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-slate-400 mt-4">
            {tab === 'login' ? (
              <>No account? <button onClick={() => { setTab('register'); setError(''); }} className="text-blue-600 font-semibold hover:underline">Register here</button></>
            ) : (
              <>Already have an account? <button onClick={() => { setTab('login'); setError(''); }} className="text-blue-600 font-semibold hover:underline">Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
