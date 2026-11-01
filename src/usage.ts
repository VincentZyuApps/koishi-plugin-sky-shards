const pkg = require('../package.json')

const detailsStyle = 'margin:10px 0;border:1px solid var(--k-color-border, #909399);border-radius:8px;background:var(--k-card-bg, transparent);color:var(--k-text-dark, inherit);overflow:hidden;box-shadow:var(--k-card-shadow, 0 1px 3px rgb(0 0 0 / 12%));transition:var(--color-transition, border-color .2s ease, background-color .2s ease)'
const summaryStyle = 'padding:9px 12px;background:var(--k-hover-bg, rgba(127, 127, 127, .12));color:var(--k-text-dark, inherit);cursor:pointer;user-select:none'
const detailsBodyStyle = 'padding:6px 14px 12px;border-top:1px solid var(--k-color-divider, rgba(127, 127, 127, .28));background:var(--k-card-bg, transparent);color:var(--k-text-dark, inherit)'

const KOISHI_LOGO_BASE64 = 'data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABU0lEQVR42p2UQSsFYRSGnxnqLuytKWKpKFkQNsS%2FsOHPWPADLCmxU5S7UzYWNrJR7lYiRF2FeWzOMKZ7mXHqNNP5vvP2nu%2B850CY2lP4X1K31ZbaDm%2BpO%2Bpyp5wfAXVEPfRvO1JHf4AVQGbUh7j4EZ4VkrNCXPVRnf3CUBN1SH2KC28VGOV3ntRhNclZHdcAKYM11QR1oVBOXctzFlNgBTC8qmXxPQEegbVeYApIgJT6tg%2F0AdMp0B%2FBpCabK2AAmAAa%2F2GRBft1oBFPkqTAba7LCiAfQC9wClwAY1HJHepuiO29Yrsf1Dn1uiDU3RTYCtTkl1Leg8k9MB4NGgReI28rV3azgyCz0og01Xl1Uz1QX8uCTELm3UbkTF1VJ9Wr0tn3iBSGdjYG0XivE3VN3VD31PM4a3cc2tIGGI0VkTO7rLxGuiy25ejmjfqsvkSXui62TxaK03td4FXTAAAAAElFTkSuQmCC'

