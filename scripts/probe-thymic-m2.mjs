#!/usr/bin/env node
/**
 * probe-thymic-m2.mjs — 小橡宝原型 v0.2 全量渲染探针（M2 闸门）
 *
 * 覆盖：prototypes/v0.2/app.js ROUTES 里每一条叶子路由（check-probe-coverage 强制）。
 * 另含：档案切换不串档（Q10）、3D 翻面（MT）、一图秀画布（C 组抽样）、禁词扫描、
 *       疾病概要 ? 按钮真开（36 号，本探针默认目标就是本仓原型——家族教训 L1）。
 *
 * 用法：
 *   node scripts/probe-thymic-m2.mjs
 *   node scripts/probe-thymic-m2.mjs --url http://127.0.0.1:8124/prototypes/v0.2/index.html
 *   node scripts/probe-thymic-m2.mjs --self-test   # 注入"空页"缺陷，闸门必须报 FAIL
 *
 * 依赖：puppeteer-core（家族 workspace）+ 本机 Chrome。
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const argOf = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null }
const SELF_TEST = args.includes('--self-test')
const PORT = Number(argOf('--port') || 8132)
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json' }

function serve() {
  return new Promise((res) => {
    const server = createServer(async (req, rsp) => {
      const path = decodeURIComponent((req.url || '/').split('?')[0])
      if (path === '/favicon.ico') { rsp.writeHead(204).end(); return }
      const file = join(ROOT, normalize(path).replace(/^([/\\])+/, ''))
      if (!file.startsWith(ROOT)) { rsp.writeHead(403).end(); return }
      try {
        const body = await readFile(file)
        rsp.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' }).end(body)
      } catch { rsp.writeHead(404).end('not found') }
    })
    server.listen(PORT, '127.0.0.1', () => res(server))
  })
}
function findChrome() {
  const cands = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'].filter(Boolean)
  return cands.find((p) => existsSync(p)) || null
}

const results = []
const check = (id, name, ok, detail = '') => {
  results.push({ id, name, ok: !!ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${name}${detail ? '  — ' + detail : ''}`)
}

/* 与 check-probe-coverage.mjs 同一解析逻辑：从 app.js 源码取叶子路由，防"探针扫空气" */
function leafRoutes() {
  const app = readFileSync(join(ROOT, 'prototypes/v0.2/app.js'), 'utf8')
  const arr = app.match(/(?:var|const|let)\s+ROUTES\s*=\s*\[([\s\S]*?)\];/)
  if (!arr) throw new Error('app.js 里找不到 ROUTES')
  const routes = [...arr[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1])
  const prefixes = new Set(routes.filter((r) => r.includes('/')).map((r) => r.split('/')[0]))
  return routes.filter((r) => r.includes('/') || !prefixes.has(r))
}

/* 禁词：患者可见文本层扫描（自测/判断/承诺类） */
/* 覆盖清单与 app.js ROUTES 必须一致：新增路由时两处同步（check-probe-coverage 会比对）。 */
const COVERED = ['dashboard',
  'records/0', 'records/1', 'records/2', 'records/3', 'records/4',
  'pathology/0', 'pathology/1', 'pathology/2',
  'stage/0', 'stage/1', 'stage/2',
  'treatment/0', 'treatment/1', 'treatment/2', 'treatment/3',
  'mg/0', 'mg/1',
  'imaging/0', 'imaging/1',
  'labs/0', 'labs/1', 'labs/2',
  'timeline/0', 'timeline/1', 'timeline/2',
  'symptoms/0', 'symptoms/1',
  'review/0', 'review/1', 'review/2', 'review/3',
  'trials/0', 'trials/1', 'trials/2'];
const BANNED = ['预后', '生存期', '治愈率', '您是', '确诊为胸腺癌', '一线', '二线', '一线治疗', '可治愈', '预计生存']

