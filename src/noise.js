/* ABYSS — 地形与噪声基础模块
 * 世界尺度：1 unit = 1 m，深度为正向下的数值 depth(m)，世界坐标 y = -depth。
 */
(function () {
  const A = (window.ABYSS = window.ABYSS || {});

  const WORLD = {
    half: 500,          // 地形半边长（1000 × 1000 m）
    playRadius: 320,    // 玩家水平活动半径
    minDepth: 300,      // 可活动最浅深度
    maxDepth: 1120,     // 可活动最深深度
    start: { x: -80, z: 105, depth: 648, yaw: 1.30, pitch: -0.10 },
    // 冷泉斑块（峡谷底部），x 由峡谷中心线推导
    seeps: [
      { z: -64, off: -10, r: 26 },
      { z: 86, off: 14, r: 22 },
      { z: 168, off: -6, r: 20 }
    ]
  };

  // ---------- 基础数学 ----------
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  function smoothstep(e0, e1, x) {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  // ---------- 确定性噪声 ----------
  function hash2(ix, iy) {
    let h = Math.imul(ix | 0, 374761393) + Math.imul(iy | 0, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967295;
  }

  function vnoise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = hash2(xi, yi), b = hash2(xi + 1, yi);
    const c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  }

  function fbm(x, y, oct, lac, gain) {
    lac = lac || 2.02;
    gain = gain || 0.5;
    let amp = 1, freq = 1, sum = 0, norm = 0;
    for (let i = 0; i < oct; i++) {
      sum += vnoise(x * freq, y * freq) * amp;
      norm += amp;
      amp *= gain;
      freq *= lac;
    }
    return sum / norm;
  }

  // 供散布使用：带种子的伪随机
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- 海山侧翼横剖面 ----------
  // 西侧为海山脊顶（浅），向东缓降至深渊平原，再被峡谷切开
  const BASE = [
    [-520, 288], [-430, 310], [-360, 350], [-310, 400], [-270, 452],
    [-235, 505], [-200, 556], [-168, 606], [-136, 652], [-100, 690],
    [-62, 720], [-24, 740], [16, 750], [58, 758], [100, 768],
    [140, 782], [180, 800], [220, 818], [260, 838], [300, 858],
    [350, 878], [420, 896], [520, 908]
  ];

  function sampleCurve(pts, x) {
    let i = 0;
    while (i < pts.length - 2 && x > pts[i + 1][0]) i++;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i];
    const p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const t = clamp((x - p1[0]) / (p2[0] - p1[0]), 0, 1);
    const t2 = t * t, t3 = t2 * t;
    const y0 = p0[1], y1 = p1[1], y2 = p2[1], y3 = p3[1];
    return 0.5 * ((2 * y1) + (-y0 + y2) * t +
      (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 +
      (-y0 + 3 * y1 - 3 * y2 + y3) * t3);
  }

  // 峡谷中心线（随 z 蜿蜒）
  function canyonX(z) {
    return 176 + 52 * Math.sin(z * 0.0055) + 15 * Math.sin(z * 0.013 + 1.2);
  }

  // 峡谷宽度内的额外下切
  function canyonCut(x, z) {
    const cx = canyonX(z);
    const d = Math.abs(x - cx);
    const w = 145 + 20 * Math.sin(z * 0.009 + 2.0);
    const k = 1 - smoothstep(40, w, d);
    return k * (205 + 22 * fbm(x * 0.02, z * 0.02, 2));
  }

  // 主峰与孤峰（地标）
  const KNOLLS = [
    { x: -212, z: -78, r: 62, h: 128 },
    { x: -168, z: 152, r: 86, h: 92 },
    { x: -246, z: 236, r: 54, h: 104 },
    { x: 96, z: -232, r: 74, h: 46 },
    { x: 246, z: -150, r: 58, h: 54 }
  ];

  function terrainDepth(x, z) {
    // 走向蜿蜒：整条剖面沿 z 轻微摆动，避免笔直的“墙”
    const xm = x + 34 * Math.sin(z * 0.0042) + 12 * Math.sin(z * 0.011 + 0.7);
    let d = sampleCurve(BASE, xm);
    d += canyonCut(x, z);

    for (let i = 0; i < KNOLLS.length; i++) {
      const k = KNOLLS[i];
      const dx = x - k.x, dz = z - k.z;
      const q = (dx * dx + dz * dz) / (k.r * k.r);
      if (q < 4) d -= k.h * Math.exp(-q * 1.15);
    }

    // 大尺度起伏 + 中尺度 + 细节
    d += (fbm(x * 0.0036 + 11.3, z * 0.0036 - 4.7, 4) - 0.5) * 44;
    d += (fbm(x * 0.012 + 3.1, z * 0.012 + 9.4, 3) - 0.5) * 9;
    d += (fbm(x * 0.038 - 7.2, z * 0.038 + 1.9, 2) - 0.5) * 2.8;

    // 边缘抬升，避免玩家看到地形断口（带角向扰动，避免圆形人工感）
    const rr = Math.sqrt(x * x + z * z);
    const ang = Math.atan2(z, x);
    const rim = rr + 46 * Math.sin(ang * 3.0) + 26 * Math.sin(ang * 5.0 + 1.7);
    d += smoothstep(392, 520, rim) * 165;

    return clamp(d, 262, 1160);
  }

  function terrainSlope(x, z) {
    const e = 2.2;
    const dx = (terrainDepth(x + e, z) - terrainDepth(x - e, z)) / (2 * e);
    const dz = (terrainDepth(x, z + e) - terrainDepth(x, z - e)) / (2 * e);
    // 返回 0（水平）~1（垂直）的近似陡峭度
    return Math.sqrt(dx * dx + dz * dz) / Math.sqrt(1 + dx * dx + dz * dz);
  }

  // 深度 → 环境色 / 光强（供世界与 HUD 共用）
  // 分四层而不是一条线性插值：
  //   300–500m  暮光层：仍有一丝上方余光，偏青蓝，能看清岩壁颜色
  //   500–700m  过渡层：蓝转蓝黑，地形开始只剩明暗关系
  //   700–900m  无光层：背景压到近黑，一切光源来自探照灯与生物
  //   900–1120m 深渊底：纯黑背景，只靠局部光源揭示形体
  // 用四段 key 做平滑插值，避免线性插值在深段"永远不够黑"。
  const TINT_KEYS = [
    { d: 300, fog: 0x0d3446, up: 0x4a9ab2, amb: 1.20 },
    { d: 520, fog: 0x082231, up: 0x2b6b84, amb: 0.92 },
    { d: 720, fog: 0x041420, up: 0x14404f, amb: 0.62 },
    { d: 900, fog: 0x020a12, up: 0x081c26, amb: 0.40 },
    { d: 1120, fog: 0x010509, up: 0x03090e, amb: 0.28 }
  ];
  const _tintCache = { fog: new THREE.Color(), up: new THREE.Color() };
  const _cA = new THREE.Color(), _cB = new THREE.Color();

  function depthTint(depth) {
    const d = clamp(depth, 300, 1120);
    let i = 0;
    while (i < TINT_KEYS.length - 2 && d > TINT_KEYS[i + 1].d) i++;
    const a = TINT_KEYS[i], b = TINT_KEYS[i + 1];
    const t = clamp((d - a.d) / (b.d - a.d), 0, 1);
    // smoothstep 而非线性：层与层之间的过渡更自然，没有折角
    const k = t * t * (3 - 2 * t);
    _cA.setHex(a.fog); _cB.setHex(b.fog);
    _tintCache.fog.copy(_cA).lerp(_cB, k);
    _cA.setHex(a.up); _cB.setHex(b.up);
    _tintCache.up.copy(_cA).lerp(_cB, k);
    _tintCache.ambient = lerp(a.amb, b.amb, k);
    _tintCache.t = clamp((d - 300) / 820, 0, 1);
    // 返回副本：调用方会把 fog 直接 copy 进 scene.fog.color，
    // 若共用同一份 Color，下一次调用还没读就被改写，画面会滞后一帧。
    return {
      fog: _tintCache.fog.clone(),
      up: _tintCache.up.clone(),
      ambient: _tintCache.ambient,
      t: _tintCache.t
    };
  }

  A.WORLD = WORLD;
  A.util = { clamp, lerp, smoothstep, fbm, vnoise, mulberry32, hash2 };
  A.terrain = { depth: terrainDepth, slope: terrainSlope, canyonX, depthTint, KNOLLS };
})();
