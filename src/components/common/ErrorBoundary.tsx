import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in One Health Rabies Dashboard:', error, errorInfo);
    // @ts-expect-error React 19 type definition
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    // @ts-expect-error React 19 type definition
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">ระบบพบข้อผิดพลาดในการแสดงผล</h1>
                <p className="text-xs text-slate-400">One Health Rabies Dashboard — นครศรีธรรมราช</p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs font-mono text-rose-300 overflow-x-auto max-h-48">
              {this.state.error?.toString() || 'Unknown runtime error occurred'}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                ลองใหม่อีกครั้ง (Retry)
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>รีโหลดหน้าต่าง (Reload)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // @ts-expect-error React 19 type definition
    return this.props.children;
  }
}
