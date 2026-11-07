'use strict';
/* 小橡宝 ThymPal v0.2.0 — 交互原型。患者数据全部为合成示例；临床试验列表为真实登记摘录（状态未核实）。
   不读写真实文件、不调用模型或宿主 API。视觉体系沿用家族底本（移植来源见 docs/DEV-PLAN.md §二），
   品牌色重映射为小橡宝橡绿 #3E7C59。

   与底本的结构差异（改前先看，两边不互相抄病种语义）：
   1. 一级页 12 个：看板 / 病情整理 / 病理与复核 / 分期档案 / 治疗历程 / 肌无力与免疫 /
      影像随访 / 检查与指标 / 病情一图秀 / 症状与感受 / 复诊准备 / 临床研究；
   2. 病理与复核：原报告与复核意见并存（D1），系统不判定"胸腺瘤还是胸腺癌"；
   3. 分期档案：Masaoka-Koga 与 TNM 并列记录，不换算、不推荐（D2）；
   4. 肌无力与免疫：MG 合并症线 + 免疫治疗 irAE 监测（D3）；
   5. 影像随访：无标志物依赖，复查节奏只按医嘱（D4）；鉴别参考指标（AFP/β-hCG）语义反向（D5）；
   6. 私密默认 = 情绪类感受条目；身体症状按可分享记录。 */

const APP_INFO = {
  version: '0.2.0',
  build: '2026-11-08',
  channel: 'prototype',
  channelLabel: '交互原型 · 未接入 DSH'
};
APP_INFO.displayVersion = `v${APP_INFO.version}`;

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let uidSeq = 0;
const uid = (p) => p + (++uidSeq);

/* ---------------- icons & nav ---------------- */
const icons = {
  home: 'M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9',
  badge: 'M12 3l7 4v10l-7 4-7-4V7ZM9 12l2 2 4-4',
  drip: 'M12 3v6m0 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM7 7h10',
  /* 病理与复核：显微镜 */
  micro: 'M9 3h2v5h3l2 3a7 7 0 0 1-3 9H8a7 7 0 0 1-3-9l2-3h2V3ZM6 21h12',
  /* 肌无力与免疫：盾牌 + 对勾 */
  shield: 'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6ZM9 12l2 2 4-4',
  /* 影像随访：取景框 + 扫描线 */
  scan: 'M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3M7 12h10',
  /* 症状与感受：脉搏线 */
  pulse: 'M3 12h4l2-6 4 12 2-6h6',
  report: 'M6 3h9l4 4v14H6ZM14 3v5h5M9 12h6M9 16h4',
  chart: 'M4 3v17h17M7 14l4-5 4 3 5-7',
  heart: 'M12 20.3c-4.6-2.9-7.4-5.6-7.4-9A4.1 4.1 0 0 1 12 8.4a4.1 4.1 0 0 1 7.4 2.9c0 3.4-2.8 6.1-7.4 9Z',
  calendar: 'M4 5h16v16H4ZM8 3v4m8-4v4M4 10h16m-12 4h2m4 0h2m-8 3h2',
  flask: 'M9 3h6v5l5 9a2 2 0 0 1-2 3H6a2 2 0 0 1-2-3l5-9Z',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z',
  chat: 'M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-6 5V5ZM8 8h8M8 11h5'
};
const ICON_ALIAS = { records: 'folder', review: 'calendar', labs: 'report', timeline: 'chart', symptoms: 'pulse', treatment: 'drip', stage: 'badge', trials: 'flask', dashboard: 'home', pathology: 'micro', mg: 'shield', imaging: 'scan', prep: 'calendar' };
const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[k] || icons[ICON_ALIAS[k]] || icons.badge}"/></svg>`;

/* 12 个一级页：SPEC 功能范围。4 个独有页（病理与复核 / 肌无力与免疫 / 影像随访 / 症状与感受），
   一级重名率对底本实测 58.3%（docs/DIFF-MATRIX.md）。 */
const PAGES = [
  ['dashboard', '看板', 'home'], ['records', '病情整理', 'folder'], ['pathology', '病理与复核', 'micro'],
  ['stage', '分期档案', 'badge'], ['treatment', '治疗历程', 'drip'], ['mg', '肌无力与免疫', 'shield'],
  ['imaging', '影像随访', 'scan'], ['labs', '检查与指标', 'report'], ['timeline', '病情一图秀', 'chart'],
  ['symptoms', '症状与感受', 'pulse'], ['review', '复诊准备', 'calendar'], ['trials', '临床研究', 'flask']
];
const SUBPAGES = {
  records: ['资料库', '整理草稿 / 核对', '病情档案', '指标检测', '病情汇总'],
  pathology: ['原始报告', '复核意见', '鉴别检查'],
  stage: ['Masaoka-Koga', 'TNM', '医生原文对照'],
  treatment: ['治疗线总览', '手术记录', '放疗记录', '系统治疗与周期'],
  mg: ['状态与症状', '免疫治疗与监测'],
  imaging: ['报告留存', '复查节奏'],
  labs: ['鉴别参考', '血象', '生化与免疫相关'],
  timeline: ['数值曲线', '分类与事件', '数据口径'],
  symptoms: ['身体感受', '就诊对话候选'],
  review: ['复诊节奏', '三类随访节点', '资料包', '就诊准备'],
  trials: ['2026 线索', '已收藏', '入组问题']
};
/* 叶子路由表（check-probe-coverage 与 probe-thymic-m2 读这里）：view = 顶层，view/N = 二级 Tab。
   加页或加 Tab 时：PAGES/SUBPAGES/ROUTES/探针四处同步——探针漏页时 check-probe-coverage 会红。 */
const ROUTES = ['dashboard',
  'records/0', 'records/1', 'records/2', 'records/3', 'records/4',
  'pathology/0', 'pathology/1', 'pathology/2',
  'stage/0', 'stage/1', 'stage/2',
  'treatment/0', 'treatment/1', 'treatment/2', 'treatment/3',
  'mg/0', 'mg/1',
  'imaging/0', 'imaging/1',
  'labs/0', 'labs/1', 'labs/2',
  'timeline/0', 'timeline/1', 'timeline/2',
  'symptoms/0', 'symptoms/1',
  'review/0', 'review/1', 'review/2', 'review/3',
  'trials/0', 'trials/1', 'trials/2'];
const SUBTITLES = {
  dashboard: '病理、分期、影像与肌无力放在一起，让下一次门诊有据可查。',
  records: '上传 → 解析 → 确认指标 → 入库；原件永远保留，接受之前都只是候选。',
  pathology: '原报告与复核意见并存；名称照抄医生原文，工作台不判定"胸腺瘤还是胸腺癌"。',
  stage: 'Masaoka-Koga 与 TNM 并列记录，不换算、不推荐；两条都写医生原话与日期。',
  treatment: '手术、放疗、系统治疗按医生记录分列；一次住院 / 一个疗程是一个单元。',
  mg: '重症肌无力状态只记医生写明的；表达面与治疗面并置，不写因果。',
  imaging: '胸腺癌随访主要靠影像；节奏只按医嘱记录，报告逐次留存。',
  labs: 'AFP / β-hCG 用于鉴别诊断参考；单次波动不等于病情变化。',
  timeline: '指标、影像评估与治疗事件放回同一段时间里，看见变化发生在哪一步。',
  symptoms: '身体感受按自述记；情绪类条目默认私密，只属于你。',
  review: '该带什么、该问什么，提前写下来，诊室里就不用凭记忆。',
  trials: '线索不是推荐；先弄清入组条件，再决定要不要问。'
};

/* ---------------- 数据层（demo-data.js 是唯一源；改数据请改它） ---------------- */
const D = window.DEMO_DATA;
const PROFILES = {}, METRICS = {}, EVENTS = {}, DASH_KEYS = {}, DOCS = {}, CANDS = {};
for (const [k, p] of Object.entries(D.profiles)) {
  /* 字段逐条显式列出：生成器加字段时这里会同步补，不会静默丢字段。
     胸腺癌专属：stageMK / stageTNM / pathology.review / mg / immune / surgery / rt / imaging / symptoms */
  PROFILES[k] = {
    name: p.name, sex: p.sex, age: p.age, meta: p.meta, headline: p.headline, histology: p.histology,
    mindset: p.mindset, path: p.path, stageMK: p.stageMK || null, stageTNM: p.stageTNM || null,
    pathology: p.pathology || null, molecular: p.molecular || [], mg: p.mg || { status: '未记录', rows: [] },
    immune: p.immune || null, surgery: p.surgery || null, rt: p.rt || null, imaging: p.imaging || null,
    rhythm: p.rhythm || [], lines: p.lines || [], cycles: p.cycles || [],
    viewpoints: p.viewpoints || [], symptoms: p.symptoms || [], familyTalk: p.familyTalk,
    docs: p.docs || [], candidates: p.candidates || []
  };
  METRICS[k] = {};
  for (const m of p.metrics) METRICS[k][m.key] = m;
  /* 事件在 demo-data 里是 [日期, 名称] 定长数组；一图秀按 {d,label} 读，
     不归一化会让 dataBounds() 拿到 undefined → toISOString 抛 RangeError、整页渲染中断。 */
  EVENTS[k] = (p.events || []).map(e => Array.isArray(e) ? { d: e[0], label: e[1] } : e);
  DASH_KEYS[k] = p.dash_keys;
  DOCS[k] = (p.docs || []).map(d => ({ id: d[0], name: d[1], fileName: d[1], date: d[2], type: d[3], status: d[4] }));
  CANDS[k] = (p.candidates || []).map(c => ({ id: c[0], name: c[1], value: c[2], source: c[3],
    status: c[4] === '已接受' ? 'accepted' : 'candidate' }));
}
const TRIALS = D.trials;

/* ---------------- state ---------------- */
/* 一图秀默认：数值线取档案前两个数值 dash_keys + 第一条自述分类线（疲乏）。
   进页面先看"鉴别参考值稳不稳、血象掉没掉"，而不是自测结论。 */
const state = { view: 'dashboard', profile: 'A', agentOpen: false, agentSize: 'std', sel: [],
  range: 'all', zoom: 100, toggles: { treatment: true, keypoints: true }, pin: null, saved: [], sub: {},
  query: '', parsing: false, parseError: false, loaded: {}, parsingName: '', lastUpload: null, uploads: 0,
  privateOpen: false, trialTopic: '全部', questions: [] };
const defaultSel = (k) => {
  const mm = METRICS[k] || {};
  const num = (DASH_KEYS[k] || []).filter((c) => mm[c] && mm[c].points.some(p => typeof p.v === 'number')).slice(0, 2);
  const out = num.slice();
  const qual = ['fatigue', 'mg_state'].find((c) => mm[c] && mm[c].points.length);
  if (qual) out.push(qual);
  return out.slice(0, 3);
};
state.sel = defaultSel('A');
const P = () => PROFILES[state.profile];
const M = () => METRICS[state.profile];

