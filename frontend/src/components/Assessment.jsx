import { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaArrowRight, FaCertificate, FaRedo, FaSpinner } from 'react-icons/fa';

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

export default function Assessment({ course, userName, onComplete }) {
  const category = course.category || 'general';
  const questions = QUESTIONS[category] || QUESTIONS.general;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showCert, setShowCert] = useState(false);

  const correct = questions.filter((q, i) => answers[i] === q.answer).length;
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= 70;

  const handleAnswer = (idx) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [current]: idx }));
  };

  const handleSubmit = () => setSubmitted(true);

  if (showCert) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full p-8 text-center shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Certificate of Completion</h2>
          <p className="text-sm text-slate-500 mb-4">CS Hub (iCT) — Computer Support</p>
          <div className="border-2 border-amber-300 rounded-xl p-6 mb-4 bg-gradient-to-br from-amber-50 to-white">
            <p className="text-sm text-slate-600 mb-2">This certifies that</p>
            <p className="text-xl font-bold text-slate-900 mb-2">{userName || 'Student'}</p>
            <p className="text-sm text-slate-600 mb-1">has successfully completed the course</p>
            <p className="text-lg font-bold text-[#FFCE08] mb-2">"{course.title}"</p>
            <p className="text-xs text-slate-400">Score: {score}% | {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.print()} className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-bold hover:from-blue-600 hover:to-blue-700 transition-all">Print Certificate</button>
            <button onClick={() => onComplete?.()} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all">Done</button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl">
          {passed ? (
            <>
              <FaCheckCircle className="mx-auto h-14 w-14 text-emerald-500 mb-3" />
              <h2 className="text-xl font-bold text-slate-900 mb-1">Congratulations!</h2>
              <p className="text-sm text-slate-500 mb-4">You passed the assessment</p>
              <div className="text-5xl font-black text-emerald-500 mb-2">{score}%</div>
              <p className="text-xs text-slate-400 mb-6">{correct} of {questions.length} correct</p>
              <button onClick={() => setShowCert(true)} className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 rounded-xl text-sm font-bold hover:from-amber-500 hover:to-yellow-500 transition-all flex items-center justify-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>
                Get Certificate
              </button>
            </>
          ) : (
            <>
              <FaTimesCircle className="mx-auto h-14 w-14 text-red-400 mb-3" />
              <h2 className="text-xl font-bold text-slate-900 mb-1">Not Quite There Yet</h2>
              <p className="text-sm text-slate-500 mb-4">You need 70% to pass</p>
              <div className="text-5xl font-black text-red-400 mb-2">{score}%</div>
              <p className="text-xs text-slate-400 mb-6">{correct} of {questions.length} correct</p>
              <button onClick={() => { setSubmitted(false); setAnswers({}); setCurrent(0); }} className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-bold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2">
                <FaRedo /> Try Again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">Course Assessment</h3>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">{current + 1}/{questions.length}</span>
          </div>
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <p className="text-sm font-semibold text-slate-800 mb-4">{q.q}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  answers[current] === i
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 mr-3">{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <button onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors flex items-center gap-1">
            <FaArrowLeft size={10} /> Back
          </button>
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent((c) => c + 1)}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-bold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-1">
              Next <FaArrowRight size={10} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
