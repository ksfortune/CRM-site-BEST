import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { registerActionErrorListener, reportActionError } from '../utils/errors';

interface ErrorToastContextValue {
  showErrorToast: () => void;
}

const ErrorToastContext = createContext<ErrorToastContextValue | null>(null);

const TOAST_MS = 4200;
const EXIT_MS = 280;

type ToastPhase = 'in' | 'out';

export function ErrorToastProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<ToastPhase | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const startHide = useCallback(() => {
    setPhase('out');
    if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
    exitTimerRef.current = window.setTimeout(() => {
      setPhase(null);
      exitTimerRef.current = null;
    }, EXIT_MS);
  }, []);

  const showErrorToast = useCallback(() => {
    clearTimers();
    setPhase('in');
    hideTimerRef.current = window.setTimeout(() => {
      startHide();
      hideTimerRef.current = null;
    }, TOAST_MS);
  }, [clearTimers, startHide]);

  useEffect(() => {
    let lastShownAt = 0;
    registerActionErrorListener(() => {
      const now = Date.now();
      if (now - lastShownAt < 400) return;
      lastShownAt = now;
      showErrorToast();
    });
    return () => {
      registerActionErrorListener(null);
      clearTimers();
    };
  }, [showErrorToast, clearTimers]);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportActionError(event.error ?? event.message, 'Uncaught error');
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      reportActionError(event.reason, 'Unhandled promise rejection');
    };
    window.addEventListener('error', onError, true);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError, true);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return (
    <ErrorToastContext.Provider value={{ showErrorToast }}>
      {children}
      {phase && (
        <div
          className={`error-toast error-toast-${phase}`}
          role="alert"
        >
          Произошла ошибка
        </div>
      )}
    </ErrorToastContext.Provider>
  );
}

export function useErrorToast() {
  const ctx = useContext(ErrorToastContext);
  if (!ctx) throw new Error('useErrorToast должен вызываться внутри ErrorToastProvider');
  return ctx;
}