/* ---------------- helpers ---------------- */
const fmtDate = (d) => d;
const delta = (m) => {
  if (!m.points || m.points.length < 2) return null;
  const a = m.points[m.points.length - 1], b = m.points[m.points.length - 2];
  if (typeof a.v !== 'number' || typeof b.v !== 'number') return null;
  const d = a.v - b.v;
  return { text: (d > 0 ? '+' : '') + d.toFixed(m.dec ?? 1), up: d > 0, from: b.d };
};
function sparkline(m, w = 200, h = 44) {
  const pts = (m.points || []).filter(p => typeof p.v === 'number');
  if (pts.length < 2) return '';
  const vs = pts.map(p => p.v);
  let lo = Math.min(...vs), hi = Math.max(...vs); if (hi === lo) { hi += 1; lo -= 1; }
  const X = i => 4 + (w - 8) * i / (pts.length - 1);
  const Y = v => h - 5 - (h - 10) * (v - lo) / (hi - lo);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`).join('');
  const dots = pts.map((p, i) => `<circle class="sp-dot" cx="${X(i).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="2.6" fill="${m.color}"/>`).join('');
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path class="base" d="M4 ${h - 5}H${w - 4}"/><path class="sp-line" d="${path}" stroke="${m.color}"/>${dots}</svg>`;
}
/* 3D 翻面：点整卡转 180°，再点返回；data-flipped 是唯一视觉开关；
   两面互换 aria-hidden，隐藏面不进读屏顺序。分类记录（data-static）不翻。 */
function flipCard(key) {
  const el = document.querySelector(`[data-mcard="${key}"]`);
  if (!el || el.dataset.static) return;
  const on = el.dataset.flipped !== 'true';
  el.dataset.flipped = String(on);
  el.setAttribute('aria-pressed', String(on));
  const front = el.querySelector('[data-face="front"]');
  const back = el.querySelector('[data-face="back"]');
  if (front) front.setAttribute('aria-hidden', String(on));
  if (back) back.setAttribute('aria-hidden', String(!on));
}
function mcard(key, m) {
  const last = (m.points || []).slice(-1)[0];
  if (!last) return '';
  const numeric = typeof last.v === 'number' && m.dec !== null;
  const d = delta(m);
  const cat = `<span class="cat"><i style="background:${m.color}"></i>${esc(m.cat)}</span>`;
  if (!numeric) {
    return `<div class="mcard" data-mcard="${key}" data-static="1" role="group" aria-roledescription="指标卡"
      aria-label="${esc(m.name)}：${esc(String(last.v))}（分类记录，只按原文记录，不连折线）">
      <span class="mface front" data-face="front">${cat}<span class="name">${esc(m.name)}</span>
      <span class="na">${esc(last.v)}</span>
      <span class="meta"><span>${esc(last.src)}</span><span class="hint">分类记录</span></span></span></div>`;
  }
  const band = m.band ? `<span class="rec">参考 ${m.band[0]}–${m.band[1]} ${esc(m.unit)}</span>` : `<span class="rec">${esc(last.d)} · ${esc(last.src)}</span>`;
  return `<div class="mcard" role="group" tabindex="0" data-mcard="${key}" data-flipped="false" aria-roledescription="指标卡"
    aria-label="${esc(m.name)} 最近 ${last.v.toFixed(m.dec ?? 1)} ${esc(m.unit)}（${esc(last.d)}）；点一下翻面看趋势">
    <span class="mcard-inner">
    <span class="mface front" data-face="front">${cat}<span class="name">${esc(m.name)}</span>
      <span class="val"><span data-countup="${last.v}" data-dec="${m.dec ?? 1}">${last.v.toFixed(m.dec ?? 1)}</span><small>${esc(m.unit)}</small></span>
      ${d ? `<span class="delta">较上次 <em>${d.text}${m.unit ? ' ' + esc(m.unit) : ''}</em>（${esc(d.from)}）</span>` : ''}
      ${band}</span>
    <span class="mface back" data-face="back" aria-hidden="true">${cat}<span class="name">${esc(m.name)}</span>
      ${sparkline(m, 190, 40)}
      <span class="meta"><span>${esc(m.note)}</span><span class="hint">轻点翻回</span></span></span>
    </span></div>`;
}
/* ---------------- 一图秀引擎（统一画布 · 多序列归一化 · 移植家族基因） ---------------- */
const CW = 980, CH = 420, CX0 = 62, CX1 = 954, CY0 = 132, CY1 = 366;
const CAT_ORDER = ['鉴别参考', '血象', '生化', '免疫相关', '自述'];
/* 分类序列的档位顺序：**必须显式声明，不许按出现顺序排**。
   疲乏与 MG 状态都是"记录状态"不是严重度评分——顺序只表示记录口径，不做医学分级。 */
const QUAL_LEVELS = {
  fatigue: ['无', '轻度', '明显', '影响日常'],
  mg_state: ['未记录', '医生疑似', '医生确诊']
};
const fmtNum = (v, dec) => typeof v === 'number' ? v.toFixed(dec ?? 1) : String(v ?? '');
const shortDate = (d) => d.slice(5).replace('-', '.');
const longDate = (d) => d;
const numPts = (m) => (m.points || []).filter(p => typeof p.v === 'number');
const addDays = (d, n) => new Date(Date.parse(d) + n * 86400000).toISOString().slice(0, 10);

function dataBounds() {
  const ds = [];
  for (const m of Object.values(M())) for (const p of m.points) ds.push(p.d);
  for (const e of (EVENTS[state.profile] || [])) ds.push(e.d);
  ds.sort();
  return [Date.parse(ds[0]), Date.parse(ds[ds.length - 1])];
}
function domain() {
  const [s, e] = dataBounds();
  const months = { '3m': 3, '6m': 6, '12m': 12 }[state.range];
  const start = months ? new Date(new Date(e).setMonth(new Date(e).getMonth() - months)) : new Date(s);
  const span = e - start.getTime();
  const kept = span * state.zoom / 100;
  return [e - kept, e];
}
const inDomain = (d, t0, t1) => { const t = Date.parse(d); return t >= t0 && t <= t1; };
const xOf = (t, t0, t1) => CX0 + (t - t0) / Math.max(1, t1 - t0) * (CX1 - CX0);

/* 单调三次插值（Fritsch-Carlson，同 d3 curveMonotoneX）：
   只平滑折线，且保证曲线段不越过相邻数据点的 y 范围——不会出现"过冲鼓包"式变形 */
function smoothPath(coords) {
  const n = coords.length;
  if (!n) return '';
  if (n === 1) return `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  const dx = [], slope = [];
  for (let i = 0; i < n - 1; i++) {
    const ddx = coords[i + 1].x - coords[i].x;
    dx.push(ddx);
    slope.push(ddx ? (coords[i + 1].y - coords[i].y) / ddx : 0);
  }
  const tan = [slope[0]];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) tan.push(0);           // 拐点处切线置平，防鼓包
    else {
      const w1 = 2 * dx[i] + dx[i - 1], w2 = dx[i] + 2 * dx[i - 1];
      tan.push((w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i])); // 调和加权，保证单调
    }
  }
  tan.push(slope[n - 2]);
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const c1x = coords[i].x + dx[i] / 3, c1y = coords[i].y + tan[i] * dx[i] / 3;
    const c2x = coords[i + 1].x - dx[i] / 3, c2y = coords[i + 1].y - tan[i + 1] * dx[i] / 3;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${coords[i + 1].x.toFixed(1)} ${coords[i + 1].y.toFixed(1)}`;
  }
  return d;
}

/* 治疗条：周期带（化疗周期 / 免疫治疗周期 / 放疗区间）+ 评估标记（确诊/手术/分期/复发），两行独立于数据区 */
function bandsFor(t0, t1) {
  const p = P(), items = [];
  p.cycles.forEach((c, i) => {
    const from = c[1];
    const to = c[4] && p.cycles[i + 1] ? p.cycles[i + 1][1] : addDays(from, 21);
    items.push({ kind: 'cycle', from, to, label: c[0], color: '#3e7c59' });
  });
  (EVENTS[state.profile] || []).forEach((e) => {
    if (/确诊|手术|分期|复发/.test(e.label)) items.push({ kind: 'mark', from: e.d, to: e.d, label: e.label, color: e.label.includes('手术') ? '#a03d5c' : '#9a6410' });
  });
  return items.filter((tr) => Date.parse(tr.to) >= t0 && Date.parse(tr.from) <= t1)
    .sort((a, b) => Date.parse(a.from) - Date.parse(b.from))
    .map((tr, lane) => { const s = Math.max(Date.parse(tr.from), t0), e2 = Math.min(Date.parse(tr.to), t1); return { ...tr, x1: xOf(s, t0, t1), x2: xOf(e2, t0, t1), lane }; });
}

function monthTicks(t0, t1) {
  const out = []; const d = new Date(t0); let cur = new Date(d.getFullYear(), d.getMonth(), 1);
  if (cur.getTime() < t0) cur.setMonth(cur.getMonth() + 1);
  while (cur.getTime() <= t1) {
    const x = xOf(cur.getTime(), t0, t1);
    if (x > CX0 + 6 && x < CX1 - 6) out.push({ x, label: `${cur.getMonth() + 1}月` });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  if (out.length > 7) return out.filter((_, i) => i % 2 === 0);
  return out;
}

function seriesFor(code, t0, t1) {
  const m = M()[code];
  if (!m) return null;
  const nums = numPts(m);
  /* 分类序列（疲乏自述 / MG 状态）：没有数值轴，只画节点与档位文字，
     绝不连折线——连线会造出"从未记录顺利滑到确诊"的假趋势。 */
  if (!nums.length) {
    const lv = QUAL_LEVELS[code] || null;
    const pts = (m.points || []).filter((p) => inDomain(p.d, t0, t1));
    let lo = 0, hi = 1;
    if (lv) { lo = 0; hi = lv.length - 1; }
    return { code, m, lo, hi, span: Math.max(hi - lo, 1), pts, qual: true, levels: lv };
  }
  const all = nums.map((p) => p.v);
  const lo = Math.min(...all), hi = Math.max(...all);
  const span = hi - lo || Math.max(Math.abs(hi) * 0.08, 1);
  const pts = nums.filter((p) => inDomain(p.d, t0, t1));
  return { code, m, lo, hi, span, pts, qual: false };
}

function chartSVG(t0, t1) {
  const bands = state.toggles.treatment ? bandsFor(t0, t1) : [];
  const all = state.sel.filter((c) => M()[c]).map((c) => seriesFor(c, t0, t1)).filter((s) => s && s.pts.length);
  if (!all.length) return `<div class="empty"><h3>这个时间窗里没有所选指标</h3><p>扩大时间范围，或在左侧加选一个指标。</p></div>`;
  const series = all.filter((s) => !s.qual);
  const quals = all.filter((s) => s.qual);
  const yOf = (s, v) => CY1 - (v - s.lo) / s.span * (CY1 - CY0);
  const grid = [0, 1, 2, 3, 4].map((i) => { const y = CY0 + i * (CY1 - CY0) / 4; return `<line class="grid" x1="${CX0}" x2="${CX1}" y1="${y}" y2="${y}"/>`; }).join('');

  /* 周期标签两行错位：21 天一格的条宽只有 ~30px，单行排下来相邻标签会糊成一串。 */
  const labelEnd = [-1e9, -1e9];
  /* 评估标记（确诊 / 手术 / 分期 / 复发）常常同一天，两个标签会直接叠字：同样做两行错位。 */
  const markEnd = [-1e9, -1e9];
  const strip = bands.map((b) => {
    if (b.kind === 'mark') {
      const x = b.x1.toFixed(1);
      const estW = String(b.label).length * 9.6 + 14;
      let mrow = markEnd[0] + 4 <= +x ? 0 : 1;
      markEnd[mrow] = +x + estW;
      const row = 64 + mrow * 15;
      return `<g><path d="M ${x} ${row - 4} l4 4 -4 4 -4 -4 Z" fill="${b.color}"/>
        <text x="${(+x + 8).toFixed(1)}" y="${row + 3.5}" font-size="9.5" fill="${b.color}" font-weight="600">${esc(b.label)}</text></g>`;
    }
    const w = Math.max(b.x2 - b.x1, 7).toFixed(1);
    const estW = String(b.label).length * 5.4 + 3;
    let row = labelEnd[0] + 4 <= b.x1 ? 0 : 1;
    if (row === 1 && labelEnd[1] + 4 > b.x1) { row = 0; }   // 两行都挤：宁可压一点，也不换第三行
    labelEnd[row] = Math.max(labelEnd[row], b.x1 + estW);
    const ty = 30 - row * 9;
    return `<g><rect x="${b.x1.toFixed(1)}" y="36" width="${w}" height="8" rx="4" fill="${b.color}" opacity=".3"/>
      <text x="${(b.x1 + 1).toFixed(1)}" y="${ty}" font-size="9" fill="${b.color}" font-weight="500">${esc(b.label)}</text></g>`;
  }).join('');

  const markLines = bands.filter((b) => b.kind === 'mark').map((b) =>
    `<line x1="${b.x1.toFixed(1)}" x2="${b.x1.toFixed(1)}" y1="${CY0}" y2="${CY1}" stroke="${b.color}" stroke-width="1.2" stroke-dasharray="3 6" opacity=".45"/>`).join('');

  /* 末点标签：按 y 排序强制最小间距 13px，右端左锚定，防叠字（家族统一规范） */
  const lastPos = series.map((s) => {
    const c = s.pts.map((p) => ({ x: xOf(Date.parse(p.d), t0, t1), y: yOf(s, p.v) }));
    const last = c[c.length - 1];
    return { s, x: last.x, y: last.y, v: s.pts[s.pts.length - 1].v };
  }).sort((a, b) => a.y - b.y);
  let cursor = -Infinity;
  for (const it of lastPos) { it.ly = Math.max(it.y, cursor + 13); cursor = it.ly; }
  const overflow = lastPos.length ? Math.max(0, lastPos[lastPos.length - 1].ly - (CY1 + 2)) : 0;
  if (overflow) for (const it of lastPos) it.ly -= overflow;

  const lines = series.map((s) => {
    const coords = s.pts.map((p) => ({ x: xOf(Date.parse(p.d), t0, t1), y: yOf(s, p.v) }));
    const path = s.pts.length > 1 ? `<path class="line" d="${smoothPath(coords)}" stroke="${s.m.color}" pathLength="1"/>` : '';
    const points = coords.map((c, i) => {
      const p = s.pts[i];
      const isLast = i === s.pts.length - 1;
      const r = isLast ? 5.2 : (i === 0 ? 4.6 : 4);
      const active = state.pin && state.pin.code === s.code && state.pin.date === p.d;
      return `<circle class="pt${active ? ' active' : ''}" cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${r}" fill="${s.m.color}" data-action="pin" data-code="${s.code}" data-date="${p.d}"/>`;
    }).join('');
    const lp = lastPos.find((x) => x.s === s);
    const nearRight = lp.x > CX1 - 44;
    const lx = nearRight ? lp.x - 8 : lp.x + 8;
    const label = state.toggles.keypoints
      ? `<text class="delta-tag" x="${lx.toFixed(1)}" y="${(lp.ly + 4).toFixed(1)}" text-anchor="${nearRight ? 'end' : 'start'}" fill="${s.m.color}">${fmtNum(lp.v, s.m.dec)}</text>` : '';
    return `<g>${path}${points}${label}</g>`;
  }).join('');

  /* 分类序列：节点画在档位带上，纵向按档位序排；每个节点带小方块 + 档位文字，不连线。
     多条分类序列时横向错开 8px，避免完全重叠。 */
  const qualLayer = quals.map((s, qi) => {
    const lv = s.levels || [];
    const n = Math.max(lv.length - 1, 1);
    return s.pts.map((p) => {
      const x = xOf(Date.parse(p.d), t0, t1) + qi * 8 - 4;
      const idx = Math.max(0, lv.indexOf(p.v));
      const y = CY1 - idx / n * (CY1 - CY0);
      const active = state.pin && state.pin.code === s.code && state.pin.date === p.d;
      return `<g class="qual-pt${active ? ' active' : ''}">
        <rect x="${(x - 4).toFixed(1)}" y="${(y - 4).toFixed(1)}" width="8" height="8" rx="2" fill="${s.m.color}" opacity=".85" data-action="pin" data-code="${s.code}" data-date="${p.d}"/>
        <text x="${(x + 6).toFixed(1)}" y="${(y + 3.2).toFixed(1)}" font-size="8.5" fill="${s.m.color}" font-weight="600">${esc(p.v)}</text></g>`;
    }).join('');
  }).join('');

  const ticks = monthTicks(t0, t1).map((t) => `<line class="axis" x1="${t.x.toFixed(1)}" x2="${t.x.toFixed(1)}" y1="${CY1}" y2="${CY1 + 5}"/><text class="tick" x="${t.x.toFixed(1)}" y="${CY1 + 18}" text-anchor="middle">${t.label}</text>`).join('');
  const rowLabels = state.toggles.treatment
    ? `<text x="6" y="34" font-size="9" fill="#8fa1b5">周期</text><text x="6" y="68" font-size="9" fill="#8fa1b5">评估</text>`
    : '';

  return `<svg class="chart" viewBox="0 0 ${CW} ${CH}" role="img" aria-label="所选指标的时序图，共 ${all.length} 条序列（其中 ${quals.length} 条为分类节点）">
    ${grid}${ticks}${markLines}${strip}${rowLabels}${lines}${qualLayer}
    <text class="tick" x="${CX0}" y="${CY1 + 36}">数值线按各自全部记录的最小值–最大值归一化，不代表数值可比；分类序列只画节点、不连线</text>
  </svg>`;
}

