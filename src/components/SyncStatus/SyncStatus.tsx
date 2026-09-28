import { Cloud, CloudOff, HardDrive, RefreshCw } from "lucide-react";

import { useDevboard } from "@/hooks/useDevboard";
import { cn } from "@/lib/utils";

/** Kleiner Indikator in der Navbar: Wo werden die Daten gespeichert? */
export function SyncStatus() {
  const { sync } = useDevboard();

  if (sync.mode === "local") {
    return (
      <span
        className="flex items-center gap-1 text-xs text-white/50"
        title="Supabase ist nicht konfiguriert – Daten werden nur in diesem Browser gespeichert."
      >
        <HardDrive className="size-3.5" aria-hidden />
        <span className="hidden md:inline">Lokal</span>
      </span>
    );
  }

  const config = {
    idle: { icon: Cloud, label: "Synchronisiert", title: "Alle Änderungen sind in Supabase gespeichert." },
    loading: { icon: RefreshCw, label: "Lädt …", title: "Daten werden aus Supabase geladen." },
    saving: { icon: RefreshCw, label: "Speichert …", title: "Änderungen werden gespeichert." },
    error: { icon: CloudOff, label: "Sync-Fehler", title: sync.error ?? "Unbekannter Fehler" },
  }[sync.status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs",
        sync.status === "error" ? "text-red-400" : "text-white/60",
      )}
      title={config.title}
      role="status"
      data-testid="sync-status"
      data-status={sync.status}
    >
      <Icon className="size-3.5" aria-hidden />
      <span className="hidden md:inline">{config.label}</span>
    </span>
  );
}
