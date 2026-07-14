import { useState } from 'react';
import { FaTimes, FaHome, FaTicketAlt, FaLightbulb, FaComments, FaUserTie, FaEnvelope, FaWhatsapp, FaPhone, FaSearch, FaChevronRight, FaQuestionCircle, FaRocket, FaShieldAlt, FaHeadset } from 'react-icons/fa';
import API_BASE from '../api';

const helpTopics = [
  {
    key: 'overview',
    icon: <FaHome />,
    color: '#3b82f6',
    label: 'Overview',
    title: 'Welcome to CS Hub',
    content: 'Your central hub for managing support requests, sharing ideas, and communicating with our team.',
    sections: [
      {
        heading: 'What you can do',
        items: [
          { icon: <FaTicketAlt />, title: 'Support Tickets', desc: 'Report issues and track their progress in real-time.' },
          { icon: <FaLightbulb />, title: 'Suggestions', desc: 'Propose new services or improvements to help us serve you better.' },
          { icon: <FaComments />, title: 'Messages', desc: 'Chat directly with our support staff for quick assistance.' },
        ],
      },
      {
        heading: 'Getting Started',
        tips: [
          'Use the sidebar to navigate between sections.',
          'Check the Analytics tab for an overview of your activity.',
          'Submit a ticket if you encounter any issues.',
        ],
      },
    ],
  },
  {
    key: 'tickets',
    icon: <FaTicketAlt />,
    color: '#f59e0b',
    label: 'Tickets',
    title: 'Support Tickets',
    content: 'Submit a ticket describing your issue in detail. Include relevant information such as device type, error messages, and steps to reproduce.',
    sections: [
      {
        heading: 'Ticket Statuses',
        items: [
          { color: '#f59e0b', title: 'Open', desc: 'Your ticket has been submitted and is awaiting review.' },
          { color: '#3b82f6', title: 'In Progress', desc: 'A team member is actively working on your issue.' },
          { color: '#10b981', title: 'Resolved', desc: 'The issue has been addressed successfully.' },
          { color: '#6b7280', title: 'Closed', desc: 'The ticket is finalized. You can reopen it if needed.' },
        ],
      },
      {
        heading: 'Tips for Better Support',
        tips: [
          'Use a clear, descriptive title for your ticket.',
          'Select the correct category (Hardware, Software, Network, etc.).',
          'Include screenshots or error messages when possible.',
          'You can reply to your ticket to provide updates or additional info.',
          'Mark tickets as resolved once your issue is fixed.',
        ],
      },
    ],
  },
  {
    key: 'suggestions',
    icon: <FaLightbulb />,
    color: '#8b5cf6',
    label: 'Suggestions',
    title: 'Suggestions',
    content: 'Have an idea for a new service or improvement? We value your feedback and review every submission.',
    sections: [
      {
        heading: 'How it works',
        tips: [
          'Submit a suggestion with a clear title and detailed description.',
          'Our team reviews every submission promptly.',
          'Track the status of your suggestion in the dashboard.',
          'Discuss and refine ideas directly with our team through messages.',
        ],
      },
    ],
  },
  {
    key: 'messages',
    icon: <FaComments />,
    color: '#10b981',
    label: 'Messages',
    title: 'Messages',
    content: 'The Messages section lets you chat directly with support staff in real-time for immediate assistance.',
    sections: [
      {
        heading: 'How it works',
        tips: [
          'Start a conversation by selecting a staff member.',
          'Messages are private between you and the recipient.',
          'Use this for quick questions or follow-ups on existing tickets.',
          'Your conversation history is saved for future reference.',
        ],
      },
    ],
  },
  {
    key: 'team',
    icon: <FaUserTie />,
    color: '#06b6d4',
    label: 'Team',
    title: 'Team Dashboard',
    content: 'If you are a team member, you have access to additional tools and features.',
    sections: [
      {
        heading: 'Team Features',
        items: [
          { icon: <FaHome />, title: 'Overview', desc: 'View your profile and key metrics at a glance.' },
          { icon: <FaUserTie />, title: 'Beneficiaries', desc: 'Manage assigned beneficiaries and update their status.' },
          { icon: <FaTicketAlt />, title: 'All Tickets', desc: 'View and manage all support tickets in the system.' },
        ],
      },
    ],
  },
  {
    key: 'contact',
    icon: <FaHeadset />,
    color: '#ef4444',
    label: 'Contact',
    title: 'Need More Help?',
    content: 'Our support team is here to help. Reach out through any of these channels.',
    sections: [
      {
        heading: 'Contact Options',
        contactOptions: [
          { icon: <FaPhone />, label: 'Call / WhatsApp', value: '+250 780 505 948', href: 'tel:+250780505948', color: '#10b981' },
          { icon: <FaWhatsapp />, label: 'WhatsApp Group', value: 'Join our community', href: 'https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN', color: '#25D366' },
          { icon: <FaEnvelope />, label: 'Support Ticket', value: 'Submit a ticket for any issue', action: 'ticket', color: '#3b82f6' },
        ],
      },
      {
        heading: 'Response Time',
        tips: [
          'We typically respond within 24 hours during business days.',
          'Urgent issues are prioritized and addressed immediately.',
          'Check the FAQ section for instant answers to common questions.',
        ],
      },
    ],
  },
];

