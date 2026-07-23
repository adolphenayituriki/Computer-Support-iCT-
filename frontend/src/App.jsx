import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { SidebarProvider } from './SidebarContext';
import { ToastProvider } from './ToastContext';
import { LanguageProvider } from './LanguageContext';
import { FaWhatsapp } from 'react-icons/fa';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Services from './components/Services';
import WhyUs from './components/WhyUs';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import EmergencyButton from './components/EmergencyButton';
import NewsletterPopup from './components/NewsletterPopup';
import Modal from './components/Modal';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import TeamApplyModal from './components/TeamApplyModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import ProtectedRoute from './components/ProtectedRoute';

const Contact = lazy(() => import('./components/Contact'));
const GameWithUs = lazy(() => import('./components/GameWithUs'));
const GamePlay = lazy(() => import('./components/GamePlay'));
const GameHub = lazy(() => import('./components/GameHub'));
const News = lazy(() => import('./components/News'));
const Courses = lazy(() => import('./components/Courses'));
const AILearning = lazy(() => import('./components/AILearning'));
const AILearningDashboard = lazy(() => import('./components/AILearningDashboard'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const SetupAccount = lazy(() => import('./components/SetupAccount'));
const CollaboratorsPage = lazy(() => import('./components/CollaboratorsPage'));
const LiveSessionsStudent = lazy(() => import('./components/LiveSessionsStudent'));

function PageSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="loading-spinner"><div className="loading-spinner-circle" /></div>
    </div>
  );
}

function HomePage({ onLoginClick, onRegisterClick, onTeamClick }) {
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
      <HowItWorks onLoginClick={onLoginClick} />
      <Services onLoginClick={onLoginClick} />
      <WhyUs />
      <About />
      <FAQ />
      <Testimonials />
      <CTA onRegisterClick={onRegisterClick} onTeamClick={onTeamClick} />
      <Contact />
      <GameWithUs />
    </main>
  );
}

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const openLogin = () => { setShowRegister(false); setShowTeam(false); setShowForgot(false); setShowLogin(true); };
  const openRegister = () => { setShowLogin(false); setShowTeam(false); setShowForgot(false); setShowRegister(true); };
  const openTeam = () => { setShowLogin(false); setShowRegister(false); setShowForgot(false); setShowTeam(true); };
  const openForgot = () => { setShowLogin(false); setShowRegister(false); setShowTeam(false); setShowForgot(true); };
  const closeAll = () => { setShowLogin(false); setShowRegister(false); setShowTeam(false); setShowForgot(false); setShowNewsletter(false); };

  function AppLayout() {
    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard' || location.pathname === '/setup-account' || location.pathname === '/ai-dashboard';
    const isAdmin = location.pathname === '/admin';
    const isGamePlay = location.pathname === '/play' || location.pathname.startsWith('/play/');
    const isCollaborators = location.pathname === '/collaborators';
    const [waVisible, setWaVisible] = useState(false);

    useEffect(() => {
      if (isDashboard || isAdmin) return;
      const onScroll = () => setWaVisible(window.scrollY > window.innerHeight * 0.6);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    }, [isDashboard, isAdmin]);

    return (
      <>
        {!isAdmin && !isDashboard && !isGamePlay && <Navbar onLoginClick={openLogin} onRegisterClick={openRegister} />}
        <Routes>
          <Route path="/" element={<HomePage onLoginClick={openLogin} onRegisterClick={openRegister} onTeamClick={openTeam} />} />
          <Route path="/contact" element={<Suspense fallback={<PageSpinner />}><main><Contact /></main></Suspense>} />
          <Route path="/news" element={<Suspense fallback={<PageSpinner />}><News /></Suspense>} />
          <Route path="/courses" element={<Suspense fallback={<PageSpinner />}><Courses /></Suspense>} />
          <Route path="/ai-learning" element={<Suspense fallback={<PageSpinner />}><AILearning /></Suspense>} />
          <Route path="/play" element={<Suspense fallback={<PageSpinner />}><GameHub /></Suspense>} />
          <Route path="/play/:category" element={<Suspense fallback={<PageSpinner />}><GamePlay /></Suspense>} />
          <Route path="/ai-dashboard" element={<Suspense fallback={<PageSpinner />}><ProtectedRoute><AILearningDashboard /></ProtectedRoute></Suspense>} />
          <Route path="/setup-account" element={<Suspense fallback={<PageSpinner />}><SetupAccount /></Suspense>} />
          <Route path="/dashboard" element={<Suspense fallback={<PageSpinner />}><ProtectedRoute><Dashboard /></ProtectedRoute></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={<PageSpinner />}><ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute></Suspense>} />
          <Route path="/collaborators" element={<Suspense fallback={<PageSpinner />}><CollaboratorsPage /></Suspense>} />
          <Route path="/live-sessions" element={<Suspense fallback={<PageSpinner />}><ProtectedRoute><main className="pt-24 pb-12 px-4 max-w-3xl mx-auto"><LiveSessionsStudent /></main></ProtectedRoute></Suspense>} />
        </Routes>
        {!isDashboard && !isAdmin && !isGamePlay && !isCollaborators && <Footer onNewsletterClick={() => setShowNewsletter(true)} />}
        {!isDashboard && !isAdmin && !isGamePlay && <EmergencyButton />}
        <NewsletterPopup open={showNewsletter} onClose={() => setShowNewsletter(false)} />
        {!isDashboard && !isAdmin && !isGamePlay && <a href="https://chat.whatsapp.com/GeDRB76f01gDAcnj0BTOiN" target="_blank" rel="noopener noreferrer" className={`whatsapp-float${waVisible ? ' visible' : ''}`} title="Join our WhatsApp group"><FaWhatsapp /></a>}
        <Modal open={showLogin} onClose={closeAll}><LoginModal onClose={closeAll} onSwitchToRegister={openRegister} onForgotPassword={openForgot} /></Modal>
        <Modal open={showRegister} onClose={closeAll}><RegisterModal onClose={closeAll} onSwitchToLogin={openLogin} /></Modal>
        <Modal open={showTeam} onClose={closeAll} wide><TeamApplyModal onClose={closeAll} /></Modal>
        <Modal open={showForgot} onClose={closeAll}><ForgotPasswordModal onClose={closeAll} onBackToLogin={openLogin} /></Modal>
      </>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <SidebarProvider>
            <ToastProvider>
              <AppLayout />
            </ToastProvider>
          </SidebarProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
