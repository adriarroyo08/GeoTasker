import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
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

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
            <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Algo salió mal
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la aplicación.
            </p>
            {this.state.error && (
                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-left text-xs text-mono mb-6 overflow-auto max-h-32 text-red-500">
                    {this.state.error.toString()}
                </div>
            )}
            <button
              onClick={this.handleReload}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors w-full flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
