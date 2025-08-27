import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class IOSErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('iOS Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private isIOSDevice = (): boolean => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  private reloadPage = (): void => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Something went wrong
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {this.isIOSDevice() 
                  ? "We detected an issue with iOS compatibility. Please try the following:"
                  : "An unexpected error occurred. Please try refreshing the page."
                }
              </p>
            </div>
            
            <div className="mt-8 space-y-4">
              <button
                onClick={this.reloadPage}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh Page
              </button>
              
              {this.isIOSDevice() && (
                <div className="text-xs text-gray-500 space-y-2">
                  <p>iOS Safari troubleshooting tips:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Clear Safari cache and cookies</li>
                    <li>Try using Chrome browser instead</li>
                    <li>Ensure JavaScript is enabled</li>
                    <li>Check your iOS version is up to date</li>
                  </ul>
                </div>
              )}
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-gray-600">Error Details</summary>
                <pre className="mt-2 text-red-600 bg-red-50 p-2 rounded overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default IOSErrorBoundary;