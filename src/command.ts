import { Context, h, Session } from 'koishi'
import { buildShardCardMeta, resolveMapMusic } from './card'
import { BROWSER_PROXY_MODE, Config, LightMode } from './config'
import { sendOnebot163MusicCard, sendOnebotCard } from './onebot'
import { buildPageUrl, formatDate, GameServer, getServerZone, parseTargetDate, resolveLightMode } from './page'
import { resolveBrowserProxy } from './proxy'
import { buildKeyboard, sendQQMarkdown, sendQqTuwenCard } from './qq'
import { renderShardScreenshot } from './render'
import { formatShardSummary, getShardStatus } from './shard'

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
    command
      .option('lightMode', '--light-mode, --lightMode <lightMode:string> 临时覆写页面主题：true / false / system')
      .action(async ({ session, options }, input) => {
        if (!session) return
        await handleCommand(ctx, session, config, { ...definition, name: commandName }, input, options.lightMode, logger)
      })
  }
}

function normalizeAliases(aliases: string[], commandName: string) {
  const normalizedCommandName = commandName.trim()
  return [...new Set(aliases.map(alias => alias.trim()).filter(alias => alias && alias !== normalizedCommandName))]
}

async function handleCommand(ctx: Context, session: Session, config: Config, definition: { name: string, server: GameServer, label: string }, input: string | undefined, lightModeInput: string | undefined, logger: ReturnType<Context['logger']>) {
  let waitingHintMessageId: string | undefined
  try {
    if (config.verboseConsoleLog) {
      logger.info('🎯 [sky-shards] 收到碎片查询: 平台=%s channelId=%s userId=%s 服务器=%s 输入=%s',
        session.platform, session.channelId, session.userId, definition.server, input ?? '默认今日')
    }
    const quote = config.enableQuote && session.messageId ? h.quote(session.messageId) : ''
    if (config.enableWaitingHint) [waitingHintMessageId] = await session.send(`${quote}⏳ 正在获取并生成${definition.label}信息，请稍候...`)
    const date = parseTargetDate(input, definition.server)
    const lightMode = resolveLightMode(lightModeInput, config.lightMode)
    const pageUrl = buildPageUrl(config.url, date, definition.server, config.displayTimeZone, config.enableShardProgressTimeline, lightMode)
    const proxy = resolveConfiguredProxy(ctx, config)
    logger.debug('render %s date=%s proxy=%s', definition.server, formatDate(date), proxy ? 'enabled' : 'disabled')
    const renderStartTime = Date.now()
    const rendered = await renderShardScreenshot(
      ctx,
      pageUrl,
      proxy,
      config.screenshotDelayMs,
      definition.server === 'tgc_global' && config.enableGlobalShardOverrides,
      config.screenshotImageType,
      config.screenshotQuality,
    )
    const renderDurationMs = Date.now() - renderStartTime
    if (config.verboseConsoleLog) {
      logger.info('🌐 [sky-shards] Puppeteer 渲染完成: 耗时=%dms 格式=%s 图片大小=%d 字节',
        renderDurationMs, rendered.imageType, rendered.image?.byteLength ?? 0)
    }
    if (rendered.globalOverridesError) logger.warn('国际服临时覆写读取失败，将使用内置排期：%s', rendered.globalOverridesError)
    const status = getShardStatus(date, definition.server, rendered.renderedAt, rendered.globalOverrides)
    if (config.verboseConsoleLog) {
      logger.info('🔮 [sky-shards] 碎片计算状态: 日期=%s 是否有碎片=%s 降落地图=%s 倒计时=%s',
        formatDate(date), status.hasShard ? '是' : '否', status.mapName ?? '无', status.nextCountdown ?? (status.currentMap ? '降落中' : '无'))
    }
    const summary = formatShardSummary({ date, server: definition.server, label: definition.label, pageUrl, now: rendered.renderedAt, globalOverrides: rendered.globalOverrides })
    await session.send([quote, h.image(rendered.image, `image/${rendered.imageType}`), `\n${summary}`])

    const isQQPlatform = session.platform === 'qq' || session.bot?.platform === 'qq'
    const isOnebotPlatform = session.platform === 'onebot' || session.bot?.platform === 'onebot' || Boolean((session as any).onebot)

    if (config.verboseConsoleLog) {
      logger.info('🔍 [sky-shards] 平台分支判定: session.platform=%s bot.platform=%s isQQ=%s isOnebot=%s addQqTuwen=%s addOnebotCard=%s',
        session.platform, session.bot?.platform, isQQPlatform, isOnebotPlatform, config.addQqTuwen, config.addOnebotCard)
    }

    if (isQQPlatform && !isOnebotPlatform) {
      if (config.enableQQMarkdown) {
        const serverEmoji = definition.server === 'netease_cn' ? '🇨🇳' : '🌍'
        const markdown = [`# ${serverEmoji} ${definition.label}`, '', `> 📅 日期：${formatDate(date)}`, `> 🕒 排期服务器时区：${getServerZone(definition.server)}`, '', `🔗 [【点我在 Sky Shards 网页 打开详情】](${pageUrl})`].join('\n')
        const keyboard = buildKeyboard(config.qqMarkdownKeyboardJson, { commandName: definition.name, cnCommandName: config.cnCommandName, globalCommandName: config.globalCommandName, pageUrl })
        await sendQQMarkdown(session, markdown, keyboard).catch(error => logger.warn('QQ Markdown 发送失败，将保留截图回复：%s', error instanceof Error ? error.message : String(error)))
      }
      if (config.addQqTuwen) {
        const cardMeta = buildShardCardMeta({
          date,
          server: definition.server,
          label: definition.label,
          pageUrl,
          status,
          coverMode: config.qqTuwenCoverMode,
          cardCoverUrls: config.cardCoverUrls,
        })
        if (config.verboseConsoleLog) {
          logger.info(`🎴 [sky-shards] 组装 QQ 图文卡片元数据:
  ├─ 封面模式: ${config.qqTuwenCoverMode} (匹配星盘地图: ${status.mapId ?? '默认'})
  ├─ 🖼️ 大封面图片直链: ${cardMeta.picUrl}
  ├─ 📝 标题 (${cardMeta.title.length}/50): ${cardMeta.title}
  ├─ 📄 描述 (${cardMeta.description.length}/200): ${cardMeta.description.replace(/\n/g, ' ')}
  └─ 🔗 跳转外链: ${cardMeta.url}`)
        }
        await sendQqTuwenCard(session, cardMeta, logger, config.verboseConsoleLog).catch(error => logger.warn('QQ 图文卡片调用异常：%s', error instanceof Error ? error.message : String(error)))
      }
    } else if (isOnebotPlatform) {
      const musicEntry = resolveMapMusic(config.onebotMapMusicTable, status.mapId, status.hasShard, status.isRed)

      if (config.addOnebotCard) {
        const cardMeta = buildShardCardMeta({
          date,
          server: definition.server,
          label: definition.label,
          pageUrl,
          status,
          coverMode: config.onebotCardCoverMode,
          cardCoverUrls: config.cardCoverUrls,
        })
        if (config.verboseConsoleLog) {
          logger.info(`🎴 [sky-shards] 组装 OneBot 预报卡片元数据:
  ├─ 协议底座: ${config.onebotInfoCardProtocol}
  ├─ 封面模式: ${config.onebotCardCoverMode} (匹配星盘地图: ${status.mapId ?? '默认'})
  ├─ 碎片类型: ${status.isRed ? '🔴 红石' : '⚫ 黑石'}
  ├─ 🖼️ 大封面图片直链: ${cardMeta.picUrl}
  ├─ 📝 标题 (${cardMeta.title.length}/50): ${cardMeta.title}
  ├─ 📄 描述 (${cardMeta.description.length}/200): ${cardMeta.description.replace(/\n/g, ' ')}
  ├─ 🎵 映射歌曲: ${musicEntry.name} (ID: ${musicEntry.musicId})
  └─ 🔗 跳转外链: ${cardMeta.url}`)
        }
        await sendOnebotCard(session, cardMeta, {
          protocol: config.onebotInfoCardProtocol,
          musicId: musicEntry.musicId,
          logger,
          verbose: config.verboseConsoleLog,
        }).catch(error => logger.warn('OneBot 预报卡片调用异常：%s', error instanceof Error ? error.message : String(error)))
      } else if (config.verboseConsoleLog) {
        logger.info('ℹ️ [sky-shards] OneBot 预报卡片未开启 (addOnebotCard=false)')
      }

      if (config.addOnebot163MusicCard) {
        if (config.verboseConsoleLog) {
          logger.info(`🎵 [sky-shards] 准备发送 OneBot 网易云原声听歌卡片: 歌曲=${musicEntry.name} (ID: ${musicEntry.musicId})`)
        }
        await sendOnebot163MusicCard(session, musicEntry.musicId, musicEntry.name, logger, config.verboseConsoleLog)
          .catch(error => logger.warn('OneBot 网易云原声听歌卡片调用异常：%s', error instanceof Error ? error.message : String(error)))
      }
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
