// src/components/recommendation/RecommendationAlert.jsx
import React, { useState } from 'react';
import { AlertTriangle, X, RefreshCw, Info, CheckCircle } from 'lucide-react';

const RecommendationAlert = ({ 
  type = 'info', 
  message, 
  onRetry, 
  onDismiss,
  dismissible = true,
  showRetry = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isVisible) return null;

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          button: 'text-green-600 hover:text-green-800'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
          button: 'text-yellow-600 hover:text-yellow-800'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          button: 'text-red-600 hover:text-red-800'
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: <Info className="w-5 h-5 text-blue-500" />,
          button: 'text-blue-600 hover:text-blue-800'
        };
    }
  };

  const styles = getAlertStyles();

  return (
    <div className="px-6 py-4">
      <div className="container mx-auto">
        <div className={`border rounded-lg p-4 ${styles.container}`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {styles.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {message}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-auto">
              {showRetry && onRetry && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className={`inline-flex items-center space-x-1 text-sm font-medium ${styles.button} hover:underline disabled:opacity-50`}
                >
                  <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Mencoba...' : 'Coba Lagi'}</span>
                </button>
              )}
              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className={`${styles.button} hover:bg-black hover:bg-opacity-10 rounded p-1`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationAlert;