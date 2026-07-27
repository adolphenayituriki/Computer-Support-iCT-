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
  FaBrain, FaSearch, FaChartBar, FaBookOpen, FaCogs, FaPlay, FaShieldAlt,
  FaExternalLinkAlt
} from 'react-icons/fa';

const FEATURES = [
  { icon: FaRobot, key: 1, action: 'tutor', tag: 'Interactive', category: 'tutoring' },
  { icon: FaImage, key: 2, action: 'topic', tag: 'Creative', category: 'content' },
  { icon: FaVideo, key: 3, action: 'topic', tag: 'Visual', category: 'content' },
  { icon: FaHeadphones, key: 4, action: 'topic', tag: 'Audio', category: 'content' },
  { icon: FaFlask, key: 5, action: 'topic', tag: 'Hands-on', category: 'content' },
  { icon: FaQuestionCircle, key: 6, action: 'quiz', tag: 'Practice', category: 'practice' },
  { icon: FaPuzzlePiece, key: 7, action: 'topic', tag: 'Adaptive', category: 'tutoring' },
  { icon: FaBrain, key: 8, action: 'topic', tag: 'Smart', category: 'practice' },
  { icon: FaChartBar, key: 9, action: 'progress', tag: 'Insights', category: 'tracking' },
  { icon: FaRoute, key: 10, action: 'dashboard', tag: 'Planning', category: 'tracking' },
  { icon: FaLanguage, key: 11, action: 'topic', tag: 'Languages', category: 'content' },
  { icon: FaMicroscope, key: 12, action: 'topic', tag: 'Science', category: 'content' },
  { icon: FaChalkboardTeacher, key: 13, action: 'dashboard', tag: 'Teaching', category: 'tracking' },
];

const CATEGORIES = [
  { value: 'all', label: 'All Tools' },
  { value: 'content', label: 'Learning Content' },
  { value: 'tutoring', label: 'AI Tutoring' },
  { value: 'practice', label: 'Practice & Quizzes' },
  { value: 'tracking', label: 'Progress Tracking' },
];

const BENEFITS = [
  { icon: FaLightbulb, key: 1 },
  { icon: FaCogs, key: 2 },
  { icon: FaRocket, key: 3 },
  { icon: FaGlobe, key: 4 },
];

