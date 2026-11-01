import {
  CardCoverUrls,
  COVER_MODE,
  CoverMode,
  DEFAULT_CARD_COVER_URLS,
  DEFAULT_MAP_MUSIC_TABLE,
  OnebotMapMusicEntry,
} from './config'
import { formatDate, GameServer, TargetDate } from './page'
import { ShardStatus } from './shard'

/** 🗺️ 向后兼容别名：默认各大星盘地图特色封面 CDN 资源 */
export const SHARD_MAP_COVERS = DEFAULT_CARD_COVER_URLS

/** 🎨 根据模式、配置与地图匹配封面图 URL */
export function resolveCoverUrl(
  mode: CoverMode,
  cardCoverUrls: CardCoverUrls = DEFAULT_CARD_COVER_URLS,
  mapId?: string,
  hasShard = true,
): string {
  if (mode === COVER_MODE.FIXED || !hasShard || !mapId) {
    return cardCoverUrls.default
  }
  const realmKey = mapId.split('.')[0] as keyof CardCoverUrls
  return cardCoverUrls[realmKey] || cardCoverUrls.default
}

/** 🎵 根据碎片排期地图及红黑石类型查表匹配对应的网易云音乐信息 */
export function resolveMapMusic(
  table: OnebotMapMusicEntry[] = DEFAULT_MAP_MUSIC_TABLE,
  mapId?: string,
  hasShard = true,
  isRed = true,
): OnebotMapMusicEntry {
  const shardType = isRed ? 'red' : 'black'
  const fallbackDefault =
    table.find(item => item.map === 'default' && item.shardType === shardType) ||
    table.find(item => item.map === 'default') ||
    DEFAULT_MAP_MUSIC_TABLE[DEFAULT_MAP_MUSIC_TABLE.length - 1]

  if (!hasShard || !mapId) {
    return fallbackDefault
  }
  const realmKey = mapId.split('.')[0]
  const matched = table.find(item => item.map === realmKey && item.shardType === shardType)
  return matched || fallbackDefault
}

export interface ShardCardMeta {
  title: string
  description: string
  url: string
  picUrl: string
}

export interface BuildShardCardMetaOptions {
  date: TargetDate
  server: GameServer
  label: string
  pageUrl: string
  status: ShardStatus
  coverMode: CoverMode
  cardCoverUrls?: CardCoverUrls
}

/** 🧩 提取并组装适用于 QQ 图文与 OneBot 交互卡片的通用元数据 */
export function buildShardCardMeta(options: BuildShardCardMetaOptions): ShardCardMeta {
  const { date, server, label, pageUrl, status, coverMode, cardCoverUrls } = options
  const serverEmoji = server === 'netease_cn' ? '🇨🇳' : '🌍'
  const dateStr = formatDate(date)

  // 1. 标题 (<= 50 字符)
  const title = `🔮 光遇${label}预报 (${dateStr.slice(5)})`.slice(0, 50)

  // 2. 描述 (<= 200 字符)
  const shardLabel = status.hasShard ? (status.isRed ? '是 (🔴强力红石)' : '是 (⚫普通黑石)') : '否'
  const descParts: string[] = [
    `📅 日期：${dateStr} (${serverEmoji})`,
    `🔮 是否有碎片：${shardLabel}`,
  ]
  if (status.hasShard && status.mapName) {
    descParts.push(`🗺️ 降落区域：${status.mapName}`)
  }
  if (status.isToday) {
    if (status.currentMap) descParts.push(`⚡ 正在坠落中！`)
    else if (status.nextCountdown) descParts.push(`⏳ 距离下次降落：${status.nextCountdown}`)
  } else if (!status.hasShard) {
    descParts.push(`✨ 当日无伊甸碎石降落，天空王国平静无波~`)
  }
  descParts.push(`🔗 点击打开 Sky Shards 在线排期看板`)
  const description = descParts.join('\n').slice(0, 200)

  // 3. 封面图
  const picUrl = resolveCoverUrl(coverMode, cardCoverUrls, status.mapId, status.hasShard)

  return {
    title,
    description,
    url: pageUrl,
    picUrl,
  }
}
