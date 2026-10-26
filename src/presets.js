/* ABYSS — 第二批物种：形态参数与生态分布
 * 每个物种一个 preset：{ b: 构建器, p: 形态参数 }
 */
(function () {
  const A = window.ABYSS;
  const P = {};

  // ============================================================ 鱼类（11）
  P['myctophum-punctatum'] = { b: 'fish', p: {
    len: 0.85, depth: 0.15, width: 0.075, shape: 'slender', tail: 'fork', dorsal: 'short', anal: 1, pectoral: 1,
    jaw: 0.25, teeth: 0.18, eye: 0.30, photo: 0.85, back: 0x2a3d4a, belly: 0xc8d8e0, backHex: '#2b3f4d', patHex: '#5d7a88',
    pattern: 'scale', glow: 0x7ff0ff, rim: 0.45, rough: 0.30, metal: 0.35, seed: 11
  } };

  P['argyropelecus-aculeatus'] = { b: 'fish', p: {
    len: 0.55, depth: 0.30, width: 0.055, shape: 'hatchet', tail: 'fork', dorsal: 'short', anal: 1, pectoral: 0.8,
    jaw: 0.2, teeth: 0.15, eye: 0.42, photo: 0.7, back: 0x4a5560, belly: 0xe0e8ea, backHex: '#4a5560', patHex: '#8a9aa4',
    pattern: 'mottle', glow: 0x8ff4ff, rim: 0.6, rough: 0.22, metal: 0.55, seed: 12
  } };

  P['eurypharynx-pelecanoides'] = { b: 'fish', p: {
    len: 1.5, depth: 0.16, width: 0.09, shape: 'eel', tail: 'whip', dorsal: 'none', anal: 0, pectoral: 0.3,
    jaw: 1.0, teeth: 0.12, eye: 0.16, photo: 0.2, back: 0x1a1418, belly: 0x3a2a30, backHex: '#1a1418', patHex: '#2a2026',
    pattern: 'none', glow: 0x9ff0ff, rim: 0.3, rough: 0.55, metal: 0.05, seed: 13
  } };

  P['macropinna-microstoma'] = { b: 'fish', p: {
    len: 0.55, depth: 0.20, width: 0.13, shape: 'glob', tail: 'fork', dorsal: 'short', anal: 1, pectoral: 1,
    jaw: 0.2, teeth: 0.1, eye: 0.34, photo: 0, back: 0x2a2a28, belly: 0x8a8a80, backHex: '#2a2a28', patHex: '#4a4a44',
    pattern: 'none', rim: 0.5, rough: 0.35, metal: 0.15, seed: 14
  } };

  P['anoplogaster-cornuta'] = { b: 'fish', p: {
    len: 0.65, depth: 0.24, width: 0.19, shape: 'glob', tail: 'fork', dorsal: 'short', anal: 1, pectoral: 0.9,
    jaw: 0.55, teeth: 1.0, eye: 0.18, photo: 0, back: 0x140f10, belly: 0x2a1e1c, backHex: '#140f10', patHex: '#241a18',
    pattern: 'mottle', rim: 0.22, rough: 0.62, metal: 0.04, seed: 15
  } };

  P['malacosteus-niger'] = { b: 'fish', p: {
    len: 1.1, depth: 0.14, width: 0.07, shape: 'slender', tail: 'fork', dorsal: 'short', anal: 1, pectoral: 0.7,
    jaw: 0.85, teeth: 0.45, eye: 0.26, photo: 0.35, back: 0x120e12, belly: 0x241820, backHex: '#120e12', patHex: '#1e1620',
    pattern: 'none', glow: 0xff5a4a, rim: 0.3, rough: 0.48, metal: 0.06, seed: 16
  } };

  P['nemichthys-scolopaceus'] = { b: 'fish', p: {
    len: 2.4, depth: 0.055, width: 0.045, shape: 'eel', tail: 'whip', dorsal: 'none', anal: 0, pectoral: 0.2,
    jaw: 0.6, teeth: 0.1, eye: 0.12, photo: 0.15, back: 0x3a3a34, belly: 0x6a6a5c, backHex: '#3a3a34', patHex: '#5a5a50',
    pattern: 'none', rim: 0.35, rough: 0.45, metal: 0.1, seed: 17, segs: 34
  } };

  P['bathypterois-grallator'] = { b: 'fish', p: {
    len: 0.8, depth: 0.13, width: 0.08, shape: 'slender', tail: 'lance', dorsal: 'short', anal: 1, pectoral: 1,
    jaw: 0.15, teeth: 0.12, eye: 0.08, photo: 0.3, back: 0x3a3438, belly: 0x6a6058, backHex: '#3a3438', patHex: '#5a5048',
    pattern: 'none', rim: 0.3, rough: 0.55, metal: 0.05, seed: 18
  } };

  P['careproctus-rastrinus'] = { b: 'fish', p: {
    len: 0.75, depth: 0.22, width: 0.18, shape: 'tadpole', tail: 'round', dorsal: 'long', anal: 1, pectoral: 1,
    jaw: 0.15, teeth: 0.08, eye: 0.22, photo: 0, back: 0xc89a94, belly: 0xe8d0c8, backHex: '#c89a94', patHex: '#e0b8b0',
    pattern: 'mottle', rim: 0.5, rough: 0.34, metal: 0.02, transparent: true, opacity: 0.86, seed: 19
  } };

  P['coryphaenoides-armatus'] = { b: 'fish', p: {
    len: 1.7, depth: 0.22, width: 0.16, shape: 'eel', tail: 'whip', dorsal: 'short', anal: 1, pectoral: 0.9,
    jaw: 0.3, teeth: 0.25, eye: 0.2, photo: 0, back: 0x4a4038, belly: 0x8a7a68, backHex: '#4a4038', patHex: '#6a5c4e',
    pattern: 'scale', rim: 0.28, rough: 0.55, metal: 0.12, seed: 20
  } };

  P['chlamydoselachus-anguineus'] = { b: 'fish', p: {
    len: 2.0, depth: 0.16, width: 0.13, shape: 'eel', tail: 'lance', dorsal: 'short', anal: 1, pectoral: 0.9,
    jaw: 0.45, teeth: 0.5, eye: 0.18, photo: 0, back: 0x2e2a24, belly: 0x5a5044, backHex: '#2e2a24', patHex: '#463c32',
    pattern: 'mottle', rim: 0.26, rough: 0.6, metal: 0.05, seed: 21, gill: true
  } };

  // ============================================================ 水母 / 浮游（4）
  P['beroe-cucumis'] = { b: 'salp', p: {
    len: 0.5, r: 0.13, color: 0x9ec8d4, emissive: 0x2a6070, comb: true, opacity: 0.78, flat: false
  } };

  P['stygiomedusa-gigantea'] = { b: 'jelly', p: {
    bellR: 0.85, bellH: 0.55, flat: true, lobes: 4, radial: 20, tentacles: 4, tentLen: 3.2, tentR: 0.075, trail: 0,
    color: 0x4a1a1e, tentColor: 0x5a2024, opacity: 0.7, emissive: 0x1a0406, rimColor: 0xa05050
  } };

  P['crossota-millsae'] = { b: 'jelly', p: {
    bellR: 0.16, bellH: 0.20, tentacles: 12, tentLen: 0.32, tentR: 0.006,
    color: 0x7a1c26, tentColor: 0x8a2a30, ring: true, ringColor: 0x6fe6ff, opacity: 0.7, flash: true, rimColor: 0xff6a6a
  } };

  P['salpa-maxima'] = { b: 'salp', p: {
    len: 0.42, r: 0.11, color: 0xb8dce4, emissive: 0x1a5060, comb: true, opacity: 0.66
  } };

  // ============================================================ 头足类（4）
  P['grimpoteuthis-sp'] = { b: 'ceph', p: {
    mantleLen: 0.40, girth: 1.0, arms: 8, armLen: 0.34, armR: 0.05, web: true, fins: true,
    color: 0x8a4a52, headColor: 0x9a5a60, armColor: 0x94525a, webColor: 0x7a3a44, finColor: 0xa86a70,
    photo: true, rough: 0.55, rimColor: 0xd08a90
  } };

  P['cranchia-scabra'] = { b: 'ceph', p: {
    mantleLen: 0.42, girth: 0.62, arms: 8, armLen: 0.22, armR: 0.03, web: false, fins: true,
    color: 0x9ab8c0, headColor: 0xa8c4cc, armColor: 0x8aa8b0, finColor: 0xb0ccd4,
    photo: true, transparent: true, opacity: 0.72, rough: 0.25, rimColor: 0xa8e8f4
  } };

  P['architeuthis-dux'] = { b: 'ceph', p: {
    mantleLen: 1.5, girth: 1.4, arms: 8, armLen: 2.0, armR: 0.10, web: false, fins: true,
    color: 0x8a4a44, headColor: 0x9a5a50, armColor: 0x8a4a44, finColor: 0x9a5a50,
    photo: false, rough: 0.6, rimColor: 0xd08a70
  } };

  P['bathypolypus-arcticus'] = { b: 'ceph', p: {
    mantleLen: 0.22, girth: 0.85, arms: 8, armLen: 0.26, armR: 0.055, web: true, fins: false,
    color: 0x7a4a44, headColor: 0x84524a, armColor: 0x7a4a44, webColor: 0x6a3e3a,
    photo: false, rough: 0.72, rimColor: 0xc08070
  } };

  // ============================================================ 甲壳类（4）
  P['eurythenes-gryllus'] = { b: 'crust', p: {
    len: 0.34, width: 0.10, height: 0.075, segs: 7, legs: 7,
    color: 0xb8a898, color2: 0xa8988a, legs: 7, claws: false, iris: 0xd8e0e2
  } };

  P['acanthephyra-purpurea'] = { b: 'crust', p: {
    len: 0.30, width: 0.065, height: 0.06, segs: 6, legs: 6,
    color: 0x8a2a2a, color2: 0xa83a34, legColor: 0x9a3030, claws: false, iris: 0xe0d8d0
  } };

  P['chaceon-quinquedens'] = { b: 'crust', p: {
    len: 0.36, width: 0.15, height: 0.075, segs: 5, legs: 4,
    color: 0x8a3a2e, color2: 0x9a4638, legColor: 0x7a3228, claws: true, clawColor: 0xd8c8b8, iris: 0xe0d8d0
  } };

  P['munidopsis-serricornis'] = { b: 'crust', p: {
    len: 0.22, width: 0.075, height: 0.045, segs: 5, legs: 4,
    color: 0xc8b8a8, color2: 0xd8c8b8, legColor: 0xb8a898, claws: true, clawColor: 0xe0d4c4, iris: 0xe0d8d0
  } };

  // ============================================================ 棘皮类（3）
  P['henricia-sanguinolenta'] = { b: 'star', p: {
    arms: 5, armLen: 0.30, armW: 0.055, discR: 0.055, color: 0x8a2a2e, color2: 0x9a3438, spines: true
  } };

  P['ophiura-sarsii'] = { b: 'star', p: {
    arms: 5, armLen: 0.42, armW: 0.026, discR: 0.05, color: 0x9a8a78, color2: 0xaa9a88, spines: false
  } };

  P['sperosoma-giganteum'] = { b: 'urchin', p: {
    r: 0.16, spines: 80, color: 0x3a2a30, spineColor: 0x4a3640
  } };

  // ============================================================ 固着类（3）
  P['actiniaria-deep'] = { b: 'polyp', p: {
    height: 0.34, r: 0.13, column: true, tentacles: 22, color: 0xb86a5c, tentColor: 0xc87a68, rimColor: 0xffa090
  } };

  P['keratoisis-flexibilis'] = { b: 'polyp', p: {
    height: 0.9, r: 0.16, column: true, branches: 7, color: 0xd8c8b0, branchColor: 0xe0d0b8, rimColor: 0xffe0b0
  } };

  P['pennatula-phosphorea'] = { b: 'polyp', p: {
    height: 0.55, r: 0.10, column: true, branches: 9, color: 0x9a5a5a, branchColor: 0xb06a68,
    branchEmissive: 0x2a6060, rimColor: 0xffb0a0
  } };

  // ============================================================ 蠕虫 / 海蜘蛛（2）
  P['polynoid-scale-worm'] = { b: 'worm', p: {
    len: 0.34, r: 0.045, color: 0xc08070, tube: false
  } };

  P['colossendeis-sea-spider'] = { b: 'crust', p: {
    len: 0.10, width: 0.045, height: 0.03, segs: 3, legs: 4,
    color: 0xb8a080, color2: 0xc8b090, legColor: 0xb8a080, claws: false, iris: 0xd8d0c0
  } };

  A.__presets = P;

  // ============================================================ 分布
  // [x0,x1,z0,z1]
  const PLAN = A.__plan;
  const add = (id, cfg) => { PLAN[id] = cfg; };

  // 中层鱼类：开阔水体
  add('myctophum-punctatum', { count: 26, mode: 'swim', depth: [360, 640], region: [-260, 60, -250, 250], clearance: 16, scale: [0.9, 1.25] });
  add('argyropelecus-aculeatus', { count: 14, mode: 'swim', depth: [340, 560], region: [-250, 40, -240, 240], clearance: 18, scale: [0.9, 1.2] });
  add('eurypharynx-pelecanoides', { count: 4, mode: 'swim', depth: [620, 900], region: [-120, 120, -220, 220], clearance: 30, scale: [0.9, 1.2] });
  add('macropinna-microstoma', { count: 6, mode: 'drift', depth: [420, 700], region: [-180, 60, -220, 220], clearance: 20, scale: [0.95, 1.2] });
  add('anoplogaster-cornuta', { count: 7, mode: 'swim', depth: [600, 880], region: [-140, 140, -230, 230], clearance: 14, scale: [0.9, 1.15] });
  add('malacosteus-niger', { count: 6, mode: 'swim', depth: [520, 820], region: [-160, 120, -220, 220], clearance: 18, scale: [0.9, 1.2] });
  add('nemichthys-scolopaceus', { count: 3, mode: 'drift', depth: [420, 760], region: [-200, 100, -220, 220], clearance: 25, scale: [0.85, 1.1] });
  add('bathypterois-grallator', { count: 5, mode: 'crawl', depth: [860, 1080], region: [60, 280, -200, 200], maxSlope: 0.4, scale: [0.9, 1.15] });
  add('careproctus-rastrinus', { count: 6, mode: 'crawl', depth: [700, 980], region: [-40, 200, -220, 220], maxSlope: 0.45, scale: [0.85, 1.15] });
  add('coryphaenoides-armatus', { count: 5, mode: 'swim', depth: [620, 980], region: [-120, 200, -230, 230], clearance: 10, scale: [0.9, 1.2] });
  add('chlamydoselachus-anguineus', { count: 2, mode: 'swim', depth: [600, 950], region: [-100, 180, -230, 230], clearance: 26, scale: [0.9, 1.1] });

  // 浮游 / 水母
  add('beroe-cucumis', { count: 12, mode: 'drift', depth: [380, 760], region: [-220, 160, -240, 240], clearance: 14, scale: [0.85, 1.2] });
  add('stygiomedusa-gigantea', { count: 2, mode: 'drift', depth: [940, 1090], region: [80, 280, -200, 200], clearance: 14, tall: 5.3, scale: [0.9, 1.15] });
  add('crossota-millsae', { count: 10, mode: 'drift', depth: [700, 1040], region: [0, 260, -230, 230], clearance: 12, scale: [0.9, 1.3] });
  add('salpa-maxima', { count: 14, mode: 'drift', depth: [340, 700], region: [-200, 140, -240, 240], clearance: 12, scale: [0.85, 1.25] });

  // 头足类
  add('grimpoteuthis-sp', { count: 6, mode: 'hover', depth: [820, 1080], region: [60, 260, -200, 200], clearance: 6, scale: [0.9, 1.2] });
  add('cranchia-scabra', { count: 7, mode: 'drift', depth: [500, 860], region: [-140, 180, -230, 230], clearance: 16, scale: [0.9, 1.2] });
  add('architeuthis-dux', { count: 1, mode: 'swim', depth: [620, 900], region: [-60, 180, -180, 180], clearance: 40, scale: [0.85, 1.0] });
  add('bathypolypus-arcticus', { count: 6, mode: 'crawl', depth: [640, 980], region: [-60, 200, -220, 220], maxSlope: 0.5, scale: [0.9, 1.15] });

  // 甲壳类
  add('eurythenes-gryllus', { count: 9, mode: 'crawl', depth: [820, 1080], region: [40, 280, -200, 200], maxSlope: 0.45, scale: [0.85, 1.2] });
  add('acanthephyra-purpurea', { count: 10, mode: 'hover', depth: [520, 940], region: [-120, 220, -230, 230], clearance: 6, scale: [0.9, 1.2] });
  add('chaceon-quinquedens', { count: 6, mode: 'crawl', depth: [620, 960], region: [-80, 200, -220, 220], maxSlope: 0.4, scale: [0.9, 1.15] });
  add('munidopsis-serricornis', { count: 8, mode: 'crawl', depth: [560, 1000], region: [-100, 260, -230, 230], maxSlope: 0.55, scale: [0.85, 1.15] });

  // 棘皮类
  add('henricia-sanguinolenta', { count: 8, mode: 'crawl', depth: [380, 900], region: [-240, 160, -240, 240], maxSlope: 0.55, scale: [0.9, 1.2] });
  add('ophiura-sarsii', { count: 10, mode: 'crawl', depth: [420, 1000], region: [-200, 240, -240, 240], maxSlope: 0.45, scale: [0.85, 1.2] });
  add('sperosoma-giganteum', { count: 6, mode: 'crawl', depth: [640, 1040], region: [-40, 240, -220, 220], maxSlope: 0.5, scale: [0.85, 1.15] });

  // 固着类
  add('actiniaria-deep', { count: 10, mode: 'sessile', depth: [380, 980], region: [-260, 240, -240, 240], minSlope: 0.25, scale: [0.85, 1.25] });
  add('keratoisis-flexibilis', { count: 8, mode: 'sessile', depth: [520, 1020], region: [-240, 220, -240, 240], minSlope: 0.4, scale: [0.8, 1.2] });
  add('pennatula-phosphorea', { count: 7, mode: 'sessile', depth: [560, 1000], region: [-100, 220, -230, 230], maxSlope: 0.3, scale: [0.85, 1.2] });

  // 蠕虫 / 海蜘蛛
  add('polynoid-scale-worm', { count: 10, mode: 'crawl', depth: [380, 1000], region: [-240, 220, -240, 240], maxSlope: 0.6, scale: [0.85, 1.2] });
  add('alepocephalus-bairdii', { count: 5, mode: 'swim', depth: [560, 900], region: [-120, 180, -230, 230], clearance: 12, scale: [1.0, 1.4] });
  add('colossendeis-sea-spider', { count: 5, mode: 'crawl', depth: [700, 1080], region: [20, 260, -200, 200], maxSlope: 0.5, scale: [0.9, 1.2] });
})();
