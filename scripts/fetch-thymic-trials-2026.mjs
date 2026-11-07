#!/usr/bin/env node
/**
 * fetch-thymic-trials-2026.mjs — 胸腺癌临床试验库采集（M4）
 *
 * 四在线通道口径：ClinicalTrials.gov API v2（本夜实测可用）、ChiCTR、中国药物临床试验登记与信息公示平台、
 * WHO ICTRP。后三个通道本夜未实测成功 → 如实记入 FAILED.md（未查过不写零结果）。
 *
 * 产出 research/thymic-carcinoma/ 四件套：
 *   trials.jsonl   —— 原始登记（一行一条，字段白名单映射）
 *   trials.sqlite  —— 内存建库落盘（read 用）
 *   manifest.json  —— 计数 + sha256 + 字段映射断言结果
 *   FAILED.md      —— 未采集通道与原因（每次运行重写）
 *
 * 用法：node scripts/fetch-thymic-trials-2026.mjs [--window-from 2020-01-01]
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'research/thymic-carcinoma')
mkdirSync(OUT, { recursive: true })
const args = process.argv.slice(2)
const argOf = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null }
const FROM = argOf('--window-from') || '2020-01-01'
const TODAY = new Date().toISOString().slice(0, 10)

const FIELDS = 'NCTId,BriefTitle,OverallStatus,Phase,LeadSponsorName,Condition,StartDate,EnrollmentCount'
const url = `https://clinicaltrials.gov/api/v2/studies?query.cond=thymic%20carcinoma%20OR%20thymic%20epithelial%20tumor` +
  `&filter.advanced=${encodeURIComponent(`AREA[StartDate]RANGE[${FROM},MAX]`)}&pageSize=100&countTotal=true&fields=${FIELDS}`

const failed = []
const sha = (buf) => createHash('sha256').update(buf).digest('hex')

async function fetchCtGov() {
  const rsp = await fetch(url, { headers: { accept: 'application/json' } })
  if (!rsp.ok) throw new Error(`CT.gov HTTP ${rsp.status}`)
  const data = await rsp.json()
  const total = data.totalCount ?? null
  const rows = (data.studies || []).map((s) => {
    const p = s.protocolSection || {}
    const idm = p.identificationModule || {}, st = p.statusModule || {}, dm = p.designModule || {}, sp = p.sponsorCollaboratorsModule || {}
    const id = idm.nctId
    const status = st.overallStatus || null
    return {
      recordId: id,
      mergedSources: [{ source: 'clinicaltrials.gov', id }],
      sourceId: 'clinicaltrials.gov',
      title: idm.briefTitle,
      studyType: (dm.studyType || null),
      sponsor: [sp.leadSponsor && sp.leadSponsor.name].filter(Boolean),
      registryNumbers: [id],
      dates: { start: st.startDateStruct ? st.startDateStruct.date : null, overall: st.overallStatusDate || null },
      phase: (dm.phases && dm.phases[0]) || 'N/A',
      enrollment: dm.enrollmentInfo ? dm.enrollmentInfo.count : null,
      sourceUrl: `https://clinicaltrials.gov/study/${id}`,
      retrievedAt: TODAY,
      statusNote: status ? `${status}（登记状态，未核实；以研究中心为准）` : null,
      snapshotDate: TODAY
    }
  }).filter(r => r.recordId)
  return { rows, total }
}

let ct = null
try {
  ct = await fetchCtGov()
} catch (e) {
  failed.push(`ClinicalTrials.gov API v2：${e.message} —— 本轮未取得数据，计数按 0 记为「未取得」，不得写成「无试验」`)
}

/* ChiCTR / 中国登记平台 / ICTRP：本夜未实现采集器 → 如实记未采集 */
failed.push('ChiCTR（chictr.org.cn）：本夜未实现采集器，未查过——中国登记覆盖未知，不写零结果')
failed.push('中国药物临床试验登记与信息公示平台（CDE）：本夜未实现采集器（既往家族记录存在反爬挑战），未查过')
failed.push('WHO ICTRP：本夜未实现采集器，未查过')

const rows = ct ? ct.rows : []
const jsonl = rows.map(r => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : '')
writeFileSync(join(OUT, 'trials.jsonl'), jsonl, 'utf8')

