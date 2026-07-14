import { FaWrench, FaLaptop, FaGraduationCap, FaShieldAlt, FaVirus, FaMicrosoft, FaWifi, FaHdd, FaKeyboard, FaSearch, FaEnvelope, FaCloud, FaHeadphones, FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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

const quickLinks = [
  { icon: <FaVirus />, label: 'Virus Removal', category: 'hardware' },
  { icon: <FaMicrosoft />, label: 'Office Install', category: 'software' },
  { icon: <FaShieldAlt />, label: 'Security Setup', category: 'virus' },
  { icon: <FaWifi />, label: 'Network Fix', category: 'network' },
  { icon: <FaHdd />, label: 'Hardware Upgrade', category: 'hardware' },
  { icon: <FaKeyboard />, label: 'Peripheral Setup', category: 'hardware' },
  { icon: <FaSearch />, label: 'System Diagnostics', category: 'general' },
  { icon: <FaEnvelope />, label: 'Email & Cloud', category: 'training' },
  { icon: <FaCloud />, label: 'Data Backup', category: 'general' },
  { icon: <FaHeadphones />, label: 'Remote Support', category: 'general' },
];

export default function Services() {
  const navigate = useNavigate();

  const handleQuickAccess = (category) => {
    const token = localStorage.getItem('cshub_token');
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <section id="services" className="services section-reveal">
      <h2 className="section-title">Our Services</h2>
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

      <div className="quick-access">
        <div className="quick-access-header">
          <FaCheckCircle className="quick-access-icon" />
          <div>
            <h3>Quick Access</h3>
            <p>Jump straight to the service you need</p>
          </div>
        </div>
        <div className="quick-access-grid">
          {quickLinks.map((item) => (
            <button
              key={item.label}
              className="quick-access-btn"
              onClick={() => handleQuickAccess(item.category)}
            >
              <span className="quick-access-btn-icon">{item.icon}</span>
              <span className="quick-access-btn-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
