'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
  message: string;
  type?: AlertType;
  duration?: number;
  onClose?: () => void;
}

interface AlertState {
  visible: boolean;
  message: string;
  type: AlertType;
}

// Singleton pattern for global alert management
class AlertManager {
  private static instance: AlertManager;
  private listeners: Set<(state: AlertState) => void> = new Set();
  private currentState: AlertState = {
    visible: false,
    message: '',
    type: 'info',
  };

  private constructor() {}

  public static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  public subscribe(callback: (state: AlertState) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentState);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public show(message: string, type: AlertType = 'info', duration: number = 3000): void {
    this.currentState = { visible: true, message, type };
    this.notifyListeners();

    if (duration > 0) {
      setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  public hide(): void {
    this.currentState = { ...this.currentState, visible: false };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.currentState);
    });
  }
}

export const alertManager = AlertManager.getInstance();

export function showAlert(message: string, type: AlertType = 'info', duration: number = 3000): void {
  alertManager.show(message, type, duration);
}

const Alert: React.FC<AlertProps> = ({ 
  message, 
  type = 'info', 
  duration = 3000,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) setTimeout(onClose, 300);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      case 'info':
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    const baseStyles = 'flex items-center gap-3 p-4 rounded-lg shadow-md';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-emerald-50 text-emerald-800 border border-emerald-200`;
      case 'error':
        return `${baseStyles} bg-red-50 text-red-800 border border-red-200`;
      case 'warning':
        return `${baseStyles} bg-amber-50 text-amber-800 border border-amber-200`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 text-blue-800 border border-blue-200`;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 inset-x-0 z-50 flex justify-center px-4"
        >
          <div className={getStyles()}>
            <span className="flex-shrink-0">{getIcon()}</span>
            <p className="flex-grow text-sm font-medium">{message}</p>
            <button onClick={handleClose} className="flex-shrink-0 text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const GlobalAlert: React.FC = () => {
  const [state, setState] = useState<AlertState>({ visible: false, message: '', type: 'info' });

  useEffect(() => {
    return alertManager.subscribe(setState);
  }, []);

  if (!state.visible) return null;

  return <Alert message={state.message} type={state.type} onClose={() => alertManager.hide()} />;
};

export default Alert; 