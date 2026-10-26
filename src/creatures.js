/* ABYSS — 生物：参数化有机建模 / 生态布点 / 运动 / 拾取代理 */
(function () {
  const A = window.ABYSS;
  const { clamp, lerp, smoothstep, mulberry32 } = A.util;
  const T = A.terrain;
  const W = A.WORLD;

  // ================================================================ 几何工具
  const V3 = THREE.Vector3;

  // 给几何体打上顶点色与自发光
  function tag(geo, color, emissive, emissiveIntensity) {
    const n = geo.attributes.position.count;
    const c = new Float32Array(n * 3);
    const e = new Float32Array(n * 3);
    const col = new THREE.Color(color);
    const em = new THREE.Color(emissive === undefined ? 0x000000 : emissive);
    const k = emissiveIntensity === undefined ? 1 : emissiveIntensity;
    for (let i = 0; i < n; i++) {
      c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b;
      e[i * 3] = em.r * k; e[i * 3 + 1] = em.g * k; e[i * 3 + 2] = em.b * k;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
    geo.setAttribute('aEmissive', new THREE.BufferAttribute(e, 3));
    if (!geo.attributes.uv) {
      geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
    }
    return geo;
  }

  // 合并几何体（position/normal/uv/color/aEmissive）
  function merge(geos) {
    let vCount = 0, iCount = 0;
    for (let i = 0; i < geos.length; i++) {
      const g = geos[i];
      vCount += g.attributes.position.count;
      iCount += g.index ? g.index.count : g.attributes.position.count;
    }
    const pos = new Float32Array(vCount * 3);
    const nor = new Float32Array(vCount * 3);
    const uv = new Float32Array(vCount * 2);
    const col = new Float32Array(vCount * 3);
    const emi = new Float32Array(vCount * 3);
    const idx = vCount > 65535 ? new Uint32Array(iCount) : new Uint16Array(iCount);
    let vo = 0, io = 0;
    for (let i = 0; i < geos.length; i++) {
      const g = geos[i];
      const p = g.attributes.position.array;
      const n = g.attributes.normal ? g.attributes.normal.array : null;
      const u = g.attributes.uv ? g.attributes.uv.array : null;
      const c = g.attributes.color ? g.attributes.color.array : null;
      const e = g.attributes.aEmissive ? g.attributes.aEmissive.array : null;
      pos.set(p, vo * 3);
      if (n) nor.set(n, vo * 3);
      if (u) uv.set(u, vo * 2);
      if (c) col.set(c, vo * 3);
      if (e) emi.set(e, vo * 3);
      const count = g.attributes.position.count;
      if (g.index) {
        const a = g.index.array;
        for (let k = 0; k < a.length; k++) idx[io + k] = a[k] + vo;
        io += a.length;
      } else {
        for (let k = 0; k < count; k++) idx[io + k] = vo + k;
        io += count;
      }
      vo += count;
    }
    const out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    out.setAttribute('color', new THREE.BufferAttribute(col, 3));
    out.setAttribute('aEmissive', new THREE.BufferAttribute(emi, 3));
    out.setIndex(new THREE.BufferAttribute(idx, 1));
    return out;
  }

  // Catmull-Rom 采样（控制点数组 [[t, v], ...]）
  function curveAt(pts, t) {
    let i = 0;
    while (i < pts.length - 2 && t > pts[i + 1][0]) i++;
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i];
    const p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const span = p2[0] - p1[0] || 1;
    const u = clamp((t - p1[0]) / span, 0, 1);
    const u2 = u * u, u3 = u2 * u;
    return 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u +
      (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 +
      (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3);
  }

  /**
   * 沿 +Z 放样。profile(t) -> {rx, ry, ox, oy}
   */
  function loft(profile, o) {
    o = o || {};
    const segs = o.segs || 26;
    const radial = o.radial || 12;
    const capStart = o.capStart !== false;
    const capEnd = o.capEnd !== false;
    const jitter = o.jitter || 0;
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const p = profile(t);
      const ox = p.ox || 0, oy = p.oy || 0;
      for (let j = 0; j < radial; j++) {
        const a = (j / radial) * Math.PI * 2;
        const jr = jitter ? 1 + (Math.sin(a * 3 + t * 11) * 0.5 + Math.sin(a * 5 - t * 7) * 0.5) * jitter : 1;
        pos.push(ox + Math.cos(a) * p.rx * jr, oy + Math.sin(a) * p.ry * jr, t * (o.length || 1));
        uv.push(j / radial, t);
      }
    }
    for (let i = 0; i < segs; i++) {
      for (let j = 0; j < radial; j++) {
        const a = i * radial + j;
        const b = i * radial + ((j + 1) % radial);
        const c = a + radial;
        const d = b + radial;
        idx.push(a, b, c, b, d, c);
      }
    }
    const geo = new THREE.BufferGeometry();
    if (capStart) {
      const base = pos.length / 3;
      const p0 = profile(0);
      pos.push(p0.ox || 0, p0.oy || 0, 0); uv.push(0.5, 0);
      for (let j = 0; j < radial; j++) idx.push(base, (j + 1) % radial, j);
    }
    if (capEnd) {
      const base = pos.length / 3;
      const p1 = profile(1);
      pos.push(p1.ox || 0, p1.oy || 0, o.length || 1); uv.push(0.5, 1);
      const off = segs * radial;
      for (let j = 0; j < radial; j++) idx.push(base, off + j, off + ((j + 1) % radial));
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }

  // 沿曲线的锥形管（附肢 / 触手 / 钓竿）
  function taperedTube(points, r0, r1, segs, radial) {
    segs = segs || 10; radial = radial || 5;
    // 去掉重复点，避免零长度曲线导致 Frenet 帧计算失败
    const uniq = [];
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (!p) continue;
      const last = uniq[uniq.length - 1];
      if (last && Math.abs(last[0] - p[0]) < 1e-6 && Math.abs(last[1] - p[1]) < 1e-6 && Math.abs(last[2] - p[2]) < 1e-6) continue;
      uniq.push(p);
    }
    if (uniq.length < 2) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0, 0, 0, 0], 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1], 2));
      g.computeVertexNormals();
      return g;
    }
    const curve = new THREE.CatmullRomCurve3(uniq.map((p) => new V3(p[0], p[1], p[2])));
    let frames;
    try { frames = curve.computeFrenetFrames(segs, false); }
    catch (err) {
      console.log('TUBE_FAIL ' + JSON.stringify(uniq) + ' n=' + uniq.length);
      const g0 = new THREE.BufferGeometry();
      g0.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0, 0, 0, 0], 3));
      g0.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1], 2));
      g0.computeVertexNormals();
      return g0;
    }
    const pos = [], uv = [], idx = [];
    const pt = new V3();
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      curve.getPointAt(t, pt);
      const N = frames.normals[i], B = frames.binormals[i];
      const r = lerp(r0, r1, t);
      for (let j = 0; j < radial; j++) {
        const a = (j / radial) * Math.PI * 2;
        const x = pt.x + (Math.cos(a) * N.x + Math.sin(a) * B.x) * r;
        const y = pt.y + (Math.cos(a) * N.y + Math.sin(a) * B.y) * r;
        const z = pt.z + (Math.cos(a) * N.z + Math.sin(a) * B.z) * r;
        pos.push(x, y, z);
        uv.push(j / radial, t);
      }
    }
    for (let i = 0; i < segs; i++) {
      for (let j = 0; j < radial; j++) {
        const a = i * radial + j, b = i * radial + ((j + 1) % radial);
        const c = a + radial, d = b + radial;
        idx.push(a, b, c, b, d, c);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }

  function ball(x, y, z, r, detail) {
    const g = new THREE.SphereGeometry(r, detail || 8, detail ? detail - 1 : 6);
    g.translate(x, y, z);
    return g;
  }

  function spike(x, y, z, r, h, dir) {
    const g = new THREE.ConeGeometry(r, h, 5, 1);
    g.translate(0, h / 2, 0);
    if (dir === 'down') g.rotateX(Math.PI);
    g.translate(x, y, z);
    return g;
  }

  // 平面形状挤出（鳍 / 尾扇 / 壳板）
  function fin(pts, thickness) {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: thickness || 0.02, bevelEnabled: false, curveSegments: 4 });
    g.translate(0, 0, -(thickness || 0.02) / 2);
    return g;
  }

  // ================================================================ 材质
  const organicMats = [];

  /**
   * 有机材质：顶点色 + 顶点自发光 + 边缘光 + 游动形变
   */
  function organicMat(o) {
    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: o.roughness != null ? o.roughness : 0.55,
      metalness: o.metalness != null ? o.metalness : 0.06,
      transparent: !!o.transparent,
      opacity: o.opacity != null ? o.opacity : 1,
      side: o.side || THREE.FrontSide,
      depthWrite: o.depthWrite !== false,
      emissive: 0xffffff,
      emissiveIntensity: 0,
      map: o.map || null
    });
    if (o.flatShading) mat.flatShading = true;

    const uniforms = {
      uTime: { value: 0 },
      uAmp: { value: o.amp || 0 },
      uFreq: { value: o.freq || 6 },
      uSpeed: { value: o.speed || 2.4 },
      uLen: { value: o.len || 1 },
      uAxis: { value: o.axis === 'y' ? 1 : 0 },
      uPhase: { value: Math.random() * 6.28 },
      uRim: { value: o.rim != null ? o.rim : 0.35 },
      uRimColor: { value: new THREE.Color(o.rimColor || 0x8fd8e8) },
      uEmissiveMul: { value: 1 }
    };
    mat.userData.u = uniforms;
    mat.userData.opts = o;
    mat.userData.flash = !!o.flash;
    organicMats.push(mat);

    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>
          attribute vec3 aEmissive;
          varying vec3 vEmissive;
          uniform float uTime; uniform float uAmp; uniform float uFreq; uniform float uSpeed;
          uniform float uLen; uniform float uAxis; uniform float uPhase;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vEmissive = aEmissive;
          float axisPos = mix(transformed.z, transformed.y, uAxis);
          float tt = clamp(abs(axisPos) / uLen, 0.0, 1.0);
          float wave = sin(tt * uFreq - uTime * uSpeed + uPhase);
          float bend = wave * uAmp * tt * tt;
          if (uAxis < 0.5) { transformed.x += bend; transformed.y += bend * 0.12; }
          else { transformed.x += bend; transformed.z += bend * 0.18; }`);
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          varying vec3 vEmissive;
          uniform float uRim; uniform vec3 uRimColor; uniform float uEmissiveMul;`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
          float fres = 1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
          totalEmissiveRadiance += uRimColor * pow(fres, 3.0) * uRim;
          totalEmissiveRadiance += vEmissive * uEmissiveMul;`);
    };
    return mat;
  }

  // ================================================================ 物种建模
  const B = {};

  // ---- 01 蝰鱼 -------------------------------------------------------
  B.viperfish = function () {
    const L = 2.2;
    const parts = [];
    const prof = (t) => ({
      rx: curveAt([[0, 0.012], [0.05, 0.085], [0.12, 0.135], [0.22, 0.150], [0.34, 0.140], [0.55, 0.105], [0.75, 0.062], [0.92, 0.028], [1, 0.010]], t),
      ry: curveAt([[0, 0.02], [0.05, 0.115], [0.12, 0.205], [0.22, 0.225], [0.34, 0.212], [0.55, 0.160], [0.75, 0.098], [0.92, 0.048], [1, 0.014]], t)
    });
    const body = loft(prof, { length: L, segs: 30, radial: 14 });
    // 背部略隆起、腹部略平
    parts.push(tag(body, 0x56656f, 0x000000));

    // 下颌（向前下方伸出）
    const jaw = taperedTube([[0, -0.05, 0.16], [0, -0.14, 0.02], [0, -0.21, -0.18], [0, -0.24, -0.36]], 0.055, 0.016, 8, 6);
    parts.push(tag(jaw, 0x52616b));

    // 獠牙
    for (let i = 0; i < 7; i++) {
      const z = 0.05 - i * 0.055;
      const len = 0.20 - i * 0.012;
      for (const s of [-1, 1]) {
        const g = new THREE.ConeGeometry(0.009, len, 4);
        g.rotateX(Math.PI * 0.92);
        g.rotateZ(s * 0.12);
        g.translate(s * 0.062, -0.055 - len * 0.42, z);
        parts.push(tag(g, 0xded6bf, 0x2a2418, 0.25));
      }
    }
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const z = 0.05 - t * 0.32;
      const y = -0.20 - t * 0.03;
      for (const s of [-1, 1]) {
        const g = new THREE.ConeGeometry(0.008, 0.13 - t * 0.03, 4);
        g.rotateZ(s * 0.16);
        g.translate(s * 0.045, y, z);
        parts.push(tag(g, 0xded6bf, 0x2a2418, 0.25));
      }
    }

    // 背鳍长丝 + 发光末端
    const ray = taperedTube([[0, 0.19, 0.30], [0, 0.42, 0.18], [0, 0.56, -0.10], [0, 0.54, -0.42], [0, 0.46, -0.60]], 0.014, 0.006, 12, 5);
    parts.push(tag(ray, 0x3a4a56));
    parts.push(tag(ball(0, 0.45, -0.62, 0.062, 8), 0xb8f8ff, 0x7ff0ff, 3.6));

    // 背鳍 / 臀鳍 / 胸鳍
    const dorsal = fin([[0, 0], [-0.10, 0.10], [-0.30, 0.16], [-0.46, 0.06], [-0.40, -0.02], [-0.16, -0.02]], 0.012);
    dorsal.rotateY(Math.PI / 2);
    dorsal.translate(0, 0.13, 0.78);
    parts.push(tag(dorsal, 0x243039, 0x123038, 0.3));

    const anal = fin([[0, 0], [-0.12, -0.06], [-0.32, -0.10], [-0.40, -0.02], [-0.20, 0.01]], 0.012);
    anal.rotateY(Math.PI / 2);
    anal.translate(0, -0.11, 0.95);
    parts.push(tag(anal, 0x243039, 0x123038, 0.3));

    for (const s of [-1, 1]) {
      const pec = fin([[0, 0], [-0.14, 0.06], [-0.24, 0.02], [-0.16, -0.05]], 0.010);
      pec.rotateY(s * 1.1);
      pec.translate(s * 0.10, -0.06, 0.55);
      parts.push(tag(pec, 0x243039, 0x123038, 0.3));
    }

    // 尾鳍（分叉）
    const tail = fin([[0, 0], [-0.26, 0.30], [-0.40, 0.34], [-0.30, 0.10], [-0.30, -0.10], [-0.40, -0.34], [-0.26, -0.30]], 0.014);
    tail.rotateY(Math.PI / 2);
    tail.translate(0, 0, L - 0.02);
    parts.push(tag(tail, 0x1f2b33, 0x103038, 0.35));

    // 腹侧发光器列
    for (let i = 0; i < 26; i++) {
      const t = 0.16 + (i / 25) * 0.80;
      const p = prof(t);
      const y = -p.ry * 0.92;
      parts.push(tag(ball(0, y, t * L, 0.028, 6), 0xcaf8ff, 0x7ff0ff, 4.2));
      if (i % 2 === 0) {
        parts.push(tag(ball(p.rx * 0.86, y * 0.55, t * L, 0.018, 5), 0xcaf8ff, 0x7ff0ff, 3.4));
        parts.push(tag(ball(-p.rx * 0.86, y * 0.55, t * L, 0.018, 5), 0xcaf8ff, 0x7ff0ff, 3.4));
      }
    }

    const geo = merge(parts);
    geo.computeBoundingSphere();
    return {
      geo,
      mat: organicMat({ roughness: 0.40, metalness: 0.08, amp: 0.075, freq: 5.2, speed: 2.6, len: L, rim: 0.38, rimColor: 0x9fd8ee }),
      size: 2.4,
      axis: 'z'
    };
  };

  // ---- 02 幽灵蛸 -----------------------------------------------------
  B.vampire = function () {
    const parts = [];
    // 外套膜（沿 +Z，随后旋转为向上）
    const mantle = loft((t) => ({
      rx: curveAt([[0, 0.16], [0.15, 0.27], [0.45, 0.29], [0.75, 0.22], [0.92, 0.10], [1, 0.03]], t),
      ry: curveAt([[0, 0.18], [0.15, 0.30], [0.45, 0.31], [0.75, 0.23], [0.92, 0.11], [1, 0.03]], t)
    }), { length: 0.78, segs: 20, radial: 14 });
    parts.push(tag(mantle, 0x2a0c16));

    // 头部
    const head = ball(0, 0, 0.03, 0.24, 12);
    head.scale(1, 0.92, 0.78);
    parts.push(tag(head, 0x320f1d));

    // 眼睛
    for (const s of [-1, 1]) {
      const eye = ball(s * 0.175, 0.05, 0.10, 0.088, 10);
      eye.scale(0.8, 1, 0.9);
      parts.push(tag(eye, 0x07070a, 0x1a2a33, 0.15));
    }

    // 腕蹼（伞裙，边缘八瓣）
    const webRings = 12, webRadial = 32;
    const wpos = [], wuv = [], widx = [];
    for (let i = 0; i <= webRings; i++) {
      const t = i / webRings;
      for (let j = 0; j < webRadial; j++) {
        const a = (j / webRadial) * Math.PI * 2;
        const lobe = 1 + 0.10 * Math.cos(a * 8);
        const r = lerp(0.22, 0.60 * lobe, Math.pow(t, 0.85));
        const zz = -t * (0.86 + 0.16 * Math.cos(a * 8 + 0.6));
        wpos.push(Math.cos(a) * r, Math.sin(a) * r * 0.92, zz);
        wuv.push(j / webRadial, t);
      }
    }
    for (let i = 0; i < webRings; i++) {
      for (let j = 0; j < webRadial; j++) {
        const a = i * webRadial + j, b = i * webRadial + ((j + 1) % webRadial);
        const c = a + webRadial, d = b + webRadial;
        widx.push(a, b, c, b, d, c);
      }
    }
    const webGeo = new THREE.BufferGeometry();
    webGeo.setAttribute('position', new THREE.Float32BufferAttribute(wpos, 3));
    webGeo.setAttribute('uv', new THREE.Float32BufferAttribute(wuv, 2));
    webGeo.setIndex(widx);
    webGeo.computeVertexNormals();
    parts.push(tag(webGeo, 0x3a1019, 0x1a0206, 0.35));

    // 8 条腕
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.2;
      const r = 0.30;
      const p0 = [Math.cos(a) * r * 0.8, Math.sin(a) * r * 0.8, -0.05];
      const p1 = [Math.cos(a) * r * 1.55, Math.sin(a) * r * 1.55, -0.42];
      const p2 = [Math.cos(a) * r * 1.9, Math.sin(a) * r * 1.9, -0.82];
      const arm = taperedTube([p0, p1, p2], 0.055, 0.012, 8, 5);
      parts.push(tag(arm, 0x400f1e));
      parts.push(tag(ball(p2[0], p2[1], p2[2], 0.020, 5), 0xc8f6ff, 0x7fe6ff, 2.6));
    }

    // 外套膜末端发光器
    parts.push(tag(ball(0, 0, 0.80, 0.028, 6), 0xc8f6ff, 0x7fe6ff, 2.4));

    const geo = merge(parts);
    geo.rotateX(-Math.PI / 2); // +Z → +Y
    geo.computeBoundingSphere();
    return {
      geo,
      mat: organicMat({ roughness: 0.66, metalness: 0.02, amp: 0.05, freq: 4.0, speed: 1.5, len: 1.0, axis: 'y', rim: 0.26, rimColor: 0xa05060 }),
      size: 1.9,
      axis: 'y'
    };
  };

  // ---- 03 警灯水母 ---------------------------------------------------
  B.atolla = function () {
    const parts = [];
    const R = 0.52, H = 0.60;
    // 伞盖
    const bell = loft((t) => {
      const k = 1 - t;
      const r = R * Math.sqrt(Math.max(0, 1 - k * k * 0.92));
      const groove = 1 - 0.10 * Math.exp(-Math.pow((t - 0.86) / 0.07, 2));
      return { rx: Math.max(0.02, r * groove), ry: Math.max(0.02, r * groove) };
    }, { length: H, segs: 22, radial: 26, capStart: true, capEnd: false });
    bell.rotateX(-Math.PI / 2);
    bell.translate(0, 0.62, 0);
    parts.push(tag(bell, 0x6d1f24, 0x2a0508, 0.55));

    // 缘触手 20 条
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const r = R * 0.94;
      const p0 = [Math.cos(a) * r, 0.06, Math.sin(a) * r];
      const p1 = [Math.cos(a) * (r + 0.04), -0.45, Math.sin(a) * (r + 0.04)];
      const p2 = [Math.cos(a) * (r + 0.12), -0.95, Math.sin(a) * (r + 0.12)];
      const tg = taperedTube([p0, p1, p2], 0.012, 0.004, 8, 4);
      parts.push(tag(tg, 0x8a3038, 0x3a0a10, 0.5));
    }
    // 单条拖曳触手
    const trail = taperedTube([
      [0.05, 0.02, 0.08], [0.12, -1.1, 0.14], [0.05, -2.3, 0.05], [-0.10, -3.4, -0.06]
    ], 0.020, 0.005, 16, 5);
    parts.push(tag(trail, 0x7a2a32, 0x30080c, 0.4));

    // 蓝色闪光环
    const ring = new THREE.TorusGeometry(R * 0.93, 0.022, 6, 40);
    ring.rotateX(Math.PI / 2);
    ring.translate(0, 0.10, 0);
    parts.push(tag(ring, 0x0a1c22, 0x5fe6ff, 0.0));

    const geo = merge(parts);
    geo.computeBoundingSphere();
    const mat = organicMat({
      roughness: 0.38, metalness: 0.0, transparent: true, opacity: 0.58,
      side: THREE.DoubleSide, depthWrite: false,
      amp: 0.045, freq: 7.0, speed: 1.9, len: 1.0, axis: 'y', rim: 0.45, rimColor: 0xff8a7a,
      flash: true
    });
    return { geo, mat, size: 2.6, axis: 'y', flash: true };
  };

  // ---- 04 黑角鮟鱇 ---------------------------------------------------
  B.anglerfish = function () {
    const parts = [];
    const L = 1.0;
    const prof = (t) => ({
      rx: curveAt([[0, 0.10], [0.10, 0.26], [0.28, 0.36], [0.52, 0.37], [0.74, 0.28], [0.90, 0.15], [1, 0.05]], t),
      ry: curveAt([[0, 0.10], [0.10, 0.28], [0.28, 0.39], [0.52, 0.38], [0.74, 0.29], [0.90, 0.16], [1, 0.05]], t)
    });
    const body = loft(prof, { length: L, segs: 26, radial: 16 });
    parts.push(tag(body, 0x241a15, 0x000000));

    // 口腔（内壁）
    const mouth = ball(0, -0.09, 0.14, 0.21, 12);
    mouth.scale(1.0, 0.62, 0.95);
    parts.push(tag(mouth, 0x170506));

    // 下颌
    const jaw = loft((t) => ({
      rx: curveAt([[0, 0.30], [0.5, 0.27], [1, 0.16]], t),
      ry: curveAt([[0, 0.13], [0.5, 0.11], [1, 0.06]], t),
      oy: -0.02 - t * 0.16
    }), { length: 0.52, segs: 10, radial: 12 });
    jaw.rotateX(-0.42);
    jaw.translate(0, -0.16, 0.02);
    parts.push(tag(jaw, 0x1a1310));

    // 齿
    for (let i = 0; i < 7; i++) {
      const a = -0.9 + (i / 6) * 1.8;
      for (const s of [-1, 1]) {
        const g = new THREE.ConeGeometry(0.012, 0.10, 4);
        g.rotateZ(s * 0.35);
        g.translate(s * 0.20 * Math.cos(a), 0.02, 0.06 + Math.sin(a) * 0.22);
        parts.push(tag(g, 0xd8cfb4, 0x201a10, 0.2));
      }
    }
    for (let i = 0; i < 6; i++) {
      const a = -0.8 + (i / 5) * 1.6;
      const g = new THREE.ConeGeometry(0.011, 0.09, 4);
      g.rotateX(Math.PI);
      g.translate(Math.cos(a) * 0.19, -0.20, 0.10 + Math.sin(a) * 0.20);
      parts.push(tag(g, 0xd8cfb4, 0x201a10, 0.2));
    }

    // 钓竿 + esca
    const rod = taperedTube([[0, 0.33, 0.22], [0.02, 0.52, 0.06], [0.04, 0.58, -0.16], [0.02, 0.52, -0.30]], 0.016, 0.008, 10, 5);
    parts.push(tag(rod, 0x241a16));
    parts.push(tag(ball(0.02, 0.50, -0.33, 0.085, 10), 0xffe6b0, 0xffc257, 3.4));

    // 眼
    for (const s of [-1, 1]) {
      parts.push(tag(ball(s * 0.155, 0.20, 0.26, 0.045, 8), 0x05060a, 0x223040, 0.2));
    }

    // 鳍
    const tail = fin([[0, 0], [-0.16, 0.20], [-0.28, 0.22], [-0.22, 0.02], [-0.28, -0.18], [-0.14, -0.18]], 0.012);
    tail.rotateY(Math.PI / 2);
    tail.translate(0, 0, L - 0.02);
    parts.push(tag(tail, 0x1a1412, 0x0d2026, 0.3));
    for (const s of [-1, 1]) {
      const pec = fin([[0, 0], [-0.10, 0.08], [-0.18, 0.04], [-0.12, -0.04]], 0.010);
      pec.rotateY(s * 1.2);
      pec.translate(s * 0.22, -0.05, 0.50);
      parts.push(tag(pec, 0x1a1412, 0x0d2026, 0.3));
    }

    const geo = merge(parts);
    geo.computeBoundingSphere();
    return {
      geo,
      mat: organicMat({ roughness: 0.62, metalness: 0.02, amp: 0.035, freq: 4.5, speed: 1.6, len: L, rim: 0.16, rimColor: 0xffb070 }),
      size: 1.4,
      axis: 'z',
      light: { color: 0xffc257, intensity: 0.9, distance: 14, offset: [0, 0.50, -0.33] }
    };
  };

  // ---- 05 帝王等足虫 -------------------------------------------------
  B.isopod = function () {
    const parts = [];
    const L = 1.15;
    // 7 节背板
    const segs = 7;
    for (let s = 0; s < segs; s++) {
      const t0 = s / segs, t1 = (s + 1) / segs;
      const w = 0.30 + 0.10 * Math.sin(Math.PI * (t0 * 0.8 + 0.12));
      const g = loft((t) => {
        const k = 1 + 0.05 * t;
        return {
          rx: w * k * (0.95 + 0.05 * Math.sin(Math.PI * t)),
          ry: (0.105 + 0.02 * Math.sin(Math.PI * (s / segs))) * k
        };
      }, { length: (t1 - t0) * L * 0.98, segs: 5, radial: 14 });
      g.translate(0, 0, t0 * L + 0.10);
      parts.push(tag(g, s % 2 ? 0xa2937c : 0x988a74));
    }
    // 头甲
    const head = loft((t) => ({
      rx: 0.26 * (0.55 + 0.55 * Math.sin(Math.PI * (0.25 + t * 0.75))),
      ry: 0.10 * (0.7 + 0.5 * t)
    }), { length: 0.18, segs: 6, radial: 14 });
    head.translate(0, 0, -0.08);
    parts.push(tag(head, 0x92846f));

    // 复眼
    for (const s of [-1, 1]) {
      parts.push(tag(ball(s * 0.19, 0.05, -0.02, 0.055, 8), 0x14161a, 0x1d3440, 0.2));
    }
    // 触角
    for (const s of [-1, 1]) {
      const a1 = taperedTube([[s * 0.13, 0.02, -0.10], [s * 0.24, 0.00, -0.30], [s * 0.30, -0.06, -0.52]], 0.022, 0.006, 8, 5);
      parts.push(tag(a1, 0x9c8d76));
      const a2 = taperedTube([[s * 0.08, -0.03, -0.12], [s * 0.14, -0.08, -0.34], [s * 0.16, -0.12, -0.50]], 0.014, 0.004, 7, 4);
      parts.push(tag(a2, 0x9c8d76));
    }
    // 胸足 7 对
    for (let i = 0; i < 7; i++) {
      const z = 0.14 + i * 0.145;
      for (const s of [-1, 1]) {
        const leg = taperedTube([
          [s * 0.24, -0.06, z], [s * 0.34, -0.14, z + 0.03], [s * 0.40, -0.20, z + 0.09]
        ], 0.024, 0.008, 6, 5);
        parts.push(tag(leg, 0x8f8069));
      }
    }
    // 尾扇
    for (let i = 0; i < 5; i++) {
      const a = -0.55 + (i / 4) * 1.1;
      const blade = fin([[0, 0], [0.16, 0.10], [0.30, 0.06], [0.26, 0], [0.30, -0.06], [0.16, -0.10]], 0.012);
      blade.rotateZ(a * 0.5);
      blade.rotateY(Math.PI / 2);
      blade.translate(Math.sin(a) * 0.10, 0, L + 0.06);
      parts.push(tag(blade, 0xa89880));
    }

    const geo = merge(parts);
    geo.computeBoundingSphere();
    return {
      geo,
      mat: organicMat({ roughness: 0.58, metalness: 0.06, amp: 0.0, rim: 0.16, rimColor: 0xd8c9a8 }),
      size: 1.35,
      axis: 'z'
    };
  };

  // ---- 06 海猪 -------------------------------------------------------
  B.seapig = function () {
    const parts = [];
    const L = 0.78;
    const body = loft((t) => ({
      rx: curveAt([[0, 0.05], [0.12, 0.17], [0.35, 0.22], [0.65, 0.21], [0.88, 0.14], [1, 0.05]], t),
      ry: curveAt([[0, 0.04], [0.12, 0.14], [0.35, 0.19], [0.65, 0.18], [0.88, 0.12], [1, 0.04]], t),
      oy: Math.sin(t * Math.PI) * 0.02
    }), { length: L, segs: 22, radial: 14 });
    parts.push(tag(body, 0xe8b9c2, 0x2a1014, 0.25));

    // 管足（成对）
    for (let i = 0; i < 6; i++) {
      const t = 0.12 + i * 0.14;
      for (const s of [-1, 1]) {
        const leg = taperedTube([
          [s * 0.14, -0.10, t * L], [s * 0.20, -0.20, t * L + 0.02], [s * 0.18, -0.30, t * L + 0.05]
        ], 0.020, 0.008, 5, 4);
        parts.push(tag(leg, 0xf0cdd4, 0x30141a, 0.2));
      }
    }
    // 背瘤突
    for (let i = 0; i < 5; i++) {
      const t = 0.18 + i * 0.16;
      for (const s of [-1, 1]) {
        const g = new THREE.ConeGeometry(0.014, 0.14, 4);
        g.rotateZ(s * 0.25);
        g.translate(s * 0.06, 0.15, t * L);
        parts.push(tag(g, 0xf3d6dc, 0x2a1014, 0.2));
      }
    }

    const geo = merge(parts);
    geo.computeBoundingSphere();
    return {
      geo,
      mat: organicMat({
        roughness: 0.42, metalness: 0.0, transparent: true, opacity: 0.88,
        amp: 0.02, freq: 3.0, speed: 0.8, len: L, rim: 0.55, rimColor: 0xffd0d8
      }),
      size: 1.0,
      axis: 'z'
    };
  };

  // ---- 07 偕老同穴 ---------------------------------------------------
  B.sponge = function () {
    const parts = [];
    const H = 1.25;
    const tube = loft((t) => ({
      rx: curveAt([[0, 0.10], [0.08, 0.19], [0.30, 0.25], [0.62, 0.27], [0.90, 0.25], [1, 0.24]], t),
      ry: curveAt([[0, 0.10], [0.08, 0.19], [0.30, 0.25], [0.62, 0.27], [0.90, 0.25], [1, 0.24]], t)
    }), { length: H, segs: 16, radial: 22, capStart: true, capEnd: false });
    parts.push(tag(tube, 0xd2e6ec, 0x2c4a52, 0.10));

    // 网格骨针：纵条 + 环箍
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const pts = [];
      for (let k = 0; k <= 4; k++) {
        const t = 0.10 + (k / 4) * 0.86;
        const r = 0.26 * (0.82 + 0.2 * Math.sin(t * Math.PI));
        pts.push([Math.cos(a) * r, t * H, Math.sin(a) * r]);
      }
      parts.push(tag(taperedTube(pts, 0.010, 0.010, 6, 3), 0xdceef2, 0x4a7c88, 0.12));
    }
    for (let k = 0; k < 9; k++) {
      const t = 0.12 + (k / 8) * 0.84;
      const r = 0.26 * (0.82 + 0.2 * Math.sin(t * Math.PI));
      const ring = new THREE.TorusGeometry(r, 0.0085, 4, 22);
      ring.rotateX(Math.PI / 2);
      ring.translate(0, t * H, 0);
      parts.push(tag(ring, 0xdceef2, 0x4a7c88, 0.12));
    }
    // 基部根须
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const pts = [[0, 0.12, 0], [Math.cos(a) * 0.16, -0.06, Math.sin(a) * 0.16], [Math.cos(a) * 0.30, -0.26, Math.sin(a) * 0.30]];
      parts.push(tag(taperedTube(pts, 0.012, 0.004, 6, 4), 0xcfe4ea, 0x2c4a52, 0.3));
    }

    const geo = merge(parts);
    geo.computeBoundingSphere();
    return {
      geo,
      mat: organicMat({
        roughness: 0.22, metalness: 0.05, transparent: true, opacity: 0.72,
        side: THREE.DoubleSide, depthWrite: false,
        amp: 0.0, rim: 0.45, rimColor: 0xa8e8f4
      }),
      size: 1.6,
      axis: 'y'
    };
  };

  // ---- 08 冷泉管虫 ---------------------------------------------------
  B.tubeworm = function () {
    const parts = [];
    const H = 2.1;
    const tube = loft((t) => {
      const r = lerp(0.062, 0.044, t);
      return { rx: r, ry: r, ox: Math.sin(t * 2.4) * 0.05, oy: 0 };
    }, { length: H, segs: 14, radial: 8, capStart: true, capEnd: false });
    tube.rotateX(-Math.PI / 2);
    parts.push(tag(tube, 0xc0b49a, 0x241d10, 0.08));

    // 羽鳃
    for (let i = 0; i < 15; i++) {
      const a = (i / 15) * Math.PI * 2;
      const spread = 0.10 + (i % 3) * 0.035;
      const pts = [
        [Math.sin(2.4) * 0.05, H - 0.02, 0],
        [Math.cos(a) * spread, H + 0.22, Math.sin(a) * spread],
        [Math.cos(a) * spread * 2.1, H + 0.46, Math.sin(a) * spread * 2.1],
        [Math.cos(a) * spread * 2.8, H + 0.62, Math.sin(a) * spread * 2.8]
      ];
      parts.push(tag(taperedTube(pts, 0.017, 0.005, 7, 4), 0xa82a33, 0x5a0a0c, 0.35));
    }

    const geo = merge(parts);
    geo.computeBoundingSphere();
    return {
      geo,
      mat: organicMat({ roughness: 0.66, metalness: 0.02, amp: 0.0, rim: 0.3, rimColor: 0xff8a70 }),
      size: 2.3,
      axis: 'y'
    };
  };

  // ---- 09 冷泉贻贝 ---------------------------------------------------
  B.mussel = function () {
    const parts = [];
    const L = 0.26;
    const shell = loft((t) => ({
      rx: curveAt([[0, 0.02], [0.2, 0.07], [0.5, 0.085], [0.8, 0.07], [1, 0.02]], t),
      ry: curveAt([[0, 0.03], [0.2, 0.10], [0.5, 0.115], [0.8, 0.09], [1, 0.03]], t),
      oy: -t * 0.03
    }), { length: L, segs: 10, radial: 10 });
    parts.push(tag(shell, 0x2a2723));
    // 壳顶
    parts.push(tag(ball(0, 0.03, 0.01, 0.035, 6), 0x3a352d));
    // 生长纹
    for (let i = 0; i < 4; i++) {
      const t = 0.22 + i * 0.19;
      const ring = new THREE.TorusGeometry(0.075 + i * 0.004, 0.004, 3, 12);
      ring.rotateX(Math.PI / 2);
      ring.scale(0.9, 1, 1.25);
      ring.translate(0, -0.01, t * L);
      parts.push(tag(ring, 0x1a1815));
    }
    const geo = merge(parts);
    geo.computeBoundingSphere();
    return {
      geo,
      mat: organicMat({ roughness: 0.44, metalness: 0.12, amp: 0.0, rim: 0.4, rimColor: 0x9ab8c8 }),
      size: 0.34,
      axis: 'z'
    };
  };

  // ================================================================ 布点
  // [x0, x1, z0, z1]
  const PLAN = {
    'chauliodus-sloani': { count: 14, mode: 'swim', depth: [350, 680], region: [-270, 30, -250, 250], clearance: 22, scale: [0.9, 1.25], welcome: [[-86, 103, 650], [-98, 119, 649]] },
    'vampyroteuthis-infernalis': { count: 6, mode: 'drift', depth: [640, 880], region: [-30, 220, -220, 220], clearance: 30, scale: [0.95, 1.3] },
    'atolla-wyvillei': { count: 8, mode: 'drift', depth: [700, 1000], region: [40, 300, -240, 240], clearance: 25, scale: [0.9, 1.35] },
    'melanocetus-johnsonii': { count: 6, mode: 'hover', depth: [760, 900], region: [-60, 110, -200, 200], clearance: 9, maxSlope: 0.5, scale: [0.95, 1.15] },
    'bathynomus-giganteus': { count: 15, mode: 'crawl', depth: [735, 870], region: [-70, 120, -220, 220], maxSlope: 0.38, scale: [0.8, 1.2], welcome: [[-48, 100], [-58, 116], [-40, 124]] },
    'scotoplanes-globosa': { count: 12, mode: 'crawl', depth: [940, 1075], region: [110, 290, -200, 220], maxSlope: 0.34, scale: [0.85, 1.2] },
    'euplectella-aspergillum': { count: 16, mode: 'sessile', depth: [380, 620], region: [-300, -110, -240, 240], minSlope: 0.52, scale: [0.75, 1.25] },
    'lamellibrachia-luymesi': { count: 0, mode: 'sessile', seep: 26, seepRing: 'inner', scale: [0.7, 1.15] },
    'bathymodiolus-childressi': { count: 0, mode: 'sessile', seep: 26, seepRing: 'outer', scale: [0.8, 1.2] }
  };

  // ================================================================ 运行时
  const Creatures = {
    list: [],
    proxies: [],
    geoms: {},
    mats: {},
    _byId: {},
    _hovered: null,

    init(scene) {
      this.scene = scene;
      const rnd = mulberry32(424242);
      const keys = ['viperfish', 'vampire', 'atolla', 'anglerfish', 'isopod', 'seapig', 'sponge', 'tubeworm', 'mussel'];
      keys.forEach((k) => {
        const b = B[k]();
        this.geoms[k] = b;
      });

      A.SPECIES.forEach((sp) => {
        const cfg = PLAN[sp.id];
        if (!cfg) return;
        let built = this.geoms[sp.model.key];
        // 第二批物种：通用参数化构建器
        const preset = A.__presets && A.__presets[sp.id];
        if (preset && A.__generic && A.__generic[preset.b]) {
          built = A.__generic[preset.b](preset.p);
        }
        // Blender 自建 / 外部 GLB 模型优先于程序化回退：
        // 只有 GLB 加载失败时才继续用程序化模型，保证物种不会消失。
        if (A.Models && A.Models.has(sp.id) && A.Models.cache[sp.id]) {
          built = {
            glb: true,
            size: sp.model.size || 1.4,
            axis: 'z',
            // axis:'y' 表示该物种的姿态基准是「底点贴地」（底栖 / 固着 / 爬行），
            // 不是「身体沿 Y 轴」。GLB 都是 Y-up 导出，朝向无需再转。
            ground: sp.model.axis === 'y'
          };
        } else if (!built && A.Models && A.Models.has(sp.id)) {
          return; // 注册了 GLB 但加载失败、且没有程序化回退
        }
        if (!built) return;
        // 冷泉群落（管虫 / 贻贝）走成片布点。
        // 判据必须是「配置里有 seep 密度」，不能再看 model.key ——
        // 41 个物种统一改走 GLB 后 key 全是 'glb'，用 key 判断会让
        // 这两个物种 count:0 落到 spawnScattered，最终一个个都不生成。
        if (cfg.seep) {
          this.spawnSeep(sp, cfg, built, rnd);
        } else {
          this.spawnScattered(sp, cfg, built, rnd);
        }
      });
    },

    _makeMesh(sp, built, scale) {
      if (built.glb) {
        const inst = A.Models.instance(sp.id, scale);
        if (inst) return inst;
        // GLB 实例化失败（纹理/材质异常）→ 返回 null，由调用方跳过该个体，
        // 不能继续走程序化分支（built.geo 此时不存在）
        return null;
      }
      const mat = organicMat(built.mat.userData.opts);
      mat.userData.u.uPhase.value = Math.random() * 6.283;
      const mesh = new THREE.Mesh(built.geo, mat);
      mesh.scale.setScalar(scale);
      mesh.frustumCulled = true;
      mesh.userData.speciesId = sp.id;
      return mesh;
    },

    _makeProxy(sp, built, scale, mesh) {
      // 拾取代理：一个包住模型的不可见球。
      // 关键点——球心必须放在**模型实际的包围盒中心**，不能放在 group 原点：
      // 顶部锚定的水母（伞在原点、口腕向下拖）、底部锚定的固着类
      // （身体全部在原点上方）都会让模型中心偏离 group 原点，
      // 相机对准生物却打不中代理，表现为「看得见但点不到」。
      let r, cx = 0, cy = 0, cz = 0;
      if (mesh) {
        // mesh 尚未入组，matrixWorld 就是它的局部变换，正好等于「group 局部坐标」
        mesh.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(mesh);
        const size = box.getSize(new THREE.Vector3());
        const c = box.getCenter(new THREE.Vector3());
        // mesh 此时已加入 group 且 group 在原点，故 c 即 group 局部坐标
        cx = c.x; cy = c.y; cz = c.z;
        r = Math.max(0.28, Math.max(size.x, size.y, size.z) * 0.5 * 0.92);
      } else {
        r = built.glb
          ? Math.max(0.35, built.size * scale * 0.55)
          : Math.max(0.35, built.geo.boundingSphere.radius * scale * 1.05);
      }
      const geo = new THREE.SphereGeometry(r, 8, 6);
      const mat = new THREE.MeshBasicMaterial({ visible: false });
      const m = new THREE.Mesh(geo, mat);
      m.visible = false;
      m.position.set(cx, cy, cz);
      m.userData.speciesId = sp.id;
      m.userData.radius = r;
      return m;
    },

    spawnScattered(sp, cfg, built, rnd) {
      const group = new THREE.Group();
      group.name = sp.id;
      this.scene.add(group);
      let placed = 0, guard = 0;
      const positions = [];
      while (placed < cfg.count && guard < 6000) {
        guard++;
        const isWelcome = !!(cfg.welcome && placed < cfg.welcome.length);
        const x = isWelcome ? cfg.welcome[placed][0] : lerp(cfg.region[0], cfg.region[1], rnd());
        const z = isWelcome ? cfg.welcome[placed][1] : lerp(cfg.region[2], cfg.region[3], rnd());
        const ground = T.depth(x, z);
        const slope = T.slope(x, z);
        if (!isWelcome) {
          if (cfg.maxSlope != null && slope > cfg.maxSlope) continue;
          if (cfg.minSlope != null && slope < cfg.minSlope) continue;
        }
        let depth;
        if (cfg.mode === 'sessile' || cfg.mode === 'crawl') {
          if (!isWelcome && (ground < cfg.depth[0] || ground > cfg.depth[1])) continue;
          depth = ground;
        } else {
          depth = (isWelcome && cfg.welcome[placed][2] != null)
            ? cfg.welcome[placed][2]
            : lerp(cfg.depth[0], cfg.depth[1], rnd());
          if (depth > ground - (cfg.clearance || 10)) continue;
        }
        if (!isWelcome && Math.hypot(x - W.start.x, z - W.start.z) < 48) continue;
        // 个体间距
        let tooClose = false;
        for (let i = 0; i < positions.length; i++) {
          const p = positions[i];
          if (Math.hypot(p[0] - x, p[1] - z) < 6.5) { tooClose = true; break; }
        }
        if (tooClose) continue;

        const scale = lerp(cfg.scale[0], cfg.scale[1], rnd());
        const mesh = this._makeMesh(sp, built, scale);
        if (!mesh) continue;
        const proxy = this._makeProxy(sp, built, scale, mesh);
        const agent = {
          speciesId: sp.id,
          mode: cfg.mode,
          group: new THREE.Group(),
          mesh, proxy,
          home: new THREE.Vector3(x, -depth, z),
          phase: rnd() * Math.PI * 2,
          w: 0.06 + rnd() * 0.09,
          rx: isWelcome ? 1.5 + rnd() * 3 : 12 + rnd() * 26,
          rz: isWelcome ? 1.2 + rnd() * 2.5 : 10 + rnd() * 22,
          bob: 1.4 + rnd() * 3.2,
          speed: 0.35 + rnd() * 0.5,
          heading: rnd() * Math.PI * 2,
          yawOffset: isWelcome ? 1.15 : 0,
          yaw: rnd() * Math.PI * 2,
          scale,
          size: built.size * scale,
          t0: rnd() * 10
        };
        agent.group.add(mesh);
        agent.group.add(proxy);
        agent.group.position.copy(agent.home);
        group.add(agent.group);
        this.proxies.push(proxy);
        this.list.push(agent);
        positions.push([x, z]);
        placed++;
      }
    },

    spawnSeep(sp, cfg, built, rnd) {
      const group = new THREE.Group();
      group.name = sp.id + '-seep';
      this.scene.add(group);
      const isWorm = cfg.seepRing === 'inner';
      A.World.seeps.forEach((seep) => {
        const n = cfg.seep;
        for (let i = 0; i < n; i++) {
          const a = rnd() * Math.PI * 2;
          const rr = isWorm
            ? Math.sqrt(rnd()) * Math.min(7.5, seep.r * 0.34)
            : Math.min(15, seep.r * 0.55) + rnd() * 5;
          const x = seep.x + Math.cos(a) * rr;
          const z = seep.z + Math.sin(a) * rr;
          const ground = T.depth(x, z);
          const scale = lerp(cfg.scale[0], cfg.scale[1], rnd());
          const mesh = this._makeMesh(sp, built, scale);
          if (!mesh) continue;
          const proxy = this._makeProxy(sp, built, scale, mesh);
          const agent = {
            speciesId: sp.id,
            mode: 'sessile',
            group: new THREE.Group(),
            mesh, proxy,
            home: new THREE.Vector3(x, -ground, z),
            yaw: rnd() * Math.PI * 2,
            tilt: (rnd() - 0.5) * 0.18,
            scale,
            size: built.size * scale,
            phase: rnd() * 6.28
          };
          agent.group.add(mesh);
          agent.group.add(proxy);
          agent.group.position.copy(agent.home);
          agent.group.rotation.y = agent.yaw;
          group.add(agent.group);
          this.proxies.push(proxy);
          this.list.push(agent);
        }
      });
    },

    // ------------------------------------------------------------ 更新
    update(t, dt, camera, hovered) {
      for (let i = 0; i < this.list.length; i++) {
        const a = this.list[i];
        const g = a.group;
        if (a.mode === 'swim') {
          const ang = a.phase + t * a.w;
          const nx = a.home.x + Math.cos(ang) * a.rx;
          const nz = a.home.z + Math.sin(ang) * a.rz;
          let ny = a.home.y + Math.sin(t * 0.33 + a.phase) * a.bob;
          const groundY = -T.depth(nx, nz);
          if (ny < groundY + 8) ny = groundY + 8;
          const vx = -Math.sin(ang) * a.rx * a.w;
          const vz = Math.cos(ang) * a.rz * a.w;
          g.position.set(nx, ny, nz);
          // 模型朝向 -Z：直接由速度求偏航，避免 lookAt 在近零速度时退化
          if (vx * vx + vz * vz > 1e-6) {
            a.heading = Math.atan2(-vx, -vz);
          }
          g.rotation.set(0, a.heading + a.yawOffset, Math.sin(t * 0.5 + a.phase) * 0.05);
        } else if (a.mode === 'drift') {
          const nx = a.home.x + Math.sin(t * 0.09 + a.phase) * a.rx * 0.5;
          const nz = a.home.z + Math.cos(t * 0.07 + a.phase * 1.3) * a.rz * 0.5;
          const ny = a.home.y + Math.sin(t * 0.13 + a.phase) * a.bob;
          g.position.set(nx, ny, nz);
          g.rotation.y = a.yaw + Math.sin(t * 0.08 + a.phase) * 0.5;
          g.rotation.z = Math.sin(t * 0.11 + a.phase) * 0.06;
        } else if (a.mode === 'hover') {
          const nx = a.home.x + Math.sin(t * 0.15 + a.phase) * 1.6;
          const nz = a.home.z + Math.cos(t * 0.11 + a.phase) * 1.6;
          const ny = a.home.y + Math.sin(t * 0.42 + a.phase) * 0.6;
          g.position.set(nx, ny, nz);
          g.rotation.y = a.yaw + Math.sin(t * 0.13 + a.phase) * 0.35;
        } else if (a.mode === 'crawl') {
          const ang = a.phase + t * a.w * 0.35;
          const nx = a.home.x + Math.cos(ang) * a.rx * 0.16;
          const nz = a.home.z + Math.sin(ang) * a.rz * 0.16;
          const gy = -T.depth(nx, nz);
          // 底栖个体的原点就是体底（GLB 已按 bottom pivot 上移），
          // 只需留一点贴地间隙；过去写死 0.10*scale 会让小鱼整条陷进沙里。
          g.position.set(nx, gy + 0.02 + 0.03 * a.scale, nz);
          const e = 1.4;
          const dx = (T.depth(nx + e, nz) - T.depth(nx - e, nz)) / (2 * e);
          const dz = (T.depth(nx, nz + e) - T.depth(nx, nz - e)) / (2 * e);
          const nrm = new V3(-dx, 1, -dz).normalize();
          const q = new THREE.Quaternion().setFromUnitVectors(new V3(0, 1, 0), nrm);
          const qy = new THREE.Quaternion().setFromAxisAngle(new V3(0, 1, 0), a.yaw + t * 0.05);
          g.quaternion.copy(q).multiply(qy);
        } else {
          g.position.copy(a.home);
          g.rotation.y = a.yaw;
          if (a.tilt) {
            g.rotation.x = a.tilt * 0.5;
            g.rotation.z = a.tilt;
          }
        }
      }
    },

    // 每帧更新共享时间 uniform（所有材质共用同一个对象）
    tick(t) {
      for (let i = 0; i < organicMats.length; i++) {
        const m = organicMats[i];
        const u = m.userData.u;
        if (!u) continue;
        u.uTime.value = t;
        if (m.userData.flash) {
          const p = (t * 0.22 + i * 0.137) % 1;
          let k = 0.35;
          if (p < 0.10) k = 0.35 + 3.4 * Math.sin((p / 0.10) * Math.PI);
          u.uEmissiveMul.value = k;
        }
      }
    },

    // 鮟鱇发光器等点光源（最多 3 个，动态挂到最近的个体上）
    updateLights(t, camera) {
      if (!this._lights) {
        this._lights = [];
        for (let i = 0; i < 3; i++) {
          const l = new THREE.PointLight(0xffc257, 0, 16, 2);
          this.scene.add(l);
          this._lights.push(l);
        }
      }
      const cands = [];
      for (let i = 0; i < this.list.length; i++) {
        const a = this.list[i];
        if (a.speciesId === 'melanocetus-johnsonii') {
          const d = camera.position.distanceTo(a.group.position);
          if (d < 70) cands.push({ a, d });
        }
      }
      cands.sort((p, q) => p.d - q.d);
      for (let i = 0; i < 3; i++) {
        const l = this._lights[i];
        if (i < cands.length) {
          const a = cands[i].a;
          l.position.copy(a.group.position);
          l.position.y += 0.5 * a.scale;
          l.intensity = 0.85 * (1 - smoothstep(45, 70, cands[i].d)) * (0.85 + 0.15 * Math.sin(t * 1.7 + a.phase));
          l.distance = 15;
        } else {
          l.intensity = 0;
        }
      }
    }
  };

  A.Creatures = Creatures;
  A.__builders = { tag, loft, taperedTube, fin, ball, spike, merge, curveAt, organicMat, B };
  A.__plan = PLAN;
  A.__organicMat = organicMat;
})();
