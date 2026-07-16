import { useState } from 'react';
import { useToast } from '../ToastContext';
import API_BASE from '../api';
import { FaUserGraduate, FaChalkboardTeacher, FaBriefcase, FaUserTie, FaUsers, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaGraduationCap, FaLaptopCode, FaHandshake, FaStar, FaTimes } from 'react-icons/fa';

const skillOptions = [
  'Laptop & PC Repair',
  'Virus & Malware Removal',
  'Software Installation (Office, Browsers, Antivirus)',
  'Operating System (Windows, Linux, macOS)',
  'Network & WiFi Troubleshooting',
  'Hardware Upgrade & Diagnosis',
  'Battery & Charging Issues',
  'Screen & Keyboard Repair',
  'Basic Computer Literacy Training',
  'Internet Safety & Privacy Coaching',
  'Email & Cloud Storage Setup',
  'Study Tools & Productivity Tips',
  'Microsoft Office for Assignments',
  'Driver & Peripheral Setup',
  'Customer Support & Communication',
];

const educationLevels = [
  'High School',
  'Certificate',
  'Diploma',
  "Bachelor's Degree",
  'Self-Taught',
];

const involvementTypes = [
  { value: 'member', label: 'Join as a Team Member', icon: FaUserTie },
  { value: 'partner', label: 'Partner with CS hub (iCT)', icon: FaHandshake },
  { value: 'volunteer', label: 'Volunteer Occasionally', icon: FaStar },
  { value: 'mentor', label: 'Become a Mentor', icon: FaChalkboardTeacher },
];

const applicantTypes = [
  { value: 'student', label: 'Student', icon: FaUserGraduate },
  { value: 'teacher', label: 'Teacher / Lecturer', icon: FaChalkboardTeacher },
  { value: 'entrepreneur', label: 'Entrepreneur', icon: FaBriefcase },
  { value: 'employee', label: 'Employee', icon: FaUserTie },
  { value: 'other', label: 'Other', icon: FaUsers },
];

