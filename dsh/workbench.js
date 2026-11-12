/**
 * 数据服务：资料根 → 开库 → 档案（profile）。本仓 0001 的 profile 表本就支持多档案，
 * 缺的是「打开真库 + 新建/删除」这条路；这里只补最小闭环，记录表随各功能线接入只增。
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { openStore, closeStore, migrate, DB_FILE } from './store.js'

export class Workbench {
  constructor({ root } = {}) {
    if (typeof root !== 'string' || root.trim() === '') throw new Error('Workbench 需要 root（用户资料目录）')
    this.root = root
    this.dbFile = join(root, DB_FILE)
    this.db = null
  }

  open() {
    if (this.db) return this
    this.db = openStore(this.dbFile)
    this.migrations = migrate(this.db)
    /* 用户上次选过的资料目录优先（目录还在才生效）——否则「配置目录」选完重开又回默认。 */
    if (!this._rootApplied) {
      this._rootApplied = true
      try {
        const row = this.db.prepare("SELECT value FROM app_setting WHERE key='data_root'").get()
        if (row?.value && row.value !== this.root && existsSync(row.value)) {
          closeStore(this.db)
          this.root = row.value
          this.dbFile = join(this.root, DB_FILE)
          this.db = openStore(this.dbFile)
          this.migrations = migrate(this.db)
        }
      } catch { /* 旧库没有 app_setting 也不该拦住打开 */ }
    }
    return this
  }

  close() { if (this.db) { closeStore(this.db); this.db = null } }

  get dataRoot() { return this.root }

  /** 切换资料目录：先开新库成功再替换，失败回滚。 */
  setDataRoot(nextRoot) {
    this.open()
    const dir = String(nextRoot || '').trim()
    if (!dir || dir === this.root) return this.root
    const prevRoot = this.root
    const prevFile = this.dbFile
    closeStore(this.db); this.db = null
    try {
      this.dbFile = join(dir, DB_FILE)
      this.db = openStore(this.dbFile)
      this.migrations = migrate(this.db)
      this.root = dir
      this.db.prepare("INSERT INTO app_setting(key,value,updated_at) VALUES('data_root',?,datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at").run(dir)
      return this.root
    } catch (error) {
      this.root = prevRoot; this.dbFile = prevFile
      try { this.db = openStore(this.dbFile) } catch { this.db = null }
      throw error
    }
  }

  listProfiles() {
    this.open()
    return this.db.prepare('SELECT id, slug, name, meta_line, is_demo, created_at FROM profile ORDER BY id').all()
      .map((r) => ({ profileKey: r.slug, name: r.name, meta: r.meta_line, isDemo: !!r.is_demo, createdOn: r.created_at }))
  }

  /** 新建档案：slug 用 local-<时间戳>（不与 demo 的 A/B 撞键，不拿姓名当键）。 */
  createProfile({ name, meta } = {}) {
    this.open()
    const clean = String(name || '').trim()
    if (!clean) throw new Error('请填写档案名（可以是昵称）')
    if (clean.length > 40) throw new Error('档案名太长（≤40 字）')
    const slug = 'local-' + Date.now().toString(36)
    this.db.prepare('INSERT INTO profile (slug, name, meta_line, is_demo) VALUES (?,?,?,0)')
      .run(slug, clean, String(meta || '').trim() || null)
    return { profileKey: slug, name: clean, records: this.listProfiles() }
  }

  /** demo 档案（is_demo=1）受保护：只能删自己建的。 */
  deleteProfile(profileKey) {
    this.open()
    const key = String(profileKey || '')
    /* 只有真删到行才算删除；demo（is_demo=1）与不存在的键都返回 deleted:null，
       不许回 200 说"删了"——那会让界面把未删除显示成已删除。 */
    const info = this.db.prepare('DELETE FROM profile WHERE slug = ? AND is_demo = 0').run(key)
    const changed = Number(info?.changes ?? 0)
    return { deleted: changed > 0 ? key : null, reason: changed > 0 ? undefined : '不存在或演示档案不可删除', records: this.listProfiles() }
  }
}
