import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaRedo, FaCheck, FaTimes, FaLaptop, FaGoogle, FaShieldAlt, FaStar, FaShareAlt, FaHeart, FaFire, FaBolt } from 'react-icons/fa';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const ALL_QUESTIONS = {
  basics: [
    { q: 'What is the primary function of the CPU?', options: ['Store data permanently', 'Process instructions and calculations', 'Display visual output', 'Connect to internet'], answer: 1, tip: 'The CPU is the brain — it does all the thinking.' },
    { q: 'What does RAM do?', options: ['Stores files permanently', 'Provides temporary working memory', 'Processes graphics', 'Connects to WiFi'], answer: 1, tip: 'RAM is fast temporary memory. It loses data when turned off.' },
    { q: 'Which port connects monitors?', options: ['USB', 'HDMI', 'Ethernet', 'Audio'], answer: 1, tip: 'HDMI sends both picture and sound to your screen.' },
    { q: 'What is an operating system?', options: ['A game', 'Software that manages hardware and apps', 'A type of hardware', 'An internet browser'], answer: 1, tip: 'Windows, macOS, and Linux are operating systems.' },
    { q: 'What does a motherboard do?', options: ['Cools the computer', 'Connects all components together', 'Stores your files', 'Displays images'], answer: 1, tip: 'Every part plugs into the motherboard to communicate.' },
    { q: 'What is an SSD?', options: ['A type of RAM', 'Fast storage with no moving parts', 'A monitor', 'A processor'], answer: 1, tip: 'SSDs are much faster than old hard drives.' },
    { q: 'What is a peripheral device?', options: ['A CPU part', 'An external device like a mouse or printer', 'A type of software', 'A memory chip'], answer: 1, tip: 'Peripherals are extras you plug into your computer.' },
    { q: 'What does a firewall do?', options: ['Cools the PC', 'Blocks unauthorized network access', 'Speeds up internet', 'Stores passwords'], answer: 1, tip: 'A firewall is a security guard for your internet.' },
    { q: 'What is the BIOS?', options: ['A browser', 'First program that runs when you start your PC', 'A virus', 'A file format'], answer: 1, tip: 'BIOS checks all hardware before the operating system loads.' },
    { q: 'What is virtual memory?', options: ['Cloud storage', 'Using hard drive space as extra RAM', 'GPU memory', 'USB memory'], answer: 1, tip: 'When RAM is full, your PC borrows hard drive space.' },
    { q: 'What is a byte?', options: ['1 bit', '8 bits', '16 bits', '100 bits'], answer: 1, tip: 'A byte is 8 bits — the basic unit of digital data.' },
    { q: 'What does USB stand for?', options: ['Universal Serial Bus', 'Unified System Board', 'Ultra Speed Bond', 'Universal System Backup'], answer: 0, tip: 'USB is the standard for connecting devices to your computer.' },
  ],
  msoffice: [
    { q: 'What does Ctrl+C do?', options: ['Cut text', 'Copy selected content', 'Close the window', 'Clear formatting'], answer: 1, tip: 'Ctrl+C copies. Ctrl+X cuts. Ctrl+V pastes.' },
    { q: 'What does Ctrl+Z do?', options: ['Redo action', 'Undo last action', 'Save file', 'Select all'], answer: 1, tip: 'Ctrl+Z undoes your last mistake — your best friend!' },
    { q: 'How do you bold text in Word?', options: ['Ctrl+I', 'Ctrl+B', 'Ctrl+U', 'Ctrl+D'], answer: 1, tip: 'Ctrl+B = Bold, Ctrl+I = Italic, Ctrl+U = Underline.' },
    { q: 'What is a PivotTable in Excel?', options: ['A chart type', 'A tool to summarize large datasets', 'A formatting option', 'A function'], answer: 1, tip: 'PivotTables automatically organize and summarize data.' },
    { q: 'How do you create a hyperlink in Word?', options: ['Ctrl+H', 'Ctrl+K', 'Ctrl+L', 'Ctrl+J'], answer: 1, tip: 'Ctrl+K inserts a clickable link.' },
    { q: 'What does the Format Painter do?', options: ['Draws shapes', 'Copies formatting from one text to another', 'Changes colors', 'Prints documents'], answer: 1, tip: 'It copies the look (bold, size, color) from one text to another.' },
    { q: 'How do you freeze rows in Excel?', options: ['View > Freeze Panes', 'Insert > Freeze', 'Data > Lock', 'Format > Freeze'], answer: 0, tip: 'Freeze Panes keeps headers visible while scrolling.' },
    { q: 'What does Ctrl+D do in Excel?', options: ['Delete cell', 'Fill down from cell above', 'Open font dialog', 'Duplicate file'], answer: 1, tip: 'Ctrl+D copies the cell above into the selected cell.' },
    { q: 'What is Track Changes in Word?', options: ['Tracks website visits', 'Records all edits made to a document', 'Monitors computer speed', 'Logs file downloads'], answer: 1, tip: 'Track Changes shows who edited what in a document.' },
    { q: 'What does Slide Master control in PowerPoint?', options: ['One slide only', 'Global design for all slides', 'Animation speed', 'Print settings'], answer: 1, tip: 'Change Slide Master to update the look of every slide at once.' },
    { q: 'What does VLOOKUP do in Excel?', options: ['Looks up values vertically in a table', 'Sorts data', 'Creates charts', 'Validates input'], answer: 0, tip: 'VLOOKUP searches down a column and returns data from the same row.' },
    { q: 'What is the max rows in modern Excel?', options: ['65,536', '1,048,576', '256', '1,000'], answer: 1, tip: 'Over 1 million rows — enough for very large datasets.' },
  ],
  google: [
    { q: 'What is Google Workspace?', options: ['A game', 'Cloud tools for work and collaboration', 'A social network', 'A search engine'], answer: 1, tip: 'It includes Gmail, Docs, Sheets, Slides, and Drive.' },
    { q: 'How do you share a Google Doc?', options: ['File > Share', 'Edit > Send', 'Tools > Collaborate', 'View > Share'], answer: 0, tip: 'Click Share and enter the person\'s email address.' },
    { q: 'What is Google Drive?', options: ['An email app', 'Cloud storage for your files', 'A video platform', 'A browser'], answer: 1, tip: 'Drive stores all your Google files in the cloud.' },
    { q: 'How do you start a formula in Sheets?', options: ['Start with =', 'Start with @', 'Start with #', 'Start with !'], answer: 0, tip: 'Every formula in Sheets starts with an equals sign.' },
    { q: 'What is Google Classroom?', options: ['A video call tool', 'A platform for managing classes and assignments', 'A drawing app', 'A game platform'], answer: 1, tip: 'Teachers use it to post work and grade assignments.' },
    { q: 'How do you start a slideshow in Slides?', options: ['View > Present', 'File > Run', 'Edit > Play', 'Tools > Start'], answer: 0, tip: 'Click Present to show your slides in full screen.' },
    { q: 'What does "Viewer" permission mean?', options: ['Can edit', 'Can only view, not change anything', 'Can comment', 'Can delete'], answer: 1, tip: 'Viewers see the file but cannot make changes.' },
    { q: 'How do you insert a pivot table in Sheets?', options: ['Insert > Pivot table', 'Charts', 'Conditional formatting', 'Data validation'], answer: 0, tip: 'Go to Insert > Pivot table to summarize your data.' },
    { q: 'What is the Gmail attachment limit?', options: ['5 MB', '10 MB', '25 MB', '100 MB'], answer: 2, tip: 'For bigger files, share via Google Drive instead.' },
    { q: 'What does Suggesting mode do in Docs?', options: ['Deletes text', 'Shows edits as suggestions to accept or reject', 'Blocks editing', 'Adds comments only'], answer: 1, tip: 'Owners decide whether to keep or remove each suggestion.' },
    { q: 'How do you use Docs offline?', options: ['Enable offline in Drive settings', 'Use a VPN', 'Download everything', 'Not possible'], answer: 0, tip: 'Turn on offline mode in Google Drive settings.' },
    { q: 'How do you insert an image in Docs?', options: ['Insert > Image', 'Edit > Picture', 'Tools > Add', 'View > Media'], answer: 0, tip: 'Insert > Image — upload, use a URL, or pick from Drive.' },
  ],
  digital: [
    { q: 'What is phishing?', options: ['A game', 'A scam to steal your personal information', 'A type of virus', 'A file format'], answer: 1, tip: 'Phishing uses fake emails to trick you into giving away passwords.' },
    { q: 'What makes a strong password?', options: ['Your birthdate', 'A mix of letters, numbers, and symbols', 'The word "password"', 'Your name'], answer: 1, tip: 'Use 12+ characters with uppercase, lowercase, numbers, and symbols.' },
    { q: 'What is two-factor authentication?', options: ['Two passwords', 'A second verification step beyond your password', 'Logging in twice', 'Two email accounts'], answer: 1, tip: '2FA = password + code from your phone. Much harder to hack.' },
    { q: 'What does HTTPS mean?', options: ['A secure website connection', 'High-speed internet', 'A file type', 'A browser feature'], answer: 0, tip: 'HTTPS encrypts your data — look for the lock icon.' },
    { q: 'What is malware?', options: ['Good software', 'Malicious software designed to harm your computer', 'An operating system', 'A type of hardware'], answer: 1, tip: 'Malware includes viruses, spyware, ransomware, and trojans.' },
    { q: 'What is the Recycle Bin?', options: ['Permanent deletion', 'A temporary holding place for deleted files', 'A backup tool', 'A compression tool'], answer: 1, tip: 'Deleted files go here first — you can recover them.' },
    { q: 'What is cloud storage?', options: ['A physical hard drive', 'Storing files on internet servers', 'A USB drive', 'Local RAM'], answer: 1, tip: 'Cloud storage lets you access files from any device, anywhere.' },
    { q: 'How often should you back up files?', options: ['Once a year', 'Regularly — weekly or after big changes', 'Never', 'Only when broken'], answer: 1, tip: 'Regular backups protect against data loss.' },
    { q: 'What does a browser cache do?', options: ['Deletes files', 'Stores temporary data for faster loading', 'Blocks viruses', 'Compresses files'], answer: 1, tip: 'Cache saves parts of websites so they load faster next time.' },
    { q: 'What is a zip file?', options: ['A corrupted file', 'A compressed archive of files', 'An image type', 'A video format'], answer: 1, tip: 'Zip files pack multiple files into one smaller file.' },
    { q: 'What does Ctrl+Alt+Delete do?', options: ['Shuts down PC', 'Opens Task Manager / Security options', 'Opens file explorer', 'Undoes action'], answer: 1, tip: 'It opens the Windows security screen.' },
    { q: 'What is the difference between virus and malware?', options: ['Same thing', 'Malware is general; virus is one type', 'Virus is worse', 'Malware only affects phones'], answer: 1, tip: 'Malware is the umbrella term. A virus copies itself.' },
  ],
};

const CATEGORIES = {
  basics: { icon: FaLaptop, label: 'Computer Basics', color: '#5694F7', gradient: 'linear-gradient(135deg, #5694F7, #3b82f6)' },
  msoffice: { icon: FaStar, label: 'MS Office', color: '#25D366', gradient: 'linear-gradient(135deg, #25D366, #16a34a)' },
  google: { icon: FaGoogle, label: 'Google', color: '#EA4335', gradient: 'linear-gradient(135deg, #EA4335, #dc2626)' },
  digital: { icon: FaShieldAlt, label: 'Digital Safety', color: '#FFCE08', gradient: 'linear-gradient(135deg, #FFCE08, #f59e0b)' },
};

const QUESTION_TIME = 60;

export default function GamePlay() {
  const { category } = useParams();
  const navigate = useNavigate();
  const cat = CATEGORIES[category];

  const [questions] = useState(() => shuffle(ALL_QUESTIONS[category] || ALL_QUESTIONS.basics));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [cardAnim, setCardAnim] = useState('');
  const timerRef = useRef(null);

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  useEffect(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) { clearTimer(); setGameOver(true); return 0; }
        return p - 1;
      });
    }, 1000);
    return clearTimer;
  }, []);

  useEffect(() => { if (gameOver) clearTimer(); }, [gameOver]);

  if (!cat) return <div style={{ padding: '4rem', textAlign: 'center' }}><p>Invalid category.</p><button className="btn" onClick={() => navigate('/')}>Go Home</button></div>;

  const handleAnswer = (optIdx) => {
    if (answered) return;
    setSelected(optIdx);
    setAnswered(true);
    setShowTip(true);
    clearTimer();
    const q = questions[idx];
    const isCorrect = optIdx === q.answer;
    if (isCorrect) {
      const bonus = Math.min(streak + 1, 5);
      const timeBonus = Math.floor(timeLeft / 10);
      setScore((s) => s + (10 * bonus) + timeBonus);
      setStreak((s) => s + 1);
      setCardAnim('card-correct');
    } else {
      setStreak(0);
      setCardAnim('card-wrong');
    }
    setAnswers((a) => [...a, { q: q.q, selected: optIdx, correct: q.answer, options: q.options, isCorrect, tip: q.tip }]);
  };

  const nextQuestion = () => {
    if (idx + 1 >= questions.length) { setGameOver(true); return; }
    setIdx((i) => i + 1);
    setSelected(null); setAnswered(false); setShowTip(false); setCardAnim('');
    setTimeLeft(QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => { if (p <= 1) { clearTimer(); setGameOver(true); return 0; } return p - 1; });
    }, 1000);
  };

  const restart = () => {
    clearTimer();
    setIdx(0); setScore(0); setStreak(0); setLives(3); setTimeLeft(QUESTION_TIME);
    setSelected(null); setAnswered(false); setShowTip(false); setAnswers([]); setGameOver(false); setCardAnim('');
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => { if (p <= 1) { clearTimer(); setGameOver(true); return 0; } return p - 1; });
    }, 1000);
  };

  const handleShare = () => {
    const correct = answers.filter((a) => a.isCorrect).length;
    const text = `I scored ${score} points (${correct}/${answers.length} correct) on "${cat.label}" at CS hub (iCT)! 🎯\n\nCan you beat my score? ${window.location.origin}/play/${category}`;
    if (navigator.share) navigator.share({ title: 'CS hub (iCT)', text });
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => alert('Result copied!'));
  };

  if (gameOver) {
    const correct = answers.filter((a) => a.isCorrect).length;
    const pct = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;
    return (
      <div className="gameplay-wrap">
        <div className="speed-game-over">
          <div className="sgo-header" style={{ background: cat.gradient }}>
            <FaBolt size={28} />
            <h3>Game Over!</h3>
            <span className="sgo-score">{score} pts</span>
          </div>
          <div className="sgo-stats">
            <div className="sgo-stat"><span className="sgo-stat-num" style={{ color: '#10b981' }}>{correct}</span><span>Correct</span></div>
            <div className="sgo-stat"><span className="sgo-stat-num" style={{ color: '#ef4444' }}>{answers.length - correct}</span><span>Wrong</span></div>
            <div className="sgo-stat"><span className="sgo-stat-num" style={{ color: cat.color }}>{pct}%</span><span>Accuracy</span></div>
          </div>
          <div className="sgo-actions">
            <button className="btn" type="button" onClick={restart}><FaRedo /> Play Again</button>
            <button className="btn btn-share" type="button" onClick={handleShare}><FaShareAlt /> Share</button>
            <button className="btn btn-outline" type="button" onClick={() => navigate('/')}><FaArrowLeft /> Home</button>
          </div>
          <div className="sgo-review">
            <h4>Question Review</h4>
            {answers.map((a, i) => (
              <div key={i} className={`sgo-review-item ${a.isCorrect ? 'correct' : 'wrong'}`}>
                <div className="sgo-review-head">
                  <span className={`sgo-review-badge ${a.isCorrect ? 'correct' : 'wrong'}`}>{a.isCorrect ? <FaCheck /> : <FaTimes />}</span>
                  <span className="sgo-review-q">{a.q}</span>
                </div>
                <div className="sgo-review-body">
                  <div className="sgo-review-row">
                    <span className="sgo-review-label">Your answer:</span>
                    <span className={`sgo-review-val ${a.isCorrect ? 'correct' : 'wrong'}`}>{a.selected >= 0 ? a.options[a.selected] : 'Timed out'}</span>
                  </div>
                  {!a.isCorrect && (
                    <div className="sgo-review-row">
                      <span className="sgo-review-label">Correct:</span>
                      <span className="sgo-review-val correct">{a.options[a.correct]}</span>
                    </div>
                  )}
                  <p className="sgo-review-tip">{a.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const timerPct = (timeLeft / QUESTION_TIME) * 100;
  const progress = ((idx) / questions.length) * 100;

  return (
    <div className="gameplay-wrap">
      <div className="speed-game">
        <div className="sg-top">
          <button className="sg-back" type="button" onClick={() => navigate('/')}><FaArrowLeft /></button>
          <div className="sg-lives">
            {[1, 2, 3].map((h) => <FaHeart key={h} className={`sg-heart ${h <= lives ? 'alive' : 'dead'}`} />)}
          </div>
          <div className={`sg-timer-ring ${timeLeft <= 10 ? 'low' : ''}`} style={{ '--timer-pct': `${timerPct}%`, '--timer-color': timeLeft <= 10 ? '#ef4444' : cat.color }}>
            <span>{timeLeft}</span>
          </div>
          <div className="sg-score-wrap">
            <FaStar className="sg-score-icon" />
            <span className="sg-score-num">{score}</span>
          </div>
        </div>

        {streak >= 2 && (
          <div className="sg-streak" style={{ background: cat.gradient }}>
            <FaFire /> {streak}x Streak! +{Math.min(streak, 5)}x bonus
          </div>
        )}

        <div className="sg-progress"><div style={{ width: `${progress}%`, background: cat.gradient }} /></div>
        <p className="sg-q-count">Q{idx + 1} / {questions.length}</p>

        <div className={`sg-card ${cardAnim}`}>
          <p className="sg-question">{q.q}</p>
          <div className="sg-options">
            {q.options.map((opt, i) => {
              let cls = 'sg-opt';
              if (answered) {
                if (i === q.answer) cls += ' correct';
                else if (i === selected) cls += ' wrong';
              }
              return <button key={i} className={cls} type="button" onClick={() => handleAnswer(i)} disabled={answered}>{opt}</button>;
            })}
          </div>
          {showTip && (
            <div className="sg-tip">
              <p>{q.tip}</p>
              <button className="btn" type="button" onClick={nextQuestion}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
