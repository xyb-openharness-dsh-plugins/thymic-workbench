/**
 * 包的入口：DSH 插件的服务端侧。宿主加载的就是这个文件，需要
 * `name` / `inject` / `Config` / `apply` 四样（workbench-standard §3.4）。
 *
 * 这一层只做四件事：
 * 1. 打开数据（配了 `root` 就用那个资料目录；没配就退到内存演示库，保证装上去能看见东西）；
 * 2. 过宿主鉴权（`connection.requestRejection`），不自己造登录；
 * 3. 把请求交给 `dsh/routes.js` 那张**两条链路共用**的路由表（dev-server 用的是同一份，
 *    否则本地能开、装进 Desktop 就 404）；
 * 4. 卸载时按序关库。
 *
 * 为什么 UI 走 iframe：业务界面（public/，12 个视图）是一份独立的前端，宿主只负责
 * 把它放进面板的业务区。面板本身现在是 **customFrame=true**（见 lib/layout.js 顶部注释：
 * 标准分栏下宿主不提供 AI 按钮位与拖宽接口，2026-10-21 实机反馈界面变形后改判），
 * 由 lib/client.js 自绘 header + 会话分栏，iframe 只是业务区那半边的容器。iframe 指向
 * `/api/thymic/ui/`，页面里的接口基址按自身路径推出来（见 public/app.js 的 apiBase()），
 * 所以「本地 dev-server 打开」与「装进 Desktop」用的是同一份前端，不需要两套构建。
 */
import Schema from '@deepseek-ai/schemastery'
/* M5 夜班骨架：数据事实层未实现（三态=未实现）。
   source 桩给 bootstrap（demo 标记 + 版本 + dataRoot）；profile/saveExport/导入走 404/501 如实降级。
   界面（public/）为演示数据唯一源，接口层不冒充已接通。 */
function createDemoSource({ version, build, dataRoot }) {
  return {
    db: null,
    bootstrap: () => ({ ok: true, version, build, mode: 'demo-skeleton', dataRoot,
      note: '业务数据事实层未实现：界面当前为演示数据（唯一源 public/demo-data.js），不冒充已接通。' }),
    profile: () => null,
  }
}
import { Workbench } from './workbench.js'
import { servePublic } from './server.js'
import { createApiHandler, API_PREFIX, UI_PREFIX } from './routes.js'
import { version, build } from '../lib/version.js'

export const name = 'thymic-main'
export const inject = ['webServer', 'connection']

/** 接口前缀与 UI 前缀：真身在 routes.js；这里再导出一次是为了给包检查与前端文档一个稳定入口。 */
export { API_PREFIX, UI_PREFIX }

/** Config 必须是 Schemastery schema；root 可选——不给就用内存演示库。 */
export const Config = Schema.object({
  root: Schema.string(),
})

function sendJson(res, status, body) {
  const buf = Buffer.from(JSON.stringify(body), 'utf8')
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': buf.length, 'cache-control': 'no-store' })
  res.end(buf)
}

/**
 * 数据源：配了 root 就开真库（sqlite），没配就退到内存演示库并如实声明 demo-skeleton。
 * 装进 Desktop 时 cordis.patch.yml 会注入 dataRoot，所以用户看到的是自己的库。
 */
function openDataSource(root) {
  if (typeof root !== 'string' || root.trim() === '') {
    return createDemoSource({ version, build, dataRoot: null })
  }
  const wb = new Workbench({ root })
  wb.open()
  const demo = createDemoSource({ version, build, dataRoot: root })
  return {
    ...demo,
    db: wb.db,
    bootstrap: () => ({ ...demo.bootstrap(), mode: 'sqlite', dataRoot: wb.dataRoot, profiles: wb.listProfiles() }),
    listProfiles: () => wb.listProfiles(),
    createProfile: (body) => wb.createProfile(body),
    deleteProfile: (key) => wb.deleteProfile(key),
    dataRoot: () => wb.dataRoot,
    setDataRoot: (dir) => wb.setDataRoot(dir),
    close: () => wb.close(),
  }
}

export function apply(ctx, config = {}) {
  if (!ctx.webServer?.register) throw new Error('Desktop webServer.register is unavailable')

  let source = null
  let failure = null
  try {
    source = openDataSource(config.root)
  } catch (error) {
    failure = error.message
  }
  const dispose = () => {}

  const api = createApiHandler({
    source: source ?? {
      db: null,
      bootstrap: () => { throw new Error(failure) }, // 失败态照旧抛，routes 转 503
      profile: () => null,
    },
    version,
    build,
    serveUi: (req, res, urlPath) => servePublic(req, res, urlPath),
    failure,
  })

  const handler = (req, res) => {
    // 鉴权：宿主不给结论就不放行，不自建登录态
    if (typeof ctx.connection?.requestRejection !== 'function') {
      return sendJson(res, 503, { error: 'connection authentication capability unavailable' })
    }
    const rejection = ctx.connection.requestRejection(req)
    if (rejection !== undefined) return sendJson(res, rejection, { error: 'Authentication required' })

    /* 数据源打不开时只有 /health 能回（带错误原因），其余走各自分支的 503。 */
    return api(req, res)
  }

  ctx.effect(() => {
    const dispose = ctx.webServer.register({ kind: 'prefix', path: API_PREFIX, handler })
    return () => {
      try { dispose && dispose() } catch { /* 宿主卸载时的清理失败不该盖住原错误 */ }
      if (source) { try { source.close() } catch { /* 同上 */ } }
    }
  }, 'thymic ui + api')
}
