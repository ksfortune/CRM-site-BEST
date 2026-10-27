import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportActionError } from '../utils/errors';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportActionError(error, `React render error: ${info.componentStack || ''}`);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback">
          <p>Произошла ошибка</p>
          <button type="button" className="btn-primary" onClick={this.handleReload}>
            Обновить страницу
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
