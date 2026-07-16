import { useState } from 'react';
import API_BASE from '../api';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaPenFancy, FaCheckCircle, FaSpinner, FaExclamationTriangle, FaRocket, FaTimes, FaLaptopCode, FaWifi, FaPaintBrush, FaChartLine, FaCog, FaLightbulb, FaShareAlt } from 'react-icons/fa';

const LEVELS = [
  { id: 'beginner', label: 'Beginner', emoji: '🌱', desc: 'Just getting started' },
  { id: 'student', label: 'Student', emoji: '📚', desc: 'Building skills' },
  { id: 'professional', label: 'Professional', emoji: '💼', desc: 'Leveling up' },
];

const SUGGESTIONS = [
  { icon: FaLaptopCode, text: 'Build a website' },
  { icon: FaPaintBrush, text: 'Graphic design' },
  { icon: FaChartLine, text: 'Excel mastery' },
  { icon: FaWifi, text: 'Google suits tools' },
  { icon: FaCog, text: 'Ms. Offices' },
  { icon: FaLightbulb, text: 'Digital marketing' },
];

export default function SessionInvite({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', level: '', topic: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

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
        body: JSON.stringify({ ...form, interests: [], suggestion: form.topic }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed.'); setSubmitting(false); return; }
      setEmailSent(data.emailSent || false);
      setSubmitted(true);
    } catch {
      setError('Could not connect to server. Please try again.');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="session-modal-body session-modal-thanks">
        <div className="session-thanks-inner">
          <div className="session-success">
            <div className="session-success-anim"><FaCheckCircle /></div>
            <h2>You're in, {form.name.split(' ')[0]}!</h2>
            <p>We've got your registration. Expect an email at <strong>{form.email}</strong> with session details soon.</p>
            <div className="session-success-actions">
              <a href="https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN" target="_blank" rel="noopener noreferrer" className="session-wa-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Join WhatsApp Group
              </a>
              <button className="session-done-btn" onClick={onClose}>Done</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="session-modal-body">
      <button className="session-modal-close" onClick={onClose} title="Close"><FaTimes /></button>

      <div className="session-modal-header">
        <div className="session-header-bg">
          <div className="session-header-orb session-header-orb-1"></div>
          <div className="session-header-orb session-header-orb-2"></div>
          <div className="session-header-dots"></div>
        </div>
        <div className="session-header-content">
          <div className="session-header-top-row">
            <div className="session-header-badge">
              <FaRocket /> Free Session
            </div>
            <button className="session-share-btn" title="Share this" onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Free ICT Session', text: 'Check out this free learning session!', url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}><FaShareAlt /></button>
          </div>
          <h2>Learn anything ICT — <span>for free</span></h2>
          <p>Tell us what you want to learn and we'll build a session around it.</p>
        </div>
      </div>

      <form className="session-form" onSubmit={handleSubmit}>
        <div className="session-form-row">
          <div className="session-form-group">
            <label><FaUser /> Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
          </div>
          <div className="session-form-group">
            <label><FaEnvelope /> Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
          </div>
        </div>

        <div className="session-form-row">
          <div className="session-form-group">
            <label><FaPhone /> Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+250 7XX XXX XXX" />
          </div>
          <div className="session-form-group">
            <label><FaGraduationCap /> Level *</label>
            <div className="session-levels">
              {LEVELS.map((l) => (
                <button key={l.id} type="button" className={`session-level-btn ${form.level === l.id ? 'active' : ''}`} onClick={() => setForm({ ...form, level: l.id })}>
                  <span className="session-level-emoji">{l.emoji}</span>
                  <span className="session-level-label">{l.label}</span>
                  <span className="session-level-desc">{l.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="session-form-group session-topic-group">
          <label><FaPenFancy /> What do you want to learn?</label>
          <textarea
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            placeholder="e.g. How to build a website, Excel for accounting, graphic design, etc..."
            rows={3}
          />
          <div className="session-suggestions">
            <span className="session-suggestions-label">Popular topics:</span>
            <div className="session-suggestions-list">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} type="button" className="session-suggestion-chip" onClick={() => setForm({ ...form, topic: form.topic ? form.topic + ', ' + s.text : s.text })}>
                  <s.icon /> {s.text}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="session-error"><FaExclamationTriangle /> {error}</p>}

        <button type="submit" className="session-submit" disabled={submitting}>
          {submitting ? <><FaSpinner className="spin" /> Submitting...</> : <><FaRocket /> Register Now</>}
        </button>

        <p className="session-form-footer-note">No spam, no payment — just free learning sessions tailored to you.</p>
      </form>
    </div>
  );
}
