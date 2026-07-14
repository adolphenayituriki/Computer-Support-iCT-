import { useState } from 'react';
import { FaWrench, FaLaptop, FaGraduationCap, FaShieldAlt, FaVirus, FaMicrosoft, FaWifi, FaHdd, FaKeyboard, FaSearch, FaEnvelope, FaCloud, FaHeadphones, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../AuthContext';
import { useLang } from '../LanguageContext';
import ServiceModal from './ServiceModal';

export default function Services({ onLoginClick }) {
  const { user } = useAuth();
  const { t } = useLang();
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      icon: <FaWrench />,
      title: t('services.repair'),
      features: [
        t('services.features.slowLaptop'),
        t('services.features.blueScreen'),
        t('services.features.virusRemoval'),
        t('services.features.hardwareAdvice'),
        t('services.features.batteryIssues'),
        t('services.features.screenKeyboard'),
      ],
    },
    {
      icon: <FaLaptop />,
      title: t('services.software'),
      features: [
        t('services.features.office'),
        t('services.features.browsers'),
        t('services.features.antivirus'),
        t('services.features.schoolApps'),
        t('services.features.osUpdates'),
        t('services.features.drivers'),
      ],
    },
    {
      icon: <FaGraduationCap />,
      title: t('services.training'),
      features: [
        t('services.features.computerLiteracy'),
        t('services.features.internetSafety'),
        t('services.features.officeAssignments'),
        t('services.features.emailCloud'),
        t('services.features.studyTools'),
        t('services.features.maintenance'),
      ],
    },
  ];

  const quickLinks = [
    { icon: <FaVirus />, label: t('services.quickLinks.virusRemoval'), category: 'hardware' },
    { icon: <FaMicrosoft />, label: t('services.quickLinks.officeInstall'), category: 'software' },
    { icon: <FaShieldAlt />, label: t('services.quickLinks.securitySetup'), category: 'virus' },
    { icon: <FaWifi />, label: t('services.quickLinks.networkFix'), category: 'network' },
    { icon: <FaHdd />, label: t('services.quickLinks.hardwareUpgrade'), category: 'hardware' },
    { icon: <FaKeyboard />, label: t('services.quickLinks.peripheralSetup'), category: 'hardware' },
    { icon: <FaSearch />, label: t('services.quickLinks.systemDiagnostics'), category: 'general' },
    { icon: <FaEnvelope />, label: t('services.quickLinks.emailCloud'), category: 'training' },
    { icon: <FaCloud />, label: t('services.quickLinks.dataBackup'), category: 'general' },
    { icon: <FaHeadphones />, label: t('services.quickLinks.remoteSupport'), category: 'general' },
  ];

  return (
    <section id="services" className="services section-reveal">
      <h2 className="section-title">{t('services.title')}</h2>
      <p className="section-sub">{t('services.subtitle')}</p>
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
            <h3>{t('services.quickAccess')}</h3>
            <p>{t('services.quickAccessSub')}</p>
          </div>
        </div>
        <div className="quick-access-grid">
          {quickLinks.map((item) => (
            <button
              key={item.label}
              className="quick-access-btn"
              onClick={() => setSelectedService(item)}
            >
              <span className="quick-access-btn-icon">{item.icon}</span>
              <span className="quick-access-btn-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedService && (
        <ServiceModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onLoginClick={onLoginClick}
        />
      )}
    </section>
  );
}
