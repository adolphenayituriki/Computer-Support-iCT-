import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLaptop, FaStar, FaGoogle, FaShieldAlt, FaShareAlt, FaGamepad, FaArrowLeft, FaHeart } from 'react-icons/fa';
import { useLang } from '../LanguageContext';

const CATEGORIES = [
  {
    id: 'basics',
    icon: FaLaptop,
    label: 'Computer Basics',
    color: '#5694F7',
    desc: 'Test your knowledge of hardware, software, CPU, RAM, storage, ports, and how computers work.',
    topics: ['CPU & RAM', 'Storage (SSD/HDD)', 'Operating Systems', 'Ports & Peripherals'],
  },
  {
    id: 'msoffice',
    icon: FaStar,
    label: 'MS Office',
    color: '#25D366',
    desc: 'Challenge your skills in Word, Excel, and PowerPoint — shortcuts, formulas, formatting, and more.',
    topics: ['Word shortcuts', 'Excel formulas', 'PowerPoint design', 'Track Changes'],
  },
  {
    id: 'google',
    icon: FaGoogle,
    label: 'Google Workspace',
    color: '#EA4335',
    desc: 'See how well you know Gmail, Google Docs, Sheets, Slides, Drive, and collaboration tools.',
    topics: ['Gmail limits', 'Docs & Sheets', 'Sharing permissions', 'Offline mode'],
  },
  {
    id: 'digital',
    icon: FaShieldAlt,
    label: 'Digital Safety',
    color: '#FFCE08',
    desc: 'Prove you can stay safe online — passwords, phishing, malware, backups, and internet security.',
    topics: ['Phishing scams', 'Strong passwords', 'Two-factor auth', 'Malware & viruses'],
  },
];

const getLiked = () => {
  try { return JSON.parse(localStorage.getItem('cshub_game_likes') || '{}'); } catch { return {}; }
};

export default function GameHub() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [likes, setLikes] = useState(getLiked);

  const toggleLike = (catId) => {
    setLikes((prev) => {
      const next = { ...prev, [catId]: !prev[catId] };
      localStorage.setItem('cshub_game_likes', JSON.stringify(next));
      return next;
    });
  };

  const handleChallenge = (catId, catLabel) => {
    const url = `${window.location.origin}/play/${catId}`;
    const text = `I challenge you to the "${catLabel}" quiz at CS hub (iCT)! Can you beat my score? 🔥\n\n${url}`;
    if (navigator.share) navigator.share({ title: `CS hub (iCT) — ${catLabel} Challenge`, text });
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => alert('Link copied!'));
  };

  return (
    <div className="gameplay-wrap">
      <div className="game-hub-standalone">
        <button className="game-home-btn game-home-btn-top" type="button" onClick={() => navigate('/')}>
          <FaArrowLeft /> Go to Home
        </button>
        <div className="game-hub-head">
          <span className="game-hub-badge"><FaGamepad /> {t('gameWithUs.badge')}</span>
          <h3 className="game-hub-title">{t('gameWithUs.title')}</h3>
          <p className="game-hub-sub">{t('gameWithUs.subtitle')}</p>
        </div>
        <div className="game-challenge-list">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="game-challenge-card">
              <div className="gcc-head">
                <cat.icon className="gcc-icon" style={{ color: cat.color }} />
                <span className="gcc-label">{cat.label}</span>
                <button className="gcc-play" type="button" href={`/play/${cat.id}`} onClick={(e) => { e.preventDefault(); window.open(`/play/${cat.id}`, '_blank'); }}>
                  Play
                </button>
              </div>
              <p className="gcc-desc">{cat.desc}</p>
              <div className="gcc-topics">
                {cat.topics.map((tp) => (
                  <span key={tp} className="gcc-topic" style={{ borderColor: `${cat.color}40`, color: cat.color }}>{tp}</span>
                ))}
              </div>
              <div className="gcc-actions">
                <button className={`gcc-like-btn${likes[cat.id] ? ' liked' : ''}`} type="button" onClick={() => toggleLike(cat.id)}>
                  <FaHeart /> {likes[cat.id] ? 'Liked' : 'Like'}
                </button>
                <button className="gcc-challenge" type="button" onClick={() => handleChallenge(cat.id, cat.label)}>
                  <FaShareAlt /> Challenge a friend
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
