# DEV-REQUIREMENTS · 工程约定（M0–M9 夜班版）

## §一 硬约束

1. 原型是唯一视觉与交互基准（prototypes/v0.2），开发版逐项对齐；偏离写 PARITY。
2. 事实与演示数据各有唯一来源：业务数据 config.root（DSH_HOME/thymic-workbench）；演示数据 demo-data.js 唯一源，页面不写死数字。
3. 没有实测不写通过；结论三态：实测通过/骨架/未实现。
4. 禁词（全站 grep=0）：预后、生存期、治愈、缓解率自动判定、"您是/诊断为"判定句；AFP/β-hCG 必须带"鉴别参考"标注。
5. 分期双体系并列不换算：无换算按钮、无换算列、无自动推断。
6. MG 求助口径：只用患者与医生已确认的行动计划原话；无则【待核】占位。
7. 改包必升版；public 与原型逐字符 parity；无判读列入 schema。

## §二 检查链

npm run check = 语法 + 单测 + 版本四处同源 + schema 断言 + 红线词 + 无底本残留 + primer 数据检查（36 号）。M2 起加探针：probe-disease-primer.mjs（必须跑 prototypes/v0.2 本体，不跑 starter examples——本轮教训 L1）。新增断言先证非空再比较（check-assertion-strength 教训）。

## §三 版本

版本四处同源：package.json / VERSION / 原型 ver-chip / README。本夜版本线：0.1.0（M0）→ 原型 v0.2.0 → 开发版 0.1.1-rc.1。

## §四 隐私

私密记录三出口过滤（导出/AI 上下文/摘要预览）共用一个函数；私密改写的问题同样算私密；更正保留历史版本，版本自带私密标记。

## §五 可回退默认值（无人值守，晨审追认）

| 默认值 | 取值 | 回退方式 |
| --- | --- | --- |
| 品牌占位名 | 小橡宝 ThymPal（橡：胸腺 thymus 与百里香/橡叶意象占位） | 用户改名只动 brand 字段与 README 首段 |
| 服务主体 | 胸腺癌患者与家属；胸腺瘤不纳入首版 | 扩范围时加 profiles 与导航页，schema 已留 kind |
| MinerU | 未接入；报告导入=手工录入+AI 候选通道 | 接入时按 18 号六部件增量加，不动事实层 |
| 病程覆盖 | 确诊等待→围手术期→术后辅助→复发/晚期 | 数据模型按事件日期组织，天然覆盖扩展 |
| 资料目录 | DSH_HOME/thymic-workbench（装机后）；原型态演示目录 | 用户明确指定后改 config.root 参数 |
| 语言/品牌色 | 中文；主色占位用家族语义 token（oak 深绿灰） | 换 token 文件即可 |

## §六 本夜教训（M9 已回流 starter L70–L73，rc.25）

- L1：probe-disease-primer 默认目标是 starter examples——本仓新探针（probe-thymic-m2）默认对象=本仓原型，并加横幅提醒（回流 L70）。
- L2：/claim 机器人夜间不在线——限时 2 分钟→admin 自查补标签→留痕待追认（回流 L73）。
- L3：子代理并发受限——批量检索改内联有界（≤3 次）+ 本地 grep。
- L4：check-probe-coverage 全量探针名写死 probe-aml-m2.mjs——改本仓名 + 探针内嵌 COVERED 清单与 ROUTES 比对 + self-test（回流 L70）。
- L5：build-client 布尔注入带引号骗过宿主合同判据——布尔字面量直注（回流 L71）。
- L6：trial 快照必须按 check-trial-snapshot 家族合同出四件套（回流 L72）。
- L7：check-pack 测 MinerU token 必须显式 home/env 注入——宿主 shell 可能有真实 MINERU_TOKEN/CERVIPAL_MINERU_SECRET（本仓 scripts/check-pack.mjs 实测踩到）。
