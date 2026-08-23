import { h, Session } from 'koishi'

const DEFAULT_KEYBOARD = {
  rows: [
    {
      buttons: [
        { render_data: { label: '今日国际服', style: 1 }, action: { type: 2, permission: { type: 2 }, data: '${globalCommandName}', enter: true } },
        { render_data: { label: '今日国服', style: 1 }, action: { type: 2, permission: { type: 2 }, data: '${cnCommandName}', enter: true } },
      ],
    },
    {
      buttons: [
        { render_data: { label: '明日国际服', style: 0 }, action: { type: 2, permission: { type: 2 }, data: '${globalCommandName} +1', enter: true } },
        { render_data: { label: '明日国服', style: 0 }, action: { type: 2, permission: { type: 2 }, data: '${cnCommandName} +1', enter: true } },
      ],
    },
    {
      buttons: [
        { render_data: { label: '后日国际服', style: 0 }, action: { type: 2, permission: { type: 2 }, data: '${globalCommandName} +2', enter: true } },
        { render_data: { label: '后日国服', style: 0 }, action: { type: 2, permission: { type: 2 }, data: '${cnCommandName} +2', enter: true } },
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
  const payload: any = {
    msg_type: 2,
    content: 'Sky Shards 碎片查询',
    markdown: { content: markdown },
    keyboard: { content: keyboard },
  }
  if (session.messageId && session.timestamp && Date.now() - session.timestamp < 300_000) {
    const state = session as any
    state.seq ||= 0
    payload.msg_id = session.messageId
    payload.msg_seq = ++state.seq
  }

  if (bot.config?.autoStreamText) {
    await session.send(h('qq:rawmarkdown', { content: markdown, keyboard }))
    return
  }
  const qq = (session as any).qq
  if (qq?.sendPrivateMessage && session.isDirect) return qq.sendPrivateMessage(session.channelId, payload)
  if (qq?.sendMessage) return qq.sendMessage(session.channelId, payload)
  await bot.internal.sendMessage(session.channelId, payload)
}

function replaceTemplateValues(value: unknown, variables: KeyboardVariables): any {
  if (Array.isArray(value)) return value.map(item => replaceTemplateValues(item, variables))
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceTemplateValues(item, variables)]))
  }
  if (typeof value !== 'string') return value
  return value.replace(/\$\{(commandName|cnCommandName|globalCommandName|pageUrl)\}/g, (_, key: keyof KeyboardVariables) => variables[key])
}