export const usage = `
<h1>Koishi 插件：Sky Shards 碎片查询</h1>
<h2>🎯 插件版本：v${pkg.version}</h2>

<p>
  <a href="https://www.npmjs.com/package/koishi-plugin-sky-shards" target="_blank">
    <img src="https://img.shields.io/npm/v/koishi-plugin-sky-shards?style=flat-square&logo=npm" alt="npm version">
  </a>
  <a href="https://npm-stat.com/charts.html?package=koishi-plugin-sky-shards" target="_blank">
    <img src="https://img.shields.io/npm/dm/koishi-plugin-sky-shards?style=flat-square&logo=npm" alt="npm downloads">
  </a>
  <br>
  <a href="https://github.com/VincentZyuApps/koishi-plugin-sky-shards" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="Koishi plugin GitHub">
  </a>
  <a href="https://gitee.com/vincent-zyu/koishi-plugin-sky-shards" target="_blank">
    <img src="https://img.shields.io/badge/Gitee-C71D23?style=for-the-badge&logo=gitee&logoColor=white" alt="Koishi plugin Gitee">
  </a>
  <br>
  <a href="https://forum.koishi.xyz/t/topic/xxxxx" target="_blank">
    <img src="https://img.shields.io/badge/Koishi%20Forum-xxxxx-5546A3?style=for-the-badge&logo=${KOISHI_LOGO_BASE64}&logoColor=white" alt="Koishi Forum">
  </a>
  <a href="https://qm.qq.com/q/ZHj33L5cuC" target="_blank">
    <img src="https://img.shields.io/badge/QQ群-1085190201-12B7F5?style=flat-square&logo=qq&logoColor=white" alt="QQ群">
  </a>
</p>

<blockquote style="margin: 14px 0; padding: 12px 16px; border-left: 6px solid #6366f1; border-radius: 8px; background: rgba(99, 102, 241, 0.12); color: inherit; line-height: 1.6; box-shadow: 0 1px 4px rgba(0,0,0,0.06);">
  <b style="color: #6366f1; font-size: 15px;">🔮 光·遇双服碎石红石坠落实时预测</b><br>
  精准计算国服与国际服伊甸碎石降落时刻、奖励升华蜡烛数量与清理点位，并将前端首屏渲染为精美图片。
</blockquote>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #6366f1;">🚀 快速开始与 Puppeteer 服务配置</b></summary>
<div style="${detailsBodyStyle}">
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(99, 102, 241, 0.08); border-left: 4px solid #6366f1;">
    <ul style="margin: 4px 0; padding-left: 18px; line-height: 1.7;">
      <li>需安装并启用提供 <code>puppeteer</code> 服务的插件（如 <code>koishi-plugin-puppeteer</code>）。</li>
      <li><code>url</code> 默认指向高速稳定的 Cloudflare Pages 静态节点，也可指定为自行部署的 Vite 前端地址。</li>
      <li>在国内网络环境访问外网资源时，可在 <code>isolate</code> 分组中配置 <code>proxyAgent</code> 或开启独立浏览器代理 <code>browserProxyUrl</code>。</li>
    </ul>
  </div>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #10b981;">📌 核心指令与灵活日期参数</b></summary>
<div style="${detailsBodyStyle}">
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981;">
    <pre style="margin: 0; background: transparent; padding: 0;"><code>国服碎片                     # 查询国服今日碎石降落
国际服碎片 +1                # 查询国际服明日碎石预测
国服碎片 20260824            # 指定具体年月日查询历史或未来碎石
国服碎片 +1 --light-mode true # 强制以明亮日间模式渲染卡片
国际服碎片 --lightMode false  # 强制以暗夜深色模式渲染卡片</code></pre>
    <p style="margin: 8px 0 0; font-size: 13px; color: var(--k-text-light, #666);">
      💡 参数留空时默认查询当前时区今天；支持 <code>yyyymmdd</code>、<code>+N</code>（未来第 N 天）与 <code>-N</code>（历史天数）。
    </p>
  </div>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #0ea5e9;">🕒 多服时区换算与参考</b></summary>
<div style="${detailsBodyStyle}">
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(14, 165, 233, 0.08); border-left: 4px solid #0ea5e9;">
    <p style="margin: 4px 0;">碎石周期按官方服务器基准时钟运转，插件内部已自动处理夏令时/冬令时平滑转换：</p>
    <ul style="margin: 4px 0; padding-left: 18px; line-height: 1.7;">
      <li>🌏 <b>国服基准：</b>北京时间 <a href="https://time.is/Shanghai" target="_blank">Asia/Shanghai</a> (GMT+8)</li>
      <li>🌎 <b>国际服基准：</b>太平洋时间 <a href="https://time.is/Los_Angeles" target="_blank">America/Los_Angeles</a> (PT)</li>
    </ul>
  </div>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #f59e0b;">🤖 QQ 官方 Bot 2×3 日期服区切换矩阵按钮</b></summary>
<div style="${detailsBodyStyle}">
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b;">
    <p><b>✨ 专属交互优化：</b></p>
    <ul style="margin: 4px 0; padding-left: 18px; line-height: 1.7;">
      <li>在 QQ 官方群聊中，除下发首屏图片外，会自动附赠 Markdown 时间轴速报看板。</li>
      <li>底部内嵌 <b>2×3 跨服快捷交互矩阵</b>：包含 [今日/明日/后日] × [国际服/国服] 共 6 个一键切换按钮，免输入快速查阅。</li>
    </ul>
  </div>
</div>
</details>

<details style="${detailsStyle}">
<summary style="${summaryStyle}"><b style="color: #ec4899;">💬 交流反馈与支持渠道</b></summary>
<div style="${detailsBodyStyle}">
  <div style="margin: 8px 0; padding: 10px 14px; border-radius: 6px; background: rgba(236, 72, 153, 0.08); border-left: 4px solid #ec4899;">
    <p style="margin: 4px 0;">💬 欢迎加入插件使用交流 QQ 群：<b style="color: #12B7F5;">1085190201</b> 🎉</p>
    <p style="margin: 4px 0;">💡 在群里直接艾特作者 <b>vincentzyu</b>，交流答疑更高效！✨</p>
  </div>
</div>
</details>
`
