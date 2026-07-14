import { useLang } from '../LanguageContext';

export default function HowItWorks() {
  const { t } = useLang();
  const steps = [
    { num: '1', title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
    { num: '2', title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
    { num: '3', title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
  ];

  return (
    <section id="how-it-works" className="how section-alt section-reveal">
      <div className="container">
        <h2 className="section-title">{t('howItWorks.title')}</h2>
        <p className="section-sub">{t('howItWorks.subtitle')}</p>
        <div className="steps">
          {steps.map((s) => (
            <div className="step" key={s.num}>
              <div className="step-num">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
