# DEV-PLAN · 小橡宝 胸腺癌工作台

版本：v0.1.0（夜班 M0–M9 自主执行）· 维护者：夜班自动代理 · 晨审待追认
目标仓：xyb-openharness-dsh-plugins/thymic-workbench（私有）

## 一、领取理由（2026-11-08 01:04 自动领取）

- BACKLOG NCCN #39「胸腺瘤和胸腺癌 / Thymomas and Thymic Carcinomas」状态列 ⬜ 未认领，级别 T1，目录版本 2.2025。
- 认领 issue：xyb-openharness-dsh-plugins/.github#50（维护者预置的认领申请卡，含分级判定卡六项与差异化矩阵草案，本次按其范围先做胸腺癌试点，胸腺瘤不纳入首版）。
- 评论 /claim 后等待约 2 分钟无机器人回执（对照同夜其他 issue 亦无），按 admin 权限自查补 `claim,claimed` 标签；事实记录于本文件与晨审报告，不表述为维护者确认。
- 与已有仓差异化：MDS（#63）、软骨发育不全（#60）本地仓均已由前几轮完成 M9（其 issue 标签未同步），不可重领；家族现有 28+ 仓中无前纵隔肿瘤线，胸腺癌是首个以「病理复核 + 双分期体系过渡冲突 + 重症肌无力合并症」为核心线的仓。
- 随访天然结构化：病理/复核/分期/影像/化验均有报告形态，可成时间线。

## 二、参考基准（写死，见 Q2）

- 移植样板（客户端链路底本）：cervical-workbench/prototypes/v0.2
- 成熟对比基准（26 号口径）：breast-cancer-workbench/prototypes/v0.4
- 结构基准补充：aml-workbench/prototypes/v0.2（#mind/mind-burden 心智负担线、时间线事件泳道）
- 家族共享组件只从 starter 取：assets/patterns/disease-primer.js（与 breast v0.4/primer.js 逐字节一致，已 diff 验证）
- 只抄结构与元素体系，不抄病种语义；肿瘤通用语（分期、线序）在胸腺癌语境内的使用逐条过红线。

## 三、里程碑状态（每完成一项更新）

| 里程碑 | 状态 | 结论/证据 |
| --- | --- | --- |
| 领取 | 完成 01:04 | issue#50 /claim 评论 + claimed 标签（自查补） |
| M0 骨架 | 完成 | init 221 文件 + cordis.patch.yml config.root + 文档九件 + 基线 check exit=0 |
| M1 调研与 SPEC | 完成 | 三路调研（NCCN 2.2025 / CACA V2.0_2025 / NMPA 无专门适应证 / 患者证据 B 级）；DIFF-MATRIX 重名率 66.7% 实测；G1 自动签认（待追认） |
| M2 原型 | 进行中 | prototypes/v0.2 四件套 + primer 三件套 + 两套档案 A/B |
| M3 数据模型 | 待开始 | |
| M4 临床库 | 待开始 | |
| M5 开发版 | 待开始 | |
| M6 装机 | 待开始 | |
| M7 发布 | 待开始 | 冻结为草稿 |
| M8 回填 | 待开始 | 备 PR 草稿 |
| M9 回流 | 待开始 | |

## 四、夜班默认值（无人值守，晨审追认）

见 docs/DEV-REQUIREMENTS.md §五。要点：品牌占位名「小橡宝 ThymPal」；服务主体=胸腺癌患者与家属（胸腺瘤不纳入首版，病名教育中区分）；MinerU 未接入，报告导入走手工录入+AI 候选；病程覆盖=确诊等待→围手术期→术后辅助→复发/晚期。

## 五、本夜不做的

市场投稿、公开发布、向他人仓推送、删除既有 issue/仓库；任何「用户已确认」表述。
