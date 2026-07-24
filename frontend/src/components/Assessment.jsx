import { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaArrowRight, FaRedo, FaSpinner, FaTimes, FaClipboardCheck, FaAward } from 'react-icons/fa';
import Certificate from './course-player/Certificate';

const QUESTIONS = {
  general: [
    { q: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], answer: 0 },
    { q: 'Which of these is an output device?', options: ['Keyboard', 'Mouse', 'Monitor', 'Scanner'], answer: 2 },
    { q: 'What is the main function of an operating system?', options: ['Run applications', 'Manage hardware and software resources', 'Browse the internet', 'Create documents'], answer: 1 },
    { q: 'How many bits are in a byte?', options: ['4', '8', '16', '32'], answer: 1 },
    { q: 'Which file extension is commonly used for documents?', options: ['.exe', '.docx', '.jpg', '.mp3'], answer: 1 },
    { q: 'What does RAM stand for?', options: ['Read Access Memory', 'Random Access Memory', 'Run Application Memory', 'Rapid Access Module'], answer: 1 },
    { q: 'Which of these is an input device?', options: ['Speaker', 'Printer', 'Monitor', 'Microphone'], answer: 3 },
    { q: 'What is cloud computing?', options: ['Using a physical hard drive', 'Storing and accessing data over the internet', 'Using a weather app', 'Computing in the sky'], answer: 1 },
    { q: 'What does WWW stand for?', options: ['World Wide Web', 'Web World Wide', 'Wide World Web', 'World Web Wide'], answer: 0 },
    { q: 'Which of these is a web browser?', options: ['Microsoft Word', 'Google Chrome', 'Adobe Photoshop', 'Windows Explorer'], answer: 1 },
  ],
  hardware: [
    { q: 'What component is considered the "brain" of a computer?', options: ['RAM', 'Hard Drive', 'CPU', 'GPU'], answer: 2 },
    { q: 'What does HDD stand for?', options: ['High Density Data', 'Hard Disk Drive', 'Hardware Data Device', 'High Drive Disk'], answer: 1 },
    { q: 'Which component stores data permanently?', options: ['RAM', 'CPU', 'SSD/HDD', 'Cache'], answer: 2 },
    { q: 'What is the purpose of a power supply unit (PSU)?', options: ['Process data', 'Convert AC to DC power', 'Store files', 'Display images'], answer: 1 },
    { q: 'Which port is commonly used for charging modern devices?', options: ['PS/2', 'Serial', 'USB-C', 'Parallel'], answer: 2 },
    { q: 'What does GPU stand for?', options: ['General Processing Unit', 'Graphics Processing Unit', 'Graphical Power Unit', 'Global Processing Unit'], answer: 1 },
    { q: 'Which type of memory is volatile?', options: ['ROM', 'SSD', 'RAM', 'HDD'], answer: 2 },
    { q: 'What is a motherboard?', options: ['A screen', 'The main circuit board connecting all components', 'A type of software', 'A storage device'], answer: 1 },
    { q: 'What does BIOS stand for?', options: ['Basic Input Output System', 'Binary Internet Operating System', 'Basic Internal Operating System', 'Core Input Output System'], answer: 0 },
    { q: 'Which cooling method uses liquid?', options: ['Air cooling', 'Fan cooling', 'Liquid cooling', 'Passive cooling'], answer: 2 },
  ],
  software: [
    { q: 'What is an operating system?', options: ['Hardware component', 'System software that manages computer resources', 'A type of virus', 'An internet browser'], answer: 1 },
    { q: 'Which of these is an operating system?', options: ['Microsoft Office', 'Windows 11', 'Google Chrome', 'Adobe Reader'], answer: 1 },
    { q: 'What is malware?', options: ['Helpful software', 'Malicious software designed to harm', 'A type of hardware', 'A web browser'], answer: 1 },
    { q: 'What does GUI stand for?', options: ['General User Interface', 'Graphical User Interface', 'Global Utility Interface', 'Graphics Utility Integration'], answer: 1 },
    { q: 'Which software is used for word processing?', options: ['Photoshop', 'Excel', 'Microsoft Word', 'Premiere Pro'], answer: 2 },
    { q: 'What is an application?', options: ['A type of hardware', 'A program designed for end users', 'An operating system', 'A CPU component'], answer: 1 },
    { q: 'What is open-source software?', options: ['Expensive software', 'Software with freely available source code', 'Software only for developers', 'Software that only runs on Linux'], answer: 1 },
    { q: 'What does PDF stand for?', options: ['Portable Document Format', 'Personal Data File', 'Printable Document File', 'Protected Data Format'], answer: 0 },
    { q: 'Which of these is a spreadsheet application?', options: ['Word', 'PowerPoint', 'Excel', 'Outlook'], answer: 2 },
    { q: 'What is a patch in software?', options: ['A physical repair', 'An update to fix bugs or vulnerabilities', 'A type of virus', 'A new program'], answer: 1 },
  ],
  network: [
    { q: 'What does LAN stand for?', options: ['Large Area Network', 'Local Area Network', 'Long Access Network', 'Limited Area Network'], answer: 1 },
    { q: 'What device connects multiple networks together?', options: ['Modem', 'Router', 'Monitor', 'Printer'], answer: 1 },
    { q: 'What does IP stand for in networking?', options: ['Internet Protocol', 'Internal Program', 'Information Provider', 'Integrated Platform'], answer: 0 },
    { q: 'What is a firewall?', options: ['A physical wall', 'A security system monitoring network traffic', 'A type of virus', 'An internet browser'], answer: 1 },
    { q: 'What does WiFi stand for?', options: ['Wireless Fidelity', 'Wide Fidelity', 'Wireless Frequency', 'Wired Fidelity'], answer: 0 },
    { q: 'What is the most common port for HTTP?', options: ['21', '25', '80', '443'], answer: 2 },
    { q: 'What does DNS stand for?', options: ['Domain Name System', 'Data Network Service', 'Digital Name Server', 'Direct Network System'], answer: 0 },
    { q: 'What is a VPN?', options: ['Virtual Private Network', 'Very Private Network', 'Visual Processing Node', 'Verified Public Network'], answer: 0 },
    { q: 'Which protocol is used for sending emails?', options: ['FTP', 'SMTP', 'HTTP', 'SSH'], answer: 1 },
    { q: 'What does HTTPS stand for?', options: ['HyperText Transfer Protocol Secure', 'High Transfer Text Protocol', 'Hyper Text Transit Protocol', 'Secure Hyper Transfer System'], answer: 0 },
  ],
  virus: [
    { q: 'What is a computer virus?', options: ['A hardware defect', 'A malicious program that replicates itself', 'A type of internet connection', 'A computer component'], answer: 1 },
    { q: 'What does antivirus software do?', options: ['Speeds up the computer', 'Detects and removes malicious software', 'Creates backups', 'Manages files'], answer: 1 },
    { q: 'What is phishing?', options: ['A type of fishing', 'A fraud attempt to steal personal information', 'A network protocol', 'A file format'], answer: 1 },
    { q: 'What is a Trojan horse?', options: ['A game', 'Malware disguised as legitimate software', 'A type of hardware', 'A network device'], answer: 1 },
    { q: 'What is ransomware?', options: ['Free software', 'Malware that encrypts files and demands payment', 'A backup tool', 'An operating system'], answer: 1 },
    { q: 'What is the best way to protect against phishing?', options: ['Click all links', 'Verify sender and avoid suspicious links', 'Share your password', 'Ignore updates'], answer: 1 },
    { q: 'What does a firewall protect against?', options: ['Hardware failure', 'Unauthorized network access', 'Power outages', 'Screen damage'], answer: 1 },
    { q: 'What is social engineering?', options: ['A type of hardware', 'Manipulating people into revealing information', 'A programming language', 'An engineering degree'], answer: 1 },
    { q: 'Why are software updates important?', options: ['They change the color', 'They fix security vulnerabilities', 'They make the computer heavier', 'They are optional'], answer: 1 },
    { q: 'What should you do if you suspect a virus?', options: ['Ignore it', 'Run antivirus scan and disconnect from internet', 'Share the file', 'Turn off the computer forever'], answer: 1 },
  ],
  training: [
    { q: 'What is the best practice for creating a password?', options: ['Use your name', 'Use a mix of letters, numbers, and symbols', 'Use "123456"', 'Share it with friends'], answer: 1 },
    { q: 'What is two-factor authentication?', options: ['Using two passwords', 'A second layer of security beyond just a password', 'Logging in twice', 'Using two devices'], answer: 1 },
    { q: 'What is the purpose of a backup?', options: ['To slow down the computer', 'To keep copies of data in case of loss', 'To delete files', 'To install software'], answer: 1 },
    { q: 'How often should you back up important data?', options: ['Never', 'Regularly (weekly or more)', 'Once a year', 'Only when buying a new computer'], answer: 1 },
    { q: 'What is ergonomic computing?', options: ['Using expensive computers', 'Setting up your workspace to reduce strain and injury', 'Using only Apple products', 'Computing while exercising'], answer: 1 },
    { q: 'What is the 20-20-20 rule for eye health?', options: ['20 minutes work, 20 min break, 20 min sleep', 'Every 20 min, look at something 20 feet away for 20 sec', 'Work 20 hours, rest 20 hours', 'Use 20 apps for 20 minutes'], answer: 1 },
    { q: 'What does Ctrl+C do?', options: ['Cuts text', 'Copies selected text', 'Clears screen', 'Closes window'], answer: 1 },
    { q: 'What is cloud storage?', options: ['Storage in the sky', 'Storing data on remote servers accessed via internet', 'A type of RAM', 'An external hard drive'], answer: 1 },
    { q: 'How should you handle suspicious email attachments?', options: ['Open them immediately', 'Do not open; verify the sender first', 'Forward to everyone', 'Save to desktop'], answer: 1 },
    { q: 'What is the best way to stay safe online?', options: ['Click all links', 'Keep software updated and use strong passwords', 'Share personal info freely', 'Use public WiFi for banking'], answer: 1 },
  ],
};

