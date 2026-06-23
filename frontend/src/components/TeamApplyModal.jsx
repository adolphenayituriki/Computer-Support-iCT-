import { useState } from 'react';
import { useToast } from '../ToastContext';
import API_BASE from '../api';

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
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD / Doctorate',
  'Self-Taught',
];

const involvementTypes = [
  { value: 'member', label: 'Join as a Team Member' },
  { value: 'partner', label: 'Partner with CS hub (iCT)' },
  { value: 'volunteer', label: 'Volunteer Occasionally' },
  { value: 'mentor', label: 'Become a Mentor' },
];

export default function TeamApplyModal({ onClose }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    location: '',
    involvement: 'member',
    skills: [],
    message: '',
  });
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`${API_BASE}/api/team/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message);
        setForm({
          name: '',
          email: '',
          phone: '',
          education: '',
          location: '',
          involvement: 'member',
          skills: [],
          message: '',
        });
      } else {
        setFeedback({ text: data.error || 'Something went wrong.', error: true });
      }
    } catch {
      setFeedback({ text: 'Could not reach the server.', error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-auth team-form">
      <div className="auth-logo">
        <span className="logo-cs">CS H</span><span className="logo-ub">ub</span>{' '}
        <span className="logo-paren">(</span><span className="logo-ub">i</span>
        <span className="logo-ct">CT</span><span className="logo-paren">)</span>
        <small>COMPUTER SUPPORT</small>
      </div>
      <h2>Join Our Team</h2>
      <p className="auth-sub">We are looking for passionate people to join, partner, or volunteer with CS hub (iCT)</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email Address *"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <select
          value={form.education}
          onChange={(e) => setForm({ ...form, education: e.target.value })}
          required
        >
          <option value="">— Level of Education * —</option>
          {educationLevels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Your Location (e.g., Kigali, Huye) *"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />

        <select
          value={form.involvement}
          onChange={(e) => setForm({ ...form, involvement: e.target.value })}
        >
          {involvementTypes.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <div className="skills-group">
          <label>Your ICT / Computer Skills (select all that apply)</label>
          <div className="skills-grid">
            {skillOptions.map((skill) => (
              <label key={skill} className={`skill-chip${form.skills.includes(skill) ? ' selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={form.skills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                />
                {skill}
              </label>
            ))}
          </div>
        </div>

        <textarea
          rows="4"
          placeholder="Why do you want to join or partner with us? Tell us about yourself... *"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />

        {feedback && (
          <p className="form-feedback" style={{ color: feedback.error ? '#d32f2f' : '#2e7d32' }}>
            {feedback.text}
          </p>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>

      <p className="auth-footer" style={{ marginTop: '1rem' }}>
        <button className="btn-link" onClick={onClose}>Close</button>
      </p>
    </div>
  );
}
