import { h, Session } from 'koishi'

const DEFAULT_KEYBOARD = {
  rows: [
    {
      buttons: [
        { render_data: { label: '🌍 今日国际服', style: 1 }, action: { type: 2, permission: { type: 2 }, data: '${globalCommandName}', enter: true } },
        { render_data: { label: '🇨🇳 今日国服', style: 1 }, action: { type: 2, permission: { type: 2 }, data: '${cnCommandName}', enter: true } },
      ],
    },
    {
      buttons: [
        { render_data: { label: '🌍 明日国际服', style: 0 }, action: { type: 2, permission: { type: 2 }, data: '${globalCommandName} +1', enter: true } },
        { render_data: { label: '🇨🇳 明日国服', style: 0 }, action: { type: 2, permission: { type: 2 }, data: '${cnCommandName} +1', enter: true } },
      ],
    },
    {
      buttons: [
        { render_data: { label: '🌍 后日国际服', style: 0 }, action: { type: 2, permission: { type: 2 }, data: '${globalCommandName} +2', enter: true } },
        { render_data: { label: '🇨🇳 后日国服', style: 0 }, action: { type: 2, permission: { type: 2 }, data: '${cnCommandName} +2', enter: true } },
      ],
    },
  ],
}

export function defaultKeyboardJson() {
  return JSON.stringify(DEFAULT_KEYBOARD, null, 2)
}

export interface KeyboardVariables {
  commandName: string
  cnCommandName: string
  globalCommandName: string
  pageUrl: string
}

export function buildKeyboard(template: string, variables: KeyboardVariables) {
  try {
    const parsed = JSON.parse(template || defaultKeyboardJson())
    return replaceTemplateValues(parsed, variables)
  } catch {
    return replaceTemplateValues(DEFAULT_KEYBOARD, variables)
  }
}

export async function sendQQMarkdown(session: Session, markdown: string, keyboard: object) {
  const bot = session.bot as any
  if (isCrackAdapter(bot)) {
    await session.send(h('qq:rawmarkdown', buildCrackRawMarkdownAttrs(markdown, keyboard)))
    return
  }

  const payload = buildOfficialMarkdownPayload(session, markdown, keyboard)
  const internal = bot.internal
  if (isDirectSession(session) && internal?.sendPrivateMessage) {
    await internal.sendPrivateMessage(session.channelId, payload)
    return
  }
  if (internal?.sendMessage) {
    await internal.sendMessage(session.channelId, payload)
    return
  }

  const qq = (session as any).qq
  if (qq?.sendPrivateMessage && isDirectSession(session)) {
    await qq.sendPrivateMessage(session.channelId, payload)
    return
  }
  if (qq?.sendMessage) {
    await qq.sendMessage(session.channelId, payload)
    return
  }
  throw new Error('当前 QQ 适配器不支持发送 Markdown 键盘消息。')
}

function isCrackAdapter(bot: any) {
  return !!bot?.config && 'autoStreamText' in bot.config
}

function isDirectSession(session: Session) {
  return session.isDirect || String(session.channelId || '').startsWith('private:')
}

function buildCrackRawMarkdownAttrs(markdown: string, keyboard: object) {
  const attrs: any = {
    markdown: { content: markdown },
  }
  if (hasKeyboardRows(keyboard)) {
    attrs.keyboard = { content: keyboard }
  }
  return attrs
}

function buildOfficialMarkdownPayload(session: Session, markdown: string, keyboard: object) {
  const payload: any = {
    msg_type: 2,
    markdown: { content: markdown },
  }
  if (hasKeyboardRows(keyboard)) payload.keyboard = { content: keyboard }
  if (session.messageId && session.timestamp && Date.now() - session.timestamp < 300_000) {
    const state = session as any
    state.seq ||= 0
    payload.msg_id = session.messageId
    payload.msg_seq = ++state.seq
  }
  return payload
}

function hasKeyboardRows(keyboard: object) {
  return Array.isArray((keyboard as any)?.rows) && (keyboard as any).rows.length > 0
}

function replaceTemplateValues(value: unknown, variables: KeyboardVariables): any {
  if (Array.isArray(value)) return value.map(item => replaceTemplateValues(item, variables))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceTemplateValues(item, variables)]))
  }
  if (typeof value !== 'string') return value
  return value.replace(/\$\{(commandName|cnCommandName|globalCommandName|pageUrl)\}/g, (_, key: keyof KeyboardVariables) => variables[key])
}
