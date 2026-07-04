import { FaWrench, FaLaptop, FaGraduationCap } from 'react-icons/fa';

const services = [
  {
    icon: <FaWrench />,
    title: 'Repair & Troubleshooting',
    features: [
      'Slow laptop / PC optimization',
      'Blue screen & crash diagnosis',
      'Virus & malware removal',
      'Hardware upgrade advice',
      'Battery & charging issues',
      'Screen & keyboard repairs',
    ],
  },
  {
    icon: <FaLaptop />,
    title: 'Software Installation',
    features: [
      'Microsoft Office (whole package)',
      'Google Chrome & browsers',
      'Antivirus & security software',
      'Zoom, Teams & school apps',
      'Operating system updates',
      'Driver & peripheral setup',
    ],
  },
  {
    icon: <FaGraduationCap />,
    title: 'Training & Guidance',
    features: [
      'Basic computer literacy',
      'Internet safety & privacy',
      'Using Office for assignments',
      'Email & cloud storage setup',
      'Study tools & productivity tips',
      'Long-term maintenance coaching',
    ],
  },
];

export default function Services() {
  return (
    <section id="services" className="services section-reveal">
      <h2 className="section-title">What We Offer</h2>
      <p className="section-sub">Everything you need to keep your computer running smoothly</p>
      <div className="cards">
        {services.map((s) => (
          <div className="card" key={s.title}>
            <div className="card-icon">{s.icon}</div>
            <h3>{s.title}</h3>
            <ul className="card-features">
              {s.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
