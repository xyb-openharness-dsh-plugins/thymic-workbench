/* 小橡宝 ThymPal · 疾病概要数据（36 号）
 * 口径：docs/DISEASE-PRIMER.md；规范：starter docs/36-DISEASE-PRIMER.md。
 * 全部内容属第 ② 层（解释）：只写定义、文件、指南列举过的手段类别、已发生的变化。
 * 任何「你该怎么办」的判断都不在这里，固定出口是「这一句需要问你的医生」。
 *
 * 原件状态照实写：本夜（2026-11-08）未取得 NCCN v2.2025 与 CACA V2.0_2025 全文 PDF，
 * 版本号来自期刊条目 / 平台条目转述（docs/CLINICAL-DATA.md 台账）；分期体系冲突按转述级写明。
 */
window.DISEASE_PRIMER = {
  brand: '小橡宝 ThymPal',
  name: '胸腺癌',
  en: 'Thymic Carcinoma',
  updated: '2026-11-08',
  sections: [
    {
      id: 'definition',
      title: '定义',
      intro: '胸腺癌是发生在胸腺（前纵隔的免疫器官）上皮细胞、行为表现恶性的肿瘤，和常见的"胸腺瘤"是不同的病。'
        + '这台工作台把「病理报告写的到底是什么、复核怎么说」放在第一位，因为瘤与癌的区分直接改变治疗方向。',
      points: [
        '胸腺癌好发于前纵隔；WHO 分类下的主要亚型包括胸腺鳞状细胞癌（最常见）、基底样癌、淋巴上皮癌样癌、肉瘤样癌、黏液表皮样癌、NUT 癌与胸腺神经内分泌癌等；本台按报告原文记录亚型，不合并成「胸腺癌」一个空字段。',
        '胸腺瘤与胸腺癌的区分是病理判断（细胞异型性、组织结构等），由病理医生给出；本台不根据影像或症状推断，只并存记录原报告与复核意见。',
        '分期有两套并存：Masaoka-Koga（国际多数指南沿用）与 TNM（国内 2025 版指南推荐第 9 版）；本台两条并列记录，不换算、不推荐「哪个对」。',
        '重症肌无力（MG）与胸腺肿瘤有关联（以胸腺瘤为主，胸腺癌少见但存在）；本台把 MG 状态作为独立记录线，不自测。'
      ],
      sources: [
        { org: 'WHO', doc: 'Classification of Tumours: Thoracic Tumours（胸腺上皮肿瘤章节）', version: '版本未核实', original: false, page: '页码待核',
          secondaryUrl: 'https://publications.iarc.fr/Book-And-Report-Series/Who-Classification-Of-Tumours', note: 'IARC/WHO 官方书目页；全文需购买，本台未取得' },
        { org: 'NCCN', doc: 'NCCN Guidelines · Thymomas and Thymic Carcinomas', version: 'v2.2025（2025-06-01 发表于 JNCCN 23(6):255）', original: false, page: '页码待核',
          secondaryUrl: 'https://jnccn.org/abstract/jnccn/23/6/article-p255.xml', note: '期刊条目（摘要级）；指南 PDF 全文本夜未取得' }
      ]
    },
    {
      id: 'evidence',
      title: '医学资料规范和指南情况',
      intro: '这台工作台里出现的每一条「该查什么、怎么分期、多久随访」，都应能追到下面某一份文件。'
        + '本项目对胸腺肿瘤的主要指南只核对到「存在与版本号」这一层，全文未取得，具体条文不引用。',
      table: {
        head: ['机构', '文件', '版本 / 年份', '原件', '本台的用途'],
        rows: [
          ['NCCN', 'NCCN Guidelines · Thymomas and Thymic Carcinomas', 'v2.2025', { text: '未取得原件，据 JNCCN 发表条目', kind: 'hub', url: 'https://jnccn.org/abstract/jnccn/23/6/article-p255.xml', note: '期刊条目页（入口页）：指南全文需订阅，本台未取得' }, '治疗类别与随访结构的国际对照；本版不作引用依据'],
          ['CACA', '中国肿瘤整合诊治指南 · 胸腺肿瘤', 'V2.0_2025（2025-01-10）', { text: '未取得原件，据抗癌协会平台 / 指南库条目', kind: 'hub', url: 'https://drugs.dxy.cn/pc/clinicalGuidelines/yfBG5rfYTr4vilhy3rhg9dg', note: '指南库条目页（入口页）：全文未取得，不据此引用条文' }, '国内分期体系口径（推荐 TNM 第 9 版）的对照；本版不作引用依据'],
          ['IASLC / UICC', '胸腺上皮肿瘤 TNM 分期（第 9 版）', '2024 年发布', { text: '未取得原件，据文献转述', nolink: true, note: '无已核实的稳定公开 URL；版本号据转述，未取得原件' }, '分期档案的 TNM 版本字段口径'],
          ['WHO', 'Classification of Tumours: Thoracic Tumours', '版本未核实', { text: '未取得原件，据 IARC 官方书目页', kind: 'hub', url: 'https://publications.iarc.fr/Book-And-Report-Series/Who-Classification-Of-Tumours', note: 'IARC 书目页（入口页）：全文需购买，本台未取得' }, '病理亚型命名口径']
        ]
      },
      points: [
        '分期体系过渡期：国内 2025 版指南推荐 TNM 第 9 版，国际多数指南仍沿用 Masaoka-Koga；两家医院给出不同体系的记录是常见现象——并存记录即可，不需要换算。',
        '指南给的是「通常怎么做」，不是「你该怎么做」；本台引用一律带机构与版本，查不到版本就写「版本未核实」。',
        '中国药物适应证：截至 2026-11-08 的摘要级检索，未检索到任何药物以「胸腺癌」为适应证在中国获批；涉及具体药物时本台只记录医生原文，不写「可用 / 不可用」。',
        '本台 2026-11-08 未探测国内临床试验登记平台的采集可用性；ClinicalTrials.gov 一条通道在线可用，ChiCTR 与药物临床试验登记平台覆盖未知。'
      ],
      sources: [
        { org: 'NCCN', doc: 'NCCN Guidelines · Thymomas and Thymic Carcinomas', version: 'v2.2025', original: false, page: '页码待核',
          secondaryUrl: 'https://jnccn.org/abstract/jnccn/23/6/article-p255.xml', note: 'JNCCN 发表条目；PDF 全文未取得' },
        { org: 'CACA', doc: '中国肿瘤整合诊治指南 · 胸腺肿瘤', version: 'V2.0_2025', original: false, page: '页码待核',
          secondaryUrl: 'https://drugs.dxy.cn/pc/clinicalGuidelines/yfBG5rfYTr4vilhy3rhg9dg', note: '指南库条目（转述级）；全文未核对，不据此引用条文' }
      ]
    },
    {
      id: 'landscape',
      title: '目前治疗全景概要',
      intro: '下面按病期与线序列出指南里出现过的手段类别。这是「世界上大致有哪些办法」的地图，不是给你排的先后顺序，'
        + '也不含剂量、疗程与适用条件——那些必须由医生按你的分期与病理决定。',
      groups: [
        {
          label: '可以手术时',
          points: [
            '手术：完整切除（R0）是胸腺癌的主要治疗手段；是否可切、经什么入路属外科医生判断。',
            '诱导治疗：局部晚期时，文献里常见的做法是先药物治疗后评估手术（方案词表含卡铂+紫杉醇、ADOC、CODE 等）；本台只记录医生写明的方案名。',
            '术后辅助：按病理与分期决定是否加放疗或系统治疗，属医生判断。'
          ]
        },
        {
          label: '不可切除 / 局部晚期',
          points: [
            '同步放化疗：放疗与含铂化疗联合是这一段被列出的路径类别；剂量与分次照抄记录，本台不合成「总剂量当量」。',
            '支持照护：治疗中的不良反应记录与营养支持被列为支持性内容；本台只记录你的症状与检查值。'
          ]
        },
        {
          label: '复发 / 转移后',
          points: [
            '系统治疗：化疗、免疫治疗、靶向治疗等类别在不同情形下被列出。中国尚无以胸腺癌为适应证的获批药物（截至 2026-11-08 摘要级检索）；具体药物与超说明书使用以医生原文为准。',
            '免疫治疗监测：免疫检查点抑制剂可能诱发免疫相关不良反应（含免疫相关性肌无力），治疗期间需按医嘱监测；本台把监测化验与症状记录并置。',
            '局部处理：寡进展灶的放疗或手术在特定情形下被列出。'
          ]
        },
        {
          label: '贯穿全程的两件事',
          points: [
            '影像随访：胸腺癌没有可靠的血清标志物，随访主要靠胸部 CT 等影像；节奏按医嘱，本台不写「标准间隔」。',
            '鉴别诊断与病理复核：前纵隔肿物要先与生殖细胞肿瘤、淋巴瘤等区分（AFP / β-hCG 等是鉴别用检查，不是活动指标）；病理复核是常见做法。'
          ]
        }
      ],
      points: [
        '以上是文献与指南里列出的手段，按病期与线序排列，不代表任何一项适合你。选哪一个，这一句需要问你的医生。'
      ],
      sources: [
        { org: 'NCCN', doc: 'NCCN Guidelines · Thymomas and Thymic Carcinomas', version: 'v2.2025', original: false, page: '页码待核',
          secondaryUrl: 'https://jnccn.org/abstract/jnccn/23/6/article-p255.xml', note: 'JNCCN 发表条目；类别结构据此转述，条文未核对' },
        { org: 'CACA', doc: '中国肿瘤整合诊治指南 · 胸腺肿瘤', version: 'V2.0_2025', original: false, page: '页码待核',
          secondaryUrl: 'https://drugs.dxy.cn/pc/clinicalGuidelines/yfBG5rfYTr4vilhy3rhg9dg', note: '指南库条目（转述级）' }
      ]
    },
    {
      id: 'trend',
      title: '发展趋势',
      intro: '这一段只写已经发生的事：哪一版分期在什么时候发布、登记平台上能检索到多少条、哪个渠道没查。不写预测，不做评价。',
      points: [
        '2024 年：胸腺上皮肿瘤 TNM 分期第 9 版发布；2025-01-10 中国抗癌协会发布胸腺肿瘤指南 V2.0_2025，推荐临床病理分期使用 TNM（第 9 版）、不再使用 Masaoka-Koga（据平台条目转述）。',
        '2025-06-01：NCCN 胸腺瘤和胸腺癌指南 v2.2025 发表于 JNCCN；国际主流指南仍多用 Masaoka-Koga——两套体系并存是当前的真实状态。',
        '截至 2026-11-08：ClinicalTrials.gov 以 query.cond=thymic carcinoma 检索在招 / 活跃试验，演示摘录 8 条（免疫、ADC、CAR-T、分子真实世界等方向）；状态未核实，以研究中心为准。',
        '仑伐替尼单药已获日本批准用于不可切除胸腺癌；截至 2026-11-08 摘要级检索，中国未批准该适应证（据文献转述，未逐条核药监数据库）。'
      ],
      sources: [
        { org: 'JNCCN', doc: 'NCCN Thymomas and Thymic Carcinomas v2.2025（Riely 等）', version: '2025;23(6):255', original: false, page: '摘要级',
          secondaryUrl: 'https://jnccn.org/abstract/jnccn/23/6/article-p255.xml', note: '发表条目；指南全文未取得' },
        { org: 'ClinicalTrials.gov', doc: 'API v2 检索（query.cond=thymic carcinoma；RECRUITING / ACTIVE_NOT_RECRUITING）', version: '检索日 2026-11-08', original: true, nolink: true, note: '一手登记数据，本项目自采；快照将存 research/thymic-carcinoma/，演示摘录 8 条见原型' },
        { org: 'WCLC 2025（转述）', doc: '关于 TNM 第 9 版国内外过渡期的会议报道', version: '2025-09', original: false, nolink: true, page: '转述级', note: '据会议报道转述；未取得原始幻灯' }
      ]
    }
  ]
};
