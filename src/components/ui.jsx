import { useEffect } from 'react';
import { X, Loader2, Inbox, AlertTriangle } from 'lucide-react';
import { INVOICE_STATUSES, LEAD_STATUSES, STAGES } from '../lib/constants';

export function Badge({ tone = 'neutral', children }) {
  return <span className={`dash-badge tone-${tone}`}>{children}</span>;
}

export const StageBadge = ({ stage }) => <Badge tone={STAGES[stage]?.tone}>{STAGES[stage]?.label ?? stage}</Badge>;
export const LeadBadge = ({ status }) => <Badge tone={LEAD_STATUSES[status]?.tone}>{LEAD_STATUSES[status]?.label ?? status}</Badge>;
export const InvoiceBadge = ({ status }) => (
  <Badge tone={INVOICE_STATUSES[status]?.tone}>{INVOICE_STATUSES[status]?.label ?? status}</Badge>
);

export function ProgressBar({ value = 0, size = 'md' }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`progress progress-${size}`} role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-fill" style={{ width: `${v}%` }} />
    </div>
  );
}

export function Spinner({ label = 'Memuat…' }) {
  return (
    <div className="dash-state" role="status">
      <Loader2 className="spin" size={28} />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, hint, action }) {
  return (
    <div className="dash-state">
      <Icon size={36} strokeWidth={1.5} />
      <strong>{title}</strong>
      {hint && <span>{hint}</span>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="dash-state dash-state-error" role="alert">
      <AlertTriangle size={32} />
      <strong>{error?.message || 'Terjadi kesalahan.'}</strong>
      {onRetry && (
        <button className="btn btn-outline btn-sm" onClick={onRetry}>
          Coba lagi
        </button>
      )}
    </div>
  );
}

/** Pembungkus status async: loading / error / konten. */
export function Async({ state, children }) {
  if (state.loading && !state.data) return <Spinner />;
  if (state.error) return <ErrorState error={state.error} onRetry={state.reload} />;
  return children(state.data);
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="dash-page-header">
      <div>
        <h1 className="dash-title">{title}</h1>
        {subtitle && <p className="dash-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="dash-actions">{actions}</div>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="input-group">
      <span className="input-label">{label}</span>
      {children}
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  );
}

export function FormError({ error }) {
  return error ? (
    <div className="form-error" role="alert">
      {error}
    </div>
  ) : null;
}
