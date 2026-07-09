import { useState } from 'react';
import { FaTimes, FaHome, FaTicketAlt, FaLightbulb, FaComments, FaUserTie, FaEnvelope } from 'react-icons/fa';

const helpTopics = [
  {
    key: 'overview',
    icon: <FaHome />,
    label: 'Overview',
    content: (
      <div className="help-content">
        <h3>Welcome to the Dashboard</h3>
        <p>This is your central hub for managing support requests, sharing ideas, and communicating with our team.</p>
        <ul>
          <li><strong>Support Tickets</strong> — Report issues and track their progress.</li>
          <li><strong>Suggestions</strong> — Propose new services or improvements.</li>
          <li><strong>Messages</strong> — Chat directly with support staff.</li>
        </ul>
        <p>Use the sidebar to navigate between sections. The sidebar can be collapsed for more screen space using the arrow button on its edge.</p>
      </div>
    ),
  },
  {
    key: 'tickets',
    icon: <FaTicketAlt />,
    label: 'Tickets',
    content: (
      <div className="help-content">
        <h3>Support Tickets</h3>
        <p>Submit a ticket describing your issue in detail. Include relevant information such as device type, error messages, and steps to reproduce.</p>
        <h4>Ticket Statuses</h4>
        <ul>
          <li><strong>Open</strong> — Your ticket has been submitted and is awaiting review.</li>
          <li><strong>In Progress</strong> — A team member is actively working on your issue.</li>
          <li><strong>Resolved</strong> — The issue has been addressed.</li>
          <li><strong>Closed</strong> — The ticket is finalized. You can reopen it if needed.</li>
        </ul>
        <h4>Tips</h4>
        <ul>
          <li>Use a clear, descriptive title.</li>
          <li>Select the correct category (Hardware, Software, Network, etc.).</li>
          <li>You can reply to your ticket to provide updates or additional info.</li>
        </ul>
      </div>
    ),
  },
  {
    key: 'suggestions',
    icon: <FaLightbulb />,
    label: 'Suggestions',
    content: (
      <div className="help-content">
        <h3>Suggestions</h3>
        <p>Have an idea for a new service or improvement? We want to hear it.</p>
        <ul>
          <li>Submit a suggestion with a clear title and detailed description.</li>
          <li>Our team reviews every submission.</li>
          <li>You can track the status of your suggestion and discuss it with our team.</li>
        </ul>
      </div>
    ),
  },
  {
    key: 'messages',
    icon: <FaComments />,
    label: 'Messages',
    content: (
      <div className="help-content">
        <h3>Messages</h3>
        <p>The Messages section lets you chat directly with support staff in real-time.</p>
        <ul>
          <li>Start a conversation by selecting a staff member.</li>
          <li>Messages are private between you and the recipient.</li>
          <li>Use this for quick questions or follow-ups on existing tickets.</li>
        </ul>
      </div>
    ),
  },
  {
    key: 'team',
    icon: <FaUserTie />,
    label: 'Team',
    content: (
      <div className="help-content">
        <h3>Team Dashboard</h3>
        <p>If you're a team member, you'll have access to additional tools:</p>
        <ul>
          <li><strong>Overview</strong> — View your profile and key metrics.</li>
          <li><strong>Beneficiaries</strong> — Manage assigned beneficiaries and update their status.</li>
          <li><strong>All Tickets</strong> — View and manage all support tickets in the system.</li>
        </ul>
      </div>
    ),
  },
  {
    key: 'contact',
    icon: <FaEnvelope />,
    label: 'Contact',
    content: (
      <div className="help-content">
        <h3>Need More Help?</h3>
        <p>If you can't find what you're looking for, reach out to us directly:</p>
        <ul>
          <li>Submit a support ticket describing your issue.</li>
          <li>Use the Messages section to chat with a staff member.</li>
          <li>Check our public pages for news and announcements.</li>
        </ul>
        <p style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>We typically respond within 24 hours during business days.</p>
      </div>
    ),
  },
];

export default function HelpModal({ onClose }) {
  const [tab, setTab] = useState('overview');
  const activeTopic = helpTopics.find((t) => t.key === tab);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="settings-close" onClick={onClose}><FaTimes /></button>
        <h2 className="settings-title">Help & Support</h2>

        <div className="settings-tabs">
          {helpTopics.map((t) => (
            <button
              key={t.key}
              className={`settings-tab${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="help-tab-content">
          {activeTopic?.content}
        </div>
      </div>
    </div>
  );
}
