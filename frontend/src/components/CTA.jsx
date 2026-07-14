import { useLang } from '../LanguageContext';

export default function CTA({ onRegisterClick, onTeamClick }) {
  const { t } = useLang();
  return (
    <section id="cta" className="cta-section section-reveal">
      <div className="container">
        <h2>{t('cta.title')}</h2>
        <p>{t('cta.desc')}</p>
        <div className="cta-btns">
          <button className="btn" onClick={onRegisterClick}>{t('cta.createAccount')}</button>
          <button className="btn btn-outline" onClick={onTeamClick}>{t('cta.joinTeam')}</button>
        </div>
      </div>
    </section>
  );
}
