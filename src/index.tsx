import { RGBA } from "@opentui/core"
import type { TuiPlugin, TuiPluginApi, TuiThemeCurrent } from "@opencode-ai/plugin/tui"
import { createEffect, createSignal, onCleanup, Show } from "solid-js"
import { formatElapsed } from "./format"
import { normalizeOptions, type NormalizedOptions, type Options } from "./options"

function resolveColor(
  theme: TuiThemeCurrent,
  override: string | undefined,
  fallback: RGBA,
): RGBA {
  if (!override) return fallback
  try {
    return RGBA.fromHex(override)
  } catch {
    return fallback
  }
}

type TimerProps = {
  api: TuiPluginApi
  sessionID: string
  options: NormalizedOptions
}

function StatusTimers(props: TimerProps) {
  const theme = () => props.api.theme.current
  const [now, setNow] = createSignal(Date.now())

  createEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), props.options.refreshMs)
    onCleanup(() => clearInterval(timer))
  })

  const sessionElapsed = () => {
    const session = props.api.state.session.get(props.sessionID)
    if (!session?.time?.created) return ""
    return formatElapsed(now() - session.time.created, props.options.format)
  }

  const busy = () => {
    const status = props.api.state.session.status(props.sessionID)
    return status?.type === "busy" || status?.type === "retry"
  }

  const lastAssistant = () => {
    const messages = props.api.state.session.messages(props.sessionID)
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i]
    }
    return undefined
  }

  const lastUser = () => {
    const messages = props.api.state.session.messages(props.sessionID)
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i]
    }
    return undefined
  }

  const generating = () => {
    const assistant = lastAssistant()
    if (!assistant) return false
    return busy() || !("completed" in assistant.time)
  }

  const responseElapsed = () => {
    const user = lastUser()
    if (!user?.time?.created) return ""
    const assistant = lastAssistant()
    if (generating()) return formatElapsed(now() - user.time.created, props.options.format)
    if (assistant) {
      const completed = "completed" in assistant.time ? assistant.time.completed : undefined
      if (completed !== undefined) {
        return formatElapsed(completed - user.time.created, props.options.format)
      }
    }
    return ""
  }

  const cumulativeWork = () => {
    const messages = props.api.state.session.messages(props.sessionID)
    let total = 0
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i]
      if (message.role !== "assistant") continue
      const completed = "completed" in message.time ? message.time.completed : undefined
      if (completed !== undefined) {
        total += Math.max(0, completed - message.time.created)
      } else if (i === messages.length - 1 && generating()) {
        total += Math.max(0, now() - message.time.created)
      }
    }
    return formatElapsed(total, props.options.format)
  }

  const { timers, icons, colors } = props.options

  return (
    <box flexDirection="row" gap={2}>
      <Show when={timers.session && sessionElapsed()}>
        <text fg={theme().textMuted}>
          <Show when={icons}>
            <span style={{ fg: resolveColor(theme(), colors.session, theme().success) }}>◷</span>
          </Show>
          {icons ? " " : ""}
          {sessionElapsed()}
        </text>
      </Show>
      <Show when={timers.work && cumulativeWork()}>
        <text fg={theme().textMuted}>
          <Show when={icons}>
            <span style={{ fg: resolveColor(theme(), colors.work, theme().info) }}>⚙</span>
          </Show>
          {icons ? " " : ""}
          {cumulativeWork()}
        </text>
      </Show>
      <Show when={timers.response && responseElapsed()}>
        <text fg={theme().textMuted}>
          <Show when={icons}>
            <span
              style={{
                fg: generating()
                  ? resolveColor(theme(), colors.response, theme().warning)
                  : resolveColor(theme(), colors.responseDone, theme().success),
              }}
            >
              {generating() ? "⚡" : "✓"}
            </span>
          </Show>
          {icons ? " " : ""}
          {responseElapsed()}
        </text>
      </Show>
    </box>
  )
}

function TimerSlot(props: { api: TuiPluginApi; options: NormalizedOptions; sessionID?: string }) {
  return (
    <Show when={props.sessionID}>
      {(sessionID) => (
        <StatusTimers api={props.api} sessionID={sessionID()} options={props.options} />
      )}
    </Show>
  )
}

const tui: TuiPlugin = async (api, options) => {
  const opts = normalizeOptions(options as Options | undefined)

  const currentSessionID = () => {
    const route = api.route.current
    if (route.name === "session") return route.params?.sessionID as string | undefined
    return undefined
  }

  const slot = (sessionID: string | undefined) => (
    <TimerSlot api={api} options={opts} sessionID={sessionID} />
  )

  switch (opts.slot) {
    case "home_prompt_right":
      api.slots.register({
        order: opts.order,
        slots: { home_prompt_right: () => slot(currentSessionID()) },
      })
      break
    case "sidebar_footer":
      api.slots.register({
        order: opts.order,
        slots: { sidebar_footer: (_ctx, props) => slot(props.session_id) },
      })
      break
    case "app_bottom":
      api.slots.register({
        order: opts.order,
        slots: { app_bottom: () => slot(currentSessionID()) },
      })
      break
    default:
      api.slots.register({
        order: opts.order,
        slots: { session_prompt_right: (_ctx, props) => slot(props.session_id) },
      })
  }
}

export default { id: "opencode-session-elapsed", tui }
