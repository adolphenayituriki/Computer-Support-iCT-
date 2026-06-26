import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ToastProvider } from './ToastContext';
import { FaWhatsapp } from 'react-icons/fa';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Services from './components/Services';
import WhyUs from './components/WhyUs';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import About from './components/About';
import Contact from './components/Contact';
import News from './components/News';
import NewsPreview from './components/NewsPreview';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Modal from './components/Modal';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import TeamApplyModal from './components/TeamApplyModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';

function HomePage({ onRegisterClick, onTeamClick }) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.section-reveal');
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <Hero />
      <HowItWorks />
      <Services />
      <WhyUs />
      <Testimonials />
      <FAQ />
      <CTA onRegisterClick={onRegisterClick} onTeamClick={onTeamClick} />
      <NewsPreview />
      <About />
      <Contact />
    </main>
  );
}

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const openLogin = () => {
    setShowRegister(false);
    setShowTeam(false);
    setShowForgot(false);
    setShowLogin(true);
  };

  const openRegister = () => {
    setShowLogin(false);
    setShowTeam(false);
    setShowForgot(false);
    setShowRegister(true);
  };

  const openTeam = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowForgot(false);
    setShowTeam(true);
  };

  const openForgot = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowTeam(false);
    setShowForgot(true);
  };

  const closeAll = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowTeam(false);
    setShowForgot(false);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar onLoginClick={openLogin} onRegisterClick={openRegister} />
          <Routes>
            <Route path="/" element={<HomePage onRegisterClick={openRegister} onTeamClick={openTeam} />} />
            <Route path="/news" element={<News />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer />

          <a href="https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN" target="_blank" rel="noopener noreferrer" className="whatsapp-float" title="Join our WhatsApp group">
            <FaWhatsapp />
          </a>

          <Modal open={showLogin} onClose={closeAll}>
            <LoginModal onClose={closeAll} onSwitchToRegister={openRegister} onForgotPassword={openForgot} />
          </Modal>
          <Modal open={showRegister} onClose={closeAll}>
            <RegisterModal onClose={closeAll} onSwitchToLogin={openLogin} />
          </Modal>
          <Modal open={showTeam} onClose={closeAll} wide>
            <TeamApplyModal onClose={closeAll} />
          </Modal>
          <Modal open={showForgot} onClose={closeAll}>
            <ForgotPasswordModal onClose={closeAll} onBackToLogin={openLogin} />
          </Modal>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