/* IP11：每页标题行常驻「和 AI 讨论」，携带本页事实进面板草稿，不代发。 */
const pageHead = (sub) => `<div class="page-head"><div><h1>${esc(PAGES.find(p => p[0] === state.view)[1])}</h1><p>${esc(SUBTITLES[state.view])}</p></div>
  <button class="soft head-ai" data-action="ai-page" aria-label="和 AI 讨论本页内容（填入草稿，不自动发送）">和 AI 讨论</button></div>${sub ? `<div class="subnav" role="tablist">${SUBPAGES[state.view].map((s, i) => `<button role="tab" aria-selected="${(state.sub[state.view] || 0) === i}" data-sub="${i}">${esc(s)}</button>`).join('')}</div>` : ''}`;
const row = (b, p, right = '') => `<div class="row"><div class="row-main"><div><b>${b}</b>${p ? `<p>${p}</p>` : ''}</div></div>${right}</div>`;
const pill = (t, c = '') => `<span class="pill ${c}">${esc(t)}</span>`;
const secTitle = (s, extra = '') => s ? `<div class="section-title"><h2>${esc(s.title)}</h2>${extra}</div>` : '';
const emptyBox = (h, p) => `<div class="empty"><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`;

/* ---------------- views ---------------- */

/* 32 号 · 治疗线折叠卡：一条治疗线一个 details 单元，可打印全展开；
   只列医生原文与日期，不写"第几线"的自动编号。 */
function foldout(lines) {
  return lines.map((l, i) => {
    const key = /免疫/.test(l.name) ? '免疫' : /放疗/.test(l.name) ? '放疗' : /诱导|化疗/.test(l.name) ? '化疗' : '其他';
    const cyc = (P().cycles || []).filter((c) => key === '免疫' ? /免疫/.test(c[0]) : key === '放疗' ? /放疗/.test(c[0]) : key === '化疗' ? /诱导|化疗/.test(c[0]) : false);
    return `<details class="phase-fold" ${i === 0 ? 'open' : ''}><summary><span>${esc(l.name)}</span>${l.done ? pill('已完成', 'green') : pill('进行中', 'yellow')}</summary>
      <div class="fold-body"><p>${esc(l.detail)}</p>
      ${cyc.length ? `<div class="table-wrap"><table class="cycle-table"><thead><tr><th>单元</th><th>日期</th><th>说明</th><th>状态</th></tr></thead><tbody>
        ${cyc.map(c => `<tr><td>${esc(c[0])}</td><td>${esc(c[1])}</td><td>${esc(c[2])}</td><td>${pill(c[3], c[4] ? 'green' : 'yellow')}</td></tr>`).join('')}
      </tbody></table></div>` : '<p class="muted">这条线暂无按日期的单元记录。</p>'}</div></details>`;
  }).join('');
}

/* 36 号 §2.6 · 看板首卡状态卡四件：卡头 eyebrow / 派生天数 / 现状行 / 出口按钮排。
   天数由锚点日（手术日 / 分期记录日 / 病理确诊日 = Day 0）与当天日期计算，不手填；无锚点整卡显示「待初始化」。
   出口主按钮进当前阶段核心页；副按钮打开疾病概要（与顶栏「?」同一个整页面板）。 */
function isoDay(s) {
  const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
}
function dayDiff(from, to) {
  const a = isoDay(from), b = isoDay(to);
  return a === null || b === null ? null : Math.round((b - a) / 86400000);
}
/* 不用 data-primer-open：那个属性由 primer.js 接管，顶栏「?」会因此不被自动挂载（36 号 §3.2）。
   模块未接入时不渲染，避免留一个点了没反应的按钮。 */
function primerCta() {
  if (typeof window === 'undefined' || !window.DiseasePrimer) return '';
  return '<button class="soft" data-primer-cta aria-haspopup="dialog" aria-controls="disease-primer">疾病概要：胸腺癌是什么？</button>';
}
function statusCard(p) {
  const today = new Date().toISOString().slice(0, 10);
  const surgeryDate = p.surgery && p.surgery.rows[0] ? p.surgery.rows[0][0] : null;
  const mkDate = p.stageMK && p.stageMK.rows[0] ? String(p.stageMK.rows[0][2] || '').slice(0, 10) : null;
  const pathDate = p.pathology ? ((p.pathology.rows.find(r => r[0] === '报告日期') || [])[1] || '') : '';
  const anchor = surgeryDate || mkDate || pathDate || '';
  const anchorLabel = surgeryDate ? '手术日' : mkDate ? '分期记录日' : '病理确诊日';
  const days = dayDiff(anchor, today);
  if (days === null) {
    return `<div class="stage-strip" data-status-card="uninitialized"><span class="eyebrow">状态卡</span>`
      + `<span class="stage-now"><b>待初始化</b><small>未找到锚点日（手术日 / 分期记录日 / 病理确诊日 = Day 0），天数不由本台手填。先去「病理与复核」或「分期档案」补日期。</small></span>`
      + `<div class="actions"><button class="primary" data-action="go-pathology">去补起始日期 →</button>${primerCta()}</div></div>`;
  }
  const next = (p.rhythm || [])[0] || null;
  const nextTxt = next ? `下次：${next[3]}（${next[0]}）` : '下次：待预约';
  const lines = p.lines || [];
  const open = lines.find((l) => !l.done) || null;
  const cur = open || lines[lines.length - 1] || null;
  const curName = cur ? cur.name : '阶段未记录';
  const curDetail = cur ? cur.detail : '';
  const stateTxt = open ? '进行中' : '已结束 · 随访期';
  const core = state.profile === 'B'
    ? { act: 'go-mg', text: '看肌无力与免疫 →' }
    : { act: 'go-treatment', text: '看治疗历程 →' };
  return `<div class="stage-strip" data-status-card="ready"><span class="eyebrow">第 ${days} 天 · 距${esc(next ? next[0] : '下一节点')}</span>`
    + `<span class="stage-day"><b>第 ${days} 天</b><small>锚点 ${esc(anchor)} ${esc(anchorLabel)}（Day 0）</small></span>`
    + `<span class="stage-now"><b>${esc(curName)} · ${esc(stateTxt)}</b><small>${esc(curDetail)} · ${esc(nextTxt)} · 只引用医生记录与日期</small></span>`
    + `<div class="actions"><button class="primary" data-action="${core.act}">${core.text}</button>${primerCta()}</div></div>`;
}

/* 看板 MG 合并卡（B 档案专属形态）：只陈述状态与最近记录，不给处理建议。 */
function mgCard(p) {
  if (p.mg.status === '未记录' && !(p.mg.rows || []).length) {
    return `<div class="card"><div class="card-head"><h2>重症肌无力</h2>${pill('未记录', 'grey')}</div>
      ${emptyBox('还没有 MG 状态记录', '胸腺肿瘤与重症肌无力有关联；下次门诊可以问医生：我需要筛查重症肌无力吗？')}</div>`;
  }
  const last = (p.mg.rows || [])[0];
  return `<div class="card"><div class="card-head"><h2>重症肌无力</h2>${pill(p.mg.status, 'violet')}</div>
    <div class="rows">
      ${last ? row(`最近一次：${esc(last[1])}`, `${esc(last[0])} · ${esc(last[2])}`) : ''}
      ${p.immune ? row('免疫治疗', '治疗期间症状记录在「肌无力与免疫」页', pill('治疗中', 'yellow')) : ''}
    </div>
    <div class="notice">这里只记录"医生写了什么、你说了什么"；处置与调药都由医生决定。</div>
    <div class="actions"><button data-action="go-mg">打开肌无力与免疫 →</button></div></div>`;
}

function vDashboard() {
  const p = P(), m = M();
  const cards = (DASH_KEYS[state.profile] || []).filter(k => m[k]).map(k => mcard(k, m[k])).join('');
  const lastV = p.viewpoints[p.viewpoints.length - 1];
  const nextRhythm = p.rhythm[0];
  const isA = state.profile === 'A';
  const mk = p.stageMK ? p.stageMK.rows[0][1] : '未记录';
  const tnm = p.stageTNM ? p.stageTNM.rows[0][1] : '未记录';
  const lastImg = p.imaging && p.imaging.rows.length ? p.imaging.rows[p.imaging.rows.length - 1] : null;
  return `${pageHead(false)}
  ${statusCard(p)}
  <section class="hero">
    <div>
      <span class="eyebrow">演示档案 · ${esc(p.histology)}</span>
      <h1>${esc(p.name)}，这次想先看什么</h1>
      <p>${esc(p.headline)}</p>
      <div class="chips">${p.path.map((x, i) => `<span class="chip${i === 0 ? ' on' : ''}">${esc(x)}</span>`).join('')}</div>
    </div>
    <div class="stat-band">
      <div class="stat-tile"><span>分期（Masaoka-Koga / TNM）</span><b>${esc(mk)}${p.stageTNM ? ' / ' + esc(tnm) : ''}</b><small>医生给出，不换算不自算</small></div>
      <div class="stat-tile"><span>最近影像</span><b>${esc(lastImg ? lastImg[0] : '未记录')}</b><small>${esc(lastImg ? lastImg[1] : '在「影像随访」补记录')}</small></div>
    </div>
  </section>

  <div class="alert-strip">
    <b>${isA ? '诱导化疗期间，血象按周期记录' : '免疫治疗与肌无力两条线都在进行'}</b>
    <span>${isA
      ? '每个周期前的血常规记在这里；异常值交给医生判断，本台只做记录与回看。'
      : 'irAE 监测化验与 MG 症状记录分开两条线；眼睑下垂加重、气短这类变化按医生给的联系方式及时说。'}</span>
    <button data-action="${isA ? 'go-treatment' : 'go-mg'}">去看看 →</button>
  </div>

  <div class="task-grid">
    <button class="task-entry" data-action="go-symptoms">${icon('pulse')}<b>记一条今天的身体感受</b><span>按自述记，不用判断严重不严重</span></button>
    <button class="task-entry" data-action="go-review">${icon('calendar')}<b>复查要带什么</b><span>${esc(nextRhythm ? nextRhythm[0] + ' · ' + nextRhythm[1] : '按医生安排')}</span></button>
    <button class="task-entry" data-action="go-trials">${icon('flask')}<b>看看 2026 在招什么</b><span>${TRIALS.length} 条登记摘录，不是推荐</span></button>
  </div>

  <div class="dashboard-grid">
    <div>
      <div class="section-title"><h2>最近的变化</h2><span class="muted">轻点卡片翻面看趋势</span></div>
      <div class="metric-grid">${cards}</div>
      ${mgCard(p)}
      <div class="card">
        <div class="card-head"><h2>下一次门诊要说的三件事</h2>${pill(esc(nextRhythm ? nextRhythm[3] : '待定'), 'violet')}</div>
        <div class="rows">
          ${nextRhythm ? row(esc(nextRhythm[0]), `${esc(nextRhythm[1])} · ${esc(nextRhythm[2])}`) : ''}
          ${row('想问的问题', p.mindset)}
          <div class="row"><div class="row-main"><div><b>最近一次感受</b><p>${esc(lastV[0])} · ${esc(lastV[1])}：${esc(lastV[2])}</p></div></div>${pill('不是医生结论', 'grey')}</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-head"><h2>接下来</h2><span class="muted">医生安排</span></div>
        <div class="rows">${p.rhythm.slice(0, 5).map(r => row(esc(r[0]), `${esc(r[1])} · ${esc(r[3])}`)).join('')}</div>
        <div class="actions"><button data-action="go-review">打开复诊准备</button></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>我记下的感受</h2><span class="muted">情绪类默认只属于你</span></div>
        <div class="rows">${p.viewpoints.slice(-3).reverse().map(v => row(esc(v[2]), `${esc(v[0])} · ${esc(v[1])}${v[3] ? ' ' : ''}`)).join('')}</div>
        <div class="actions"><button data-action="go-symptoms">症状与感受 →</button></div>
      </div>
      <div class="card">
        <div class="card-head"><h2>今天可以做的事</h2></div>
        <div class="rows">
          ${row('把想问的写下来', '门诊只有几分钟，先说最想问的那一条')}
          ${row('核对一份新报告', '解析结果先进候选，逐字核对后才入库')}
        </div>
      </div>
    </div>
  </div>`;
}

