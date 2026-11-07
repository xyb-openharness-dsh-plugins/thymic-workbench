# 项目规格 · 小橡宝 胸腺癌工作台

状态：M1 夜班版（自动签认，待晨审追认）。确认人/日期：待用户追认。0 访谈、0 临床审核声明见 USER-RESEARCH 与 CLINICAL-DATA。

## 问题、用户与最小闭环

- 服务主体：胸腺癌患者与家属（胸腺瘤不纳入首版，疾病概要教育段解释区别）。病程覆盖：确诊等待→围手术期→术后辅助/放化疗→随访→复发/晚期。
- 输入：病理与复核报告、分期医嘱原文、治疗事件、影像与化验、MG 状态、症状表达。
- 动作：录入/更正（新版本制）、查看时间线与趋势、勾选资料包、生成问题候选。
- 输出：有来源的时间线、指标趋势、复诊资料包导出（.md 真实文件）、问题候选。
- 失败恢复：录入草稿保留；更正=新增版本；导出失败可重试不丢数据。
- 成功标准：复诊前一页说清病理结论与复核分歧、双分期原文、最近影像与化验、下次复查、要问什么。

## 功能范围（12 一级页；重名率 58.3% 实测见 DIFF-MATRIX）

看板 / 病情整理（家族五 Tab 词表）/ 病理与复核★ / 分期档案★（双体系并列）/ 治疗历程 / 肌无力与免疫★ / 影像随访★ / 检查与指标 / 病情一图秀 / 症状与感受★ / 复诊准备 / 临床研究。
★=独有页。场景映射见 SCENARIOS S1–S8；路径映射见 INTERACTION-DESIGN P-01..12。暂缓项：性与生育、营养支持（不进导航，防空壳）。

## 数据与 API

实体（M3 冻结候选）：profile / pathology_report(kind=原|复核) / staging_entry(体系+版本+医生原文) / treatment_event / mg_status(单例三态) / imaging_report / lab_result / symptom_entry / doc_source / question_candidate / trial_candidate。
派生读时算：距上次/距下次、辐射次数、差值、可比分组。禁止入库：诊断结论、分期换算、疗效评估、risk_level、活动性评分。
演示数据唯一源：demo-data.js profiles{A,B}（A 刚确诊记录少，B 长期随访记录多），页面不写死数字。
外部信息合同：指南条目属第②层教育（CLINICAL-DATA 台账），来源+日期+「不代表适合你」固定口径；未取得原文的写「据二次来源」。

## 设置与配置

全局设置页（SETTING S-DESIGN 模板）：患者资料目录显示（DSH 装机后为 config.root=DSH_HOME/thymic-workbench，原型态显示"演示"）、大字模式、减少动效、数据导出。无云端凭据；MinerU 未接入（导入禁用并解释）。

## UI 与原型一致性

原型 = prototypes/v0.2 四件套 + primer 三件套（starter patterns 逐字节）。布局：左 236px 导航、中间主区、右侧 AI 面板（独立打开时演示态）。token 引用家族语义令牌。PARITY 表在 M2 后建立；偏离逐条记录。

## DSH 原生 AI 对话入口与面板

装机态：customFrame + 右侧原生面板（默认 35%，25–45% 可拖可收）；原型独立态：右侧演示面板明说「未接通·不会发送」。agent-draft 协议 type=`thymic-workbench:agent-draft`。详情 prompts/DSH-AGENT-PANE-INTEGRATION.md；装机实测证据 M6 补。

## HTML原型先行

原型路径 /prototypes/v0.2/index.html（file:// 双击可开）；hash 与预览证据 M2 落盘 PROTOTYPE-REVIEW.md。用户确认：**待确认（夜班自动签认≠用户确认，不进入生产业务开发之外的宣称）**。M2 原型即本夜最高交付物之一；M5 开发版按同口径实现。

## 数据模型演进关口

G2 后冻结 schema/0001_initial.sql + freeze-contract(sha256)。演进预案：新增指标→定义目录+观察记录（不迁移）；新分期体系版本→staging_entry 加版本值（不加列）；新报告类型→pathology_report.kind 扩值。导航重组不动事实表。

## 实施与验证

M2 原型→G2；M3 schema→G3；M4 临床库（fetch 脚本+四件套）；M5 开发版（cervical 客户端链路底本七步移植+check 链）；M6 装机（实际 DSH Desktop 不可用则如实"未验证"）；M7 发布草稿；M8 回填草稿；M9 回流。

## 交付与发布

本夜交付止于：tag/release 草稿（docs/release-draft/）、BACKLOG 回填 PR 草稿，不公开发布、不投稿市场（未授权，写"不适用"）。
