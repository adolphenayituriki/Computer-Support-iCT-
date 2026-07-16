import { useState } from 'react';
import { FaPhoneAlt, FaTimes } from 'react-icons/fa';

export default function EmergencyButton() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`emergency-btn-wrapper ${expanded ? 'expanded' : ''}`}>
      {expanded && (
        <div className="emergency-btn-panel">
          <div className="emergency-btn-panel-header">
            <strong>24/7 Emergency Support</strong>
            <button onClick={() => setExpanded(false)}><FaTimes /></button>
          </div>
          <p>Need immediate help? Call or WhatsApp us anytime.</p>
          <a href="tel:+250780505948" className="emergency-btn-call">
            <FaPhoneAlt /> +250 780 505 948
          </a>
          <a href="https://wa.me/250780505948" target="_blank" rel="noopener noreferrer" className="emergency-btn-wa">
            WhatsApp Us
          </a>
        </div>
      )}
      <button className="emergency-btn-fab" onClick={() => setExpanded(!expanded)} title="24/7 Emergency Support">
        <FaPhoneAlt />
        {!expanded && <span className="emergency-btn-label">24/7 Support</span>}
      </button>
    </div>
  );
}
