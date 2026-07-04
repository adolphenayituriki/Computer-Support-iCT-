export default function HowItWorks() {
  const steps = [
    { num: '1', title: 'Tell Us Your Issue', desc: 'Describe your computer problem through our support request form. Hardware, software, digital skills training — we handle it all.' },
    { num: '2', title: 'We Diagnose & Fix', desc: 'Our student tech team takes a look. We troubleshoot, repair, install software, or guide you through the skills you need.' },
    { num: '3', title: 'Pick Up & Level Up', desc: 'Collect your device working like new. We also make sure you understand the basics so you grow more confident digitally.' },
  ];

  return (
    <section id="how-it-works" className="how section-alt section-reveal">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">Getting help is as easy as 1-2-3</p>
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
