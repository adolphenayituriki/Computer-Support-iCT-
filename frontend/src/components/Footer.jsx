import { FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../LanguageContext';

export default function Footer() {
  const navigate = useNavigate();
  const { t } = useLang();
  const goHome = (hash) => {
    if (window.location.pathname === '/') {
      document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/' + hash);
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-col footer-col-brand">
          <div className="footer-brand-row">
            <img src="/LOGO IMAGE.png" alt="CS hub (iCT)" className="footer-logo" />
            <div>
              <h4>CS hub <span>(iCT)</span></h4>
              <p className="footer-tagline">{t('footer.tagline')}</p>
            </div>
          </div>
          <p className="footer-desc">{t('footer.desc')}</p>
          <div className="footer-social-row">
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
            </div>
            <a href="https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN" target="_blank" rel="noopener noreferrer" className="footer-whatsapp">
              <FaWhatsapp /> WhatsApp
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>{t('footer.quickLinks')}</h4>
          <div className="footer-links">
            <button type="button" onClick={() => goHome('#home')}>{t('nav.home')}</button>
            <button type="button" onClick={() => goHome('#services')}>{t('nav.services')}</button>
            <button type="button" onClick={() => goHome('#about')}>{t('nav.about')}</button>
            <button type="button" onClick={() => goHome('#contact')}>{t('nav.contact')}</button>
            <button type="button" onClick={() => navigate('/news')}>{t('nav.news')}</button>
            <button type="button" onClick={() => navigate('/courses')}>{t('nav.courses')}</button>
          </div>
        </div>

        <div className="footer-col">
          <h4>{t('footer.contact')}</h4>
          <div className="footer-contact-list">
            <div className="footer-contact-item">
              <FaMapMarkerAlt className="footer-contact-icon" />
              <span>{t('contact.locationVal')}</span>
            </div>
            <div className="footer-contact-item">
              <FaEnvelope className="footer-contact-icon" />
              <a href="mailto:cshub.rw@gmail.com">cshub.rw@gmail.com</a>
            </div>
            <div className="footer-contact-item">
              <FaPhoneAlt className="footer-contact-icon" />
              <a href="tel:+250780505948">+250 780 505 948</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
