## 0.2.1（2026-11-11，AI 对话面板激活逻辑修复）

- **修真实缺陷**：原实现用 `Boolean(conversation)` 判断"有没有会话"。customFrame 下宿主即使没有会话也会传一个隐藏的
  conversation 容器，该判断恒为真 → 点「AI 对话」既不创建也不展开，用户看到的是"点了没反应"。
  改为宿主归属判定 `activeSession = ownedSession()`（`ownsSession(currentSession())`，与官方 dsh-site-selection 同源），
  并由 `service.subscribe` bump `sessionRevision` 触发重渲染。
- **创建路径**：`ensureSession({ folder })` → `service.newSession(workspaceId)`；`workspaceId` 优先
  `service.defaultWorkspace?.()?.workspaceId`，无可用工作区时传 `undefined` 让宿主按其流程提示选目录。
  返回空值按"用户取消"处理：不留空会话，界面提示可再次点击重试；异常则在工作台内显示失败原因。
- 已有会话时只开合面板、不重复创建；`creatingRef` 防连点并发创建；草稿仍只填入、不自动发送。
- 顺手修底本残留：onboarding 文案里的「FIGO 分期」改为「Masaoka-Koga 与 TNM 分期（两套并存）」（胸腺癌无 FIGO）。
- 生成物与版本：`lib/version.js`、`lib/client.js`、`public/index.html`、`public/app.js` 同升 0.2.1；日期 2026-11-11。
- 检查链：新增 `scripts/check-agent-pane-contract.mjs .`（禁 `Boolean(conversation)` / `ensureSession({})`，
  要求 `newSession` + `defaultWorkspace` + 订阅 + 草稿桥），7/7 通过。
- **验证状态（如实）**：`npm run check` 全绿、`npm test` 6/6、`npm run audit` 39/40（1 项待人工）、
  tgz 四要素自检通过、已 `pnpm add` 装机到 `profiles/web`（装机副本 version=0.2.1 实查）。
  **界面加载与真机点击行为未验证**：需用户退出并重开 DSH Desktop、新建会话后走查（本会话按纪律不代重启）。
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
