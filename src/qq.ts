import { h, Session } from 'koishi'
import type { ShardCardMeta } from './card'

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
  const internal = bot?.internal

  if (internal) {
    const payload = buildOfficialMarkdownPayload(session, markdown, keyboard)
    if (isDirectSession(session) && internal.sendPrivateMessage) {
      const targetId = session.guildId || session.channelId || session.userId
      await internal.sendPrivateMessage(targetId, payload)
      return
    }
    if (internal.sendMessage) {
      await internal.sendMessage(session.channelId, payload)
      return
    }
  }

  const qq = (session as any).qq
  if (qq) {
    const payload = buildOfficialMarkdownPayload(session, markdown, keyboard)
    if (isDirectSession(session) && qq.sendPrivateMessage) {
      await qq.sendPrivateMessage(session.channelId, payload)
      return
    }
    if (qq.sendMessage) {
      await qq.sendMessage(session.channelId, payload)
      return
    }
  }

  // 兜底降级：在无 internal 场景下走元素发送
  await session.send(h('qq:rawmarkdown', buildRawMarkdownAttrs(markdown, keyboard)))
}

export async function sendQqTuwenCard(session: Session, meta: ShardCardMeta, logger?: any, verbose = false): Promise<boolean> {
  if (session.platform !== 'qq') return false

  const payload: any = {
    msg_type: 8,
    card: {
      type: 'tuwen',
      content: {
        title: meta.title,
        description: meta.description,
        url: meta.url,
        pic_url: meta.picUrl,
      },
    },
  }

  const isDirect = isDirectSession(session)
  const target = isDirect
    ? (session.guildId || session.channelId || session.userId || '').replace(/^private:/, '')
    : session.channelId

  // 5 分钟超时窗口内自动装配 msg_id / msg_seq
  if (session.messageId && session.timestamp && Date.now() - session.timestamp < 300_000) {
    const state = session as any
    state.seq ||= 0
    payload.msg_id = session.messageId
    payload.msg_seq = ++state.seq
  }

  if (verbose) {
    logger?.info('🚀 [QQ图文卡片] 准备发送: 目标=%s msg_id=%s msg_seq=%s 封面=%s\nPayload: %j',
      target, payload.msg_id ?? '无', payload.msg_seq ?? '无', meta.picUrl, payload)
  }

  const bot = session.bot as any
  const internal = bot?.internal

  try {
    let res: any
    if (internal) {
      if (isDirect && internal.sendPrivateMessage) {
        res = await internal.sendPrivateMessage(target, payload)
        if (verbose) logger?.info('✅ [QQ图文卡片] internal.sendPrivateMessage 发送成功: %j', res ?? 'ok')
        return true
      }
      if (internal.sendMessage) {
        res = await internal.sendMessage(target, payload)
        if (verbose) logger?.info('✅ [QQ图文卡片] internal.sendMessage 发送成功: %j', res ?? 'ok')
        return true
      }
    }

    const qq = (session as any).qq
    if (qq) {
      if (isDirect && qq.sendPrivateMessage) {
        res = await qq.sendPrivateMessage(session.channelId, payload)
        if (verbose) logger?.info('✅ [QQ图文卡片] qq.sendPrivateMessage 发送成功: %j', res ?? 'ok')
        return true
      }
      if (qq.sendMessage) {
        res = await qq.sendMessage(session.channelId, payload)
        if (verbose) logger?.info('✅ [QQ图文卡片] qq.sendMessage 发送成功: %j', res ?? 'ok')
        return true
      }
    }

    // 兜底降级：走 session.send(h('qq:card', payload.card))
    res = await session.send(h('qq:card', payload.card))
    if (verbose) logger?.info('✅ [QQ图文卡片] session.send(qq:card) 降级发送完成: %j', res ?? 'ok')
    return true
  } catch (error) {
    logger?.warn?.('QQ 图文卡片 (msg_type: 8) 发送失败：%s', error instanceof Error ? error.message : String(error))
    return false
  }
}

function isDirectSession(session: Session) {
  return session.isDirect || String(session.channelId || '').startsWith('private:')
}

function buildRawMarkdownAttrs(markdown: string, keyboard: object) {
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
