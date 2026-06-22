const testimonials = [
  {
    name: 'Sarah K.',
    role: '2nd Year Student',
    avatar: 'SK',
    text: 'My laptop got a virus the night before my paper was due. They fixed it in under 2 hours and even helped me recover my files. Absolute lifesavers!',
    stars: 5,
  },
  {
    name: 'Michael O.',
    role: 'Graduate Student',
    avatar: 'MO',
    text: 'I knew nothing about computers. They installed Office for me, showed me how to use cloud backup, and now I feel confident handling my own tech issues.',
    stars: 5,
  },
  {
    name: 'Amina D.',
    role: 'Freshman',
    avatar: 'AD',
    text: 'My WiFi kept disconnecting. They diagnosed it as a driver issue in 10 minutes and had me back online. The training session they gave was incredibly helpful.',
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="testimonials section-reveal">
      <div className="container">
        <h2 className="section-title">What People Say</h2>
        <p className="section-sub">From students and teachers we have helped across Rwanda</p>
        <div className="testimonial-grid">
          {testimonials.map((t) => (
            <div className="testi-card" key={t.name}>
              <div className="testi-stars">{'★'.repeat(t.stars)}</div>
              <blockquote>&ldquo;{t.text}&rdquo;</blockquote>
              <div className="testi-author">
                <div className="testi-avatar">{t.avatar}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
