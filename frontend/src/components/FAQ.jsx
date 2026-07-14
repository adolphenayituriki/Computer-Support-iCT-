import { useState } from 'react';
import { useLang } from '../LanguageContext';

export default function FAQ() {
  const { t } = useLang();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = Array.from({ length: 11 }, (_, i) => ({
    q: t(`faq.items.${i}.q`),
    a: t(`faq.items.${i}.a`),
  }));

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="faq section-alt section-reveal">
      <div className="container">
        <h2 className="section-title">{t('faq.title')}</h2>
        <p className="section-sub">{t('faq.subtitle')}</p>
        <div className="faq-list">
          {faqs.map((item, i) => (
            <div className={`faq-item${openIndex === i ? ' open' : ''}`} key={i}>
              <button className="faq-question" onClick={() => toggle(i)}>
                {item.q}
                <span className="faq-icon">+</span>
              </button>
              {openIndex === i && (
                <div className="faq-answer">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