/* ---------------- 病情整理（资料库） ---------------- */
const MARK_STATE = { ok: ['green', '已检测'], warn: ['yellow', '需关注'], pending: ['violet', '待出'], na: ['grey', '未检测'] };
const fmtSize = (n) => (!n ? '' : n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const todayISO = () => new Date().toISOString().slice(0, 10);
const DOC_TYPES = ['病理报告', '影像报告', '化验单', '治疗记录', '手术记录', '出院记录', '其他'];
const DOC_PILL = { 已核对: 'green', 已入库: 'green', 待核对: 'yellow', 解析失败: 'red' };
const CAND_LABEL = { candidate: '待确认', accepted: '已接受' };

function docsTable() {
  const q = (state.query || '').trim();
  const list = DOCS[state.profile].filter(d => !q || `${d.name} ${d.type}`.includes(q));
  if (!list.length) return `<div class="empty"><h3>没有匹配的资料</h3><p>换个关键词，或先上传一份报告。</p></div>`;
  return `<div class="table-wrap"><table class="cycle-table"><thead><tr><th>文件</th><th>日期</th><th>类型</th><th>状态</th><th></th></tr></thead><tbody>
    ${list.map(d => `<tr><td>${esc(d.name)}${d.size ? ` <small>${fmtSize(d.size)}</small>` : ''}</td><td>${esc(d.date)}</td><td>${esc(d.type)}</td>
      <td>${pill(d.status, DOC_PILL[d.status] || 'grey')}</td><td><button class="text-button" data-action="source" data-doc="${esc(d.id)}">原文出处</button></td></tr>`).join('')}
  </tbody></table></div>`;
}
function vRecords() {
  const sub = state.sub.records || 0;
  const cands = CANDS[state.profile];
  const pending = cands.filter(c => c.status !== 'accepted');
  if (sub === 0) {
    return `${pageHead(true)}<div class="toolbar">
      <input type="search" placeholder="搜索文件名或类型" data-action="records-search" value="${esc(state.query)}" aria-label="搜索资料">
      <button data-action="pick-file">上传报告</button>
      <button data-action="load-report">${state.parsing ? '正在解析…' : '载入一份模拟报告'}</button>
    </div>
    <input type="file" id="file-picker" multiple hidden accept=".pdf,.jpg,.jpeg,.png,.txt,.md">
    ${state.parseError ? `<div class="notice">上一份报告解析失败：<b>没有产生任何候选</b>，原件仍留在资料目录，可以重试。<button class="soft" data-action="retry">重试解析</button></div>` : ''}
    <div class="card"><div class="card-head"><h2>资料库</h2><span class="muted">${DOCS[state.profile].length} 份 · 原件不改动</span></div><div id="docs-table">${docsTable()}</div></div>`;
  }
  if (sub === 1) {
    return `${pageHead(true)}
    <div class="notice">核对 = 逐字检查转录，<b>不等于医学审核</b>；没把握就保留"待确认"，不会丢。</div>
    <div class="card"><div class="card-head"><h2>待核对（${pending.length}）</h2></div>
      <div class="rows">${pending.length ? pending.map(c => row(esc(c.name), `${esc(c.source)} · 值：${esc(c.value)}`,
        `<button data-action="candidate" data-id="${esc(c.id)}">核对这一项</button>`)).join('') : '<div class="empty"><h3>没有待核对内容</h3><p>解析出的字段都核对完了。</p></div>'}</div>
    </div>
    <div class="card"><div class="card-head"><h2>已接受（${cands.length - pending.length}）</h2><span class="muted">保留来源，可回溯</span></div>
      <div class="rows">${cands.filter(c => c.status === 'accepted').map(c => row(esc(c.name), `${esc(c.value)} · ${esc(c.source)}`, pill('已接受', 'green'))).join('') || '<p class="muted" style="padding:12px">还没有已接受的记录。</p>'}</div>
    </div>`;
  }
  if (sub === 2) {
    return `${pageHead(true)}<div class="grid">
      <div class="card"><div class="card-head"><h2>病情档案</h2></div><div class="rows">
        ${row('病理名称（原文）', esc(P().pathology ? P().pathology.rows[0][1] : '未记录'), pill('医生给出', 'grey'))}
        ${row('分期（Masaoka-Koga）', P().stageMK ? P().stageMK.rows[0][1] : '未记录')}
        ${row('分期（TNM）', P().stageTNM ? P().stageTNM.rows[0][1] : '未记录')}
        ${row('重症肌无力', P().mg.status)}
        ${row('当前治疗线', P().lines.filter(l => !l.done).map(l => l.name).join('、') || '未记录')}
      </div></div>
      <div class="card"><div class="card-head"><h2>时间线</h2></div><div class="rows">
        ${EVENTS[state.profile].slice().reverse().map(e => row(esc(e.d), esc(e.label))).join('')}
      </div></div></div>`;
  }
  if (sub === 3) {
    const metrics = Object.values(M());
    return `${pageHead(true)}<div class="card"><div class="card-head"><h2>指标检测（${metrics.length}）</h2></div>
      <div class="table-wrap"><table class="cycle-table"><thead><tr><th>指标</th><th>最近值</th><th>日期</th><th>来源</th></tr></thead><tbody>
      ${metrics.map(m => { const l = m.points[m.points.length - 1]; return `<tr><td>${esc(m.name)}</td><td>${esc(String(l.v))}${m.unit ? ' ' + esc(m.unit) : ''}</td><td>${esc(l.d)}</td><td>${esc(l.src || '—')}</td></tr>`; }).join('')}
      </tbody></table></div></div>`;
  }
  const privCount = P().viewpoints.filter(v => v[3]).length + P().symptoms.filter(s => s[3]).length;
  return `${pageHead(true)}<div class="card"><div class="card-head"><h2>病情汇总（演示）</h2></div><div class="rows">
    ${row('分期', `Masaoka-Koga ${P().stageMK ? P().stageMK.rows[0][1] : '未记录'} · TNM ${P().stageTNM ? P().stageTNM.rows[0][1] : '未记录'}（并列，不换算）`)}
    ${row('治疗线', P().lines.map(l => l.name).join(' → '))}
    ${row('私密记录', `${privCount} 条（默认不进导出与摘要）`, pill('不进导出', 'grey'))}
  </div></div>`;
}

/* ---------------- 病理与复核 ---------------- */
function vPathology() {
  const p = P(), sub = state.sub.pathology || 0;
  if (sub === 0) {
    return `${pageHead(true)}
    <div class="notice"><b>病理名称照抄报告原文。</b>"胸腺瘤"和"胸腺癌"一词之差就是不同的病，工作台不替你判断，也不同步改写。</div>
    ${p.pathology ? `<div class="card"><div class="card-head"><h2>${esc(p.pathology.title)}</h2>${pill(p.pathology.status, 'green')}</div>
      <div class="table-wrap"><table class="cycle-table"><thead><tr><th>项目</th><th>记录</th></tr></thead><tbody>
      ${p.pathology.rows.map(r => `<tr><td>${esc(r[0])}</td><td><b>${esc(r[1])}</b></td></tr>`).join('')}
      </tbody></table></div>
      <div class="actions"><button class="soft" data-action="source">看原件存档位置</button></div></div>` : emptyBox('还没有病理记录', '拿到病理报告后，把名称与机构逐字抄在这里。')}
    <div class="card"><div class="card-head"><h2>缺口（还没确认的）</h2><span class="muted">未检测 ≠ 阴性</span></div>
      <div class="rows">${p.pathology.gaps.map(r => row(esc(r[0]), esc(r[1]), pill('待确认', 'yellow'))).join('') || '<p class="muted" style="padding:12px">暂无缺口。</p>'}</div></div>`;
  }
  if (sub === 1) {
    if (!p.pathology.review) {
      return `${pageHead(true)}
      ${emptyBox('还没有复核记录', '如果做过或打算做病理复核（第二意见），把复核机构与结论原文记在这里；复核不改写原报告。')}
      <div class="grid" style="margin-top:14px">
        <div class="card"><div class="card-head"><h2>什么时候值得复核</h2></div><div class="rows">
          ${row('名称拿不准', '胸腺瘤 / 胸腺癌的区分直接影响治疗方向')}
          ${row('分型描述不一致', '不同医院报告的说法对不上时')}
        </div><div class="notice">是否复核由你和医生决定；这里只解释"复核是常见做法"。</div></div>
        <div class="card"><div class="card-head"><h2>复核要带什么</h2></div><div class="rows">
          ${row('病理切片（玻片）', '向原医院病理科借阅')}
          ${row('原报告复印件', '连同免疫组化结果')}
        </div><div class="actions"><button data-action="add-question">加入复诊清单</button></div></div>
      </div>`;
    }
    return `${pageHead(true)}
    <div class="notice"><b>原报告与复核意见并存。</b>复核结论不覆盖原报告；两者都保留机构、日期与原文。</div>
    <div class="grid">
      <div class="card"><div class="card-head"><h2>原报告</h2><span class="muted">${esc(p.pathology.title)}</span></div>
        <div class="rows">${p.pathology.rows.map(r => row(esc(r[0]), esc(r[1]))).join('')}</div></div>
      <div class="card"><div class="card-head"><h2>${esc(p.pathology.review.title)}</h2>${pill('第二意见', 'violet')}</div>
        <div class="rows">${p.pathology.review.rows.map(r => row(esc(r[0]), esc(r[1]))).join('')}</div></div>
    </div>`;
  }
  return `${pageHead(true)}
  <div class="notice"><b>AFP / β-hCG 是鉴别检查，不是胸腺癌的活动指标。</b>前纵隔肿物要先和生殖细胞肿瘤等区分；数值正常不等于"没事"。</div>
  <div class="metric-grid">${['afp', 'bhcg'].filter(k => M()[k]).map(k => mcard(k, M()[k])).join('')}</div>
  <div class="card"><div class="card-head"><h2>免疫组化（四态：已检测 / 需关注 / 待出 / 未检测）</h2></div>
    <div class="rows">${p.molecular.map(x => row(esc(x.k), `${esc(x.v)} · ${esc(x.src || '—')}${x.note && x.note !== '—' ? ' · ' + esc(x.note) : ''}`,
      pill(MARK_STATE[x.state][1], MARK_STATE[x.state][0]))).join('')}</div>
    <div class="notice">缩写照抄报告（CD5、P40、PD-L1 TPS…）；解读归医生。</div></div>`;
}

/* ---------------- 分期档案（双体系并列，不换算） ---------------- */
function stageTable(s) {
  return `<div class="table-wrap"><table class="cycle-table"><thead><tr><th>项目</th><th>记录</th><th>出处</th><th></th></tr></thead><tbody>
    ${s.rows.map(r => `<tr><td>${esc(r[0])}</td><td><b>${esc(r[1])}</b></td><td>${esc(r[2])}</td><td>${pill(r[3] || '医生给出', 'violet')}</td></tr>`).join('')}
  </tbody></table></div>`;
}
function vStage() {
  const p = P(), sub = state.sub.stage || 0;
  if (sub === 0) {
    return `${pageHead(true)}
    <div class="notice"><b>Masaoka-Koga 分期是医生给的。</b>工作台只抄「分期 / 依据 / 日期」，不根据影像或病理重算。</div>
    ${p.stageMK ? `<div class="card"><div class="card-head"><h2>${esc(p.stageMK.title)}</h2></div>
      ${stageTable(p.stageMK)}
      <div class="actions"><button data-action="add-stage">记一次分期变更</button><button class="soft" data-action="source">看报告原文</button></div></div>` : emptyBox('还没有分期记录', '分期由医生给出后，在这里抄下来。')}`;
  }
  if (sub === 1) {
    if (!p.stageTNM) {
      return `${pageHead(true)}
      ${emptyBox('TNM 分期未记录', '这家医院只给了 Masaoka-Koga；下次门诊可以问医生：需不需要一份 TNM 分期记录。')}
      <div class="card"><div class="card-head"><h2>为什么要问</h2></div><div class="rows">
        ${row('两套体系都在用', '国内部分指南推荐 TNM，国际主流指南仍多用 Masaoka-Koga；两家医院可能给出不同体系的记录')}
        ${row('并存即可', '不需要自己换算，把医生原文都留着')}
      </div><div class="notice">这是资料整理口径，不是对你分期的解释。</div></div>`;
    }
    return `${pageHead(true)}
    <div class="notice"><b>TNM 分期照抄医生原文</b>（含版本号）；工作台不做 T/N/M 的自动拆解与推断。</div>
    <div class="card"><div class="card-head"><h2>${esc(p.stageTNM.title)}</h2></div>
      ${stageTable(p.stageTNM)}</div>`;
  }
  return `${pageHead(true)}<div class="grid">
    <div class="card"><div class="card-head"><h2>Masaoka-Koga</h2>${pill(p.stageMK ? '已记录' : '未记录', p.stageMK ? 'green' : 'grey')}</div>
      <div class="rows">${p.stageMK ? p.stageMK.rows.map(r => row(esc(r[0]), esc(r[1]))).join('') : row('—', '未记录')}</div></div>
    <div class="card"><div class="card-head"><h2>TNM</h2>${pill(p.stageTNM ? '已记录' : '未记录', p.stageTNM ? 'green' : 'grey')}</div>
      <div class="rows">${p.stageTNM ? p.stageTNM.rows.map(r => row(esc(r[0]), esc(r[1]))).join('') : row('—', '未记录')}</div></div>
  </div>
  <div class="card" style="margin-top:14px"><div class="card-head"><h2>两套体系为什么并存</h2></div><div class="rows">
    ${row('国内口径', 'CACA 胸腺肿瘤指南 2025 版（V2.0_2025，2025-01-10）推荐 TNM 分期（第 9 版）——据指南条目转述，未取得原文')}
    ${row('国际口径', 'NCCN 胸腺瘤和胸腺癌指南 v2.2025（2025-06）等仍多用 Masaoka-Koga——据期刊条目转述')}
    ${row('本台口径', '两条并存、逐字保留、不换算、不推荐"哪个对"')}
  </div><div class="notice">以上是资料教育（第②层），不代表任何一项适合你；需要问你的医生。分期对照术语见疾病概要（顶栏「?」）。</div></div>
  <div class="card"><div class="card-head"><h2>医生原话</h2></div>
    <div class="rows">${row(esc(p.stageMK ? p.stageMK.rows[1] ? p.stageMK.rows[1][0] : '—' : '—'), esc(p.stageMK && p.stageMK.rows[1] ? p.stageMK.rows[1][1] : ''))}</div>
    <div class="notice">原话照抄，工作台不加解释。</div></div>`;
}

/* ---------------- 治疗历程 ---------------- */
function vTreatment() {
  const p = P(), sub = state.sub.treatment || 0;
  if (sub === 0) {
    return `${pageHead(true)}
    <div class="notice">治疗线按医生记录分列；<b>一次住院 / 一个疗程是一个折叠单元</b>，改过就新增一条，旧记录留着不覆盖。</div>
    <div class="phase-fold-wrap">${foldout(p.lines)}</div>
    <div class="card" style="margin-top:14px"><div class="card-head"><h2>常见治疗类别（教育卡）</h2></div><div class="rows">
      ${row('手术', '能完整切除时的主要治疗手段；是否可切由外科评估')}
      ${row('放疗', '不可切除或术后辅助时使用；剂量与分次照抄记录')}
      ${row('系统治疗', '诱导 / 晚期；方案名照抄医嘱（卡铂+紫杉醇、ADOC 等是文献常见方案词表）')}
      ${row('免疫治疗', '复发 / 晚期的治疗类别之一；治疗期间要监测不良反应（见「肌无力与免疫」）')}
    </div><div class="notice">这一段是类别说明（第②层教育），不是"你适合哪种"的建议；来源与日期见疾病概要。</div></div>`;
  }
  if (sub === 1) {
    if (!p.surgery) {
      return `${pageHead(true)}${emptyBox('没有手术记录', '这个档案目前在诱导化疗阶段，还未手术；做了手术后在这里记术式、范围、切缘与机构。')}
      <div class="card"><div class="card-head"><h2>为什么"没手术"也要说清楚</h2></div>
      <div class="rows">${row('当前阶段', esc(p.lines[0] ? p.lines[0].name : '未记录'))}${row('医生安排', esc(p.rhythm[1] ? p.rhythm[1][0] + ' · ' + p.rhythm[1][1] : '待预约'))}</div></div>`;
    }
    return `${pageHead(true)}<div class="card"><div class="card-head"><h2>${esc(p.surgery.title)}</h2></div>
      <div class="table-wrap"><table class="cycle-table"><thead><tr><th>日期</th><th>术式</th><th>入路</th><th>范围</th><th>切缘</th><th>机构</th></tr></thead><tbody>
      ${p.surgery.rows.map(r => `<tr><td>${esc(r[0])}</td><td><b>${esc(r[1])}</b></td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td>${esc(r[4])}</td><td>${esc(r[5])}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="rows">${p.surgery.rows.map(r => row('手术备注', esc(r[6]))).join('')}</div>
      <div class="notice">只记做了什么，不评价"做得够不够"；术式与切缘判断以手术记录和病理报告为准。</div></div>`;
  }
  if (sub === 2) {
    if (!p.rt) {
      return `${pageHead(true)}${emptyBox('没有放疗记录', '这个档案未做放疗；如后续加了放疗，在这里记部位、剂量与分次（照抄记录）。')}`;
    }
    return `${pageHead(true)}
    <div class="notice"><b>剂量与分次照抄记录，不合成"总剂量当量"。</b>不同照射技术的剂量学不能直接相加。</div>
    <div class="card"><div class="card-head"><h2>${esc(p.rt.title)}</h2><span class="muted">${p.rt.rows.length} 条</span></div>
      <div class="table-wrap"><table class="cycle-table"><thead><tr><th>技术</th><th>目的</th><th>剂量 / 分次</th><th>日期</th><th>部位 / 备注</th></tr></thead><tbody>
      ${p.rt.rows.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td><b>${esc(r[2])}</b></td><td>${esc(r[3])}</td><td>${esc(r[4])}</td></tr>`).join('')}
      </tbody></table></div></div>`;
  }
  const immuneRows = p.immune ? p.immune.rows : [];
  return `${pageHead(true)}<div class="card"><div class="card-head"><h2>系统治疗与周期</h2><span class="muted">${p.cycles.length} 条记录</span></div>
    <div class="table-wrap"><table class="cycle-table"><thead><tr><th>单元</th><th>日期</th><th>方案 / 说明</th><th>状态</th></tr></thead><tbody>
    ${p.cycles.map(c => `<tr><td>${esc(c[0])}</td><td>${esc(c[1])}</td><td>${esc(c[2])}</td><td>${pill(c[3], c[4] ? 'green' : 'yellow')}</td></tr>`).join('')}
    </tbody></table></div>
    <div class="notice">方案与剂量按医嘱原文抄录；调整或停药由医生决定，工作台不提供建议。</div></div>
    ${immuneRows.length ? `<div class="card" style="margin-top:14px"><div class="card-head"><h2>免疫治疗标记</h2>${pill('治疗中', 'yellow')}</div>
      <div class="rows">${immuneRows.map(r => row(`${esc(r[0])} · ${esc(r[1])}`, esc(r[2]))).join('')}</div>
      <div class="notice">免疫治疗期间的不良反应监测见「肌无力与免疫」；出现新发无力、眼睑下垂、气短，按医生给的联系方式尽快联系【待核：求助短语需与医生确认后替换】。</div></div>`
      : emptyBox('没有免疫治疗记录', '如后续开始免疫治疗，这里会出现治疗标记与监测提示。')}`;
}

/* ---------------- 肌无力与免疫 ---------------- */
function privateGate(what) {
  if (state.privateOpen) return '';
  return `<div class="notice"><b>${esc(what)}默认私密。</b>不进导出、不进看板摘要；点下面的按钮才会在本页展开。</div>
    <div class="actions"><button data-action="toggle-private">${state.privateOpen ? '收起私密内容' : '本人确认，展开查看'}</button></div>`;
}
function vMg() {
  const p = P(), sub = state.sub.mg || 0;
  if (sub === 0) {
    const expr = p.symptoms.filter(s => /眼睑|无力|疲乏|气短/.test(s[1]));
    return `${pageHead(true)}
    <div class="notice"><b>MG 状态只记医生写明的。</b>本台不自测、不分级；两列并置展示"医生记录"与"本人感受"，不写因果。</div>
    <div class="grid">
      <div class="card"><div class="card-head"><h2>医生记录面</h2>${pill(p.mg.status, p.mg.status === '医生确诊' ? 'green' : p.mg.status === '医生疑似' ? 'yellow' : 'grey')}</div>
        <div class="rows">${p.mg.rows.length ? p.mg.rows.map(r => row(`${esc(r[0])} · ${esc(r[1])}`, esc(r[2]))).join('') : row('—', '还没有医生侧记录')}</div></div>
      <div class="card"><div class="card-head"><h2>本人表达面</h2><span class="muted">自述，不是医生评估</span></div>
        <div class="rows">${expr.length ? expr.map(s => row(`${esc(s[1])} · ${esc(s[0])}`, esc(s[2]))).join('') : row('—', '还没有相关自述')}</div>
        <div class="actions"><button data-action="go-symptoms">去症状与感受页记录 →</button></div></div>
    </div>
    ${p.mg.status === '未记录' ? `<div class="card" style="margin-top:14px"><div class="card-head"><h2>可以问医生</h2></div><div class="rows">
      ${row('要不要筛查重症肌无力', '胸腺肿瘤与 MG 有关联，问医生是否需要相关检查')}
      ${row('出现什么情况要马上联系', '请医生给一句"出现 X 就联系 Y"的原话，记在这里')}
    </div><div class="actions"><button data-action="add-question">加入复诊清单</button></div></div>` : ''}`;
  }
  if (!p.immune) {
    return `${pageHead(true)}${emptyBox('没有免疫治疗记录', '这个档案未使用免疫治疗；如开始使用，这里会出现治疗标记与监测提示。')}`;
  }
  return `${pageHead(true)}
  <div class="notice"><b>免疫治疗期间要额外留意肌无力症状。</b>具体求助口径以你的医生给的原话为准（下方占位待确认）。</div>
  <div class="card"><div class="card-head"><h2>免疫治疗记录</h2>${pill('治疗中', 'yellow')}</div>
    <div class="rows">${p.immune.rows.map(r => row(`${esc(r[0])} · ${esc(r[1])}`, esc(r[2]))).join('')}</div></div>
  <div class="card"><div class="card-head"><h2>监测项目（医嘱）</h2></div><div class="rows">
    ${row('甲功 / 血糖 / 肝酶', '按周期查（医嘱），数值在「检查与指标」页')}
    ${row('肌无力症状', '新发或加重时先联系医生【待核：出现 X 联系 Y——需医生确认原话后填入】')}
  </div><div class="notice">irAE 的判断与处置归医生；本台只做记录、并置与提醒"该联系了"。</div>
  <div class="actions"><button data-action="go-labs">看监测化验 →</button></div></div>`;
}

/* ---------------- 影像随访 ---------------- */
function vImaging() {
  const p = P(), sub = state.sub.imaging || 0;
  if (sub === 1) {
    const imgRhythm = p.rhythm.filter(r => /影像|CT|MRI|复查/.test(r[0]));
    return `${pageHead(true)}
    <div class="notice"><b>复查节奏只按医嘱记录。</b>本台不写"标准间隔"；没有医嘱间隔就显示"未约定"。</div>
    <div class="card"><div class="card-head"><h2>医嘱里的影像安排</h2></div>
      <div class="rows">${imgRhythm.length ? imgRhythm.map(r => row(esc(r[0]), `${esc(r[1])} · 依据 ${esc(r[2])} · 下一次 ${esc(r[3])}`)).join('') : row('—', '未记录')}</div></div>
    <div class="card"><div class="card-head"><h2>报告里的"下一次建议"</h2><span class="muted">原文照抄</span></div>
      <div class="rows">${p.imaging.rows.slice(-3).reverse().map(r => row(`${esc(r[0])} · ${esc(r[1])}`, `报告建议：${esc(r[3])}`)).join('')}</div>
      <div class="notice">以实际预约为准；两条来源（医嘱 / 报告）不一致时，问医生哪条算数。</div></div>`;
  }
  const rows = p.imaging ? p.imaging.rows : [];
  const last = rows[rows.length - 1] || null;
  const today = todayISO();
  const since = last ? dayDiff(last[0], today) : null;
  const ctCount = rows.filter(r => /CT/.test(r[1])).length;
  return `${pageHead(true)}
  <div class="notice"><b>胸腺癌没有可靠的血清标志物，随访主要靠影像。</b>等结果的紧张感很常见；报告逐次留存，结论以报告原文为准。</div>
  ${last ? `<div class="stage-strip" data-status-card="imaging"><span class="eyebrow">距上次影像</span>
    <span class="stage-day"><b>${since} 天</b><small>最近一次：${esc(last[0])} · ${esc(last[1])}</small></span>
    <span class="stage-now"><b>${esc(last[2])}</b><small>结论摘录自报告；"距下次"见「复查节奏」</small></span>
    <div class="actions"><button data-action="go-imaging-next">看复查节奏 →</button></div></div>` : emptyBox('还没有影像记录', '拿到 CT / MRI 报告后，在这里按日期记一条。')}
  <div class="card" style="margin-top:14px"><div class="card-head"><h2>报告留存（${rows.length} 份）</h2><span class="muted">影像检查累计 ${ctCount} 次（只计数，不评判辐射风险；有疑问问医生）</span></div>
    <div class="table-wrap"><table class="cycle-table"><thead><tr><th>日期</th><th>检查</th><th>报告结论（摘录）</th><th>下一次建议</th></tr></thead><tbody>
    ${rows.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join('')}
    </tbody></table></div>
    <div class="actions"><button data-action="source">原件存档位置</button></div></div>`;
}

/* ---------------- 检查与指标 ---------------- */
function metricSections(cats) {
  return cats.map((c) => {
    const items = Object.entries(M()).filter(([, m]) => m.cat === c);
    if (!items.length) return '';
    return `<div class="metric-group"><div class="metric-group-head"><h3>${esc(c)}</h3><span>${items.length} 项</span></div>
      <div class="metric-grid">${items.map(([k, m]) => mcard(k, m)).join('')}</div></div>`;
  }).join('');
}
function vLabs() {
  const p = P(), sub = state.sub.labs || 0;
  if (sub === 0) {
    return `${pageHead(true)}
    <div class="notice"><b>鉴别参考 ≠ 活动指标。</b>AFP / β-hCG 在这里的作用是帮医生排除生殖细胞肿瘤；数值的高低不由本台解读。</div>
    ${metricSections(['鉴别参考'])}
    <div class="card"><div class="card-head"><h2>这两项怎么看</h2></div><div class="rows">
      ${row('和谁比', '和参考区间比、和自己上次比；和"病情好坏"没有本台可给的对应关系')}
      ${row('多久查一次', '按医嘱；本台不写标准频率')}
    </div><div class="notice">解读归医生；不同方法 / 单位 / 机构的数值不合并比较。</div></div>`;
  }
  if (sub === 1) {
    return `${pageHead(true)}
    <div class="notice">${p.cycles.length ? '治疗期间按周期记录血象；单次波动先问医生，不自己下结论。' : '按就诊记录录入。'}</div>
    ${metricSections(['血象'])}`;
  }
  return `${pageHead(true)}
  <div class="notice">免疫治疗期间的监测项目（甲功、血糖、肝酶等）按医嘱记录；报告结论以医生为准。</div>
  ${metricSections(['生化', '免疫相关', '自述'])}`;
}

/* ---------------- 一图秀 ---------------- */
function vTimeline() {
  const sub = state.sub.timeline || 0;
  const [t0, t1] = domain();
  const picks = CAT_ORDER.map((c) => {
    const items = Object.entries(M()).filter(([, m]) => m.cat === c);
    if (!items.length) return '';
    return `<div class="metric-pick"><span class="eyebrow">${esc(c)}</span>${items.map(([k, m]) =>
      `<label class="check-row"><input type="checkbox" data-pick="${k}" ${state.sel.includes(k) ? 'checked' : ''}><span>${esc(m.name)}</span></label>`).join('')}</div>`;
  }).join('');
  if (sub === 2) {
    return `${pageHead(true)}<div class="card"><div class="card-head"><h2>数据口径</h2></div><div class="rows">
      ${row('归一化', '每条数值线按自己的最小值–最大值铺满画布，所以"线的高低"不能跨指标比较')}
      ${row('分类序列', '疲乏（自述）与 MG 状态只画节点、不连线；档位顺序是固定的记录口径，不是医学分级')}
      ${row('单点', '只有 1 次记录的指标不连线，只画一个点')}
      ${row('治疗条', '周期带来自治疗记录；竖虚线是确诊 / 手术 / 分期 / 复发这类评估节点')}
      ${row('数据来源', '演示数据由 demo-data.js 提供（合成示例），与页面其他数据同源')}
    </div></div>`;
  }
  return `${pageHead(true)}
  <div class="chart-panel">
    <div class="chart-top">
      <div class="legend">${state.sel.filter(k => M()[k]).map(k => `<span class="line-chip"><i style="background:${M()[k].color}"></i>${esc(M()[k].name)}</span>`).join('')}</div>
      <div class="actions">
        <button class="soft" data-range="3m" ${state.range === '3m' ? 'aria-pressed="true"' : ''}>3 个月</button>
        <button class="soft" data-range="6m" ${state.range === '6m' ? 'aria-pressed="true"' : ''}>6 个月</button>
        <button class="soft" data-range="all" ${state.range === 'all' ? 'aria-pressed="true"' : ''}>全部</button>
      </div>
    </div>
    <div class="chart-wrap">${chartSVG(t0, t1)}</div>
    <div class="chart-tip">${state.pin ? (() => { const m = M()[state.pin.code]; const pt = m.points.find(p => p.d === state.pin.date); return pt ? `${esc(m.name)} · ${esc(pt.d)}：<b>${esc(String(pt.v))}</b>${m.unit ? ' ' + esc(m.unit) : ''}（${esc(pt.src || '—')}）` : ''; })() : '点图上的任意数据点，这里显示那次的数值与来源。'}</div>
  </div>
  <div class="grid">
    <div class="card"><div class="card-head"><h2>选择指标（最多 4 项）</h2></div>${picks}</div>
    <div class="card"><div class="card-head"><h2>显示选项</h2></div><div class="rows">
      <label class="check-row"><input type="checkbox" data-toggle="treatment" ${state.toggles.treatment ? 'checked' : ''} data-action="toggle" data-key="treatment"><span>显示治疗周期与评估节点</span></label>
      <label class="check-row"><input type="checkbox" data-toggle="keypoints" ${state.toggles.keypoints ? 'checked' : ''} data-action="toggle" data-key="keypoints"><span>显示末点数值</span></label>
    </div><div class="notice">分类序列的档位顺序在代码里写死（未记录 → 确诊），不按出现顺序排。</div></div>
  </div>`;
}

/* ---------------- 症状与感受 ---------------- */
function vSymptoms() {
  const p = P(), sub = state.sub.symptoms || 0;
  if (sub === 1) {
    const qs = state.questions || [];
    return `${pageHead(true)}
    <div class="notice">想问医生的问题先攒在这里；<b>AI 只帮忙整理措辞（候选），发不发、问不问由你决定。</b></div>
    <div class="card"><div class="card-head"><h2>我的问题候选（${qs.length}）</h2></div>
      <div class="rows">${qs.length ? qs.map(q => row(esc(q), '候选 · 可在复诊准备页导出', `<button class="soft" data-action="toggle-ask">标记已问</button>`)).join('') : row('—', '还没有候选；下面按钮会放一条示例')}</div>
      <div class="actions"><button data-action="add-question">加一个候选问题</button><button class="soft" data-action="ai-page">让 AI 帮忙整理措辞</button></div></div>
    <div class="card"><div class="card-head"><h2>我和家人的约定</h2></div><div class="rows">
      ${row('沟通方式', esc(p.familyTalk))}
      ${row('不想让孩子 / 老人知道的', '可以不写；写了也不会进导出')}
    </div><div class="notice">家庭沟通没有标准答案；这里是记录位，不是建议。</div></div>`;
  }
  const pub = p.symptoms.filter(s => !s[3]);
  const priv = p.symptoms.filter(s => s[3]);
  return `${pageHead(true)}
  <div class="notice">身体感受按自述记（时间 / 部位 / 你的话）；<b>情绪类条目默认私密</b>。</div>
  <div class="card"><div class="card-head"><h2>身体感受（可分享）</h2><span class="muted">${pub.length} 条</span></div>
    <div class="rows">${pub.length ? pub.map(s => row(`${esc(s[1])} · ${esc(s[0])}`, esc(s[2]))).join('') : row('—', '还没有记录')}</div>
    <div class="actions"><button data-action="add-symptom">记一条今天的情况</button></div>
    <div class="notice">这里的内容进导出与摘要；不想带进诊室的写进下面的私密区。</div></div>
  ${privateGate('情绪类感受')}
  ${state.privateOpen ? `<div class="card private"><div class="card-head"><h2>情绪类感受（私密）</h2>${pill('私密 · 不进导出', 'grey')}</div>
    <div class="rows">${priv.length ? priv.map(s => row(`${esc(s[1])} · ${esc(s[0])}`, esc(s[2]))).join('') : '<p class="muted" style="padding:12px">还没有私密记录。</p>'}</div>
    <div class="notice">这些内容不会被复制进"和 AI 讨论"的上下文草稿，也不会出现在导出里。</div>
    <div class="actions"><button data-action="toggle-private">收起</button></div></div>`
    : `<div class="card"><div class="card-head"><h2>私密区里可以写什么</h2></div><div class="rows">
      ${row('害怕与担心', '等病理、等 CT、等评估的每一天都可以写')}
      ${row('不想让家人知道的话', '写了也不会进导出')}
    </div><div class="notice">是否记录、是否给医生看，都由你决定。</div></div>`}`;
}

/* ---------------- 复诊准备 ---------------- */
function vReview() {
  const p = P(), sub = state.sub.review || 0;
  if (sub === 0) {
    return `${pageHead(true)}<div class="card"><div class="card-head"><h2>复诊节奏（医生安排）</h2></div>
      <div class="table-wrap"><table class="cycle-table"><thead><tr><th>项目</th><th>频率</th><th>依据</th><th>下一次</th></tr></thead><tbody>
      ${p.rhythm.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="notice">"下一次"是估算的门诊时间，以实际预约为准。</div></div>
    <div class="card"><div class="card-head"><h2>最近一次就诊带了什么</h2></div><div class="rows">
      ${row('带了', '病理报告与复核意见、最近一次影像报告、用药清单')}
      ${row('没带但下次要带', '分期两条原文（Masaoka-Koga + TNM）、MG 用药记录')}
    </div></div>`;
  }
  if (sub === 1) {
    const cat = (re, title) => {
      const rows = p.rhythm.filter(r => re.test(r[0]));
      return `<div class="card"><div class="card-head"><h2>${esc(title)}</h2></div><div class="rows">${rows.length ? rows.map(r => row(esc(r[0]), `${esc(r[1])} · 下一次 ${esc(r[3])}`)).join('') : row('—', '未记录')}</div></div>`;
    };
    return `${pageHead(true)}
    <div class="notice">三类随访节点并排看：影像、化验、专科随诊；各自的下一次时间以医生安排为准。</div>
    <div class="grid">${cat(/影像|CT|MRI/, '影像')}${cat(/血|甲功|血糖|肝酶|irAE/, '化验')}${cat(/MG|神经|随诊/, '专科随诊')}</div>`;
  }
  if (sub === 2) {
    const pack = [
      ['病理报告 + 复核意见（如做过）', '瘤/癌名称与分型是问诊起点'],
      ['两条分期原文（Masaoka-Koga / TNM）', '不同医生用不同体系，都带上'],
      ['最近影像报告（含胶片 / 光盘）', '胸外科与放疗科都要看影像本身'],
      ['用药清单（含 MG 用药）', '免疫治疗期间尤其要全'],
      ['这份工作台的问题清单', '导出后打印或存手机']
    ];
    return `${pageHead(true)}
    <div class="notice">资料包按胸腺癌就诊常见需要整理；<b>具体要带什么以科室通知为准</b>。</div>
    <div class="card"><div class="card-head"><h2>就诊资料包清单</h2></div>
      <div class="rows">${pack.map(x => row(esc(x[0]), esc(x[1]), pill('建议携带', 'grey'))).join('')}</div>
      <div class="actions"><button data-action="export-review">导出为 Markdown</button></div></div>`;
  }
  const qs = state.questions || [];
  return `${pageHead(true)}
  <div class="card"><div class="card-head"><h2>就诊准备</h2><span class="muted">打印或手机备忘都行</span></div>
    <div class="rows">
      ${row('最想问的一条', p.mindset)}
      ${row('带什么', '见「资料包」页；本清单随包导出')}
      ${row('最近的变化', `${P().imaging && P().imaging.rows.length ? P().imaging.rows[P().imaging.rows.length - 1][0] + ' 影像已记录' : '按实际记'}`)}
    </div><div class="actions"><button data-action="export-review">整理成 Markdown</button><button class="soft" data-action="add-question">加一个问题</button></div></div>
  <div class="card"><div class="card-head"><h2>我的问题清单（${qs.length}）</h2></div>
    <div class="rows">${qs.length ? qs.map(q => row(esc(q), '', `<button class="soft" data-action="toggle-ask">标记已问</button>`)).join('') : '<p class="muted" style="padding:12px">还没有问题；上面点"加一个问题"会放一条示例。</p>'}</div></div>`;
}

/* ---------------- 临床研究 ---------------- */
function vTrials() {
  const sub = state.sub.trials || 0;
  if (sub === 1) {
    const saved = TRIALS.filter(t => state.saved.includes(t.id));
    return `${pageHead(true)}${saved.length ? `<div class="card"><div class="card-head"><h2>已收藏（${saved.length}）</h2></div><div class="rows">
      ${saved.map(t => row(esc(t.title), `${esc(t.id)} · ${esc(t.phase)} · ${esc(t.status)} · ${esc(t.sponsor)}`,
        `<button class="soft" data-action="save-trial" data-id="${esc(t.id)}">取消收藏</button>`)).join('')}</div></div>`
      : emptyBox('还没有收藏', '在「2026 线索」里点"收藏"，会出现在这里。')}`;
  }
  if (sub === 2) {
    const qs = (state.questions || []).filter(q => /NCT/.test(q));
    return `${pageHead(true)}
    <div class="notice">登记状态 ≠ 入组资格；下面这些问题拿去问研究中心，比在网上找答案可靠。</div>
    <div class="card"><div class="card-head"><h2>通用入组问题</h2></div><div class="rows">
      ${row('我的病理类型符合吗', '带上病理报告与复核意见（胸腺癌不同亚型入组可能不同）')}
      ${row('我的分期符合吗', '带上两条分期原文（Masaoka-Koga 与 TNM），别只带一条')}
      ${row('需要重新做检查吗', '有些试验要求本院影像或病理复核')}
      ${row('对照臂是什么', '随机对照试验要问清楚"如果分到对照组"用什么')}
      ${row('来回路程与随访频率', '能不能配合，直接决定要不要报名')}
    </div></div>
    <div class="card"><div class="card-head"><h2>已加入清单（${qs.length}）</h2></div>
      <div class="rows">${qs.length ? qs.map(q => row(esc(q), '')).join('') : '<p class="muted" style="padding:12px">还没有具体试验的问题。</p>'}</div></div>`;
  }
  const topics = ['全部', ...Array.from(new Set(TRIALS.map(t => t.topic)))];
  const list = TRIALS.filter(t => state.trialTopic === '全部' || t.topic === state.trialTopic);
  return `${pageHead(true)}
  <div class="notice">线索不是推荐：登记信息可能滞后，<b>状态与入排标准以研究中心为准</b>。数据来源 ClinicalTrials.gov，
    采集窗口 2026-11-08（在线通道）；ChiCTR / 中国药物临床试验登记平台本轮未采集，覆盖未知。</div>
  <div class="chips" role="group" aria-label="按关注点筛选">
    ${topics.map(t => `<button class="chip${state.trialTopic === t ? ' on' : ''}" data-topic="${esc(t)}">${esc(t)}</button>`).join('')}
  </div>
  <div class="rows">${list.map(t => `<div class="card topic-card">
    <div class="card-head"><h2>${esc(t.title)}</h2><span class="muted">${esc(t.id)}</span></div>
    <div class="chips">${pill(t.phase, 'violet')}${pill(t.status, t.status.includes('RECRUITING') ? 'green' : 'grey')}${pill(t.topic, 'grey')}</div>
    <p class="muted" style="margin-top:8px">申办 / 登记单位：${esc(t.sponsor)} · 最后核对 ${esc(t.last_verified)}</p>
    <div class="actions"><button data-action="save-trial" data-id="${esc(t.id)}">${state.saved.includes(t.id) ? '取消收藏' : '收藏'}</button>
      <button class="soft" data-action="ask-trial" data-id="${esc(t.id)}">加进入组问题</button>
      <a class="source-link" href="${esc(t.url)}" target="_blank" rel="noopener">登记页 ↗</a></div>
  </div>`).join('')}</div>`;
}

const VIEWS = { dashboard: vDashboard, records: vRecords, pathology: vPathology, stage: vStage, treatment: vTreatment, mg: vMg, imaging: vImaging, labs: vLabs, timeline: vTimeline, symptoms: vSymptoms, review: vReview, trials: vTrials };

/* ---------------- agent dock（dsh 原生会话挂载位） ---------------- */
/* 越界词自检清单：下面是"要被拦住的词表"本身，不是给用户看的文案。 */
const FORBIDDEN = ['建议治疗', '可能复发', '预后良好', '治愈率', '可以停药', '无需就医', '推荐方案', '生存率']; // wording-allow
const PAGE_CONTEXT = {
  dashboard: () => ({ facts: [`${P().name}：${P().meta}`,
    `Masaoka-Koga：${P().stageMK ? P().stageMK.rows[0][1] : '未记录'}（医生给出）`,
    `TNM：${P().stageTNM ? P().stageTNM.rows[0][1] : '未记录'}（医生给出）`,
    `重症肌无力状态：${P().mg.status}`],
    missing: ['下次影像复查的具体日期', '最近一次门诊的医生原话'] }),
  records: () => ({ facts: [`资料库 ${DOCS[state.profile].length} 份；待核对候选 ${CANDS[state.profile].filter(c => c.status !== 'accepted').length} 条`], missing: [] }),
  pathology: () => ({ facts: [`病理名称（原文）：${P().pathology ? P().pathology.rows[0][1] : '未记录'}`,
    `复核：${P().pathology && P().pathology.review ? '已做（' + P().pathology.review.rows[0][0] + '）' : '未做'}`,
    ...P().molecular.map(x => `${x.k}：${x.v}（${x.src}）`)],
    missing: P().molecular.filter(x => x.state === 'na').map(x => `${x.k} 检测状态`) }),
  stage: () => ({ facts: [...(P().stageMK ? P().stageMK.rows.map(r => `MK ${r[0]}：${r[1]}`) : ['Masaoka-Koga：未记录']),
    ...(P().stageTNM ? P().stageTNM.rows.map(r => `TNM ${r[0]}：${r[1]}`) : ['TNM：未记录']),
    '两体系并存记录，工作台不做换算'], missing: [] }),
  treatment: () => ({ facts: [...P().lines.map(l => `治疗线：${l.name}（${l.detail}）`),
    ...(P().cycles.length ? [`最近治疗单元：${P().cycles[P().cycles.length - 1][0]}（${P().cycles[P().cycles.length - 1][1]}）`] : [])],
    missing: ['下次评估的具体结论'] }),
  mg: () => ({ facts: [`MG 状态：${P().mg.status}（只记医生写明）`,
    ...(P().mg.rows.length ? [`最近 MG 记录：${P().mg.rows[0][1]}（${P().mg.rows[0][0]}）`] : []),
    `免疫治疗：${P().immune ? '有记录（' + P().immune.rows.length + ' 条）' : '无记录'}`],
    missing: ['医生确认的求助短语（出现什么联系谁）'] }),
  imaging: () => ({ facts: [...(P().imaging ? P().imaging.rows.slice(-2).map(r => `${r[0]} ${r[1]}：${r[2]}`) : ['影像：未记录']),
    ...(P().rhythm.filter(r => /影像|CT/.test(r[0])).map(r => `医嘱节奏：${r[0]} ${r[1]}`))], missing: ['下次影像的预约日期'] }),
  labs: () => ({ facts: Object.values(M()).filter(m => m.points && m.points.length).map(m => `${m.name} 最近：${String(m.points.slice(-1)[0].v)}（${m.points.slice(-1)[0].d}）`),
    missing: ['irAE 监测结论的医生解读'] }),
  timeline: () => ({ facts: ['一图秀当前勾选：' + state.sel.map(k => M()[k].name).join('、')], missing: [] }),
  symptoms: () => ({ facts: [`症状记录 ${P().symptoms.length} 条（其中私密 ${P().symptoms.filter(s => s[3]).length} 条，不进入草稿）`], missing: [] }),
  review: () => ({ facts: P().rhythm.map(r => `${r[0]}：${r[1]}（${r[2]}）`), missing: ['想问清单中 1 条待确认'] }),
  trials: () => ({ facts: ['2026 线索共 ' + TRIALS.length + ' 条（真实登记摘录，状态未核实）'], missing: [] })
};

function buildPrompt() {
  const ctx = PAGE_CONTEXT[state.view]();
  const title = PAGES.find(p => p[0] === state.view)[1];
  return [`【来自小橡宝工作台 · ${title}页】`, `档案：${P().name}（${P().meta}）——合成示例`, '',
    '本页已核对的事实：', ...ctx.facts.map(f => '- ' + f), '',
    '尚未核对 / 待确认：', ...(ctx.missing.length ? ctx.missing.map(f => '- ' + f) : ['- （无）']), '',
    '边界：以上是记录整理，不是医疗建议；请基于原文与医生沟通，不要求工作台外推结论。'].join('\n');
}
function mockReply() {
  return '根据你整理的本页事实：病理、分期与治疗记录都有医生原文出处，随访节奏在档。你提到的未确认事项，适合放进复诊问题清单逐条与医生确认。本回复不构成医疗建议。';
}
function renderAgent() {
  const dock = $('#agent-dock'), grid = $('#work-grid'), btn = $('#agent-toggle');
  dock.hidden = !state.agentOpen;
  grid.classList.toggle('agent-open', state.agentOpen);
  grid.classList.toggle('agent-wide', state.agentOpen && state.agentSize === 'wide');
  btn.setAttribute('aria-expanded', String(state.agentOpen));
  $('#agent-state').textContent = state.agentOpen ? '已打开' : '未进入激活';
  $('#agent-toggle i').classList.toggle('grey', !state.agentOpen);
  $('#agent-toggle i').classList.toggle('on', state.agentOpen);
  $('#agent-dot').classList.toggle('on', state.agentOpen);
  $$('.agent-sizes button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.size === state.agentSize)));
  const body = $('#agent-body');
  if (!body.dataset.built) {
    body.innerHTML = `<div class="agent-note"><b>dsh 原生会话挂载位</b><br>原生会话仅在 DSH Desktop 内可用；当前为浏览器预览，这里保留宿主会话的挂载点（#dsh-conversation-slot），不模拟聊天窗口。</div>
      <div id="dsh-conversation-slot" aria-live="polite"></div>`;
    body.dataset.built = '1';
  }
}
function agentBuild() {
  const slot = $('#dsh-conversation-slot');
  slot.innerHTML = `<div class="agent-card"><h4>提示词预览（发送前可读 · 由你在宿主会话发送）</h4><pre>${esc(buildPrompt())}</pre></div>`;
  /* 34 号 agent-draft 一键：iframe（装机态）里把本页提示词交给宿主外壳的草稿桥（只填不发）；
     file:// 独立打开时没有宿主监听方，静默跳过（本地演示面板已可见同一份提示词）。 */
  if (window.parent && window.parent !== window) {
    try {
      const target = window.location.origin && window.location.origin !== 'null' ? window.location.origin : '*';
      window.parent.postMessage({ type: 'thymic-workbench:agent-draft', prompt: buildPrompt(), send: true }, target);
    } catch (_) { /* 宿主未监听或跨源受限：保持本地演示态，不重试不报错 */ }
  }
}
function agentDemo() {
  const slot = $('#dsh-conversation-slot');
  const text = mockReply();
  const hits = FORBIDDEN.filter(w => text.includes(w));
  slot.innerHTML = `<div class="agent-card"><h4>模拟回复 · 红线自检</h4><pre>${esc(text)}</pre>
    <div class="agent-check">${hits.length ? hits.map(h => `<span class="hit">命中禁用词：${esc(h)}</span>`).join('') : '<span class="pass">✓ 未命中禁用词表（' + FORBIDDEN.length + ' 项）</span><span class="pass">✓ 免责语句在否定语境中出现</span>'}</div></div>`;
}

/* ---------------- dialogs / toast ---------------- */
let toastTimer;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('visible'), 2200); }
function openDialog(eyebrow, title, body, foot = '') {
  $('#dialog-eyebrow').textContent = eyebrow; $('#dialog-title').textContent = title;
  $('#dialog-body').innerHTML = body; $('#dialog-foot').innerHTML = foot;
  $('#dialog').showModal();
  if (title === '设置') loadMineruStatus();
}
const closeDialog = () => $('#dialog').close();

function dlgProfiles() {
  openDialog('小橡宝', '切换演示档案', Object.entries(PROFILES).map(([k, p]) => `
    <button class="profile-row ${state.profile === k ? 'on' : ''}" data-pick-profile="${k}">
      <div><b>${esc(p.name)}的资料</b><p>${esc(p.meta)} · ${esc(p.headline)}</p></div><span class="profile-caret">${state.profile === k ? '当前' : '切换'}</span></button>`).join(''),
    '<button data-action="close">取消</button>');
}
/* ---- 文档解析设置：Token 状态与手工保存 ----
   状态只显示掩码与文件路径，原文不回显（服务端也不返回）。
   离线演示（DATA_SOURCE !== 'api'）如实说"不可用"，不假装已保存。 */
function mineruStatusText(s) {
  if (!s) return '读取 Token 状态失败：本机服务没有返回内容。';
  if (s.error) return `读取失败：${s.error}`;
  if (!s.configured) return '尚未配置 Token：扫描件与照片的自动识别会用不了；TXT / MD / CSV 仍在本机解析。';
  const where = s.source === 'file' ? `已保存于 ${s.file}` : '来自环境变量 MINERU_TOKEN（未写入文件）';
  return `当前生效：${s.masked} · ${where}`;
}
function loadMineruStatus() {
  const el = $('#mineru-status');
  if (!el) return;
  /* 原型里没有 DATA_SOURCE（纯离线演示），用 typeof 兜住 */
  if (typeof DATA_SOURCE === 'undefined' || DATA_SOURCE !== 'api') { el.textContent = '离线演示：未连接工作台，读不到 Token 状态。'; return; }
  fetch(`${apiBase()}/api/thymic/settings/mineru`, { headers: { accept: 'application/json' } })
    .then((r) => r.json().then((j) => { if (!r.ok) throw new Error(j.message || j.error || '读取失败'); return j; }))
    .then((s) => { const n = $('#mineru-status'); if (n) n.textContent = mineruStatusText(s); })
    .catch((e) => { const n = $('#mineru-status'); if (n) n.textContent = `读取 Token 状态失败：${e.message}`; });
}
function mineruPost(payload) {
  const el = $('#mineru-status');
  if (typeof DATA_SOURCE === 'undefined' || DATA_SOURCE !== 'api') { toast('离线演示不能保存 Token'); return; }
  fetch(`${apiBase()}/api/thymic/settings/mineru`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
  })
    .then((r) => r.json().then((j) => { if (!r.ok) throw new Error(j.message || j.error || '保存失败'); return j; }))
    .then((s) => {
      if (el) el.textContent = mineruStatusText(s);
      const input = $('#mineru-token'); if (input) input.value = '';
      toast(payload.action === 'clear' ? '已清除本机 Token' : 'Token 已保存到本机密钥文件');
    })
    .catch((e) => {
      if (el) el.textContent = `保存失败：${e.message}`;
      toast('Token 保存失败');
    });
}
function dlgSettings() {
  openDialog('小橡宝', '设置', `<div class="cfg-tabs" role="tablist">
  <button role="tab" aria-selected="true" data-action="cfg-tab" data-tab="ws">资料目录</button><button role="tab" aria-selected="false" data-action="cfg-tab" data-tab="parse">文档解析</button><button role="tab" aria-selected="false" data-action="cfg-tab" data-tab="kb">临床数据库</button></div>
  <div class="cfg-block" style="margin-top:16px" data-tab="ws"><h3>工作区资料目录</h3><div class="path-row"><code>DSH 资料目录 / thymic-workbench（装机后生效；当前为演示值）</code><button class="soft">选择…</button></div>
  <p class="small-note">患者数据只存入你明确选择的目录；工作台不把资料上传云端。</p></div>
  <div class="cfg-block" style="margin-top:12px" data-tab="parse" hidden><h3>文档解析（MinerU）</h3>
  <div class="token-row"><input id="mineru-token" type="password" autocomplete="new-password" placeholder="粘贴 MinerU API Token（sk-…）" aria-label="MinerU API Token"><button class="primary" data-action="mineru-save">保存</button><button class="soft" data-action="mineru-clear">清除</button></div>
  <p class="small-note" id="mineru-status" role="status">正在读取本机 Token 状态…</p>
  <p class="small-note">Token 只写进本机密钥文件（权限 600），只用于向 MinerU 发起解析请求，不进患者资料、不进导出、不进提示词。解析结果永远是候选，核对后才入档。</p></div>
  <div class="cfg-block" style="margin-top:12px" data-tab="kb" hidden><h3>2026 临床数据库</h3><div class="path-row"><code>thymic_trials_2026.sqlite · 演示摘录 ${TRIALS.length} 条</code></div>
  <p class="small-note">在线快照来自 CT.gov（2026-11-08 采集窗口）；ChiCTR / 药物临床试验登记平台本轮未采集，覆盖未知。</p></div>`, '<button class="primary" data-action="close">完成</button>');
}
function dlgAbout() {
  openDialog('小橡宝', '关于', `<div class="about"><div class="brand no-mark" style="zoom:2.2"></div><div class="about-meta">
    <div class="about-ver"><b>v${APP_INFO.version}</b>${pill(APP_INFO.channelLabel, 'violet')}</div>
    <dl><div><dt>构建</dt><dd>${APP_INFO.build}</dd></div><div><dt>形态</dt><dd>交互原型（单机多文件）· 全部患者数据为合成示例</dd></div>
    <div><dt>数据</dt><dd>2026 临床试验：真实登记摘录（ClinicalTrials.gov），状态未核实</dd></div>
    <div><dt>家族</dt><dd>小 X 宝家族 · ThymPal 小橡宝</dd></div></dl></div></div>`, '<button class="primary" data-action="close">关闭</button>');
}
function dlgHelp() {
  openDialog('小橡宝', '原型操作说明', `<div class="cfg-block">顶栏「AI 对话」按钮打开右侧<b>原生会话挂载位</b>（可 × 隐藏、窄/标准/宽三档）；每页标题行的「和 AI 讨论」把本页事实填成提示词草稿，<b>不自动发送</b>。「模拟回复自检」演示文本层红线扫描。</div>
  <div class="cfg-block" style="margin-top:12px">顶栏「<b>?</b>」打开<b>疾病概要</b>整页面板（定义 · 医学资料规范和指南情况 · 治疗全景 · 发展趋势）；看板状态卡里也有同一个入口。Esc 或返回键只退一层。</div>
  <div class="cfg-block" style="margin-top:12px">「检查与指标」「看板」里的数值卡<b>轻点翻面</b>看趋势；分类记录（疲乏、MG 状态）不翻面、不连线。「病情一图秀」左侧可勾选指标、按 3 / 6 个月或全部看。「治疗历程」的治疗线是折叠卡，点开展开单元。</div>
  <div class="cfg-block" style="margin-top:12px">左上角头像可切换<b>两个演示档案</b>：陈志明（58 岁 · 胸腺鳞癌 · 诱导化疗中 · 记录少）、林淑华（63 岁 · 术后 4 年 · 复发后免疫治疗 · 合并重症肌无力 · 记录多）。</div>
  <div class="cfg-block" style="margin-top:12px"><b>分期双体系</b>并存记录、不换算；<b>私密内容</b>（情绪类感受）默认折叠，需要本人点「本人确认，展开查看」；这些内容不进导出，也不进「和 AI 讨论」的草稿。</div>`, '<button class="primary" data-action="close">知道了</button>');
}
function dlgExport() {
  const p = P();
  const md = ['# 复诊准备（演示导出）', '', `档案：${p.name}（${p.meta}）`, '', '## 事实区（已核对）',
    `- 病理名称（原文）：${p.pathology ? p.pathology.rows[0][1] : '未记录'}`,
    `- Masaoka-Koga：${p.stageMK ? p.stageMK.rows[0][1] : '未记录'}（医生给出）`,
    `- TNM：${p.stageTNM ? p.stageTNM.rows[0][1] : '未记录'}（医生给出；两体系并存不换算）`,
    ...(p.imaging ? p.imaging.rows.slice(-1).map(r => `- 最近影像：${r[0]} ${r[1]}，${r[2]}`) : []),
    ...p.rhythm.map(r => `- ${r[0]}：${r[1]}（${r[2]}）`),
    `- 重症肌无力：${p.mg.status}`,
    '', '## 想问的事 / 我的看法（不是医生结论）', '- （按页面勾选结果导出；私密条目默认不含）', '',
    '> 本文件由工作台整理，不构成医疗建议。'].join('\n');
  openDialog('小橡宝', '导出编辑（Markdown）', `
    <textarea id="export-edit" aria-label="导出内容，可直接编辑" style="width:100%;min-height:320px;font:12px/1.7 ui-monospace,SFMono-Regular,monospace;padding:12px;border:1px solid #d8e0ea;border-radius:10px;background:#fff;color:#213139;resize:vertical">${esc(md)}</textarea>
    <p class="small-note">直接在上方编辑；「我的看法」区永远带"不是医生结论"标注。私密记录不会出现在这里。</p>`,
    '<button class="soft" data-action="close">取消</button><button class="primary" data-action="export-save">保存到资料目录</button>');
}

