import { useEffect, useRef } from 'react';

function parseReadingTime(str) {
  if (!str) return 0;
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export default function useAutoComplete({ lesson, isComplete, onMark }) {
  const timerRef = useRef(null);
  const onMarkRef = useRef(onMark);
  onMarkRef.current = onMark;

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!lesson || lesson.locked || lesson.type === 'assessment' || lesson.type === 'certificate') return;
    if (isComplete) return;

    const minutes = parseReadingTime(lesson.readingTime);
    if (minutes <= 0) return;

    const ms = minutes * 60 * 1000;

    timerRef.current = setTimeout(() => {
      switch (lesson.type) {
        case 'content':
          onMarkRef.current('content');
          break;
        case 'overview':
          onMarkRef.current('content');
          break;
        case 'intro-video':
          onMarkRef.current('introVideo');
          break;
        case 'video':
          onMarkRef.current('video');
          break;
        case 'resource':
          onMarkRef.current('resource', lesson.resource?._id);
          break;
      }
      timerRef.current = null;
    }, ms);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [lesson?.id, lesson?.type, lesson?.readingTime, isComplete]);
}
