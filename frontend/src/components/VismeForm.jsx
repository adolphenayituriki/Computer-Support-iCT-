import { useEffect, useRef } from 'react';

export default function VismeForm({ formId, height = 600 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!formId || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://static-bundles.visme.co/forms/vismeforms.js';
    script.async = true;

    script.onload = () => {
      if (window.VismeForms) {
        window.VismeForms.init({
          formId,
          container: `#visme-form-${formId}`,
        });
      }
    };

    container.appendChild(script);
  }, [formId]);

  return (
    <div
      id={`visme-form-${formId}`}
      ref={containerRef}
      style={{ width: '100%', minHeight: height }}
    />
  );
}
