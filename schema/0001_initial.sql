-- 0001_initial.sql · 小橡宝胸腺癌工作台 · 数据合同 v1（G2 后冻结）
-- 约定：事实与候选分开；派生值（距上次/差值/可比分组/辐射计数）读取时算、不落库；
--       无 diagnosis / risk_level / 疗效判定 / 分期换算列；ORDER BY rowid；显式 NULL（不用空串冒充）；软删用 in_use。
-- 演示数据不入库：demo-data.js 只进原型；本 schema 只装用户确认录入的事实。

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ============ 档案（2） ============
CREATE TABLE profile (
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,              -- 'A' / 'B' 或用户命名
  name TEXT NOT NULL,
  sex TEXT,
  age INTEGER,
  meta_line TEXT,                          -- 档案一句话（医生口径摘要，无判定词）
  headline TEXT,
  histology_text TEXT,                     -- 病理名称逐字原文（不判定瘤/癌）
  mindset TEXT,
  path_chips TEXT,                          -- JSON 数组：hero chips
  family_talk TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE profile_anchor (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  anchor_date TEXT,                         -- 手术日/分期记录日/病理确诊日（Day 0），允许 NULL=未初始化
  anchor_label TEXT,
  source_note TEXT,
  in_use INTEGER NOT NULL DEFAULT 1
);

-- ============ 指标（3） ============
CREATE TABLE metric_def (
  key TEXT PRIMARY KEY,                     -- afp / bhcg / wbc / fatigue / mg_state...
  name TEXT NOT NULL,
  category TEXT NOT NULL,                   -- 鉴别参考/血象/生化/免疫相关/自述（分类只进分组，不进趋势轴）
  unit TEXT,                                -- 分类指标为 NULL
  dec_digits INTEGER,                       -- 分类指标为 NULL
  note TEXT,
  color TEXT,
  band_lo REAL, band_hi REAL,               -- 参考区间（来自化验单，允许 NULL）
  qual_levels TEXT                          -- JSON 数组：分类序列档位（显式声明，不按出现顺序）
);

CREATE TABLE metric_point (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  metric_key TEXT NOT NULL REFERENCES metric_def(key),
  d TEXT NOT NULL,                          -- ISO 日期；未知日期→显式 NULL 并以 recorded_at 排序
  v_num REAL,                               -- 数值（分类指标为 NULL）
  v_text TEXT,                              -- 分类档位原文（数值指标为 NULL）
  src TEXT,
  method TEXT,                              -- 方法/机构（可比分组读时派生，不落库判定）
  org TEXT,
  recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE metric_revision (
  id INTEGER PRIMARY KEY,
  point_id INTEGER NOT NULL REFERENCES metric_point(id),
  prev_v_num REAL, prev_v_text TEXT, prev_d TEXT, prev_src TEXT,
  reason TEXT NOT NULL,                     -- 更正原因（更正=新增版本，不覆盖）
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============ 通用（7） ============
CREATE TABLE doc_source (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  name TEXT NOT NULL,
  file_name TEXT,
  size INTEGER,
  d TEXT,                                   -- 报告日期，未知→NULL
  type TEXT,                                -- 病理报告/影像报告/化验单/治疗记录/手术记录/出院记录/其他
  status TEXT NOT NULL DEFAULT '待核对',     -- 待核对/已核对/已入库/解析失败
  storage_path TEXT,
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE candidate (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  name TEXT NOT NULL,
  value_text TEXT,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'candidate',  -- candidate/accepted（候选接受前不进事实层）
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE question_entry (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  text TEXT NOT NULL,
  asked INTEGER,                             -- NULL=未问；0/1 状态
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE treatment_event (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  kind TEXT NOT NULL,                        -- surgery/radiotherapy/systemic/immunotherapy
  label TEXT NOT NULL,                       -- 医生原文称谓（不自动编号线序）
  d_start TEXT, d_end TEXT,
  detail TEXT,                               -- 方案/剂量原文
  org TEXT,
  doc_id INTEGER REFERENCES doc_source(id),
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE timeline_event (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  d TEXT,
  label TEXT NOT NULL,                       -- 确诊/手术/分期/复发等评估节点（医生记录）
  kind TEXT,
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE symptom_entry (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  d TEXT NOT NULL,
  tag TEXT NOT NULL,                         -- 眼睑下垂/疲乏/情绪...
  text TEXT NOT NULL,                        -- 患者原话
  private INTEGER NOT NULL DEFAULT 0,        -- 私密三出口共用过滤
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE viewpoint_entry (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  d TEXT NOT NULL,
  tag TEXT,
  text TEXT NOT NULL,
  private INTEGER NOT NULL DEFAULT 0,
  in_use INTEGER NOT NULL DEFAULT 1
);

-- ============ 胸腺癌专属（5） ============
CREATE TABLE pathology_report (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  kind TEXT NOT NULL CHECK (kind IN ('primary','review')),   -- 原报告 / 复核意见，并存不覆盖
  title TEXT NOT NULL,                       -- 分节 *_title
  report_date TEXT,
  org TEXT,
  name_verbatim TEXT NOT NULL,               -- 病理名称逐字原文
  rows_json TEXT,                            -- JSON：项目/记录逐字段
  gaps_json TEXT,                            -- JSON：未确认缺口
  doc_id INTEGER REFERENCES doc_source(id),
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE staging_entry (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  system_name TEXT NOT NULL CHECK (system_name IN ('masaoka_koga','tnm')),
  system_version TEXT,                       -- 如 TNM 第8版/第9版；MK 无版本→NULL
  stage_text TEXT NOT NULL,                  -- 医生原文期别（不换算）
  basis_verbatim TEXT,                       -- 依据原文
  d TEXT,
  org TEXT,
  doc_id INTEGER REFERENCES doc_source(id),
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE mg_status (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  status TEXT NOT NULL CHECK (status IN ('未记录','医生疑似','医生确诊')),
  d TEXT,
  source_note TEXT,
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE imaging_report (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  d TEXT,
  exam TEXT NOT NULL,                        -- 胸部CT/肝MRI...（辐射计数读时按 CT 类派生）
  conclusion_verbatim TEXT NOT NULL,         -- 报告结论摘录原文
  next_hint TEXT,                            -- 报告/医生写的"下一次建议"原文
  doc_id INTEGER REFERENCES doc_source(id),
  in_use INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE immune_record (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  d TEXT,
  item TEXT NOT NULL,                        -- 免疫治疗开始/irAE 监测/评估
  detail TEXT,                               -- 医生原文
  doc_id INTEGER REFERENCES doc_source(id),
  in_use INTEGER NOT NULL DEFAULT 1
);

-- ============ 导入（3，MinerU 未接入——表结构先行，功能禁用并解释） ============
CREATE TABLE import_batch (
  id INTEGER PRIMARY KEY,
  profile_id INTEGER NOT NULL REFERENCES profile(id),
  engine TEXT NOT NULL DEFAULT 'manual',     -- manual/mineru（当前只允许 manual）
  status TEXT NOT NULL DEFAULT 'done',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE import_file (
  id INTEGER PRIMARY KEY,
  batch_id INTEGER NOT NULL REFERENCES import_batch(id),
  file_name TEXT NOT NULL,
  storage_path TEXT,
  parse_status TEXT NOT NULL DEFAULT 'pending'
);

CREATE TABLE import_candidate (
  id INTEGER PRIMARY KEY,
  batch_id INTEGER NOT NULL REFERENCES import_batch(id),
  name TEXT NOT NULL,
  value_text TEXT,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'candidate',
  in_use INTEGER NOT NULL DEFAULT 1
);

-- 索引（读模型常用序）
CREATE INDEX idx_metric_point ON metric_point(profile_id, metric_key, d);
CREATE INDEX idx_doc ON doc_source(profile_id, d);
CREATE INDEX idx_staging ON staging_entry(profile_id, system_name, d);
CREATE INDEX idx_imaging ON imaging_report(profile_id, d);
CREATE INDEX idx_treatment ON treatment_event(profile_id, d_start);
