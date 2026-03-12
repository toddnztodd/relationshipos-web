import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

// ── Bootstrap logging ────────────────────────────────────────────────────────
console.info('[Relate] Bootstrap start', {
  standalone: (window.navigator as any).standalone ?? false,
  displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
  userAgent: navigator.userAgent.slice(0, 80),
});

// ── tRPC / Query setup ───────────────────────────────────────────────────────
const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;
  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;
  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

// ── React mount ──────────────────────────────────────────────────────────────
console.info('[Relate] Mounting React app');

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);

console.info('[Relate] React render scheduled');

// ── Service Worker registration ───────────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.info('[SW] Registered, scope:', registration.scope);

      // Listen for SW_UPDATED messages from the new service worker.
      // When a new SW activates it posts this message; we hard-reload so
      // the browser fetches the latest index.html and bundle hashes.
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          console.info('[SW] New version detected:', event.data.version, '— reloading');
          // Small delay so the SW can finish claiming clients before reload.
          setTimeout(() => window.location.reload(), 200);
        }
      });

      // Also handle the case where a new SW is waiting (e.g. user had the
      // tab open when the deploy happened).
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.info('[SW] Update installed, triggering reload');
            window.location.reload();
          }
        });
      });

    }).catch((err) => {
      console.warn('[SW] Registration failed:', err);
    });
  });
}
