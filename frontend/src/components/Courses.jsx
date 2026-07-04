import { useState, useEffect } from 'react';
import { FaBookOpen, FaClock, FaSignal, FaArrowLeft, FaTimes, FaTag, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const CATEGORY_ICONS = {
  hardware: '💻', software: '🖥️', network: '🌐', virus: '🛡️', training: '📚', general: '📖',
};

function DifficultyBadge({ level }) {
  const colors = {
    beginner: { bg: '#d1fae5', color: '#047857' },
    intermediate: { bg: '#fef3c7', color: '#b45309' },
    advanced: { bg: '#fee2e2', color: '#dc2626' },
  };
  const c = colors[level] || colors.beginner;
  return <span style={{ background: c.bg, color: c.color, padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><FaSignal size={10} /> {level}</span>;
}

function CategoryBadge({ category }) {
  const colors = {
    hardware: { bg: '#dbeafe', color: '#1d4ed8' },
    software: { bg: '#fef3c7', color: '#b45309' },
    network: { bg: '#ede9fe', color: '#6d28d9' },
    virus: { bg: '#fee2e2', color: '#dc2626' },
    training: { bg: '#d1fae5', color: '#047857' },
    general: { bg: '#f3f4f6', color: '#4b5563' },
  };
  const c = colors[category] || colors.general;
  return <span style={{ background: c.bg, color: c.color, padding: '0.15rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{CATEGORY_ICONS[category] || '📖'} {category}</span>;
}

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  useEffect(() => {
    fetch('/api/courses')
      .then((r) => r.json())
      .then(setCourses)
      .catch(() => {});
  }, []);

  const filtered = courses.filter((c) => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || c.category === filterCat;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(courses.map((c) => c.category))];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px' }}>
      {selected ? (
        <div className="news-page" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
          <button onClick={() => setSelected(null)} className="back-btn" style={{ marginBottom: '1rem' }}>
            <FaArrowLeft /> Back to Courses
          </button>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <CategoryBadge category={selected.category} />
              <DifficultyBadge level={selected.difficulty} />
              {selected.estimatedTime && (
                <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaClock size={12} /> {selected.estimatedTime}
                </span>
              )}
            </div>
            <h1 style={{ margin: '0.5rem 0', fontSize: '1.5rem', color: '#1e293b' }}>{selected.title}</h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{selected.description}</p>
            {selected.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {selected.tags.map((tag, i) => (
                  <span key={i} style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FaTag size={10} /> {tag}
                  </span>
                ))}
              </div>
            )}
            {selected.content ? (
              <div className="course-content" style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem', fontSize: '0.95rem' }}>
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{selected.content.replace(/For the testimonials[\s\S]*$/i, '')}</ReactMarkdown>
              </div>
            ) : (
              <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Full content coming soon.</p>
            )}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaUser size={12} /> {selected.author} &middot; {new Date(selected.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
              <FaBookOpen style={{ color: '#FFCE08', marginRight: '0.5rem' }} />
              Knowledge Base
            </h1>
            <p style={{ color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Short guides and tutorials covering the most common questions and issues.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: '1', minWidth: '250px', maxWidth: '400px', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
            />
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', background: 'white' }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <FaBookOpen size={48} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
              <p>No courses found. Check back later for new guides.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {filtered.map((course) => (
                <div
                  key={course._id}
                  onClick={() => setSelected(course)}
                  style={{
                    background: 'white', borderRadius: '12px', padding: '1.5rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #f1f5f9',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    <CategoryBadge category={course.category} />
                    <DifficultyBadge level={course.difficulty} />
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#1e293b', lineHeight: 1.4 }}>{course.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8' }}>
                    {course.estimatedTime ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <FaClock size={11} /> {course.estimatedTime}
                      </span>
                    ) : <span />}
                    <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
