import { FaTimes, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../LanguageContext';

export default function BehindTheScenePopup({ open, onClose }) {
  const navigate = useNavigate();
  const { lang } = useLang();

  if (!open) return null;

  const handleExplore = () => {
    onClose();
    navigate('/collaborators');
  };

  return (
    <>
      <div className="bts-overlay" onClick={onClose} />
      <div className="bts-popup">
        <button className="bts-close" onClick={onClose}><FaTimes /></button>
        <div className="bts-content">
          <div className="bts-icon-wrap">
            <FaUsers className="bts-icon" />
          </div>
          <h2 className="bts-title">
            {lang === 'rw' ? 'Wifuza kumenya abadukorera inyuma?' : 'Want to meet the people behind CS hub?'}
          </h2>
          <p className="bts-desc">
            {lang === 'rw'
              ? 'Dufise urwego rwa banyeshuri n\'abahanga bafite uburambe mu ikoranabuhanga badufashije kubaka iyi serivisi.'
              : 'Our team of passionate developers and tech enthusiasts built CS hub from the ground up to serve you better.'}
          </p>
          <button className="bts-cta" onClick={handleExplore}>
            <FaUsers />
            {lang === 'rw' ? 'Raba abadukorera inyuma' : 'Meet the Team'}
          </button>
        </div>
      </div>
    </>
  );
}
