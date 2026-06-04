import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastType } from '../components/common/Toast';

interface ToastData {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (title: string, message: string, type: ToastType, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (title: string, message: string = '', type: ToastType, duration: number = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const contextValue: ToastContextType = {
    showToast,
    success: (title, message) => showToast(title, message, 'success'),
    error: (title, message) => showToast(title, message, 'error'),
    info: (title, message) => showToast(title, message, 'info'),
    warning: (title, message) => showToast(title, message, 'warning'),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onHide={removeToast}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
