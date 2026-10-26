/* ABYSS — 世界构建：地形 / 岩石 / 水体 / 光照 / 悬浮颗粒 */
(function () {
  const A = window.ABYSS;
  const { clamp, lerp, smoothstep, hash2, mulberry32 } = A.util;
  const T = A.terrain;
  const W = A.WORLD;

  // ---------------------------------------------------------------- 可平铺噪声
  function pnoise(x, y, period) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const w = (n) => ((n % period) + period) % period;
    const a = hash2(w(xi), w(yi)), b = hash2(w(xi + 1), w(yi));
    const c = hash2(w(xi), w(yi + 1)), d = hash2(w(xi + 1), w(yi + 1));
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  }

  function tileFbm(u, v, freq, oct) {
    let amp = 1, sum = 0, norm = 0, f = freq;
    for (let i = 0; i < oct; i++) {
      sum += pnoise(u * f, v * f, f) * amp;
      norm += amp; amp *= 0.5; f *= 2;
    }
    return sum / norm;
  }

  // 生成沉积物颗粒贴图 + 法线贴图（可平铺）
  function buildSedimentTextures(size) {
    const h = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size, v = y / size;
        h[y * size + x] =
          tileFbm(u, v, 22, 4) * 0.50 +
          tileFbm(u, v, 58, 3) * 0.34 +
          hash2(x * 13 + 7, y * 17 + 3) * 0.16;
      }
    }
    const cCol = document.createElement('canvas');
    cCol.width = cCol.height = size;
    const ctx = cCol.getContext('2d');
    const img = ctx.createImageData(size, size);
    for (let i = 0; i < size * size; i++) {
      const n = h[i];
      const v = clamp(0.88 + (n - 0.5) * 0.26, 0, 1) * 255;
      img.data[i * 4] = v * 0.995;
      img.data[i * 4 + 1] = v * 0.975;
      img.data[i * 4 + 2] = v * 0.94;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);

    const cNrm = document.createElement('canvas');
    cNrm.width = cNrm.height = size;
    const nctx = cNrm.getContext('2d');
    const nimg = nctx.createImageData(size, size);
    const at = (x, y) => h[((y + size) % size) * size + ((x + size) % size)];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (at(x + 1, y) - at(x - 1, y)) * 1.15;
        const dy = (at(x, y + 1) - at(x, y - 1)) * 1.15;
        let nx = -dx, ny = -dy, nz = 1;
        const l = Math.hypot(nx, ny, nz);
        nx /= l; ny /= l; nz /= l;
        const i = (y * size + x) * 4;
        nimg.data[i] = (nx * 0.5 + 0.5) * 255;
        nimg.data[i + 1] = (ny * 0.5 + 0.5) * 255;
        nimg.data[i + 2] = (nz * 0.5 + 0.5) * 255;
        nimg.data[i + 3] = 255;
      }
    }
    nctx.putImageData(nimg, 0, 0);

    const col = new THREE.CanvasTexture(cCol);
    col.wrapS = col.wrapT = THREE.RepeatWrapping;
    col.colorSpace = THREE.SRGBColorSpace;
    col.anisotropy = 4;

    const nrm = new THREE.CanvasTexture(cNrm);
    nrm.wrapS = nrm.wrapT = THREE.RepeatWrapping;
    nrm.anisotropy = 4;
    return { col, nrm };
  }

  // ---------------------------------------------------------------- 世界
  const World = {
    seeps: [],
    _tmpColor: new THREE.Color(),
    _snowUniforms: null,
    _domeUniforms: null,
    _lampOn: 1,

    init(scene, renderer, camera) {
      this.scene = scene;
      this.renderer = renderer;
      this.camera = camera;

      // 冷泉斑块位置（峡谷底）
      this.seeps = W.seeps.map((s) => {
        const x = T.canyonX(s.z) + s.off;
        return { x, z: s.z, r: s.r, depth: T.depth(x, s.z) };
      });

      scene.fog = new THREE.FogExp2(0x0d3446, 0.0038);
      this.buildDome();
      this.buildLights();
      this.buildTerrain();
      this.buildRocks();
      this.buildPebbles();
      this.buildDistantRidges();
      this.buildSnow();
      this.update(0, camera, W.start.depth, true);
    },

    // 远景山脊剪影：给出第三层纵深。
    // 只有地形时，雾一压就只剩"近处岩壁 + 一片空"；
    // 加一圈不参与光照的剪影，观者才能读出"远处还有山"。
    buildDistantRidges() {
      const rnd = mulberry32(555111);
      const group = new THREE.Group();
      group.name = 'ridges';
      const mat = new THREE.MeshBasicMaterial({
        color: 0x0a1c26, transparent: true, opacity: 0.55,
        depthWrite: false, fog: true, side: THREE.DoubleSide
      });
      // 三圈不同半径，越远越暗、越糊
      const rings = [
        { r: 400, n: 16, h: [26, 68], col: 0x0b1e2a, op: 0.50, w: [70, 150] },
        { r: 560, n: 18, h: [44, 104], col: 0x081521, op: 0.38, w: [90, 200] },
        { r: 700, n: 20, h: [62, 150], col: 0x050e18, op: 0.28, w: [120, 260] }
      ];
      rings.forEach((ring) => {
        const m = mat.clone();
        m.color.setHex(ring.col);
        m.opacity = ring.op;
        // 记下基准不透明度，update() 里按深度统一衰减
        m.userData.baseOp = ring.op;
        for (let i = 0; i < ring.n; i++) {
          const a = (i / ring.n) * Math.PI * 2 + rnd() * 0.16;
          const rr = ring.r * (0.88 + rnd() * 0.24);
          const h = lerp(ring.h[0], ring.h[1], rnd());
          const w = lerp(ring.w[0], ring.w[1], rnd());
          // 用极低面数的三棱柱当剪影，成本可忽略。
          // 竖直位置围绕**组原点**分布（不是绝对 -520）：
          // 这样整组跟随相机时，剪影始终在相机高度上下展开，
          // 写死绝对高度会让深浅两处只能兼顾一头。
          const g = new THREE.ConeGeometry(w * 0.5, h, 3, 1, true);
          const mesh = new THREE.Mesh(g, m);
          mesh.position.set(
            Math.cos(a) * rr,
            -h * 0.42 + (rnd() - 0.5) * h * 0.45,
            Math.sin(a) * rr
          );
          mesh.rotation.y = rnd() * Math.PI;
          mesh.scale.set(1, 1, 0.35 + rnd() * 0.4);
          mesh.frustumCulled = true;
          group.add(mesh);
        }
      });
      this.ridges = group;
      this.scene.add(group);
    },

    // 水体穹顶：始终包裹相机，作为"背景"而非几何体
    buildDome() {
      const geo = new THREE.SphereGeometry(420, 32, 20);
      const uniforms = {
        uUp: { value: new THREE.Color(0x2b6f86) },
        uFog: { value: new THREE.Color(0x0b2230) },
        uTime: { value: 0 }
      };
      const mat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: `
          uniform vec3 uUp; uniform vec3 uFog; uniform float uTime;
          varying vec3 vDir;
          void main() {
            float h = vDir.y * 0.5 + 0.5;
            float k = smoothstep(0.30, 1.0, h);
            vec3 c = mix(uFog, uUp, pow(k, 1.55));
            // 极轻微的水体分层，避免纯渐变显得像塑料
            c += uUp * 0.035 * sin(vDir.y * 9.0 + uTime * 0.12) * k;
            gl_FragColor = vec4(c, 1.0);
          }`,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: false,
        fog: false
      });
      const dome = new THREE.Mesh(geo, mat);
      dome.frustumCulled = false;
      dome.renderOrder = -1000;
      this.dome = dome;
      this._domeUniforms = uniforms;
      this.scene.add(dome);
    },

    buildLights() {
      // 半球光：靠上方的余晖与下方的海床反射，是深海唯一的"天光"
      const hemi = new THREE.HemisphereLight(0x5f93ad, 0x0d1218, 1.05);
      hemi.position.set(0, 400, 0);
      this.hemi = hemi;
      this.scene.add(hemi);

      // 主方向光：模拟从海面透下来的微弱平行光，深于 820m 完全消失
      const dir = new THREE.DirectionalLight(0xbcdce8, 0.85);
      dir.position.set(-120, 600, 160);
      this.dir = dir;
      this.scene.add(dir);

      // 冷泉点光：化能合成群落自身不像发光生物那样闪，
      // 但菌席与管虫丛在视觉上需要一个"地标光"，否则走到谷底什么都看不见。
      // 这类光源数量固定（跟随 seeps，最多 3 个），不随生物数量增长。
      this.seepLights = [];
      const nSeep = Math.min(3, this.seeps.length);
      for (let i = 0; i < nSeep; i++) {
        const s = this.seeps[i];
        const l = new THREE.PointLight(0x9fc4b0, 0, 34, 2);
        l.position.set(s.x, -s.depth + 3.5, s.z);
        this.scene.add(l);
        this.seepLights.push(l);
      }
    },

    buildTerrain() {
      const N = 300;
      const size = W.half * 2;
      const step = size / N;
      const vcount = (N + 1) * (N + 1);
      const pos = new Float32Array(vcount * 3);
      const uv = new Float32Array(vcount * 2);
      const idx = new Uint32Array(N * N * 6);

      for (let j = 0; j <= N; j++) {
        const z = -W.half + j * step;
        for (let i = 0; i <= N; i++) {
          const x = -W.half + i * step;
          const k = (j * (N + 1) + i);
          pos[k * 3] = x;
          pos[k * 3 + 1] = -T.depth(x, z);
          pos[k * 3 + 2] = z;
          uv[k * 2] = x / 9.5;
          uv[k * 2 + 1] = z / 9.5;
        }
      }
      let p = 0;
      for (let j = 0; j < N; j++) {
        for (let i = 0; i < N; i++) {
          const a = j * (N + 1) + i;
          const b = a + 1;
          const c = a + (N + 1);
          const d = c + 1;
          idx[p++] = a; idx[p++] = c; idx[p++] = b;
          idx[p++] = b; idx[p++] = c; idx[p++] = d;
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      geo.setIndex(new THREE.BufferAttribute(idx, 1));
      geo.computeVertexNormals();

      // 顶点色：坡度决定沉积物 / 岩石，冷泉斑块漂白
      const nrm = geo.attributes.normal.array;
      const col = new Float32Array(vcount * 3);
      const sedA = new THREE.Color(0x7e776c);
      const sedB = new THREE.Color(0x918878);
      const rockA = new THREE.Color(0x43474a);
      const rockB = new THREE.Color(0x5b5f61);
      const mat = new THREE.Color(0xc2cbbf);
      const tmp = new THREE.Color();
      const tmp2 = new THREE.Color();

      for (let k = 0; k < vcount; k++) {
        const x = pos[k * 3], z = pos[k * 3 + 2], dep = -pos[k * 3 + 1];
        const slope = 1 - nrm[k * 3 + 1];
        const n1 = A.util.fbm(x * 0.017, z * 0.017, 3);
        const n2 = A.util.fbm(x * 0.075 + 4.1, z * 0.075 - 2.3, 2);

        tmp.copy(sedA).lerp(sedB, n2);
        tmp2.copy(rockA).lerp(rockB, n1);
        const rockMix = smoothstep(0.30, 0.62, slope + (n1 - 0.5) * 0.30);
        tmp.lerp(tmp2, rockMix);

        // 洼地积泥更细、更亮
        tmp.multiplyScalar(0.82 + n1 * 0.36);

        // 冷泉菌席
        for (let s = 0; s < this.seeps.length; s++) {
          const sp = this.seeps[s];
          const dd = Math.hypot(x - sp.x, z - sp.z);
          if (dd < sp.r * 1.7) {
            const w = (1 - smoothstep(sp.r * 0.55, sp.r * 1.55, dd)) * (0.55 + n2 * 0.45);
            tmp.lerp(mat, w * 0.88);
          }
        }

        // 深度整体压暗
        const dark = 1 - smoothstep(500, 1050, dep) * 0.30;
        col[k * 3] = tmp.r * dark;
        col[k * 3 + 1] = tmp.g * dark;
        col[k * 3 + 2] = tmp.b * dark;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

      const tex = buildSedimentTextures(512);
      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        map: tex.col,
        normalMap: tex.nrm,
        normalScale: new THREE.Vector2(0.62, 0.62),
        roughness: 0.96,
        metalness: 0.02
      });

      const mesh = new THREE.Mesh(geo, material);
      mesh.matrixAutoUpdate = false;
      this.terrainMesh = mesh;
      this.scene.add(mesh);
    },

    buildRocks() {
      const rnd = mulberry32(20261025);
      const geos = [];
      for (let v = 0; v < 4; v++) {
        const g = new THREE.IcosahedronGeometry(1, 2);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
          const n1 = A.util.fbm(x * 1.6 + v * 7.3, z * 1.6 - y * 1.1, 3);
          const n2 = A.util.fbm(y * 2.7 + v * 3.1, x * 2.2 + z * 1.7, 2);
          const r = 0.62 + n1 * 0.78 + n2 * 0.30;
          p.setXYZ(i, x * r * 1.10, y * r * 0.78, z * r);
        }
        g.computeVertexNormals();
        // 顶点色：棱角处更亮，凹陷处更暗，模拟岩石的风化面
        const pos = g.attributes.position;
        const nrm = g.attributes.normal;
        const col = new Float32Array(pos.count * 3);
        for (let i = 0; i < pos.count; i++) {
          const ny = nrm.getY(i);
          const px = pos.getX(i), py = pos.getY(i), pz = pos.getZ(i);
          const grain = A.util.fbm(px * 3.1 + v, py * 3.1 + pz * 1.7, 2);
          let k = 0.62 + grain * 0.55 + Math.max(0, ny) * 0.22;
          if (py < -0.15) k *= 0.74;
          col[i * 3] = k * 1.0;
          col[i * 3 + 1] = k * 0.985;
          col[i * 3 + 2] = k * 0.95;
        }
        g.setAttribute('color', new THREE.BufferAttribute(col, 3));
        geos.push(g);
      }

      const rockTex = buildSedimentTextures(128);
      rockTex.nrm.repeat.set(1.6, 1.6);
      const material = new THREE.MeshStandardMaterial({
        color: 0x6a6a66,
        roughness: 0.78,
        metalness: 0.05,
        flatShading: true,
        vertexColors: true,
        normalMap: rockTex.nrm,
        normalScale: new THREE.Vector2(0.5, 0.5)
      });

      const per = 210;
      const total = per * geos.length;
      const meshes = [];
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const e = new THREE.Euler();
      const v3 = new THREE.Vector3();
      const scl = new THREE.Vector3();
      const color = new THREE.Color();

      let count = 0;
      for (let gi = 0; gi < geos.length; gi++) {
        const inst = new THREE.InstancedMesh(geos[gi], material, per);
        inst.instanceMatrix.setUsage(THREE.StaticDrawUsage);
        let n = 0;
        let guard = 0;
        while (n < per && guard < per * 40) {
          guard++;
          const ang = rnd() * Math.PI * 2;
          const rad = Math.sqrt(rnd()) * 470;
          const x = Math.cos(ang) * rad;
          const z = Math.sin(ang) * rad;
          const slope = T.slope(x, z);
          // 陡坡与岩壁附近岩石更多；平原上稀疏
          const chance = 0.22 + slope * 0.95 + (Math.hypot(x, z) > 300 ? 0.3 : 0);
          if (rnd() > chance) continue;
          const y = -T.depth(x, z);
          let s = 0.9 + Math.pow(rnd(), 2.2) * 6.2;
          if (rnd() < 0.05) s *= 2.6 + rnd() * 1.8;
          if (slope > 0.55) s *= 1.35;
          const sy = s * (0.55 + rnd() * 0.6);
          e.set(rnd() * 0.5 - 0.25, rnd() * Math.PI * 2, rnd() * 0.5 - 0.25);
          q.setFromEuler(e);
          v3.set(x, y - s * 0.34, z);
          scl.set(s * (0.8 + rnd() * 0.5), sy, s * (0.8 + rnd() * 0.5));
          m4.compose(v3, q, scl);
          inst.setMatrixAt(n, m4);
          const g = 0.46 + rnd() * 0.30;
          color.setRGB(g * (0.95 + rnd() * 0.1), g * (0.97 + rnd() * 0.06), g * (1.02 + rnd() * 0.1));
          inst.setColorAt(n, color);
          n++; count++;
        }
        inst.count = n;
        inst.instanceMatrix.needsUpdate = true;
        if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
        inst.frustumCulled = false;
        meshes.push(inst);
        this.scene.add(inst);
      }
      this.rockCount = count;
    },

    // 小砾石：近景尺度参照，成本低
    buildPebbles() {
      const rnd = mulberry32(918273);
      const g = new THREE.IcosahedronGeometry(1, 0);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        const n = A.util.fbm(x * 2.4 + 3.1, z * 2.4 - y * 1.7, 2);
        const r = 0.7 + n * 0.7;
        p.setXYZ(i, x * r, y * r * 0.6, z * r);
      }
      g.computeVertexNormals();

      const COUNT = 1400;
      const mat = new THREE.MeshStandardMaterial({
        color: 0x6d685e, roughness: 0.92, metalness: 0.02, flatShading: true
      });
      const inst = new THREE.InstancedMesh(g, mat, COUNT);
      const m4 = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const e = new THREE.Euler();
      const v3 = new THREE.Vector3();
      const scl = new THREE.Vector3();
      const color = new THREE.Color();
      let n = 0, guard = 0;
      while (n < COUNT && guard < COUNT * 12) {
        guard++;
        const ang = rnd() * Math.PI * 2;
        const rad = Math.sqrt(rnd()) * 330;
        const x = Math.cos(ang) * rad;
        const z = Math.sin(ang) * rad;
        const slope = T.slope(x, z);
        if (slope > 0.62) continue;
        const y = -T.depth(x, z);
        const s = 0.06 + Math.pow(rnd(), 2.6) * 0.30;
        e.set(rnd() * 0.7 - 0.35, rnd() * 6.28, rnd() * 0.7 - 0.35);
        q.setFromEuler(e);
        v3.set(x, y - s * 0.25, z);
        scl.set(s * (0.8 + rnd() * 0.6), s * (0.5 + rnd() * 0.5), s * (0.8 + rnd() * 0.6));
        m4.compose(v3, q, scl);
        inst.setMatrixAt(n, m4);
        const k = 0.32 + rnd() * 0.34;
        color.setRGB(k, k * 0.97, k * 0.9);
        inst.setColorAt(n, color);
        n++;
      }
      inst.count = n;
      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
      inst.frustumCulled = false;
      this.scene.add(inst);
      this.pebbleCount = n;
    },

    buildSnow() {
      // 数量从 7000 降到 3400：深海里"海雪"是稀疏的，
      // 原来的密度在近景会糊住生物，且每个点都要走一次 point 光栅。
      // 体积感靠 uBox 与尺寸分布营造，不靠堆数量。
      const COUNT = 3400;
      const box = 150;
      const pos = new Float32Array(COUNT * 3);
      const size = new Float32Array(COUNT);
      const phase = new Float32Array(COUNT);
      const rnd = mulberry32(777);
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3] = rnd();
        pos[i * 3 + 1] = rnd();
        pos[i * 3 + 2] = rnd();
        // 少数大颗粒 + 大量细颗粒：真实海雪是「少量絮团 + 背景细屑」，
        // 均匀分布会显得像雪景而不是悬浮絮状物
        size[i] = rnd() < 0.06
          ? 0.10 + Math.pow(rnd(), 2.0) * 0.20
          : 0.028 + Math.pow(rnd(), 3.0) * 0.085;
        phase[i] = rnd();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
      geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1000);

      const uniforms = {
        uCam: { value: new THREE.Vector3() },
        uBox: { value: box },
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.75) },
        uSpotPos: { value: new THREE.Vector3() },
        uSpotDir: { value: new THREE.Vector3(0, 0, -1) },
        uSpotCos: { value: Math.cos(0.42) },
        uSpotRange: { value: 88 },
        uSpotOn: { value: 1 }
      };

      const mat = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
        vertexShader: `
          uniform vec3 uCam; uniform float uBox; uniform float uTime;
          uniform float uPixelRatio; uniform vec3 uSpotPos; uniform vec3 uSpotDir;
          uniform float uSpotCos; uniform float uSpotRange; uniform float uSpotOn;
          attribute float aSize; attribute float aPhase;
          varying float vGlow; varying float vPhase;
          void main() {
            vec3 drift = vec3(uTime * 0.10 + sin(uTime * 0.13 + aPhase * 6.28) * 0.9,
                              -uTime * 0.26,
                              uTime * 0.04);
            vec3 p = position * uBox + drift;
            vec3 rel = mod(p - uCam + 0.5 * uBox, uBox) - 0.5 * uBox;
            vec3 wp = uCam + rel;
            vec4 mv = viewMatrix * vec4(wp, 1.0);
            gl_Position = projectionMatrix * mv;
            float d = max(-mv.z, 0.15);
            gl_PointSize = clamp(aSize * uPixelRatio * (900.0 / d), 1.0, 26.0);

            vec3 toP = wp - uSpotPos;
            float dist = length(toP);
            float cone = smoothstep(uSpotCos, uSpotCos + 0.10, dot(normalize(toP), uSpotDir));
            float atten = clamp(1.0 - dist / uSpotRange, 0.0, 1.0);
            vGlow = 0.085 + cone * atten * uSpotOn * 2.4;
            vPhase = aPhase;
          }`,
        fragmentShader: `
          varying float vGlow; varying float vPhase;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float r = length(c);
            if (r > 0.5) discard;
            float a = smoothstep(0.5, 0.05, r);
            vec3 col = mix(vec3(0.36, 0.52, 0.60), vec3(0.80, 0.94, 1.0), clamp(vGlow * 1.6, 0.0, 1.0));
            gl_FragColor = vec4(col, a * clamp(vGlow, 0.0, 1.0) * 0.85);
          }`
      });

      const pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false;
      pts.renderOrder = 5;
      this.snow = pts;
      this._snowUniforms = uniforms;
      this.scene.add(pts);
    },

    setLamp(on) { this._lampOn = on ? 1 : 0; },

    update(dt, camera, depth, lampOn) {
      const tint = T.depthTint(depth);
      if (this.scene.fog) {
        this.scene.fog.color.copy(tint.fog);
        // 雾密度随深度递增：浅处能看远、深处视线被水本身吃掉，
        // 这是"纵深"的主要来源，比单纯加暗更有效。
        this.scene.fog.density = lerp(0.0032, 0.0062, smoothstep(320, 1080, depth));
      }
      if (this._domeUniforms) {
        this._domeUniforms.uFog.value.copy(tint.fog);
        this._domeUniforms.uUp.value.copy(tint.up);
        this._domeUniforms.uTime.value += dt;
      }
      if (this.dome) this.dome.position.copy(camera.position);

      if (this.hemi) this.hemi.intensity = tint.ambient;
      if (this.dir) this.dir.intensity = 0.85 * smoothstep(820, 300, depth);

      // 远景剪影随深度一起压暗，越深越融进背景
      if (this.ridges) {
        const fade = 1 - smoothstep(420, 1000, depth) * 0.55;
        this.ridges.children.forEach((m) => {
          if (m.material) m.material.opacity = m.material.userData.baseOp * fade;
        });
        // 剪影必须跟着相机水平移动、并跟随相机所在深度。
        // 之前只跟水平位置、竖直方向固定在 -520，
        // 相机下潜到 648m 之后，整圈山脊跑到了头顶，画面里根本没有远景。
        this.ridges.position.set(
          camera.position.x * 0.55,
          camera.position.y - 10,
          camera.position.z * 0.55
        );
      }

      // 冷泉点光：靠近时点亮，离开后熄灭，避免无谓的光照开销
      if (this.seepLights) {
        for (let i = 0; i < this.seepLights.length; i++) {
          const l = this.seepLights[i];
          const s = this.seeps[i];
          const d = Math.hypot(camera.position.x - s.x, camera.position.z - s.z);
          const near = 1 - smoothstep(28, 62, d);
          // 微生物席的呼吸式明暗，周期长、幅度小，不抢生物发光
          const breathe = 0.85 + 0.15 * Math.sin(performance.now() * 0.00042 + i * 2.1);
          l.intensity = near * 2.2 * breathe * (0.65 + 0.35 * (1 - smoothstep(500, 1100, depth)));
        }
      }

      if (this._snowUniforms) {
        const u = this._snowUniforms;
        u.uCam.value.copy(camera.position);
        u.uTime.value += dt;
        u.uSpotOn.value = lampOn ? 1 : 0;
        camera.getWorldDirection(u.uSpotDir.value);
        u.uSpotPos.value.copy(camera.position);
      }
    }
  };

  A.World = World;
})();