export default function AILearning() {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => setSlide((p) => (p + 1) % 2), 6000);
    return () => clearInterval(timer);
  }, []);

  const openAuth = () => user ? navigate('/ai-dashboard') : setShowAuth(true);

  const openFeature = (action) => {
    if (!user) { setShowAuth(true); return; }
    navigate('/ai-dashboard');
  };

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

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 lg:py-40 w-full">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
                <FaStar size={12} /> {t('aiLearning.heroBadge')}
              </span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-2" style={{ letterSpacing: '-0.03em' }}>
                {t('aiLearning.heroTitle')}
              </h1>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-blue-300 mb-3" style={{ letterSpacing: '-0.02em' }}>
                {t('aiLearning.heroSub')}
              </h2>

              <p className="text-sm sm:text-base text-slate-300 mb-6 max-w-lg leading-relaxed">
                {t('aiLearning.heroDesc')}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-8">
                <a href="#ai-features" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30">
                  <FaSearch size={13} /> {t('aiLearning.heroCta')}
                </a>
                <button onClick={openAuth} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition-all backdrop-blur-sm">
                  <FaArrowRight size={13} /> {t('aiLearning.heroSecondary')}
                </button>

                <div className="hidden sm:flex items-center gap-5 ml-auto">
                  {[
                    { icon: FaRobot, value: '13', label: 'AI Features' },
                    { icon: FaGraduationCap, value: '6+', label: 'Subjects' },
                    { icon: FaGlobe, value: '3', label: 'Languages' },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <s.icon size={16} className="text-blue-400 mx-auto mb-0.5" />
                      <div className="text-lg font-extrabold text-white">{s.value}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile stats — shown below buttons on small screens */}
              <div className="flex sm:hidden gap-6">
                {[
                  { icon: FaRobot, value: '13', label: 'AI Features' },
                  { icon: FaGraduationCap, value: '6+', label: 'Subjects' },
                  { icon: FaGlobe, value: '3', label: 'Languages' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <s.icon size={16} className="text-blue-400 mx-auto mb-0.5" />
                    <div className="text-lg font-extrabold text-white">{s.value}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{s.label}</div>
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
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">{t('aiLearning.featuresTitle')}</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t('aiLearning.featuresSub')}</p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl mx-auto mb-12">
              <div className="relative flex-1">
                <FaSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.filter(f => {
                const matchesSearch = !searchQuery ||
                  t(`aiLearning.feature${f.key}Title`).toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t(`aiLearning.feature${f.key}Desc`).toLowerCase().includes(searchQuery.toLowerCase()) ||
                  f.tag.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
                return matchesSearch && matchesCategory;
              }).map((f) => {
                const Icon = f.icon;
                const isAvailable = !!f.action;
                return (
                  <div key={f.key} className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 flex flex-col">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 mb-0.5">{t(`aiLearning.feature${f.key}Title`)}</h3>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-500">{f.tag}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed sm:pl-14 mb-4 flex-1">{t(`aiLearning.feature${f.key}Desc`)}</p>
                    <div className="sm:pl-14">
                      {isAvailable ? (
                        <button
                          onClick={() => openFeature(f.action)}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${user ? `bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10` : `bg-[#FFCE08]/15 hover:bg-[#FFCE08]/25 text-slate-800 border border-[#FFCE08]/30`}`}
                        >
                          {user ? 'Open' : 'Sign In to Access'}
                          <FaArrowRight size={10} />
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {FEATURES.filter(f => {
                const matchesSearch = !searchQuery ||
                  t(`aiLearning.feature${f.key}Title`).toLowerCase().includes(searchQuery.toLowerCase()) ||
                  t(`aiLearning.feature${f.key}Desc`).toLowerCase().includes(searchQuery.toLowerCase()) ||
                  f.tag.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
                return matchesSearch && matchesCategory;
              }).length === 0 && (
                <div className="col-span-full text-center py-16">
                  <FaSearch size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">No tools match your search</p>
                  <p className="text-xs text-slate-400 mt-1">Try different keywords or clear the filter</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">{t('aiLearning.howTitle')}</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t('aiLearning.howSub')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { n: 1, text: 'text-blue-600' },
                { n: 2, text: 'text-amber-600' },
                { n: 3, text: 'text-emerald-600' },
              ].map((step) => (
                <div key={step.n} className="relative group text-center px-4">
                  <span style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }} className={`text-7xl font-black ${step.text} opacity-20 block mb-2 select-none`}>
                    {step.n}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{t(`aiLearning.howStep${step.n}Title`)}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{t(`aiLearning.howStep${step.n}Desc`)}</p>
                  {step.n < 3 && (
                    <div className="hidden md:flex absolute top-6 -right-3 w-6 items-center justify-center">
                      <div className="w-full h-0.5 bg-slate-200" />
                      <div className="absolute right-0 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Target Users */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                <FaUsers size={12} /> For Everyone
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">{t('aiLearning.usersTitle')}</h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm leading-relaxed">{t('aiLearning.usersSub')}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Students — Large card */}
              <div className="group relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white overflow-hidden hover:shadow-2xl hover:shadow-blue-200 transition-all duration-300 lg:row-span-2 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10">
                  <FaGraduationCap size={32} className="text-white mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-extrabold mb-3">{t('aiLearning.user1Title')}</h3>
                  <p className="text-blue-100 text-sm leading-relaxed max-w-md">{t('aiLearning.user1Desc')}</p>
                </div>
                <div className="relative z-10 mt-8 flex flex-wrap gap-2">
                  {['Personalized Lessons', 'AI Tutor 24/7', 'Visual Learning', 'Progress Tracking'].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-white/10 text-[11px] font-medium text-blue-100 backdrop-blur-sm">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Teachers — Large card */}
              <div className="group relative bg-gradient-to-br from-[#FFCE08] to-[#e6b800] rounded-3xl p-8 text-slate-900 overflow-hidden hover:shadow-2xl hover:shadow-amber-200 transition-all duration-300 lg:row-span-2 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10">
                  <FaChalkboardTeacher size={32} className="text-slate-900 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-extrabold mb-3">{t('aiLearning.user2Title')}</h3>
                  <p className="text-slate-700 text-sm leading-relaxed max-w-md">{t('aiLearning.user2Desc')}</p>
                </div>
                <div className="relative z-10 mt-8 flex flex-wrap gap-2">
                  {['Auto-Marking', 'Lesson Plans', 'Quiz Builder', 'Class Analytics'].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-white/30 text-[11px] font-semibold text-slate-900 backdrop-blur-sm">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Schools — Small card */}
              <div className="group bg-white rounded-3xl p-6 border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/40 transition-all duration-300">
                <FaSchool size={24} className="text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-base font-bold text-slate-900 mb-1">{t('aiLearning.user3Title')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{t('aiLearning.user3Desc')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Results', 'Digital'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-purple-50 text-[10px] font-semibold text-purple-600">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Parents — Small card */}
              <div className="group bg-white rounded-3xl p-6 border border-slate-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/40 transition-all duration-300">
                <FaUsers size={24} className="text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="text-base font-bold text-slate-900 mb-1">{t('aiLearning.user4Title')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{t('aiLearning.user4Desc')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Monitor', 'Connect'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-amber-50 text-[10px] font-semibold text-amber-600">{tag}</span>
                  ))}
                </div>
              </div>
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
                    <Icon size={28} className="text-slate-700 mb-3" />
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{t(`aiLearning.benefit${b.key}Title`)}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{t(`aiLearning.benefit${b.key}Desc`)}</p>
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