/* sqlite：manifest=jsonl=sqlite 计数与逐字段映射断言的落盘形态 */
const dbPath = join(OUT, 'trials.sqlite')
if (existsSync(dbPath)) { try { require } catch {} ; (await import('node:fs')).rmSync(dbPath) }
const db = new DatabaseSync(dbPath)
db.exec(`CREATE TABLE trials (
  record_id TEXT PRIMARY KEY, merged_sources TEXT, source_id TEXT, title TEXT, study_type TEXT,
  sponsors TEXT, registry_numbers TEXT, dates TEXT, source_url TEXT, retrieved_at TEXT,
  status_note TEXT, snapshot_date TEXT, phase TEXT, enrollment INTEGER)`)
const ins = db.prepare(`INSERT INTO trials (record_id,merged_sources,source_id,title,study_type,sponsors,registry_numbers,dates,source_url,retrieved_at,status_note,snapshot_date,phase,enrollment)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
for (const r of rows) ins.run(r.recordId, JSON.stringify(r.mergedSources), r.sourceId, r.title, r.studyType,
  JSON.stringify(r.sponsor), JSON.stringify(r.registryNumbers), JSON.stringify(r.dates), r.sourceUrl, r.retrievedAt,
  r.statusNote, r.snapshotDate, r.phase, r.enrollment)
db.exec(`CREATE TABLE source_statuses (query TEXT, source_id TEXT, state TEXT)`)
const stIns = db.prepare('INSERT INTO source_statuses (query,source_id,state) VALUES (?,?,?)')
stIns.run('thymic carcinoma OR thymic epithelial tumor 2020→', 'clinicaltrials.gov', ct ? 'ok' : 'failed')
stIns.run('thymic carcinoma', 'chictr', 'not_collected')
stIns.run('thymic carcinoma', 'cde_cn_registry', 'not_collected')
stIns.run('thymic carcinoma', 'ictrp', 'not_collected')
db.close()

/* 字段映射断言：jsonl 每行 id 非空且 sqlite 行数一致 */
const jsonlLines = jsonl.trim() ? jsonl.trim().split('\n') : []
const parsed = jsonlLines.map(l => JSON.parse(l))
const assertMap = parsed.every(r => typeof r.recordId === 'string' && r.recordId.startsWith('NCT') && typeof r.title === 'string' && Array.isArray(r.registryNumbers))
const dbCount = new DatabaseSync(dbPath, { readOnly: true }).prepare('SELECT COUNT(*) c FROM trials').get().c

const manifest = {
  files: {
    'trials.jsonl': { sha256: sha(readFileSync(join(OUT, 'trials.jsonl'))), bytes: readFileSync(join(OUT, 'trials.jsonl')).length },
    'trials.sqlite': { sha256: sha(readFileSync(dbPath)), bytes: readFileSync(dbPath).length }
  },
  recordCount: rows.length,
  dbCount,
  sourceStatusRows: 4,
  window: { from: FROM, to: TODAY },
  query: 'query.cond=thymic carcinoma OR thymic epithelial tumor; AREA[StartDate]RANGE',
  channels: { clinicaltrials_gov: { ok: !!ct, count: rows.length, totalReported: ct ? ct.total : null }, chictr: '未采集', cde_cn: '未采集', ictrp: '未采集' },
  fieldMapAssert: assertMap,
  generatedAt: TODAY,
  note: '状态未核实，入排以研究中心为准；FAILED.md 记未采集通道（未采集≠零结果）。'
}
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')

const failedMd = `# FAILED · 未采集与失败记录（每次运行重写）\n\n采集窗口：${FROM} → ${TODAY}\n\n` +
  failed.map(f => `- ${f}`).join('\n') + '\n\n> 纪律：未查过 ≠ 零结果。上表未采集通道的覆盖未知，任何"中国无在招试验"类结论都不允许由本文件推出。\n'
writeFileSync(join(OUT, 'FAILED.md'), failedMd, 'utf8')

console.log(JSON.stringify({ ok: true, count: rows.length, total: ct ? ct.total : null, dbCount, fieldMapAssert: assertMap, failed: failed.length }, null, 2))
process.exit(ct && assertMap && dbCount === rows.length ? 0 : 1)
