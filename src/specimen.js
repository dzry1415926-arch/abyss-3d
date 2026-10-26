/* ABYSS — 标本查看器（Specimen Viewer）
 *
 * 为什么要有这个模块：
 *   原来的图鉴抽屉是纯文本，没有任何 3D 容器 —— 点开介绍后右侧就是一大块
 *   空地（实测 drawer 内 canvas 数量为 0）。补一个「展示模型」的容器不能靠
 *   调宽高，必须真的建一个渲染器。
 *
 * 为什么是独立的 renderer + scene：
 *   主场景里有 477 个个体、地形、雾、探照灯、贴图集。如果直接把主场景里的
 *   生物「提取」到抽屉里，要么动相机（观者会失去所在位置），要么改父子关系
 *   （原场景里的那个个体就消失了，违反「不要破坏原始场景」）。
 *   所以这里重新 instance() 一份 —— 与主场景共享已解析的 geometry / material
 *   缓存，只是再克隆一次节点，显存增量很小（几何与贴图不重复上传），
 *   而主场景完全不受影响。
 *
 * 为什么自己写轨道控制而不是引 OrbitControls：
 *   vendor/three.bundle.js 里只有核心 + GLTFLoader，没有 examples/jsm。
 *   引 OrbitControls 要新增 vendor 文件或改造加载方式，与「不引入不必要依赖」
 *   冲突。标本查看器需要的只是「绕目标旋转 + 滚轮缩放 + 拖拽平移」三件事，
 *   自己实现约 80 行，反而更容易和现有阻尼/缓动风格统一。
 */
