import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import AILearningAuthModal from './AILearningAuthModal';
import {
  FaRobot, FaImage, FaVideo, FaHeadphones, FaFlask, FaQuestionCircle,
  FaPuzzlePiece, FaChartLine, FaRoute, FaLanguage, FaMicroscope,
  FaChalkboardTeacher, FaGraduationCap, FaLaptop, FaSchool, FaUsers,
  FaCheckCircle, FaArrowRight, FaStar, FaLightbulb, FaRocket, FaGlobe,
  FaBrain, FaSearch, FaChartBar, FaBookOpen, FaCogs, FaPlay, FaShieldAlt
} from 'react-icons/fa';

const FEATURES = [
  { icon: FaRobot, color: 'text-blue-600', accent: 'bg-blue-50', border: 'hover:border-blue-300', glow: 'group-hover:shadow-blue-100', key: 1 },
  { icon: FaImage, color: 'text-purple-600', accent: 'bg-purple-50', border: 'hover:border-purple-300', glow: 'group-hover:shadow-purple-100', key: 2 },
  { icon: FaVideo, color: 'text-red-500', accent: 'bg-red-50', border: 'hover:border-red-300', glow: 'group-hover:shadow-red-100', key: 3 },
  { icon: FaHeadphones, color: 'text-emerald-600', accent: 'bg-emerald-50', border: 'hover:border-emerald-300', glow: 'group-hover:shadow-emerald-100', key: 4 },
  { icon: FaFlask, color: 'text-cyan-600', accent: 'bg-cyan-50', border: 'hover:border-cyan-300', glow: 'group-hover:shadow-cyan-100', key: 5 },
  { icon: FaQuestionCircle, color: 'text-amber-500', accent: 'bg-amber-50', border: 'hover:border-amber-300', glow: 'group-hover:shadow-amber-100', key: 6 },
  { icon: FaPuzzlePiece, color: 'text-pink-500', accent: 'bg-pink-50', border: 'hover:border-pink-300', glow: 'group-hover:shadow-pink-100', key: 7 },
  { icon: FaBrain, color: 'text-violet-600', accent: 'bg-violet-50', border: 'hover:border-violet-300', glow: 'group-hover:shadow-violet-100', key: 8 },
  { icon: FaChartBar, color: 'text-teal-600', accent: 'bg-teal-50', border: 'hover:border-teal-300', glow: 'group-hover:shadow-teal-100', key: 9 },
  { icon: FaRoute, color: 'text-indigo-600', accent: 'bg-indigo-50', border: 'hover:border-indigo-300', glow: 'group-hover:shadow-indigo-100', key: 10 },
  { icon: FaLanguage, color: 'text-orange-500', accent: 'bg-orange-50', border: 'hover:border-orange-300', glow: 'group-hover:shadow-orange-100', key: 11 },
  { icon: FaMicroscope, color: 'text-green-600', accent: 'bg-green-50', border: 'hover:border-green-300', glow: 'group-hover:shadow-green-100', key: 12 },
  { icon: FaChalkboardTeacher, color: 'text-blue-700', accent: 'bg-blue-50', border: 'hover:border-blue-400', glow: 'group-hover:shadow-blue-100', key: 13 },
];

const USERS = [
  { icon: FaGraduationCap, color: 'text-blue-500', bg: 'bg-blue-50', key: 1 },
  { icon: FaChalkboardTeacher, color: 'text-emerald-500', bg: 'bg-emerald-50', key: 2 },
  { icon: FaSchool, color: 'text-purple-500', bg: 'bg-purple-50', key: 3 },
  { icon: FaUsers, color: 'text-amber-500', bg: 'bg-amber-50', key: 4 },
];

const BENEFITS = [
  { icon: FaLightbulb, color: 'from-yellow-400 to-amber-500', key: 1 },
  { icon: FaCogs, color: 'from-blue-500 to-indigo-500', key: 2 },
  { icon: FaRocket, color: 'from-red-500 to-pink-500', key: 3 },
  { icon: FaGlobe, color: 'from-emerald-500 to-teal-500', key: 4 },
];

const PHASES = [
  { icon: FaLaptop, color: 'from-blue-500 to-blue-600', key: 1 },
  { icon: FaImage, color: 'from-purple-500 to-pink-500', key: 2 },
  { icon: FaMicroscope, color: 'from-emerald-500 to-teal-500', key: 3 },
  { icon: FaGlobe, color: 'from-amber-500 to-orange-500', key: 4 },
];

