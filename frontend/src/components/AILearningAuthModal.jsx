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
        data = await loginByPhone(form.phone, form.password);
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

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 focus:bg-white";

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 px-4 pt-4 pb-5 text-center">
          <button onClick={onClose} className="absolute top-2 right-2 w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <FaTimes size={10} />
          </button>
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-2 border border-white/20">
            <FaRobot size={20} className="text-white" />
          </div>
          <h2 className="text-base font-extrabold text-white">AI Learning Platform</h2>
          <p className="text-[11px] text-blue-200 mt-0.5">Join as a Student or Teacher</p>
        </div>

        <div className="px-4 py-3">
          {/* Role Selection */}
          <div className="flex gap-2 mb-3">
            <button
              className={`flex-1 flex items-center gap-2 p-2.5 rounded-lg border transition-all ${role === 'student' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
              onClick={() => setRole('student')}
            >
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${role === 'student' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <FaUserGraduate size={12} />
              </div>
              <div className="text-left">
                <span className={`text-xs font-bold block leading-tight ${role === 'student' ? 'text-blue-600' : 'text-slate-600'}`}>Student</span>
                <span className="text-[9px] text-slate-400 leading-tight">Learn with AI tools</span>
              </div>
            </button>
            <button
              className={`flex-1 flex items-center gap-2 p-2.5 rounded-lg border transition-all ${role === 'teacher' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
              onClick={() => setRole('teacher')}
            >
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${role === 'teacher' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <FaChalkboardTeacher size={12} />
              </div>
              <div className="text-left">
                <span className={`text-xs font-bold block leading-tight ${role === 'teacher' ? 'text-blue-600' : 'text-slate-600'}`}>Teacher</span>
                <span className="text-[9px] text-slate-400 leading-tight">Create & manage classes</span>
              </div>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 mb-3">
            <button className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} onClick={() => { setTab('login'); setError(''); }}>
              Sign In
            </button>
            <button className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`} onClick={() => { setTab('register'); setError(''); }}>
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-600 text-center font-medium">{error}</div>
          )}

          {tab === 'login' ? (
            <>
              <div className="flex gap-1.5 mb-2">
                <button type="button" className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-semibold transition-all border ${loginMethod === 'email' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500'}`} onClick={() => { setLoginMethod('email'); setError(''); }}>
                  <FaEnvelope size={10} /> Email
                </button>
                <button type="button" className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-semibold transition-all border ${loginMethod === 'phone' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500'}`} onClick={() => { setLoginMethod('phone'); setError(''); }}>
                  <FaPhone size={10} /> Phone
                </button>
              </div>
              <form onSubmit={handleLogin} className="space-y-2">
                {loginMethod === 'email' ? (
                  <input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className={inputClass} />
                ) : (
                  <input type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className={inputClass} />
                )}
                <div className="relative">
                  <input type={showPwd.password ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className={`${inputClass} pr-8`} />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPwd({ ...showPwd, password: !showPwd.password })}>{showPwd.password ? <FaEyeSlash size={12} /> : <FaEye size={12} />}</button>
                </div>
                <button type="submit" disabled={loading || !role} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-40 flex items-center justify-center gap-1.5">
                  {loading ? <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> : <>Sign In <FaArrowRight size={10} /></>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex gap-1.5 mb-2">
                <button type="button" className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-semibold transition-all border ${registerMethod === 'email' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500'}`} onClick={() => { setRegisterMethod('email'); setError(''); }}>
                  <FaEnvelope size={10} /> Email
                </button>
                <button type="button" className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-semibold transition-all border ${registerMethod === 'phone' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500'}`} onClick={() => { setRegisterMethod('phone'); setError(''); }}>
                  <FaPhone size={10} /> Phone
                </button>
              </div>
              <form onSubmit={handleRegister} className="space-y-2">
                <input type="text" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} />
                {registerMethod === 'email' ? (
                  <input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className={inputClass} />
                ) : (
                  <input type="tel" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className={inputClass} />
                )}
                <div className="relative">
                  <input type={showPwd.password ? 'text' : 'password'} placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className={`${inputClass} pr-8`} />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPwd({ ...showPwd, password: !showPwd.password })}>{showPwd.password ? <FaEyeSlash size={12} /> : <FaEye size={12} />}</button>
                </div>
                <div className="relative">
                  <input type={showPwd.confirm ? 'text' : 'password'} placeholder="Confirm Password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required className={`${inputClass} pr-8`} />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPwd({ ...showPwd, confirm: !showPwd.confirm })}>{showPwd.confirm ? <FaEyeSlash size={12} /> : <FaEye size={12} />}</button>
                </div>
                <button type="submit" disabled={loading || !role} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-40 flex items-center justify-center gap-1.5">
                  {loading ? <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" /> : <>Create Account <FaArrowRight size={10} /></>}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-[11px] text-slate-400 mt-2.5">
            {tab === 'login' ? (
              <>No account? <button onClick={() => { setTab('register'); setError(''); }} className="text-blue-600 font-semibold hover:underline">Register</button></>
            ) : (
              <>Have an account? <button onClick={() => { setTab('login'); setError(''); }} className="text-blue-600 font-semibold hover:underline">Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
