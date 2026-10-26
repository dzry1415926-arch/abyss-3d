/* ABYSS — 双语词条与物种数据
 * 所有用户可见文字必须在此登记；组件内不得硬编码中英文判断。
 */
(function () {
  const A = (window.ABYSS = window.ABYSS || {});

  // ---------------------------------------------------------------- 界面词条
  const UI = {
    zh: {
      'start.kicker': '深海生态观测计划 · 站点 AB-07',
      'start.title': 'ABYSS',
      'start.sub': '海山侧翼 · 300–1120 m',
      'start.desc': '你正悬浮在一座海山的西南侧翼。下方是深渊平原与一道冷泉峡谷，西侧是尚未被照亮的岩壁。探照灯是这里唯一的光。',
      'start.enter': '开始下潜',
      'start.note': '建议使用桌面浏览器 · 耳机体验更佳',
      'start.controls': '操作',

      'ctl.move': '移动',
      'ctl.vertical': '上浮 / 下潜',
      'ctl.look': '观察',
      'ctl.lamp': '探照灯',
      'ctl.select': '查看生物',
      'ctl.log': '图鉴',
      'ctl.esc': '关闭 / 解锁',
      'ctl.lookLock': '移动鼠标',
      'ctl.lookDrag': '拖拽鼠标',
      'ctl.selectLock': '左键（准星）',
      'ctl.selectDrag': '左键点击',

      'hud.depth': '深度',
      'hud.temp': '水温',
      'hud.pres': '压力',
      'hud.lamp': '探照灯',
      'hud.on': '开',
      'hud.off': '关',
      'hud.found': '已记录',
      'hud.log': '图鉴',
      'hud.site': 'AB-07 · 海山侧翼',
      'hud.unitAtm': 'atm',
      'hud.unitC': '°C',

      'zone.crest': '海山脊顶',
      'zone.flank': '侧翼陡坡',
      'zone.plain': '深渊平原',
      'zone.canyon': '峡谷冷泉',
      'zone.crest.en': 'SEAMOUNT CREST',
      'zone.flank.en': 'STEEP FLANK',
      'zone.plain.en': 'ABYSSAL PLAIN',
      'zone.canyon.en': 'CANYON SEEP',

      'codex.specimen': '标本',
      'codex.depth': '栖息深度',
      'codex.size': '体型',
      'codex.habitat': '栖息环境',
      'codex.morphology': '形态特征',
      'codex.ecology': '生态习性',
      'codex.taxon': '分类',
      'codex.biolum': '生物发光',
      'codex.biolumYes': '有',
      'codex.biolumNo': '无',
      'codex.range': '深度分布',
      'codex.current': '当前位置',
      'codex.class': '纲',
      'codex.family': '科',
      'codex.prev': '上一物种',
      'codex.next': '下一物种',
      'codex.close': '关闭',
      'codex.new': '首次记录',
      'codex.hint': '关闭后返回原位置继续探索',
      'ticker.hint': '点击查看',
      'start.st.species': '物种',
      'start.st.span': '米落差',
      'start.st.dof': '自由度',

      'log.title': '探索记录',
      'log.sub': 'FIELD LOG',
      'log.progress': '已记录物种',
      'log.locked': '未识别',
      'log.lockedHint': '在环境中发现后解锁',
      'log.close': '关闭',
      'log.empty': '尚未记录任何物种',
      'log.note': '深度与分布为基于公开资料的模拟设定，非精确科考数据。',

      'toast.discovered': '已记录：{name}',
      'toast.toofar': '距离过远，靠近后再查看',
      'toast.boundary': '已到达观测边界',
      'toast.lampOn': '探照灯开启',
      'toast.lampOff': '探照灯关闭',
      'toast.reset': '观测记录已清除',

      'resume.title': '已暂停',
      'resume.hint': '点击继续探索',
      'drag.hint': '拖拽鼠标环顾 · 点击生物查看资料',

      'load.generating': '正在构建海山地形',
      'load.placing': '正在布置生物群落',
      'load.ready': '准备就绪',

      'ui.lang': '语言',
      'ui.help': '帮助',
      'ui.reset': '清除记录',
      'ui.sound': '环境声',

      // ---- 移动速度
      'hud.speed': '移动速度',
      'speed.slow': '慢速',
      'speed.normal': '正常',
      'speed.fast': '快速',
      'speed.custom': '自定义',
      'speed.hint': '慢速适合精细定位，快速适合大范围转移',

      // ---- 标本查看器
      'spec.drag': '拖拽旋转 · 滚轮缩放 · 双击复位',
      'spec.loading': '正在载入标本',
      'spec.ready': '标本',
      'spec.spin': '自转',
      'spec.reset': '复位视角',
      'spec.fail.no-data': '缺少该物种的档案数据',
      'spec.fail.no-model': '该物种尚未登记三维模型',
      'spec.fail.no-cache': '模型尚未载入完成，请稍候重试',
      'spec.fail.instance': '模型实例化失败，几何数据可能损坏',
      'spec.fail.instance-null': '无法创建该标本的展示副本',
      'spec.fail.webgl': '当前浏览器或显卡不支持第二个 WebGL 上下文',
      'spec.size': '展示尺寸'
    },
    en: {
      'start.kicker': 'DEEP SEA OBSERVATION PROGRAM · SITE AB-07',
      'start.title': 'ABYSS',
      'start.sub': 'SEAMOUNT FLANK · 300–1120 m',
      'start.desc': 'You are suspended above the south-western flank of a seamount. Below lies the abyssal plain and a cold-seep canyon; to the west, a wall that has never been lit. Your lamp is the only light here.',
      'start.enter': 'BEGIN DIVE',
      'start.note': 'Desktop browser recommended · headphones enhance the experience',
      'start.controls': 'CONTROLS',

      'ctl.move': 'Move',
      'ctl.vertical': 'Ascend / descend',
      'ctl.look': 'Look',
      'ctl.lamp': 'Searchlight',
      'ctl.select': 'Inspect',
      'ctl.log': 'Field log',
      'ctl.esc': 'Close / release',
      'ctl.lookLock': 'Move mouse',
      'ctl.lookDrag': 'Drag mouse',
      'ctl.selectLock': 'Left click (reticle)',
      'ctl.selectDrag': 'Left click',

      'hud.depth': 'DEPTH',
      'hud.temp': 'TEMP',
      'hud.pres': 'PRESS',
      'hud.lamp': 'LAMP',
      'hud.on': 'ON',
      'hud.off': 'OFF',
      'hud.found': 'LOGGED',
      'hud.log': 'FIELD LOG',
      'hud.site': 'AB-07 · SEAMOUNT FLANK',
      'hud.unitAtm': 'atm',
      'hud.unitC': '°C',

      'zone.crest': 'Seamount crest',
      'zone.flank': 'Steep flank',
      'zone.plain': 'Abyssal plain',
      'zone.canyon': 'Canyon seep',
      'zone.crest.en': 'SEAMOUNT CREST',
      'zone.flank.en': 'STEEP FLANK',
      'zone.plain.en': 'ABYSSAL PLAIN',
      'zone.canyon.en': 'CANYON SEEP',

      'codex.specimen': 'SPECIMEN',
      'codex.depth': 'DEPTH RANGE',
      'codex.size': 'SIZE',
      'codex.habitat': 'HABITAT',
      'codex.morphology': 'MORPHOLOGY',
      'codex.ecology': 'ECOLOGY',
      'codex.taxon': 'TAXONOMY',
      'codex.biolum': 'BIOLUMINESCENCE',
      'codex.biolumYes': 'Yes',
      'codex.biolumNo': 'No',
      'codex.range': 'DEPTH',
      'codex.current': 'YOU ARE HERE',
      'codex.class': 'CLASS',
      'codex.family': 'FAMILY',
      'codex.prev': 'PREVIOUS',
      'codex.next': 'NEXT',
      'codex.close': 'CLOSE',
      'codex.new': 'FIRST RECORD',
      'codex.hint': 'Close to return to your position',
      'ticker.hint': 'CLICK TO INSPECT',
      'start.st.species': 'SPECIES',
      'start.st.span': 'M OF WATER',
      'start.st.dof': 'DEGREES',

      'log.title': 'Field log',
      'log.sub': 'SPECIES RECORDED',
      'log.progress': 'Recorded',
      'log.locked': 'UNIDENTIFIED',
      'log.lockedHint': 'Unlocks when found in the environment',
      'log.close': 'CLOSE',
      'log.empty': 'No species recorded yet',
      'log.note': 'Depths and distributions are simulation settings based on public sources, not survey data.',

      'toast.discovered': 'Logged: {name}',
      'toast.toofar': 'Too far away — move closer',
      'toast.boundary': 'Observation boundary reached',
      'toast.lampOn': 'Searchlight on',
      'toast.lampOff': 'Searchlight off',
      'toast.reset': 'Field log cleared',

      'resume.title': 'Paused',
      'resume.hint': 'Click to resume exploring',
      'drag.hint': 'Drag to look around · click a specimen to inspect',

      'load.generating': 'Generating seamount terrain',
      'load.placing': 'Placing benthic communities',
      'load.ready': 'Ready',

      'ui.lang': 'Language',
      'ui.help': 'Help',
      'ui.reset': 'Clear log',
      'ui.sound': 'Ambient sound',

      // ---- Move speed
      'hud.speed': 'Move speed',
      'speed.slow': 'Slow',
      'speed.normal': 'Normal',
      'speed.fast': 'Fast',
      'speed.custom': 'Custom',
      'speed.hint': 'Slow for fine positioning, fast for long traverses',

      // ---- Specimen viewer
      'spec.drag': 'Drag to rotate · Scroll to zoom · Double-click to reset',
      'spec.loading': 'Loading specimen',
      'spec.ready': 'Specimen',
      'spec.spin': 'Auto-rotate',
      'spec.reset': 'Reset view',
      'spec.fail.no-data': 'No archive data for this species',
      'spec.fail.no-model': 'No 3D model registered for this species',
      'spec.fail.no-cache': 'Model not loaded yet — try again shortly',
      'spec.fail.instance': 'Failed to instantiate model; geometry may be corrupt',
      'spec.fail.instance-null': 'Could not create a display copy of this specimen',
      'spec.fail.webgl': 'This browser or GPU cannot create a second WebGL context',
      'spec.size': 'Display size'
    }
  };

  // ---------------------------------------------------------------- 物种数据
  const SPECIES = [
    {
      id: 'chauliodus-sloani',
      index: 1,
      name: { zh: '蝰鱼', en: "Sloane's viperfish" },
      latin: 'Chauliodus sloani',
      taxon: { zh: '辐鳍鱼纲 · 巨口鱼科', en: 'Actinopterygii · Stomiidae' },
      depth: { min: 350, max: 680, note: { zh: '文献记录 200–1000 m，昼夜垂直迁移', en: 'Reported 200–1000 m; diel vertical migrant' } },
      size: { zh: '体长 20–30 cm', en: '20–30 cm' },
      habitat: {
        zh: '开阔水体中层。白天停留在侧翼坡面下方的暗水层，夜间上浮觅食，是本站点最常见的中层鱼类。',
        en: 'Open midwater. Rests in the dim layer beneath the flank by day and rises at night to feed; the most frequently encountered mesopelagic fish at this site.'
      },
      morphology: {
        zh: '身体细长侧扁，通体暗银蓝，鳞片细密。下颌远长于上颌，可张开近 90°，上下颌布满针状獠牙，最长者超过头长。第一背鳍鳍条极度延长，向前悬于口上方，末端具发光组织。腹侧与体侧排列成行的发光器沿体轴分布。',
        en: 'Elongated and laterally compressed, dark iridescent blue-silver with fine scales. The lower jaw is far longer than the upper and gapes to nearly 90°, lined with needle fangs longer than the skull. The first dorsal ray extends far forward over the mouth, tipped with a light organ. Rows of photophores run along the belly and flanks.'
      },
      ecology: {
        zh: '中层带伏击型捕食者，以灯笼鱼与虾类为食。发光器兼具诱引与"消影"功能：腹侧发光强度随上方微光变化，抹去自身轮廓。天敌包括海豚与金枪鱼。',
        en: 'An ambush predator of the mesopelagic, hunting lanternfish and shrimp. Its photophores both lure prey and provide counter-illumination, matching downwelling light to erase its silhouette. Preyed upon by dolphins and tunas.'
      },
      bioluminescent: true,
      accent: '#7fe8ff',
      model: { type: 'glb', key: 'glb', size: 0.34, origin: 'custom' }
    },
    {
      id: 'vampyroteuthis-infernalis',
      index: 2,
      name: { zh: '幽灵蛸', en: 'Vampire squid' },
      latin: 'Vampyroteuthis infernalis',
      taxon: { zh: '头足纲 · 幽灵蛸目', en: 'Cephalopoda · Vampyromorpha' },
      depth: { min: 640, max: 880, note: { zh: '集中于氧气最小层（OMZ）', en: 'Concentrated in the oxygen minimum zone' } },
      size: { zh: '外套膜长 13 cm，全长约 30 cm', en: 'Mantle 13 cm; about 30 cm total' },
      habitat: {
        zh: '低氧的中层水体。本站点分布于平原与峡谷崖壁上方的静水层，常见于 700 m 附近的氧气最小层。',
        en: 'Low-oxygen midwater. At this site it drifts above the plain and canyon walls, most often near the oxygen minimum layer at about 700 m.'
      },
      morphology: {
        zh: '体色暗红至近黑，皮肤柔软呈绒质。八条腕由蹼膜连成伞状，腕内侧生有成排刺状须。眼大而黑，腕端与外套膜末端各具发光器。受惊时可将腕蹼外翻，把身体包成"凤梨"状。',
        en: 'Dark red to near-black, with soft velvety skin. Eight arms are joined by a web into an umbrella, their inner surfaces bearing rows of cirri. The eyes are large and black; light organs sit at the arm tips and mantle tip. When startled it inverts the web, curling into a "pineapple" posture.'
      },
      ecology: {
        zh: '以"海洋雪"为食——碎屑、粪粒与浮游生物尸体，用两条细长丝状触手收集，是中层带少见的食腐头足类。代谢率极低，可在低氧水中长期停留；遇险时释放发光黏液而非墨汁。',
        en: 'A detritivore feeding on marine snow — particles, faecal pellets and plankton carcasses — gathered with two long filamentous filaments; an unusual scavenging cephalopod. Its metabolic rate is very low, allowing long residence in oxygen-poor water. Instead of ink it releases a cloud of bioluminescent mucus when threatened.'
      },
      bioluminescent: true,
      accent: '#c98a9a',
      model: { type: 'glb', key: 'glb', size: 0.32, origin: 'custom' }
    },
    {
      id: 'atolla-wyvillei',
      index: 3,
      name: { zh: '警灯水母', en: 'Atolla jellyfish' },
      latin: 'Atolla wyvillei',
      taxon: { zh: '钵水母纲 · 冠水母目', en: 'Scyphozoa · Coronatae' },
      depth: { min: 700, max: 1000, note: { zh: '文献记录可达 1500 m 以上', en: 'Reported below 1500 m' } },
      size: { zh: '伞径约 15 cm，含触手可超 1 m', en: 'Bell about 15 cm; over 1 m with tentacles' },
      habitat: {
        zh: '中层至深层水体，垂直分布很广。本站点见于峡谷上方与东部较深的水柱中，随水流缓慢升降。',
        en: 'Midwater to deep water with a broad vertical range. At this site it drifts above the canyon and in the deeper eastern water column.'
      },
      morphology: {
        zh: '伞盖深红褐色，边缘有一圈冠状深沟，缘触手二十条以上。另有一条显著延长的拖曳触手，可达伞径的数倍。伞缘下方环生蓝色发光器。',
        en: 'A deep red-brown bell with a coronal groove around the margin and more than twenty marginal tentacles. One tentacle is greatly elongated, several times the bell diameter. A ring of blue light organs lies beneath the margin.'
      },
      ecology: {
        zh: '中层带捕食者，以桡足类与小型甲壳动物为食。遭到攻击时会启动"防盗警报"：伞缘发光器依次闪烁，形成旋转的蓝色光环，吸引更大的捕食者前来攻击它的攻击者。',
        en: 'A midwater predator of copepods and small crustaceans. When attacked it triggers a "burglar alarm": the marginal photophores flash in sequence, spinning a blue ring of light that attracts a larger predator to attack its attacker.'
      },
      bioluminescent: true,
      accent: '#ff6b6b',
      model: { type: 'glb', key: 'glb', size: 0.44, origin: 'custom' }
    },
    {
      id: 'melanocetus-johnsonii',
      index: 4,
      name: { zh: '黑角鮟鱇', en: 'Humpback anglerfish' },
      latin: 'Melanocetus johnsonii',
      taxon: { zh: '辐鳍鱼纲 · 黑角鮟鱇科', en: 'Actinopterygii · Melanocetidae' },
      depth: { min: 760, max: 900, note: { zh: '文献记录 700–1500 m，雌鱼更深', en: 'Reported 700–1500 m; females deeper' } },
      size: { zh: '雌鱼约 18 cm，雄鱼仅 2–3 cm', en: 'Female about 18 cm; male 2–3 cm' },
      habitat: {
        zh: '近底水体。本站点个体悬浮于平原上方 8–25 m，几乎不离开底床的暗影带。',
        en: 'Near-bottom water. Individuals at this site hover 8–25 m above the plain, rarely leaving the shadow just above the seabed.'
      },
      morphology: {
        zh: '身体球状，皮肤松软近黑，无鳞。口极大，齿向内倾斜，无法合拢。第一背鳍鳍条化为"钓竿"，末端 esca 内共生发光细菌。雌雄异型极显著：雄鱼体型不足雌鱼十分之一，肠道终生不发育。',
        en: 'A globular body with loose, scaleless black skin. The mouth is enormous, its inward-curving teeth preventing it from closing. The first dorsal ray is modified into a fishing rod whose esca houses symbiotic luminous bacteria. Sexual dimorphism is extreme: the male is under a tenth of her size and never develops a gut.'
      },
      ecology: {
        zh: '伏击捕食者，几乎不动，靠发光细菌引诱猎物进入攻击距离；细菌的发光受血流控制，可随时开闭。雄鱼以嗅觉寻找雌鱼，咬附后组织融合，成为永久提供精子的附属体。',
        en: 'An ambush predator that barely moves, luring prey into range with its bacterial light, which is switched on and off by blood flow. Males locate females by scent, bite on, and fuse with her tissues, becoming a permanent sperm-providing appendage.'
      },
      bioluminescent: true,
      accent: '#ffd08a',
      // 已替换为 Blender 程序化生成模型（带解析 UV 与程序化皮肤贴图）
      model: { type: 'glb', key: 'glb', size: 0.19, origin: 'custom', axis: 'y' }
    },
    {
      id: 'bathynomus-giganteus',
      index: 5,
      name: { zh: '帝王等足虫', en: 'Giant isopod' },
      latin: 'Bathynomus giganteus',
      taxon: { zh: '软甲纲 · 漂水虱科', en: 'Malacostraca · Cirolanidae' },
      depth: { min: 740, max: 860, note: { zh: '文献记录 170–2500 m', en: 'Reported 170–2500 m' } },
      size: { zh: '体长可达 50 cm', en: 'Up to 50 cm' },
      habitat: {
        zh: '软沉积物海底。本站点分布于平原的细泥区，多藏身于岩块背流侧的浅凹中。',
        en: 'Soft sediment seabed. At this site it occupies the fine mud of the plain, often in shallow depressions on the lee side of rocks.'
      },
      morphology: {
        zh: '身体背腹扁平，由七对覆瓦状背板构成，可卷曲成球。头部具一对巨大复眼与两对触角。胸足七对用于爬行，腹肢用于短距离游泳，尾扇宽大。',
        en: 'A flattened body of seven overlapping tergites that can roll into a ball, with a pair of large compound eyes and two pairs of antennae. Seven pairs of legs walk; abdominal limbs swim short distances; the tail fan is broad.'
      },
      ecology: {
        zh: '底栖食腐者。嗅觉极灵敏，能在数十分钟内聚集到鲸落或鱼尸上，一次进食可达体重的数倍，随后长期禁食。生长缓慢，性成熟需数年。',
        en: 'A benthic scavenger with acute chemoreception, gathering at whale falls and fish carcasses within tens of minutes. It can eat several times its body weight in one meal, then fast for long periods. Growth is slow and maturity takes years.'
      },
      bioluminescent: false,
      accent: '#d9c4a8',
      model: { type: 'glb', key: 'glb', size: 0.42, origin: 'custom', axis: 'y' }
    },
    {
      id: 'scotoplanes-globosa',
      index: 6,
      name: { zh: '海猪', en: 'Sea pig' },
      latin: 'Scotoplanes globosa',
      taxon: { zh: '海参纲 · 游足参科', en: 'Holothuroidea · Elpidiidae' },
      depth: { min: 950, max: 1070, note: { zh: '文献记录 1000–6000 m', en: 'Reported 1000–6000 m' } },
      size: { zh: '体长 5–10 cm', en: '5–10 cm' },
      habitat: {
        zh: '深渊软泥底。本站点聚于峡谷底部有机质较厚的沉积区，常三五成群沿底缓行。',
        en: 'Abyssal mud. At this site it gathers on the organic-rich sediment of the canyon floor, moving slowly in loose groups of three to five.'
      },
      morphology: {
        zh: '身体半透明、粉白至淡黄，含水量极高，形如充水的小气球。管足特化为细长的"腿"，成对支撑身体行走。背部生有数对疣突，用于感知水流。',
        en: 'A translucent, pinkish-white to pale yellow body with very high water content, like a small water-filled balloon. Tube feet are modified into long legs that walk in pairs, and several pairs of dorsal papillae sense water movement.'
      },
      ecology: {
        zh: '沉积物食性。用口部触手刮食表层有机碎屑，成群移动时会把沉积物翻耕一遍，是深渊的"清道夫"与生物扰动者。群体常追随沉降的食物脉冲聚集。',
        en: 'A deposit feeder that scrapes organic detritus from the surface with its oral tentacles. Moving herds rework the sediment, making it a key bioturbator and cleaner of the abyss. Groups track pulses of sinking food.'
      },
      bioluminescent: false,
      accent: '#f2c6cf',
      model: { type: 'glb', key: 'glb', size: 0.09, origin: 'custom', axis: 'y' }
    },
    {
      id: 'euplectella-aspergillum',
      index: 7,
      name: { zh: '偕老同穴', en: "Venus' flower basket" },
      latin: 'Euplectella aspergillum',
      taxon: { zh: '六放海绵纲 · 偕老同穴科', en: 'Hexactinellida · Euplectellidae' },
      depth: { min: 380, max: 620, note: { zh: '文献记录 100–1000 m，附着于硬底', en: 'Reported 100–1000 m on hard substrate' } },
      size: { zh: '高 20–30 cm', en: '20–30 cm tall' },
      habitat: {
        zh: '陡峭岩壁与硬质基底。本站点成片附着于脊顶下方 400–600 m 的岩壁，正对常年水流。',
        en: 'Steep rock and hard substrate. At this site it forms bands on the wall 400–600 m below the crest, facing the prevailing current.'
      },
      morphology: {
        zh: '由硅质骨针编织成中空管状网格，管壁呈规则的方孔结构，质地如玻璃。基部伸出锚定根须，插入沉积物或裂隙。活体呈乳白至淡黄，组织极薄。',
        en: 'A hollow tubular lattice woven from silica spicules, its wall perforated by regular square openings and glass-like in texture. Anchoring root spicules extend from the base into sediment or crevices. Living tissue is milky white to pale yellow and extremely thin.'
      },
      ecology: {
        zh: '固着滤食者。通过鞭毛室泵水，过滤细菌与有机颗粒。管内常共生一对俪虾，终生不离开海绵，靠水流带来的食物为生——"偕老同穴"之名由此而来。',
        en: 'A sessile filter feeder that pumps water through flagellated chambers to trap bacteria and particles. A pair of sponge shrimp often lives inside for life, feeding on the flow it draws in — the source of its Chinese name, "together in one house until old age".'
      },
      bioluminescent: false,
      accent: '#cfe9ef',
      model: { type: 'glb', key: 'glb', size: 0.26, origin: 'custom', axis: 'y' }
    },
    {
      id: 'lamellibrachia-luymesi',
      index: 8,
      name: { zh: '冷泉管虫', en: 'Cold-seep tube worm' },
      latin: 'Lamellibrachia luymesi',
      taxon: { zh: '环节动物门 · 西伯加虫科', en: 'Annelida · Siboglinidae' },
      depth: { min: 940, max: 1060, note: { zh: '文献记录 400–1000 m 冷泉区', en: 'Reported 400–1000 m at seeps' } },
      size: { zh: '管长可达 2 m', en: 'Tubes up to 2 m' },
      habitat: {
        zh: '冷泉渗漏区。本站点仅分布于峡谷底三处菌席斑块内，管体半埋于含硫化物的软泥中。',
        en: 'Cold-seep patches. At this site it occurs only within three bacterial mats on the canyon floor, tubes half-buried in sulphide-bearing mud.'
      },
      morphology: {
        zh: '分泌角质管，管口伸出血红色羽鳃，因含血红蛋白而呈鲜红。成体无口、无消化道，营养完全依赖体内共生菌。',
        en: 'Secretes a chitinous tube from which blood-red plumes emerge, coloured by haemoglobin. Adults have no mouth and no gut; nutrition comes entirely from symbiotic bacteria.'
      },
      ecology: {
        zh: '化能合成共生。虫体后端的"根"深入沉积物吸收硫化物与氧，输送给体内的硫氧化细菌，细菌固定碳供给宿主。生长极慢，寿命可超过 250 年，是地球上最长寿的动物之一。',
        en: 'Chemosynthetic symbiosis. Root-like posterior extensions take up sulphide and oxygen from the sediment and pass them to sulphur-oxidising bacteria, which fix carbon for the host. Growth is extremely slow and lifespans can exceed 250 years, among the longest of any animal.'
      },
      bioluminescent: false,
      accent: '#ff8a7a',
      model: { type: 'glb', key: 'glb', size: 1.1, origin: 'custom', axis: 'y' }
    },
    {
      id: 'bathymodiolus-childressi',
      index: 9,
      name: { zh: '冷泉贻贝', en: 'Cold-seep mussel' },
      latin: 'Bathymodiolus childressi',
      taxon: { zh: '双壳纲 · 贻贝科', en: 'Bivalvia · Mytilidae' },
      depth: { min: 940, max: 1060, note: { zh: '文献记录 400–2200 m 冷泉区', en: 'Reported 400–2200 m at seeps' } },
      size: { zh: '壳长 10–20 cm', en: 'Shell 10–20 cm' },
      habitat: {
        zh: '冷泉渗漏区。围绕管虫丛外缘形成密集贝床，占据硫化物浓度稍低的过渡带。',
        en: 'Cold-seep patches, forming dense beds around the outer edge of tube-worm clumps in the transitional zone of lower sulphide flux.'
      },
      morphology: {
        zh: '壳体细长、深褐至黑色，表面平滑，壳顶偏向一端。鳃组织异常膨大，占据外套腔的大部分。',
        en: 'An elongate shell, dark brown to black with a smooth surface and a terminal umbo. The gills are greatly enlarged, filling most of the mantle cavity.'
      },
      ecology: {
        zh: '鳃细胞内共生化能合成细菌，氧化甲烷获取能量，因此不需要滤食。密集贝床为端足类、多毛类提供栖息结构，是冷泉群落的"地基物种"。',
        en: 'Bacteriocytes in the gills host methane-oxidising symbionts and need no filter feeding. The dense beds provide structure for amphipods and polychaetes, making this a foundation species of the seep community.'
      },
      bioluminescent: false,
      accent: '#9fb0c0',
      model: { type: 'glb', key: 'glb', size: 0.16, origin: 'custom', axis: 'y' }
    }
  ];

  // ---------------------------------------------------------------- 语言管理
  const STORE_LANG = 'abyss.lang';
  const STORE_FOUND = 'abyss.discovered.v1';

  const I18n = {
    lang: 'zh',
    init() {
      let saved = null;
      try { saved = localStorage.getItem(STORE_LANG); } catch (e) { }
      this.lang = saved === 'en' || saved === 'zh' ? saved : 'zh';
      return this.lang;
    },
    set(lang) {
      this.lang = lang === 'en' ? 'en' : 'zh';
      try { localStorage.setItem(STORE_LANG, this.lang); } catch (e) { }
    },
    t(key, vars) {
      const dict = UI[this.lang] || UI.zh;
      let s = dict[key];
      if (s === undefined) s = UI.zh[key];
      if (s === undefined) return key;
      if (vars) {
        Object.keys(vars).forEach((k) => { s = s.replace('{' + k + '}', vars[k]); });
      }
      return s;
    },
    // 物种字段取当前语言
    f(obj) {
      if (obj == null) return '';
      if (typeof obj === 'string') return obj;
      return obj[this.lang] != null ? obj[this.lang] : (obj.zh || '');
    }
  };

  A.STRINGS = UI;
  A.SPECIES = SPECIES;
  A.SPECIES_BY_ID = SPECIES.reduce((m, s) => { m[s.id] = s; return m; }, {});
  A.I18n = I18n;
  A.STORE = { LANG: STORE_LANG, FOUND: STORE_FOUND };
})();
