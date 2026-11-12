/**
 * 开库 / 迁移 / 关库。schema/ 只增不改：按编号全部执行，重复执行幂等。
 * 本仓 0001 是冻结的初始 schema，0002 起只做增量（见 freeze-contract.md）。
 */
import { DatabaseSync } from 'node:sqlite'
import { readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const SCHEMA_DIR = join(HERE, '..', 'schema')
const DB_FILE = 'workbench.sqlite'

export function migrationFiles(dir = SCHEMA_DIR) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((f) => /^\d{4}_.*\.sql$/.test(f)).sort()
}

export function sha256(text) { return createHash('sha256').update(text).digest('hex') }

export function openStore(file) {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec('PRAGMA foreign_keys = ON;')
  db.exec('PRAGMA journal_mode = WAL;')
  migrate(db)
  return db
}

export function migrate(db, dir = SCHEMA_DIR) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    migration TEXT PRIMARY KEY, sha256 TEXT NOT NULL, applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`)
  const applied = new Set(db.prepare('SELECT migration FROM schema_migrations ORDER BY rowid').all().map((r) => r.migration))
  let ran = 0
  for (const f of migrationFiles(dir)) {
    if (applied.has(f)) continue
    const sql = readFileSync(join(dir, f), 'utf8')
    db.exec('BEGIN')
    try {
      db.exec(sql)
      db.prepare('INSERT INTO schema_migrations (migration, sha256) VALUES (?,?)').run(f, sha256(sql))
      db.exec('COMMIT'); ran++
    } catch (error) {
      db.exec('ROLLBACK')
      throw new Error(`迁移 ${f} 失败：${error.message}`)
    }
  }
  return { ran, total: migrationFiles(dir).length }
}

export function closeStore(db) { try { db.close() } catch { /* 已关闭 */ } }
export { DB_FILE }
