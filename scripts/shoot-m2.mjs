#!/usr/bin/env node
/* M2 实渲截图（33 号）：6 张，文件名含版本。 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
const ROOT = '/Users/qinxiaoqiang/Downloads/thymic-workbench'
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }
const server = createServer(async (req, rsp) => { const p = decodeURIComponent((req.url || '/').split('?')[0]); const f = join(ROOT, normalize(p).replace(/^([/\\])+/, '')); try { const b = await readFile(f); rsp.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' }).end(b) } catch { rsp.writeHead(404).end() } })
await new Promise(r => server.listen(8201, '127.0.0.1', r))
const require = createRequire('/Users/qinxiaoqiang/.workbuddy/binaries/node/workspace/')
const puppeteer = require('puppeteer-core')
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
if (!existsSync(CHROME)) { console.log('no chrome'); process.exit(2) }
const outDir = join(ROOT, 'docs/shots'); mkdirSync(outDir, { recursive: true })
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 860, deviceScaleFactor: 2 })
await page.goto('http://127.0.0.1:8201/prototypes/v0.2/index.html', { waitUntil: 'networkidle0' })
const shot = async (name) => { await page.screenshot({ path: join(outDir, name) }); console.log('shot', name) }
await new Promise(r => setTimeout(r, 900))
await shot('v0.2.0-dashboard-A.png')
await page.evaluate(() => { state.profile = 'B'; state.sel = defaultSel('B'); render() })
await new Promise(r => setTimeout(r, 400))
await page.evaluate(() => { state.view = 'pathology'; state.sub.pathology = 1; location.hash = 'pathology'; render() })
await shot('v0.2.0-pathology-review-B.png')
await page.evaluate(() => { state.view = 'stage'; state.sub.stage = 2; render() })
await shot('v0.2.0-stage-dual.png')
await page.evaluate(() => { state.view = 'treatment'; state.sub.treatment = 0; render() })
await shot('v0.2.0-treatment-fold-closed.png')
await page.evaluate(() => { const d = document.querySelector('details.phase-fold'); if (d) d.open = true })
await new Promise(r => setTimeout(r, 200))
await shot('v0.2.0-treatment-fold-open.png')
await page.evaluate(() => { state.view = 'timeline'; state.sub.timeline = 0; render() })
await new Promise(r => setTimeout(r, 900))
await shot('v0.2.0-one-chart-B.png')
await page.evaluate(() => document.querySelector('[data-primer-open]')?.click())
await new Promise(r => setTimeout(r, 500))
await shot('v0.2.0-primer-open.png')
await browser.close(); server.close()
