import type { ToastMessage } from '../types/assets'

type ToastViewportProps = {
  toasts: ToastMessage[]
  onDismiss: (id: number) => void
}

export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null

  return (
    <aside className="toast-viewport" aria-live="polite" aria-label="Notificacoes">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.tone}`}>
          <div className="toast-copy">
            <strong>{toast.title}</strong>
            {toast.description ? <p>{toast.description}</p> : null}
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Fechar notificacao"
          >
            x
          </button>
        </div>
      ))}
    </aside>
  )
}
