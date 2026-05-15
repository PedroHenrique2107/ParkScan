interface ConfirmDialogProps {
  message: string
  detail?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  message,
  detail,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm mx-0 sm:mx-4 p-6 shadow-2xl">
        <p className="text-base font-semibold text-gray-900 text-center">{message}</p>
        {detail && <p className="mt-2 text-sm text-gray-500 text-center">{detail}</p>}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-colors active:opacity-90 touch-manipulation ${
              danger
                ? 'bg-red-500 text-white active:bg-red-600'
                : 'bg-blue-600 text-white active:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700 active:bg-gray-200 touch-manipulation"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
