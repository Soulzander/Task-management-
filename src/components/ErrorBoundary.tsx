import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-500/30 p-8 rounded-2xl max-w-md w-full">
            <h2 className="text-red-400 text-xl font-bold mb-4">Something went wrong</h2>
            <p className="text-zinc-400 text-sm mb-6">
              The application encountered an unexpected error. This might be due to corrupted local data or an update.
            </p>
            <div className="bg-black/50 p-4 rounded-lg overflow-auto text-xs text-red-300 font-mono mb-6 max-h-32">
              {this.state.error?.message || 'Unknown error'}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg transition-colors"
              >
                Clear Data & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
