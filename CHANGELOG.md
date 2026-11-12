## 0.2.2 — 2026-11-12

三缺口批量补齐（本仓原为 demo-skeleton：`createDemoSource` 的 `db` 恒为 null，schema 0001 从未被打开）：

- **数据层从桩变真库**：新增 `dsh/store.js`（幂等迁移/ledger/sha256）与 `dsh/workbench.js`（listProfiles/createProfile/deleteProfile/dataRoot/setDataRoot）；`openDataSource` 配了 `config.root` 就开 sqlite，没配仍退内存演示库并如实声明 `demo-skeleton`。
- **新建患者档案**：档案弹窗加「＋ 新建我的档案」→ `POST /api/thymic/api/profiles` → `INSERT INTO profile(..., is_demo=0)` → 立刻切到新档案（空记录起步，各页走空态不白屏）；demo 档案不删不改。
- **多档案**：`GET /api/thymic/api/profiles`；`DELETE` 只作用于 `is_demo=0`，未命中返回 `deleted:null` + 原因（不回 200 假装删了）。
- **资料目录真入口**：面板顶栏「配置目录」→ `pickDirectory` → 口径硬拒（主目录/桌面/下载根/tmp，客户端+服务端 `checkDataDir` 双判）→ `POST /api/thymic/api/root` 落盘回显，重开仍在（`0002` 迁移的 `app_setting`）；页面「更改位置…」改为指向面板按钮。
- **临床试验补四段**：线索页新增「参与匹配的已确认字段」（只列 confirmed 的分子/病理/分期）+ 关键词检索 + 每条结果的证据行（`? 待确认 — 快照未含入排原文`）+ 「需补充信息 / 暂无可对照项（不编百分数）/ 不是入组资格」声明；空态写「查不到 ≠ 没有研究」。
- 修：`public/app.js` 里两处调用 `apiBase()` 但全仓没有定义（打开设置会 ReferenceError）——补上按自身路径推导的实现。
- 迁移：`schema/0002_profiles.sql`（`ALTER TABLE profile ADD COLUMN is_demo` + `app_setting`，只增不改）。
- 校验：三闸门全绿；`npm run check` 全绿；`audit 39/40`（0 失败，1 待人工）；页面版本字面量同步 0.2.2。
- 运行时实测（本机 stub 宿主）：空库 profiles `[]` → 新建 → `isDemo:false` 落库；`{/tmp}→400`；`{专用目录}→200` 持久；删自建 `200`；删 demo `deleted:null`。

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
