/* ABYSS — 第一人称六自由度控制 / 探照灯 / 指针锁定与拖拽降级 */
(function () {
  const A = window.ABYSS;
  const { clamp, lerp, smoothstep } = A.util;
  const W = A.WORLD;
  const T = A.terrain;

  const Controls = {
    yaw: 0, pitch: 0,
    vel: new THREE.Vector3(),
    pos: new THREE.Vector3(),
    enabled: true,
    locked: false,
    dragMode: false,
    lampOn: true,
    keys: {},
    _dragging: false,
    _dragMoved: 0,
    _bob: 0,
    _roll: 0,
    _sens: 0.0022,
    _lastHintT: 0,

    init(camera, dom, scene, cb) {
      this.camera = camera;
      this.dom = dom;
      this.scene = scene;
      this.cb = cb || {};

      this.yaw = W.start.yaw;
      this.pitch = W.start.pitch;
      this.pos.set(W.start.x, -W.start.depth, W.start.z);

      camera.fov = 68;
      camera.near = 0.1;
      camera.far = 900;
      camera.rotation.order = 'YXZ';
      camera.position.copy(this.pos);
      camera.rotation.set(this.pitch, this.yaw, 0);

      this.buildLamp();

      window.addEventListener('keydown', (e) => this.onKeyDown(e));
      window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
      window.addEventListener('blur', () => { this.keys = {}; });

      dom.addEventListener('mousedown', (e) => this.onMouseDown(e));
      window.addEventListener('mousemove', (e) => this.onMouseMove(e));
      window.addEventListener('mouseup', (e) => this.onMouseUp(e));

      document.addEventListener('pointerlockchange', () => {
        this.locked = document.pointerLockElement === dom;
        if (this.cb.onLockChange) this.cb.onLockChange(this.locked);
      });
      document.addEventListener('pointerlockerror', () => {
        this.locked = false;
        this.dragMode = true;
        if (this.cb.onLockChange) this.cb.onLockChange(false, true);
      });
    },

    requestLock() {
      if (this.locked) return;
      try {
        const p = this.dom.requestPointerLock();
        if (p && p.catch) p.catch(() => { this.dragMode = true; });
      } catch (e) {
        this.dragMode = true;
        if (this.cb.onLockChange) this.cb.onLockChange(false, true);
      }
    },

    exitLock() {
      if (document.pointerLockElement) document.exitPointerLock();
    },

    setEnabled(v) {
      this.enabled = v;
      if (!v) this.keys = {};
    },

    buildLamp() {
      const spot = new THREE.SpotLight(0xfff2e0, 1.55, 105, 0.54, 0.72, 1.28);
      spot.position.set(0, 0, 0);
      this.scene.add(spot);
      this.spot = spot;
      this.spotTarget = new THREE.Object3D();
      this.scene.add(this.spotTarget);
      spot.target = this.spotTarget;

      // 体积光锥（两层）
      const mkCone = (radius, len, opacity) => {
        const geo = new THREE.ConeGeometry(radius, len, 30, 1, true);
        geo.translate(0, -len / 2, 0);
        geo.rotateX(Math.PI / 2);
        const mat = new THREE.ShaderMaterial({
          uniforms: {
            uColor: { value: new THREE.Color(0xbfe6ff) },
            uOpacity: { value: opacity },
            uLen: { value: len }
          },
          vertexShader: `
            varying float vFade; varying vec3 vN; varying vec3 vV;
            void main() {
              vFade = clamp(-position.z / 1.0, 0.0, 1000.0);
              vN = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vV = -mv.xyz;
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: `
            uniform vec3 uColor; uniform float uOpacity; uniform float uLen;
            varying float vFade; varying vec3 vN; varying vec3 vV;
            void main() {
              float t = clamp(vFade / uLen, 0.0, 1.0);
              float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
              float a = pow(f, 1.7) * smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.5, 1.0, t));
              gl_FragColor = vec4(uColor, a * uOpacity);
            }`,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          fog: false
        });
        const m = new THREE.Mesh(geo, mat);
        m.frustumCulled = false;
        m.renderOrder = 6;
        m.position.z = -0.4;
        return m;
      };
      this.beamInner = mkCone(7.5, 30, 0.16);
      this.beamOuter = mkCone(21, 88, 0.075);
      // 体积光锥以粒子受光表现，不使用几何锥体（避免侧视时的圆环伪影）
      this.beamInner.visible = false;
      this.beamOuter.visible = false;
    },

    setLamp(on) {
      this.lampOn = on;
      this.spot.visible = on;
      if (A.World) A.World.setLamp(on);
      if (this.cb.onLamp) this.cb.onLamp(on);
    },

    toggleLamp() { this.setLamp(!this.lampOn); },

    onKeyDown(e) {
      if (e.code === 'Escape') {
        if (this.cb.onEscape) this.cb.onEscape();
        return;
      }
      const c = e.code;
      if (c === 'KeyL') {
        if (this.cb.onLog) this.cb.onLog();
        e.preventDefault();
        return;
      }
      if (!this.enabled) return;
      if (c === 'KeyF') {
        this.toggleLamp();
        e.preventDefault();
        return;
      }
      if (c === 'Space' || c === 'ArrowUp' || c === 'ArrowDown' ||
        c === 'KeyW' || c === 'KeyA' || c === 'KeyS' || c === 'KeyD') {
        e.preventDefault();
      }
      this.keys[c] = true;
    },

    onMouseDown(e) {
      if (!this.enabled) return;
      if (this.locked) {
        if (e.button === 0 && this.cb.onSelect) this.cb.onSelect(null);
        return;
      }
      if (e.button === 0) {
        this._dragging = true;
        this._dragMoved = 0;
      }
    },

    onMouseMove(e) {
      if (!this.enabled) return;
      if (this.locked) {
        this.yaw -= e.movementX * this._sens;
        this.pitch -= e.movementY * this._sens;
        this.pitch = clamp(this.pitch, -1.45, 1.45);
        return;
      }
      if (this._dragging) {
        this._dragMoved += Math.abs(e.movementX) + Math.abs(e.movementY);
        this.yaw -= e.movementX * this._sens * 0.85;
        this.pitch -= e.movementY * this._sens * 0.85;
        this.pitch = clamp(this.pitch, -1.45, 1.45);
      }
    },

    onMouseUp(e) {
      if (!this.enabled) return;
      if (this.locked) return;
      if (this._dragging && e.button === 0) {
        this._dragging = false;
        if (this._dragMoved < 7 && this.cb.onSelect) {
          this.cb.onSelect({ x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1 });
        }
      }
    },

    update(dt) {
      const cam = this.camera;
      // ---- 输入方向
      let fwd = 0, side = 0, vert = 0;
      if (this.enabled) {
        if (this.keys.KeyW || this.keys.ArrowUp) fwd += 1;
        if (this.keys.KeyS || this.keys.ArrowDown) fwd -= 1;
        if (this.keys.KeyA || this.keys.ArrowLeft) side -= 1;
        if (this.keys.KeyD || this.keys.ArrowRight) side += 1;
        if (this.keys.Space) vert += 1;
        if (this.keys.KeyC || this.keys.ShiftLeft || this.keys.ShiftRight) vert -= 1;
      }

      const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
      // 前方（水平投影）
      const fx = -sy, fz = -cy;
      const rx = cy, rz = -sy;

      // ---- 速度
      // 从 Speed 模块读，不再硬编码。
      // 注意：阻尼系数 k 也要跟着速度一起放大，否则把速度调到 2.6 倍后，
      // 加速阶段会明显变钝（目标速度高了，但逼近速率没变），
      // 表现为「按下去要等半秒才走起来」，那就不算真的变快。
      const mul = (A.Speed && A.Speed.mul) || 1;
      const hSpeed = (A.Speed ? A.Speed.hSpeed() : 10.5);
      const vSpeed = (A.Speed ? A.Speed.vSpeed() : 7.0);
      const desired = this._desired || (this._desired = new THREE.Vector3());
      desired.set(fx * fwd + rx * side, 0, fz * fwd + rz * side);
      if (desired.lengthSq() > 0) desired.normalize().multiplyScalar(hSpeed);
      desired.y = vert * vSpeed;
      if (vert !== 0 && (fwd !== 0 || side !== 0)) desired.multiplyScalar(0.78);

      // 阻尼加速。基准 5.2 对应 1.0 倍；乘以 sqrt(mul) 而不是 mul：
      // 线性放大阻尼会让高速档几乎没有滑行感，手感变成"瞬移"。
      //
      // 但 sqrt 不能一路往下压：0.4 倍时 resp 只有 3.29（时间常数 0.30s），
      // 按下去要等将近一秒才走起来，慢速档的"精细定位"就变成了"反应迟钝"。
      // 实测 0.4 倍在 2.6s 窗口内仍未进入匀速，误差 24.8%。
      // 所以给响应速度设一个下限 4.6：慢速时仍然跟手，只是目标速度低。
      const resp = Math.max(4.6, 5.2 * Math.sqrt(mul));
      const k = 1 - Math.exp(-resp * dt);
      this.vel.lerp(desired, k);
      if (this.vel.lengthSq() < 1e-4) this.vel.set(0, 0, 0);

      this.pos.addScaledVector(this.vel, dt);

      // ---- 边界
      const rad = Math.hypot(this.pos.x, this.pos.z);
      if (rad > W.playRadius) {
        const s = W.playRadius / rad;
        this.pos.x *= s; this.pos.z *= s;
        this.vel.multiplyScalar(0.6);
        this.hint('boundary');
      }
      const depthNow = -this.pos.y;
      if (depthNow < W.minDepth) {
        this.pos.y = -W.minDepth;
        if (this.vel.y > 0) this.vel.y = 0;
        this.hint('boundary');
      } else if (depthNow > W.maxDepth) {
        this.pos.y = -W.maxDepth;
        if (this.vel.y < 0) this.vel.y = 0;
        this.hint('boundary');
      }

      // ---- 地形碰撞（保持离底高度）
      const groundY = -T.depth(this.pos.x, this.pos.z);
      const minY = groundY + 4.2;
      if (this.pos.y < minY) {
        this.pos.y = lerp(this.pos.y, minY, 1 - Math.exp(-9 * dt));
        if (this.vel.y < 0) this.vel.y *= 0.2;
      }

      // ---- 镜头微动
      const speed = this.vel.length();
      // 频率随速度上升，但要封顶：
      // 2.6 倍速下 vel 可达 27 m/s，若频率线性跟到 7.3 rad/s，
      // 画面会变成大约每秒 1.2 次的明显晃动，看着晕。封在 3.6 附近。
      this._bob += dt * Math.min(3.6, 1.4 + speed * 0.22);
      const bobY = Math.sin(this._bob * 2.1) * 0.045 * Math.min(1, speed / 6);
      const bobX = Math.sin(this._bob * 1.15) * 0.03 * Math.min(1, speed / 6);
      this._roll = lerp(this._roll, -side * 0.028, 1 - Math.exp(-4 * dt));

      cam.position.set(this.pos.x + bobX * Math.cos(this.yaw), this.pos.y + bobY, this.pos.z - bobX * Math.sin(this.yaw));
      cam.rotation.set(this.pitch, this.yaw, this._roll);

      // ---- 探照灯
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion);
      this.spot.position.copy(cam.position);
      this.spotTarget.position.copy(cam.position).addScaledVector(dir, 40);
      this.spotTarget.updateMatrixWorld();
      this.spot.intensity = this.lampOn ? 1.55 : 0;
    },

    hint(kind) {
      const now = performance.now();
      if (now - this._lastHintT < 2600) return;
      this._lastHintT = now;
      if (this.cb.onHint) this.cb.onHint(kind);
    },

    getDepth() { return -this.pos.y; },
    getZone() {
      const d = this.getDepth();
      if (d < 450) return 'crest';
      if (d < 700) return 'flank';
      if (d < 880) return 'plain';
      return 'canyon';
    }
  };

  A.Controls = Controls;
})();
