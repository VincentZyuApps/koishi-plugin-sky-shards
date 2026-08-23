import { Schema } from 'koishi'
import { defaultKeyboardJson } from './qq'

// ====================
// 📋 配置接口定义
// ====================

/** 🌐 截图浏览器代理使用模式 */
export const BROWSER_PROXY_MODE = {
  DISABLED: 'disabled',
  INHERIT: 'inherit',
  CONFIGURED: 'configured',
} as const

export type BrowserProxyMode = typeof BROWSER_PROXY_MODE[keyof typeof BROWSER_PROXY_MODE]

export interface Config {
  // ==================
  // 📌 指令配置字段
  // ==================
  cnCommandName: string
  cnCommandAliases: string[]
  globalCommandName: string
  globalCommandAliases: string[]

  // ==================
  // 🌐 数据页面配置字段
  // ==================
  url: string
  displayTimeZone: string

  // ==================
  // 🌐 浏览器网络配置字段
  // ==================
  browserProxyMode: BrowserProxyMode
  browserProxyUrl: string

  // ==================
  // 🤖 QQ 官方 Bot 配置字段
  // ==================
  enableQQMarkdown: boolean
  qqMarkdownKeyboardJson: string
}

// ====================
// ⚙️ 配置 Schema 定义
// ====================

export const Config: Schema<Config> = Schema.intersect([
  // ==================
  // 📌 指令配置分组
  // ==================
  Schema.object({
    cnCommandName: Schema.string()
      .default('国服碎片')
      .description('📌 查询国服碎片的指令名称，默认是 <code>国服碎片</code>。'),
    cnCommandAliases: Schema.array(Schema.string())
      .role('table')
      .default(['今日国服碎片', '国服今日碎片', '光遇国服碎片', 'sky-cn-shards'])
      .description('🏷️ 国服碎片指令别名表格，默认提供 4 个别名。留空项、重复项和与主指令同名的项会自动忽略。'),
    globalCommandName: Schema.string()
      .default('国际服碎片')
      .description('📌 查询国际服碎片的指令名称，默认是 <code>国际服碎片</code>。'),
    globalCommandAliases: Schema.array(Schema.string())
      .role('table')
      .default(['今日国际服碎片', '国际服今日碎片', '光遇国际服碎片', 'sky-global-shards'])
      .description('🏷️ 国际服碎片指令别名表格，默认提供 4 个别名。留空项、重复项和与主指令同名的项会自动忽略。'),
  }).description('📌 指令配置'),

  // ==================
  // 🌐 数据页面配置分组
  // ==================
  Schema.object({
    url: Schema.string()
      .default('https://sky-shards-vincentzyu233-fork.pages.dev/')
      .description('🌐 Sky Shards 站点根 URL，可填写 Cloudflare Pages、GitHub Pages 反代或本地 Vite 地址。'),
    displayTimeZone: Schema.string()
      .default('Asia/Shanghai')
      .description('🕒 截图中显示本地时间使用的 IANA 时区，例如 <code>Asia/Shanghai</code>。'),
  }).description('🌐 数据页面配置'),

  // ==================
  // 🌐 浏览器网络配置分组
  // ==================
  Schema.object({
    browserProxyMode: Schema.union([
      Schema.const(BROWSER_PROXY_MODE.DISABLED).description('【🚫 不使用代理】截图浏览器直接访问网络，不读取 isolate/http 或下方配置。'),
      Schema.const(BROWSER_PROXY_MODE.INHERIT).description('【🧩 继承 isolate 代理】读取当前 isolate/http 的 <code>proxyAgent</code>。'),
      Schema.const(BROWSER_PROXY_MODE.CONFIGURED).description('【🔐 使用配置项代理】仅使用下方 browserProxyUrl，不继承 isolate/http。'),
    ])
      .role('radio')
      .default(BROWSER_PROXY_MODE.DISABLED)
      .description('🌐 截图浏览器代理模式。默认不使用代理；三种模式互斥。'),
    browserProxyUrl: Schema.string()
      .default('http://127.0.0.1:7890')
      .description('🔐 浏览器代理 URL。仅在代理模式选择「使用配置项代理」时生效。'),
  }).description('🌐 浏览器网络配置'),

  // ==================
  // 🤖 QQ 官方 Bot 配置分组
  // ==================
  Schema.object({
    enableQQMarkdown: Schema.boolean()
      .default(true)
      .description('🤖 QQ 官方 Bot 平台在截图后额外发送 Markdown 摘要和快捷按钮。'),
    qqMarkdownKeyboardJson: Schema.string()
      .role('textarea', { rows: [8, 18] })
      .default(defaultKeyboardJson())
      .description('🔘 QQ Markdown 按钮 JSON，支持 <code>${commandName}</code>、<code>${cnCommandName}</code>、<code>${globalCommandName}</code> 与 <code>${pageUrl}</code> 变量。JSON 无效时回退默认按钮。'),
  }).description('🤖 QQ 官方 Bot 配置'),
])
