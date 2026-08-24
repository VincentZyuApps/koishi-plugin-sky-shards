export type GameServer = 'netease_cn' | 'tgc_global'

export interface TargetDate {
  year: number
  month: number
  day: number
}

const serverZones: Record<GameServer, string> = {
  netease_cn: 'Asia/Shanghai',
  tgc_global: 'America/Los_Angeles',
}

export function getServerZone(server: GameServer) {
  return serverZones[server]
}

export function parseTargetDate(input: string | undefined, server: GameServer, now = new Date()): TargetDate {
  const value = input?.trim() ?? ''
  const today = getDateInZone(now, getServerZone(server))
  if (!value) return today
  const offset = /^([+-])(\d+)$/.exec(value)
  if (offset) {
    const days = Number(offset[2]) * (offset[1] === '+' ? 1 : -1)
    if (!Number.isSafeInteger(days) || Math.abs(days) > 36500) throw new Error('日期偏移必须是不超过 36500 的整数天数。')
    return addDays(today, days)
  }
  const date = /^(\d{4})(\d{2})(\d{2})$/.exec(value)
  if (!date) throw new Error('日期参数仅支持 yyyymmdd、+N 或 -N。')
  const parsed = { year: Number(date[1]), month: Number(date[2]), day: Number(date[3]) }
  if (!isValidDate(parsed)) throw new Error('日期无效，请使用真实存在的 yyyymmdd 日期。')
  return parsed
}

export function addDays(date: TargetDate, days: number): TargetDate {
  const value = new Date(Date.UTC(date.year, date.month - 1, date.day + days))
  return { year: value.getUTCFullYear(), month: value.getUTCMonth() + 1, day: value.getUTCDate() }
}

export function formatDate(date: TargetDate) {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

export function buildPageUrl(baseUrl: string, date: TargetDate, server: GameServer, displayTimeZone: string, enableShardProgressTimeline = true) {
  let url: URL
  try {
    url = new URL(baseUrl)
  } catch {
    throw new Error('网页 URL 无效，请填写 Sky Shards 站点根地址。')
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('网页 URL 仅支持 http 或 https 协议。')
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: displayTimeZone })
  } catch {
    throw new Error('显示时区无效，请填写 IANA 时区，例如 Asia/Shanghai。')
  }
  const basePath = url.pathname.replace(/\/+$/, '')
  url.pathname = `${basePath}/zh/${formatDatePath(date)}`
  url.hash = ''
  url.searchParams.set('server', server)
  url.searchParams.set('timezone', displayTimeZone)
  url.searchParams.set('twelveHourMode', 'false')
  url.searchParams.set('fontSize', '1')
  url.searchParams.set('legTimeline', enableShardProgressTimeline ? '1' : '0')
  return url.toString()
}

function formatDatePath(date: TargetDate) {
  return `${date.year}/${String(date.month).padStart(2, '0')}/${String(date.day).padStart(2, '0')}`
}

function getDateInZone(now: Date, timeZone: string): TargetDate {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) }
}

function isValidDate(date: TargetDate) {
  if (!Number.isInteger(date.year) || !Number.isInteger(date.month) || !Number.isInteger(date.day)) return false
  const value = new Date(Date.UTC(date.year, date.month - 1, date.day))
  return value.getUTCFullYear() === date.year && value.getUTCMonth() === date.month - 1 && value.getUTCDate() === date.day
}
