#!/usr/bin/env node
/**
 * schema 合同测试（M3/G3）：
 *   1) 内存里把 0001_initial.sql 全建一遍（node:sqlite）；
 *   2) 判读列断言：无 diagnosis / risk_level / 活动评分 / 自动线序等派生判定列；
 *   3) freeze-contract：contract.json 的 sha256 必须与当前 SQL 文件一致（改 SQL 必须重签合同）。
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { createHash } from 'node:crypto'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SQL_PATH = join(ROOT, 'schema/0001_initial.sql')

test('schema: 内存全建 + 判读列断言 + freeze-contract 一致', () => {
  const sql = readFileSync(SQL_PATH, 'utf8')
  const db = new DatabaseSync(':memory:')
  db.exec(sql) // 有任何语法/约束错误都会抛

  /* 判读列断言：先证有表，再逐列比对（禁词必须精确命中列名，不许子串误伤如 diagnoses 备注列） */
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name)
  assert.ok(tables.length >= 20, `表数 ${tables.length} 应 ≥20（先证 schema 非空）`)
  const banned = ['diagnosis', 'risk_level', 'activity_score', 'response', 'line_number', 'stage_numeric', 'prognosis']
  const offenders = []
  for (const t of tables) {
    const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name.toLowerCase())
    for (const b of banned) if (cols.includes(b)) offenders.push(`${t}.${b}`)
  }
  assert.deepEqual(offenders, [], `发现判读/派生判定列：${offenders.join(', ')}`)

  /* 派生值不落库：距上次/差值/辐射计数一类列名不许出现 */
  const derived = ['days_since', 'delta_value', 'radiation_count', 'next_due', 'comparable_group']
  const derivedHits = []
  for (const t of tables) {
    const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name.toLowerCase())
    for (const dcol of derived) if (cols.includes(dcol)) derivedHits.push(`${t}.${dcol}`)
  }
  assert.deepEqual(derivedHits, [], `派生值落库（应读时算）：${derivedHits.join(', ')}`)

  /* freeze-contract：哈希一致（改 SQL 必须重签） */
  const contract = JSON.parse(readFileSync(join(ROOT, 'schema/contract.json'), 'utf8'))
  const actual = createHash('sha256').update(readFileSync(SQL_PATH)).digest('hex')
  assert.equal(actual, contract.sha256, 'schema/0001_initial.sql 与 contract.json 哈希不一致——改了 SQL 就要重签合同，不许改断言')

  /* 关键表抽查：并存语义的列真的在 */
  const stg = db.prepare('PRAGMA table_info(staging_entry)').all().map(c => c.name)
  for (const c of ['system_name', 'system_version', 'stage_text', 'basis_verbatim']) assert.ok(stg.includes(c), `staging_entry 缺 ${c}（双体系并存合同）`)
  const pr = db.prepare('PRAGMA table_info(pathology_report)').all().map(c => c.name)
  assert.ok(pr.includes('kind'), 'pathology_report 缺 kind（原/复核并存合同）')
  const se = db.prepare('PRAGMA table_info(symptom_entry)').all().map(c => c.name)
  assert.ok(se.includes('private'), 'symptom_entry 缺 private（三出口过滤合同）')
})

test('schema: in_use 软删 + 分类指标 unit/dec 显式 NULL 约束', () => {
  const sql = readFileSync(SQL_PATH, 'utf8')
  const db = new DatabaseSync(':memory:')
  db.exec(sql)
  const withInUse = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND sql LIKE '%in_use%'").all().map(r => r.name)
  assert.ok(withInUse.length >= 12, `in_use 表数 ${withInUse.length} 应 ≥12`)
  /* 分类指标（qual_levels 非空时）unit/dec 允许 NULL——插入验证 */
  db.prepare("INSERT INTO metric_def (key,name,category,unit,dec_digits,note,color,qual_levels) VALUES ('fatigue','疲乏（自述）','自述',NULL,NULL,'自述档位','#7a5c9e','[\"无\",\"轻度\",\"明显\",\"影响日常\"]')").run()
  const row = db.prepare("SELECT unit, dec_digits FROM metric_def WHERE key='fatigue'").get()
  assert.equal(row.unit, null)
  assert.equal(row.dec_digits, null)
})
