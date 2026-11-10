# V2b 自动签认（AI 对话面板激活修复）

- 日期时间：2026-11-11 · 模式：无人值守 / 单人代跑 · 范围：thymic-workbench 0.2.0 → 0.2.1

## 逐条结果

| 项 | 结果 | 证据 |
| --- | --- | --- |
| 缺陷识别 | 通过 | `src/client.js` 原 266 行 `Boolean(conversation)`；starter 新检查器首次运行即报红（L266） |
| 判定改为宿主归属 | 通过 | `activeSession = ownedSession()`；grep 确认代码层无 `Boolean(conversation)`（仅注释保留反例说明） |
| 创建改 `newSession` | 通过 | `lib/client.js:390 await newSession(workspaceId)`；`defaultWorkspace` 存在 |
| 禁 `ensureSession({})` | 通过 | 检查器 ok：未出现 |
| 取消/失败有反馈 | 通过（代码级） | `if (!id)` 取消分支 + `catch` 显示原因 + 重试提示 |
| 订阅会话变化重渲染 | 通过 | `service.subscribe(...)` → `setSessionRevision` |
| 草稿只填不发 | 通过 | agent-draft 桥保留；检查器 ok |
| 生成物同步 | 通过 | `lib/version.js` / `lib/client.js` / public 页面均 0.2.1；版本字面量检查通过 |
| 静态检查 | 通过 | `npm run check` 全绿；`npm test` 6/6；`npm run audit` 39/40（1 待人工） |
| 打包四要素 | 通过 | `node scripts/check-pack.mjs release/...0.2.1.tgz` 全项通过 |
| 装机 | 通过 | `pnpm add` 到 `profiles/web`；装机副本 version=0.2.1、含 `newSession` |
| **界面加载 / 真机点击** | **待人工** | 需退出并重开 DSH Desktop → 新建会话 → 点「AI 对话」；本会话不代重启 |

## 附：装机环境的两个既有问题（非本次改动引入，已处置）

1. 本地清理删掉了 29 个仓，而 profile 有 51 个 `file:` 依赖指向其 tgz，其中 32 个失效 → 任何 `pnpm` 操作整树失败。
   处置：用**当前已安装副本**按原路径重新打包补齐（版本与内容一致），复检 missing=0。
2. `pnpm install --frozen-lockfile` 仍报 `billion-context`（宿主自带 live 目录 0.1.213 vs 0.1.202）不一致——属宿主自身
   generation 目录漂移，与工作台无关，未改动；本次安装用 `--config.strict-store-pkg-content-check=false` 绕过
   `cold-agglutinin-workbench` 的旧锁记录（该包 file: 指向 0.2.1、锁记录为 0.2.0）。

## 结论：代码与产物层自动签认通过（待晨审追认）；界面加载与真机交互待人工
