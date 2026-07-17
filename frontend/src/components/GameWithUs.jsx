import { FaGamepad, FaLaptop, FaStar, FaGoogle, FaShieldAlt, FaShareAlt } from 'react-icons/fa';
import { useLang } from '../LanguageContext';

const CATEGORIES = [
  {
    id: 'basics',
    icon: FaLaptop,
    label: 'Computer Basics',
    color: '#5694F7',
    desc: 'Hardware, CPU, RAM, storage, ports, and how computers work.',
    topics: ['CPU & RAM', 'Storage', 'OS', 'Peripherals'],
  },
  {
    id: 'msoffice',
    icon: FaStar,
    label: 'MS Office',
    color: '#25D366',
    desc: 'Word, Excel, PowerPoint — shortcuts, formulas, formatting.',
    topics: ['Word', 'Excel', 'PowerPoint', 'Shortcuts'],
  },
  {
    id: 'google',
    icon: FaGoogle,
    label: 'Google Workspace',
    color: '#EA4335',
    desc: 'Gmail, Docs, Sheets, Slides, Drive, and collaboration.',
    topics: ['Gmail', 'Docs', 'Sheets', 'Sharing'],
  },
  {
    id: 'digital',
    icon: FaShieldAlt,
    label: 'Digital Safety',
    color: '#FFCE08',
    desc: 'Passwords, phishing, malware, backups, and security.',
    topics: ['Phishing', 'Passwords', '2FA', 'Malware'],
  },
];

export default function GameWithUs() {
  const { t } = useLang();

  const handleChallenge = (catId, catLabel) => {
    const url = `${window.location.origin}/play/${catId}`;
    const text = `I challenge you to the "${catLabel}" quiz at CS hub (iCT)! Can you beat my score? 🔥\n\n${url}`;
    if (navigator.share) navigator.share({ title: `CS hub (iCT) — ${catLabel} Challenge`, text });
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => alert('Link copied!'));
  };

  return (
    <section className="game-with-us">
      <div className="container">
        <div className="game-hub">
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
                  <a className="gcc-play" href={`/play/${cat.id}`} target="_blank" rel="noopener noreferrer">
                    Play
                  </a>
                </div>
                <p className="gcc-desc">{cat.desc}</p>
                <div className="gcc-topics">
                  {cat.topics.map((tp) => (
                    <span key={tp} className="gcc-topic" style={{ borderColor: `${cat.color}40`, color: cat.color }}>{tp}</span>
                  ))}
                </div>
                <button className="gcc-challenge" type="button" onClick={() => handleChallenge(cat.id, cat.label)} style={{ borderColor: cat.color, color: cat.color }}>
                  <FaShareAlt /> Challenge a friend
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
