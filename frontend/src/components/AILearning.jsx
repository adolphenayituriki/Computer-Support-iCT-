import { useNavigate } from 'react-router-dom';
import { useLang } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import {
  FaRobot, FaImage, FaVideo, FaHeadphones, FaFlask, FaQuestionCircle,
  FaPuzzlePiece, FaChartLine, FaRoute, FaLanguage, FaMicroscope,
  FaChalkboardTeacher, FaGraduationCap, FaLaptop, FaSchool, FaUsers,
  FaCheckCircle, FaArrowRight, FaStar, FaLightbulb, FaRocket, FaGlobe,
  FaBrain, FaSearch, FaChartBar, FaBookOpen, FaCogs
} from 'react-icons/fa';

const FEATURES = [
  { icon: <FaRobot />, key: 1 },
  { icon: <FaImage />, key: 2 },
  { icon: <FaVideo />, key: 3 },
  { icon: <FaHeadphones />, key: 4 },
  { icon: <FaFlask />, key: 5 },
  { icon: <FaQuestionCircle />, key: 6 },
  { icon: <FaPuzzlePiece />, key: 7 },
  { icon: <FaBrain />, key: 8 },
  { icon: <FaChartBar />, key: 9 },
  { icon: <FaRoute />, key: 10 },
  { icon: <FaLanguage />, key: 11 },
  { icon: <FaMicroscope />, key: 12 },
  { icon: <FaChalkboardTeacher />, key: 13 },
];

const USERS = [
  { icon: <FaGraduationCap />, key: 1 },
  { icon: <FaChalkboardTeacher />, key: 2 },
  { icon: <FaSchool />, key: 3 },
  { icon: <FaUsers />, key: 4 },
];

const BENEFITS = [
  { icon: <FaLightbulb />, key: 1 },
  { icon: <FaCogs />, key: 2 },
  { icon: <FaRocket />, key: 3 },
  { icon: <FaGlobe />, key: 4 },
];

const PHASES = [
  { icon: <FaLaptop />, key: 1 },
  { icon: <FaImage />, key: 2 },
  { icon: <FaMicroscope />, key: 3 },
  { icon: <FaGlobe />, key: 4 },
];

export default function AILearning() {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="ai-page">
      {/* Hero */}
      <section className="ai-hero">
        <div className="container ai-hero-content">
          <span className="ai-hero-badge">
            <FaStar /> {t('aiLearning.heroBadge')}
          </span>
          <h1>{t('aiLearning.heroTitle')}</h1>
          <p className="ai-hero-sub">{t('aiLearning.heroSub')}</p>
          <p className="ai-hero-desc">{t('aiLearning.heroDesc')}</p>
          <div className="ai-hero-btns">
            <a href="#ai-features" className="btn">
              <FaSearch style={{ marginRight: '0.5rem' }} /> {t('aiLearning.heroCta')}
            </a>
            <button className="btn btn-outline" onClick={() => user ? navigate('/dashboard') : navigate('/')}>
              <FaArrowRight style={{ marginRight: '0.5rem' }} /> {t('aiLearning.heroSecondary')}
            </button>
          </div>
          <div className="ai-hero-stats">
            <div className="ai-stat">
              <FaRobot size={28} />
              <strong>13</strong>
              <span>AI Features</span>
            </div>
            <div className="ai-stat">
              <FaGraduationCap size={28} />
              <strong>6+</strong>
              <span>Subject Areas</span>
            </div>
            <div className="ai-stat">
              <FaGlobe size={28} />
              <strong>3</strong>
              <span>Languages</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="ai-features" className="ai-features section-alt">
        <div className="container">
          <h2 className="section-title">{t('aiLearning.featuresTitle')}</h2>
          <p className="section-sub">{t('aiLearning.featuresSub')}</p>
          <div className="ai-features-grid">
            {FEATURES.map((f) => (
              <div className="ai-feature-card" key={f.key}>
                <div className="ai-feature-icon">{f.icon}</div>
                <h3>{t(`aiLearning.feature${f.key}Title`)}</h3>
                <p>{t(`aiLearning.feature${f.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="ai-how">
        <div className="container">
          <h2 className="section-title">{t('aiLearning.howTitle')}</h2>
          <p className="section-sub">{t('aiLearning.howSub')}</p>
          <div className="ai-how-steps">
            <div className="ai-how-step">
              <div className="ai-how-num">1</div>
              <h3>{t('aiLearning.howStep1Title')}</h3>
              <p>{t('aiLearning.howStep1Desc')}</p>
            </div>
            <div className="ai-how-step">
              <div className="ai-how-num">2</div>
              <h3>{t('aiLearning.howStep2Title')}</h3>
              <p>{t('aiLearning.howStep2Desc')}</p>
            </div>
            <div className="ai-how-step">
              <div className="ai-how-num">3</div>
              <h3>{t('aiLearning.howStep3Title')}</h3>
              <p>{t('aiLearning.howStep3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Users */}
      <section className="ai-users section-alt">
        <div className="container">
          <h2 className="section-title">{t('aiLearning.usersTitle')}</h2>
          <p className="section-sub">{t('aiLearning.usersSub')}</p>
          <div className="ai-users-grid">
            {USERS.map((u) => (
              <div className="ai-user-card" key={u.key}>
                <div className="ai-user-icon">{u.icon}</div>
                <h3>{t(`aiLearning.user${u.key}Title`)}</h3>
                <p>{t(`aiLearning.user${u.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="ai-benefits">
        <div className="container">
          <h2 className="section-title">{t('aiLearning.benefitsTitle')}</h2>
          <p className="section-sub">{t('aiLearning.benefitsSub')}</p>
          <div className="ai-benefits-grid">
            {BENEFITS.map((b) => (
              <div className="ai-benefit-card" key={b.key}>
                <div className="ai-benefit-icon">{b.icon}</div>
                <h3>{t(`aiLearning.benefit${b.key}Title`)}</h3>
                <p>{t(`aiLearning.benefit${b.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="ai-roadmap section-alt">
        <div className="container">
          <h2 className="section-title">{t('aiLearning.roadmapTitle')}</h2>
          <p className="section-sub">{t('aiLearning.roadmapSub')}</p>
          <div className="ai-roadmap-grid">
            {PHASES.map((p, i) => (
              <div className="ai-roadmap-card" key={p.key}>
                <div className="ai-roadmap-phase">{t(`aiLearning.phase${p.key}`)}</div>
                <div className="ai-roadmap-icon">{p.icon}</div>
                <p>{t(`aiLearning.phase${p.key}Items`)}</p>
                <div className="ai-roadmap-line"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ai-cta">
        <div className="container ai-cta-content">
          <FaBookOpen size={40} className="ai-cta-icon" />
          <h2>{t('aiLearning.ctaTitle')}</h2>
          <p>{t('aiLearning.ctaDesc')}</p>
          <div className="ai-cta-btns">
            <button className="btn" onClick={() => user ? navigate('/dashboard') : navigate('/')}>
              {t('aiLearning.ctaBtn')}
            </button>
            <a href="/#contact" className="btn btn-outline">
              {t('aiLearning.ctaSecondary')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
