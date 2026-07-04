import { FaWhatsapp, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaAngleRight, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-col">
          <h4>CS hub (iCT)</h4>
          <img src="/final-logo.jpg" alt="CS hub (iCT)" className="footer-logo" />
          <p>Empowering students and teachers with digital skills and computer support.</p>
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
          <a href="#home"><FaAngleRight className="footer-link-icon" /> Home</a>
          <a href="#services"><FaAngleRight className="footer-link-icon" /> Services</a>
          <a href="#about"><FaAngleRight className="footer-link-icon" /> About Us</a>
          <a href="#contact"><FaAngleRight className="footer-link-icon" /> Contact</a>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <p><FaMapMarkerAlt className="footer-contact-icon" /> Anywhere in Rwanda</p>
          <p><FaEnvelope className="footer-contact-icon" /> cshub.rw@gmail.com</p>
          <p><FaPhoneAlt className="footer-contact-icon" /> +250 78050 5948</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 CS hub (iCT). Helping our community grow digitally.</p>
      </div>
    </footer>
  );
}
