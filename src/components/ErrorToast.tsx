import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type ToastType = 'error' | 'warning' | 'info' | 'success'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ErrorToastProps {
  toast: Toast
  onDismiss: (id: string) => void
}

const ErrorToast: React.FC<ErrorToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  const getToastStyles = () => {
    switch (toast.type) {
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-300 dark:border-red-700',
          text: 'text-red-800 dark:text-red-200',
          icon: '❌',
          iconBg: 'bg-red-100 dark:bg-red-900/40'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-300 dark:border-yellow-700',
          text: 'text-yellow-800 dark:text-yellow-200',
          icon: '⚠️',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/40'
        }
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-300 dark:border-blue-700',
          text: 'text-blue-800 dark:text-blue-200',
          icon: 'ℹ️',
          iconBg: 'bg-blue-100 dark:bg-blue-900/40'
        }
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-300 dark:border-green-700',
          text: 'text-green-800 dark:text-green-200',
          icon: '✅',
          iconBg: 'bg-green-100 dark:bg-green-900/40'
        }
    }
  }

  const styles = getToastStyles()

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`${styles.bg} ${styles.border} border-2 rounded-organic-lg shadow-organic-lg p-4 mb-3 flex items-start gap-3 max-w-md`}
    >
      <div className={`${styles.iconBg} rounded-full p-2 flex-shrink-0`}>
        <span className="text-lg">{styles.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${styles.text} text-sm font-medium leading-relaxed`}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className={`${styles.text} hover:opacity-70 transition-opacity flex-shrink-0 ml-2`}
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ErrorToast key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

export default ErrorToast

