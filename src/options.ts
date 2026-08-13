export type TimerKey = "session" | "work" | "response"

export type TimerConfig = Record<TimerKey, boolean>

export type DurationFormat = "compact" | "full"

export type SlotName =
  | "session_prompt_right"
  | "home_prompt_right"
  | "sidebar_footer"
  | "app_bottom"

/** Hex color overrides (e.g. `#22c55e`) for each timer's icon. Falls back to the active theme. */
export type MetricColors = {
  session: string
  work: string
  response: string
  responseDone: string
}

export type Options = {
  /** Toggle each timer independently. All default to `true`. */
  timers?: Partial<TimerConfig>
  /** `"compact"` (`1h 5m`) or `"full"` (`1:05:33`). Default: `"compact"`. */
  format?: DurationFormat
  /** Show the icon glyphs (`◷ ⚙ ⚡ ✓`) next to each timer. Default: `true`. */
  icons?: boolean
  /** Which TUI slot to render into. Default: `"session_prompt_right"`. */
  slot?: SlotName
  /** Slot ordering relative to other plugins. Default: `200`. */
  order?: number
  /** How often the timers update, in milliseconds. Minimum `250`. Default: `1000`. */
  refreshMs?: number
  /** Per-timer icon color overrides as hex strings. */
  colors?: Partial<MetricColors>
}

export type NormalizedOptions = {
  timers: TimerConfig
  format: DurationFormat
  icons: boolean
  slot: SlotName
  order: number
  refreshMs: number
  colors: Partial<MetricColors>
}

export const DEFAULT_OPTIONS: NormalizedOptions = {
  timers: { session: true, work: true, response: true },
  format: "compact",
  icons: true,
  slot: "session_prompt_right",
  order: 200,
  refreshMs: 1000,
  colors: {},
}

const MIN_REFRESH_MS = 250

export function normalizeOptions(input: Options | undefined): NormalizedOptions {
  const timers: TimerConfig = {
    session: input?.timers?.session ?? DEFAULT_OPTIONS.timers.session,
    work: input?.timers?.work ?? DEFAULT_OPTIONS.timers.work,
    response: input?.timers?.response ?? DEFAULT_OPTIONS.timers.response,
  }

  return {
    timers,
    format: input?.format ?? DEFAULT_OPTIONS.format,
    icons: input?.icons ?? DEFAULT_OPTIONS.icons,
    slot: input?.slot ?? DEFAULT_OPTIONS.slot,
    order: input?.order ?? DEFAULT_OPTIONS.order,
    refreshMs: Math.max(MIN_REFRESH_MS, input?.refreshMs ?? DEFAULT_OPTIONS.refreshMs),
    colors: {
      session: input?.colors?.session,
      work: input?.colors?.work,
      response: input?.colors?.response,
      responseDone: input?.colors?.responseDone,
    },
  }
}
