import { useState } from 'react';

const faqs = [
  {
    q: 'What services do you offer?',
    a: 'CS hub (iCT) provides troubleshooting, software installations, training sessions, and ongoing support for students, teachers, and staff.',
  },
  {
    q: 'Who can use this service?',
    a: 'Anyone — students, teachers, staff, and members of the UR Huye community who need computer support or want to build their digital skills.',
  },
  {
    q: 'How long does a typical repair take?',
    a: 'Most software issues (viruses, installations, slow computers) are resolved within 24-48 hours. Hardware repairs may take longer depending on the parts needed.',
  },
  {
    q: 'What software can you install?',
    a: 'We install Microsoft Office (whole package), Google Chrome, antivirus programs, Zoom, Adobe Reader, school-specific software, and most other educational tools you might need.',
  },
  {
    q: 'Do I need an appointment?',
    a: 'You can submit a request anytime through our dashboard. We will assign a technician and notify you when your device is ready.',
  },
  {
    q: 'What if I have no computer knowledge?',
    a: 'That is exactly who we are here for! Our training sessions start from the absolute basics. No question is too simple.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="faq section-alt section-reveal">
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-sub">Everything you need to know before reaching out</p>
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
