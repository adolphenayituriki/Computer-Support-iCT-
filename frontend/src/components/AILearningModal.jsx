import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../LanguageContext';
import { FaTimes, FaSchool, FaUniversity, FaArrowRight } from 'react-icons/fa';

export default function AILearningModal({ open, onClose }) {
  const { t } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ai-modal-close" onClick={onClose}><FaTimes /></button>
        <h2>{t('aiModal.title')}</h2>
        <p className="ai-modal-sub">{t('aiModal.subtitle')}</p>
        <div className="ai-modal-options">
          <button className="ai-modal-card" onClick={() => handleSelect('/ai-learning')}>
            <div className="ai-modal-card-icon primary"><FaSchool /></div>
            <h3>{t('aiModal.primaryTitle')}</h3>
            <p>{t('aiModal.primaryDesc')}</p>
            <span className="ai-modal-tag">{t('aiModal.primaryTag')}</span>
            <span className="ai-modal-btn">{t('aiModal.primaryBtn')} <FaArrowRight /></span>
          </button>
          <button className="ai-modal-card" onClick={() => handleSelect('/ai-learning')}>
            <div className="ai-modal-card-icon university"><FaUniversity /></div>
            <h3>{t('aiModal.universityTitle')}</h3>
            <p>{t('aiModal.universityDesc')}</p>
            <span className="ai-modal-tag">{t('aiModal.universityTag')}</span>
            <span className="ai-modal-btn">{t('aiModal.universityBtn')} <FaArrowRight /></span>
          </button>
        </div>
      </div>
    </div>
  );
}
