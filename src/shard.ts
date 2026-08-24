import { DateTime } from 'luxon'
import { formatDate, GameServer, getServerZone, TargetDate } from './page'

type MapId = keyof typeof mapNames

interface ShardOccurrence {
  land: DateTime
  end: DateTime
}

interface ShardSchedule {
  hasShard: boolean
  map: MapId
  occurrences: ShardOccurrence[]
}

export interface GlobalShardOverride {
  hasShard?: boolean
  isRed?: boolean
  group?: number
  realm?: number
  map?: MapId
}

export interface ShardStatus {
  hasShard: boolean
  isToday: boolean
  currentMap?: string
  nextCountdown?: string
}

export interface ShardSummaryOptions {
  date: TargetDate
  server: GameServer
  label: string
  pageUrl: string
  now?: Date
  globalOverrides?: unknown
}

const mapNames = {
  'prairie.butterfly': '云野 · 蝴蝶平原',
  'prairie.village': '云野 · 云中仙乡',
  'prairie.cave': '云野 · 幽光山洞',
  'prairie.bird': '云野 · 圣岛群岛',
  'prairie.island': '云野 · 圣岛群岛',
  'forest.brook': '雨林 · 荧光森林',
  'forest.boneyard': '雨林 · 密林遗迹',
  'forest.end': '雨林 · 秘密花园',
  'forest.tree': '雨林 · 大树屋',
  'forest.sunny': '雨林 · 静谧庭院',
  'valley.rink': '霞谷 · 滑冰场',
  'valley.dreams': '霞谷 · 圆梦村',
  'valley.hermit': '霞谷 · 隐士山谷',
  'wasteland.temple': '暮土 · 远古战场',
  'wasteland.battlefield': '暮土 · 远古战场',
  'wasteland.graveyard': '暮土 · 巨兽荒原',
  'wasteland.crab': '暮土 · 黑水港湾',
  'wasteland.ark': '暮土 · 遗忘方舟',
  'vault.starlight': '禁阁 · 星光沙漠',
  'vault.jelly': '禁阁 · 幽光山洞',
} as const

const globalConfigs = [
  { noShardWeekdays: [6, 7], offset: { hours: 1, minutes: 50 }, intervalHours: 8, maps: ['prairie.butterfly', 'forest.brook', 'valley.rink', 'wasteland.temple', 'vault.starlight'] },
  { noShardWeekdays: [7, 1], offset: { hours: 2, minutes: 10 }, intervalHours: 8, maps: ['prairie.village', 'forest.boneyard', 'valley.rink', 'wasteland.battlefield', 'vault.starlight'] },
  { noShardWeekdays: [1, 2], offset: { hours: 7, minutes: 40 }, intervalHours: 6, maps: ['prairie.cave', 'forest.end', 'valley.dreams', 'wasteland.graveyard', 'vault.jelly'] },
  { noShardWeekdays: [2, 3], offset: { hours: 2, minutes: 20 }, intervalHours: 6, maps: ['prairie.bird', 'forest.tree', 'valley.dreams', 'wasteland.crab', 'vault.jelly'] },
  { noShardWeekdays: [3, 4], offset: { hours: 3, minutes: 30 }, intervalHours: 6, maps: ['prairie.island', 'forest.sunny', 'valley.hermit', 'wasteland.ark', 'vault.jelly'] },
] as const satisfies ReadonlyArray<{
  noShardWeekdays: readonly number[]
  offset: { hours: number, minutes: number }
  intervalHours: number
  maps: readonly MapId[]
}>

const cnConfigs: Partial<Record<number, { maps: readonly MapId[], times: readonly [number, number, number, number][] }>> = {
  2: { maps: ['prairie.butterfly', 'forest.brook', 'valley.rink', 'wasteland.temple', 'vault.starlight'], times: [[9, 8, 10, 0], [14, 8, 15, 0], [19, 8, 20, 0]] },
  3: { maps: ['prairie.village', 'forest.boneyard', 'valley.rink', 'wasteland.battlefield', 'vault.starlight'], times: [[9, 8, 10, 0], [15, 8, 16, 0], [19, 8, 20, 0]] },
  5: { maps: ['prairie.bird', 'forest.tree', 'valley.dreams', 'wasteland.crab', 'vault.jelly'], times: [[11, 8, 12, 0], [17, 8, 18, 0], [23, 8, 24, 0]] },
  6: { maps: ['prairie.cave', 'forest.end', 'valley.dreams', 'wasteland.graveyard', 'vault.jelly'], times: [[10, 8, 11, 0], [14, 8, 15, 0], [22, 8, 23, 0]] },
  7: { maps: ['prairie.island', 'forest.sunny', 'valley.hermit', 'wasteland.ark', 'vault.jelly'], times: [[7, 8, 8, 0], [13, 8, 14, 0], [19, 8, 20, 0]] },
}

export function getGlobalShardOverride(config: unknown, date: TargetDate): GlobalShardOverride | undefined {
  const override = (config as any)?.dailiesMap?.[formatDate(date)]?.override
  if (!override || typeof override !== 'object') return
  const result: GlobalShardOverride = {}
  if (typeof override.hasShard === 'boolean') result.hasShard = override.hasShard
  if (typeof override.isRed === 'boolean') result.isRed = override.isRed
  if (Number.isInteger(override.group) && override.group >= 0 && override.group < globalConfigs.length) result.group = override.group
  if (Number.isInteger(override.realm) && override.realm >= 0 && override.realm < 5) result.realm = override.realm
  if (typeof override.map === 'string' && override.map in mapNames) result.map = override.map as MapId
  return Object.keys(result).length ? result : undefined
}

