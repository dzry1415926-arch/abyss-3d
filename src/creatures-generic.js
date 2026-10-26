/* ABYSS — 通用参数化生物构建器（第二批物种）
 * 通过形态参数生成不同物种：鱼 / 水母 / 头足类 / 甲壳类 / 棘皮类 / 固着类 / 蠕虫 / 樽海鞘
 * 目标不是"几何体拼接"，而是按解剖结构组织：躯干放样 + 鳍条 + 眼 + 鳃盖 + 发光器 + 皮肤贴图
 */
(function () {
  const A = window.ABYSS;
  const { tag, loft, taperedTube, fin, ball, spike, merge, curveAt, organicMat } = A.__builders;

  // ---------------------------------------------------------------- 皮肤贴图
  const skinCache = new Map();
  function skinTex(kind, c1, c2, seed) {
    const key = kind + c1 + c2 + (seed || 0);
    if (skinCache.has(key)) return skinCache.get(key);
    const S = 256;
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = c1;
    ctx.fillRect(0, 0, S, S);
    const rnd = A.util.mulberry32((seed || 1) * 7919 + 13);
    ctx.strokeStyle = c2;
    ctx.fillStyle = c2;

    if (kind === 'scale') {
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1.4;
      const w = 16, h = 12;
      for (let row = -1; row < S / h + 1; row++) {
        for (let col = -1; col < S / w + 1; col++) {
          const x = col * w + (row % 2 ? w / 2 : 0);
          const y = row * h;
          ctx.beginPath();
          ctx.arc(x, y, w * 0.62, 0.15 * Math.PI, 0.85 * Math.PI);
          ctx.stroke();
        }
      }
    } else if (kind === 'bar') {
      ctx.globalAlpha = 0.4;
      for (let i = 0; i < 9; i++) {
        const w = 6 + rnd() * 12;
        ctx.fillRect(rnd() * S, 0, w, S);
      }
    } else if (kind === 'spot') {
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < 90; i++) {
        const r = 1.5 + rnd() * 4;
        ctx.beginPath();
        ctx.arc(rnd() * S, rnd() * S, r, 0, 6.283);
        ctx.fill();
      }
    } else if (kind === 'mottle') {
      ctx.globalAlpha = 0.45;
      for (let i = 0; i < 700; i++) {
        const r = 2 + rnd() * 9;
        ctx.beginPath();
        ctx.arc(rnd() * S, rnd() * S, r, 0, 6.283);
        ctx.fill();
      }
    } else if (kind === 'reticulate') {
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 26; i++) {
        ctx.beginPath();
        let x = rnd() * S, y = rnd() * S;
        ctx.moveTo(x, y);
        for (let k = 0; k < 5; k++) { x += (rnd() - 0.5) * 40; y += (rnd() - 0.5) * 40; ctx.lineTo(x, y); }
        ctx.stroke();
      }
    }
    // 细颗粒
    ctx.globalAlpha = 0.08;
    for (let i = 0; i < 2600; i++) {
      ctx.fillRect(rnd() * S, rnd() * S, 1, 1);
    }
    ctx.globalAlpha = 1;

    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    skinCache.set(key, tex);
    return tex;
  }

  // 沿高度做反荫蔽（背深腹浅）
  function shadeByHeight(geo, backHex, bellyHex) {
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    const y0 = bb.min.y, y1 = bb.max.y;
    const top = new THREE.Color(backHex);
    const bot = new THREE.Color(bellyHex);
    const c = new THREE.Color();
    const arr = geo.attributes.color.array;
    for (let i = 0; i < geo.attributes.position.count; i++) {
      const y = geo.attributes.position.getY(i);
      const k = A.util.clamp((y - y0) / Math.max(0.0001, y1 - y0), 0, 1);
      c.copy(bot).lerp(top, Math.pow(k, 0.8));
      arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b;
    }
    geo.attributes.color.needsUpdate = true;
    return geo;
  }

  function eyePair(r, x, y, z, irisHex, pupilHex) {
    const out = [];
    for (const s of [-1, 1]) {
      const iris = ball(s * x, y, z, r, 8);
      out.push(tag(iris, irisHex || 0xdfe8ea, 0x223038, 0.25));
      const pupil = ball(s * (x + r * 0.42), y, z + r * 0.18, r * 0.56, 7);
      out.push(tag(pupil, pupilHex || 0x05070a));
    }
    return out;
  }

  // ---------------------------------------------------------------- 鱼
  const SHAPES = {
    slender: [[0, 0.05], [0.06, 0.42], [0.16, 0.78], [0.30, 1.0], [0.48, 0.86], [0.68, 0.58], [0.86, 0.28], [1, 0.07]],
    deep: [[0, 0.06], [0.08, 0.52], [0.22, 0.92], [0.40, 1.0], [0.60, 0.82], [0.78, 0.46], [0.92, 0.18], [1, 0.05]],
    glob: [[0, 0.16], [0.10, 0.62], [0.26, 0.94], [0.46, 1.0], [0.66, 0.86], [0.84, 0.50], [0.94, 0.22], [1, 0.08]],
    eel: [[0, 0.10], [0.08, 0.52], [0.22, 0.70], [0.42, 0.72], [0.62, 0.62], [0.82, 0.42], [0.94, 0.22], [1, 0.06]],
    hatchet: [[0, 0.10], [0.10, 0.66], [0.26, 1.0], [0.44, 0.94], [0.62, 0.62], [0.80, 0.34], [0.92, 0.16], [1, 0.05]],
    tadpole: [[0, 0.10], [0.12, 0.70], [0.30, 1.0], [0.48, 0.90], [0.66, 0.58], [0.84, 0.28], [1, 0.06]]
  };

  function fishGeo(p) {
    const L = p.len;
    const depth = p.depth, width = p.width;
    const pts = SHAPES[p.shape || 'slender'].map((a) => [a[0], a[1]]);
    const prof = (t) => ({
      rx: Math.max(0.004, curveAt(pts, t) * width),
      ry: Math.max(0.004, curveAt(pts, t) * depth)
    });
    const parts = [];
    const body = loft(prof, { length: L, segs: p.segs || 26, radial: 14 });
    parts.push(tag(body, 0xffffff));

    // 下颌
    if (p.jaw > 0) {
      const jl = L * 0.34 * p.jaw;
      const jaw = taperedTube([
        [0, -depth * 0.25, L * 0.14],
        [0, -depth * 0.55 * p.jaw, L * 0.02],
        [0, -depth * 0.78 * p.jaw, -jl * 0.55]
      ], width * 0.42, width * 0.12, 8, 6);
      parts.push(tag(jaw, 0xffffff));
    }
    // 鳃盖（一圈薄片）
    if (p.gill !== false) {
      const g = new THREE.TorusGeometry(depth * 0.86, Math.max(0.004, depth * 0.05), 4, 18, Math.PI * 0.9);
      g.rotateY(Math.PI / 2);
      g.rotateZ(-Math.PI * 0.45);
      g.translate(0, 0, L * 0.27);
      parts.push(tag(g, 0xe8eef0));
    }

    // 尾鳍
    if (p.tail !== 'none') {
      let tail;
      if (p.tail === 'whip') {
        tail = taperedTube([[0, 0, L * 0.94], [0, 0, L * 1.15], [0, 0, L * 1.5]], width * 0.16, 0.004, 8, 4);
      } else if (p.tail === 'lance') {
        tail = fin([[0, 0], [-L * 0.16, depth * 0.5], [-L * 0.26, 0], [-L * 0.16, -depth * 0.5]], 0.012);
        tail.rotateY(Math.PI / 2);
        tail.translate(0, 0, L * 0.96);
      } else if (p.tail === 'round') {
        tail = fin([[0, 0], [-L * 0.14, depth * 0.55], [-L * 0.26, 0], [-L * 0.14, -depth * 0.55]], 0.012);
        tail.rotateY(Math.PI / 2);
        tail.translate(0, 0, L * 0.96);
      } else {
        tail = fin([[0, 0], [-L * 0.18, depth * 0.72], [-L * 0.28, depth * 0.66], [-L * 0.20, 0], [-L * 0.28, -depth * 0.66], [-L * 0.18, -depth * 0.72]], 0.012);
        tail.rotateY(Math.PI / 2);
        tail.translate(0, 0, L * 0.96);
      }
      parts.push(tag(tail, 0xd8e2e6));
    }

    // 背鳍
    if (p.dorsal && p.dorsal !== 'none') {
      const dh = p.dorsal === 'sail' ? depth * 1.5 : p.dorsal === 'long' ? depth * 0.45 : depth * 0.7;
      const len = p.dorsal === 'long' ? L * 0.5 : L * 0.22;
      const d = fin([[0, 0], [-len * 0.35, dh], [-len, dh * 0.75], [-len * 0.8, 0]], 0.010);
      d.rotateY(Math.PI / 2);
      d.translate(0, depth * 0.86, p.dorsal === 'long' ? L * 0.45 : L * 0.42);
      parts.push(tag(d, 0xd8e2e6));
    }
    // 臀鳍
    if (p.anal) {
      const a = fin([[0, 0], [-L * 0.14, -depth * 0.3], [-L * 0.22, 0]], 0.008);
      a.rotateY(Math.PI / 2);
      a.translate(0, -depth * 0.8, L * 0.6);
      parts.push(tag(a, 0xd8e2e6));
    }
    // 胸鳍
    if (p.pectoral !== 0) {
      for (const s of [-1, 1]) {
        const pc = fin([[0, 0], [-L * 0.10, depth * 0.22], [-L * 0.15, depth * 0.04], [-L * 0.06, -depth * 0.06]], 0.008);
        pc.rotateY(s * 1.15);
        pc.translate(s * width * 0.82, -depth * 0.18, L * 0.26);
        parts.push(tag(pc, 0xd8e2e6));
      }
    }

    let bodyGeo = merge(parts);
    shadeByHeight(bodyGeo, p.back, p.belly);

    const detail = [];
    // 齿
    if (p.teeth) {
      const n = 5 + Math.round(p.teeth * 5);
      for (let i = 0; i < n; i++) {
        const t = 0.05 + (i / n) * 0.16;
        const r = depth * (0.55 - t * 1.2);
        for (const s of [-1, 1]) {
          const g = new THREE.ConeGeometry(width * 0.05, depth * 0.28 * p.teeth, 4);
          g.rotateX(Math.PI * 0.9);
          g.translate(s * width * 0.42, -r, t * L);
          detail.push(tag(g, 0xe4dcc4, 0x2a2418, 0.2));
        }
      }
    }
    // 眼
    const eyeR = depth * (p.eye == null ? 0.16 : p.eye);
    detail.push(...eyePair(eyeR, width * 0.72, depth * 0.30, L * 0.16, p.iris || 0xd9e4e6));

    // 发光器
    if (p.photo) {
      const n = Math.round(10 + p.photo * 18);
      for (let i = 0; i < n; i++) {
        const t = 0.2 + (i / n) * 0.72;
        const pr = curveAt(pts, t);
        detail.push(tag(ball(0, -pr * depth * 0.9, t * L, Math.max(0.012, depth * 0.05), 5), 0xd8fbff, p.glow || 0x6feaff, 3.4));
      }
    }
    // 钓竿
    if (p.lure) {
      const rod = taperedTube([
        [0, depth * 0.7, L * 0.28], [0, depth * 1.35, L * 0.18], [0, depth * 1.55, -L * 0.12]
      ], 0.014, 0.006, 10, 5);
      detail.push(tag(rod, 0x3a3a38));
      detail.push(tag(ball(0, depth * 1.5, -L * 0.16, depth * 0.22, 8), 0xffe6b0, p.glow || 0xffc257, 3.4));
    }

    const geo = merge([bodyGeo, ...detail]);
    geo.computeBoundingSphere();
    const tex = skinTex(p.pattern || 'none', p.backHex || '#2a3238', p.patHex || '#3d4a52', p.seed || 3);
    tex.repeat.set(p.texRep ? p.texRep[0] : 2, p.texRep ? p.texRep[1] : 4);
    const mat = organicMat({
      roughness: p.rough == null ? 0.42 : p.rough,
      metalness: p.metal == null ? 0.10 : p.metal,
      transparent: !!p.transparent, opacity: p.opacity == null ? 1 : p.opacity,
      amp: p.amp == null ? 0.05 : p.amp,
      freq: p.freq || 5.0, speed: p.speed || 2.2, len: L,
      rim: p.rim == null ? 0.3 : p.rim, rimColor: p.rimColor || 0x9fd8ee,
      map: tex
    });
    return { geo, mat, size: L * 1.15, axis: 'z' };
  }

  // ---------------------------------------------------------------- 水母
  function jellyGeo(p) {
    const parts = [];
    const R = p.bellR, H = p.bellH;
    const bell = loft((t) => {
      const k = 1 - t;
      const r = R * Math.sqrt(Math.max(0, 1 - k * k * (p.flat ? 0.45 : 0.92)));
      const lobe = 1 + (p.lobes ? 0.08 * Math.cos(t * 6.283 * p.lobes) : 0);
      return { rx: Math.max(0.02, r * lobe), ry: Math.max(0.02, r * lobe) };
    }, { length: H, segs: 18, radial: p.radial || 22, capStart: true, capEnd: false });
    bell.rotateX(-Math.PI / 2);
    bell.translate(0, H, 0);
    parts.push(tag(bell, p.color || 0x6d1f24, p.emissive || 0x000000, 0.35));

    const n = p.tentacles == null ? 16 : p.tentacles;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = R * 0.92;
      const sway = (i % 3) * 0.05;
      const tg = taperedTube([
        [Math.cos(a) * r, 0.02, Math.sin(a) * r],
        [Math.cos(a) * (r + sway), -p.tentLen * 0.5, Math.sin(a) * (r + sway)],
        [Math.cos(a) * (r + sway * 2), -p.tentLen, Math.sin(a) * (r + sway * 2)]
      ], p.tentR || 0.012, 0.004, 6, 4);
      parts.push(tag(tg, p.tentColor || p.color || 0x8a3038, p.tentEmissive || 0x000000, 0.3));
    }
    if (p.trail) {
      const tr = taperedTube([[0, 0, 0], [0.1, -p.trail * 0.45, 0.1], [-0.05, -p.trail, -0.05]], 0.02, 0.004, 12, 5);
      parts.push(tag(tr, p.tentColor || p.color, 0x000000, 0));
    }
    if (p.ring) {
      const ring = new THREE.TorusGeometry(R * 0.93, 0.02, 6, 36);
      ring.rotateX(Math.PI / 2);
      ring.translate(0, 0.06, 0);
      parts.push(tag(ring, 0x0a1c22, p.ringColor || 0x5fe6ff, 1.0));
    }
    const geo = merge(parts);
    geo.computeBoundingSphere();
    const mat = organicMat({
      roughness: 0.34, metalness: 0.0, transparent: true, opacity: p.opacity == null ? 0.62 : p.opacity,
      side: THREE.DoubleSide, depthWrite: false,
      amp: 0.04, freq: 6, speed: 1.8, len: 1, axis: 'y',
      rim: 0.5, rimColor: p.rimColor || 0xff8a7a, flash: !!p.flash
    });
    return { geo, mat, size: Math.max(H * 2.2, p.tentLen || 1) * 0.9, axis: 'y' };
  }

  // ---------------------------------------------------------------- 头足类
  function cephGeo(p) {
    const parts = [];
    const L = p.mantleLen;
    const mantle = loft((t) => ({
      rx: curveAt([[0, 0.16], [0.2, 0.3], [0.55, 0.32], [0.8, 0.22], [1, 0.05]], t) * p.girth,
      ry: curveAt([[0, 0.18], [0.2, 0.32], [0.55, 0.34], [0.8, 0.24], [1, 0.05]], t) * p.girth
    }), { length: L, segs: 18, radial: 14 });
    parts.push(tag(mantle, p.color || 0x2a0c16));

    const head = ball(0, 0, 0.02, p.girth * 0.30, 12);
    head.scale(1, 0.95, 0.8);
    parts.push(tag(head, p.headColor || p.color || 0x320f1d));
    parts.push(...eyePair(p.girth * 0.13, p.girth * 0.24, 0.04, 0.1, p.iris || 0xd8e2e4));

    const arms = p.arms || 8;
    const armLen = p.armLen;
    for (let i = 0; i < arms; i++) {
      const a = (i / arms) * Math.PI * 2 + 0.2;
      const r = p.girth * 0.28;
      const arm = taperedTube([
        [Math.cos(a) * r, Math.sin(a) * r, -0.02],
        [Math.cos(a) * r * 1.6, Math.sin(a) * r * 1.6, -armLen * 0.45],
        [Math.cos(a) * r * 2.1, Math.sin(a) * r * 2.1, -armLen]
      ], p.armR, p.armR * 0.25, 8, 5);
      parts.push(tag(arm, p.armColor || p.color));
    }
    if (p.web) {
      const wr = 10, wrad = 26;
      const wp = [], wu = [], wi = [];
      for (let i = 0; i <= wr; i++) {
        const t = i / wr;
        for (let j = 0; j < wrad; j++) {
          const a = (j / wrad) * Math.PI * 2;
          const lobe = 1 + 0.09 * Math.cos(a * arms);
          const r = A.util.lerp(p.girth * 0.26, p.girth * 0.62 * lobe, Math.pow(t, 0.85));
          wp.push(Math.cos(a) * r, Math.sin(a) * r * 0.95, -t * armLen * 0.85);
          wu.push(j / wrad, t);
        }
      }
      for (let i = 0; i < wr; i++) {
        for (let j = 0; j < wrad; j++) {
          const a = i * wrad + j, b = i * wrad + ((j + 1) % wrad);
          const c = a + wrad, d = b + wrad;
          wi.push(a, b, c, b, d, c);
        }
      }
      const wg = new THREE.BufferGeometry();
      wg.setAttribute('position', new THREE.Float32BufferAttribute(wp, 3));
      wg.setAttribute('uv', new THREE.Float32BufferAttribute(wu, 2));
      wg.setIndex(wi);
      wg.computeVertexNormals();
      parts.push(tag(wg, p.webColor || p.color, 0x12040a, 0.3));
    }
    if (p.fins) {
      for (const s of [-1, 1]) {
        const f = fin([[0, 0], [-0.16, 0.10], [-0.24, 0.0], [-0.12, -0.06]], 0.008);
        f.rotateY(Math.PI / 2);
        f.rotateZ(s * 0.3);
        f.translate(s * p.girth * 0.22, p.girth * 0.1, L * 0.9);
        parts.push(tag(f, p.finColor || p.color));
      }
    }
    if (p.photo) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        parts.push(tag(ball(Math.cos(a) * p.girth * 0.3, Math.sin(a) * p.girth * 0.3, -armLen, 0.018, 5), 0xc8f6ff, 0x7fe6ff, 2.6));
      }
    }
    const geo = merge(parts);
    geo.rotateX(-Math.PI / 2);
    geo.computeBoundingSphere();
    const mat = organicMat({
      roughness: p.rough == null ? 0.66 : p.rough, metalness: 0.02,
      transparent: !!p.transparent, opacity: p.opacity == null ? 1 : p.opacity,
      amp: 0.04, freq: 4, speed: 1.4, len: 1, axis: 'y',
      rim: 0.3, rimColor: p.rimColor || 0xa05060
    });
    return { geo, mat, size: L + armLen, axis: 'y' };
  }

  // ---------------------------------------------------------------- 甲壳类
  function crustGeo(p) {
    const parts = [];
    const L = p.len;
    const segs = p.segs || 6;
    for (let s = 0; s < segs; s++) {
      const t0 = s / segs, t1 = (s + 1) / segs;
      const w = p.width * (0.55 + 0.6 * Math.sin(Math.PI * (t0 * 0.85 + 0.15)));
      const g = loft((t) => ({
        rx: w * (0.94 + 0.06 * Math.sin(Math.PI * t)),
        ry: p.height * (0.94 + 0.08 * Math.sin(Math.PI * t))
      }), { length: (t1 - t0) * L * 0.97, segs: 4, radial: 12 });
      g.translate(0, 0, t0 * L + L * 0.12);
      parts.push(tag(g, s % 2 ? p.color : p.color2 || p.color));
    }
    const head = loft((t) => ({
      rx: p.width * 0.5 * (0.5 + 0.6 * Math.sin(Math.PI * (0.3 + t * 0.7))),
      ry: p.height * 0.55 * (0.6 + 0.6 * t)
    }), { length: L * 0.2, segs: 5, radial: 12 });
    head.translate(0, 0, -L * 0.06);
    parts.push(tag(head, p.color2 || p.color));
    parts.push(...eyePair(p.width * 0.14, p.width * 0.32, p.height * 0.3, -L * 0.02, p.iris || 0xcfd8da));

    // 触角
    for (const s of [-1, 1]) {
      parts.push(tag(taperedTube([
        [s * p.width * 0.2, 0, -L * 0.1], [s * p.width * 0.45, 0.02, -L * 0.34], [s * p.width * 0.6, -0.04, -L * 0.56]
      ], 0.016, 0.004, 7, 4), p.color2 || p.color));
    }
    // 步足
    const legs = p.legs || 6;
    for (let i = 0; i < legs; i++) {
      const z = L * 0.12 + (i / legs) * L * 0.72;
      for (const s of [-1, 1]) {
        parts.push(tag(taperedTube([
          [s * p.width * 0.42, -p.height * 0.2, z],
          [s * p.width * 0.68, -p.height * 0.75, z + L * 0.03],
          [s * p.width * 0.72, -p.height * 1.15, z + L * 0.07]
        ], 0.018, 0.005, 5, 4), p.legColor || p.color));
      }
    }
    // 螯
    if (p.claws) {
      for (const s of [-1, 1]) {
        const arm = taperedTube([
          [s * p.width * 0.3, -p.height * 0.1, -L * 0.1],
          [s * p.width * 0.7, -p.height * 0.3, -L * 0.34],
          [s * p.width * 0.9, -p.height * 0.25, -L * 0.52]
        ], 0.03, 0.018, 6, 5);
        parts.push(tag(arm, p.color2 || p.color));
        const claw = loft((t) => ({
          rx: 0.05 * (1 - t * 0.7), ry: 0.08 * (1 - t * 0.5)
        }), { length: L * 0.22, segs: 4, radial: 8 });
        claw.rotateY(s * 0.5);
        claw.translate(s * p.width * 0.95, -p.height * 0.25, -L * 0.66);
        parts.push(tag(claw, p.clawColor || 0xd8cfc0));
      }
    }
    // 尾扇
    for (let i = 0; i < 5; i++) {
      const a = -0.5 + (i / 4) * 1.0;
      const bl = fin([[0, 0], [L * 0.14, p.width * 0.12], [L * 0.24, 0], [L * 0.14, -p.width * 0.12]], 0.01);
      bl.rotateZ(a * 0.4);
      bl.rotateY(Math.PI / 2);
      bl.translate(Math.sin(a) * p.width * 0.16, 0, L * 1.02);
      parts.push(tag(bl, p.color2 || p.color));
    }
    const geo = merge(parts);
    geo.computeBoundingSphere();
    const mat = organicMat({
      roughness: 0.55, metalness: 0.12, amp: 0, rim: 0.2, rimColor: 0xd8c9a8
    });
    return { geo, mat, size: L * 1.3, axis: 'z' };
  }

  // ---------------------------------------------------------------- 海星 / 蛇尾
  function starGeo(p) {
    const parts = [];
    const n = p.arms || 5;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const len = p.armLen * (p.arms === 5 ? 1 : 0.9);
      const arm = loft((t) => ({
        rx: p.armW * (1 - t * 0.86) * (t < 0.15 ? 1 : 1),
        ry: p.armW * 0.55 * (1 - t * 0.8)
      }), { length: len, segs: 8, radial: 8 });
      arm.rotateZ(-Math.PI / 2);
      arm.rotateY(-a);
      arm.translate(Math.cos(a) * p.discR, p.armW * 0.3, Math.sin(a) * p.discR);
      parts.push(tag(arm, p.color));
    }
    const disc = ball(0, 0, 0, p.discR * 1.1, 10);
    disc.scale(1, 0.55, 1);
    parts.push(tag(disc, p.color2 || p.color));
    if (p.spines) {
      for (let i = 0; i < 26; i++) {
        const a = Math.random() * Math.PI * 2, r = Math.random() * p.armLen * 0.7;
        parts.push(tag(spike(Math.cos(a) * r, p.armW * 0.2, Math.sin(a) * r, 0.008, p.armW * 0.5), 0xe8e2d4));
      }
    }
    const geo = merge(parts);
    geo.computeBoundingSphere();
    const mat = organicMat({ roughness: 0.72, metalness: 0.03, amp: 0, rim: 0.18, rimColor: 0xd8c0a8 });
    return { geo, mat, size: p.armLen * 2.2, axis: 'z' };
  }

  // ---------------------------------------------------------------- 海胆
  function urchinGeo(p) {
    const parts = [];
    const body = ball(0, 0, 0, p.r, 12);
    body.scale(1, 0.82, 1);
    parts.push(tag(body, p.color || 0x2a2028));
    const n = p.spines || 90;
    for (let i = 0; i < n; i++) {
      const u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1);
      const sx = Math.sin(v) * Math.cos(u), sy = Math.cos(v), sz = Math.sin(v) * Math.sin(u);
      const len = p.r * (0.7 + Math.random() * 0.7);
      const g = new THREE.ConeGeometry(p.r * 0.045, len, 4);
      g.translate(0, len / 2, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(sx, sy * 0.82, sz).normalize());
      g.applyQuaternion(q);
      g.translate(sx * p.r * 0.9, sy * p.r * 0.74, sz * p.r * 0.9);
      parts.push(tag(g, p.spineColor || 0x3a2c34));
    }
    const geo = merge(parts);
    geo.computeBoundingSphere();
    const mat = organicMat({ roughness: 0.62, metalness: 0.06, amp: 0, rim: 0.22, rimColor: 0xa07080 });
    return { geo, mat, size: p.r * 3, axis: 'y' };
  }

  // ---------------------------------------------------------------- 固着类（海葵 / 珊瑚 / 海笔）
  function polypGeo(p) {
    const parts = [];
    const H = p.height;
    if (p.column) {
      const col = loft((t) => ({
        rx: p.r * (0.7 + 0.35 * Math.sin(t * Math.PI * 0.9)),
        ry: p.r * (0.7 + 0.35 * Math.sin(t * Math.PI * 0.9))
      }), { length: H, segs: 10, radial: 12 });
      col.rotateX(-Math.PI / 2);
      parts.push(tag(col, p.color || 0xb8645a));
    }
    if (p.tentacles) {
      const n = p.tentacles;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rr = p.r * (0.35 + 0.5 * Math.random());
        const len = H * (0.5 + Math.random() * 0.6);
        const tg = taperedTube([
          [Math.cos(a) * rr, H * 0.95, Math.sin(a) * rr],
          [Math.cos(a) * rr * 1.6, H * 0.95 + len * 0.5, Math.sin(a) * rr * 1.6],
          [Math.cos(a) * rr * 2.0, H * 0.95 + len, Math.sin(a) * rr * 2.0]
        ], p.r * 0.06, 0.004, 6, 4);
        parts.push(tag(tg, p.tentColor || p.color, p.tentEmissive || 0x000000, 0.3));
      }
    }
    if (p.branches) {
      for (let i = 0; i < p.branches; i++) {
        const a = (i / p.branches) * Math.PI * 2 + Math.random();
        const len = H * (0.6 + Math.random() * 0.6);
        const tg = taperedTube([
          [0, H * 0.2, 0],
          [Math.cos(a) * p.r * 0.8, H * 0.6, Math.sin(a) * p.r * 0.8],
          [Math.cos(a) * p.r * 1.5, H * 0.2 + len, Math.sin(a) * p.r * 1.5]
        ], p.r * 0.09, 0.006, 7, 5);
        parts.push(tag(tg, p.branchColor || p.color, p.branchEmissive || 0x000000, 0.2));
      }
    }
    const geo = merge(parts);
    geo.computeBoundingSphere();
    const mat = organicMat({
      roughness: 0.7, metalness: 0.02,
      transparent: !!p.transparent, opacity: p.opacity == null ? 1 : p.opacity,
      amp: 0.012, freq: 3, speed: 0.8, len: 1, axis: 'y',
      rim: 0.35, rimColor: p.rimColor || 0xffa090
    });
    return { geo, mat, size: H * 1.6, axis: 'y' };
  }

  // ---------------------------------------------------------------- 蠕虫 / 管虫 / 多毛类
  function wormGeo(p) {
    const parts = [];
    const L = p.len;
    if (p.tube) {
      const tube = loft((t) => ({ rx: p.r * (1 - t * 0.25), ry: p.r * (1 - t * 0.25) }), { length: L, segs: 10, radial: 8, capStart: true, capEnd: false });
      tube.rotateX(-Math.PI / 2);
      parts.push(tag(tube, p.tubeColor || 0xc0b49a, 0x241d10, 0.08));
    } else {
      const body = loft((t) => ({
        rx: p.r * (0.6 + 0.6 * Math.sin(Math.PI * t)),
        ry: p.r * (0.6 + 0.6 * Math.sin(Math.PI * t)),
        ox: Math.sin(t * 4) * p.r * 0.5
      }), { length: L, segs: 16, radial: 8 });
      body.rotateX(-Math.PI / 2);
      parts.push(tag(body, p.color || 0xc98a7a));
      for (let i = 0; i < 10; i++) {
        const t = 0.1 + i * 0.08;
        for (const s of [-1, 1]) {
          parts.push(tag(taperedTube([
            [Math.sin(t * 4) * p.r * 0.5 + s * p.r * 0.5, 0, t * L],
            [Math.sin(t * 4) * p.r * 0.5 + s * p.r * 1.1, -p.r * 0.4, t * L + p.r * 0.2]
          ], 0.008, 0.003, 3, 3), p.color || 0xc98a7a));
        }
      }
    }
    if (p.plume) {
      const n = p.plume;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const sp = p.r * (1.6 + (i % 3) * 0.5);
        parts.push(tag(taperedTube([
          [0, L - 0.02, 0],
          [Math.cos(a) * sp, L + p.plumeLen * 0.45, Math.sin(a) * sp],
          [Math.cos(a) * sp * 1.5, L + p.plumeLen, Math.sin(a) * sp * 1.5]
        ], p.r * 0.3, 0.004, 6, 4), p.plumeColor || 0xa82a33, p.plumeEmissive || 0x5a0a0c, 0.35));
      }
    }
    const geo = merge(parts);
    geo.computeBoundingSphere();
    const mat = organicMat({ roughness: 0.66, metalness: 0.02, amp: 0.01, freq: 3, speed: 0.7, len: 1, axis: 'y', rim: 0.3, rimColor: 0xff8a70 });
    return { geo, mat, size: L * 1.2, axis: 'y' };
  }

  // ---------------------------------------------------------------- 樽海鞘 / 栉水母
  function salpGeo(p) {
    const parts = [];
    const body = loft((t) => ({
      rx: p.r * Math.sin(Math.PI * (0.12 + t * 0.8)),
      ry: p.r * Math.sin(Math.PI * (0.12 + t * 0.8)) * (p.flat ? 0.6 : 1)
    }), { length: p.len, segs: 14, radial: 12 });
    parts.push(tag(body, p.color || 0xa8d8e0, p.emissive || 0x1a4048, 0.5));
    if (p.comb) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const g = new THREE.TorusGeometry(p.r * 0.55, 0.006, 3, 14, Math.PI * 0.8);
        g.rotateY(a);
        g.rotateX(Math.PI / 2);
        g.translate(0, p.r * 0.2, p.len * 0.45);
        parts.push(tag(g, 0xd8f6ff, 0x6fe0ff, 1.4));
      }
    }
    const geo = merge(parts);
    geo.computeBoundingSphere();
    const mat = organicMat({
      roughness: 0.2, metalness: 0.0, transparent: true, opacity: p.opacity == null ? 0.72 : p.opacity,
      side: THREE.DoubleSide, depthWrite: false, amp: 0.02, freq: 4, speed: 1.2, len: 1, axis: 'z',
      rim: 0.7, rimColor: 0xa8f0ff
    });
    return { geo, mat, size: p.len * 1.4, axis: 'z' };
  }

  A.__generic = {
    fish: fishGeo, jelly: jellyGeo, ceph: cephGeo, crust: crustGeo,
    star: starGeo, urchin: urchinGeo, polyp: polypGeo, worm: wormGeo, salp: salpGeo
  };
})();