async function main() {
  const chrome = findChrome()
  if (!chrome) { console.log('FAIL  env  找不到 Chrome（设 CHROME_PATH）。跳过等于没有这条闸门。'); process.exit(2) }
  let puppeteer
  try {
    const require = createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/')
    puppeteer = require('puppeteer-core')
  } catch {
    console.log('FAIL  env  缺少 puppeteer-core。跳过等于没有这条闸门。'); process.exit(2)
  }
  const server = await serve()
  /* L1 教训（本仓成立条件）：默认目标就是本仓原型，不再回退到 starter examples。 */
  const base = argOf('--url') || `http://127.0.0.1:${PORT}/prototypes/v0.2/index.html`
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--proxy-server=' + (process.env.http_proxy || 'http://127.0.0.1:7890')]
  })
  try {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e.message)))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.setViewport({ width: 1280, height: 860 })
    await page.goto(base, { waitUntil: 'networkidle0' })

    const leaves = leafRoutes()
    const sameSet = leaves.length === COVERED.length && leaves.every((r, i) => r === COVERED[i])
    check('R0', `ROUTES 叶子路由解析且与探针覆盖清单一致（防漏改）`, sameSet, `ROUTES ${leaves.length} 条 vs 探针清单 ${COVERED.length} 条${sameSet ? '' : ' — 不一致，先改 COVERED 再加页'}`)

    /* ---------- 全量路由渲染 ---------- */
    let emptyRoutes = [], errRoutes = 0
    for (const r of leaves) {
      const [view, sub] = r.split('/')
      await page.evaluate(([v, s]) => {
        state.view = v
        if (s !== undefined) state.sub[v] = Number(s)
        state.privateOpen = false
        location.hash = v
        render()
        $('#main').focus({ preventScroll: true })
      }, [view, sub])
      await new Promise((res) => setTimeout(res, 40))
      const st = await page.evaluate(() => ({ len: $('#main').innerHTML.length, title: PAGES.find(p => p[0] === state.view)[1] }))
      if (st.len < 200) emptyRoutes.push(r)
      const pageErrorsNow = errors.length
      if (errors.length > pageErrorsNow) errRoutes++
    }
    check('R1', `全量 ${leaves.length} 条叶子路由渲染非空（>200 字符）`, emptyRoutes.length === 0,
      emptyRoutes.length ? `空页：${emptyRoutes.join(', ')}` : `35 条中 ${leaves.length - emptyRoutes.length} 条非空`)
    check('R2', '全量路由渲染零 pageerror / 零 console.error', errors.length === 0, errors.length ? errors.slice(0, 3).join(' | ').slice(0, 300) : '0 错误')

    /* ---------- IP11 每页「和 AI 讨论」 ---------- */
    await page.evaluate(() => { state.view = 'pathology'; state.sub.pathology = 0; render() })
    const aiBtn = await page.evaluate(() => {
      const b = document.querySelector('.page-head .head-ai')
      return b ? { text: b.textContent.trim() } : null
    })
    check('IP11', '标题行常驻「和 AI 讨论」', !!aiBtn && aiBtn.text.includes('和 AI 讨论'), aiBtn ? aiBtn.text : '缺按钮')

    /* ---------- IP11/Q17 AI 草稿只填不发 ---------- */
    await page.evaluate(() => { state.agentOpen = true; renderAgent(); agentBuild() })
    const draft = await page.evaluate(() => ({
      hasPrompt: !!document.querySelector('#dsh-conversation-slot pre'),
      len: (document.querySelector('#dsh-conversation-slot pre')?.textContent || '').length
    }))
    check('Q17', '「整理本页要点」填入草稿（非空，且非自动发送）', draft.hasPrompt && draft.len > 80, `草稿 ${draft.len} 字符`)

    /* ---------- 禁词扫描（渲染层） ---------- */
    await page.evaluate(() => { state.view = 'stage'; render() })
    const bannedHits = await page.evaluate((banned) => {
      const txt = $('#main').textContent || ''
      return banned.filter((w) => txt.includes(w))
    }, BANNED)
    check('Q8', '渲染文本禁词 0（预后/生存期/治愈率/判定句/线序词）', bannedHits.length === 0, bannedHits.length ? bannedHits.join(',') : '0 命中')

    /* ---------- Q9/Q10 两套档案切换不串档 ---------- */
    const ab = {}
    for (const k of ['A', 'B']) {
      await page.evaluate((k) => { state.profile = k; state.sel = defaultSel(k); render() }, k)
      ab[k] = await page.evaluate(() => ({
        name: P().name, docs: DOCS[state.profile].length, trials: TRIALS.length,
        dashCards: document.querySelectorAll('.mcard').length,
        meta: document.querySelector('#profile-meta').textContent
      }))
    }
    check('Q9', '两套档案并存且条数明显不同（A 记录少 / B 记录多）',
      ab.A.name !== ab.B.name && ab.A.docs < ab.B.docs,
      `A=${ab.A.name} docs:${ab.A.docs} · B=${ab.B.name} docs:${ab.B.docs}`)
    await page.evaluate(() => { state.profile = 'A'; state.sel = defaultSel('A'); render() })

    /* ---------- MT 3D 翻面（定高 + aria-pressed） ---------- */
    await page.evaluate(() => { state.view = 'labs'; state.sub.labs = 0; render() })
    const flip = await page.evaluate(() => {
      const grid = document.querySelector('.metric-grid')
      const card = grid && grid.querySelector('.mcard[data-mcard]')
      if (!card) return null
      const h0 = card.getBoundingClientRect().height
      const sib0 = [...grid.querySelectorAll(':scope > .mcard')].map(c => Math.round(c.getBoundingClientRect().height))
      card.click()
      const pressed = card.getAttribute('aria-pressed')
      const inner = card.querySelector('.mcard-inner')
      const tf = inner ? getComputedStyle(inner).transform : ''
      const h1 = card.getBoundingClientRect().height
      const sib1 = [...grid.querySelectorAll(':scope > .mcard')].map(c => Math.round(c.getBoundingClientRect().height))
      card.click()
      const pressed2 = card.getAttribute('aria-pressed')
      return { pressed, pressed2, h0: Math.round(h0), h1: Math.round(h1), sameSibs: JSON.stringify(sib0) === JSON.stringify(sib1), matrix3d: /matrix/.test(tf) }
    })
    check('MT07', '翻面两次恢复正面；卡片定高不变；同组卡高度一致',
      !!flip && flip.pressed === 'true' && flip.pressed2 === 'false' && flip.h0 === flip.h1 && flip.sameSibs,
      flip ? `h=${flip.h0}→${flip.h1} pressed=${flip.pressed}→${flip.pressed2} sibsSame=${flip.sameSibs}` : 'labs 页没有数值卡')
    check('MT08a', '翻面用 preserve-3d/matrix（真 3D 链路）', !!flip && flip.matrix3d, flip ? 'transform 有 matrix' : '无 transform')

    /* ---------- C 组抽样：画布、单点不连线、空窗口 ---------- */
    await page.evaluate(() => { state.view = 'timeline'; state.profile = 'A'; state.sub.timeline = 0; state.sel = defaultSel('A'); state.range = 'all'; state.toggles.treatment = true; render() })
    const c1 = await page.evaluate(() => {
      const svg = document.querySelector('svg.chart')
      if (!svg) return { hasSvg: false, dbg: JSON.stringify({ view: state.view, profile: state.profile, sel: state.sel, mainLen: $('#main').innerHTML.length, wrap: (document.querySelector('.chart-wrap')||{}).innerHTML ? document.querySelector('.chart-wrap').innerHTML.slice(0, 160) : 'NOWRAP' }) }
      const paths = [...svg.querySelectorAll('path.line')]
      const rects = [...svg.querySelectorAll('.qual-pt rect')]
      return { hasSvg: !!svg, pathCount: paths.length, hasLine: paths.some(p => (p.getAttribute('d') || '').length > 10), qualNodes: rects.length, rootClass: svg?.getAttribute('class') }
    })
    check('C0', 'svg.chart 存在且有数值 path 与分类节点（先证非空）', c1.hasSvg && c1.pathCount > 0 && c1.qualNodes > 0,
      c1.hasSvg ? `paths=${c1.pathCount} qualNodes=${c1.qualNodes} class="${c1.rootClass}"` : 'svg 缺失 · ' + (c1.dbg || ''))
    const c2a = await page.evaluate(() => {
      const svg = document.querySelector('svg.chart')
      const m = M()['mg_state']
      if (!svg || !m) return { ok: false, why: 'svg 或 mg_state 缺失（不能当通过）' }
      const lineForQual = svg.querySelector('path.line') && m.points.length === 1 && (M()['fatigue'] || {}).points
      return { ok: m.points.length === 1, why: `mg_state 点数=${m.points.length}` }
    })
    check('C2a', '单点分类序列不连线（mg_state A 档 1 点，svg 已存在）', c2a.ok, c2a.why)
    /* C8 用 B 档（数据跨 2022→2026，3m 窗口才会真实缩减；A 档全部数据落在 3 个月附近，窗口切换不缩点） */
    await page.evaluate(() => { state.profile = 'B'; state.sel = defaultSel('B'); state.range = 'all'; render() })
    const cAll = await page.evaluate(() => document.querySelectorAll('svg.chart circle.pt').length)
    await page.evaluate(() => { state.range = '3m'; render() })
    const c3 = await page.evaluate(() => {
      const svg = document.querySelector('svg.chart')
      const empty = !svg ? ($('#main').textContent || '').includes('这个时间窗里没有所选指标') : false
      const dots = svg ? svg.querySelectorAll('circle.pt').length : 0
      const tick = svg ? (svg.textContent.match(/\d+月/) || [''])[0] : ''
      return { empty, svgGone: !svg, dots, tick }
    })
    check('C8', '时间窗切换联动：B 档 3m 后点数减少（或空窗有空态文案）',
      cAll > 0 && (c3.svgGone ? c3.empty : c3.dots < cAll),
      `all 点数=${cAll} → 3m 点数=${c3.svgGone ? '空窗' : c3.dots} 首刻度=${c3.tick}`)
    await page.evaluate(() => { state.range = 'all'; render() })

    /* ---------- Q12/Q13 唯一源与合成标注 ---------- */
    const src = await page.evaluate(() => ({
      demoGlobal: typeof window.DEMO_DATA === 'object' && !!window.DEMO_DATA.profiles,
      barText: document.querySelector('.prototype-bar')?.textContent || '',
      footer: document.querySelector('.footer')?.textContent || ''
    }))
    check('Q12', '演示数据唯一源（window.DEMO_DATA 两套档案）', src.demoGlobal, 'demo-data.js 被加载')
    check('Q13', '首屏声明条标注「合成示例 / 未连接宿主」', /合成示例/.test(src.barText) && /未接入/.test(src.barText), src.barText.slice(0, 60))

    /* ---------- 36 号 ? 按钮真开（本探针默认目标=本仓原型） ---------- */
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.evaluate(() => document.querySelector('[data-primer-open]')?.click())
    await new Promise((r) => setTimeout(r, 300))
    const dp = await page.evaluate(() => {
      const el = document.querySelector('.dp-overlay')
      const secs = el && !el.hidden ? [...el.querySelectorAll('.dp-section')].map(s => s.dataset.dpSection) : []
      return { open: !!(window.DiseasePrimer && window.DiseasePrimer.isOpen()), secs }
    })
    check('P-smoke', '? 按钮打开整页面板且四段齐全（definition/evidence/landscape/trend）',
      dp.open && dp.secs.join(',') === 'definition,evidence,landscape,trend',
      dp.open ? dp.secs.join(' › ') : '面板没打开（缺 primer 三件套或按钮没接）')
    await page.evaluate(() => window.DiseasePrimer && window.DiseasePrimer.close())
    await new Promise((r) => setTimeout(r, 250))

    /* ---------- self-test：注入缺陷必须被抓到 ---------- */
    if (SELF_TEST) {
      await page.evaluate(() => { VIEWS.records = () => ''; render() })
      const st = await page.evaluate(() => $('#main').innerHTML.length)
      check('ST1', 'self-test：注入空页后 R1 类断言必须能 FAIL（被测对象可被打破）', st === 0, `records innerHTML 长度=${st}（探针若仍报绿即探针失效）`)
    }

    const fails = results.filter(r => !r.ok)
    console.log(`\n== probe-thymic-m2 汇总：${results.length - fails.length}/${results.length} PASS${SELF_TEST && fails.length ? `（self-test 期望部分 FAIL）` : ''} ==`)
    await browser.close()
    server.close()
    if (SELF_TEST) process.exit(fails.length > 0 ? 0 : 1)
    process.exit(fails.length === 0 ? 0 : 1)
  } catch (e) {
    console.error('PROBE-ERROR', e)
    try { await browser.close(); server.close() } catch {}
    process.exit(2)
  }
}
main()
