import { FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-col">
          <h4>CS hub (iCT)</h4>
          <img src="/final-logo.jpg" alt="CS hub (iCT)" className="footer-logo" />
          <p>Empowering students and teachers with digital skills and computer support.</p>
          <a href="https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN" target="_blank" rel="noopener noreferrer" className="footer-whatsapp">
            <FaWhatsapp /> Join WhatsApp Group
          </a>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="footer-col">
          <h4>Contact</h4>
          <p>Anywhere in Rwanda</p>
          <p>support@cshub.rw</p>
          <p>+250 78050 5948</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 CS hub (iCT). Helping our community grow digitally.</p>
      </div>
    </footer>
  );
}
