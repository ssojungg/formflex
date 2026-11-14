import { motion, AnimatePresence } from 'framer-motion';

// Icons
const SuccessIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const InfoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const LockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface AlertProps {
  type?: 'success' | 'error' | 'info' | 'login';
  title?: string;
  message: string;
  buttonText: string;
  buttonClick?: () => void;
  secondaryButtonText?: string;
  secondaryButtonClick?: () => void;
  onClose?: () => void;
  isVisible?: boolean;
}

function Alert({ 
  type = 'info', 
  title,
  message, 
  buttonText, 
  buttonClick, 
  secondaryButtonText,
  secondaryButtonClick,
  onClose,
  isVisible = true 
}: AlertProps) {

  const handlePrimaryClick = () => {
    if (buttonClick) {
      buttonClick();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryButtonClick) {
      secondaryButtonClick();
    }
    if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: <SuccessIcon />,
          iconBg: 'bg-emerald-50',
          iconColor: 'text-emerald-600',
          buttonBg: 'bg-primary-500 hover:bg-primary-600',
        };
      case 'error':
        return {
          icon: <ErrorIcon />,
          iconBg: 'bg-red-50',
          iconColor: 'text-red-500',
          buttonBg: 'bg-secondary-900 hover:bg-secondary-800',
        };
      case 'login':
        return {
          icon: <LockIcon />,
          iconBg: 'bg-primary-50',
          iconColor: 'text-primary-600',
          buttonBg: 'bg-primary-500 hover:bg-primary-600',
        };
      case 'info':
      default:
        return {
          icon: <InfoIcon />,
          iconBg: 'bg-primary-50',
          iconColor: 'text-primary-600',
          buttonBg: 'bg-primary-500 hover:bg-primary-600',
        };
    }
  };

  const { icon, iconBg, iconColor, buttonBg } = getIconAndColors();

  const defaultTitles: Record<string, string> = {
    success: '완료됐어요',
    error: '확인이 필요해요',
    info: '알림',
    login: '로그인이 필요해요',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-secondary-900/40"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 12 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative bg-white rounded-2xl border border-secondary-200 shadow-modal w-full max-w-sm overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-3 top-3 p-2 text-text-tertiary hover:text-text-secondary hover:bg-secondary-100 rounded-lg transition-colors z-10"
            >
              <CloseIcon />
            </button>

            {/* Content */}
            <div className="p-6 pt-8 text-center">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${iconBg} ${iconColor} mb-4`}>
                {icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold tracking-tight text-text-primary mb-1.5 break-keep">
                {title || defaultTitles[type]}
              </h3>

              {/* Message */}
              <p className="text-[15px] text-text-secondary leading-relaxed mb-6 break-keep">
                {message}
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handlePrimaryClick}
                  className={`w-full h-12 px-6 ${buttonBg} text-white font-semibold rounded-xl transition-colors`}
                >
                  {buttonText}
                </button>

                {secondaryButtonText && (
                  <button
                    onClick={handleSecondaryClick}
                    className="w-full h-12 px-6 bg-secondary-100 text-text-secondary font-medium rounded-xl hover:bg-secondary-200 transition-colors"
                  >
                    {secondaryButtonText}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Alert;
