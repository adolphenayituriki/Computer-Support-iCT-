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

const shuffleQuestion = (q) => {
  const indices = [0, 1, 2, 3];
  const shuffled = shuffle(indices);
  const newOptions = shuffled.map((i) => q.options[i]);
  const newAnswer = shuffled.indexOf(q.answer);
  return { ...q, options: newOptions, answer: newAnswer };
};

const ALL_QUESTIONS = {
  basics: [
    { q: 'What is the primary function of the CPU?', options: ['It permanently stores all files and data on your computer', 'It processes instructions and performs calculations for every task', 'It displays visual output on your monitor screen', 'It connects your computer to the internet network'], answer: 1, tip: 'The CPU is the brain — it does all the thinking.' },
    { q: 'What does RAM do in a computer?', options: ['It stores files and documents permanently on your hard drive', 'It provides fast temporary memory while the computer is running', 'It processes and renders graphics and video output', 'It connects your device to a WiFi or wired network'], answer: 1, tip: 'RAM is fast temporary memory. It loses data when turned off.' },
    { q: 'Which type of cable port is used to connect a monitor?', options: ['A USB port that carries data and power to peripherals', 'An HDMI port that transmits video and audio signals', 'An Ethernet port used for wired internet connections', 'An audio jack that carries sound to speakers or headphones'], answer: 1, tip: 'HDMI sends both picture and sound to your screen.' },
    { q: 'What is an operating system on a computer?', options: ['A game or entertainment program installed on the device', 'Software that manages hardware resources and runs applications', 'A physical component inside the computer case', 'A web browser used to access websites and search'], answer: 1, tip: 'Windows, macOS, and Linux are operating systems.' },
    { q: 'What is the main role of a motherboard?', options: ['It cools down the CPU and other internal parts', 'It connects all internal components so they can communicate', 'It stores your personal files, photos, and documents', 'It displays images and video on your screen'], answer: 1, tip: 'Every part plugs into the motherboard to communicate.' },
    { q: 'What is an SSD in a computer?', options: ['A type of temporary memory used for running programs', 'A fast storage device with no moving mechanical parts', 'A display screen used as an external monitor', 'A central processor that runs the operating system'], answer: 1, tip: 'SSDs are much faster than old hard drives.' },
    { q: 'What is considered a peripheral device?', options: ['A core internal part like the processor or memory', 'An external device such as a mouse, keyboard, or printer', 'A type of operating system software program', 'A memory chip installed inside the computer'], answer: 1, tip: 'Peripherals are extras you plug into your computer.' },
    { q: 'What does a firewall do on a computer?', options: ['It cools down the internal components inside the case', 'It blocks unauthorized access from external networks', 'It speeds up your internet connection for faster browsing', 'It securely stores your passwords and login details'], answer: 1, tip: 'A firewall is a security guard for your internet.' },
    { q: 'What is the BIOS on a computer?', options: ['A web browser used for surfing the internet safely', 'The first software that runs when you power on your PC', 'A malicious program designed to damage your files', 'A standard file format for saving documents and data'], answer: 1, tip: 'BIOS checks all hardware before the operating system loads.' },
    { q: 'What is virtual memory in a computer?', options: ['A cloud-based service for storing files online', 'Using hard drive space to act as extra temporary RAM', 'A dedicated graphics memory on your video card', 'An external USB drive used for extra file storage'], answer: 1, tip: 'When RAM is full, your PC borrows hard drive space.' },
    { q: 'How many bits make up one byte of data?', options: ['Exactly 1 bit of digital information', 'Exactly 8 bits combined together', 'Exactly 16 bits in a single unit', 'Exactly 100 bits as a standard group'], answer: 1, tip: 'A byte is 8 bits — the basic unit of digital data.' },
    { q: 'What does the abbreviation USB stand for?', options: ['Universal Serial Bus — a standard connection interface', 'Unified System Board — an internal computer component', 'Ultra Speed Bond — a high-speed data transfer method', 'Universal System Backup — an automatic file saving tool'], answer: 0, tip: 'USB is the standard for connecting devices to your computer.' },
  ],
  msoffice: [
    { q: 'What action does the Ctrl+C shortcut perform?', options: ['It cuts the selected text and removes it from the document', 'It copies the selected content to your clipboard', 'It closes the current window or application', 'It clears all formatting from the selected text'], answer: 1, tip: 'Ctrl+C copies. Ctrl+X cuts. Ctrl+V pastes.' },
    { q: 'What happens when you press Ctrl+Z in Office?', options: ['It redoes the last action you previously undid', 'It undoes the most recent action you performed', 'It saves the current document to your drive', 'It selects all content in the current document'], answer: 1, tip: 'Ctrl+Z undoes your last mistake — your best friend!' },
    { q: 'Which keyboard shortcut makes text bold in Word?', options: ['Ctrl+I applies italic styling to selected text', 'Ctrl+B makes the selected text bold', 'Ctrl+U adds an underline to selected text', 'Ctrl+D opens the font properties dialog box'], answer: 1, tip: 'Ctrl+B = Bold, Ctrl+I = Italic, Ctrl+U = Underline.' },
    { q: 'What is a PivotTable used for in Excel?', options: ['A visual chart type for displaying data trends', 'A tool that summarizes and organizes large datasets', 'A cell formatting option for changing text appearance', 'A lookup function for finding specific values'], answer: 1, tip: 'PivotTables automatically organize and summarize data.' },
    { q: 'Which shortcut inserts a hyperlink in Word?', options: ['Ctrl+H opens the Find and Replace dialog box', 'Ctrl+K inserts a clickable hyperlink', 'Ctrl+L aligns text to the left side of the page', 'Ctrl+J justifies text across both margins'], answer: 1, tip: 'Ctrl+K inserts a clickable link.' },
    { q: 'What does the Format Painter tool do in Office?', options: ['It draws shapes and diagrams on your slide', 'It copies visual formatting from one area to another', 'It changes the color theme of the document', 'It sends the document to a connected printer'], answer: 1, tip: 'It copies the look (bold, size, color) from one text to another.' },
    { q: 'How do you freeze rows to keep them visible in Excel?', options: ['Use the View tab and select Freeze Panes option', 'Use the Insert tab and choose the Freeze command', 'Use the Data tab and select Lock Rows feature', 'Use the Format tab and click on Freeze Rows'], answer: 0, tip: 'Freeze Panes keeps headers visible while scrolling.' },
    { q: 'What does the Ctrl+D shortcut do in Excel?', options: ['It deletes the content of the currently selected cell', 'It copies the cell directly above into current cell', 'It opens the font formatting dialog box window', 'It creates a duplicate copy of the current file'], answer: 1, tip: 'Ctrl+D copies the cell above into the selected cell.' },
    { q: 'What is the Track Changes feature in Word?', options: ['It monitors and records your browsing website activity', 'It records every edit made to a document by anyone', 'It measures and displays your computer processing speed', 'It keeps a log of all files downloaded to your computer'], answer: 1, tip: 'Track Changes shows who edited what in a document.' },
    { q: 'What does the Slide Master control in PowerPoint?', options: ['It only affects the currently selected individual slide', 'It controls the global design and layout of all slides', 'It adjusts the speed and timing of slide animations', 'It manages the print settings for the presentation'], answer: 1, tip: 'Change Slide Master to update the look of every slide at once.' },
    { q: 'What is the primary purpose of VLOOKUP in Excel?', options: ['It searches down a column and returns matching row data', 'It sorts all rows in a spreadsheet alphabetically', 'It creates visual charts from the selected data range', 'It validates user input with specific data rules'], answer: 0, tip: 'VLOOKUP searches down a column and returns data from the same row.' },
    { q: 'What is the maximum number of rows in modern Excel?', options: ['65,536 rows in older spreadsheet versions', '1,048,576 rows in the current modern version', '256 columns maximum per worksheet available', '1,000 rows as the default blank sheet limit'], answer: 1, tip: 'Over 1 million rows — enough for very large datasets.' },
  ],
  google: [
    { q: 'What is Google Workspace used for?', options: ['It is an online gaming platform for playing browser games', 'It provides cloud-based productivity and collaboration tools', 'It is a social media network for connecting with friends', 'It is a search engine for finding information online'], answer: 1, tip: 'It includes Gmail, Docs, Sheets, Slides, and Drive.' },
    { q: 'How do you share a Google Doc with someone?', options: ['Click the Share button and enter their email address', 'Use the Edit menu and select the Send option', 'Open Tools and choose the Collaborate feature', 'Go to View and click on the Share button'], answer: 0, tip: 'Click Share and enter the person\'s email address.' },
    { q: 'What is Google Drive primarily used for?', options: ['It is an email application for sending and receiving mail', 'It provides cloud storage for saving and accessing files', 'It is a video streaming platform for watching content', 'It is a web browser used for surfing the internet'], answer: 1, tip: 'Drive stores all your Google files in the cloud.' },
    { q: 'How do you begin writing a formula in Google Sheets?', options: ['Type an equals sign at the start of the cell input', 'Type an at symbol at the start of the cell input', 'Type a hashtag symbol at the start of the cell input', 'Type an exclamation mark at the start of the cell input'], answer: 0, tip: 'Every formula in Sheets starts with an equals sign.' },
    { q: 'What is Google Classroom designed for?', options: ['It is a video calling app for virtual meetings online', 'It manages classes, assignments, and student grades', 'It is a graphic design tool for creating illustrations', 'It is a gaming platform for educational games'], answer: 1, tip: 'Teachers use it to post work and grade assignments.' },
    { q: 'How do you start presenting slides in Google Slides?', options: ['Go to View and click the Present button option', 'Go to File and select the Run Presentation option', 'Go to Edit and click the Play Slideshow option', 'Go to Tools and choose the Start Presenting option'], answer: 0, tip: 'Click Present to show your slides in full screen.' },
    { q: 'What does "Viewer" permission allow in Google Docs?', options: ['It lets someone fully edit and modify the document', 'It lets someone only read without making any changes', 'It lets someone add comments but not edit content', 'It lets someone delete the document permanently'], answer: 1, tip: 'Viewers see the file but cannot make changes.' },
    { q: 'Where do you find the Pivot Table option in Sheets?', options: ['Click Insert in the menu and choose Pivot table', 'Click Charts in the toolbar to add a pivot table', 'Click Conditional formatting under the Format menu', 'Click Data validation in the Data tab menu'], answer: 0, tip: 'Go to Insert > Pivot table to summarize your data.' },
    { q: 'What is the maximum file size for Gmail attachments?', options: ['5 megabytes as the total combined attachment size', '10 megabytes for a single attached file limit', '25 megabytes as the maximum attachment file size', '100 megabytes for all email attachments combined'], answer: 2, tip: 'For bigger files, share via Google Drive instead.' },
    { q: 'What does Suggesting mode do in Google Docs?', options: ['It automatically deletes any incorrect text found', 'It shows edits as suggestions to accept or reject', 'It completely blocks all editing in the document', 'It only allows adding comments without text edits'], answer: 1, tip: 'Owners decide whether to keep or remove each suggestion.' },
    { q: 'How can you use Google Docs when offline?', options: ['Turn on offline mode in your Drive settings menu', 'Install and use a VPN connection for internet access', 'Download all documents to your computer first', 'It is not possible to use Docs without internet'], answer: 0, tip: 'Turn on offline mode in Google Drive settings.' },
    { q: 'How do you insert an image into a Google Doc?', options: ['Go to Insert in the menu and select the Image option', 'Go to Edit and click the Picture insertion option', 'Go to Tools and choose the Add Media option', 'Go to View and select the Insert Image option'], answer: 0, tip: 'Insert > Image — upload, use a URL, or pick from Drive.' },
  ],
  digital: [
    { q: 'What is phishing in the context of cybersecurity?', options: ['It is an online game designed to entertain internet users', 'It is a scam that tricks people into revealing personal data', 'It is a type of computer virus that infects your files', 'It is a document file format used for saving data'], answer: 1, tip: 'Phishing uses fake emails to trick you into giving away passwords.' },
    { q: 'What makes a password strong and secure?', options: ['Using your birthdate as it is easy to remember', 'Mixing uppercase, lowercase, numbers, and symbols', 'Using the simple word "password" for quick login', 'Using your full name for easy personal identification'], answer: 1, tip: 'Use 12+ characters with uppercase, lowercase, numbers, and symbols.' },
    { q: 'What is two-factor authentication (2FA)?', options: ['Using two separate passwords for the same account', 'A second verification step after entering your password', 'Logging into your account twice in the same session', 'Maintaining two different email accounts for security'], answer: 1, tip: '2FA = password + code from your phone. Much harder to hack.' },
    { q: 'What does the HTTPS prefix mean in a URL?', options: ['It means the website connection is encrypted and secure', 'It means the internet speed is high for fast loading', 'It means the file type is a secure document format', 'It means the browser has a built-in security feature'], answer: 0, tip: 'HTTPS encrypts your data — look for the lock icon.' },
    { q: 'What is malware on a computer system?', options: ['It is beneficial software that improves computer performance', 'It is harmful software designed to damage or infiltrate devices', 'It is an operating system used for running applications', 'It is a hardware component installed inside your computer'], answer: 1, tip: 'Malware includes viruses, spyware, ransomware, and trojans.' },
    { q: 'What is the purpose of the Recycle Bin on Windows?', options: ['It permanently deletes files beyond any recovery', 'It temporarily stores deleted files for possible recovery', 'It serves as a backup tool for important system files', 'It compresses files to save storage space on disk'], answer: 1, tip: 'Deleted files go here first — you can recover them.' },
    { q: 'What is cloud storage on the internet?', options: ['A physical hard drive installed inside your computer', 'Storing files on remote servers accessed via internet', 'A USB flash drive plugged into a computer port', 'A type of temporary memory built into your device'], answer: 1, tip: 'Cloud storage lets you access files from any device, anywhere.' },
    { q: 'How often should you back up your important files?', options: ['Only once per year to save time and storage space', 'Regularly, such as weekly or after making big changes', 'Never because modern computers never lose data', 'Only after your computer has already broken down'], answer: 1, tip: 'Regular backups protect against data loss.' },
    { q: 'What does a browser cache do on your computer?', options: ['It permanently deletes files from your download folder', 'It stores temporary website data for faster loading', 'It blocks incoming viruses and malware from the web', 'It compresses files to reduce their storage size'], answer: 1, tip: 'Cache saves parts of websites so they load faster next time.' },
    { q: 'What is a ZIP file used for in computing?', options: ['It is a corrupted file that cannot be opened properly', 'It compresses multiple files into one smaller archive', 'It is an image file format for saving photographs', 'It is a video format for storing movie clips'], answer: 1, tip: 'Zip files pack multiple files into one smaller file.' },
    { q: 'What happens when you press Ctrl+Alt+Delete on Windows?', options: ['It immediately shuts down your computer without warning', 'It opens the Task Manager and security options menu', 'It opens your default file explorer application', 'It undoes your last action in the current program'], answer: 1, tip: 'It opens the Windows security screen.' },
    { q: 'How does a computer virus differ from malware?', options: ['They are exactly the same thing with no difference', 'Malware is a broad category; virus is one specific type', 'A virus is always more dangerous than any malware', 'Malware only affects smartphones and tablet devices'], answer: 1, tip: 'Malware is the umbrella term. A virus copies itself.' },
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

  const [questions] = useState(() => shuffle((ALL_QUESTIONS[category] || ALL_QUESTIONS.basics).map(shuffleQuestion)));
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
