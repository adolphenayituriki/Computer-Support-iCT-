export default function Modal({ open, onClose, children, wide, hideClose }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content${wide ? ' modal-content-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        {!hideClose && <button className="modal-close" onClick={onClose}>&times;</button>}
        {children}
      </div>
    </div>
  );
}
