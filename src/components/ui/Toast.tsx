'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import { X } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { ...toast, id: Math.random().toString(36).substr(2, 9) }]
  })),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((toast) => toast.id !== id)
  }))
}))

export function useToast() {
  const { addToast, removeToast } = useToastStore()
  
  const toast = (props: { title?: string; description: string; variant?: "default" | "destructive" }) => {
    addToast({
      message: props.title || props.description,
      type: props.variant === "destructive" ? "error" : "success"
    })
  }
  
  return { toast, dismiss: removeToast }
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  useEffect(() => {
    const timeouts = toasts.map(toast => {
      return setTimeout(() => removeToast(toast.id), 5000)
    })

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [toasts, removeToast])

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center justify-between
            px-4 py-3 rounded-lg shadow-lg
            ${toast.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
              toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
              'bg-blue-50 text-blue-700 border border-blue-200'}
          `}
        >
          <p className="text-sm">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-current opacity-50 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}