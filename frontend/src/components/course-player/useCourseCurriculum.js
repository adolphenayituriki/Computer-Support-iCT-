import { useMemo } from 'react';

const LESSONS_KEY = 'cshub-lessons';

export function getCompletedLessonIds(courseId) {
  try {
    const data = localStorage.getItem(`${LESSONS_KEY}-${courseId}`);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch { return new Set(); }
}

export function markLessonComplete(courseId, lessonId) {
  const ids = getCompletedLessonIds(courseId);
  ids.add(lessonId);
  localStorage.setItem(`${LESSONS_KEY}-${courseId}`, JSON.stringify([...ids]));
}

function splitContentByHeadings(content) {
  if (!content) return [];
  const h2Sections = content.split(/(?=^## )/m).filter(s => s.trim());
  if (h2Sections.length > 1) {
    return h2Sections.map((section, i) => {
      const match = section.match(/^##\s+(.+)/);
      const raw = match ? match[1].replace(/[#*_`]/g, '').trim() : '';
      const title = raw.match(/^part\s*\d+/i) ? raw : `Part ${i + 1}: ${raw || 'Untitled'}`;
      return { title, content: section.trim() };
    });
  }
  const h3Sections = content.split(/(?=^### )/m).filter(s => s.trim());
  if (h3Sections.length > 1) {
    return h3Sections.map((section, i) => {
      const match = section.match(/^###\s+(.+)/);
      const raw = match ? match[1].replace(/[#*_`]/g, '').trim() : '';
      const title = raw.match(/^part\s*\d+/i) ? raw : `Part ${i + 1}: ${raw || 'Untitled'}`;
      return { title, content: section.trim() };
    });
  }
  return [{ title: 'Course Content', content: content.trim() }];
}

function estimateReadingTime(text) {
  if (!text) return '0 min';
  const words = text.replace(/[#*_`>\[\]()!]/g, '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export default function useCourseCurriculum(course, progress, completedLessonIds, assessmentPassed, assessmentFinalized) {
  return useMemo(() => {
    if (!course) return { modules: [], totalLessons: 0, completedLessons: 0 };

    const sections = progress?.sections || {};
    const completed = completedLessonIds || new Set();
    const modules = [];
    let lessonIndex = 0;

    const introLessons = [];
    introLessons.push({
      id: 'overview',
      title: 'Course Overview',
      type: 'overview',
      description: course.description,
      completed: completed.has('overview') || sections.contentRead || false,
      locked: false,
      index: lessonIndex++,
      readingTime: estimateReadingTime(course.description),
    });

    if (course.introVideo) {
      introLessons.push({
        id: 'intro-video',
        title: 'Introduction Video',
        type: 'intro-video',
        videoUrl: course.introVideo,
        completed: completed.has('intro-video') || sections.introVideoWatched || false,
        locked: false,
        index: lessonIndex++,
        readingTime: '2 min watch',
      });
    }

    if (introLessons.length > 0) {
      modules.push({
        id: 'introduction',
        title: 'Course Introduction',
        lessons: introLessons,
      });
    }

    if (course.content) {
      const contentParts = splitContentByHeadings(course.content);

      modules.push({
        id: 'content',
        title: 'Course Content',
        lessons: contentParts.map((part, i) => ({
          id: `content-${i}`,
          title: part.title,
          type: 'content',
          markdownContent: part.content,
          completed: completed.has(`content-${i}`),
          locked: false,
          index: lessonIndex++,
          readingTime: estimateReadingTime(part.content),
        })),
      });
    }

    if (course.videoUrl) {
      modules.push({
        id: 'videos',
        title: 'Video Lessons',
        lessons: [{
          id: 'main-video',
          title: 'Course Video',
          type: 'video',
          videoUrl: course.videoUrl,
          completed: completed.has('main-video') || sections.videoWatched || false,
          locked: false,
          index: lessonIndex++,
          readingTime: course.estimatedTime || '10 min watch',
        }],
      });
    }

    if (course.resources && course.resources.length > 0) {
      modules.push({
        id: 'resources',
        title: 'Resources',
        lessons: course.resources.map((res) => ({
          id: `resource-${res._id}`,
          title: res.title,
          type: 'resource',
          resource: res,
          completed: sections.resourcesChecked?.includes(res._id) || false,
          locked: false,
          index: lessonIndex++,
          readingTime: '1 min',
        })),
      });
    }

    const preAssessCompleted = modules.reduce(
      (count, mod) => count + mod.lessons.filter(l => l.completed).length, 0
    );
    const allContentDone = preAssessCompleted >= lessonIndex;

    modules.push({
      id: 'assessment',
      title: 'Assessment',
      lessons: [{
        id: 'assessment',
        title: 'Course Assessment',
        type: 'assessment',
        completed: assessmentFinalized || assessmentPassed || false,
        locked: assessmentFinalized ? true : (!allContentDone && !assessmentPassed),
        hidden: assessmentFinalized,
        index: lessonIndex++,
        readingTime: '10 min',
      }],
    });

    const preCertCompleted = modules.reduce(
      (count, mod) => count + mod.lessons.filter(l => l.completed).length, 0
    );
    const allPreCertDone = preCertCompleted >= lessonIndex;

    modules.push({
      id: 'certificate',
      title: 'Certificate',
      lessons: [{
        id: 'certificate',
        title: 'Course Certificate',
        type: 'certificate',
        completed: allPreCertDone && assessmentPassed,
        locked: !(allPreCertDone && assessmentPassed),
        index: lessonIndex++,
        readingTime: '1 min',
      }],
    });

    const totalLessons = lessonIndex;
    const completedLessons = modules.reduce(
      (count, mod) => count + mod.lessons.filter(l => l.completed).length, 0
    );

    return { modules, totalLessons, completedLessons };
  }, [course, progress, completedLessonIds, assessmentPassed, assessmentFinalized]);
}
