import { useState } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaClock } from 'react-icons/fa';
import { useToast } from '../ToastContext';

export default function Contact() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [feedback, setFeedback] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = form;

    if (!name || !email || !message) {
      setFeedback({ text: 'Please fill in all fields.', error: true });
      return;
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message);
        setForm({ name: '', email: '', message: '' });
        setFeedback(null);
      } else {
        setFeedback({ text: data.error || 'Something went wrong.', error: true });
      }
    } catch {
      setFeedback({ text: 'Could not reach the server. Try again later.', error: true });
    }
  };

  return (
    <section id="contact" className="contact section-reveal">
      <h2>Get In Touch</h2>
      <p className="section-sub">Have a question or need help? Reach out to us.</p>
      <div className="contact-grid">
        <div className="contact-form-col">
          <form onSubmit={handleSubmit}>
            <input
              name="name"
              type="text"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
            />
            <textarea
              name="message"
              rows="5"
              placeholder="Tell us what you need help with..."
              value={form.message}
              onChange={handleChange}
            />
            <button type="submit" className="btn">Send Message</button>
          </form>
          {feedback && (
            <p className="form-feedback" style={{ color: feedback.error ? '#d32f2f' : '#2e7d32' }}>
              {feedback.text}
            </p>
          )}
        </div>

        <div className="contact-info-col">
          <h3>Contact Information</h3>

          <div className="contact-item">
            <span className="contact-icon"><FaMapMarkerAlt /></span>
            <div>
              <strong>Location</strong>
              <p>Anywhere in Rwanda</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon"><FaEnvelope /></span>
            <div>
              <strong>Email</strong>
              <p>support@cshub.rw</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon"><FaPhoneAlt /></span>
            <div>
              <strong>Phone</strong>
              <p>+250 78050 5948</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon"><FaClock /></span>
            <div>
              <strong>Hours</strong>
              <p>Monday — Friday: 8:00 AM — 5:00 PM<br />Saturday: 9:00 AM — 1:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
