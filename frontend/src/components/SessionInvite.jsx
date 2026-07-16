import { useState } from 'react';
import API_BASE from '../api';
import {
  FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaCheckCircle,
  FaLightbulb, FaSpinner, FaExclamationTriangle, FaRocket,
  FaDesktop, FaCog, FaWifi, FaCode, FaGlobe, FaMicrosoft,
  FaShieldAlt, FaBookOpen, FaTimes
} from 'react-icons/fa';

const INTERESTS = [
  { id: 'hardware', label: 'Computer Hardware', icon: <FaDesktop />, color: '#ef4444' },
  { id: 'software', label: 'Software & Installation', icon: <FaCog />, color: '#5694F7' },
  { id: 'networking', label: 'Networking & Internet', icon: <FaWifi />, color: '#10b981' },
  { id: 'programming', label: 'Programming', icon: <FaCode />, color: '#8b5cf6' },
  { id: 'webdev', label: 'Web Development', icon: <FaGlobe />, color: '#f59e0b' },
  { id: 'office', label: 'Microsoft Office', icon: <FaMicrosoft />, color: '#06b6d4' },
  { id: 'security', label: 'Digital Safety & Security', icon: <FaShieldAlt />, color: '#ec4899' },
  { id: 'literacy', label: 'Digital Literacy', icon: <FaBookOpen />, color: '#14b8a6' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'New to computers' },
  { id: 'student', label: 'Student', desc: 'Currently studying' },
  { id: 'professional', label: 'Professional', desc: 'Working professional' },
];

const HEAR_OPTIONS = ['Friend', 'Social Media', 'University/School', 'WhatsApp Group', 'Poster/Flyer', 'Other'];

export default function SessionInvite({ onClose }) {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', level: '', interests: [], suggestion: '', heardFrom: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const toggleInterest = (id) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(id) ? prev.interests.filter((i) => i !== id) : [...prev.interests, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!form.email.trim()) return setError('Please enter your email.');
    if (!form.level) return setError('Please select your level.');

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/session-invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        setSubmitting(false);
        return;
      }
      setEmailSent(data.emailSent || false);
      setSubmitted(true);
    } catch {
      setError('Could not connect to server. Please try again.');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="session-modal-body">
        <button className="session-modal-close" onClick={onClose} title="Close"><FaTimes /></button>
        <div className="session-success">
          <div className="session-success-icon"><FaCheckCircle /></div>
          <h2>You're Registered!</h2>
          <p>Thank you, <strong>{form.name}</strong>! You've been registered for our ICT Learning Session.</p>
          {emailSent && <p className="session-success-email">A confirmation email has been sent to <strong>{form.email}</strong>.</p>}
          <div className="session-success-next">
            <h4>What happens next?</h4>
            <ul>
              <li>We'll review your interests and level</li>
              <li>You'll receive session details via email</li>
              <li>Join our WhatsApp group for updates</li>
            </ul>
          </div>
          <a href="https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN" target="_blank" rel="noopener noreferrer" className="session-success-wa">
            Join WhatsApp Group
          </a>
          <button className="session-success-done" onClick={onClose}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="session-modal-body">
      <button className="session-modal-close" onClick={onClose} title="Close"><FaTimes /></button>

      <div className="session-modal-header">
        <div className="session-modal-badge">Free ICT Training</div>
        <h2>Register for <span>ICT Session</span></h2>
        <p>Learn computer skills, networking, programming, and more — it takes less than a minute.</p>
      </div>

      <div className="session-courses">
        <h3>What You'll Learn</h3>
        <div className="session-courses-grid">
          <div className="session-course-card"><FaDesktop /><h4>Hardware</h4></div>
          <div className="session-course-card"><FaCog /><h4>Software</h4></div>
          <div className="session-course-card"><FaWifi /><h4>Networking</h4></div>
          <div className="session-course-card"><FaCode /><h4>Programming</h4></div>
          <div className="session-course-card"><FaGlobe /><h4>Web Dev</h4></div>
          <div className="session-course-card"><FaMicrosoft /><h4>MS Office</h4></div>
          <div className="session-course-card"><FaShieldAlt /><h4>Security</h4></div>
          <div className="session-course-card"><FaBookOpen /><h4>Literacy</h4></div>
        </div>
      </div>

      <form className="session-form" onSubmit={handleSubmit}>
        <div className="session-form-row">
          <div className="session-form-group">
            <label><FaUser /> Full Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
          </div>
          <div className="session-form-group">
            <label><FaEnvelope /> Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
          </div>
        </div>

        <div className="session-form-row">
          <div className="session-form-group">
            <label><FaPhone /> Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+250 7XX XXX XXX" />
          </div>
          <div className="session-form-group">
            <label><FaGraduationCap /> Your Level *</label>
            <div className="session-levels">
              {LEVELS.map((l) => (
                <button key={l.id} type="button" className={`session-level-btn ${form.level === l.id ? 'active' : ''}`} onClick={() => setForm({ ...form, level: l.id })}>
                  <strong>{l.label}</strong>
                  <span>{l.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="session-form-group">
          <label>What are you interested in?</label>
          <div className="session-interests">
            {INTERESTS.map((i) => (
              <button key={i.id} type="button" className={`session-interest-btn ${form.interests.includes(i.id) ? 'active' : ''}`} onClick={() => toggleInterest(i.id)} style={{ '--accent': i.color }}>
                <span className="session-interest-icon">{i.icon}</span>
                <span>{i.label}</span>
                {form.interests.includes(i.id) && <FaCheckCircle className="session-interest-check" />}
              </button>
            ))}
          </div>
        </div>

        <div className="session-form-group">
          <label><FaLightbulb /> Suggestions (optional)</label>
          <textarea value={form.suggestion} onChange={(e) => setForm({ ...form, suggestion: e.target.value })} placeholder="What would you like us to teach?" rows={2} />
        </div>

        <div className="session-form-group">
          <label>How did you hear about us?</label>
          <div className="session-heard">
            {HEAR_OPTIONS.map((h) => (
              <button key={h} type="button" className={`session-heard-btn ${form.heardFrom === h ? 'active' : ''}`} onClick={() => setForm({ ...form, heardFrom: h })}>
                {h}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="session-error"><FaExclamationTriangle /> {error}</p>}

        <button type="submit" className="session-submit" disabled={submitting}>
          {submitting ? <><FaSpinner className="spin" /> Registering...</> : <><FaRocket /> Register for Session</>}
        </button>
      </form>
    </div>
  );
}
