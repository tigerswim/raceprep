import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Generic Error Boundary component that catches JavaScript errors in the component tree
 * and displays a fallback UI instead of crashing the entire application.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error state if resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorState();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorState = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleRetry = () => {
    this.resetErrorState();
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary-container" style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
          textAlign: 'center',
        }}>
          <div className="error-boundary-icon" style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}>
            ⚠️
          </div>
          <h3 style={{
            color: '#d73a49',
            marginBottom: '12px',
            fontSize: '18px',
          }}>
            Something went wrong
          </h3>
          <p style={{
            color: '#586069',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            We encountered an unexpected error. This could be due to a network issue or a temporary problem.
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              backgroundColor: '#0366d6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0256cc';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#0366d6';
            }}
          >
            Try Again
          </button>
          {process.env.NODE_ENV === 'development' && error && (
            <details style={{
              marginTop: '20px',
              textAlign: 'left',
              backgroundColor: '#f6f8fa',
              border: '1px solid #d1d5da',
              borderRadius: '6px',
              padding: '12px',
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: '600',
                marginBottom: '8px',
              }}>
                Error Details (Development Only)
              </summary>
              <pre style={{
                fontSize: '12px',
                overflow: 'auto',
                color: '#d73a49',
                margin: 0,
              }}>
                {error.toString()}
              </pre>
              {this.state.errorInfo && (
                <pre style={{
                  fontSize: '12px',
                  overflow: 'auto',
                  color: '#586069',
                  marginTop: '8px',
                  margin: 0,
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}
        </div>
      );
    }

    return children;
  }
}

/**
 * Higher-order component that wraps a component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Specialized Error Boundary for Strava integration failures
 */
export const StravaErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    fallback={
      <div style={{
        padding: '16px',
        margin: '12px 0',
        border: '1px solid #fc5200',
        borderRadius: '6px',
        backgroundColor: '#fff8f1',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔗</div>
        <h4 style={{ color: '#b45309', marginBottom: '8px', fontSize: '16px' }}>
          Strava Connection Issue
        </h4>
        <p style={{ color: '#9a6700', fontSize: '14px', marginBottom: '0' }}>
          There was a problem connecting to Strava. Your training data may not be up to date.
        </p>
      </div>
    }
    onError={(error, errorInfo) => {
      console.error('[StravaErrorBoundary] Strava integration error:', error, errorInfo);
      // TODO: Consider sending error reports to analytics service
    }}
    resetOnPropsChange={true}
    resetKeys={[Date.now()]} // Reset on mount/remount
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;