export default function Assessment({ course, userName, onComplete, onClose, onPass, onFinalize, assessmentPassed, assessmentFinalized }) {
  const category = course.category || 'general';
  const questions = QUESTIONS[category] || QUESTIONS.general;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [finalized, setFinalized] = useState(false);

  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= 70;

  const handleAnswer = (idx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [current]: idx }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (score >= 70) {
      try { localStorage.setItem(`cshub-assessment-score-${course?._id}`, String(score)); } catch { /* ignore */ }
      onPass?.();
    }
  };

  if (showCert) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
        <div className="min-h-full flex flex-col">
          {/* Close bar */}
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center">
                <FaAward size={14} className="text-amber-800" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Your Certificate is Ready</h2>
                <p className="text-[11px] text-slate-400">Congratulations on completing the course!</p>
              </div>
            </div>
            <button
              onClick={() => onComplete?.()}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Certificate */}
          <Certificate
            course={course}
            userName={userName}
            assessmentScore={score}
            curriculum={{
              modules: [],
              totalLessons: 10,
              completedLessons: 10,
            }}
            assessmentPassed={true}
            completedAt={new Date().toISOString()}
          />
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl relative animate-fade-in">
          {onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
              <FaTimes size={14} />
            </button>
          )}
          {passed ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <FaCheckCircle size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Congratulations!</h2>
              <p className="text-sm text-slate-400 mb-5">You passed the assessment</p>
              <div className="text-5xl font-black text-emerald-500 mb-2">{score}%</div>
              <p className="text-xs text-slate-400 mb-6">{correct} of {questions.length} correct</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setSubmitted(false); setAnswers({}); setCurrent(0); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaRedo /> Retake
                </button>
                <button
                  onClick={() => { try { localStorage.setItem(`cshub-assessment-score-${course?._id}`, String(score)); } catch { /* ignore */ } onPass?.(); onFinalize?.(); setFinalized(true); setShowCert(true); }}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 rounded-xl text-sm font-bold hover:from-amber-500 hover:to-yellow-500 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaAward /> Final Submit
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FaTimesCircle size={32} className="text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Not Quite There Yet</h2>
              <p className="text-sm text-slate-400 mb-5">You need 70% to pass</p>
              <div className="text-5xl font-black text-slate-400 mb-2">{score}%</div>
              <p className="text-xs text-slate-400 mb-6">{correct} of {questions.length} correct</p>
              <button onClick={() => { setSubmitted(false); setAnswers({}); setCurrent(0); }} className="w-full py-3 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl text-sm font-bold hover:from-slate-800 hover:to-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <FaRedo /> Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const q = questions[current];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative animate-fade-in">
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors cursor-pointer">
            <FaTimes size={14} />
          </button>
        )}
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
              <FaClipboardCheck size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Course Assessment</h3>
              <p className="text-[11px] text-slate-400">{course.title}</p>
            </div>
            <span className="text-[11px] font-bold bg-white/10 px-3 py-1 rounded-full tabular-nums">
              {current + 1}/{questions.length}
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <p className="text-sm font-semibold text-slate-800 mb-5 leading-relaxed">{q.q}</p>
          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(i)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                  answers[current] === i
                    ? 'border-amber-400 bg-amber-50 text-amber-800 shadow-sm shadow-amber-100'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold mr-3 ${
                  answers[current] === i
                    ? 'bg-amber-400 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <button onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors flex items-center gap-1 cursor-pointer">
            <FaArrowLeft size={10} /> Back
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-medium text-slate-300 tabular-nums">{answeredCount}/{questions.length} answered</span>
            {current < questions.length - 1 ? (
              <button onClick={() => setCurrent((c) => c + 1)}
                className="px-5 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl text-sm font-bold hover:from-slate-800 hover:to-slate-900 transition-all flex items-center gap-1 cursor-pointer">
                Next <FaArrowRight size={10} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={answeredCount < questions.length}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
