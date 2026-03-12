import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, RefreshCw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  likelyStaleCacheIssue: boolean;
}

// Heuristic: if the error message mentions chunk/module loading it's almost
// certainly a stale service-worker cache serving old JS bundle hashes.
function isChunkLoadError(err: Error | null): boolean {
  if (!err) return false;
  const msg = (err.message + (err.stack ?? '')).toLowerCase();
  return (
    msg.includes('loading chunk') ||
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('error loading module') ||
    msg.includes('unexpected token') ||
    msg.includes('syntaxerror') ||
    msg.includes('cannot find module') ||
    msg.includes('load failed')
  );
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, likelyStaleCacheIssue: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      likelyStaleCacheIssue: isChunkLoadError(error),
    };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Log to console so it appears in the Manus browser log and Safari devtools.
    console.error('[Relate] ErrorBoundary caught error:', error.message);
    console.error('[Relate] Component stack:', info.componentStack);
    console.error('[Relate] Full stack:', error.stack);
    console.info('[Relate] Stale cache heuristic:', isChunkLoadError(error));
  }

  handleClearCacheAndReload = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        console.info('[Relate] Service workers unregistered');
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        console.info('[Relate] Caches cleared:', keys);
      }
    } catch (e) {
      console.warn('[Relate] Cache clear failed:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { likelyStaleCacheIssue, error } = this.state;

      return (
        <div
          className="flex items-center justify-center min-h-screen p-8"
          style={{ backgroundColor: '#F8F7F4' }}
        >
          <div className="flex flex-col items-center w-full max-w-md">
            <AlertTriangle size={40} className="mb-5" style={{ color: '#d97706' }} />

            <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
              {likelyStaleCacheIssue
                ? 'App update required'
                : 'Something went wrong'}
            </h2>

            <p className="text-sm text-gray-500 text-center mb-6">
              {likelyStaleCacheIssue
                ? 'A new version of Relate is available. Clear the cache and reload to continue.'
                : 'An unexpected error occurred. Reloading usually fixes it.'}
            </p>

            {likelyStaleCacheIssue ? (
              <button
                onClick={this.handleClearCacheAndReload}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium",
                  "text-white cursor-pointer"
                )}
                style={{ backgroundColor: '#6FAF8F' }}
              >
                <RefreshCw size={15} />
                Clear cache &amp; reload
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium",
                  "text-white cursor-pointer"
                )}
                style={{ backgroundColor: '#6FAF8F' }}
              >
                <RotateCcw size={15} />
                Reload Page
              </button>
            )}

            {/* Collapsible technical detail for debugging */}
            <details className="mt-6 w-full">
              <summary className="text-xs text-gray-400 cursor-pointer select-none">
                Technical details
              </summary>
              <div className="mt-2 p-3 rounded-lg bg-gray-100 overflow-auto">
                <pre className="text-xs text-gray-500 whitespace-pre-wrap break-all">
                  {error?.message}
                  {'\n\n'}
                  {error?.stack}
                </pre>
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
