import { Context } from 'koishi'

export interface BrowserProxy {
  server: string
  username?: string
  password?: string
}

export function resolveBrowserProxy(ctx: Context, configuredUrl: string, inherit = true) {
  const raw = configuredUrl.trim() || (inherit ? findInterceptedProxy(ctx) || getHttpConfigProxy(ctx) : undefined)
  if (!raw) return undefined

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new Error('浏览器代理地址无效。')
  }
  if (!['http:', 'https:', 'socks4:', 'socks5:'].includes(url.protocol) || !url.hostname) {
    throw new Error('浏览器代理仅支持 http、https、socks4 或 socks5 地址。')
  }

  return {
    server: `${url.protocol}//${url.host}`,
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
  } satisfies BrowserProxy
}

function findInterceptedProxy(ctx: Context) {
  let intercept: any = (ctx as any)[Context.intercept]
  while (intercept) {
    const proxy = intercept.http?.proxyAgent
    if (typeof proxy === 'string' && proxy.trim()) return proxy
    intercept = Object.getPrototypeOf(intercept)
  }
}

function getHttpConfigProxy(ctx: Context) {
  const proxy = (ctx as any).http?.config?.proxyAgent
  return typeof proxy === 'string' && proxy.trim() ? proxy : undefined
}
