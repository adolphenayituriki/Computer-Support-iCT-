import { FaUniversity, FaGlobeAfrica, FaBuilding, FaLaptop, FaShieldAlt } from 'react-icons/fa';

const logos = [
  { name: 'University of Rwanda', icon: <FaUniversity /> },
  { name: 'INES Ruhengeri', icon: <FaBuilding /> },
  { name: 'Rwanda Development Board', icon: <FaGlobeAfrica /> },
  { name: 'MINICT', icon: <FaLaptop /> },
  { name: 'RURA', icon: <FaShieldAlt /> },
];

export default function TrustLogos() {
  return (
    <section className="trust-section section-reveal">
      <div className="trust-label">Trusted by leading institutions</div>
      <div className="trust-logos">
        {logos.map(({ name, icon }) => (
          <div key={name} className="trust-logo-item">
            <span className="trust-logo-icon">{icon}</span>
            <span className="trust-logo-name">{name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
