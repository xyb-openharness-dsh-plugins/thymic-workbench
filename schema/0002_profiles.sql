-- 0002（只增不改）：档案的真实/演示标记 + 运行时设置。
-- is_demo：demo 档案不可删、不覆盖；新建档案写 0。
-- app_setting：data_root = 用户在面板里选的资料目录（重开宿主仍生效）。
ALTER TABLE profile ADD COLUMN is_demo INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS app_setting (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