export default function AILearning() {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSlide((p) => (p + 1) % 2), 6000);
    return () => clearInterval(timer);
  }, []);

  const openAuth = () => user ? navigate('/ai-dashboard') : setShowAuth(true);

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <div className={`absolute inset-0 transition-opacity duration-1000 ${slide === 0 ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('/Seconadry students.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className={`absolute inset-0 transition-opacity duration-1000 ${slide === 1 ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('/primary students.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6">
                <FaStar size={14} /> {t('aiLearning.heroBadge')}
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
                {t('aiLearning.heroTitle')}
              </h1>

              <p className="text-lg sm:text-xl text-blue-300 font-semibold mb-2">
                {t('aiLearning.heroSub')}
              </p>

              <p className="text-base text-slate-300 mb-8 max-w-lg leading-relaxed">
                {t('aiLearning.heroDesc')}
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <a href="#ai-features" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30">
                  <FaSearch size={14} /> {t('aiLearning.heroCta')}
                </a>
                <button onClick={openAuth} className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all backdrop-blur-sm">
                  <FaArrowRight size={14} /> {t('aiLearning.heroSecondary')}
                </button>
              </div>

              <div className="flex gap-8">
                {[
                  { icon: FaRobot, value: '13', label: 'AI Features' },
                  { icon: FaGraduationCap, value: '6+', label: 'Subject Areas' },
                  { icon: FaGlobe, value: '3', label: 'Languages' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <s.icon size={22} className="text-blue-400 mx-auto mb-1" />
                    <div className="text-2xl font-extrabold text-white">{s.value}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="ai-features" className="py-24 bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold mb-4">
                <FaRobot size={14} /> POWERED BY AI
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">{t('aiLearning.featuresTitle')}</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t('aiLearning.featuresSub')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.key} className={`group relative bg-white rounded-2xl p-7 border border-slate-200 ${f.border} hover:shadow-2xl ${f.glow} transition-all duration-300 cursor-default`}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${f.accent} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={22} className={f.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 mb-1">{t(`aiLearning.feature${f.key}Title`)}</h3>
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider ${f.color}`}>AI-Powered</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed pl-16">{t(`aiLearning.feature${f.key}Desc`)}</p>
                    <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-slate-100 to-transparent group-hover:via-blue-200 transition-all duration-300" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">{t('aiLearning.howTitle')}</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">{t('aiLearning.howSub')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: 1, color: 'from-blue-500 to-blue-600' },
                { n: 2, color: 'from-amber-500 to-orange-500' },
                { n: 3, color: 'from-emerald-500 to-teal-500' },
              ].map((step) => (
                <div key={step.n} className="relative bg-white rounded-2xl p-6 border border-slate-100 text-center hover:shadow-lg transition-all">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-lg flex items-center justify-center mx-auto mb-4`}>
                    {step.n}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{t(`aiLearning.howStep${step.n}Title`)}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{t(`aiLearning.howStep${step.n}Desc`)}</p>
                  {step.n < 3 && <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-slate-200" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Target Users */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">{t('aiLearning.usersTitle')}</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">{t('aiLearning.usersSub')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {USERS.map((u) => {
                const Icon = u.icon;
                return (
                  <div key={u.key} className="bg-white rounded-2xl p-6 border border-slate-100 text-center hover:shadow-lg transition-all">
                    <div className={`w-14 h-14 rounded-2xl ${u.bg} flex items-center justify-center mx-auto mb-4`}>
                      <Icon size={24} className={u.color} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{t(`aiLearning.user${u.key}Title`)}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{t(`aiLearning.user${u.key}Desc`)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">{t('aiLearning.benefitsTitle')}</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">{t('aiLearning.benefitsSub')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.key} className="bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center text-white mb-3`}>
                      <Icon size={20} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{t(`aiLearning.benefit${b.key}Title`)}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{t(`aiLearning.benefit${b.key}Desc`)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">{t('aiLearning.roadmapTitle')}</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">{t('aiLearning.roadmapSub')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PHASES.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div key={p.key} className="bg-white rounded-2xl p-6 border border-slate-100 relative overflow-hidden hover:shadow-lg transition-all">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${p.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-2 block">{t(`aiLearning.phase${p.key}`)}</span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-3`}>
                      <Icon size={18} />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{t(`aiLearning.phase${p.key}Items`)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <FaBookOpen size={40} className="text-blue-300 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{t('aiLearning.ctaTitle')}</h2>
            <p className="text-blue-200 mb-8 max-w-lg mx-auto">{t('aiLearning.ctaDesc')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={openAuth} className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg">
                <FaPlay size={14} /> {t('aiLearning.ctaBtn')}
              </button>
              <a href="/#contact" className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <FaShieldAlt size={14} /> {t('aiLearning.ctaSecondary')}
              </a>
            </div>
          </div>
        </section>
      </div>

      <AILearningAuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
