import assert from 'node:assert/strict'
import test from 'node:test'
import { formatShardSummary, getShardStatus } from '../src/shard'

test('国服当前碎片显示地点，不显示倒计时', () => {
  const summary = formatShardSummary({
    date: { year: 2026, month: 8, day: 23 },
    server: 'netease_cn',
    label: '国服碎片',
    pageUrl: 'https://example.test/',
    now: new Date('2026-08-22T23:30:00.000Z'),
  })

  assert.match(summary, /🇨🇳 国服碎片：\t2026-08-23/)
  assert.match(summary, /🔮 是否有碎片：\t是/)
  assert.match(summary, /🗺️ 当前碎片地点：\t云野 · 圣岛群岛/)
  assert.doesNotMatch(summary, /下一次碎片时间/)
})

test('国服碎片尚未来临时显示倒计时，不显示地点', () => {
  const summary = formatShardSummary({
    date: { year: 2026, month: 8, day: 23 },
    server: 'netease_cn',
    label: '国服碎片',
    pageUrl: 'https://example.test/',
    now: new Date('2026-08-22T22:00:00.000Z'),
  })

  assert.match(summary, /⏳ 距离下次碎片：\t01 h 08 m 00 s/)
  assert.doesNotMatch(summary, /当前碎片地点/)
})

test('非当日查询仅显示是否有碎片', () => {
  const summary = formatShardSummary({
    date: { year: 2026, month: 8, day: 23 },
    server: 'netease_cn',
    label: '国服碎片',
    pageUrl: 'https://example.test/',
    now: new Date('2026-08-24T00:00:00.000Z'),
  })

  assert.equal(summary.split('\n').length, 4)
  assert.match(summary, /🔗 网页链接：\nhttps:\/\/example\.test\//)
  assert.doesNotMatch(summary, /当前碎片地点|距离下次碎片/)
})

test('国际服临时覆写可修改是否有碎片，国服不会读取覆写', () => {
  const date = { year: 2026, month: 8, day: 24 }
  const now = new Date('2026-08-24T09:00:00.000Z')
  const overrides = { dailiesMap: { '2026-08-24': { override: { hasShard: false } } } }

  assert.equal(getShardStatus(date, 'tgc_global', now, overrides).hasShard, false)
  assert.equal(getShardStatus({ year: 2026, month: 8, day: 23 }, 'netease_cn', now, overrides).hasShard, true)
})
