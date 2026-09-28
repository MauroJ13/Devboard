/**
 * Erzeugt eine UUID (v4) – kompatibel mit dem Postgres-Typ `uuid` in Supabase.
 * crypto.randomUUID ist nur in sicheren Kontexten (https / localhost) verfügbar,
 * daher gibt es einen Fallback, z. B. für den Aufruf über eine LAN-IP.
 */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
