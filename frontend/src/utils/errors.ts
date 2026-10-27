type ActionErrorListener = (error: unknown) => void;

let actionErrorListener: ActionErrorListener | null = null;

export function registerActionErrorListener(listener: ActionErrorListener | null) {
  actionErrorListener = listener;
}

/** Ошибка сорвала действие пользователя: toast + console.error */
export function reportActionError(error: unknown, context?: string) {
  if (context) console.error(context, error);
  else console.error(error);
  actionErrorListener?.(error);
}

/** Ошибка уже обработана, пользователь ничего не заметил: только console.error */
export function logHandledError(error: unknown, context?: string) {
  if (context) console.error(context, error);
  else console.error(error);
}

declare global {
  interface Window {
    __reportActionError?: typeof reportActionError;
  }
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__reportActionError = reportActionError;
}
