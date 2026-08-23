import { formatDatePath, GameServer, TargetDate } from './date'

export function buildPageUrl(baseUrl: string, date: TargetDate, server: GameServer, displayTimeZone: string) {
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
  url.searchParams.set('legTimeline', '0')
  return url.toString()
}
