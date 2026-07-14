import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { FaTimes, FaPaperPlane, FaSpinner, FaCheckCircle, FaPhone, FaWhatsapp, FaTicketAlt, FaComments } from 'react-icons/fa';
import API_BASE from '../api';

const token = () => localStorage.getItem('cshub_token');

const SERVICE_DETAILS = {
  'Virus Removal': {
    description: 'Complete virus and malware removal from your computer. We scan, detect, and eliminate all threats including trojans, ransomware, spyware, and adware to restore your system to full health.',
    features: [
      'Full system scan with professional tools',
      'Trojan, ransomware & spyware removal',
      'Browser hijacker cleanup',
      'Real-time protection setup',
      'Security software recommendation',
      'Post-cleanup system optimization',
    ],
    estimatedTime: '30–60 minutes',
    category: 'virus',
  },
  'Office Install': {
    description: 'Professional installation of Microsoft Office suite including Word, Excel, PowerPoint, Outlook, and Access. We handle activation, updates, and configuration for your specific needs.',
    features: [
      'Microsoft Office 365 / 2019 / 2021 installation',
      'License activation & verification',
      'All apps: Word, Excel, PowerPoint, Outlook',
      'Custom toolbar & preference setup',
      'Cloud sync configuration (OneDrive)',
      'Training on key features',
    ],
    estimatedTime: '20–40 minutes',
    category: 'software',
  },
  'Security Setup': {
    description: 'Complete security audit and setup for your computer. We configure antivirus, firewall, encryption, and privacy settings to keep your data safe from online threats.',
    features: [
      'Antivirus installation & configuration',
      'Windows Defender optimization',
      'Firewall rule setup',
      'Disk encryption (BitLocker) guidance',
      'Browser security hardening',
      'Privacy & data protection review',
    ],
    estimatedTime: '30–45 minutes',
    category: 'virus',
  },
  'Network Fix': {
    description: 'Diagnose and resolve all network connectivity issues including Wi-Fi problems, ethernet connections, router configuration, and internet speed optimization.',
    features: [
      'Wi-Fi connectivity troubleshooting',
      'Router & modem configuration',
      'DNS settings optimization',
      'Network speed diagnostics',
      'Printer & device sharing setup',
      'VPN configuration guidance',
    ],
    estimatedTime: '20–40 minutes',
    category: 'network',
  },
  'Hardware Upgrade': {
    description: 'Upgrade your computer\'s hardware for better performance. We help with RAM, storage, graphics cards, and other component upgrades with professional installation.',
    features: [
      'RAM upgrade (assessment + installation)',
      'SSD/HDD storage upgrade',
      'Graphics card recommendation & install',
      'Processor compatibility check',
      'Motherboard & power supply advice',
      'Post-upgrade performance testing',
    ],
    estimatedTime: '45–90 minutes',
    category: 'hardware',
  },
  'Peripheral Setup': {
    description: 'Set up and configure all your computer peripherals including printers, scanners, external drives, keyboards, mice, webcams, and other USB devices.',
    features: [
      'Printer setup (USB + Wi-Fi)',
      'Scanner & multifunction device config',
      'External storage device setup',
      'Webcam & microphone installation',
      'Game controller & specialty device setup',
      'Driver installation & troubleshooting',
    ],
    estimatedTime: '15–30 minutes',
    category: 'hardware',
  },
  'System Diagnostics': {
    description: 'Comprehensive system health check and diagnostics. We analyze your computer\'s performance, identify bottlenecks, and provide actionable recommendations for improvement.',
    features: [
      'Full hardware health assessment',
      'Performance bottleneck identification',
      'Disk health & SMART analysis',
      'Temperature & thermal monitoring',
      'Startup program optimization',
      'Detailed health report & recommendations',
    ],
    estimatedTime: '30–45 minutes',
    category: 'general',
  },
  'Email & Cloud': {
    description: 'Set up and configure email accounts and cloud storage solutions. We help with Gmail, Outlook, Google Drive, OneDrive, Dropbox, and more to keep your data accessible everywhere.',
    features: [
      'Gmail / Outlook account setup',
      'Email client configuration (Thunderbird, etc.)',
      'Google Drive / OneDrive setup',
      'File sync across devices',
      'Cloud backup strategy planning',
      'Email migration between providers',
    ],
    estimatedTime: '20–40 minutes',
    category: 'training',
  },
  'Data Backup': {
    description: 'Protect your important files with a reliable backup strategy. We set up automated backups to local drives, cloud storage, or both to ensure you never lose critical data.',
    features: [
      'Backup strategy assessment',
      'Local backup setup (external drives)',
      'Cloud backup configuration',
      'Automated scheduled backups',
      'Data recovery guidance',
      'Backup verification & testing',
    ],
    estimatedTime: '30–45 minutes',
    category: 'general',
  },
  'Remote Support': {
    description: 'Get instant help from our technicians without leaving your home. We connect securely to your computer to diagnose and fix issues in real-time via remote desktop tools.',
    features: [
      'Secure remote desktop connection',
      'Real-time issue diagnosis',
      'Software installation & updates',
      'Virus removal & security setup',
      'Performance optimization',
      'Follow-up support included',
    ],
    estimatedTime: '15–45 minutes',
    category: 'general',
  },
};

