import { useState } from 'react';
import { useLang } from '../LanguageContext';
import { FaGithub, FaEnvelope, FaPhone, FaGlobe, FaLinkedin, FaArrowLeft, FaCheckCircle, FaExternalLinkAlt, FaCopy, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const collaborators = [
  {
    alias: 'AdolpheICT',
    alterName: 'NAYITURIKI Adolphe',
    realName: 'NAYITURIKI Adolphe',
    roleEn: 'Fullstack Developer',
    roleRw: 'Umukorera Ibikorwa Byose',
    projectEn: 'CS hub (iCT)',
    projectRw: 'CS hub (iCT)',
    bioEn: 'Full-stack architecture (React, Node.js, MongoDB), REST APIs, Tailwind CSS, platform development, backend APIs, frontend interfaces, etc.. and student support systems.',
    bioRw: "Imiterere y'ibikorwa byose (React, Node.js, MongoDB), REST APIs, Tailwind CSS, gutanga serivisi z'A CS hub, inyuma y'ibikorwa, n'uburambe bw'abanyeshuri.",
    photo: '/NAYITURIKI Adolphe.jpg',
    phone: '+250 780505948',
    email: 'www.nayituriki.com@gmail.com',
    portfolio: 'https://adolpheict.vercel.app/',
    github: 'https://github.com/adolphenayituriki',
    status: 'active',
    verified: true,
  },
  {
    alias: 'EvodeLabs(EvodeNuby)',
    alterName: 'Evode MUYISINGIZEMWESE',
    realName: 'MUYISINGIZEMWESE Evode',
    roleEn: 'Lead Software Engineer',
    roleRw: "Umuyobozi w'Ubuhinduzi",
    projectEn: 'EvodeLabs',
    projectRw: 'EvodeLabs',
    bioEn: 'Full-stack architecture (React, Nodejs), AI integration, chatbot engine, dashboard, auto-ticketing student issues, etc.. & report system.',
    bioRw: "Imiterere y'ibikorwa byose (React, Laravel), kwegera AI, injini ya chatbot, dashboard, gutegura otomatike amakosa y'abanyeshuri n'isuzuma.",
    photo: '/MUYISINGIZEMWESE EVODE.jpg',
    phone: '+250 791783308',
    email: 'evodemuyisingize@gmail.com',
    github: 'https://github.com/EVODENUBY',
    portfolio: 'https://evodenuby.vercel.app/',
    linkedin: '#',
    status: 'active',
    verified: true,
  },
];

function CopyableContact({ icon: Icon, label, value, color, type }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRowClick = (e) => {
    e.preventDefault();
    const href = type === 'email' ? `mailto:${value}` : `tel:${value.replace(/\s/g, '')}`;
    window.location.href = href;
  };

  return (
    <div className="collab-info-row" onClick={handleRowClick}>
      <span className="collab-info-icon" style={{ background: color }}><Icon /></span>
      <span className="collab-info-text">
        <span className="collab-info-label">{label}</span>
        <span className="collab-info-value">{value}</span>
      </span>
      <button className={`collab-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} type="button" title="Copy">
        {copied ? <FaCheck /> : <FaCopy />}
      </button>
    </div>
  );
}

export default function CollaboratorsPage() {
  const { lang } = useLang();
  const navigate = useNavigate();

  return (
    <section className="collab-page">
      <div className="container">
        <button className="collab-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> {lang === 'rw' ? 'Subira inyuma' : 'Go Back'}
        </button>

        <div className="collab-header">
          <h1 className="collab-title">
            {lang === 'rw' ? 'Abadukorera Inyuma' : 'Behind the Scene'}
          </h1>
          <p className="collab-subtitle">
            {lang === 'rw'
              ? "Abadufashije kubaka CS hub (iCT) — abana bose bafite uruhare mu iterambere ry'uru rwego."
              : 'The people who make CS hub (iCT) possible — each playing a vital role in building this platform.'}
          </p>
        </div>

        <div className="collab-grid">
          {collaborators.map((c, idx) => (
            <div className="collab-card-wrap" key={c.realName}>
              {idx > 0 && <div className="collab-zigzag"><div className="collab-zigzag-line" /></div>}
              <div className="collab-card">
                <div className="collab-card-header">
                  <div className="collab-avatar-wrap">
                    <img src={encodeURI(c.photo)} alt={c.realName} className="collab-avatar" />
                    <span className={`collab-status-dot ${c.status}`} />
                  </div>
                  <div className="collab-header-info">
                    <div className="collab-name-row">
                      <h3 className="collab-name">{c.alias}</h3>
                      {c.verified && <FaCheckCircle className="collab-verified" />}
                    </div>
                    <span className="collab-role-badge">{lang === 'rw' ? c.roleRw : c.roleEn}</span>
                    <span className="collab-company-badge">{lang === 'rw' ? c.projectRw : c.projectEn}</span>
                  </div>
                </div>

                <div className="collab-card-divider" />
                <p className="collab-bio">{lang === 'rw' ? c.bioRw : c.bioEn}</p>
                <div className="collab-card-divider" />

                <div className="collab-links">
                  {c.portfolio && (
                    <a href={c.portfolio} target="_blank" rel="noopener noreferrer" className="collab-link-pill">
                      <FaGlobe /> Portfolio <FaExternalLinkAlt className="collab-link-ext" />
                    </a>
                  )}
                  {c.github && (
                    <a href={c.github} target="_blank" rel="noopener noreferrer" className="collab-link-pill">
                      <FaGithub /> GitHub <FaExternalLinkAlt className="collab-link-ext" />
                    </a>
                  )}
                  {c.linkedin && (
                    <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="collab-link-pill">
                      <FaLinkedin /> LinkedIn <FaExternalLinkAlt className="collab-link-ext" />
                    </a>
                  )}
                </div>

                <div className="collab-card-divider" />

                <div className="collab-contact-section">
                  <CopyableContact icon={FaEnvelope} label="Email" value={c.email} color="#eef2ff" type="email" />
                  <CopyableContact icon={FaPhone} label="Phone" value={c.phone} color="#f0fdf4" type="phone" />
                </div>

                <div className="collab-card-footer">
                  <div className="collab-footer-avatar"><img src={encodeURI(c.photo)} alt="" /></div>
                  <div className="collab-footer-info">
                    <span className="collab-footer-name">{c.realName}</span>
                    <span className={`collab-footer-status ${c.status}`}>{c.status === 'active' ? 'Active' : 'Available'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="collab-mini-footer">
        <div className="collab-mini-footer-inner">
          <span className="collab-mini-footer-logo">CS hub <span>(iCT)</span></span>
          <span className="collab-mini-footer-sep">|</span>
          <span className="collab-mini-footer-text">Built with passion by our team</span>
          <span className="collab-mini-footer-sep">|</span>
          <a href="mailto:cshub.rw@gmail.com" className="collab-mini-footer-link">cshub.rw@gmail.com</a>
          <span className="collab-mini-footer-sep">|</span>
          <a href="tel:+250780505948" className="collab-mini-footer-link">+250 780 505 948</a>
        </div>
        <p className="collab-mini-footer-copy">&copy; {new Date().getFullYear()} CS hub (iCT). All rights reserved.</p>
      </footer>
    </section>
  );
}
