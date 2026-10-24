import { Loader2, RotateCcw } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { API_URL } from "@/lib/auth";
import { Wordmark } from "@/components/clavis/KeyLogo";

const MAX_WAIT_MS = 120_000;
const RETRY_DELAY_MS = 2_000;
const REQUEST_TIMEOUT_MS = 10_000;

type ServerState = "checking" | "ready" | "unavailable";

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }

    const finish = () => {
      window.clearTimeout(timeout);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timeout = window.setTimeout(finish, ms);
    signal.addEventListener("abort", finish, { once: true });
  });
}

/** Keeps the UI in a friendly loading state while the free backend wakes up. */
export function ServerStartupGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ServerState>("checking");
  const [attempt, setAttempt] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const lifecycle = new AbortController();

    async function checkServer() {
      setState("checking");
      setAttempt(1);
      const startedAt = Date.now();
      let currentAttempt = 1;

      while (Date.now() - startedAt < MAX_WAIT_MS) {
        if (lifecycle.signal.aborted) return;
        setAttempt(currentAttempt);

        const request = new AbortController();
        const timeout = window.setTimeout(() => request.abort(), REQUEST_TIMEOUT_MS);
        const stopRequest = () => request.abort();
        lifecycle.signal.addEventListener("abort", stopRequest, { once: true });

        try {
          const response = await fetch(`${API_URL}/health`, {
            cache: "no-store",
            signal: request.signal,
          });
          if (response.ok) {
            setState("ready");
            return;
          }
        } catch {
          // Render may refuse or time out requests while a free instance wakes up.
        } finally {
          window.clearTimeout(timeout);
          lifecycle.signal.removeEventListener("abort", stopRequest);
        }

        currentAttempt += 1;
        await wait(RETRY_DELAY_MS, lifecycle.signal);
      }

      if (!lifecycle.signal.aborted) setState("unavailable");
    }

    void checkServer();
    return () => lifecycle.abort();
  }, [retryKey]);

  if (state === "ready") return children;

  return (
    <div className="min-h-screen bg-muted">
      <main
        className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-dawn px-8 text-center shadow-soft"
        aria-live="polite"
        aria-busy={state === "checking"}
      >
        <Wordmark />

        {state === "checking" ? (
          <>
            <Loader2 className="mt-10 h-9 w-9 animate-spin text-primary" aria-hidden="true" />
            <h1 className="mt-6 text-3xl text-navy">
              {attempt < 3 ? "Preparando seu espaço" : "Acordando o servidor"}
            </h1>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {attempt < 3
                ? "Só um instante enquanto deixamos tudo pronto para você."
                : "Na primeira visita isso pode levar alguns segundos. Você não precisa atualizar a página."}
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-10 text-3xl text-navy">O servidor demorou mais que o esperado</h1>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Verifique sua conexão e tente novamente. Seus dados continuam seguros.
            </p>
            <button
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 font-semibold text-navy-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Tentar novamente
            </button>
          </>
        )}
      </main>
    </div>
  );
}
