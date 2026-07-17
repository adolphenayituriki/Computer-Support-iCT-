import { useNavigate } from 'react-router-dom';
import { FaLaptop, FaStar, FaGoogle, FaShieldAlt, FaShareAlt, FaGamepad, FaArrowLeft } from 'react-icons/fa';
import { useLang } from '../LanguageContext';

const CATEGORIES = [
  { id: 'basics', icon: FaLaptop, label: 'Computer Basics', color: '#5694F7' },
  { id: 'msoffice', icon: FaStar, label: 'MS Office', color: '#25D366' },
  { id: 'google', icon: FaGoogle, label: 'Google', color: '#EA4335' },
  { id: 'digital', icon: FaShieldAlt, label: 'Digital Safety', color: '#FFCE08' },
];

export default function GameHub() {
  const { t } = useLang();
  const navigate = useNavigate();

  const handleShare = () => {
    const url = `${window.location.origin}/play`;
    const text = `Think you're an ICT pro? Prove it! Take the ICT Speed Challenge at CS hub (iCT) and see how high you can score. Can you beat my score? 🔥\n\n${url}`;
    if (navigator.share) navigator.share({ title: 'CS hub (iCT) — ICT Speed Challenge', text });
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => alert('Link copied!'));
  };

  return (
    <div className="gameplay-wrap">
      <div className="game-hub-standalone">
        <div className="game-hub-head">
          <span className="game-hub-badge"><FaGamepad /> {t('gameWithUs.badge')}</span>
          <h3 className="game-hub-title">{t('gameWithUs.title')}</h3>
          <p className="game-hub-sub">{t('gameWithUs.subtitle')}</p>
        </div>
        <div className="game-cat-row">
          {CATEGORIES.map((cat) => (
            <a key={cat.id} className="game-cat-pill" href={`/play/${cat.id}`} target="_blank" rel="noopener noreferrer">
              <cat.icon className="game-cat-icon" style={{ color: cat.color }} />
              <span>{cat.label}</span>
            </a>
          ))}
        </div>
        <button className="game-share-section" type="button" onClick={handleShare}>
          <FaShareAlt /> Challenge a friend
        </button>
        <button className="game-home-btn" type="button" onClick={() => navigate('/')}>
          <FaArrowLeft /> Go to Home
        </button>
      </div>
    </div>
  );
}
