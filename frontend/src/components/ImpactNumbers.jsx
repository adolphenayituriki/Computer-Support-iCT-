export default function ImpactNumbers() {
  const items = [
    { num: '500+', label: 'Devices Fixed' },
    { num: '1,200+', label: 'Students Helped' },
    { num: '50+', label: 'Schools Reached' },
    { num: '98%', label: 'Satisfaction Rate' },
  ];

  return (
    <section className="impact-section section-reveal">
      <div className="impact-grid">
        {items.map((item) => (
          <div key={item.label} className="impact-item">
            <div className="impact-number">{item.num}</div>
            <div className="impact-label">{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
