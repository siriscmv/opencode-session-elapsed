export type DurationFormat = "compact" | "full"

/**
 * Format an elapsed duration in milliseconds as a human-readable string.
 *
 * `compact` matches everyday reading: `45s`, `1m 30s`, `1h 5m`.
 * `full` zero-pads for a stable, clock-like width: `0:45`, `1:30`, `1:05:33`.
 */
export function formatElapsed(ms: number, format: DurationFormat = "compact"): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  if (format === "full") {
    const mm = String(m).padStart(h > 0 ? 2 : 1, "0")
    const ss = String(s).padStart(2, "0")
    if (h > 0) return `${h}:${mm}:${ss}`
    return `${m}:${ss}`
  }

  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`
  return `${s}s`
}
