"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UnpublishButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unpublish = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not unpublish.");
      setBusy(false);
    }
  };

  const button =
    "px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-60";

  return (
    <div className="flex flex-col items-end gap-1.5">
      {confirming ? (
        <div className="flex flex-wrap items-center justify-end gap-2" role="group" aria-label={`Confirm unpublishing ${id}`}>
          <span className="text-xs text-[var(--muted-foreground)]">Remove from the registry?</span>
          <button
            type="button"
            onClick={unpublish}
            disabled={busy}
            className={`${button} bg-red-500/10 border-red-400/30 text-red-400 hover:bg-red-500/20`}
          >
            {busy ? "Unpublishing..." : "Yes, unpublish"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={busy}
            className={`${button} bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]`}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={`${button} bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]`}
        >
          Unpublish
        </button>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
