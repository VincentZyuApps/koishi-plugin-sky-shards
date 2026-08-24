import { Context, h, Session } from 'koishi'
import { BROWSER_PROXY_MODE, Config } from './config'
import { buildPageUrl, formatDate, GameServer, getServerZone, parseTargetDate } from './page'
import { resolveBrowserProxy } from './proxy'
import { buildKeyboard, sendQQMarkdown } from './qq'
import { renderShardScreenshot } from './render'
import { formatShardSummary } from './shard'

const commandDefinitions: Array<{ configKey: 'cnCommandName' | 'globalCommandName', aliasConfigKey: 'cnCommandAliases' | 'globalCommandAliases', server: GameServer, label: string }> = [
  { configKey: 'cnCommandName', aliasConfigKey: 'cnCommandAliases', server: 'netease_cn', label: '国服碎片' },
  { configKey: 'globalCommandName', aliasConfigKey: 'globalCommandAliases', server: 'tgc_global', label: '国际服碎片' },
]

export function registerShardCommands(ctx: Context, config: Config) {
  const logger = ctx.logger('sky-shards')
  for (const definition of commandDefinitions) {
    const commandName = config[definition.configKey]
    const aliases = normalizeAliases(config[definition.aliasConfigKey], commandName)
    const command = ctx.command(`${commandName} [date:string]`, `查询光遇${definition.label}，参数支持 yyyymmdd、+N、-N。`)
    if (aliases.length) command.alias(...aliases)
    command.action(async ({ session }, input) => {
      if (!session) return
      await handleCommand(ctx, session, config, { ...definition, name: commandName }, input, logger)
    })
  }
}

function normalizeAliases(aliases: string[], commandName: string) {
  const normalizedCommandName = commandName.trim()
  return [...new Set(aliases.map(alias => alias.trim()).filter(alias => alias && alias !== normalizedCommandName))]
}

async function handleCommand(ctx: Context, session: Session, config: Config, definition: { name: string, server: GameServer, label: string }, input: string | undefined, logger: ReturnType<Context['logger']>) {
  let waitingHintMessageId: string | undefined
  try {
    const quote = config.enableQuote && session.messageId ? h.quote(session.messageId) : ''
    if (config.enableWaitingHint) [waitingHintMessageId] = await session.send(`${quote}⏳ 正在获取并生成${definition.label}信息，请稍候...`)
    const date = parseTargetDate(input, definition.server)
    const pageUrl = buildPageUrl(config.url, date, definition.server, config.displayTimeZone, config.enableShardProgressTimeline)
    const proxy = resolveConfiguredProxy(ctx, config)
    logger.debug('render %s date=%s proxy=%s', definition.server, formatDate(date), proxy ? 'enabled' : 'disabled')
    const rendered = await renderShardScreenshot(ctx, pageUrl, proxy, config.screenshotDelayMs, definition.server === 'tgc_global' && config.enableGlobalShardOverrides)
    if (rendered.globalOverridesError) logger.warn('国际服临时覆写读取失败，将使用内置排期：%s', rendered.globalOverridesError)
    const summary = formatShardSummary({ date, server: definition.server, label: definition.label, pageUrl, now: rendered.renderedAt, globalOverrides: rendered.globalOverrides })
    await session.send([quote, h.image(rendered.image, 'image/jpeg'), `\n${summary}`])
    if (config.enableQQMarkdown && session.platform === 'qq') {
      const markdown = [`# ${definition.label}`, '', `> 日期：${formatDate(date)}`, `> 排期服务器时区：${getServerZone(definition.server)}`, '', `[在 Sky Shards 打开详情](${pageUrl})`].join('\n')
      const keyboard = buildKeyboard(config.qqMarkdownKeyboardJson, { commandName: definition.name, cnCommandName: config.cnCommandName, globalCommandName: config.globalCommandName, pageUrl })
      await sendQQMarkdown(session, markdown, keyboard).catch(error => logger.warn('QQ Markdown 发送失败，将保留截图回复：%s', error instanceof Error ? error.message : String(error)))
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.warn('碎片查询失败：%s', message)
    const quote = config.enableQuote && session.messageId ? h.quote(session.messageId) : ''
    await session.send(`${quote}查询${definition.label}失败：${message}`)
  } finally {
    if (waitingHintMessageId) await session.bot.deleteMessage(session.channelId, waitingHintMessageId).catch(() => undefined)
  }
}

function resolveConfiguredProxy(ctx: Context, config: Config) {
  switch (config.browserProxyMode) {
    case BROWSER_PROXY_MODE.INHERIT: return resolveBrowserProxy(ctx, '')
    case BROWSER_PROXY_MODE.CONFIGURED: return resolveBrowserProxy(ctx, config.browserProxyUrl, false)
    default: return undefined
  }
}