export default function HelpModal({ onClose }) {
  const [tab, setTab] = useState('overview');
  const activeTopic = helpTopics.find((t) => t.key === tab);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <button className="help-close" onClick={onClose}><FaTimes /></button>

        <div className="help-header">
          <div className="help-header-icon">
            <FaQuestionCircle />
          </div>
          <div>
            <h2>Help & Support</h2>
            <p>Find answers and learn how to use CS Hub</p>
          </div>
        </div>

        <div className="help-sidebar">
          {helpTopics.map((t) => (
            <button
              key={t.key}
              className={`help-sidebar-item${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <span className="help-sidebar-icon" style={{ color: tab === t.key ? '#fff' : t.color }}>{t.icon}</span>
              <span className="help-sidebar-label">{t.label}</span>
              <FaChevronRight className="help-sidebar-arrow" />
            </button>
          ))}
        </div>

        <div className="help-body">
          <div className="help-body-header">
            <span className="help-body-icon" style={{ background: activeTopic?.color + '20', color: activeTopic?.color }}>{activeTopic?.icon}</span>
            <div>
              <h3>{activeTopic?.title}</h3>
              <p>{activeTopic?.content}</p>
            </div>
          </div>

          {activeTopic?.sections?.map((section, si) => (
            <div key={si} className="help-section">
              <h4>{section.heading}</h4>

              {section.items && (
                <div className="help-cards">
                  {section.items.map((item, ii) => (
                    <div key={ii} className="help-card">
                      <div className="help-card-icon" style={{ background: (item.color || activeTopic?.color) + '20', color: item.color || activeTopic?.color }}>
                        {item.icon || activeTopic?.icon}
                      </div>
                      <div className="help-card-text">
                        <strong>{item.title}</strong>
                        <span>{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.tips && (
                <ul className="help-tips">
                  {section.tips.map((tip, ti) => (
                    <li key={ti}>
                      <span className="help-tip-dot" style={{ background: activeTopic?.color }} />
                      {tip}
                    </li>
                  ))}
                </ul>
              )}

              {section.contactOptions && (
                <div className="help-contact-list">
                  {section.contactOptions.map((opt, ci) => (
                    <a
                      key={ci}
                      href={opt.href || '#'}
                      target={opt.href?.startsWith('http') ? '_blank' : undefined}
                      rel={opt.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="help-contact-item"
                      onClick={opt.action === 'ticket' ? (e) => { e.preventDefault(); onClose(); } : undefined}
                    >
                      <div className="help-contact-icon" style={{ background: opt.color + '20', color: opt.color }}>{opt.icon}</div>
                      <div className="help-contact-info">
                        <strong>{opt.label}</strong>
                        <span>{opt.value}</span>
                      </div>
                      <FaChevronRight className="help-contact-arrow" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
