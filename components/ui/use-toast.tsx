import * as React from "react"

const TOAST_TIMEOUT = 3000

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

interface ToastContext {
  toasts: Toast[]
  toast: (toast: Omit<Toast, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContext | null>(null)

export function ToastProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback(
    ({ title, description, variant = "default", duration = TOAST_TIMEOUT }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      
      setToasts((toasts) => [...toasts, { id, title, description, variant, duration }])
      
      setTimeout(() => {
        setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
      }, duration)
    },
    []
  )

  const dismiss = React.useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 w-full md:max-w-[420px] p-4 md:p-4 flex flex-col gap-4">
        {toasts.map(({ id, title, description, variant }) => (
          <div
            key={id}
            className={`rounded-lg border px-6 py-4 shadow-lg ${
              variant === "destructive" 
                ? "bg-red-600 text-white" 
                : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
            }`}
            onClick={() => dismiss(id)}
          >
            <div className="flex justify-between gap-2">
              <div className="grid gap-1">
                <h3 className="font-medium leading-none tracking-tight">{title}</h3>
                {description && (
                  <p className="text-sm opacity-90">{description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
