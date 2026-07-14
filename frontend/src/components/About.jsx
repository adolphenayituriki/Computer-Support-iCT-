import ImageCarousel from './ImageCarousel';
import { useLang } from '../LanguageContext';

export default function About() {
  const { t } = useLang();
  return (
    <section id="about" className="about section-reveal">
      <h2 className="section-title">{t('about.title')}</h2>
      <div className="about-grid">
        <div className="about-text">
          <p>{t('about.p1')}</p>
          <p>{t('about.p2')}</p>
          <p>{t('about.p3')}</p>
        </div>
        <div className="about-carousel">
          <ImageCarousel />
        </div>
      </div>
    </section>
  );
}
