/* ABYSS — 第二批物种资料（中英双语）
 * 深度范围为公开资料的近似值；本站点内的具体分布为模拟设定。
 */
(function () {
  const A = window.ABYSS;
  const X = [];

  // ---------------------------------------------------------------- 鱼类
  X.push({
    id: 'myctophum-punctatum', name: { zh: '斑点灯笼鱼', en: 'Spotted lanternfish' },
    latin: 'Myctophum punctatum', taxon: { zh: '辐鳍鱼纲 · 灯笼鱼科', en: 'Actinopterygii · Myctophidae' },
    depth: { min: 350, max: 700, note: { zh: '文献记录 0–1000 m，昼夜垂直迁移', en: 'Reported 0–1000 m; diel vertical migrant' } },
    size: { zh: '体长 6–10 cm', en: '6–10 cm' },
    habitat: { zh: '中层水体。白天聚集在 400–700 m 的暗层，日落后上浮至浅水觅食，是本站点数量最多的鱼类。', en: 'Midwater. Schools rest at 400–700 m by day and rise after dusk; the most abundant fish at this site.' },
    morphology: { zh: '身体侧扁、银亮，鳞片细小易脱落。眼大，头部与腹侧排列着成行的发光器，尾柄基部也有数个较大的发光斑。', en: 'A laterally compressed, silvery body with small deciduous scales. The eyes are large, and rows of photophores line the head and belly, with several larger organs at the tail base.' },
    ecology: { zh: '夜间上浮摄食桡足类与磷虾，白天以发光器消隐轮廓。它是深海食物链的关键环节，把表层能量输送到深层。', en: 'Feeds on copepods and krill at night and hides its silhouette with counter-illumination by day. A key link carrying surface energy into the deep sea.' },
    bioluminescent: true, accent: '#8fe8ff', model: { type: 'glb', key: 'glb', size: 0.09, origin: 'custom' }
  });

  X.push({
    id: 'argyropelecus-aculeatus', name: { zh: '银斧鱼', en: 'Silver hatchetfish' },
    latin: 'Argyropelecus aculeatus', taxon: { zh: '辐鳍鱼纲 · 褶胸鱼科', en: 'Actinopterygii · Sternoptychidae' },
    depth: { min: 300, max: 600, note: { zh: '文献记录 100–600 m', en: 'Reported 100–600 m' } },
    size: { zh: '体长 5–8 cm', en: '5–8 cm' },
    habitat: { zh: '中层水体上部。白天停留在 300–500 m，夜间上浮，常成小群悬停在几乎不动的位置。', en: 'Upper midwater. Rests at 300–500 m by day and rises at night, hovering almost motionless in small groups.' },
    morphology: { zh: '身体极高而侧扁，形如斧头，体侧覆盖银色反光层。眼呈管状、朝上，腹缘有一列向下指的发光器。', en: 'An extremely deep, laterally compressed body shaped like an axe, covered in reflective silver. The eyes are tubular and upturned, with a row of downward-pointing photophores along the belly.' },
    ecology: { zh: '依靠反荫蔽隐藏轮廓：腹侧发光强度随上方微光自动匹配，从下方看几乎与背景同亮。捕食小型甲壳类。', en: 'Hides by counter-illumination, matching downwelling light so that from below it blends into the background. Preys on small crustaceans.' },
    bioluminescent: true, accent: '#cfe8f4', model: { type: 'glb', key: 'glb', size: 0.07, origin: 'custom' }
  });

  X.push({
    id: 'eurypharynx-pelecanoides', name: { zh: '宽咽鱼', en: 'Pelican eel' },
    latin: 'Eurypharynx pelecanoides', taxon: { zh: '辐鳍鱼纲 · 囊鳃鳗科', en: 'Actinopterygii · Eurypharyngidae' },
    depth: { min: 620, max: 1000, note: { zh: '文献记录 500–3000 m', en: 'Reported 500–3000 m' } },
    size: { zh: '体长 0.6–1 m', en: '0.6–1 m' },
    habitat: { zh: '中层至深层水体。身体几乎不动地悬停，靠巨大的口部等待食物落入。', en: 'Midwater to deep water, hovering almost motionless with its enormous mouth open, waiting for food to fall in.' },
    morphology: { zh: '口部极度扩张，呈囊状，可张开到体宽的数倍。身体细长，尾部细鞭状，末端具发光器。皮肤松软近黑。', en: 'The mouth is enormously expandable, forming a pouch several times the body width. The body is slender with a whip-like tail tipped by a light organ, and the skin is loose and near-black.' },
    ecology: { zh: '张口吞入大量海水，再通过鳃耙滤出其中的虾类与小型鱼类。尾部发光器可能用于诱引或干扰捕食者。', en: 'Takes in a large volume of water and filters out shrimp and small fish through its gill rakers. The tail light organ may lure prey or confuse predators.' },
    bioluminescent: true, accent: '#9fe8ff', model: { type: 'glb', key: 'glb', size: 0.85, origin: 'custom' }
  });

  X.push({
    id: 'macropinna-microstoma', name: { zh: '管眼鱼', en: 'Barreleye' },
    latin: 'Macropinna microstoma', taxon: { zh: '辐鳍鱼纲 · 后肛鱼科', en: 'Actinopterygii · Opisthoproctidae' },
    depth: { min: 420, max: 700, note: { zh: '文献记录 400–800 m', en: 'Reported 400–800 m' } },
    size: { zh: '体长约 15 cm', en: 'About 15 cm' },
    habitat: { zh: '中层水体。长时间悬停在几乎不变的位置，靠胸鳍微调姿态。', en: 'Midwater, hovering in nearly the same spot for long periods and adjusting with its pectoral fins.' },
    morphology: { zh: '头部覆盖透明的穹顶组织，内部一对管状眼朝上，可整体旋转。身体暗色，鳍宽大。', en: 'The head is enclosed in a transparent dome containing a pair of tubular eyes that can rotate as a unit. The body is dark with broad fins.' },
    ecology: { zh: '向上搜寻 silhouettes 的猎物，也能把眼睛转向前方。透明头部让上方光线不受遮挡。', en: 'Scans for silhouettes overhead and can also rotate its eyes forward; the transparent head lets light through unobstructed.' },
    bioluminescent: false, accent: '#a8d8c8', model: { type: 'glb', key: 'glb', size: 0.16, origin: 'custom' }
  });

  X.push({
    id: 'anoplogaster-cornuta', name: { zh: '尖牙鱼', en: 'Fangtooth' },
    latin: 'Anoplogaster cornuta', taxon: { zh: '辐鳍鱼纲 · 尖牙鱼科', en: 'Actinopterygii · Anoplogastridae' },
    depth: { min: 600, max: 1000, note: { zh: '文献记录 500–5000 m', en: 'Reported 500–5000 m' } },
    size: { zh: '体长 15–18 cm', en: '15–18 cm' },
    habitat: { zh: '中层至深层水体。成鱼在 600 m 以下活动，幼鱼较浅。', en: 'Midwater to deep water; adults live below 600 m while juveniles stay shallower.' },
    morphology: { zh: '身体短粗近黑，头骨厚重，口中齿相对体型为鱼类中最长之一，上下齿交错时无法完全闭合。', en: 'A short, dark, heavy-headed body. Its teeth are among the largest relative to body size of any fish, so the mouth cannot fully close.' },
    ecology: { zh: '伏击型捕食者，活动缓慢，靠侧线感知水流。食物稀少时以任何可吞咽的动物为食。', en: 'A slow ambush predator that senses water movement with its lateral line and eats anything it can swallow in a food-poor environment.' },
    bioluminescent: false, accent: '#c8b8a8', model: { type: 'glb', key: 'glb', size: 0.17, origin: 'custom' }
  });

  X.push({
    id: 'malacosteus-niger', name: { zh: '黑巨口鱼', en: 'Stoplight loosejaw' },
    latin: 'Malacosteus niger', taxon: { zh: '辐鳍鱼纲 · 巨口鱼科', en: 'Actinopterygii · Stomiidae' },
    depth: { min: 520, max: 820, note: { zh: '文献记录 500–1000 m', en: 'Reported 500–1000 m' } },
    size: { zh: '体长 15–25 cm', en: '15–25 cm' },
    habitat: { zh: '中层水体。分布于本站点侧翼与平原上方的暗水层，独居。', en: 'Midwater above the flank and plain, solitary in the dim layer.' },
    morphology: { zh: '身体与口腔近黑，下颌极长且无底板，可大幅张开。眼下方有一个红色发光器，是本种最显著的特征。', en: 'Body and mouth cavity near-black; the lower jaw is extremely long and lacks a floor, allowing a wide gape. A red light organ below the eye is its most distinctive feature.' },
    ecology: { zh: '是少数能发射红光的动物——多数深海生物看不见红光，因此它等于拥有"隐形照明"，可暗中观察猎物。', en: 'One of the few animals that emits red light. Most deep-sea creatures cannot see red, giving it a private searchlight to inspect prey unseen.' },
    bioluminescent: true, accent: '#ff6a5a', model: { type: 'glb', key: 'glb', size: 0.21, origin: 'custom' }
  });

  X.push({
    id: 'nemichthys-scolopaceus', name: { zh: '鹬鳗', en: 'Slender snipe eel' },
    latin: 'Nemichthys scolopaceus', taxon: { zh: '辐鳍鱼纲 · 线鳗科', en: 'Actinopterygii · Nemichthyidae' },
    depth: { min: 420, max: 800, note: { zh: '文献记录 300–1000 m', en: 'Reported 300–1000 m' } },
    size: { zh: '体长 1–1.5 m，粗仅 2 cm', en: '1–1.5 m long, only 2 cm thick' },
    habitat: { zh: '中层水体。身体几乎垂直或斜悬，随水流缓慢漂移。', en: 'Midwater, hanging nearly vertically or at an angle and drifting with the current.' },
    morphology: { zh: '身体细如鞋带，脊椎骨数量超过 750 节。上下颌细长如镊子，末端外张，尾鳍细如丝。', en: 'A body as thin as a shoelace with more than 750 vertebrae. The jaws are long tweezers that splay at the tips, and the tail fin is thread-like.' },
    ecology: { zh: '用细长的颌在虾群中扫动，靠颌上的细齿扣住猎物。游泳能力弱，主要随水流移动。', en: 'Sweeps its tweezer-like jaws through swarms of shrimp, hooking prey on fine teeth. A weak swimmer that mostly drifts.' },
    bioluminescent: false, accent: '#b8c0b0', model: { type: 'glb', key: 'glb', size: 1.2, origin: 'custom' }
  });

  X.push({
    id: 'bathypterois-grallator', name: { zh: '三脚鱼', en: 'Tripod fish' },
    latin: 'Bathypterois grallator', taxon: { zh: '辐鳍鱼纲 · 三脚鱼科', en: 'Actinopterygii · Ipnopidae' },
    depth: { min: 860, max: 1080, note: { zh: '文献记录 800–4700 m', en: 'Reported 800–4700 m' } },
    size: { zh: '体长 30–40 cm（含鳍条）', en: '30–40 cm including fin rays' },
    habitat: { zh: '深渊平原的软泥底。用延长的鳍条支撑身体，长时间静止在底床上方。', en: 'Abyssal mud. It props itself above the seabed on elongated fin rays and stays motionless for long periods.' },
    morphology: { zh: '胸鳍与腹鳍各延长成一根硬质支柱，尾鳍下叶也向下延伸，形成三脚支架。眼高度退化，几乎不可见。', en: 'Pectoral and pelvic fins each extend into a stiff prop, and the lower tail lobe points down, forming a tripod. The eyes are greatly reduced.' },
    ecology: { zh: '面向水流静立，用向前伸出的长胸鳍感知经过的甲壳类，属于触觉捕食者。', en: 'Stands facing the current and detects passing crustaceans with its forward-reaching pectoral rays — a tactile hunter.' },
    bioluminescent: false, accent: '#b8a898', model: { type: 'glb', key: 'glb', size: 0.36, origin: 'custom', axis: 'y' }
  });

  X.push({
    id: 'careproctus-rastrinus', name: { zh: '深海狮子鱼', en: 'Deep-sea snailfish' },
    latin: 'Careproctus rastrinus', taxon: { zh: '辐鳍鱼纲 · 狮子鱼科', en: 'Actinopterygii · Liparidae' },
    depth: { min: 700, max: 1000, note: { zh: '文献记录 100–1500 m', en: 'Reported 100–1500 m' } },
    size: { zh: '体长 15–30 cm', en: '15–30 cm' },
    habitat: { zh: '软泥与岩屑混合的底床。身体半透明，贴近基底缓慢移动。', en: 'Mixed mud and rubble bottoms, moving slowly and staying close to the substrate.' },
    morphology: { zh: '身体胶质半透明，头大尾细，皮肤松弛无鳞。腹鳍愈合成吸盘，用于固定在基底上。', en: 'A gelatinous, translucent body with a large head, tapering tail and loose scaleless skin. The pelvic fins are fused into a suction disc.' },
    ecology: { zh: '以小型端足类与多毛类为食。部分种类把卵产在铠甲虾的鳃腔内，由宿主代为护卵。', en: 'Feeds on small amphipods and polychaetes. Some species lay eggs inside the gill chamber of squat lobsters, which then brood them.' },
    bioluminescent: false, accent: '#e8c8c0', model: { type: 'glb', key: 'glb', size: 0.22, origin: 'custom', axis: 'y' }
  });

  X.push({
    id: 'coryphaenoides-armatus', name: { zh: '长尾鳕', en: 'Abyssal grenadier' },
    latin: 'Coryphaenoides armatus', taxon: { zh: '辐鳍鱼纲 · 长尾鳕科', en: 'Actinopterygii · Macrouridae' },
    depth: { min: 620, max: 1080, note: { zh: '文献记录 500–4000 m', en: 'Reported 500–4000 m' } },
    size: { zh: '体长 0.5–1 m', en: '0.5–1 m' },
    habitat: { zh: '深渊平原与峡谷底部上方 1–20 m。主动巡游，是深海中数量最多的大型鱼类之一。', en: 'One to twenty metres above the abyssal plain and canyon floor; an active swimmer and one of the most abundant large deep-sea fishes.' },
    morphology: { zh: '头大而钝，身体向后渐细成鞭状长尾，鳞片粗糙带棱。吻部下方有发达的味觉器官。', en: 'A blunt, large head with a body tapering into a long whip-like tail and rough, ridged scales. Taste organs are well developed under the snout.' },
    ecology: { zh: '典型的食腐者，能在数十分钟内找到沉落的尸体，也捕食底栖甲壳类。嗅觉极其灵敏。', en: 'A classic scavenger that finds sunken carcasses within tens of minutes and also takes benthic crustaceans; its sense of smell is acute.' },
    bioluminescent: false, accent: '#b8a488', model: { type: 'glb', key: 'glb', size: 0.72, origin: 'custom' }
  });

  X.push({
    id: 'chlamydoselachus-anguineus', name: { zh: '皱鳃鲨', en: 'Frilled shark' },
    latin: 'Chlamydoselachus anguineus', taxon: { zh: '软骨鱼纲 · 皱鳃鲨科', en: 'Chondrichthyes · Chlamydoselachidae' },
    depth: { min: 600, max: 1000, note: { zh: '文献记录 500–1500 m', en: 'Reported 500–1500 m' } },
    size: { zh: '体长 1.5–2 m', en: '1.5–2 m' },
    habitat: { zh: '中层至深层水体，靠近陡坡与峡谷壁。游动缓慢，常贴近底部。', en: 'Midwater to deep water near steep slopes and canyon walls; a slow swimmer that stays close to the bottom.' },
    morphology: { zh: '身体鳗形，六对鳃裂的边缘延伸成皱褶状覆盖鳃孔，因而得名。齿呈三叉状，口几乎位于头端。', en: 'An eel-like body with six gill slits whose margins extend into frills, hence the name. The teeth are trident-shaped and the mouth is almost terminal.' },
    ecology: { zh: '以头足类与小型鱼类为食，捕食时身体前段突然伸直弹出。被认为是形态上最原始的鲨鱼之一。', en: 'Feeds on cephalopods and small fish, lunging by straightening its forebody. Considered one of the most primitive-looking living sharks.' },
    bioluminescent: false, accent: '#8a7a68', model: { type: 'glb', key: 'glb', size: 1.7, origin: 'custom' }
  });

  // ---------------------------------------------------------------- 水母 / 浮游
  X.push({
    id: 'beroe-cucumis', name: { zh: '瓜水母', en: 'Comb jelly' },
    latin: 'Beroe cucumis', taxon: { zh: '栉水母动物门 · 瓜水母科', en: 'Ctenophora · Beroidae' },
    depth: { min: 380, max: 760, note: { zh: '文献记录 0–1000 m', en: 'Reported 0–1000 m' } },
    size: { zh: '体长 8–12 cm', en: '8–12 cm' },
    habitat: { zh: '中层水体。无触手，靠栉板划水缓慢前进，常出现在桡足类密集的水层。', en: 'Midwater. It has no tentacles and rows with its comb plates, often found where copepods are dense.' },
    morphology: { zh: '身体呈桶状或瓜形，几乎完全透明，表面纵贯八列栉板。口部极大，可吞下接近自身体宽的猎物。', en: 'A barrel- or melon-shaped body, almost fully transparent, with eight rows of comb plates. The mouth is huge and can swallow prey nearly its own width.' },
    ecology: { zh: '专门捕食其他栉水母，包括同类。栉板摆动时产生彩虹色光带，是深海中最常见的光学现象之一。', en: 'Specialises in eating other comb jellies, including its own kind. Its beating comb rows produce iridescent bands, one of the commonest optical effects in the deep sea.' },
    bioluminescent: true, accent: '#9ee8f0', model: { type: 'glb', key: 'glb', size: 0.14, origin: 'custom' }
  });

  X.push({
    id: 'stygiomedusa-gigantea', name: { zh: '冥河水母', en: 'Giant phantom jelly' },
    latin: 'Stygiomedusa gigantea', taxon: { zh: '钵水母纲 · 冥河水母科', en: 'Scyphozoa · Ulmaridae' },
    depth: { min: 940, max: 1090, note: { zh: '文献记录 1000–4000 m，极少被观测', en: 'Reported 1000–4000 m; rarely observed' } },
    size: { zh: '伞径约 1 m，口腕可达 10 m', en: 'Bell about 1 m; oral arms up to 10 m' },
    habitat: { zh: '深层水体。本站点仅在最深的峡谷水域偶见，通常单独漂浮。', en: 'Deep water. At this site it appears only in the deepest canyon water, usually drifting alone.' },
    morphology: { zh: '伞体深褐至黑红，边缘无细触手，取而代之的是四条极长的带状口腕，可在身后拖出数米。', en: 'A dark brown to black-red bell with no fine marginal tentacles; instead four extremely long ribbon-like oral arms trail metres behind.' },
    ecology: { zh: '全球分布但记录极少，估计以小型鱼类与浮游动物为食。其体型与深居习性使其成为深海神秘物种的代表。', en: 'Globally distributed yet rarely recorded; thought to feed on small fish and zooplankton. Its size and reclusive depth make it an emblem of deep-sea mystery.' },
    bioluminescent: false, accent: '#8a4a50',
    // 已重建为 Blender 模型：闭合厚壳伞体 + 4 条带状口腕 + 生殖腺
    // size 为伞径（米），口腕长度由模型自身比例保留
    model: { type: 'glb', key: 'glb', size: 1.44, origin: 'custom' }
  });

  X.push({
    id: 'crossota-millsae', name: { zh: '十字水母', en: 'Crossota jelly' },
    latin: 'Crossota millsae', taxon: { zh: '钵水母纲 · 十字水母科', en: 'Scyphozoa · Rhopalonematidae' },
    depth: { min: 700, max: 1040, note: { zh: '文献记录 700–2000 m', en: 'Reported 700–2000 m' } },
    size: { zh: '伞径 2–3 cm', en: 'Bell 2–3 cm' },
    habitat: { zh: '中层至深层水体。个体小，常成片出现在峡谷上方的水层。', en: 'Midwater to deep water; small and often found in loose aggregations above the canyon.' },
    morphology: { zh: '伞体半球形、深红色，四条辐射管清晰可见。缘触手短而多，伞缘下方有一圈发光组织。', en: 'A hemispherical deep-red bell with four visible radial canals, many short marginal tentacles and a ring of light-producing tissue beneath the margin.' },
    ecology: { zh: '小型中层捕食者，以桡足类为食。受扰动时伞缘发光器依次闪烁，形成旋转光带。', en: 'A small midwater predator of copepods. When disturbed, its marginal light organs flash in sequence, producing a rotating band of light.' },
    bioluminescent: true, accent: '#ff6a6a', model: { type: 'glb', key: 'glb', size: 0.12, origin: 'custom' }
  });

  X.push({
    id: 'salpa-maxima', name: { zh: '樽海鞘', en: 'Salp' },
    latin: 'Salpa maxima', taxon: { zh: '樽海鞘纲 · 樽海鞘科', en: 'Thaliacea · Salpidae' },
    depth: { min: 340, max: 700, note: { zh: '文献记录 0–1000 m，昼夜垂直迁移', en: 'Reported 0–1000 m; diel vertical migration' } },
    size: { zh: '体长 5–15 cm', en: '5–15 cm' },
    habitat: { zh: '上层至中层水体。常以长链状群体出现，缓慢随水流移动。', en: 'Upper to midwater, often in long chain-like colonies drifting with the current.' },
    morphology: { zh: '身体呈透明桶状，被环状肌带分割，内部可见管状消化道与发光器。', en: 'A transparent barrel-shaped body divided by circular muscle bands, with a tubular gut and light organ visible inside.' },
    ecology: { zh: '持续泵水滤食微小颗粒，是海洋碳输出的重要通道：粪便与尸体快速下沉，把碳带入深层。', en: 'Pumps water continuously to filter fine particles and is a major route for ocean carbon export, its pellets and bodies sinking quickly.' },
    bioluminescent: true, accent: '#b8e0e8', model: { type: 'glb', key: 'glb', size: 0.13, origin: 'custom' }
  });

  // ---------------------------------------------------------------- 头足类
  X.push({
    id: 'grimpoteuthis-sp', name: { zh: '小飞象章鱼', en: 'Dumbo octopus' },
    latin: 'Grimpoteuthis sp.', taxon: { zh: '头足纲 · 小飞象章鱼科', en: 'Cephalopoda · Opisthoteuthidae' },
    depth: { min: 820, max: 1080, note: { zh: '文献记录 400–5000 m', en: 'Reported 400–5000 m' } },
    size: { zh: '体长 20–30 cm', en: '20–30 cm' },
    habitat: { zh: '近底水体与软泥底。本站点分布于峡谷底部上方 2–10 m。', en: 'Near-bottom water and soft mud, two to ten metres above the canyon floor at this site.' },
    morphology: { zh: '外套膜短，头部两侧各有一片耳状鳍，靠拍动鳍游泳。八腕之间由发达的蹼膜连接，张开如伞。', en: 'A short mantle with an ear-like fin on each side, used for swimming. The eight arms are joined by a broad web that opens like an umbrella.' },
    ecology: { zh: '以底栖蠕虫与甲壳类为食，靠腕上的感受器在泥中探查。是已知栖息最深的章鱼类之一。', en: 'Feeds on benthic worms and crustaceans, probing the mud with sensory suckers. Among the deepest-living octopuses known.' },
    bioluminescent: false, accent: '#d08a90', model: { type: 'glb', key: 'glb', size: 0.26, origin: 'custom' }
  });

  X.push({
    id: 'cranchia-scabra', name: { zh: '玻璃乌贼', en: 'Glass squid' },
    latin: 'Cranchia scabra', taxon: { zh: '头足纲 · 小头乌贼科', en: 'Cephalopoda · Cranchiidae' },
    depth: { min: 500, max: 860, note: { zh: '文献记录 300–1000 m', en: 'Reported 300–1000 m' } },
    size: { zh: '外套膜长 15 cm', en: 'Mantle 15 cm' },
    habitat: { zh: '中层水体。漂浮在暗水层中，几乎不主动游动。', en: 'Midwater, drifting in the dim layer and swimming only weakly.' },
    morphology: { zh: '外套膜半透明如玻璃，表面散布小型突起。腕短，头部与腕可完全缩入外套膜内。', en: 'A glassy, semi-transparent mantle dotted with small tubercles. The arms are short and can be fully withdrawn into the mantle.' },
    ecology: { zh: '遇险时把头和腕缩进外套膜、吸入海水膨胀成球，以透明身体与背景融为一体。', en: 'When threatened it retracts its head and arms and fills the mantle with water, becoming a transparent ball that blends into the background.' },
    bioluminescent: true, accent: '#a8e8f4', model: { type: 'glb', key: 'glb', size: 0.2, origin: 'custom' }
  });

  X.push({
    id: 'architeuthis-dux', name: { zh: '大王乌贼', en: 'Giant squid' },
    latin: 'Architeuthis dux', taxon: { zh: '头足纲 · 大王乌贼科', en: 'Cephalopoda · Architeuthidae' },
    depth: { min: 620, max: 900, note: { zh: '文献记录 200–1000 m', en: 'Reported 200–1000 m' } },
    size: { zh: '全长可达 10 m 以上', en: 'Up to 10 m or more' },
    habitat: { zh: '中层至深层水体。极少被直接观测，本站点仅有一只在峡谷上方巡游。', en: 'Midwater to deep water, very rarely observed; a single individual patrols above the canyon here.' },
    morphology: { zh: '身体巨大，外套膜圆柱形，两片鳍位于末端。八条腕之外还有一对极长的触腕，吸盘边缘带角质环钩。', en: 'A huge cylindrical mantle with two fins at the rear. Besides eight arms it has a pair of extremely long tentacles whose suckers bear chitinous rings.' },
    ecology: { zh: '深海顶级猎手之一，捕食鱼类与其他头足类；是抹香鲸胃中常见的残留物，两者的关系是深海生态的经典案例。', en: 'One of the deep sea\u2019s top hunters, taking fish and other cephalopods. Its remains are common in sperm whale stomachs, a classic deep-sea ecological relationship.' },
    bioluminescent: false, accent: '#c88a70', model: { type: 'glb', key: 'glb', size: 4.2, origin: 'custom' }
  });

  X.push({
    id: 'bathypolypus-arcticus', name: { zh: '深海章鱼', en: 'Deep-sea octopus' },
    latin: 'Bathypolypus arcticus', taxon: { zh: '头足纲 · 章鱼科', en: 'Cephalopoda · Octopodidae' },
    depth: { min: 640, max: 980, note: { zh: '文献记录 200–1400 m', en: 'Reported 200–1400 m' } },
    size: { zh: '体长 10–20 cm', en: '10–20 cm' },
    habitat: { zh: '软泥底床。白天藏身于岩石缝隙或空壳中，夜间在底表活动。', en: 'Soft mud bottoms; hides in rock crevices or empty shells by day and forages on the surface at night.' },
    morphology: { zh: '体型小，外套膜短圆，腕相对短粗，皮肤粗糙具颗粒。体色随基底变化，多为褐红或灰褐。', en: 'A small octopus with a short round mantle, relatively short thick arms and rough granular skin that shifts between reddish brown and grey.' },
    ecology: { zh: '底栖捕食双壳类与甲壳类，用腕间膜包裹猎物。生长缓慢，繁殖期护卵数月不进食。', en: 'A benthic predator of bivalves and crustaceans that envelops prey with its web. Growth is slow and brooding females guard their eggs for months without feeding.' },
    bioluminescent: false, accent: '#c08070', model: { type: 'glb', key: 'glb', size: 0.22, origin: 'custom', axis: 'y' }
  });

  // ---------------------------------------------------------------- 甲壳类
  X.push({
    id: 'eurythenes-gryllus', name: { zh: '深海端足类', en: 'Giant amphipod' },
    latin: 'Eurythenes gryllus', taxon: { zh: '软甲纲 · 端足目', en: 'Malacostraca · Amphipoda' },
    depth: { min: 820, max: 1080, note: { zh: '文献记录 500–8000 m', en: 'Reported 500–8000 m' } },
    size: { zh: '体长 5–10 cm', en: '5–10 cm' },
    habitat: { zh: '深渊底部与近底水体。是深海食腐群落中最先到达尸体的动物之一。', en: 'Abyssal bottom and near-bottom water; among the first scavengers to reach a carcass.' },
    morphology: { zh: '身体侧扁、分节明显，触角长，胸足发达用于快速游动与爬行。体色由淡黄至深褐。', en: 'A laterally compressed, clearly segmented body with long antennae and strong legs for swimming and crawling; colour ranges from pale yellow to dark brown.' },
    ecology: { zh: '嗅觉极灵敏，可在数十分钟内聚集到数公里外的食物；能耐受极低的食物供给与高压。', en: 'Extremely sensitive to odour, gathering at food from kilometres away within tens of minutes, and tolerant of high pressure and long fasting.' },
    bioluminescent: false, accent: '#c8b8a4', model: { type: 'glb', key: 'glb', size: 0.085, origin: 'custom', axis: 'y' }
  });

  X.push({
    id: 'acanthephyra-purpurea', name: { zh: '深海红虾', en: 'Deep-sea red shrimp' },
    latin: 'Acanthephyra purpurea', taxon: { zh: '软甲纲 · 十足目', en: 'Malacostraca · Decapoda' },
    depth: { min: 520, max: 940, note: { zh: '文献记录 300–2000 m', en: 'Reported 300–2000 m' } },
    size: { zh: '体长 5–8 cm', en: '5–8 cm' },
    habitat: { zh: '中层水体与近底水层。夜间向浅层迁移，白天停留在暗水层。', en: 'Midwater and near-bottom water; migrates upward at night and stays in the dim layer by day.' },
    morphology: { zh: '身体侧扁，额剑上缘带锯齿，体色深红——红光在深水中最先被吸收，因此看起来近乎黑色。', en: 'A laterally compressed body with a serrated rostrum. Its deep red colour appears almost black at depth, because red light is absorbed first.' },
    ecology: { zh: '捕食小型甲壳类与桡足类。受惊时从口部喷出发光液体，制造烟幕以逃脱。', en: 'Preys on small crustaceans and copepods. When startled it ejects a cloud of luminous fluid from its mouth as a smoke screen.' },
    bioluminescent: true, accent: '#c84a44', model: { type: 'glb', key: 'glb', size: 0.075, origin: 'custom' }
  });

  X.push({
    id: 'chaceon-quinquedens', name: { zh: '深海红蟹', en: 'Red deep-sea crab' },
    latin: 'Chaceon quinquedens', taxon: { zh: '软甲纲 · 十足目', en: 'Malacostraca · Decapoda' },
    depth: { min: 620, max: 960, note: { zh: '文献记录 200–1500 m', en: 'Reported 200–1500 m' } },
    size: { zh: '甲宽 12–15 cm', en: 'Carapace 12–15 cm' },
    habitat: { zh: '软泥与砾石混合的底床，常沿坡面聚集。', en: 'Mixed mud and gravel bottoms, often aggregated along slopes.' },
    morphology: { zh: '头胸甲近圆形、深红色，螯足粗壮不对称，步足细长。眼小，视觉退化。', en: 'A near-circular deep red carapace, heavy asymmetrical claws and long walking legs; the eyes are small and vision reduced.' },
    ecology: { zh: '底栖食腐与捕食兼具，靠化学感受寻找尸体与贝类。移动缓慢，寿命可达数十年。', en: 'A benthic scavenger and predator that finds carcasses and shellfish by chemoreception. It moves slowly and can live for decades.' },
    bioluminescent: false, accent: '#c05040', model: { type: 'glb', key: 'glb', size: 0.2, origin: 'custom', axis: 'y' }
  });

  X.push({
    id: 'munidopsis-serricornis', name: { zh: '铠甲虾', en: 'Squat lobster' },
    latin: 'Munidopsis serricornis', taxon: { zh: '软甲纲 · 异尾目', en: 'Malacostraca · Anomura' },
    depth: { min: 560, max: 1000, note: { zh: '文献记录 100–2000 m', en: 'Reported 100–2000 m' } },
    size: { zh: '体长 5 cm', en: '5 cm' },
    habitat: { zh: '岩壁、珊瑚枝与海绵表面。本站点常附着在竹节珊瑚与岩块背流面。', en: 'Rock walls, coral branches and sponge surfaces; here often on bamboo coral and the lee side of rocks.' },
    morphology: { zh: '头胸甲扁平，腹部未完全折叠于胸下，螯足细长，第二步足明显长于身体。', en: 'A flattened carapace with an abdomen that is not fully folded beneath it; the claws are slender and the second pair of legs is longer than the body.' },
    ecology: { zh: '在基底表面缓慢爬行，以有机碎屑与小型附着生物为食，是固着生物群落的常见伴生种。', en: 'Crawls slowly over substrates feeding on detritus and small epibionts, a common associate of sessile communities.' },
    bioluminescent: false, accent: '#d8c8b8', model: { type: 'glb', key: 'glb', size: 0.06, origin: 'custom', axis: 'y' }
  });

  // ---------------------------------------------------------------- 棘皮类
  X.push({
    id: 'henricia-sanguinolenta', name: { zh: '血红海星', en: 'Blood star' },
    latin: 'Henricia sanguinolenta', taxon: { zh: '海星纲 · 棘海星科', en: 'Asteroidea · Echinasteridae' },
    depth: { min: 380, max: 900, note: { zh: '文献记录 20–1000 m', en: 'Reported 20–1000 m' } },
    size: { zh: '腕展 10–15 cm', en: '10–15 cm across' },
    habitat: { zh: '岩壁与砾石表面。常附着在海绵、苔虫附近，避开松软沉积。', en: 'Rock walls and gravel, usually near sponges and bryozoans and avoiding soft sediment.' },
    morphology: { zh: '五腕细长，盘小，体表密布细小棘刺，呈鲜红至橙红。体壁坚硬，触感粗糙。', en: 'Five slender arms on a small disc, the surface densely set with tiny spines and coloured bright red to orange. The body wall is firm and rough.' },
    ecology: { zh: '以海绵与苔虫为食，把胃翻出体外消化猎物。再生能力强，断腕可重新长出。', en: 'Feeds on sponges and bryozoans by everting its stomach over them. It regenerates lost arms readily.' },
    bioluminescent: false, accent: '#c84a4a', model: { type: 'glb', key: 'glb', size: 0.15, origin: 'custom', axis: 'y' }
  });

  X.push({
    id: 'ophiura-sarsii', name: { zh: '蛇尾', en: 'Brittle star' },
    latin: 'Ophiura sarsii', taxon: { zh: '蛇尾纲 · 蛇尾科', en: 'Ophiuroidea · Ophiuridae' },
    depth: { min: 420, max: 1000, note: { zh: '文献记录 100–2000 m', en: 'Reported 100–2000 m' } },
    size: { zh: '腕展 10–20 cm', en: '10–20 cm across' },
    habitat: { zh: '软泥与细砂底床，常高密度聚集形成"蛇尾床"。', en: 'Soft mud and fine sand, often at high density forming brittle-star beds.' },
    morphology: { zh: '中央盘小，五条细长腕由骨板串联，可快速摆动。腕与盘之间有明显关节。', en: 'A small central disc with five long arms built from articulated ossicles that can whip quickly; there is a clear joint between arm and disc.' },
    ecology: { zh: '沉积物食性与腐食性兼具，用腕把食物送入口中。腕易断，断后可再生，是逃避捕食的策略。', en: 'Both a deposit feeder and scavenger, passing food to its mouth with its arms. Arms break off easily and regenerate, a defence strategy.' },
    bioluminescent: false, accent: '#b0a088', model: { type: 'glb', key: 'glb', size: 0.18, origin: 'custom', axis: 'y' }
  });

  X.push({
    id: 'sperosoma-giganteum', name: { zh: '深海海胆', en: 'Deep-sea urchin' },
    latin: 'Sperosoma giganteum', taxon: { zh: '海胆纲 · 深海海胆科', en: 'Echinoidea · Echinothuriidae' },
    depth: { min: 640, max: 1040, note: { zh: '文献记录 500–2000 m', en: 'Reported 500–2000 m' } },
    size: { zh: '壳径 10–15 cm', en: 'Test 10–15 cm' },
    habitat: { zh: '软泥底床。用棘刺支撑身体，避免陷入沉积物。', en: 'Soft mud, propped on its spines to avoid sinking into the sediment.' },
    morphology: { zh: '壳呈球形，棘刺长而稀疏，部分末端膨大。体色深紫褐至近黑。', en: 'A spherical test with long, sparse spines, some with swollen tips; coloured deep purple-brown to near black.' },
    ecology: { zh: '刮食表层沉积物中的有机颗粒，移动缓慢。棘刺间常夹带碎屑作为伪装。', en: 'Grazes organic particles from surface sediment and moves slowly, often carrying debris among its spines as camouflage.' },
    bioluminescent: false, accent: '#8a6a78', model: { type: 'glb', key: 'glb', size: 0.14, origin: 'custom', axis: 'y' }
  });

  // ---------------------------------------------------------------- 固着类
  X.push({
    id: 'actiniaria-deep', name: { zh: '深海海葵', en: 'Deep-sea anemone' },
    latin: 'Actiniaria indet.', taxon: { zh: '珊瑚纲 · 海葵目', en: 'Anthozoa · Actiniaria' },
    depth: { min: 380, max: 980, note: { zh: '文献记录 0–5000 m，各深度均有分布', en: 'Reported 0–5000 m; present at all depths' } },
    size: { zh: '高 20–35 cm', en: '20–35 cm tall' },
    habitat: { zh: '岩壁、砾石与贝壳表面。本站点附着在侧翼岩壁与峡谷壁的硬质基底上。', en: 'Rock, gravel and shell surfaces; here attached to hard substrates on the flank and canyon walls.' },
    morphology: { zh: '柱状体，基部有足盘附着，口盘周围环生数十条中空触手。触手可完全缩回体内。', en: 'A columnar body with a basal pedal disc and dozens of hollow tentacles around the oral disc; the tentacles can retract completely.' },
    ecology: { zh: '触手上的刺细胞麻痹经过的小型动物。部分深海海葵与寄居蟹、虾类共生。', en: 'Nematocysts on the tentacles paralyse small animals that brush past. Some deep-sea anemones live with hermit crabs or shrimp.' },
    bioluminescent: false, accent: '#e08a78', model: { type: 'glb', key: 'glb', size: 0.3, origin: 'custom', axis: 'y' }
  });

  X.push({
    id: 'keratoisis-flexibilis', name: { zh: '竹节珊瑚', en: 'Bamboo coral' },
    latin: 'Keratoisis flexibilis', taxon: { zh: '珊瑚纲 · 竹节珊瑚科', en: 'Anthozoa · Keratoisididae' },
    depth: { min: 520, max: 1020, note: { zh: '文献记录 200–2000 m', en: 'Reported 200–2000 m' } },
    size: { zh: '高 30–100 cm', en: '30–100 cm tall' },
    habitat: { zh: '陡坡与峡谷壁。以钙质基底固定，形成分枝灌丛，为铠甲虾与蛇尾提供栖息结构。', en: 'Steep slopes and canyon walls, anchored on carbonate substrate and forming branching thickets that shelter squat lobsters and brittle stars.' },
    morphology: { zh: '分枝状骨骼由钙质节与角质节交替组成，形似竹节。活体表面覆盖白色至淡粉色的水螅体。', en: 'A branching skeleton of alternating calcareous and proteinaceous joints, like bamboo. Living colonies are covered in white to pale pink polyps.' },
    ecology: { zh: '滤食浮游动物。生长极慢，群落年龄可达数百年，是深海脆弱生态系统的代表。', en: 'Filter feeds on zooplankton. Growth is extremely slow and colonies can be centuries old, making it a flagship of fragile deep-sea ecosystems.' },
    bioluminescent: false, accent: '#e8d8c0', model: { type: 'glb', key: 'glb', size: 0.62, origin: 'custom', axis: 'y' }
  });

  X.push({
    id: 'pennatula-phosphorea', name: { zh: '海笔', en: 'Sea pen' },
    latin: 'Pennatula phosphorea', taxon: { zh: '珊瑚纲 · 海笔目', en: 'Anthozoa · Pennatulacea' },
    depth: { min: 560, max: 1000, note: { zh: '文献记录 100–1000 m', en: 'Reported 100–1000 m' } },
    size: { zh: '高 20–40 cm', en: '20–40 cm tall' },
    habitat: { zh: '软泥底床。肉质的柄插入沉积物中固定，群体随水流摆动。', en: 'Soft mud, anchored by a fleshy stalk pushed into the sediment; the colony sways with the current.' },
    morphology: { zh: '中央轴两侧排列羽状分枝，形似羽毛笔。轴下部无分枝，为插入泥沙的柄。', en: 'Feather-like branches line both sides of a central axis, like a quill pen; the lower stalk is bare and anchors in the mud.' },
    ecology: { zh: '群体由许多水螅体组成，各自滤食。受扰动时整体发出蓝绿色光，是深海少见的群体发光现象。', en: 'A colony of many polyps that filter feed individually. When disturbed the whole colony glows blue-green, a rare colonial light display.' },
    bioluminescent: true, accent: '#e8a090', model: { type: 'glb', key: 'glb', size: 0.3, origin: 'custom', axis: 'y' }
  });

  // ---------------------------------------------------------------- 蠕虫 / 海蜘蛛
  X.push({
    id: 'polynoid-scale-worm', name: { zh: '鳞沙蚕', en: 'Scale worm' },
    latin: 'Polynoidae indet.', taxon: { zh: '多毛纲 · 鳞沙蚕科', en: 'Polychaeta · Polynoidae' },
    depth: { min: 380, max: 1000, note: { zh: '文献记录 0–5000 m', en: 'Reported 0–5000 m' } },
    size: { zh: '体长 3–8 cm', en: '3–8 cm' },
    habitat: { zh: '底表与固着生物表面。常与海葵、珊瑚共栖，也见于冷泉菌席边缘。', en: 'On the bottom and on sessile organisms, often commensal with anemones and corals, and along the edges of seep mats.' },
    morphology: { zh: '身体分节，背部覆盖两列圆形鳞片，鳞片可脱落。头部有数对触须，体侧疣足发达。', en: 'A segmented body covered by two rows of disc-like scales that can be shed, with several tentacles on the head and well-developed parapodia.' },
    ecology: { zh: '自由生活或共栖，以碎屑与小型无脊椎动物为食。部分种类取食海葵的残饵。', en: 'Free-living or commensal, feeding on detritus and small invertebrates; some take food scraps from their anemone hosts.' },
    bioluminescent: false, accent: '#c89080', model: { type: 'glb', key: 'glb', size: 0.075, origin: 'custom', axis: 'y' }
  });

  X.push({
    id: 'colossendeis-sea-spider', name: { zh: '海蜘蛛', en: 'Sea spider' },
    latin: 'Colossendeis sp.', taxon: { zh: '海蛛纲 · 巨海蛛科', en: 'Pycnogonida · Colossendeidae' },
    depth: { min: 700, max: 1080, note: { zh: '文献记录 200–5000 m', en: 'Reported 200–5000 m' } },
    size: { zh: '足展 20–40 cm', en: '20–40 cm leg span' },
    habitat: { zh: '软泥与岩屑底床。用长足在沉积物表面缓慢行走。', en: 'Soft mud and rubble, walking slowly over the sediment on long legs.' },
    morphology: { zh: '躯干极小，几乎只有吸食用的吻管与四对长足，足长可达体长的数倍。生殖孔位于足上。', en: 'The trunk is tiny — essentially a sucking proboscis and four pairs of very long legs, several times the body length. The gonopores open on the legs.' },
    ecology: { zh: '用吻管刺入海葵、水螅等软体生物吸食体液。部分种类雌雄共同携带卵块。', en: 'Pierces anemones and hydroids with its proboscis to suck body fluids. In some species the male carries the egg mass.' },
    bioluminescent: false, accent: '#c8b090', model: { type: 'glb', key: 'glb', size: 0.42, origin: 'custom', axis: 'y' }
  });

  // ---------------------------------------------------------------- 外部 GLB 模型物种
  X.push({
    id: 'alepocephalus-bairdii', name: { zh: '贝尔德光滑头鱼', en: "Baird's slickhead" },
    latin: 'Alepocephalus bairdii', taxon: { zh: '辐鳍鱼纲 · 光滑头鱼科', en: 'Actinopterygii · Alepocephalidae' },
    depth: { min: 500, max: 900, note: { zh: '文献记录 300–1200 m', en: 'Reported 300–1200 m' } },
    size: { zh: '体长 30–50 cm', en: '30–50 cm' },
    habitat: { zh: '近底水体与大陆坡上方。常贴近坡面缓慢巡游，是深坡常见的中型鱼类。', en: 'Near-bottom water above continental slopes, cruising slowly close to the bottom; a common mid-sized slope fish.' },
    morphology: { zh: '头部光滑无鳞、皮肤松软，身体向后渐细，鳍条柔软，尾鳍分叉。眼相对较大，体色灰白至淡褐。', en: 'A scaleless, soft-skinned head with a body tapering rearward, soft fin rays and a forked tail. The eyes are relatively large and the body pale grey to light brown.' },
    ecology: { zh: '以浮游动物、小型鱼类与头足类为食，夜间上浮、白天回到坡面附近。寿命较长，生长缓慢。', en: 'Feeds on zooplankton, small fish and cephalopods, rising at night and returning to the slope by day. Long-lived and slow-growing.' },
    bioluminescent: false, accent: '#b8c4c8', model: { type: 'glb', key: 'glb', size: 0.44, origin: 'custom' }
  });

  // 追加并重建索引
  A.SPECIES.push(...X);
  A.SPECIES.forEach((s, i) => { s.index = i + 1; });
  A.SPECIES_BY_ID = A.SPECIES.reduce((m, s) => { m[s.id] = s; return m; }, {});
  A.EXTRA_COUNT = X.length;
})();