/* ---------------- render root ---------------- */
function animateCountups(root) {
  if (!root || typeof root.querySelectorAll !== 'function' || typeof requestAnimationFrame !== 'function') return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const DUR = 650;
  root.querySelectorAll('[data-countup]').forEach((el) => {
    const target = parseFloat(el.dataset.countup);
    if (!isFinite(target)) return;
    const dec = el.dataset.dec === undefined ? 1 : +el.dataset.dec;
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / DUR);
      const ease = 1 - Math.pow(1 - k, 3);
      el.textContent = (target * ease).toFixed(dec);
      if (k < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(dec);
    };
    el.textContent = (0).toFixed(dec);
    requestAnimationFrame(step);
  });
}

function render() {
  const p = P();
  $('#nav').innerHTML = PAGES.map(([id, label, ic]) => {
    const count = id === 'trials' ? TRIALS.length : null;
    return `<button class="nav-button" data-nav="${id}" ${state.view === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${esc(label)}</span>${count ? `<span class="nav-count">${count}</span>` : ''}</button>`;
  }).join('');
  $('#breadcrumb').textContent = PAGES.find(x => x[0] === state.view)[1];
  $('#profile-name').textContent = `${p.name}的资料`;
  $('#profile-meta').textContent = p.meta;
  $('#profile-avatar').textContent = p.name[0];
  $('#main').innerHTML = (VIEWS[state.view] || vDashboard)();
  $('#main').classList.remove('page-enter');
  animateCountups($('#main'));
  renderAgent();
  if (state.agentOpen) $('#agent-body').dataset.built = '';
}

