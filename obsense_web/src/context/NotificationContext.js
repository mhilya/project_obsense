import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';
import ToastContainer from '../components/common/ToastContainer';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState(null);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((message) => addToast(message, 'success'), [addToast]);
  const showError = useCallback((message) => addToast(message, 'error', 4500), [addToast]);
  const showWarning = useCallback((message) => addToast(message, 'warning'), [addToast]);
  const showInfo = useCallback((message) => addToast(message, 'info'), [addToast]);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmConfig({
        ...options,
        onConfirm: () => {
          setConfirmConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmConfig(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
        confirm
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {confirmConfig && (
        <ConfirmModal
          isOpen={true}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          danger={confirmConfig.danger}
          onConfirm={confirmConfig.onConfirm}
          onClose={confirmConfig.onCancel}
        />
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;
