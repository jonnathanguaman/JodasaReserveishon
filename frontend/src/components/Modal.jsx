import { X } from 'lucide-react';

export default function Modal({ title, kicker, children, onClose, actions }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
        <div className="panel-head">
          <div>
            {kicker && <p className="kicker">{kicker}</p>}
            <h2>{title}</h2>
          </div>
          <div className="row-actions">
            {actions}
            <button className="icon-button" type="button" title="Cerrar" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>
        {children}
      </section>
    </div>
  );
}