export default function ServiceModal({ service, onClose, onLoginClick }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [helpText, setHelpText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const details = SERVICE_DETAILS[service.label] || {
    description: 'Professional support for your computer needs.',
    features: ['Expert diagnosis', 'Quick resolution', 'Follow-up support'],
    estimatedTime: 'Varies',
    category: service.category || 'general',
  };

  const handleSubmit = async () => {
    if (!user) {
      if (onLoginClick) onLoginClick();
      return;
    }
    if (!helpText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          title: `${service.label} — Quick Help Request`,
          description: helpText.trim(),
          category: details.category,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        showToast('Help request submitted! Our team will respond shortly.');
      } else {
        showToast(data.error || 'Something went wrong.', 'error');
      }
    } catch {
      showToast('Could not reach the server.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="svc-modal-overlay" onClick={onClose}>
      <div className="svc-modal" onClick={(e) => e.stopPropagation()}>
        <button className="svc-modal-close" onClick={onClose}><FaTimes /></button>

        <div className="svc-modal-hero">
          <div className="svc-modal-icon">{service.icon}</div>
          <h2>{service.label}</h2>
          <span className="svc-modal-badge">{details.estimatedTime}</span>
        </div>

        <div className="svc-modal-body">
          <p className="svc-modal-desc">{details.description}</p>

          <div className="svc-modal-features">
            <h4>What's Included</h4>
            <ul>
              {details.features.map((f, i) => (
                <li key={i}><FaCheckCircle className="svc-feat-icon" /> {f}</li>
              ))}
            </ul>
          </div>

          <div className="svc-modal-help">
            <h4>{user ? 'Ask for Quick Help' : 'Sign in to request help'}</h4>
            {submitted ? (
              <div className="svc-modal-success">
                <FaCheckCircle size={36} />
                <p>Request Submitted Successfully!</p>
                <span>Your "{service.label}" help request has been created. Here's how to track it:</span>
                <div className="svc-modal-track-steps">
                  <div className="svc-modal-track-step">
                    <span className="svc-modal-track-num">1</span>
                    <div>
                      <strong>Go to Dashboard → Tickets</strong>
                      <span>Find your ticket in the tickets list with status "Open"</span>
                    </div>
                  </div>
                  <div className="svc-modal-track-step">
                    <span className="svc-modal-track-num">2</span>
                    <div>
                      <strong>Click to View & Reply</strong>
                      <span>Open the ticket to see admin responses and add messages</span>
                    </div>
                  </div>
                  <div className="svc-modal-track-step">
                    <span className="svc-modal-track-num">3</span>
                    <div>
                      <strong>Track Status Updates</strong>
                      <span>Watch for status changes: Open → In Progress → Resolved</span>
                    </div>
                  </div>
                </div>
                <div className="svc-modal-track-actions">
                  <button className="svc-modal-btn primary" onClick={() => { onClose(); navigate('/dashboard'); }}>
                    <FaTicketAlt /> Go to My Tickets
                  </button>
                  <button className="svc-modal-btn" onClick={onClose}>Close</button>
                </div>
              </div>
            ) : (
              <>
                <textarea
                  rows={4}
                  placeholder={user
                    ? `Describe your ${service.label.toLowerCase()} issue briefly...`
                    : 'Sign in to submit a help request...'}
                  value={helpText}
                  onChange={(e) => setHelpText(e.target.value)}
                  disabled={!user}
                />
                <div className="svc-modal-help-actions">
                  <button
                    className="svc-modal-btn primary"
                    onClick={handleSubmit}
                    disabled={submitting || !helpText.trim()}
                  >
                    {submitting ? <><FaSpinner className="spin" /> Submitting...</> : <><FaPaperPlane /> Submit Request</>}
                  </button>
                  {!user && (
                    <button className="svc-modal-btn" onClick={onLoginClick}>
                      Sign In to Continue
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="svc-modal-contact">
            <span>Need immediate help?</span>
            <a href="https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN" target="_blank" rel="noopener noreferrer" className="svc-modal-contact-link wa">
              <FaWhatsapp /> WhatsApp
            </a>
            <a href="tel:+250780505948" className="svc-modal-contact-link phone">
              <FaPhone /> +250 780 505 948
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
