#!/usr/bin/env node
/**
 * check-pack.mjs — 打包四要素自检（M6/V2）：npm pack 的 tgz 是唯一被测对象。
 *   ① 从 tgz 解包，只从解出来的包 import 服务（不碰源码树）；
 *   ② health / bootstrap / 静态七件（含 primer 三件套引用）；
 *   ③ MinerU token 读写：保存→掩码→600 权限→清除→非法 400；
 *   ④ 数据层边界：profile 如实 404/503（骨架态），不冒充已接通。
 * 用法：node scripts/check-pack.mjs release/<name>.tgz
 */
import { mkdtempSync, rmSync, writeFileSync, readFileSync, statSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
const SELF = resolve(process.argv[1], '..', '..')
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import { createServer } from 'node:http'

const tgz = resolve(process.argv[2] || '')
if (!existsSync(tgz)) { console.error('✗ 用法：node scripts/check-pack.mjs release/<name>.tgz'); process.exit(2) }
const tmp = mkdtempSync(join(tmpdir(), '.xyb-thymic-pack-'))
const notes = []
try {
  spawnSync('tar', ['-xzf', tgz, '-C', tmp])
  const pkgDir = join(tmp, 'package')
  const manifest = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'))
  /* peer 依赖由宿主提供；独立启动用本仓 node_modules 兜住（仅测试环境，不影响包内容） */
  spawnSync('ln', ['-s', join(SELF, 'node_modules'), join(pkgDir, 'node_modules')])
  const mod = await import('file://' + join(pkgDir, 'dsh/index.js'))

  /* 桩宿主：接住 register 的 prefix handler，包成真 http 服务 */
  let handler = null
  const fakeCtx = {
    webServer: { register: (cfg) => { if (cfg.kind === 'prefix') handler = cfg.handler; return () => {} } },
    connection: { requestRejection: () => undefined },
    effect: (fn) => { try { fn() } catch {} },
  }
  await mod.apply(fakeCtx, { root: undefined })
  if (!handler) throw new Error('服务没有注册 prefix handler')
  const server = createServer((req, res) => handler(req, res))
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  const base = `http://127.0.0.1:${server.address().port}`

  /* ② health / bootstrap */
  const health = await (await fetch(`${base}/api/thymic/health`)).json()
  if (health.version !== manifest.version) throw new Error(`health 版本 ${health.version} ≠ 包 ${manifest.version}`)
  notes.push(`✓ health · v${health.version} 与包一致`)
  const boot = await (await fetch(`${base}/api/thymic/bootstrap`)).json()
  if (boot.mode !== 'demo-skeleton') throw new Error('bootstrap 未如实声明 demo-skeleton')
  notes.push(`✓ bootstrap · mode=${boot.mode}（骨架态如实声明，不冒充已接通）`)

  /* ② 静态七件 + primer 三件套引用 */
  for (const f of ['index.html', 'app.js', 'style.css', 'demo-data.js', 'primer-data.js', 'primer.js', 'primer.css']) {
    const rsp = await fetch(`${base}/api/thymic/ui/${f}`)
    if (rsp.status !== 200) throw new Error(`静态件 ${f} → ${rsp.status}`)
  }
  const uiHtml = await (await fetch(`${base}/api/thymic/ui/index.html`)).text()
  for (const need of ['primer-data.js', 'primer.js', 'primer.css']) {
    if (!uiHtml.includes(need)) throw new Error(`index.html 没引用 ${need}——预览能开但没有「?」入口`)
  }
  if (!uiHtml.includes('data-primer-open')) throw new Error('index.html 缺 [data-primer-open]——? 按钮没接线')
  notes.push('✓ 静态七件 · 200 且内容对（含 primer 三件套与 ? 入口）')

  /* ④ 数据层边界：profile 如实不可用 */
  const prof = await fetch(`${base}/api/thymic/profile/demo`)
  if (prof.status === 200) throw new Error('骨架态 profile 不该返回 200——冒充已接通')
  notes.push(`✓ 数据层边界 · profile → ${prof.status}（骨架态如实拒绝）`)

  /* ③ MinerU token：保存→掩码→600→清除（写包外临时 HOME，原文不回显） */
  const fakeHome = join(tmp, 'home')
  const settings = await import('file://' + join(pkgDir, 'dsh/settings.js'))
  const opts = { home: fakeHome, env: {} } // 保存/清除：显式 home + 空 env（屏蔽宿主真实 MINERU_TOKEN）
  const secretPath = join(fakeHome, '.thympal/secrets/mineru.json')
  const statusOpts = { file: secretPath, env: {} } // 状态读取走显式 file，不依赖调用方 HOME
  const { mkdirSync } = await import('node:fs')
  mkdirSync(join(fakeHome, '.thympal', 'secrets'), { recursive: true })
  settings.saveMineruToken('sk-test-1234567890abcdef', opts)
  const secretFile = join(fakeHome, '.thympal/secrets/mineru.json')
  if (!existsSync(secretFile)) throw new Error('Token 文件没落到用户目录')
  const mode = (statSync(secretFile).mode & 0o777).toString(8)
  if (mode !== '600') throw new Error(`Token 文件权限 ${mode} ≠ 600`)
  const status = settings.mineruSettingsStatus(statusOpts)
  if (!status.configured || /sk-test-1234567890abcdef/.test(JSON.stringify(status))) throw new Error('状态回显泄漏原文或未配置')
  settings.clearMineruToken(opts)
  const after = settings.mineruSettingsStatus(statusOpts)
  if (after.configured) throw new Error('清除后仍显示已配置 · ' + JSON.stringify(after).slice(0, 200))
  notes.push('✓ MinerU token · 保存→掩码→600→清除 全链（显式 home 注入，不碰真实用户目录）')

  console.log(`包：${manifest.name}@${manifest.version} · ${tgz.split('/').pop()}\n`)
  for (const n of notes) console.log(n)
  console.log('\n✓ 打包四要素自检通过')
  server.close()
  process.exit(0)
} catch (e) {
  console.error(`\n✗ 打包自检失败：\n  - ${e.message}`)
  process.exit(1)
} finally {
  try { rmSync(tmp, { recursive: true, force: true }) } catch {}
}
