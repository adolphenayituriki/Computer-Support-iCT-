import { useEffect, useRef, useState } from 'react';
import { useLang } from '../LanguageContext';
import { FiCpu, FiImage, FiBookOpen, FiGlobe } from 'react-icons/fi';
import BehindTheScenePopup from './BehindTheScenePopup';

export default function WhyUs() {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const hasTriggered = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          setTimeout(() => setShowPopup(true), 800);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const reasons = [
    { icon: <FiCpu />, title: t('whyUs.personalized'), desc: t('whyUs.personalizedDesc') },
    { icon: <FiImage />, title: t('whyUs.multimedia'), desc: t('whyUs.multimediaDesc') },
    { icon: <FiBookOpen />, title: t('whyUs.stem'), desc: t('whyUs.stemDesc') },
    { icon: <FiGlobe />, title: t('whyUs.rwanda'), desc: t('whyUs.rwandaDesc') },
  ];

  return (
    <>
      <section id="why-us" className="why-us section-alt section-reveal" ref={sectionRef}>
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
        </div>
      </section>
      <BehindTheScenePopup open={showPopup} onClose={() => setShowPopup(false)} />
    </>
  );
}
