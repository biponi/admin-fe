import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChatErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex items-center justify-center h-full bg-gray-50'>
          <div className='text-center max-w-md mx-auto p-8'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <AlertCircle className='w-8 h-8 text-red-600' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Something went wrong
            </h3>
            <p className='text-gray-500 mb-4'>
              The chat system encountered an error. Please try refreshing or contact support if the problem persists.
            </p>
            <div className='space-y-2'>
              <Button onClick={this.handleRetry} className='flex items-center gap-2'>
                <RefreshCw className='w-4 h-4' />
                Try Again
              </Button>
              <Button 
                variant='outline' 
                onClick={() => window.location.reload()}
                className='flex items-center gap-2 w-full'
              >
                Refresh Page
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className='mt-4 text-left'>
                <summary className='text-sm text-gray-600 cursor-pointer'>
                  Error Details (Development)
                </summary>
                <pre className='text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-auto max-h-32'>
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
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