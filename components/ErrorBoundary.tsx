import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import Button from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Error Card */}
            <div className="relative bg-slate-900/80 backdrop-blur-md border border-red-500/30 rounded-2xl p-8 md:p-12 shadow-2xl">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
                  <div className="relative bg-red-900/30 p-6 rounded-full border-2 border-red-500/50">
                    <AlertTriangle className="w-16 h-16 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-black text-white text-center mb-4 tracking-tight">
                SYSTEM ERROR DETECTED
              </h1>

              {/* Description */}
              <p className="text-slate-400 text-center mb-8 text-lg">
                An unexpected error occurred in the application. Our security protocols have contained the issue.
              </p>

              {/* Error Details (Development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-8 bg-slate-950/50 border border-slate-800 rounded-lg p-4 overflow-auto max-h-64">
                  <div className="flex items-center space-x-2 mb-3">
                    <Bug className="w-4 h-4 text-red-500" />
                    <span className="text-red-400 font-mono text-sm font-bold">DEBUG INFO</span>
                  </div>
                  <pre className="text-xs text-slate-400 font-mono whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo && (
                      <>
                        {'\n\n'}
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="secondary"
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Reload Page
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="ghost"
                  icon={<Home className="w-4 h-4" />}
                >
                  Go Home
                </Button>
              </div>

              {/* Help Text */}
              <div className="mt-8 pt-8 border-t border-slate-800">
                <p className="text-center text-slate-500 text-sm font-mono">
                  ERROR_CODE: {Date.now().toString(36).toUpperCase()}
                </p>
                <p className="text-center text-slate-600 text-xs mt-2">
                  If this persists, contact system administrator
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
