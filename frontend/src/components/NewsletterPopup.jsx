import { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function NewsletterPopup({ open, onClose }) {
  const formRef = useRef(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!open || !formRef.current || scriptLoaded.current) return;

    const script = document.createElement('script');
    script.src = 'https://static-bundles.visme.co/forms/vismeforms-embed.js';
    script.async = true;
    formRef.current.appendChild(script);
    scriptLoaded.current = true;
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="nl-overlay" onClick={onClose} />
      <div className="nl-popup">
        <button className="nl-close" onClick={onClose}><FaTimes /></button>
        <div className="nl-form-wrap" ref={formRef}>
          <div
            className="visme_d"
            data-title="Newsletter Signup Form"
            data-url="7vgjpr3x-newsletter-signup-form?sidebar=true"
            data-domain="forms"
            data-full-page="true"
            data-min-height="700px"
            data-form-id="191152"
          />
        </div>
      </div>
    </>
  );
}
