import { FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();
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
              <p className="footer-tagline">Computer Support</p>
            </div>
          </div>
          <p className="footer-desc">Empowering students and teachers with digital skills and computer support.</p>
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
          <h4>Quick Links</h4>
          <div className="footer-links">
            <button type="button" onClick={() => goHome('#home')}>Home</button>
            <button type="button" onClick={() => goHome('#services')}>Services</button>
            <button type="button" onClick={() => goHome('#about')}>About Us</button>
            <button type="button" onClick={() => goHome('#contact')}>Contact</button>
            <button type="button" onClick={() => navigate('/news')}>News</button>
            <button type="button" onClick={() => navigate('/courses')}>Courses</button>
          </div>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <div className="footer-contact-list">
            <div className="footer-contact-item">
              <FaMapMarkerAlt className="footer-contact-icon" />
              <span>Anywhere in Rwanda</span>
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
        <p>&copy; 2026 CS hub (iCT). Made with  for our community.</p>
      </div>
    </footer>
  );
}
