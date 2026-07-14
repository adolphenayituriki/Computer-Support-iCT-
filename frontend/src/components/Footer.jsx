import { FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaAngleRight, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeart } from 'react-icons/fa';
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
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60L48 52C96 44 192 28 288 24C384 20 480 28 576 40C672 52 768 68 864 72C960 76 1056 68 1152 56C1248 44 1344 28 1392 20L1440 12V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z" fill="#0f172a"/>
        </svg>
      </div>

      <div className="footer-content">
        <div className="footer-col footer-col-brand">
          <div className="footer-brand-header">
            <img src="/LOGO IMAGE.png" alt="CS hub (iCT)" className="footer-logo" />
            <div>
              <h4>CS hub <span>(iCT)</span></h4>
              <p className="footer-tagline">Computer Support</p>
            </div>
          </div>
          <p className="footer-desc">Empowering students and teachers with digital skills and computer support.</p>
          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
          <a href="https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN" target="_blank" rel="noopener noreferrer" className="footer-whatsapp">
            <FaWhatsapp /> Join WhatsApp Group
          </a>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <div className="footer-links">
            <button type="button" onClick={() => goHome('#home')}><FaAngleRight className="footer-link-icon" /> Home</button>
            <button type="button" onClick={() => goHome('#services')}><FaAngleRight className="footer-link-icon" /> Services</button>
            <button type="button" onClick={() => goHome('#about')}><FaAngleRight className="footer-link-icon" /> About Us</button>
            <button type="button" onClick={() => goHome('#contact')}><FaAngleRight className="footer-link-icon" /> Contact</button>
            <button type="button" onClick={() => navigate('/news')}><FaAngleRight className="footer-link-icon" /> News</button>
            <button type="button" onClick={() => navigate('/courses')}><FaAngleRight className="footer-link-icon" /> Courses</button>
          </div>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
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
        <p>&copy; 2026 CS hub (iCT). Made with <FaHeart className="footer-heart" /> for our community.</p>
      </div>
    </footer>
  );
}