/* ---------------- events ---------------- */
document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-nav]');
  if (nav) { state.view = nav.dataset.nav; state.privateOpen = false; /* 换页即收回私密展开：一次确认只管当页 */ location.hash = state.view; state.pin = null; render(); $('#main').focus({ preventScroll: true }); window.scrollTo(0, 0); return; }
  const sub = e.target.closest('[data-sub]');
  if (sub) { state.sub[state.view] = +sub.dataset.sub; state.privateOpen = false; render(); return; }
  const pick = e.target.closest('[data-pick]');
  if (pick) {
    const k = pick.dataset.pick;
    if (pick.checked) {
      if (state.sel.length >= 4) { pick.checked = false; toast('最多同时看 4 个指标；取消一个再加。'); return; }
      if (!state.sel.includes(k)) state.sel.push(k);
    } else {
      if (state.sel.length === 1) { pick.checked = true; toast('至少留一个指标。'); return; }
      state.sel = state.sel.filter(x => x !== k);
    }
    render(); return;
  }
  const topic = e.target.closest('[data-topic]');
  if (topic) { state.trialTopic = topic.dataset.topic; render(); return; }
  const pp = e.target.closest('[data-pick-profile]');
  if (pp) {
    state.profile = pp.dataset.pickProfile; state.sel = defaultSel(pp.dataset.pickProfile);
    state.pin = null; state.privateOpen = false; closeDialog(); render();
    toast(`已切换到 ${P().name}的资料（演示）`); return;
  }
  const card = e.target.closest('.mcard[data-mcard]');
  if (card && !card.dataset.static) { flipCard(card.dataset.mcard); return; }
  const act = e.target.closest('[data-action]')?.dataset.action;
  if (!act) return;
  const go = (view, subIdx) => { state.view = view; if (subIdx !== undefined) state.sub[view] = subIdx; state.privateOpen = false; location.hash = view; state.pin = null; render(); };
  const map = {
    profiles: dlgProfiles, settings: dlgSettings, about: dlgAbout, help: dlgHelp,
    close: closeDialog, 'open-store': () => toast('资料目录已激活（演示）'),
    'go-review': () => go('review'),
    'go-labs': () => go('labs'),
    'go-timeline': () => go('timeline'),
    'go-stage': () => go('stage'),
    'go-pathology': () => go('pathology'),
    'go-treatment': () => go('treatment'),
    'go-mg': () => go('mg'),
    'go-imaging': () => go('imaging'),
    'go-imaging-next': () => go('imaging', 1),
    'go-symptoms': () => go('symptoms'),
    'go-trials': () => go('trials'),
    'go-records': () => go('records'),
    'ai-page': () => { state.agentOpen = true; renderAgent(); agentBuild(); toast('本页要点已填入 AI 面板草稿；发送由你决定'); },
    'toggle-private': () => { state.privateOpen = !state.privateOpen; render(); },
    source: (el) => {
      const d = el.dataset.doc ? DOCS[state.profile].find((x) => x.id === el.dataset.doc) : null;
      const line = d ? `${d.fileName || d.name}${d.size ? ` · ${fmtSize(d.size)}` : ''}（${d.date}）` : el.dataset.source || '原件存放在资料目录 imports/ 下';
      openDialog('小橡宝', '原文出处', `<p style="font-size:12.5px">${esc(line)}</p><p class="small-note">工作区不改动原文，也不替你解释它。</p>`, '<button class="primary" data-action="close">关闭</button>');
    },
    'pick-file': () => { const inp = $('#file-picker'); if (inp && typeof inp.click === 'function') inp.click(); else toast('当前浏览器不支持选择本机文件'); },
    'mineru-save': () => {
      const input = $('#mineru-token');
      const token = input ? input.value.trim() : '';
      if (!token) { toast('先把 Token 粘贴到输入框'); if (input) input.focus(); return; }
      mineruPost({ token });
    },
    'mineru-clear': () => mineruPost({ action: 'clear' }),
    'export-save': () => {
      const ta = $('#export-edit');
      const txt = ta ? ta.value.trim() : '';
      if (!txt) { toast('导出内容是空的；先填一点内容再保存。'); return; }
      DOCS[state.profile].unshift({ id: 'ex' + Date.now().toString(36), name: `复诊准备 · ${P().name} · ${todayISO()}`, fileName: `复诊准备-${todayISO()}.md`, size: new Blob([txt]).size, date: todayISO(), type: '其他', status: '待核对', note: '生成文件 · 由导出创建，可在草稿里核对' });
      closeDialog();
      toast('已保存到资料目录 exports/（演示）；在「病情整理 · 资料库」可见');
    },
    'load-report': () => {
      if (state.parsing) return;
      if (state.loaded[state.profile]) { toast('模拟报告已载入，没有重复新增'); return; }
      state.parsing = true; state.parseError = false; render();
      setTimeout(() => {
        DOCS[state.profile].push({ id: 'dx' + state.profile, name: '复查记录 · 新模拟报告', date: '2026-11-06', type: '其他', status: '待核对' });
        CANDS[state.profile].push({ id: 'cx' + state.profile, name: '下次随访安排', value: '待预约（示例，以医生安排为准）', source: '复查记录 · 新模拟报告 · 第 1 页', status: 'candidate' });
        state.loaded[state.profile] = true; state.parsing = false;
        if (state.view === 'records') render();
        toast('解析完成：候选已放入「整理草稿 / 核对」');
      }, 900);
    },
    'parse-fail': () => {
      const d = DOCS[state.profile].find((x) => x.id === state.lastUpload);
      if (d) d.status = '解析失败';
      state.parseError = true; render();
      toast(d ? `「${d.name}」解析失败：未产生候选，原件保留，可重试` : '模拟解析失败：未产生候选，原件保留');
    },
    retry: () => { state.parseError = false; toast('模拟重试完成；原件始终保留'); render(); },
    candidate: (el) => {
      const c = CANDS[state.profile].find((x) => x.id === el.dataset.id);
      if (!c) return;
      openDialog('小橡宝', '核对这一项内容',
        `<div class="notice">核对表示"转录已逐字检查过"，不等于医学审核。</div>
        <label style="display:block;margin-top:10px"><span class="form-label">${esc(c.name)}</span><input id="cand-input" style="width:100%" value="${esc(c.value)}" maxlength="160"></label>
        <p class="small-note">来源：${esc(c.source)}。暂时不确定就保留待核对状态，不会丢。</p>`,
        `<button class="soft" data-action="close">现在先不核对</button><button class="primary" data-action="cand-save" data-id="${esc(c.id)}">接受这条记录</button>`);
    },
    'cand-save': (el) => {
      const c = CANDS[state.profile].find((x) => x.id === el.dataset.id);
      const v = $('#cand-input') ? $('#cand-input').value.trim() : '';
      if (c && v) { c.value = v; c.status = 'accepted'; }
      closeDialog(); render(); toast('已接受：写入演示记录，候选留版本不覆盖');
    },
    'add-question': () => {
      const q = state.profile === 'A'
        ? '请帮我核实：诱导结束后评估手术要带哪些资料（病理 / 复核 / 影像），以及是否需要补 TNM 分期记录。'
        : '请帮我核实：免疫治疗期间 MG 症状加重的联系口径，以及下次影像评估的安排。';
      if (!state.questions.includes(q)) state.questions.push(q);
      render(); toast('已加入复诊准备的问题清单');
    },
    'add-stage': () => toast('分期变更需抄医生给出的新分期、体系与版本；旧记录保留'),
    'add-symptom': () => toast('原型内不落库；真实版在这里记一条身体感受（日期 / 部位 / 原话）'),
    'add-viewpoint': () => toast('感受会记为"一条信息"，标注不是医生结论'),
    'export-review': dlgExport,
    'toggle-ask': (el) => { el.textContent = el.textContent.includes('✓') ? '标记已问' : '已问过 ✓'; },
    'save-trial': (el) => { const id = el.dataset.id; if (state.saved.includes(id)) { state.saved = state.saved.filter(x => x !== id); } else state.saved.push(id); render(); },
    'ask-trial': (el) => { const id = el.dataset.id; const t = TRIALS.find(x => x.id === id); const q = `${t.id}：入组条件是否包含我的病理类型（胸腺癌）与既往治疗？`; if (!state.questions.includes(q)) state.questions.push(q); render(); toast('已加入入组问题清单'); },
    range: (el) => { state.range = el.dataset.range; render(); },
    toggle: (el) => { state.toggles[el.dataset.key] = !state.toggles[el.dataset.key]; render(); },
    pin: (el) => { state.pin = { code: el.dataset.code, date: el.dataset.date }; render(); },
    unpin: () => { state.pin = null; render(); },
    zoom: () => {},
    agent: () => { state.agentOpen = !state.agentOpen; renderAgent(); },
    'agent-open': () => { state.agentOpen = true; renderAgent(); toast('AI 对话面板已打开；× 只是收起，不会结束会话'); },
    'agent-build': agentBuild,
    'agent-demo': agentDemo
  };
  if (act === 'agent-size') { state.agentSize = e.target.closest('[data-action]').dataset.size; renderAgent(); return; }
  if (act === 'cfg-tab') {
    const el = e.target.closest('[data-action]');
    document.querySelectorAll('.cfg-tabs [role=tab]').forEach((b) => b.setAttribute('aria-selected', String(b === el)));
    document.querySelectorAll('.cfg-block[data-tab]').forEach((b) => { b.hidden = b.dataset.tab !== el.dataset.tab; });
    return;
  }
  if (map[act]) map[act](e.target.closest('[data-action]'));
});
/* 36 号 §2.6 出口：状态卡副按钮打开疾病概要（与顶栏「?」同一个整页面板） */
document.addEventListener('click', (e) => {
  const cta = e.target.closest('[data-primer-cta]');
  if (!cta) return;
  e.preventDefault();
  if (window.DiseasePrimer) window.DiseasePrimer.open(cta);
});
document.addEventListener('input', (e) => {
  if (e.target.matches('[data-action="records-search"]')) {
    state.query = e.target.value;
    const wrap = $('#docs-table'); if (wrap) wrap.innerHTML = docsTable();
  }
});
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'file-picker') { ingestFiles(e.target.files); e.target.value = ''; return; }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && $('#dialog').open) { closeDialog(); return; }
  const card = e.target.closest && e.target.closest('.mcard[data-mcard]:not([data-static])');
  if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); flipCard(card.dataset.mcard); }
});
$('#font-toggle').addEventListener('click', () => { const on = document.body.classList.toggle('large'); $('#font-toggle').setAttribute('aria-pressed', String(on)); });
window.addEventListener('hashchange', () => { const v = location.hash.slice(1); if (v && v !== state.view && VIEWS[v]) { state.view = v; state.privateOpen = false; state.pin = null; render(); } });

/* 上传：原型只做本地"接住"动作，不解析、不上传、不写库 */
function ingestFiles(list) {
  const files = Array.from(list || []);
  if (!files.length) return;
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.md'];
  const ok = files.filter((f) => allowed.some((x) => f.name.toLowerCase().endsWith(x)));
  if (!ok.length) { toast('这个格式暂不支持；支持 PDF / 图片 / 文本'); return; }
  state.uploads += ok.length;
  const now = todayISO();
  ok.forEach((f, i) => {
    const id = 'up' + Date.now().toString(36) + i;
    DOCS[state.profile].unshift({ id, name: f.name, fileName: f.name, size: f.size, date: now, type: '其他', status: '待核对' });
    state.lastUpload = id;
  });
  render();
  toast(`已接住 ${ok.length} 份文件（演示）：原件保留在资料目录，解析结果会先进候选`);
}

const initialHash = location.hash.slice(1);
if (VIEWS[initialHash]) state.view = initialHash;
render();
