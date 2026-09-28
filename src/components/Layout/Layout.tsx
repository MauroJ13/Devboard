import { Outlet } from "react-router";

import { Navbar } from "@/components/Navbar/Navbar";
import { useDevboard } from "@/hooks/useDevboard";

export function Layout() {
  const { sync } = useDevboard();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />

      {sync.status === "error" && (
        <div
          className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive"
          role="alert"
        >
          Supabase-Fehler: {sync.error} – Änderungen sind lokal gespeichert.
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {sync.status === "loading" ? (
          <p className="py-16 text-center text-sm text-muted-foreground" role="status">
            Daten werden geladen …
          </p>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
