const pkg = require('../package.json')

const KOISHI_LOGO_BASE64 = 'data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABU0lEQVR42p2UQSsFYRSGnxnqLuytKWKpKFkQNsS%2FsOHPWPADLCmxU5S7UzYWNrJR7lYiRF2FeWzOMKZ7mXHqNNP5vvP2nu%2B850CY2lP4X1K31ZbaDm%2BpO%2Bpyp5wfAXVEPfRvO1JHf4AVQGbUh7j4EZ4VkrNCXPVRnf3CUBN1SH2KC28VGOV3ntRhNclZHdcAKYM11QR1oVBOXctzFlNgBTC8qmXxPQEegbVeYApIgJT6tg%2F0AdMp0B%2FBpCabK2AAmAAa%2F2GRBft1oBFPkqTAba7LCiAfQC9wClwAY1HJHepuiO29Yrsf1Dn1uiDU3RTYCtTkl1Leg8k9MB4NGgReI28rV3azgyCz0og01Xl1Uz1QX8uCTELm3UbkTF1VJ9Wr0tn3iBSGdjYG0XivE3VN3VD31PM4a3cc2tIGGI0VkTO7rLxGuiy25ejmjfqsvkSXui62TxaK03td4FXTAAAAAElFTkSuQmCC'

export const usage = `
<h1>Koishi 插件：Sky Shards 碎片查询</h1>
<h2>🎯 插件版本：v${pkg.version}</h2>

<p>
  <a href="https://www.npmjs.com/package/koishi-plugin-sky-shards" target="_blank">
    <img src="https://img.shields.io/npm/v/koishi-plugin-sky-shards?style=flat-square&logo=npm" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/koishi-plugin-sky-shards" target="_blank">
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

<p>🔮 查询《光·遇》国服与国际服碎片，并将 <a href="https://github.com/VincentZyu233/sky-shards" target="_blank">Sky Shards</a> <a href="https://github.com/VincentZyu233/sky-shards/blob/production/README.zh-cn.md" target="_blank"><img src="https://img.shields.io/badge/上游说明-181717?style=flat-square&logo=github&logoColor=white" alt="上游说明"></a> 页面首屏渲染为图片。</p>

<h2>💬 交流反馈</h2>
<p>🐛 Bug 反馈 / 💡 建议 / 👨‍💻 插件开发交流，欢迎加群：</p>
<p><del>💬 插件使用问题 / 🐛 Bug反馈 / 👨‍💻 插件开发交流，欢迎加入QQ群：<b>259248174</b> 🎉（这个群G了）</del></p>
<p>💬 插件使用问题 / 🐛 Bug反馈 / 👨‍💻 插件开发交流，欢迎加入QQ群：<b>1085190201</b> 🎉</p>
<p>💡 在群里直接艾特我，回复的更快哦~ ✨</p>

<h2>🚀 快速开始</h2>
<ul>
  <li>安装并启用提供 <code>puppeteer</code> 服务的插件，例如 <code>koishi-plugin-puppeteer</code> 或 <code>@shangxueink/koishi-plugin-puppeteer-without-canvas</code>。</li>
  <li><code>url</code> 默认指向 Cloudflare Pages；也可替换为 GitHub Pages，或填写本地 / 公网 <code>pnpm dev</code> 启动的 Vite HTTP 地址。</li>
  <li>大陆网络环境访问不稳定时，使用 <code>isolate</code> 分组配置 <code>proxyAgent</code> 并将 <code>browserProxyMode</code> 设为 <code>inherit</code>，或将其设为 <code>configured</code> 并填写 <code>browserProxyUrl</code>。</li>
</ul>

<h2>📌 指令</h2>
<pre>
<code>国服碎片</code>
<code>国际服碎片 +1</code>
<code>国服碎片 20260824</code>
</pre>

<p>🗓️ 参数留空时查询对应服务器时区的当天；仅支持 <code>yyyymmdd</code>、<code>+N</code> 与 <code>-N</code>。</p>

<h2>🕒 常用时区</h2>
<p>
  <a href="https://time.is/Shanghai" target="_blank">上海（Asia/Shanghai）</a> ・
  <a href="https://time.is/Los_Angeles" target="_blank">洛杉矶（America/Los_Angeles）</a> ・
  <a href="https://time.is/New_York" target="_blank">纽约（America/New_York）</a> ・
  <a href="https://time.is/London" target="_blank">伦敦（Europe/London）</a> ・
  <a href="https://time.is/Tokyo" target="_blank">东京（Asia/Tokyo）</a>
</p>

<h2>🤖 QQ 官方 Bot</h2>
<p>QQ 官方 Bot 会在截图后额外发送 Markdown 摘要，并附上国际服与国服的今日、明日、后日快捷按钮。</p>
`
