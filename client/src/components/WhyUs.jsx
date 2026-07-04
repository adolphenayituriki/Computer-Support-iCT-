import { FaUniversity, FaChalkboardTeacher, FaRocket, FaBolt } from 'react-icons/fa';

const reasons = [
  {
    icon: <FaUniversity />,
    title: 'Nationwide Support',
    desc: 'We serve every corner of Rwanda — all universities, schools, colleges, entrepreneurs, employees, and anyone in need of computer support and ICT skills.',
  },
  {
    icon: <FaChalkboardTeacher />,
    title: 'For Students & Teachers',
    desc: 'We support everyone — students, teachers, and staff — who want to improve their digital skills and apply ICT to their work and studies.',
  },
  {
    icon: <FaRocket />,
    title: 'Closing the Digital Gap',
    desc: 'Low digital skills should not hold anyone back. We provide hands-on training and support to help our community compete globally.',
  },
  {
    icon: <FaBolt />,
    title: 'Fast & Free Support',
    desc: 'Most issues are resolved within 24-48 hours. We prioritize your time and make sure you get back on track as quickly as possible.',
  },
];

export default function WhyUs() {
  return (
    <section id="why-us" className="why-us section-alt section-reveal">
      <div className="container">
        <h2 className="section-title">Why CS hub (iCT)</h2>
        <p className="section-sub">Born from real challenges, built for real solutions</p>
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