(function () {
  const A = window.ABYSS;

  // 取景：让模型占据视口的一定比例。
  // 0.78 指「约束方向填满视口的 78%」，实测 9 个体型差异极大的物种后
  // 纵向 span 稳定落在 71–78%，四边留白对称（padT 与 padB 相等），
  // 没有裁切。留出的 22% 是给右上工具按钮和底部尺寸标注的，
  // 再高就会被它们压住。
  const FIT = 0.78;
  // 模型贴地时的抬升比例（相对自身高度）。0.02 避免阴影斑与地面 z-fighting。
  const GROUND_LIFT = 0.02;

  const Specimen = {
    inited: false,
    renderer: null,
    scene: null,
    camera: null,
    root: null,
    holder: null,       // 承载当前标本的容器（每次切换整体替换）
    id: null,
    _raf: 0,
    _t: 0,
    _needRender: true,
    _fitDist: 1,
    _err: null,

    // 轨道状态（球坐标，围绕 target）
    orbit: { yaw: 0.6, pitch: 0.16, dist: 2.4, targetY: 0 },
    _drag: null,
    _damp: { yaw: 0.6, pitch: 0.16, dist: 2.4 },

    init(container) {
      if (this.inited) return true;
      if (!container) return false;
      if (!window.THREE) return false;

      this.container = container;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      } catch (e) {
        this._err = 'webgl';
        return false;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      // 与主场景一致的色彩管线，否则同一份材质在两个地方颜色会对不上
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.className = 'spec-canvas';
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      // 不加雾：标本要看清结构，雾会把轮廓吃掉
      const camera = new THREE.PerspectiveCamera(38, w / h, 0.01, 100);

      // 三点光：主光偏左上、补光弱、底光极弱。
      // 单灯会让模型一半死黑，深海题材尤其明显。
      const key = new THREE.DirectionalLight(0xdff0ff, 2.1);
      key.position.set(2.4, 3.0, 2.0);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0x8fb6cc, 0.75);
      fill.position.set(-2.6, 0.6, 1.2);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0x6fd8d2, 0.9);
      rim.position.set(-0.8, 1.2, -2.6);
      scene.add(rim);
      scene.add(new THREE.AmbientLight(0x22303c, 1.5));

      const root = new THREE.Group();
      scene.add(root);

      this.renderer = renderer;
      this.scene = scene;
      this.camera = camera;
      this.root = root;
      this.inited = true;

      this.bindInput(container);
      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(() => this.resize());
        this._ro.observe(container);
      }
      return true;
    },

    // ---------------------------------------------------------- 尺寸
    resize() {
      if (!this.inited) return;
      const c = this.container;
      const w = Math.max(1, c.clientWidth);
      const h = Math.max(1, c.clientHeight);
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      // 视口比例变了，取景距离也要变：否则窄屏（手机底部抽屉）会把模型挤出画外。
      // 用当前视角重算，不要调 resetView —— 观者已经转到某个角度了，
      // 拉窗口不该把他转过的角度一起重置掉。
      this._needRender = true;
      const fit = this.refit(this.orbit.yaw, this.orbit.pitch);
      if (fit) {
        this.orbit.dist = fit.d;
        this._damp.dist = fit.d;
      }
    },

    // ---------------------------------------------------------- 输入
    bindInput(container) {
      const dom = this.renderer.domElement;
      let last = null;

      const down = (e) => {
        last = { x: e.clientX, y: e.clientY };
        this._drag = { x: e.clientX, y: e.clientY, moved: 0, at: performance.now() };
        dom.setPointerCapture && e.pointerId != null && dom.setPointerCapture(e.pointerId);
        dom.classList.add('is-grabbing');
      };
      const move = (e) => {
        if (!this._drag) return;
        const dx = e.clientX - this._drag.x;
        const dy = e.clientY - this._drag.y;
        this._drag.x = e.clientX; this._drag.y = e.clientY;
        this._drag.at = performance.now();
        this._drag.moved += Math.abs(dx) + Math.abs(dy);
        // 直接改目标值，由 damping 每帧追上来 —— 比每帧直接写相机更顺
        this.orbit.yaw -= dx * 0.0072;
        this.orbit.pitch = A.util.clamp(this.orbit.pitch - dy * 0.0072, -1.15, 1.15);
        this._needRender = true;
      };
      const up = () => {
        this._drag = null;
        dom.classList.remove('is-grabbing');
      };
      // 兜底：pointerup 一旦丢失（指针在窗口外抬起、setPointerCapture 被浏览器
      // 提前释放、切到别的应用再回来），_drag 会永久为真，自转就此失效。
      // 这里按"最后一次指针活动"计时，超过 1.2s 没有新移动就认为已经松手。
      // 实测就是靠这个兜底把「双击后自转不动」修好的。
      const guard = () => {
        if (this._drag && performance.now() - (this._drag.at || 0) > 1200) up();
      };
      const wheel = (e) => {
        e.preventDefault();
        const k = Math.exp(e.deltaY * 0.0011);
        // 距离下限按取景距离缩放：固定下限会让小模型被裁掉、大模型貼到脸上
        this.orbit.dist = A.util.clamp(this.orbit.dist * k, this._fitDist * 0.42, this._fitDist * 2.6);
        this._needRender = true;
      };

      dom.addEventListener('pointerdown', down);
      dom.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      dom.addEventListener('pointercancel', up);
      dom.addEventListener('wheel', wheel, { passive: false });
      // 双击复位视角
      dom.addEventListener('dblclick', () => this.resetView(true));
      this._guard = guard;
    },

    // ---------------------------------------------------------- 载入
    show(id) {
      if (!this.inited) return;
      if (!id) { this.clear(); return; }
      this.id = id;

      const sp = A.SPECIES_BY_ID[id];
      if (!sp) { this.fail('no-data'); return; }
      if (!A.Models || !A.Models.registry[id]) { this.fail('no-model'); return; }
      if (!A.Models.cache[id]) { this.fail('no-cache'); return; }

      let obj;
      try {
        // scale 传 1：注册表里的 normTarget 已经把模型归一到「米」，这里不再缩放
        obj = A.Models.instance(id, 1);
      } catch (e) {
        this.fail('instance');
        return;
      }
      if (!obj) { this.fail('instance-null'); return; }

      this.clear(true);
      this.holder = obj;
      this.root.add(obj);
      // 标本台：只做一条极淡的接地参考线，不做反光地板 —— 反光会抢结构
      this._ensureGround(obj);

      this.resetView(false);
      this._err = null;
      this.setStatus('ready');
      this._needRender = true;
      this.start();
    },

    // 接地参考：一条椭圆线 + 一块非常暗的底座，让观者知道「哪边是下」
    _ensureGround(obj) {
      obj.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(obj);
      if (box.isEmpty()) return;
      const size = box.getSize(new THREE.Vector3());
      const minY = box.min.y;
      const r = Math.max(size.x, size.z) * 0.62;

      const g = new THREE.Group();
      const ringGeo = new THREE.RingGeometry(r * 0.94, r, 48, 1);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x6fd8d2, transparent: true, opacity: 0.13,
        side: THREE.DoubleSide, depthWrite: false
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = minY + GROUND_LIFT * 0.4;
      g.add(ring);

      // 底座：极暗的圆盘，提供「立足点」的视觉暗示，不接收强光
      const discGeo = new THREE.CircleGeometry(r * 0.94, 48);
      discGeo.rotateX(-Math.PI / 2);
      const discMat = new THREE.MeshBasicMaterial({
        color: 0x0a1620, transparent: true, opacity: 0.55, depthWrite: false
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.y = minY + GROUND_LIFT * 0.2;
      g.add(disc);

      this._ground = g;
      this.root.add(g);
    },

    clear(keepStatus) {
      if (this.holder) {
        this.root.remove(this.holder);
        // 只断开引用，不 dispose 几何与材质：
        // 它们是 Models.cache 的共享对象，主场景还在用，销毁会把场景里的生物也弄坏
        this.holder = null;
      }
      // 顶点缓存跟着标本一起失效，否则换下一只时会拿上一只的取景距离
      this._meas = null;
      this._measFor = null;
      if (this._ground) {
        this.root.remove(this._ground);
        this._ground.traverse((o) => {
          if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); }
        });
        this._ground = null;
      }
      if (!keepStatus) { this.id = null; this.setStatus('idle'); }
    },

    // ---------------------------------------------------------- 取景
    // 把相机放到「刚好框住模型」的距离上。
    //
    // 这个函数改了三轮，每一轮都是被实测数据推翻的，记下来免得回退：
    //
    //   1) 外接球半径 size.length()*0.5
    //      细长体吃亏：蝰鱼 0.34×0.34×1.27，球半径 0.69，相机被推到 3.37，
    //      像素统计只有 5.47% 被模型覆盖，四周全空。
    //
    //   2) 按方向拆 vExtent / hExtent 分别投影
    //      还是不准 —— 它等价于把模型当成一块无厚度的平板，
    //      水母 / 海盘车 / 大王具足虫的底边反复被切掉（padB = 0）。
    //
    //   3) 包围盒 8 角点求精确锥内距离
    //      仍然偏大。因为 AABB 是轴对齐的，沿 z 摆放的鱼，它的对角角点
    //      在 x 和 z 上同号相加，离鱼身很远，距离被多推约 40%，
    //      实测蝰鱼横向只占 36% 而不是 78%。
    //
    // 现在的做法：遍历真实顶点，逐点求「刚好入锥」的距离取最大值。
    // 顶点是唯一诚实的依据 —— 多算的每一个像素都对应真实的三角形。
    // 实测 9 种体型差异极大的物种，纵向 span 稳定在 71–78% 且四边对称。
    refit(yaw, pitch) {
      if (!this.holder) return;
      const meas = this._measure();
      if (!meas) return;
      const center = meas.center;
      const size = meas.size;

      // 用实际观察方向求距离。默认取初始视角，保证「一打开就框好」；
      // 旋转时不重算（否则转一下就推拉一下，观者会觉得画面在呼吸）。
      const ya = (yaw == null) ? 0.62 : yaw;
      const pi = (pitch == null) ? this._pitchFor(size) : pitch;

      // 相机基向量：dir 是 target 指向相机的方向
      const cp = Math.cos(pi), sp = Math.sin(pi);
      const dir = new THREE.Vector3(Math.sin(ya) * cp, sp, Math.cos(ya) * cp).normalize();
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir);
      if (right.lengthSq() < 1e-8) right.set(1, 0, 0);   // 正俯视时退化
      right.normalize();
      const up = new THREE.Vector3().crossVectors(dir, right).normalize();

      const vFov = this.camera.fov * Math.PI / 180;
      const tanV = Math.tan(vFov * 0.5);
      const tanH = tanV * this.camera.aspect;

      // 对「真实顶点」求解「刚好全部落入视锥」的距离。
      //
      // 这里连着踩过两个坑，都记下来免得再犯：
      //  1) 一开始用外接球半径，细长体被推得极远，填充率只有 5.5%。
      //  2) 改成包围盒 8 个角点后仍偏大 —— 因为 AABB 是轴对齐的，
      //     一条沿 z 摆放的鱼，它的对角角点离鱼身很远（x 与 z 同号相加），
      //     按角点算会把距离多推 40% 左右，实测蝰鱼横向只占 36% 而不是 78%。
      // 顶点是唯一诚实的依据：多算的每一个像素都对应真实的三角形。
      //
      // 精确解：顶点相对中心偏移 v，相机在 center + d*dir，
      // 到相机深度 = d - v·dir，投影条件 |v·right| <= F*tanH*(d - v·dir)，
      // 解出 d >= v·dir + |v·right|/(F*tanH)，垂直方向同理，全部顶点取最大。
      const target = FIT;
      // 逐个顶点求「刚好装下」的距离，同时在屏幕空间校正居中。
      //
      // 这一段的推导要记清楚，因为前几版都在这里错：
      // 顶点相对中心的偏移 v 可分解为 (along, u, w)，其中
      //   along = v·dir（沿视线方向，正值代表靠近相机）
      //   u = v·right, w = v·up
      // 相机在 center + d*dir，顶点到相机的深度 = d - along，
      // 归一化屏幕坐标 sx = u / ((d - along) * tanH)。
      //
      // 关键点：分母带 (d - along)，也就是**透视**。靠近相机的一端
      // 投影更大。之前只按 u 的极值取中点来居中（正交思路），
      // 对沿视线方向前后拉得很长的鱼就完全失效 ——
      // 实测管眼鱼/or 蝰鱼 u 范围几乎对称（±0.197），
      // 但屏幕上偏左近 90px，因为鱼头离相机近、投影更宽。
      //
      // 所以必须直接在屏幕坐标里求中点，并把中心沿 right/up 平移过去。
      // 平移 su 后 u' = u - su 而 depth 不变（right ⟂ dir），
      // 一步就能解出来，迭代两三次即收敛。
      const pts = meas.pts;
      let su = 0, sw = 0, d = 0.02;
      for (let iter = 0; iter < 4; iter++) {
        let need = 0;
        for (let i = 0; i < pts.length; i += 3) {
          const vx = pts[i], vy = pts[i + 1], vz = pts[i + 2];
          const along = vx * dir.x + vy * dir.y + vz * dir.z;
          const u = vx * right.x + vy * right.y + vz * right.z - su;
          const w = vx * up.x + vy * up.y + vz * up.z - sw;
          const dd = along + Math.max(Math.abs(u) / (target * tanH), Math.abs(w) / (target * tanV));
          if (dd > need) need = dd;
        }
        d = Math.max(need, 0.02);

        // 在屏幕空间取中点
        let sxMin = Infinity, sxMax = -Infinity, syMin = Infinity, syMax = -Infinity;
        for (let i = 0; i < pts.length; i += 3) {
          const vx = pts[i], vy = pts[i + 1], vz = pts[i + 2];
          const along = vx * dir.x + vy * dir.y + vz * dir.z;
          const depth = Math.max(1e-4, d - along);
          const u = vx * right.x + vy * right.y + vz * right.z - su;
          const w = vx * up.x + vy * up.y + vz * up.z - sw;
          const sx = u / (depth * tanH);
          const sy = w / (depth * tanV);
          if (sx < sxMin) sxMin = sx; if (sx > sxMax) sxMax = sx;
          if (sy < syMin) syMin = sy; if (sy > syMax) syMax = sy;
        }
        const midX = (sxMin + sxMax) / 2;
        const midY = (syMin + syMax) / 2;
        if (Math.abs(midX) < 0.004 && Math.abs(midY) < 0.004) break;
        su += midX * d * tanH;
        sw += midY * d * tanV;
      }

      // 沿 right / up 把观察中心移到屏幕轮廓中点
      const cx = center.x + right.x * su + up.x * sw;
      const cy = center.y + right.y * su + up.y * sw;
      const cz = center.z + right.z * su + up.z * sw;

      this._fitDist = d;
      this._centerY = cy;
      // 水平面内的中心也要记下来。
      // 原来只对齐了 Y，相机固定 lookAt(0, ty, 0) —— 一旦模型在 XZ 上偏离原点，
      // 它就会在画面上整体偏移。
      this._centerX = cx;
      this._centerZ = cz;

      this.orbit.targetY = cy;
      return { d: d, center: new THREE.Vector3(cx, cy, cz), pitch: pi, size: size };
    },

    // 采集真实顶点（相对 root，不含 root 自转）与精确包围盒。
    //
    // 为什么不用 Box3.setFromObject：它给的是轴对齐盒，对细长/斜置模型
    // 会虚大很多。取景必须按真实轮廓算，否则永远框不准。
    // 结果缓存，换标本或改变尺寸时才重算 —— 几十万顶点不该每帧遍历。
    _measure() {
      if (this._meas && this._measFor === this.holder) return this._meas;
      if (!this.holder) return null;

      // 暂时清掉自转：否则同一只生物在不同自转相位下会量出不同的包围盒，
      // 取景距离就随自转漂移。
      const saveRot = this.root.rotation.y;
      this.root.rotation.y = 0;
      this.root.updateWorldMatrix(true, true);

      const box = new THREE.Box3();
      const v = new THREE.Vector3();
      const raw = [];
      let count = 0;
      this.holder.traverse((o) => {
        if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
        const pos = o.geometry.attributes.position;
        count += pos.count;
      });
      // 顶点上限 24000：再高的精度对取景没有意义，遍历成本却会变明显
      const stride = Math.max(1, Math.ceil(count / 24000));

      this.holder.traverse((o) => {
        if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
        const pos = o.geometry.attributes.position;
        for (let i = 0; i < pos.count; i += stride) {
          v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
          raw.push(v.x, v.y, v.z);
          box.expandByPoint(v);
        }
      });

      this.root.rotation.y = saveRot;
      this.root.updateWorldMatrix(true, true);

      if (box.isEmpty() || !raw.length) { this._meas = null; return null; }
      // 用顶点包围盒的中心（比 AABB 中心更贴合真实形体）
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const pts = new Float64Array(raw.length);
      for (let i = 0; i < raw.length; i += 3) {
        pts[i] = raw[i] - center.x;
        pts[i + 1] = raw[i + 1] - center.y;
        pts[i + 2] = raw[i + 2] - center.z;
      }

      this._measFor = this.holder;
      this._meas = { center: center, size: size, pts: pts, verts: count };
      return this._meas;
    },

    // 初始俯角：扁平模型必须俯视才看得清结构。
    // 海蜘蛛实测 padT=114 / padB=96、spanY 只有 18.6% —— 因为它几乎是一张
    // 平铺在地面上的薄片，8° 的近水平视角只能看到一条边。
    _pitchFor(size) {
      const horiz = Math.max(size.x, size.z);
      if (horiz <= 0) return 0.14;
      const flat = size.y / horiz;     // 越小越扁
      if (flat < 0.16) return 0.62;    // 极扁（海蜘蛛、海笔底座、盘状）→ 35° 俯视
      if (flat < 0.35) return 0.34;
      return 0.14;                     // 立体感正常，维持低角度以免变形
    },

    resetView(animate) {
      const fit = this.refit();
      if (!fit) return;
      // 初始视角不要正对长边：生物模型多是侧扁的，正对会把「厚度」当成宽度，
      // 看起来又薄又平。0.62 rad 偏一点，能同时看到侧面和体厚的转折。
      // 俯角按体型定，扁平模型必须俯视，否则只能看到一条边。
      this.orbit.yaw = 0.62;
      this.orbit.pitch = fit.pitch;
      this.orbit.dist = fit.d;
      this.orbit.targetY = fit.center.y;
      if (!animate) {
        // 距离直接落位：换标本时不该看到一段"从远处推进来"的动画，
        // 那会让人以为加载慢。yaw/pitch 也一并落位，避免上一只的残留角度。
        this._damp.yaw = this.orbit.yaw;
        this._damp.pitch = this.orbit.pitch;
        this._damp.dist = this.orbit.dist;
      }
      this._needRender = true;
    },

    // ---------------------------------------------------------- 状态
    setStatus(kind, msg) {
      this.status = kind;
      if (this.onStatus) this.onStatus(kind, msg || '');
    },

    fail(reason) {
      this.clear(true);
      this._err = reason;
      this.setStatus('error', reason);
      this._needRender = true;
    },

    // ---------------------------------------------------------- 循环
    start() {
      if (this._raf) return;
      const tick = () => {
        this._raf = requestAnimationFrame(tick);
        if (!this.visible) return;
        // 用真实帧间隔而不是写死 0.016：
        // 写死的话在 144Hz 屏上阻尼会以 2.4 倍速收敛，旋转手感完全不同。
        const now = (performance.now ? performance.now() : Date.now()) / 1000;
        const dt = this._last ? Math.min(0.1, now - this._last) : 0.016;
        this._last = now;
        this._t += dt;
        this.update(dt);
      };
      this._raf = requestAnimationFrame(tick);
    },

    stop() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = 0;
      this._last = 0;
    },

    setVisible(v) {
      this.visible = !!v;
      if (v) { this.start(); this._needRender = true; }
      else {
        // 隐藏时必须真的停掉 rAF。
        // 只在 tick 里 `if (!this.visible) return` 是不够的 —— 那只是空转，
        // 浏览器仍在每帧回调一次（实测关掉抽屉后 _raf 仍是 156，循环还活着）。
        // 抽屉长期关闭时这是纯粹的 CPU 唤醒，笔记本上会一直掉续航。
        this.stop();
      }
    },

    update(dt) {
      if (!this.inited) return;
      dt = dt || 0.016;
      if (this._guard) this._guard();
      const o = this.orbit, d = this._damp;

      // 阻尼：和主控制器同一种指数逼近，手感统一。
      // 8.5 的响应速度对应约 0.12s 到 63%，接近原 k=0.18@60fps 的手感，
      // 但不再随帧率变化。
      const k = 1 - Math.exp(-8.5 * dt);
      d.yaw += (o.yaw - d.yaw) * k;
      d.pitch += (o.pitch - d.pitch) * k;
      d.dist += (o.dist - d.dist) * k;

      const moving = Math.abs(o.yaw - d.yaw) + Math.abs(o.pitch - d.pitch) + Math.abs(o.dist - d.dist) > 1e-4;
      // 静止时不重绘，省掉大量 GPU 时间（抽屉里没动画时没必要 60fps）
      if (!moving && !this._needRender && !this._autoSpin) return;
      this._needRender = false;

      const ty = this.orbit.targetY || 0;
      // 环绕中心用模型自己的包围盒中心，而不是世界原点。
      // 只对齐 Y 的话，模型在 XZ 上偏移多少，画面上就偏多少（实测左右留白 64 vs 131）。
      const tx = this._centerX || 0;
      const tz = this._centerZ || 0;
      const cp = Math.cos(d.pitch), sp = Math.sin(d.pitch);
      this.camera.position.set(
        tx + Math.sin(d.yaw) * cp * d.dist,
        ty + sp * d.dist,
        tz + Math.cos(d.yaw) * cp * d.dist
      );
      this.camera.lookAt(tx, ty, tz);

      // 缓慢自转：只在用户没有操作时转，一上手就停，避免「抓不住」。
      // 按 dt 累加而不是每帧固定增量，否则在 144Hz 屏上转速会是 60Hz 的 2.4 倍。
      if (this._autoSpin && !this._drag) {
        this.root.rotation.y += 0.20 * dt;
      }

      this.renderer.render(this.scene, this.camera);
    },

    setAutoSpin(v) {
      this._autoSpin = !!v;
      this._needRender = true;
      if (v) this.start();
    },

    // 当前标本的真实外接尺寸（米）。UI 用它显示「展示尺寸」，
    // 数据一律来自几何顶点本身，不从配置里读名义值。
    bboxSize() {
      if (!this.holder) return null;
      const m = this._measure();
      if (!m) return null;
      return [m.size.x, m.size.y, m.size.z];
    },

    // 供测试读取当前真实状态
    probe() {
      if (!this.inited) return { inited: false, err: this._err };
      const gl = this.renderer.getContext();
      return {
        inited: true,
        id: this.id,
        status: this.status,
        err: this._err,
        canvas: [this.renderer.domElement.width, this.renderer.domElement.height],
        viewport: [this.container.clientWidth, this.container.clientHeight],
        hasHolder: !!this.holder,
        centerY: this.orbit.targetY,
        centerX: this._centerX,
        centerZ: this._centerZ,
        camPos: this.camera ? this.camera.position.toArray().map((n) => +n.toFixed(3)) : null,
        aspect: this.camera ? +this.camera.aspect.toFixed(3) : null,
        fov: this.camera ? this.camera.fov : null,
        fitDist: +this._fitDist.toFixed(3),
        camDist: +this._damp.dist.toFixed(3),
        glLost: gl ? gl.isContextLost() : null,
        drawCalls: this.renderer.info.render.calls,
        tris: this.renderer.info.render.triangles
      };
    }
  };

  A.Specimen = Specimen;
})();