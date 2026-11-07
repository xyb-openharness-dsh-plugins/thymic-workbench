'use strict';
/* 小橡宝 ThymPal v0.2.0 — 演示数据（唯一源）。
   两套合成档案：A = 刚确诊（诱导化疗中，记录少、多处未知）；B = 术后 4 年随访 + 复发后免疫治疗 + 合并重症肌无力（记录多）。
   全部为合成示例，不冒充真实病历；临床试验为真实登记摘录（状态未核实）。
   生成说明：本文件为手写唯一源；业务库 demo 数据构建器（M3/M4）从这里派生，页面不写死数字。 */
window.DEMO_DATA = {
  profiles: {
    A: {
      name: '陈志明', sex: '男', age: 58,
      meta: '胸腺鳞癌 · 诱导化疗中', headline: '先把手头这套诱导化疗做完，再评估能不能手术。',
      histology: '胸腺鳞状细胞癌', mindset: '想确认诱导后评估手术要带哪些资料。',
      path: ['诱导化疗中', '手术待评估'],
      /* 分期双体系：A 只有 Masaoka-Koga 记录（初诊医院），TNM 未记录 —— 空态演示 */
      stageMK: { title: 'Masaoka-Koga 分期（初诊医院记录）', rows: [
        ['分期', 'III 期', '2026-08-14 · 胸外科门诊记录原话', '医生给出'],
        ['依据原文', '「肿瘤侵及心包，可整块切除」，未提淋巴结', '2026-08-14 门诊病历摘录', '原文照抄']
      ] },
      stageTNM: null,
      pathology: {
        title: '原发病理报告（2026-08-02 穿刺活检）', status: '已核对',
        rows: [['病理名称（原文）', '（前纵隔）胸腺鳞状细胞癌'], ['机构', '市第一医院 病理科'], ['免疫组化', 'CD5 (+)，P40 (+)，CK5/6 (+)'], ['报告日期', '2026-08-02']],
        gaps: [['PD-L1 表达', '报告未写 TPS 数值，需问医生'], ['胸腺瘤/胸腺癌鉴别依据', '报告中未单列说明']],
        review: null
      },
      molecular: [
        { k: 'CD5', v: '(+)', src: '穿刺活检 IHC', note: '—', state: 'ok' },
        { k: 'P40', v: '(+)', src: '穿刺活检 IHC', note: '—', state: 'ok' },
        { k: 'PD-L1 TPS', v: '未记录', src: '—', note: '报告未写数值', state: 'na' },
        { k: 'AFP / β-hCG（鉴别）', v: '见化验', src: '化验单', note: '用于鉴别生殖细胞肿瘤，不是胸腺癌活动指标', state: 'warn' }
      ],
      mg: { status: '未记录', rows: [] },
      immune: null,
      surgery: null,
      rt: null,
      imaging: { title: '影像报告', rows: [
        ['2026-08-01', '胸部增强 CT', '前纵隔占位，约 5.2×4.1 cm，与心包关系密切（摘录）', '诱导化疗后复查（医生安排）'],
        ['2026-09-26', '胸部增强 CT', '病灶较前缩小（摘录自报告结论行）', '诱导结束后再评估（医生安排）']
      ] },
      rhythm: [
        ['诱导化疗第 3 周期', '每 21 天', '医嘱', '2026-10-27（已安排）'],
        ['诱导后评估（影像+外科会诊）', '诱导结束后', '医生原话', '待预约'],
        ['血常规', '每周期前', '医嘱', '随化疗']
      ],
      lines: [
        { name: '诱导化疗', detail: '卡铂 + 紫杉醇（医生原话，按周期记录）', done: false },
        { name: '根治性手术（评估中）', detail: '诱导结束后由外科评估，工作台不预判', done: false }
      ],
      cycles: [
        ['诱导化疗 C1', '2026-09-05', '卡铂+紫杉醇', '已完成', true],
        ['诱导化疗 C2', '2026-09-26', '卡铂+紫杉醇', '已完成', true],
        ['诱导化疗 C3', '2026-10-27', '卡铂+紫杉醇', '已安排', false]
      ],
      events: [
        ['2026-08-01', '确诊前 CT 发现前纵隔占位'],
        ['2026-08-02', '穿刺活检病理：胸腺鳞状细胞癌'],
        ['2026-08-14', '分期记录：Masaoka-Koga III 期'],
        ['2026-09-05', '诱导化疗开始（C1）'],
        ['2026-09-26', '诱导化疗 C2 + 复查 CT']
      ],
      dash_keys: ['afp', 'wbc', 'fatigue'],
      metrics: [
        { key: 'afp', cat: '鉴别参考', color: '#8a6d1d', name: 'AFP（鉴别）', unit: 'ng/mL', dec: 1, note: '用于鉴别生殖细胞肿瘤，非胸腺癌活动指标', band: [0, 7], points: [
          { d: '2026-08-03', v: 3.2, src: '市一院 化验单' }, { d: '2026-09-26', v: 2.9, src: '市一院 化验单' }] },
        { key: 'bhcg', cat: '鉴别参考', color: '#a08a2e', name: 'β-hCG（鉴别）', unit: 'mIU/mL', dec: 2, note: '同上：鉴别用，不看升降下结论', band: [0, 5], points: [
          { d: '2026-08-03', v: 1.1, src: '市一院 化验单' }, { d: '2026-09-26', v: 0.9, src: '市一院 化验单' }] },
        { key: 'wbc', cat: '血象', color: '#3e6f9e', name: '白细胞', unit: '×10⁹/L', dec: 1, note: '化疗期间按周期记录', band: [3.5, 9.5], points: [
          { d: '2026-09-03', v: 5.6, src: '化疗前血常规' }, { d: '2026-09-24', v: 3.1, src: '化疗前血常规' }, { d: '2026-10-25', v: 4.2, src: '化疗前血常规' }] },
        { key: 'neut', cat: '血象', color: '#5b87b5', name: '中性粒细胞绝对值', unit: '×10⁹/L', dec: 2, note: '同上', band: [1.8, 6.3], points: [
          { d: '2026-09-03', v: 3.4, src: '化疗前血常规' }, { d: '2026-09-24', v: 1.6, src: '化疗前血常规' }, { d: '2026-10-25', v: 2.5, src: '化疗前血常规' }] },
        { key: 'fatigue', cat: '自述', color: '#7a5c9e', name: '疲乏（自述）', unit: '', dec: null, note: '本人自述档位，不是医生分级', points: [
          { d: '2026-09-10', v: '轻度', src: '本人记录' }, { d: '2026-10-02', v: '明显', src: '本人记录' }] },
        { key: 'mg_state', cat: '自述', color: '#9e5c5c', name: '重症肌无力状态', unit: '', dec: null, note: '只记医生写明的状态，不自测', points: [
          { d: '2026-08-14', v: '未记录', src: '门诊记录' }] }
      ],
      docs: [
        ['d1', '穿刺活检病理报告（原报告）', '2026-08-02', '病理报告', '已核对'],
        ['d2', '胸部增强 CT 报告（初诊）', '2026-08-01', '影像报告', '已核对'],
        ['d3', '化疗前血常规（C2）', '2026-09-24', '化验单', '已入库'],
        ['d4', '诱导化疗知情记录', '2026-09-05', '治疗记录', '待核对'],
        ['d5', '出院小结（初诊住院）', '2026-08-20', '出院记录', '已核对']
      ],
      candidates: [
        ['c1', 'PD-L1 TPS 数值', '未记录（报告未写）', '穿刺活检病理报告 · 第 2 页', 'candidate'],
        ['c2', 'TNM 分期', '初诊医院未给 TNM，仅 Masaoka-Koga', '分期记录 · 2026-08-14', 'candidate'],
        ['c3', '诱导后评估日期', '待预约', '门诊记录 · 2026-09-26', 'candidate']
      ],
      viewpoints: [
        ['2026-09-05', '治疗开始', '第一周期反应比想象的大，记下来给医生看', true],
        ['2026-09-26', '复查等待', '等 CT 报告的几天最熬人', true]
      ],
      symptoms: [
        ['2026-09-10', '疲乏', '走两层楼要歇一次', false],
        ['2026-09-28', '进食', '化疗后两天没胃口', false],
        ['2026-10-03', '眼睑', '傍晚有点沉，说不清是不是没睡好', true]
      ],
      familyTalk: '和家人约好：复查结果当天晚上一起听医生的原话，不互相猜。'
    },
    B: {
      name: '林淑华', sex: '女', age: 63,
      meta: '胸腺鳞癌 · 术后 4 年 · 复发后免疫治疗中 · 合并重症肌无力',
      headline: '复查、肌无力和免疫治疗三条线，都按医生原话记。',
      histology: '胸腺鳞状细胞癌',
      mindset: '想弄清免疫治疗期间眼睑下垂加重要不要马上说。',
      path: ['术后随访 4 年', '2025 复发', '免疫治疗中', 'MG 合并'],
      stageMK: { title: 'Masaoka-Koga 分期（手术医院记录）', rows: [
        ['分期', 'II 期（手术病理）', '2022-03-18 · 手术病理记录', '医生给出'],
        ['依据原文', '「肿瘤完整切除，镜下侵及包膜外脂肪」', '2022-03-18 病理报告摘录', '原文照抄']
      ] },
      stageTNM: { title: 'TNM 分期（2025 复发评估，另一家医院）', rows: [
        ['分期', 'T2 N0 M1（肝转移，医生原文）', '2025-06-10 · 复发评估记录', '医生给出'],
        ['版本', '医生注明「按第 8 版」', '2025-06-10 门诊记录', '原文照抄'],
        ['与 Masaoka-Koga 的关系', '两套体系并存记录，工作台不做换算', '本台口径', '不换算']
      ] },
      pathology: {
        title: '原发病理报告（2022-03-18 手术切除）', status: '已核对',
        rows: [['病理名称（原文）', '（前纵隔）胸腺鳞状细胞癌'], ['机构', '省肿瘤医院 病理科'], ['切缘', '镜下切缘阴性（R0，医生原话）'], ['淋巴结', '采样 3 枚，未见转移'], ['免疫组化', 'CD5 (+)，P40 (+)，Ki-67 约 30%']],
        gaps: [['PD-L1 表达', '2022 年报告未做，2025 复发评估补做（结果见复核）']],
        review: {
          title: '病理复核意见（外院第二意见，2025-07-02）',
          rows: [['复核机构', '大学附属医院 病理科'], ['复核结论（原文）', '符合胸腺鳞状细胞癌，与原诊断一致'], ['补充', '复核切片中见局灶坏死，不影响分型结论'], ['与原报告关系', '并存记录，不覆盖原报告']]
        }
      },
      molecular: [
        { k: 'CD5', v: '(+)', src: '手术病理 IHC', note: '—', state: 'ok' },
        { k: 'P40', v: '(+)', src: '手术病理 IHC', note: '—', state: 'ok' },
        { k: 'PD-L1 TPS', v: '45%（复核机构检测）', src: '2025-07-02 复核报告', note: '数值照抄报告', state: 'ok' },
        { k: 'AFP / β-hCG（鉴别）', v: '历年随访均阴性区间', src: '随访化验单', note: '鉴别用，非活动指标', state: 'ok' }
      ],
      mg: { status: '医生确诊', rows: [
        ['2023-11-06', '新发眼睑下垂', '神经内科诊断重症肌无力（医生原话），胸腺术后 1 年余新发'],
        ['2023-11-08', '用药记录', '溴吡斯的明（剂量按医嘱，工作台不抄剂量到摘要）'],
        ['2025-07-15', '免疫治疗期间评估', '神内科随诊：症状可控，免疫治疗期间加强观察（医生原话）']
      ] },
      immune: { rows: [
        ['2025-08-01', '免疫治疗开始', '帕博利珠单抗（医生原话），每 21 天一次'],
        ['2025-09-12', 'irAE 监测', '甲功、血糖、肝酶按周期查（医嘱）'],
        ['2025-11-20', '影像评估', '肝转移灶缩小（报告摘录，见影像页）']
      ] },
      surgery: { title: '手术记录（2022-03-18）', rows: [
        ['2022-03-18', '胸腺扩大切除术', '正中劈开入路', '胸腺+前纵隔脂肪清扫', '切缘阴性（R0）', '省肿瘤医院', '手术顺利；术后病理见分期页']
      ] },
      rt: { title: '术后辅助放疗（2022-04）', rows: [
        ['EBRT', '术后辅助', '50 Gy / 25 f', '2022-04-06 → 2022-05-11', '瘤床区（医生记录摘录）']
      ] },
      imaging: { title: '影像随访', rows: [
        ['2022-06-20', '胸部 CT', '术后改变，未见复发征象（摘录）', '2022-12 复查'],
        ['2022-12-12', '胸部 CT', '未见复发征象（摘录）', '2023-12 复查'],
        ['2023-12-08', '胸部 CT', '未见复发征象（摘录）', '2024-12 复查'],
        ['2024-12-05', '胸部 CT', '未见复发征象（摘录）', '2025-06 复查（医嘱提前）'],
        ['2025-06-08', '胸腹增强 CT', '肝内新发病灶，考虑转移（摘录自报告结论）', '2025-08 免疫治疗后评估'],
        ['2026-10-30', '胸部 CT + 肝 MRI', '肝病灶较前缩小（摘录）', '2027-01 复查（医嘱）']
      ] },
      rhythm: [
        ['免疫治疗周期', '每 21 天', '医嘱', '2026-11-17（已安排）'],
        ['影像复查（胸 CT + 肝 MRI）', '每 3 个月', '医生原话', '2027-01 中（估算）'],
        ['甲功 + 血糖 + 肝酶', '每周期', 'irAE 监测医嘱', '随免疫治疗'],
        ['神经内科随诊（MG）', '每 3 个月', '神内科医嘱', '2027-01（已约）']
      ],
      lines: [
        { name: '手术 + 术后辅助放疗', detail: '2022-03 手术；2022-04~05 辅助放疗', done: true },
        { name: '复发后免疫治疗', detail: '2025-08 起（医生原话）', done: false }
      ],
      cycles: [
        ['术后辅助放疗', '2022-04-06', '50 Gy/25f', '已完成', true],
        ['免疫治疗 C1', '2025-08-01', '帕博利珠单抗', '已完成', true],
        ['免疫治疗 C2', '2025-08-22', '帕博利珠单抗', '已完成', true],
        ['免疫治疗 C3', '2025-09-12', '帕博利珠单抗', '已完成', true],
        ['免疫治疗 C4–C6', '2025-10-10', '帕博利珠单抗', '已完成', true],
        ['免疫治疗 C7–C9', '2025-12-01', '帕博利珠单抗', '已完成', true],
        ['免疫治疗 C10–C12', '2026-02-20', '帕博利珠单抗', '已完成', true],
        ['免疫治疗 C13–C15', '2026-05-15', '帕博利珠单抗', '已完成', true],
        ['免疫治疗 C16', '2026-08-10', '帕博利珠单抗', '已完成', true],
        ['免疫治疗 C17', '2026-10-27', '帕博利珠单抗', '已完成', true]
      ],
      events: [
        ['2022-03-18', '手术：胸腺扩大切除'],
        ['2022-03-18', '病理确诊：胸腺鳞状细胞癌'],
        ['2022-04-06', '术后辅助放疗开始'],
        ['2023-11-06', '新发重症肌无力（神经内科确诊）'],
        ['2025-06-08', '复查发现肝转移（复发）'],
        ['2025-07-02', '病理复核（外院第二意见）'],
        ['2025-08-01', '免疫治疗开始'],
        ['2025-11-20', '首次评估：病灶缩小（报告摘录）'],
        ['2026-10-30', '最近一次影像复查']
      ],
      dash_keys: ['afp', 'cre', 'fatigue', 'mg_state'],
      metrics: [
        { key: 'afp', cat: '鉴别参考', color: '#8a6d1d', name: 'AFP（鉴别）', unit: 'ng/mL', dec: 1, note: '鉴别生殖细胞肿瘤用，历年随访记录', band: [0, 7], points: [
          { d: '2022-06-20', v: 2.4, src: '随访化验' }, { d: '2023-01-15', v: 2.2, src: '随访化验' }, { d: '2023-12-08', v: 2.6, src: '随访化验' }, { d: '2024-12-05', v: 2.3, src: '随访化验' }, { d: '2025-06-08', v: 2.5, src: '复发评估' }, { d: '2025-11-20', v: 2.4, src: '免疫治疗评估' }, { d: '2026-04-15', v: 2.2, src: '随访化验' }, { d: '2026-10-30', v: 2.3, src: '随访化验' }] },
        { key: 'bhcg', cat: '鉴别参考', color: '#a08a2e', name: 'β-hCG（鉴别）', unit: 'mIU/mL', dec: 2, note: '同上', band: [0, 5], points: [
          { d: '2022-06-20', v: 1.2, src: '随访化验' }, { d: '2024-12-05', v: 0.8, src: '随访化验' }, { d: '2026-10-30', v: 1.0, src: '随访化验' }] },
        { key: 'wbc', cat: '血象', color: '#3e6f9e', name: '白细胞', unit: '×10⁹/L', dec: 1, note: '随访+免疫治疗期间', band: [3.5, 9.5], points: [
          { d: '2022-06-20', v: 5.8, src: '随访化验' }, { d: '2023-12-08', v: 6.1, src: '随访化验' }, { d: '2025-08-01', v: 5.4, src: '免疫治疗前' }, { d: '2025-11-20', v: 4.9, src: '免疫治疗评估' }, { d: '2026-08-10', v: 5.2, src: '免疫治疗前' }, { d: '2026-10-27', v: 5.0, src: '免疫治疗前' }] },
        { key: 'lym', cat: '血象', color: '#5b87b5', name: '淋巴细胞绝对值', unit: '×10⁹/L', dec: 2, note: '免疫治疗期间关注（医嘱）', band: [1.1, 3.2], points: [
          { d: '2025-08-01', v: 1.8, src: '免疫治疗前' }, { d: '2025-11-20', v: 1.5, src: '免疫治疗评估' }, { d: '2026-04-15', v: 1.6, src: '随访化验' }, { d: '2026-10-27', v: 1.7, src: '免疫治疗前' }] },
        { key: 'cre', cat: '生化', color: '#4c8a6a', name: '肌酐', unit: 'μmol/L', dec: 0, note: '免疫治疗期间按医嘱查', band: [45, 84], points: [
          { d: '2025-08-01', v: 62, src: '免疫治疗前' }, { d: '2025-11-20', v: 66, src: '免疫治疗评估' }, { d: '2026-10-27', v: 64, src: '免疫治疗前' }] },
        { key: 'gluc', cat: '生化', color: '#6a9a4c', name: '空腹血糖', unit: 'mmol/L', dec: 1, note: '激素与免疫治疗期间监测（医嘱）', band: [3.9, 6.1], points: [
          { d: '2025-08-01', v: 5.2, src: '免疫治疗前' }, { d: '2025-11-20', v: 6.0, src: '免疫治疗评估' }, { d: '2026-02-20', v: 5.6, src: '免疫治疗前' }, { d: '2026-10-27', v: 5.4, src: '免疫治疗前' }] },
        { key: 'tsh', cat: '免疫相关', color: '#9e6a8a', name: 'TSH', unit: 'mIU/L', dec: 2, note: 'irAE 监测项目（医嘱），报告结论以医生为准', band: [0.55, 4.78], points: [
          { d: '2025-08-01', v: 2.1, src: '免疫治疗前' }, { d: '2025-11-20', v: 5.6, src: 'irAE 监测' }, { d: '2026-04-15', v: 4.9, src: 'irAE 监测' }, { d: '2026-10-27', v: 4.2, src: 'irAE 监测' }] },
        { key: 'fatigue', cat: '自述', color: '#7a5c9e', name: '疲乏（自述）', unit: '', dec: null, note: '本人自述档位，不是医生分级', points: [
          { d: '2025-08-10', v: '轻度', src: '本人记录' }, { d: '2025-12-01', v: '明显', src: '本人记录' }, { d: '2026-02-25', v: '轻度', src: '本人记录' }, { d: '2026-06-15', v: '轻度', src: '本人记录' }, { d: '2026-10-28', v: '轻度', src: '本人记录' }] },
        { key: 'mg_state', cat: '自述', color: '#9e5c5c', name: '重症肌无力状态', unit: '', dec: null, note: '只记医生写明的状态，不自测', points: [
          { d: '2022-06-20', v: '未记录', src: '随访记录' }, { d: '2023-11-06', v: '医生疑似', src: '神内科首诊' }, { d: '2023-11-20', v: '医生确诊', src: '神内科诊断' }] }
      ],
      docs: [
        ['d1', '手术病理报告（原报告）', '2022-03-18', '病理报告', '已核对'],
        ['d2', '病理复核意见（外院）', '2025-07-02', '病理报告', '已核对'],
        ['d3', '手术记录', '2022-03-18', '手术记录', '已核对'],
        ['d4', '术后辅助放疗记录', '2022-05-11', '治疗记录', '已核对'],
        ['d5', '复发评估 CT 报告', '2025-06-08', '影像报告', '已核对'],
        ['d6', '免疫治疗知情记录', '2025-08-01', '治疗记录', '已核对'],
        ['d7', '神经内科 MG 诊断记录', '2023-11-06', '其他', '已核对'],
        ['d8', '最近一次化验单（irAE 监测）', '2026-10-27', '化验单', '待核对'],
        ['d9', '最近一次影像报告', '2026-10-30', '影像报告', '待核对']
      ],
      candidates: [
        ['c1', '最近一次 TSH 结论', '5.6 → 4.2（报告数值）', 'irAE 监测化验单 · 2026-10-27', 'candidate'],
        ['c2', '下次影像复查日期', '2027-01 中（医嘱估算）', '门诊记录 · 2026-10-30', 'candidate'],
        ['c3', 'MG 用药清单更新', '溴吡斯的明（以医嘱为准）', '神内科随诊 · 2025-07-15', 'accepted'],
        ['c4', '免疫治疗周期数', 'C17 已完成（治疗记录）', '治疗记录 · 2026-10-27', 'accepted']
      ],
      viewpoints: [
        ['2025-06-10', '复发', '四年没出问题，这次复发消息是女儿先看到的报告', true],
        ['2025-08-05', '治疗开始', '免疫治疗比化疗轻松，但每个月都在等下一次评估', true],
        ['2026-10-31', '复查', '这次报告说缩小，我先记下来，下次门诊问维持多久评估一次', true]
      ],
      symptoms: [
        ['2025-08-12', '眼睑下垂', '下午明显，早上好一些', false],
        ['2025-12-03', '疲乏+眼睑', '把MG药时间和免疫治疗时间错开记', false],
        ['2026-03-10', '情绪', '怕复查，怕数字，不想让老伴看出紧张', true],
        ['2026-10-28', '眼睑', '比上个月轻，继续记', false]
      ],
      familyTalk: '和女儿约定：报告先由她拍照存档，医保与病退材料她帮着整理，我不重复记第二份。'
    }
  },
  /* 真实登记摘录（ClinicalTrials.gov 在线通道；采集窗口 2026-11-08；状态未核实，以研究中心为准）。
     ChiCTR / 中国药物临床试验登记平台本轮未采集，覆盖未知。 */
  trials: [
    { id: 'NCT06838910', title: 'Tislelizumab Combined With Anlotinib as Second-line Therapy in Thymoma and Thymic Carcinoma', phase: 'PHASE2', status: 'RECRUITING', sponsor: 'The First Affiliated Hospital with Nanjing Medical University', topic: '免疫治疗', url: 'https://clinicaltrials.gov/study/NCT06838910', last_verified: '2026-11-08' },
    { id: 'NCT06248515', title: 'A Phase II Trial of Sacituzumab Govitecan in Patients With Advanced Thymic Epithelial Tumors', phase: 'PHASE2', status: 'RECRUITING', sponsor: 'Georgetown University', topic: '靶向 / ADC', url: 'https://clinicaltrials.gov/study/NCT06248515', last_verified: '2026-11-08' },
    { id: 'NCT03076554', title: 'A Pilot Study … Avelumab (MSB0010718C) in Thymoma and Thymic Carcinoma After Progression on Platinum-Based Chemotherapy', phase: 'PHASE2', status: 'ACTIVE_NOT_RECRUITING', sponsor: 'National Cancer Institute (NCI)', topic: '免疫治疗', url: 'https://clinicaltrials.gov/study/NCT03076554', last_verified: '2026-11-08' },
    { id: 'NCT06790706', title: 'IMMUNORARE5: Phase II Platform … Domvanalimab + Zimberelimab in Advanced RARE Cancers', phase: 'PHASE2', status: 'ACTIVE_NOT_RECRUITING', sponsor: 'Hospices Civils de Lyon', topic: '免疫治疗', url: 'https://clinicaltrials.gov/study/NCT06790706', last_verified: '2026-11-08' },
    { id: 'NCT06885697', title: 'Anti-Mesothelin CAR T Cells (TNhYP218) in Mesothelin-Expressing Solid Tumors Including Mesothelioma', phase: 'PHASE1', status: 'RECRUITING', sponsor: 'National Cancer Institute (NCI)', topic: 'CAR-T / 新药', url: 'https://clinicaltrials.gov/study/NCT06885697', last_verified: '2026-11-08' },
    { id: 'NCT05667948', title: 'Molecular Analysis and Treatment Options of Thymic Malignancies', phase: 'N/A', status: 'RECRUITING', sponsor: 'Shanghai Chest Hospital', topic: '分子 / 真实世界', url: 'https://clinicaltrials.gov/study/NCT05667948', last_verified: '2026-11-08' },
    { id: 'NCT07429851', title: 'Comparative Analysis Between Thymic, Pulmonary and Pancreatic Well Differentiated High Grade Neuroendocrine Tumors', phase: 'N/A', status: 'RECRUITING', sponsor: 'European Institute of Oncology', topic: '分子 / 真实世界', url: 'https://clinicaltrials.gov/study/NCT07429851', last_verified: '2026-11-08' },
    { id: 'NCT07072143', title: 'An International Study on Pediatric Patients With Rare Tumors', phase: 'N/A', status: 'RECRUITING', sponsor: 'Azienda Ospedaliera di Padova', topic: '分子 / 真实世界', url: 'https://clinicaltrials.gov/study/NCT07072143', last_verified: '2026-11-08' }
  ]
};
