## 0.2.0（2026-11-08，夜班自动开发 · 包版本 0.2.0）

- M2 原型 v0.2.0：12 一级页（4 独有页）+ primer 三件套 + 两套合成档案（A/B）+ 全量探针（35 叶子路由 15/15）+ P1–P9 探针 10/10。
- M3 schema/0001_initial.sql（20 表）+ freeze-contract（sha256）+ 判读列断言测试。
- M4 临床库：ClinicalTrials.gov 53 条（快照检查器 PASS）；ChiCTR/CDE/ICTRP 如实未采集。
- M5 开发版：src→build→lib 链路、customFrame 外壳、agent-draft 桥、public 随包、版本簿记生成。
- 已知边界：业务数据事实层 API 未实现（界面为演示数据）；MinerU 解析未接入（token 存储已实现）。
# 变更记录

只增不删；每条写清"改了什么 + 为什么 + 用户可见结果"。版本号与 VERSION、package.json 三处必须一致。

## 0.1.0 — 2026-11-07

- 由社区脚手架 dsh-wb-cli@1.10.0-rc.22 (940fa17) 初始化，仅有注册骨架与健康接口，无业务功能。
