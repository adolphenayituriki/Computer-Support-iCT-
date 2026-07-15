import { useState, useEffect, useRef } from 'react';
import { AI_API_BASE } from '../api';
import {
  FaBook, FaLink, FaUpload, FaPlus, FaTrash, FaFilePdf, FaGlobe,
  FaRobot, FaQuestionCircle, FaBrain, FaFileAlt, FaComments,
  FaSpinner, FaTimes, FaArrowLeft, FaSearch, FaExclamationTriangle,
  FaCheckCircle, FaStar, FaLightbulb, FaCopy, FaChevronLeft, FaChevronRight, FaUser
} from 'react-icons/fa';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'Geography', 'History', 'General'];

export default function AIResources({ onBack }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('library');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState('link');
  const [uploading, setUploading] = useState(false);
  const [resourceDetail, setResourceDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [linkForm, setLinkForm] = useState({ url: '', title: '', subject: 'General', description: '' });
  const [linkError, setLinkError] = useState('');
  const [linkSaving, setLinkSaving] = useState(false);

  const [fileForm, setFileForm] = useState({ title: '', subject: 'General', description: '' });
  const [fileError, setFileError] = useState('');
  const [fileSaving, setFileSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [resourceQuiz, setResourceQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  const [resourceFlashcards, setResourceFlashcards] = useState(null);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const [resourceSummary, setResourceSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [resourceChat, setResourceChat] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const [resourceTool, setResourceTool] = useState(null);

  const token = () => localStorage.getItem('cshub_token');

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/resources`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || 'Failed to load resources.');
      }
    } catch (err) {
      setError('Could not connect to AI backend.');
    }
    setLoading(false);
  };

  const openResource = async (resource) => {
    setSelectedResource(resource);
    setView('detail');
    setResourceTool(null);
    setResourceDetail(null);
    setDetailLoading(true);
    setResourceQuiz(null);
    setResourceFlashcards(null);
    setResourceSummary(null);
    setChatMessages([]);
    setResourceChat(null);
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/resources/${resource._id}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) setResourceDetail(await res.json());
    } catch {}
    setDetailLoading(false);
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    setLinkError('');
    if (!linkForm.url.trim()) { setLinkError('URL is required.'); return; }
    try { new URL(linkForm.url); } catch { setLinkError('Please enter a valid URL.'); return; }
    setLinkSaving(true);
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/resources/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(linkForm),
      });
      if (res.ok) {
        const data = await res.json();
        setResources((prev) => [data, ...prev]);
        setShowAdd(false);
        setLinkForm({ url: '', title: '', subject: 'General', description: '' });
      } else {
        const err = await res.json().catch(() => ({}));
        setLinkError(err.error || 'Failed to add link.');
      }
    } catch {
      setLinkError('Could not connect to AI backend.');
    }
    setLinkSaving(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!fileForm.title) setFileForm((f) => ({ ...f, title: file.name.replace(/\.pdf$/i, '') }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      if (!fileForm.title) setFileForm((f) => ({ ...f, title: file.name.replace(/\.pdf$/i, '') }));
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    setFileError('');
    if (!selectedFile) { setFileError('Please select a PDF file.'); return; }
    setFileSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', fileForm.title);
      formData.append('subject', fileForm.subject);
      formData.append('description', fileForm.description);
      const res = await fetch(`${AI_API_BASE}/api/ai/resources/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setResources((prev) => [data, ...prev]);
        setShowAdd(false);
        setSelectedFile(null);
        setFileForm({ title: '', subject: 'General', description: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const err = await res.json().catch(() => ({}));
        setFileError(err.error || 'Failed to upload file.');
      }
    } catch {
      setFileError('Could not connect to AI backend.');
    }
    setFileSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await fetch(`${AI_API_BASE}/api/ai/resources/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      setResources((prev) => prev.filter((r) => r._id !== id));
      if (selectedResource?._id === id) { setView('library'); setSelectedResource(null); }
    } catch {}
  };

  const generateResourceQuiz = async () => {
    if (!selectedResource) return;
    setQuizLoading(true);
    setResourceQuiz(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResults(null);
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/resources/${selectedResource._id}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ count: 5 }),
      });
      if (res.ok) {
        const data = await res.json();
        setResourceQuiz(data);
        setResourceTool('quiz');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to generate quiz.');
      }
    } catch { alert('Could not connect to AI backend.'); }
    setQuizLoading(false);
  };

  const submitResourceQuiz = () => {
    if (!resourceQuiz) return;
    let score = 0;
    const results = resourceQuiz.questions.map((q, i) => {
      const correct = quizAnswers[i] === q.correctIndex;
      if (correct) score++;
      return { ...q, userAnswer: quizAnswers[i], correct };
    });
    setQuizResults({ score, total: resourceQuiz.questions.length, results });
    setQuizSubmitted(true);
  };

  const generateResourceFlashcards = async () => {
    if (!selectedResource) return;
    setFlashcardLoading(true);
    setResourceFlashcards(null);
    setFlashcardIndex(0);
    setFlashcardFlipped(false);
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/resources/${selectedResource._id}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        setResourceFlashcards(data);
        setResourceTool('flashcards');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to generate flashcards.');
      }
    } catch { alert('Could not connect to AI backend.'); }
    setFlashcardLoading(false);
  };

  const generateResourceSummary = async () => {
    if (!selectedResource) return;
    setSummaryLoading(true);
    setResourceSummary(null);
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/resources/${selectedResource._id}/summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        setResourceSummary(data);
        setResourceTool('summary');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to generate summary.');
      }
    } catch { alert('Could not connect to AI backend.'); }
    setSummaryLoading(false);
  };

  const sendResourceChat = async () => {
    if (!chatInput.trim() || !selectedResource) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const res = await fetch(`${AI_API_BASE}/api/ai/resources/${selectedResource._id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ message: msg }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        const err = await res.json().catch(() => ({}));
        setChatMessages((prev) => [...prev, { role: 'assistant', content: err.error || 'Failed to get response.' }]);
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: 'assistant', content: 'Could not connect to AI backend.' }]);
    }
    setChatLoading(false);
  };

  const renderContentPreview = (content) => {
    if (!content) return 'No content extracted.';
    return content.substring(0, 300) + (content.length > 300 ? '...' : '');
  };

  if (view === 'detail' && selectedResource) {
    return (
      <div className="ai-resource-detail">
        <div className="ai-resource-detail-header">
          <button className="ai-resource-back-btn" onClick={() => { setView('library'); setSelectedResource(null); setResourceTool(null); }}>
            <FaArrowLeft /> Back to Library
          </button>
          <div className="ai-resource-detail-title">
            {selectedResource.type === 'book' ? <FaFilePdf /> : <FaGlobe />}
            <div>
              <h2>{selectedResource.title}</h2>
              <span className="ai-resource-detail-meta">{selectedResource.subject} · {selectedResource.type === 'book' ? 'Book/PDF' : 'Web Link'}</span>
            </div>
          </div>
          <button className="ai-resource-delete-btn" onClick={() => handleDelete(selectedResource._id)}>
            <FaTrash /> Delete
          </button>
        </div>

        <div className="ai-resource-detail-tools">
          <button className={`ai-resource-tool-btn ${resourceTool === 'overview' ? 'active' : ''}`} onClick={() => setResourceTool('overview')}>
            <FaBook /> Overview
          </button>
          <button className={`ai-resource-tool-btn ${resourceTool === 'quiz' ? 'active' : ''}`} onClick={generateResourceQuiz} disabled={quizLoading}>
            {quizLoading ? <FaSpinner className="spin" /> : <FaQuestionCircle />} Quiz
          </button>
          <button className={`ai-resource-tool-btn ${resourceTool === 'flashcards' ? 'active' : ''}`} onClick={generateResourceFlashcards} disabled={flashcardLoading}>
            {flashcardLoading ? <FaSpinner className="spin" /> : <FaBrain />} Flashcards
          </button>
          <button className={`ai-resource-tool-btn ${resourceTool === 'summary' ? 'active' : ''}`} onClick={generateResourceSummary} disabled={summaryLoading}>
            {summaryLoading ? <FaSpinner className="spin" /> : <FaFileAlt />} Summary
          </button>
          <button className={`ai-resource-tool-btn ${resourceTool === 'chat' ? 'active' : ''}`} onClick={() => setResourceTool('chat')}>
            <FaComments /> Ask AI
          </button>
        </div>

        <div className="ai-resource-detail-content">
          {detailLoading ? (
            <div className="ai-resource-loading"><FaSpinner className="spin" /> Loading resource...</div>
          ) : resourceTool === 'overview' || (!resourceTool && resourceDetail) ? (
            <div className="ai-resource-overview">
              <h3>Content Preview</h3>
              <div className="ai-resource-content-preview">
                <p>{renderContentPreview(resourceDetail?.content)}</p>
              </div>
              {resourceDetail?.contentLength > 0 && (
                <div className="ai-resource-stats">
                  <span><FaFileAlt /> {resourceDetail.contentLength.toLocaleString()} characters extracted</span>
                  <span><FaStar /> {resourceDetail.quizzesGenerated || 0} quizzes generated</span>
                  <span><FaBrain /> {resourceDetail.flashcardsGenerated || 0} flashcards generated</span>
                </div>
              )}
              {resourceDetail?.linkUrl && (
                <a href={resourceDetail.linkUrl} target="_blank" rel="noopener noreferrer" className="ai-resource-link">
                  <FaGlobe /> Open original link
                </a>
              )}
            </div>
          ) : resourceTool === 'quiz' ? (
            <div className="ai-resource-quiz">
              {!resourceQuiz ? (
                <div className="ai-resource-loading"><FaSpinner className="spin" /> Generating quiz from resource content...</div>
              ) : !quizSubmitted ? (
                <>
                  <h3>Quiz from: {resourceQuiz.resourceTitle}</h3>
                  <p className="ai-resource-quiz-sub">{resourceQuiz.subject} · {resourceQuiz.totalQuestions} questions</p>
                  {resourceQuiz.questions.map((q, qi) => (
                    <div className="ai-quiz-question-card" key={qi}>
                      <h3>Question {qi + 1}</h3>
                      <p>{q.text}</p>
                      <div className="ai-quiz-options">
                        {q.options.map((opt, oi) => (
                          <button key={oi} className={`ai-quiz-option ${quizAnswers[qi] === oi ? 'selected' : ''}`} onClick={() => setQuizAnswers((prev) => ({ ...prev, [qi]: oi }))}>
                            <span className="ai-quiz-option-letter">{String.fromCharCode(65 + oi)}</span>
                            <span>{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="ai-resource-submit-btn" onClick={submitResourceQuiz} disabled={Object.keys(quizAnswers).length < resourceQuiz.questions.length}>
                    Submit Quiz
                  </button>
                </>
              ) : (
                <div className="ai-quiz-results">
                  <div className="ai-quiz-results-score">
                    <strong>{quizResults.score}/{quizResults.total}</strong>
                    <span>{Math.round((quizResults.score / quizResults.total) * 100)}%</span>
                  </div>
                  <div className="ai-quiz-results-breakdown">
                    {quizResults.results.map((r, i) => (
                      <div className={`ai-quiz-result-item ${r.correct ? 'correct' : 'wrong'}`} key={i}>
                        {r.correct ? <FaCheckCircle className="ai-quiz-result-icon" /> : <FaExclamationTriangle className="ai-quiz-result-icon" />}
                        <div>
                          <strong>Q{i + 1}: {r.text}</strong>
                          <p>{r.correct ? 'Correct!' : `Your answer: ${r.options[r.userAnswer] || 'No answer'}`}</p>
                          {!r.correct && <p>Correct: {r.options[r.correctIndex]}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="ai-resource-action-btn" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); generateResourceQuiz(); }}>Retake Quiz</button>
                </div>
              )}
            </div>
          ) : resourceTool === 'flashcards' ? (
            <div className="ai-resource-flashcards">
              {!resourceFlashcards ? (
                <div className="ai-resource-loading"><FaSpinner className="spin" /> Generating flashcards from resource...</div>
              ) : resourceFlashcards.flashcards.length > 0 ? (
                <>
                  <h3>Flashcards from: {resourceFlashcards.resourceTitle}</h3>
                  <div className="ai-resource-flashcard-container">
                    <div className="topic-flashcard" onClick={() => setFlashcardFlipped(!flashcardFlipped)}>
                      <div className="topic-flashcard-inner" style={{ transform: flashcardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                        <div className="topic-flashcard-front">
                          <p>{resourceFlashcards.flashcards[flashcardIndex].front}</p>
                          <span>Click to flip</span>
                        </div>
                        <div className="topic-flashcard-back">
                          <p>{resourceFlashcards.flashcards[flashcardIndex].back}</p>
                          <span>Click to flip back</span>
                        </div>
                      </div>
                    </div>
                    <div className="ai-resource-flashcard-nav">
                      <button onClick={() => { setFlashcardIndex((prev) => Math.max(0, prev - 1)); setFlashcardFlipped(false); }} disabled={flashcardIndex === 0}>
                        <FaChevronLeft /> Previous
                      </button>
                      <span>{flashcardIndex + 1} / {resourceFlashcards.flashcards.length}</span>
                      <button onClick={() => { setFlashcardIndex((prev) => Math.min(resourceFlashcards.flashcards.length - 1, prev + 1)); setFlashcardFlipped(false); }} disabled={flashcardIndex === resourceFlashcards.flashcards.length - 1}>
                        Next <FaChevronRight />
                      </button>
                    </div>
                  </div>
                </>
              ) : <p>No flashcards generated.</p>}
            </div>
          ) : resourceTool === 'summary' ? (
            <div className="ai-resource-summary">
              {!resourceSummary ? (
                <div className="ai-resource-loading"><FaSpinner className="spin" /> Generating summary...</div>
              ) : (
                <>
                  <h3>{resourceSummary.title}</h3>
                  <div className="ai-resource-summary-overview">
                    <p>{resourceSummary.overview}</p>
                  </div>
                  {resourceSummary.keyPoints?.length > 0 && (
                    <div className="ai-resource-summary-keypoints">
                      <h4><FaLightbulb /> Key Points</h4>
                      <ul>
                        {resourceSummary.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : resourceTool === 'chat' ? (
            <div className="ai-resource-chat">
              <div className="ai-resource-chat-messages">
                {chatMessages.length === 0 && (
                  <div className="ai-resource-chat-welcome">
                    <FaRobot size={32} />
                    <h3>Ask about this resource</h3>
                    <p>I can explain concepts, summarize sections, or help you understand the content of "{selectedResource.title}".</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`ai-resource-chat-msg ${msg.role}`}>
                    <div className="ai-resource-chat-avatar">
                      {msg.role === 'user' ? <FaUser size={12} /> : <FaRobot size={12} />}
                    </div>
                    <div className="ai-resource-chat-bubble">{msg.content}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="ai-resource-chat-msg assistant">
                    <div className="ai-resource-chat-avatar"><FaRobot size={12} /></div>
                    <div className="ai-resource-chat-bubble"><FaSpinner className="spin" /></div>
                  </div>
                )}
              </div>
              <div className="ai-resource-chat-input">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendResourceChat()} placeholder="Ask about this resource..." disabled={chatLoading} />
                <button onClick={sendResourceChat} disabled={!chatInput.trim() || chatLoading}>
                  <FaComments />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="ai-resources">
      <div className="ai-resources-header">
        <div>
          <h2><FaBook /> Resource Library</h2>
          <p>Upload books (PDF) or add web links. AI guides you based on the content and generates quizzes, flashcards, and more.</p>
        </div>
        <button className="ai-resource-add-btn" onClick={() => setShowAdd(true)}>
          <FaPlus /> Add Resource
        </button>
      </div>

      {showAdd && (
        <div className="ai-resource-add-panel">
          <div className="ai-resource-add-header">
            <h3>Add New Resource</h3>
            <button onClick={() => { setShowAdd(false); setLinkError(''); setFileError(''); setSelectedFile(null); }}>
              <FaTimes />
            </button>
          </div>
          <div className="ai-resource-add-tabs">
            <button className={addType === 'link' ? 'active' : ''} onClick={() => setAddType('link')}>
              <FaGlobe /> Web Link
            </button>
            <button className={addType === 'book' ? 'active' : ''} onClick={() => setAddType('book')}>
              <FaFilePdf /> Upload PDF
            </button>
          </div>

          {addType === 'link' ? (
            <form onSubmit={handleLinkSubmit} className="ai-resource-add-form">
              <div className="ai-resource-form-group">
                <label>URL *</label>
                <input type="url" value={linkForm.url} onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })} placeholder="https://example.com/resource" />
              </div>
              <div className="ai-resource-form-group">
                <label>Title (auto-detected if blank)</label>
                <input type="text" value={linkForm.title} onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })} placeholder="Resource title" />
              </div>
              <div className="ai-resource-form-row">
                <div className="ai-resource-form-group">
                  <label>Subject</label>
                  <select value={linkForm.subject} onChange={(e) => setLinkForm({ ...linkForm, subject: e.target.value })}>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="ai-resource-form-group">
                <label>Description</label>
                <input type="text" value={linkForm.description} onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })} placeholder="Brief description" />
              </div>
              {linkError && <p className="ai-resource-error"><FaExclamationTriangle /> {linkError}</p>}
              <button type="submit" className="ai-resource-submit-btn" disabled={linkSaving}>
                {linkSaving ? <><FaSpinner className="spin" /> Adding...</> : <><FaPlus /> Add Link</>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleFileSubmit} className="ai-resource-add-form">
              <div className="ai-resource-form-group">
                <label>PDF File *</label>
                <div className={`ai-resource-dropzone ${dragOver ? 'dragover' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
                  {selectedFile ? (
                    <div className="ai-resource-file-selected">
                      <FaFilePdf size={24} />
                      <span>{selectedFile.name}</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}><FaTimes /></button>
                    </div>
                  ) : (
                    <>
                      <FaUpload size={32} />
                      <p>Drag & drop PDF or click to browse</p>
                      <small>Max 20MB</small>
                    </>
                  )}
                </div>
              </div>
              <div className="ai-resource-form-group">
                <label>Title</label>
                <input type="text" value={fileForm.title} onChange={(e) => setFileForm({ ...fileForm, title: e.target.value })} placeholder="Book/resource title" />
              </div>
              <div className="ai-resource-form-row">
                <div className="ai-resource-form-group">
                  <label>Subject</label>
                  <select value={fileForm.subject} onChange={(e) => setFileForm({ ...fileForm, subject: e.target.value })}>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="ai-resource-form-group">
                <label>Description</label>
                <input type="text" value={fileForm.description} onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })} placeholder="Brief description" />
              </div>
              {fileError && <p className="ai-resource-error"><FaExclamationTriangle /> {fileError}</p>}
              <button type="submit" className="ai-resource-submit-btn" disabled={fileSaving}>
                {fileSaving ? <><FaSpinner className="spin" /> Uploading...</> : <><FaUpload /> Upload Book</>}
              </button>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <div className="ai-resource-loading"><FaSpinner className="spin" /> Loading resources...</div>
      ) : error ? (
        <div className="ai-resource-error-block"><FaExclamationTriangle /> {error}</div>
      ) : resources.length === 0 ? (
        <div className="ai-resource-empty">
          <FaBook size={48} />
          <h3>No resources yet</h3>
          <p>Upload a PDF book or add a web link to get started. AI will guide you based on the content!</p>
          <button className="ai-resource-add-btn" onClick={() => setShowAdd(true)}><FaPlus /> Add Your First Resource</button>
        </div>
      ) : (
        <div className="ai-resource-grid">
          {resources.map((r) => (
            <div className="ai-resource-card" key={r._id}>
              <div className="ai-resource-card-header">
                <div className={`ai-resource-card-icon ${r.type}`}>
                  {r.type === 'book' ? <FaFilePdf /> : <FaGlobe />}
                </div>
                <div className="ai-resource-card-info">
                  <h4>{r.title}</h4>
                  <span className="ai-resource-card-meta">{r.subject} · {r.type === 'book' ? 'Book' : 'Link'}</span>
                </div>
              </div>
              {r.description && <p className="ai-resource-card-desc">{r.description}</p>}
              <div className="ai-resource-card-content">
                <p>{renderContentPreview(r.content)}</p>
              </div>
              <div className="ai-resource-card-footer">
                <button onClick={() => openResource(r)}><FaRobot /> Open</button>
                <button onClick={() => { setSelectedResource(r); generateResourceQuiz(); }}><FaQuestionCircle /></button>
                <button onClick={() => { setSelectedResource(r); generateResourceFlashcards(); }}><FaBrain /></button>
                <button onClick={() => handleDelete(r._id)}><FaTrash /></button>
              </div>
              <small className="ai-resource-card-date">{new Date(r.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