export default function TeamApplyModal({ onClose }) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    location: '', applicantType: 'student',
    education: '', involvement: 'member',
    skills: [], message: '',
  });
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/team/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        onClose();
      } else {
        showToast(data.error || 'Something went wrong.', 'error');
      }
    } catch {
      showToast('Could not reach the server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-auth team-form" style={{ padding: 0, maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={{ position: 'sticky', top: 0, background: '#0f172a', padding: '1.5rem 1.5rem 1rem', zIndex: 2, borderRadius: '12px 12px 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="auth-logo" style={{ marginBottom: '0.5rem' }}>
              <span className="logo-cs">CS H</span><span className="logo-ub">ub</span>{' '}
              <span className="logo-paren">(</span><span className="logo-ub">i</span><span className="logo-ct">CT</span><span className="logo-paren">)</span>
              <small>COMPUTER SUPPORT</small>
            </div>
            <h2 style={{ margin: '0.25rem 0 0.25rem', color: '#f8fafc', fontSize: '1.3rem' }}>Join Our Team</h2>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>Tell us about yourself and how you'd like to contribute.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}><FaTimes size={20} /></button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: step >= s ? '#FFCE08' : '#1e293b', transition: 'background 0.3s' }} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
        {step === 1 && (
          <>
            <h3 style={{ margin: '0 0 1rem', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaUser style={{ color: '#FFCE08' }} /> Personal Information
            </h3>
            <div className="form-row">
              <div style={{ position: 'relative', flex: 1 }}>
                <FaUser style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.85rem' }} />
                <input type="text" placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ paddingLeft: '2.2rem' }} />
              </div>
              <div style={{ position: 'relative', flex: 1 }}>
                <FaEnvelope style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.85rem' }} />
                <input type="email" placeholder="Email Address *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={{ paddingLeft: '2.2rem' }} />
              </div>
            </div>
            <div className="form-row">
              <div style={{ position: 'relative', flex: 1 }}>
                <FaPhone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.85rem' }} />
                <input type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ paddingLeft: '2.2rem' }} />
              </div>
              <div style={{ position: 'relative', flex: 1 }}>
                <FaMapMarkerAlt style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.85rem' }} />
                <input type="text" placeholder="Your Location (e.g., Kigali, Musanze) *" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required style={{ paddingLeft: '2.2rem' }} />
              </div>
            </div>

            <h3 style={{ margin: '1.5rem 0 0.75rem', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaGraduationCap style={{ color: '#FFCE08' }} /> Background
            </h3>
            <div className="form-row">
              <select value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} style={{ flex: 1 }}>
                <option value="">— Highest Education —</option>
                {educationLevels.map((level) => (<option key={level} value={level}>{level}</option>))}
              </select>
              <select value={form.applicantType} onChange={(e) => setForm({ ...form, applicantType: e.target.value })} style={{ flex: 1 }}>
                <option value="student">I am a Student</option>
                <option value="teacher">Teacher / Lecturer</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="employee">Employee</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {applicantTypes.map((t) => {
                const Icon = t.icon;
                const selected = form.applicantType === t.value;
                return (
                  <button key={t.value} type="button" onClick={() => setForm({ ...form, applicantType: t.value })}
                    style={{
                      flex: 1, minWidth: '100px', padding: '0.6rem 0.5rem', borderRadius: '10px', border: selected ? '1.5px solid #FFCE08' : '1px solid rgba(255,255,255,0.12)',
                      background: selected ? 'rgba(255,206,8,0.12)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                      fontSize: '0.78rem', fontWeight: selected ? 600 : 400, color: selected ? '#FFCE08' : '#94a3b8',
                    }}
                  >
                    <Icon size={20} style={{ display: 'block', margin: '0 auto 0.25rem', color: selected ? '#FFCE08' : '#64748b' }} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button type="button" className="btn" onClick={() => setStep(2)}>Next: Skills & Interests →</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaLaptopCode style={{ color: '#FFCE08' }} /> Your ICT Skills
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.75rem' }}>Select all that apply — don't worry if you're just starting out!</p>
            <div className="skills-grid" style={{ marginBottom: '1.5rem' }}>
              {skillOptions.map((skill) => (
                <label key={skill} className={`skill-chip${form.skills.includes(skill) ? ' selected' : ''}`}>
                  <input type="checkbox" checked={form.skills.includes(skill)} onChange={() => toggleSkill(skill)} />
                  {skill}
                </label>
              ))}
            </div>

            <h3 style={{ margin: '0 0 0.75rem', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaHandshake style={{ color: '#FFCE08' }} /> How You Want to Contribute
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {involvementTypes.map((t) => {
                const Icon = t.icon;
                const selected = form.involvement === t.value;
                return (
                  <label key={t.value} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                    borderRadius: '10px', border: selected ? '1.5px solid #FFCE08' : '1px solid rgba(255,255,255,0.12)',
                    background: selected ? 'rgba(255,206,8,0.12)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <input type="radio" name="involvement" value={t.value} checked={selected} onChange={(e) => setForm({ ...form, involvement: e.target.value })} style={{ accentColor: '#FFCE08' }} />
                    <Icon size={18} style={{ color: selected ? '#FFCE08' : '#64748b' }} />
                    <div>
                      <div style={{ fontWeight: selected ? 600 : 400, fontSize: '0.9rem', color: selected ? '#FFCE08' : '#e2e8f0' }}>{t.label}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button type="button" className="btn" onClick={() => setStep(3)}>Next: Message →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaStar style={{ color: '#FFCE08' }} /> Why Join Us?
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
              Tell us about yourself, your motivation, and what you hope to bring to the team.
            </p>
            <textarea rows="5" placeholder="Why do you want to join or partner with us? Share your story... *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required style={{ marginBottom: '1rem' }} />

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#94a3b8', lineHeight: '1.7' }}>
              <strong style={{ color: '#e2e8f0' }}>Summary</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem 1rem', marginTop: '0.5rem' }}>
                <span>Name: {form.name || '—'}</span>
                <span>Email: {form.email || '—'}</span>
                <span>Location: {form.location || '—'}</span>
                <span>Type: {applicantTypes.find((t) => t.value === form.applicantType)?.label || '—'}</span>
                <span>Involvement: {involvementTypes.find((t) => t.value === form.involvement)?.label || '—'}</span>
                <span>Skills: {form.skills.length} selected</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? <><span className="btn-spinner"></span> Submitting...</> : 'Submit Application'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
