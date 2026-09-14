import { useState } from 'react';
import { useLang } from '../LanguageContext';
import { FiCpu, FiImage, FiBookOpen, FiGlobe } from 'react-icons/fi';
import { FaUsers } from 'react-icons/fa';
import BehindTheScenePopup from './BehindTheScenePopup';

export default function WhyUs() {
  const { t, lang } = useLang();
  const [showPopup, setShowPopup] = useState(false);

  const reasons = [
    { icon: <FiCpu />, title: t('whyUs.personalized'), desc: t('whyUs.personalizedDesc') },
    { icon: <FiImage />, title: t('whyUs.multimedia'), desc: t('whyUs.multimediaDesc') },
    { icon: <FiBookOpen />, title: t('whyUs.stem'), desc: t('whyUs.stemDesc') },
    { icon: <FiGlobe />, title: t('whyUs.rwanda'), desc: t('whyUs.rwandaDesc') },
  ];

  return (
    <>
      <section id="why-us" className="why-us section-alt section-reveal">
        <div className="container">
          <h2 className="section-title">{t('whyUs.title')}</h2>
          <p className="section-sub">{t('whyUs.subtitle')}</p>
          <div className="why-grid">
            {reasons.map((r) => (
              <div className="why-card" key={r.title}>
                <div className="why-icon">{r.icon}</div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="why-team-btn">
            <button type="button" onClick={() => setShowPopup(true)}>
              <FaUsers /> {lang === 'rw' ? 'Menya abadukorera inyuma' : 'Meet the team behind CS hub'}
            </button>
          </div>
        </div>
      </section>
      <BehindTheScenePopup open={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
}