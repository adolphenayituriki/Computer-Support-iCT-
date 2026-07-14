import { useLang } from '../LanguageContext';
import { FaUniversity, FaChalkboardTeacher, FaRocket, FaBolt } from 'react-icons/fa';

export default function WhyUs() {
  const { t } = useLang();
  const reasons = [
    { icon: <FaUniversity />, title: t('whyUs.nationwide'), desc: t('whyUs.nationwideDesc') },
    { icon: <FaChalkboardTeacher />, title: t('whyUs.forStudents'), desc: t('whyUs.forStudentsDesc') },
    { icon: <FaRocket />, title: t('whyUs.digitalGap'), desc: t('whyUs.digitalGapDesc') },
    { icon: <FaBolt />, title: t('whyUs.fastFree'), desc: t('whyUs.fastFreeDesc') },
  ];

  return (
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
      </div>
    </section>
  );
}