export function getShardStatus(date: TargetDate, server: GameServer, now = new Date(), remoteConfig?: unknown): ShardStatus {
  const current = DateTime.fromJSDate(now).setZone(getServerZone(server))
  const selected = toServerDate(date, server)
  const schedule = getSchedule(selected, server, server === 'tgc_global' ? getGlobalShardOverride(remoteConfig, date) : undefined)
  const isToday = current.hasSame(selected, 'day')
  if (!isToday) return { hasShard: schedule.hasShard, isToday }

  const active = schedule.occurrences.find(({ land, end }) => land <= current && current < end)
  if (active && schedule.hasShard) return { hasShard: true, isToday, currentMap: mapNames[schedule.map] }

  const upcoming = schedule.hasShard ? schedule.occurrences.find(({ land }) => land > current)?.land : undefined
  const next = upcoming ?? findNextLand(selected.plus({ days: 1 }), server, remoteConfig)
  return { hasShard: schedule.hasShard, isToday, nextCountdown: formatCountdown(next.diff(current, 'seconds').seconds) }
}

export function formatShardSummary(options: ShardSummaryOptions) {
  const { date, server, label, pageUrl, now, globalOverrides } = options
  const status = getShardStatus(date, server, now, globalOverrides)
  const serverEmoji = server === 'netease_cn' ? '🇨🇳' : '🌍'
  const lines = [`${serverEmoji} ${label}：\t${formatDate(date)}`, `🔗 网页链接：\t${pageUrl}`, `🔮 是否有碎片：\t${status.hasShard ? '是' : '否'}`]
  if (status.isToday) {
    if (status.currentMap) lines.push(`🗺️ 当前碎片地点：\t${status.currentMap}`)
    else if (status.nextCountdown) lines.push(`⏳ 下一次碎片时间：\t${status.nextCountdown}`)
  }
  return lines.join('\n')
}

function getSchedule(date: DateTime, server: GameServer, override?: GlobalShardOverride): ShardSchedule {
  return server === 'netease_cn' ? getCnSchedule(date) : getGlobalSchedule(date, override)
}

function getGlobalSchedule(date: DateTime, override?: GlobalShardOverride): ShardSchedule {
  const day = date.day
  const realmIndex = override?.realm ?? (day - 1) % 5
  const configIndex = override?.group ?? (day % 2 === 1 ? ((day - 1) / 2) % 3 + 2 : day / 2 % 2)
  const config = globalConfigs[configIndex]!
  const hasShard = override?.hasShard ?? !(config.noShardWeekdays as readonly number[]).includes(date.weekday)
  let firstStart = date.plus(config.offset)
  if (date.weekday === 7 && date.isInDST !== firstStart.isInDST) {
    firstStart = firstStart.plus({ hours: firstStart.isInDST ? -1 : 1 })
  }
  return {
    hasShard,
    map: override?.map ?? config.maps[realmIndex]!,
    occurrences: Array.from({ length: 3 }, (_, index) => {
      const start = firstStart.plus({ hours: config.intervalHours * index })
      return { land: start.plus({ minutes: 8, seconds: 40 }), end: start.plus({ hours: 4 }) }
    }),
  }
}

function getCnSchedule(date: DateTime): ShardSchedule {
  const noShardByWeekday = date.weekday === 1 || date.weekday === 4
  const noShardByHalfMonth = date.day <= 15 ? date.weekday === 3 || date.weekday === 5 : date.weekday === 2 || date.weekday === 6
  const config = cnConfigs[date.weekday] ?? cnConfigs[2]!
  const realmIndex = (date.day + 2) % 5
  return {
    hasShard: !noShardByWeekday && !noShardByHalfMonth,
    map: config.maps[realmIndex]!,
    occurrences: config.times.map(([landHour, landMinute, endHour, endMinute]) => ({
      land: date.plus({ hours: landHour, minutes: landMinute }),
      end: endHour === 24 ? date.plus({ days: 1 }) : date.plus({ hours: endHour, minutes: endMinute }),
    })),
  }
}

function findNextLand(date: DateTime, server: GameServer, remoteConfig?: unknown) {
  for (let offset = 0; offset < 14; offset++) {
    const candidate = date.plus({ days: offset })
    const target: TargetDate = { year: candidate.year, month: candidate.month, day: candidate.day }
    const override = server === 'tgc_global' ? getGlobalShardOverride(remoteConfig, target) : undefined
    const schedule = getSchedule(candidate, server, override)
    if (schedule.hasShard) return schedule.occurrences[0]!.land
  }
  throw new Error('未来 14 天内未找到碎片排期。')
}

function toServerDate(date: TargetDate, server: GameServer) {
  return DateTime.fromObject(date, { zone: getServerZone(server) }).startOf('day')
}

function formatCountdown(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor(total % 3600 / 60)
  const remainder = total % 60
  return `${String(hours).padStart(2, '0')} h ${String(minutes).padStart(2, '0')} m ${String(remainder).padStart(2, '0')} s`
}
