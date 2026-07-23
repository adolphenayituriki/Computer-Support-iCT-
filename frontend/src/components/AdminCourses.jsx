import { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Plus, Search, Edit3, Trash2, Eye, EyeOff,
  ExternalLink, Video, Link2, FileText, X,
  Clock, Save, GripVertical, Upload, Image, UploadCloud,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../ToastContext';
import API_BASE from '../api';

const token = () => localStorage.getItem('cshub_token');

function apiFetch(url, opts = {}) {
  return fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...opts.headers },
    ...opts,
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) return { error: data.error || `Request failed (${r.status})` };
    return data;
  });
}

async function uploadFiles(formData) {
  const res = await fetch(`${API_BASE}/api/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.files;
}

const CATEGORIES = ['general', 'hardware', 'software', 'network', 'virus', 'training'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const RESOURCE_TYPES = [
  { value: 'book', label: 'Book / PDF', icon: BookOpen, color: 'text-amber-500' },
  { value: 'link', label: 'Link', icon: Link2, color: 'text-blue-500' },
  { value: 'video', label: 'Video', icon: Video, color: 'text-red-500' },
  { value: 'file', label: 'Document', icon: FileText, color: 'text-emerald-500' },
];

const CATEGORY_COLORS = {
  general: 'bg-slate-100 text-slate-600', hardware: 'bg-blue-50 text-blue-600',
  software: 'bg-violet-50 text-violet-600', network: 'bg-emerald-50 text-emerald-600',
  virus: 'bg-red-50 text-red-600', training: 'bg-amber-50 text-amber-600',
};
const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-50 text-emerald-600',
  intermediate: 'bg-amber-50 text-amber-600',
  advanced: 'bg-red-50 text-red-600',
};

const emptyForm = () => ({
  title: '', description: '', content: '', category: 'general',
  difficulty: 'beginner', estimatedTime: '', published: true,
  tags: '', thumbnail: '', introVideo: '', videoUrl: '', resources: [],
});

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function MarkdownEditor({ value, onChange }) {
  const [mode, setMode] = useState('edit');
  const taRef = useRef(null);
  const insert = (before, after = '') => {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd, sel = value.substring(s, e);
    const next = value.substring(0, s) + before + sel + after + value.substring(e);
    onChange(next);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + before.length, s + before.length + sel.length); });
  };
  const insertBlock = (prefix) => {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart;
    const ls = value.lastIndexOf('\n', s - 1) + 1;
    const le = value.indexOf('\n', s) === -1 ? value.length : value.indexOf('\n', s);
    const line = value.substring(ls, le);
    onChange(value.substring(0, ls) + prefix + line + value.substring(le));
  };
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <button type="button" onClick={() => insert('**', '**')} className="rounded px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-200">B</button>
        <button type="button" onClick={() => insert('*', '*')} className="rounded px-2 py-1 text-xs italic text-slate-500 hover:bg-slate-200">I</button>
        <button type="button" onClick={() => insertBlock('## ')} className="rounded px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-200">H</button>
        <button type="button" onClick={() => insertBlock('- ')} className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200">&bull;</button>
        <button type="button" onClick={() => insertBlock('1. ')} className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200">1.</button>
        <button type="button" onClick={() => insert('[', '](url)')} className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200">Link</button>
        <button type="button" onClick={() => insert('```\n', '\n```')} className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-200">&lt;/&gt;</button>
        <div className="flex-1" />
        <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
          <button type="button" onClick={() => setMode('edit')} className={cn('px-2.5 py-0.5 text-[11px] font-medium transition-colors', mode === 'edit' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700')}>Write</button>
          <button type="button" onClick={() => setMode('preview')} className={cn('px-2.5 py-0.5 text-[11px] font-medium transition-colors', mode === 'preview' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700')}>Preview</button>
        </div>
      </div>
      {mode === 'edit' ? (
        <textarea ref={taRef} className="w-full px-3 py-2 text-sm text-slate-700 outline-none resize-y min-h-[160px] bg-white placeholder:text-slate-400" rows="8" placeholder="Write course content in markdown..." value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="px-3 py-2 text-sm text-slate-700 min-h-[160px] prose prose-sm max-w-none">{value || <span className="text-slate-400 italic">Nothing to preview</span>}</div>
      )}
    </div>
  );
}

function FileUpload({ accept, label, icon: Icon, color, file, preview, onFile, onClear, previewType }) {
  const inputRef = useRef(null);
  return (
    <div>
      {file || preview ? (
        <div className="relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          {previewType === 'image' && (
            <img src={preview} alt="" className="h-32 w-full object-cover" />
          )}
          {previewType === 'video' && (
            <video src={preview} className="h-32 w-full object-cover" muted />
          )}
          {!previewType && (
            <div className="flex items-center gap-3 p-3">
              <Icon className={cn('h-8 w-8 shrink-0', color)} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-800 truncate">{file?.name || 'Uploaded file'}</div>
                {file && <div className="text-[10px] text-slate-400">{formatSize(file.size)}</div>}
              </div>
            </div>
          )}
          <button type="button" onClick={onClear} className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-red-500">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-6 text-slate-400 transition-all hover:border-slate-400 hover:bg-slate-100 hover:text-slate-500">
          <UploadCloud className="h-5 w-5" />
          <span className="text-xs font-medium">{label}</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
    </div>
  );
}

function CourseModal({ course, onClose, onSaved }) {
  const { showToast } = useToast();
  const isEdit = !!course;
  const [form, setForm] = useState(() => {
    if (course) return {
      title: course.title || '', description: course.description || '', content: course.content || '',
      category: course.category || 'general', difficulty: course.difficulty || 'beginner',
      estimatedTime: course.estimatedTime || '', published: course.published !== false,
      tags: course.tags?.join(', ') || '', thumbnail: course.thumbnail || '',
      introVideo: course.introVideo || '', videoUrl: course.videoUrl || '',
      resources: course.resources || [],
    };
    return emptyForm();
  });
  const [submitting, setSubmitting] = useState(false);
  const [newResource, setNewResource] = useState({ type: 'link', title: '', url: '', description: '' });
  const [showResourceForm, setShowResourceForm] = useState(false);

  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(course?.thumbnail ? `${API_BASE}${course.thumbnail}` : '');
  const [introVideoFile, setIntroVideoFile] = useState(null);
  const [introVideoPreview, setIntroVideoPreview] = useState('');
  const [courseVideoFile, setCourseVideoFile] = useState(null);
  const [courseVideoPreview, setCourseVideoPreview] = useState('');
  const [resourceFiles, setResourceFiles] = useState({});

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleThumbFile = (file) => {
    setThumbFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setThumbPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleIntroVideoFile = (file) => {
    setIntroVideoFile(file);
    const url = URL.createObjectURL(file);
    setIntroVideoPreview(url);
  };

  const handleCourseVideoFile = (file) => {
    setCourseVideoFile(file);
    const url = URL.createObjectURL(file);
    setCourseVideoPreview(url);
  };

  const handleResourceFile = (idx, file) => {
    setResourceFiles((prev) => ({ ...prev, [idx]: file }));
    const resources = [...form.resources];
    resources[idx] = { ...resources[idx], title: resources[idx].title || file.name, type: getResTypeFromFile(file) };
    update('resources', resources);
  };

  function getResTypeFromFile(file) {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf' || file.type.includes('word') || file.type.includes('presentation') || file.type.includes('excel') || file.type === 'text/plain') return 'file';
    if (file.type.startsWith('image/')) return 'book';
    return 'link';
  }

  const addResource = () => {
    if (!newResource.title.trim() && !newResource.url.trim()) return showToast('Resource needs a title or URL', 'error');
    update('resources', [...form.resources, { ...newResource, _id: Date.now().toString() }]);
    setNewResource({ type: 'link', title: '', url: '', description: '' });
    setShowResourceForm(false);
  };

  const removeResource = (idx) => {
    update('resources', form.resources.filter((_, i) => i !== idx));
    setResourceFiles((prev) => { const n = { ...prev }; delete n[idx]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return showToast('Title and description are required.', 'error');
    setSubmitting(true);

    try {
      const formData = new FormData();
      if (thumbFile) formData.append('thumbnail', thumbFile);
      if (introVideoFile) formData.append('introVideo', introVideoFile);
      if (courseVideoFile) formData.append('videoFile', courseVideoFile);
      Object.entries(resourceFiles).forEach(([idx, file]) => { formData.append('resourceFiles', file); });

      let uploadedFiles = {};
      if (formData.has('thumbnail') || formData.has('introVideo') || formData.has('videoFile') || formData.has('resourceFiles')) {
        uploadedFiles = await uploadFiles(formData);
      }

      const body = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      if (uploadedFiles.thumbnail?.[0]) body.thumbnail = uploadedFiles.thumbnail[0].url;
      if (uploadedFiles.introVideo?.[0]) body.introVideo = uploadedFiles.introVideo[0].url;
      if (uploadedFiles.videoFile?.[0]) body.videoUrl = uploadedFiles.videoFile[0].url;

      if (uploadedFiles.resourceFiles?.length > 0) {
        const existingResources = body.resources.filter((r) => r.url && !r._id?.startsWith(String(Date.now()).slice(0, -4)));
        const newUploadedResources = uploadedFiles.resourceFiles.map((f, i) => ({
          type: getResTypeFromFile({ type: f.mimetype }),
          title: f.originalname,
          url: f.url,
          description: '',
        }));
        body.resources = [...existingResources, ...newUploadedResources];
      }

      const url = isEdit ? `/api/admin/courses/${course._id || course.id}` : '/api/admin/courses';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, body: JSON.stringify(body) });
      if (res.error) { showToast(res.error, 'error'); setSubmitting(false); return; }
      showToast(isEdit ? 'Course updated.' : 'Course created.');
      onSaved();
      onClose();
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-start justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-3 pt-8 sm:pt-12" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 mb-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <BookOpen className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{isEdit ? 'Edit Course' : 'Create Course'}</h3>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto">
          <div className="px-5 py-4 space-y-5">

            {/* ── Basic Info ── */}
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Basic Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Title *</label>
                  <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" placeholder="Course title" value={form.title} onChange={(e) => update('title', e.target.value)} required />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Description *</label>
                  <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none resize-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" rows="2" placeholder="Short description" value={form.description} onChange={(e) => update('description', e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">Category</label>
                    <select className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 outline-none bg-white" value={form.category} onChange={(e) => update('category', e.target.value)}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">Difficulty</label>
                    <select className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 outline-none bg-white" value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)}>
                      {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <label className="mb-1 block text-[11px] font-semibold text-slate-600">Estimated Time</label>
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" placeholder="e.g. 5 min read" value={form.estimatedTime} onChange={(e) => update('estimatedTime', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">Tags</label>
                  <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" placeholder="Comma-separated tags" value={form.tags} onChange={(e) => update('tags', e.target.value)} />
                </div>
              </div>
            </div>

            {/* ── Content ── */}
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Course Content</h4>
              <MarkdownEditor value={form.content} onChange={(v) => update('content', v)} />
            </div>

            {/* ── Thumbnail ── */}
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Thumbnail</h4>
              <FileUpload
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                label="Upload thumbnail from device"
                icon={Image}
                color="text-violet-500"
                file={thumbFile}
                preview={thumbPreview}
                onFile={handleThumbFile}
                onClear={() => { setThumbFile(null); setThumbPreview(''); update('thumbnail', ''); }}
                previewType="image"
              />
              <div className="mt-2">
                <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" placeholder="Or paste image URL..." value={form.thumbnail} onChange={(e) => { update('thumbnail', e.target.value); if (e.target.value) { setThumbFile(null); setThumbPreview(e.target.value); } }} />
              </div>
            </div>

            {/* ── Video ── */}
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Video Content</h4>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">Intro / Trailer Video</label>
                  <FileUpload
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    label="Upload intro video from device"
                    icon={Video}
                    color="text-red-500"
                    file={introVideoFile}
                    preview={introVideoPreview}
                    onFile={handleIntroVideoFile}
                    onClear={() => { setIntroVideoFile(null); setIntroVideoPreview(''); update('introVideo', ''); }}
                    previewType="video"
                  />
                  <div className="mt-2">
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" placeholder="Or paste YouTube/Vimeo URL..." value={form.introVideo} onChange={(e) => { update('introVideo', e.target.value); if (e.target.value) { setIntroVideoFile(null); setIntroVideoPreview(''); } }} />
                  </div>
                  {form.introVideo && getYouTubeId(form.introVideo) && (
                    <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                      <iframe className="w-full" style={{ aspectRatio: '16/9' }} src={`https://www.youtube.com/embed/${getYouTubeId(form.introVideo)}`} title="Intro video preview" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-slate-600">Full Course Video</label>
                  <FileUpload
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    label="Upload course video from device"
                    icon={Video}
                    color="text-red-500"
                    file={courseVideoFile}
                    preview={courseVideoPreview}
                    onFile={handleCourseVideoFile}
                    onClear={() => { setCourseVideoFile(null); setCourseVideoPreview(''); update('videoUrl', ''); }}
                    previewType="video"
                  />
                  <div className="mt-2">
                    <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" placeholder="Or paste YouTube/Vimeo URL..." value={form.videoUrl} onChange={(e) => update('videoUrl', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Resources ── */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Resources ({form.resources.length})</h4>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => { setShowResourceForm(true); setNewResource((r) => ({ ...r, type: 'link' })); }} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">
                    <Link2 className="h-3 w-3" /> Add Link
                  </button>
                  <label className="flex cursor-pointer items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800">
                    <Upload className="h-3 w-3" /> Upload File
                    <input type="file" accept="image/*,video/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar" className="hidden" multiple onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      const newResources = files.map((f) => ({
                        type: getResTypeFromFile(f), title: f.name, url: '', description: '', _id: Date.now().toString() + Math.random(),
                      }));
                      const newResourceFiles = {};
                      files.forEach((f, i) => { newResourceFiles[form.resources.length + i] = f; });
                      setResourceFiles((prev) => ({ ...prev, ...newResourceFiles }));
                      update('resources', [...form.resources, ...newResources]);
                      e.target.value = '';
                    }} />
                  </label>
                </div>
              </div>

              {/* Resource list */}
              {form.resources.length > 0 && (
                <div className="mb-3 space-y-1.5">
                  {form.resources.map((res, idx) => {
                    const RT = RESOURCE_TYPES.find((t) => t.value === res.type) || RESOURCE_TYPES[1];
                    const Icon = RT.icon;
                    const isUploadedFile = res.url?.startsWith('/uploads/');
                    const hasLocalFile = !!resourceFiles[idx];
                    return (
                      <div key={res._id || idx} className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <Icon className={cn('h-4 w-4 shrink-0', RT.color)} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-800 truncate">
                            {res.title}
                            {(isUploadedFile || hasLocalFile) && <span className="ml-1 inline-flex items-center rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-bold text-emerald-600">FILE</span>}
                          </div>
                          {res.url && !isUploadedFile && !hasLocalFile && <div className="text-[10px] text-slate-400 truncate">{res.url}</div>}
                          {(isUploadedFile || hasLocalFile) && <div className="text-[10px] text-emerald-500 truncate">{isUploadedFile ? res.url : resourceFiles[idx]?.name}</div>}
                        </div>
                        <button type="button" onClick={() => removeResource(idx)} className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add link form */}
              {showResourceForm && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">Add Link</span>
                    <button type="button" onClick={() => setShowResourceForm(false)} className="text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>
                  </div>
                  <div className="flex gap-2">
                    {RESOURCE_TYPES.map((rt) => {
                      const Icon = rt.icon;
                      return (
                        <button key={rt.value} type="button" onClick={() => setNewResource((r) => ({ ...r, type: rt.value }))} className={cn('flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all', newResource.type === rt.value ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300')}>
                          <Icon className="h-3 w-3" /> {rt.label.split(' ')[0]}
                        </button>
                      );
                    })}
                  </div>
                  <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none bg-white" placeholder="Resource title *" value={newResource.title} onChange={(e) => setNewResource((r) => ({ ...r, title: e.target.value }))} />
                  <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none bg-white" placeholder="URL" value={newResource.url} onChange={(e) => setNewResource((r) => ({ ...r, url: e.target.value }))} />
                  <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none bg-white" placeholder="Description (optional)" value={newResource.description} onChange={(e) => setNewResource((r) => ({ ...r, description: e.target.value }))} />
                  <button type="button" onClick={addResource} className="w-full rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800">Add Resource</button>
                </div>
              )}
            </div>

            {/* ── Publish Toggle ── */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                {form.published ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
                <div>
                  <div className="text-xs font-semibold text-slate-800">{form.published ? 'Published' : 'Draft (Hidden)'}</div>
                  <div className="text-[10px] text-slate-400">{form.published ? 'Visible to students' : 'Hidden from student view'}</div>
                </div>
              </div>
              <button type="button" onClick={() => update('published', !form.published)} className={cn('relative h-6 w-11 rounded-full transition-colors', form.published ? 'bg-emerald-500' : 'bg-slate-300')}>
                <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform', form.published ? 'left-[22px]' : 'left-0.5')} />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
              {submitting ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Save className="h-3.5 w-3.5" />}
              {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCourses() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modal, setModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  const fetchCourses = () => {
    setLoading(true);
    apiFetch('/api/admin/courses')
      .then((d) => { setCourses([...d].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { const close = () => setMenuOpen(null); document.addEventListener('click', close); return () => document.removeEventListener('click', close); }, []);

  const togglePublish = async (course) => {
    const id = course._id || course.id;
    const res = await apiFetch(`/api/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify({ published: !course.published }) });
    if (res.error) return showToast(res.error, 'error');
    setCourses((prev) => prev.map((c) => (c._id === id || c.id === id ? { ...c, published: !c.published } : c)));
    showToast(course.published ? 'Course hidden from students.' : 'Course published.');
  };

  const handleDelete = async (course) => {
    const id = course._id || course.id;
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    await apiFetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
    setCourses((prev) => prev.filter((c) => c._id !== id && c.id !== id));
    setDeletingId(null);
    showToast('Course deleted.');
  };

  const filtered = courses.filter((c) => {
    if (filterCat !== 'all' && c.category !== filterCat) return false;
    if (filterStatus === 'published' && !c.published) return false;
    if (filterStatus === 'draft' && c.published) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || c.tags?.some((t) => t.toLowerCase().includes(q));
    }
    return true;
  });

  const publishedCount = courses.filter((c) => c.published).length;
  const draftCount = courses.length - publishedCount;
  const totalResources = courses.reduce((acc, c) => acc + (c.resources?.length || 0), 0);
  const totalVideos = courses.reduce((acc, c) => acc + ((c.introVideo || c.videoUrl) ? 1 : 0), 0);
  const nid = (c) => c._id || c.id;

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          { label: 'Total', value: courses.length, icon: BookOpen, color: 'text-slate-600' },
          { label: 'Published', value: publishedCount, icon: Eye, color: 'text-emerald-500' },
          { label: 'Drafts', value: draftCount, icon: EyeOff, color: 'text-amber-500' },
          { label: 'Videos', value: totalVideos, icon: Video, color: 'text-red-500' },
          { label: 'Resources', value: totalResources, icon: ExternalLink, color: 'text-blue-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-3">
            <s.icon className={cn('mb-1.5 h-4 w-4', s.color)} />
            <div className="text-lg font-extrabold text-slate-900">{s.value}</div>
            <div className="text-[10px] font-medium text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 h-8 flex-1 sm:w-56">
            <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" />
          </div>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 outline-none">
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 outline-none">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <button onClick={() => setModal('create')} className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
          <Plus className="h-3.5 w-3.5" /> New Course
        </button>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16">
          <BookOpen className="mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">{courses.length === 0 ? 'No courses yet' : 'No courses match your filters'}</p>
          {courses.length === 0 && (
            <button onClick={() => setModal('create')} className="mt-3 flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
              <Plus className="h-3 w-3" /> Create First Course
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => {
            const id = nid(course);
            const resources = course.resources || [];
            const hasVideo = !!(course.introVideo || course.videoUrl);
            return (
              <div key={id} className="group relative rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md overflow-hidden">
                {/* Thumbnail */}
                <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
                  {(course.thumbnail || course.thumbnail?.startsWith?.('/uploads/')) ? (
                    <img src={course.thumbnail?.startsWith?.('/') ? `${API_BASE}${course.thumbnail}` : course.thumbnail} alt="" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : null}
                  <div className={cn('absolute inset-0 items-center justify-center', course.thumbnail ? 'hidden' : 'flex')}>
                    <BookOpen className="h-8 w-8 text-slate-200" />
                  </div>
                  <div className="absolute left-2 top-2">
                    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold', course.published ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white')}>
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="absolute right-2 top-2">
                    <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === id ? null : id); }} className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/30 text-white backdrop-blur-sm hover:bg-black/50">
                      <GripVertical className="h-3.5 w-3.5" />
                    </button>
                    {menuOpen === id && (
                      <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-xl z-10">
                        <button onClick={(e) => { e.stopPropagation(); setModal(course); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                          <Edit3 className="h-3.5 w-3.5 text-slate-400" /> Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); togglePublish(course); setMenuOpen(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50">
                          {course.published ? <><EyeOff className="h-3.5 w-3.5 text-amber-500" /> Unpublish</> : <><Eye className="h-3.5 w-3.5 text-emerald-500" /> Publish</>}
                        </button>
                        <div className="my-0.5 border-t border-slate-100" />
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(course); setMenuOpen(null); }} disabled={deletingId === id} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" /> {deletingId === id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-3.5">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold', CATEGORY_COLORS[course.category])}>{course.category}</span>
                    <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold', DIFFICULTY_COLORS[course.difficulty])}>{course.difficulty}</span>
                  </div>
                  <h4 className="mb-1 text-sm font-bold text-slate-900 line-clamp-1">{course.title}</h4>
                  <p className="mb-3 text-[11px] leading-relaxed text-slate-500 line-clamp-2">{course.description || 'No description'}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    {course.estimatedTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.estimatedTime}</span>}
                    {resources.length > 0 && <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {resources.length} resource{resources.length !== 1 ? 's' : ''}</span>}
                    {hasVideo && <span className="flex items-center gap-1"><Video className="h-3 w-3" /> Video</span>}
                  </div>
                  {course.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500">{tag}</span>
                      ))}
                      {course.tags.length > 3 && <span className="text-[9px] text-slate-400">+{course.tags.length - 3}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && <CourseModal course={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSaved={fetchCourses} />}
    </div>
  );
}
