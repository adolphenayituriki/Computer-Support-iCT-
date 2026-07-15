import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useLang } from '../LanguageContext';
import API_BASE, { AI_API_BASE } from '../api';
import {
  FaQuestionCircle, FaCheckCircle, FaTimesCircle, FaSpinner, FaRedo,
  FaTrophy, FaClock, FaArrowRight, FaListOl, FaEye, FaHome
} from 'react-icons/fa';

const SUBJECTS = [
  { key: 'Mathematics', color: '#FFCE08' },
  { key: 'Physics', color: '#5694F7' },
  { key: 'Chemistry', color: '#10b981' },
  { key: 'Biology', color: '#8b5cf6' },
  { key: 'Computer Science', color: '#06b6d4' },
  { key: 'English', color: '#f59e0b' },
  { key: 'Geography', color: '#ef4444' },
];

export default function AIQuiz() {
  const { user } = useAuth();
  const { t } = useLang();
  const [view, setView] = useState('subjects');
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [startTime, setStartTime] = useState(0);
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const token = () => localStorage.getItem('cshub_token');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/quizzes/history`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {}
  };

  const startQuiz = async (sel) => {
    setSubject(sel);
    setLoading(true);
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/quizzes/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ subject: sel, level: 'secondary', count: 5 }),
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setQuizId(data.quizId);
        setAnswers(new Array(data.questions.length).fill(-1));
        setCurrentQ(0);
        setStartTime(Date.now());
        setView('quiz');
      }
    } catch {}
    setLoading(false);
  };

  const startReview = async (quiz) => {
    setReviewLoading(true);
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/quizzes/${quiz._id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReviewData(data);
        setView('review');
      }
    } catch {}
    setReviewLoading(false);
  };

  const selectAnswer = (idx) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = idx;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/quizzes/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          quizId,
          answers,
          timeTaken: Math.round((Date.now() - startTime) / 1000),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setView('results');
        fetchHistory();
      }
    } catch {}
    setLoading(false);
  };

  const goHome = () => {
    setView('subjects');
    setQuestions([]);
    setResults(null);
    setAnswers([]);
    setCurrentQ(0);
    setReviewData(null);
  };

  // ─── REVIEW VIEW ──────────────────────────────

  if (view === 'review' && reviewData) {
    const pct = reviewData.totalQuestions > 0 ? Math.round((reviewData.score / reviewData.totalQuestions) * 100) : 0;
    const correct = reviewData.answers?.filter((a, i) => a === reviewData.questions[i]?.correctIndex).length || 0;
    const wrong = reviewData.totalQuestions - correct;

    return (
      <div className="ai-quiz">
        <div className="ai-quiz-review">
          <div className="ai-quiz-review-header">
            <button className="ai-quiz-back-btn" onClick={goHome}><FaHome /> Back to Quizzes</button>
            <span className="ai-quiz-review-subject">{reviewData.subject}</span>
            <span className="ai-quiz-review-date">{new Date(reviewData.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="ai-quiz-review-summary">
            <div className="ai-quiz-review-score-ring">
              <svg viewBox="0 0 120 120" className="ai-quiz-review-ring">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none"
                  stroke={pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={`${(pct / 100) * 327} 327`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="ai-quiz-review-score-text">
                <strong>{reviewData.score}</strong>
                <span>/{reviewData.totalQuestions}</span>
              </div>
            </div>
            <div className="ai-quiz-review-stats">
              <div className="ai-quiz-review-stat">
                <span className="ai-quiz-review-stat-val" style={{ color: '#10b981' }}>{correct}</span>
                <span className="ai-quiz-review-stat-label">Correct</span>
              </div>
              <div className="ai-quiz-review-stat">
                <span className="ai-quiz-review-stat-val" style={{ color: '#ef4444' }}>{wrong}</span>
                <span className="ai-quiz-review-stat-label">Wrong</span>
              </div>
              <div className="ai-quiz-review-stat">
                <span className="ai-quiz-review-stat-val" style={{ color: '#5694F7' }}>{pct}%</span>
                <span className="ai-quiz-review-stat-label">Score</span>
              </div>
              {reviewData.timeTaken > 0 && (
                <div className="ai-quiz-review-stat">
                  <span className="ai-quiz-review-stat-val" style={{ color: '#8b5cf6' }}>{Math.floor(reviewData.timeTaken / 60)}m {reviewData.timeTaken % 60}s</span>
                  <span className="ai-quiz-review-stat-label">Time</span>
                </div>
              )}
            </div>
          </div>

          <div className="ai-quiz-review-questions">
            {reviewData.questions.map((q, i) => {
              const userAns = reviewData.answers?.[i];
              const isCorrect = userAns === q.correctIndex;
              return (
                <div key={i} className={`ai-quiz-review-q ${isCorrect ? 'correct' : 'wrong'}`}>
                  <div className="ai-quiz-review-q-header">
                    <span className={`ai-quiz-review-q-badge ${isCorrect ? 'correct' : 'wrong'}`}>
                      {isCorrect ? <FaCheckCircle /> : <FaTimesCircle />}
                    </span>
                    <span className="ai-quiz-review-q-num">Q{i + 1}</span>
                    <span className="ai-quiz-review-q-points">{isCorrect ? '+10 pts' : '0 pts'}</span>
                  </div>
                  <p className="ai-quiz-review-q-text">{q.text}</p>
                  <div className="ai-quiz-review-q-options">
                    {q.options.map((opt, oi) => {
                      const isThisUserAnswer = oi === userAns;
                      const isThisCorrect = oi === q.correctIndex;
                      let cls = 'ai-quiz-review-opt';
                      if (isThisCorrect) cls += ' correct';
                      if (isThisUserAnswer && !isThisCorrect) cls += ' wrong';
                      return (
                        <div key={oi} className={cls}>
                          <span className="ai-quiz-review-opt-letter">{String.fromCharCode(65 + oi)}</span>
                          <span>{opt}</span>
                          {isThisCorrect && <span className="ai-quiz-review-opt-check"><FaCheckCircle /></span>}
                          {isThisUserAnswer && !isThisCorrect && <span className="ai-quiz-review-opt-x"><FaTimesCircle /></span>}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="ai-quiz-review-explanation">
                      <strong>💡 Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="ai-quiz-review-actions">
            <button className="btn" onClick={goHome}><FaHome /> Back to Quizzes</button>
            <button className="btn btn-outline" onClick={() => startQuiz(reviewData.subject)}><FaRedo /> Retake Quiz</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── SUBJECTS VIEW ──────────────────────────────

  if (view === 'subjects') {
    return (
      <div className="ai-quiz">
        <div className="ai-quiz-header">
          <FaQuestionCircle size={20} />
          <h3>Quiz Generator</h3>
        </div>
        <p className="ai-quiz-sub">Choose a subject to start a quiz</p>
        <div className="ai-quiz-subjects">
          {SUBJECTS.map((s) => (
            <button key={s.key} className="ai-quiz-subject-btn" onClick={() => startQuiz(s.key)} disabled={loading}>
              <div className="ai-quiz-subject-icon" style={{ color: s.color }}>{loading && subject === s.key ? <FaSpinner className="fa-spin" /> : <FaListOl />}</div>
              <span>{s.key}</span>
            </button>
          ))}
        </div>
        {history.length > 0 && (
          <div className="ai-quiz-history">
            <h4>Recent Quizzes</h4>
            <div className="ai-quiz-history-list">
              {history.slice(0, 10).map((h) => {
                const pct = h.totalQuestions > 0 ? Math.round((h.score / h.totalQuestions) * 100) : 0;
                return (
                  <div key={h._id} className="ai-quiz-history-item">
                    <div className="ai-quiz-history-left">
                      <span className="ai-quiz-history-subject">{h.subject}</span>
                      <span className="ai-quiz-history-score">{h.score}/{h.totalQuestions} ({pct}%)</span>
                      <span className="ai-quiz-history-date">{new Date(h.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button
                      className="ai-quiz-history-review-btn"
                      onClick={() => startReview(h)}
                      disabled={reviewLoading}
                    >
                      <FaEye /> Review
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── RESULTS VIEW ──────────────────────────────

  if (view === 'results' && results) {
    return (
      <div className="ai-quiz">
        <div className="ai-quiz-results">
          <FaTrophy size={48} className="ai-quiz-results-icon" />
          <h3>Quiz Complete!</h3>
          <div className="ai-quiz-results-score">
            <strong>{results.score}/{results.total}</strong>
            <span>{results.percentage}%</span>
          </div>
          <p>{results.timeTaken > 0 && <><FaClock /> {Math.floor(results.timeTaken / 60)}m {results.timeTaken % 60}s — </>}{results.percentage >= 80 ? 'Excellent work!' : results.percentage >= 60 ? 'Good job!' : 'Keep practicing!'}</p>
          <div className="ai-quiz-results-breakdown">
            {results.results.map((r, i) => (
              <div key={i} className={`ai-quiz-result-item ${r.correct ? 'correct' : 'wrong'}`}>
                <div className="ai-quiz-result-icon">
                  {r.correct ? <FaCheckCircle /> : <FaTimesCircle />}
                </div>
                <div>
                  <strong>Q{i + 1}: {r.text}</strong>
                  {!r.correct && (
                    <p className="ai-quiz-result-answer">
                      Your answer: {r.options[r.userAnswer]} — Correct: {r.options[r.correctIndex]}
                    </p>
                  )}
                  {r.explanation && <p className="ai-quiz-result-explanation">{r.explanation}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="ai-quiz-results-btns">
            <button className="btn" onClick={goHome}>Back to Subjects</button>
            <button className="btn btn-outline" onClick={() => startQuiz(subject)}><FaRedo /> Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── QUIZ PLAY VIEW ──────────────────────────────

  const q = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;
  const allAnswered = answers.every((a) => a !== -1);

  return (
    <div className="ai-quiz">
      <div className="ai-quiz-play-header">
        <button className="ai-quiz-back-btn" onClick={goHome}>← Back</button>
        <span className="ai-quiz-progress-text">Question {currentQ + 1} of {questions.length}</span>
        <span className="ai-quiz-subject-badge">{subject}</span>
      </div>
      <div className="ai-quiz-progress-bar">
        <div className="ai-quiz-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="ai-quiz-question-card">
        <h3>Q{currentQ + 1}. {q.text}</h3>
        <div className="ai-quiz-options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`ai-quiz-option${answers[currentQ] === i ? ' selected' : ''}`}
              onClick={() => selectAnswer(i)}
            >
              <span className="ai-quiz-option-letter">{String.fromCharCode(65 + i)}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="ai-quiz-nav">
        <button className="btn btn-outline btn-sm" onClick={prevQuestion} disabled={currentQ === 0}>Previous</button>
        {currentQ < questions.length - 1 ? (
          <button className="btn btn-sm" onClick={nextQuestion}>Next <FaArrowRight /></button>
        ) : (
          <button className="btn btn-sm" onClick={submitQuiz} disabled={!allAnswered || loading}>
            {loading ? <><FaSpinner className="fa-spin" /> Submitting...</> : 'Submit Quiz'}
          </button>
        )}
      </div>
      <div className="ai-quiz-dots">
        {questions.map((_, i) => (
          <span key={i} className={`ai-quiz-dot${i === currentQ ? ' active' : ''}${answers[i] !== -1 ? ' answered' : ''}`} onClick={() => setCurrentQ(i)} />
        ))}
      </div>
    </div>
  );
}
