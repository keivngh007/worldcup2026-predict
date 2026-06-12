import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
          <div className="glass-card p-8 text-center max-w-md">
            <span className="text-5xl mb-4 block">⚠️</span>
            <h1 className="font-display text-xl font-bold text-white mb-2">
              页面出错了
            </h1>
            <p className="text-sm text-white/50 mb-4">
              很抱歉，页面遇到了意外错误，请刷新重试。
            </p>
            <p className="text-xs text-white/20 mb-6 font-mono truncate max-w-full">
              {this.state.error?.message || '未知错误'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="gold-gradient text-surface px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
