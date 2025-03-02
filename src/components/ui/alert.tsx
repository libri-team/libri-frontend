'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface Alert {
  id: number;
  message: string;
  type: AlertType;
}

// 전역 상태로 alerts 관리
let alerts: Alert[] = [];
let alertCounter = 0;
let listeners: (() => void)[] = [];

// Alerts 컴포넌트에서 사용할 hooks
const useAlerts = () => {
  const [alertsList, setAlertsList] = useState<Alert[]>(alerts);

  useEffect(() => {
    const updateAlerts = () => {
      setAlertsList([...alerts]);
    };

    listeners.push(updateAlerts);
    return () => {
      listeners = listeners.filter(listener => listener !== updateAlerts);
    };
  }, []);

  return alertsList;
};

// Alert 표시 함수
export const showAlert = (message: string, type: AlertType = 'info', duration: number = 5000) => {
  const id = alertCounter++;
  const newAlert = { id, message, type };
  
  alerts = [...alerts, newAlert];
  notifyListeners();
  
  // 자동으로 알림 제거
  setTimeout(() => {
    removeAlert(id);
  }, duration);
  
  return id;
};

// Alert 제거 함수
export const removeAlert = (id: number) => {
  alerts = alerts.filter(alert => alert.id !== id);
  notifyListeners();
};

// Listeners에게 상태 변경 알림
const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

// Alert 아이콘 컴포넌트
const AlertIcon = ({ type }: { type: AlertType }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-white" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-white" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-white" />;
    case 'info':
      return <AlertCircle className="w-5 h-5 text-white" />;
    default:
      return null;
  }
};

// Alert 배경색 클래스 결정
const getAlertBgColor = (type: AlertType) => {
  switch (type) {
    case 'success':
      return 'bg-emerald-500';
    case 'error':
      return 'bg-red-500';
    case 'warning':
      return 'bg-amber-500';
    case 'info':
      return 'bg-blue-500';
    default:
      return 'bg-gray-700';
  }
};

// Alert 컴포넌트
const Alert = ({ alert, onClose }: { alert: Alert; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-center justify-between p-4 mb-3 rounded-lg shadow-lg ${getAlertBgColor(alert.type)} text-white min-w-[300px] max-w-md`}
    >
      <div className="flex items-center space-x-3">
        <AlertIcon type={alert.type} />
        <span>{alert.message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-white hover:text-white/80 focus:outline-none"
        aria-label="Close alert"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Alerts 컨테이너 컴포넌트
export default function Alerts() {
  const alertsList = useAlerts();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      <AnimatePresence>
        {alertsList.map(alert => (
          <Alert
            key={alert.id}
            alert={alert}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
} 