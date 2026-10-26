/* ABYSS — 装配与主循环 */
(function () {
  const A = window.ABYSS;
  const I = A.I18n;
  const { clamp } = A.util;

  const canvas = document.getElementById('scene');
  const bootParams = new URLSearchParams(location.search);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    stencil: false,
    preserveDrawingBuffer: bootParams.has('pb')
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 900);
  scene.add(camera);

  const raycaster = new THREE.Raycaster();
  const tmpV = new THREE.Vector3();
  const ndcCenter = new THREE.Vector2(0, 0);
  let mouseNdc = new THREE.Vector2(0, 0);

  let ui, controls, t = 0, last = performance.now(), frameN = 0;
  let hoverAgent = null, hoverDist = 0;

  const SEEK_RANGE = 62;

  // ------------------------------------------------------------ 初始化
  let booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    I.init();
    if (bootParams.get('lang') === 'en' || bootParams.get('lang') === 'zh') I.set(bootParams.get('lang'));
    ui = A.UIManager;
    ui.init({
      onEnter: enterDive,
      onLang: () => { ui.setLamp(controls ? controls.lampOn : true); },
      onLampToggle: () => { if (controls) { controls.toggleLamp(); } },
      onResume: () => { if (controls) controls.requestLock(); },
      onPanelClose: () => {
        if (!controls) return;
        controls.setEnabled(true);
        if (!controls.dragMode && !controls.locked) ui.showResume(true);
      },
      onOpenFromLog: () => { if (controls) { controls.setEnabled(false); controls.exitLock(); } }
    });

    controls = A.Controls;
    controls.init(camera, canvas, scene, {
      onSelect: onSelect,
      onEscape: onEscape,
      onLog: () => {
        ui.toggleLog();
        if (ui.panel) {
          controls.setEnabled(false);
          controls.exitLock();
        } else {
          controls.setEnabled(true);
          if (!controls.dragMode && !controls.locked) ui.showResume(true);
        }
      },
      onLamp: (on) => {
        ui.setLamp(on);
        ui.toast(I.t(on ? 'toast.lampOn' : 'toast.lampOff'), 1400);
      },
      onHint: (kind) => {
        if (kind === 'boundary') ui.toast(I.t('toast.boundary'), 1600);
      },
      onLockChange: (locked, dragMode) => {
        ui.setLocked(locked, dragMode);
        if (locked) ui.showResume(false);
      }
    });
    ui.setLamp(true);
    ui.setLocked(false, false);

    // 加载：分帧构建，避免白屏
    ui.setProgress(0.04, 'load.generating');
    setTimeout(() => {
      console.log('[abyss] world start');
      A.World.init(scene, renderer, camera);
      A.__controls = controls; A.__camera = camera; A.__renderer = renderer; A.__scene = scene;
      console.log('[abyss] world done');
      ui.setProgress(0.46, 'load.generating');
      setTimeout(() => {
        console.log('[abyss] creatures start');
        A.Models.preload(function (d, total) {
          ui.setProgress(0.46 + 0.28 * (d / total), 'load.placing');
        }).then(function () {
          A.Creatures.init(scene);
          console.log('[abyss] creatures done ' + A.Creatures.list.length);
          ui.setProgress(0.78, 'load.placing');
          setTimeout(function () {
            ui.setProgress(0.92, 'load.placing');
          // 预编译着色器，避免入场卡顿
          console.log('[abyss] compile start');
          try { renderer.compile(scene, camera); } catch (e) { console.log('[abyss] compile err ' + e.message); }
          console.log('[abyss] compile done');
          ui.setProgress(1, 'load.ready');
          ui.enableEnter(true);
          started = true;
          if (window.__abyssCam) {
            const p = window.__abyssCam.split(',').map(Number);
            // cam=x,z,depth,yaw,pitch
            // depth 为 0 时改用 ?above= 指定的「相对海床高度」，
            // 因为绝对深度写死会和地形对不上，相机会悬在空水里。
            const above = parseFloat(params.get('above'));
            let depth = p[2];
            if (!depth && !isNaN(above)) {
              depth = A.terrain.depth(p[0], p[1]) - above;
            }
            controls.pos.set(p[0], -depth, p[1]);
            controls.yaw = p[3];
            controls.pitch = p[4];
          }
          if (window.__abyssStill) {
            onResize();
            // 静态帧模式：用于自动化视觉检查（软件渲染下避免长时间循环）
            document.body.setAttribute('data-stage', 'a');
            t = parseFloat(window.__abyssStill) || 3.0;
            enterDive();
            document.body.setAttribute('data-stage', 'b');
            controls.setEnabled(true);
            controls.update(0.016);
            A.World.update(0.016, camera, controls.getDepth(), controls.lampOn);
            A.Creatures.tick(t);
      if (A.Models && A.Models.tick) A.Models.tick(t);
            A.Creatures.update(t, 0.016, camera);
            A.Creatures.updateLights(t, camera);
            ui.updateHUD(controls.getDepth(), controls.getZone());
            if (params.has('flat')) {
              A.Creatures.list.forEach(function (a) {
                if (a.mesh) a.mesh.material = new THREE.MeshBasicMaterial({ color: 0xff2f6a });
              });
            }
            if (params.has('probe')) {
              const probe = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff3366 }));
              probe.position.copy(camera.position).add(new THREE.Vector3(0, 0, -20).applyQuaternion(camera.quaternion));
              scene.add(probe);
              const px = new Uint8Array(4);
              renderer.render(scene, camera);
              const gl = renderer.getContext();
              gl.readPixels(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
              document.body.setAttribute('data-pixel', Array.from(px).join(','));
            }
            if (params.has('gallery')) {
              const sps = A.SPECIES;
              const cols = 5, gap = 4.2;
              sps.forEach(function (sp, i) {
                const preset = A.__presets && A.__presets[sp.id];
                let built = A.Creatures.geoms[sp.model.key];
                if (preset && A.__generic[preset.b]) built = A.__generic[preset.b](preset.p);
                if (!built) return;
                const mesh = A.Creatures._makeMesh(sp, built, 1);
                const col = i % cols, row = Math.floor(i / cols);
                mesh.position.set((col - (cols - 1) / 2) * gap, -row * gap, 0);
                mesh.rotation.y = 0.6;
                scene.add(mesh);
              });
              const camY = parseFloat(params.get('gy') || '0');
              camera.position.set(0, camY, 13.5);
              camera.lookAt(0, camY, 0);
              const dirv = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
              controls.spot.position.copy(camera.position);
              controls.spotTarget.position.copy(camera.position).addScaledVector(dirv, 24);
              controls.spotTarget.updateMatrixWorld();
              controls.spot.intensity = 5.5;
              if (A.World.hemi) A.World.hemi.intensity = 2.6;
            }
            document.body.setAttribute('data-stage', 'c');
            renderer.render(scene, camera);
            document.body.setAttribute('data-stage', 'd');
            if (params.has('codex')) {
              var cid = params.get('codex') || 'chauliodus-sloani';
              ui.found.add(cid); ui.refreshCounts();
              ui.openCodex(cid, true);
              controls.setEnabled(false);
            }
            if (params.has('log')) { ui.toggleLog(); controls.setEnabled(false); }
            document.body.setAttribute('data-still', 'ready');
            if (params.has('shot')) {
              try { document.body.setAttribute('data-png', renderer.domElement.toDataURL('image/png')); } catch (e) { }
            }
            document.body.setAttribute('data-info', JSON.stringify({
              calls: renderer.info.render.calls,
              tris: renderer.info.render.triangles,
              children: scene.children.length,
              cam: camera.position.toArray().map(function (n) { return Math.round(n); }),
              canvas: [canvas.width, canvas.height],
              errs: (window.__abyssErrors || []).slice(0, 3),
              geoR: (function () {
                var o = {};
                Object.keys(A.Creatures.geoms).forEach(function (k) {
                  var g = A.Creatures.geoms[k].geo;
                  o[k] = g.boundingSphere ? +g.boundingSphere.radius.toFixed(2) : -1;
                });
                return o;
              })(),
              fishDbg: (function () {
                var f = A.Creatures.list.filter(function (a) { return a.speciesId === 'chauliodus-sloani'; })[0];
                if (!f) return null;
                var d = f.group.position.distanceTo(camera.position);
                var px = (1.69 / d) * (window.innerHeight / 2) / Math.tan(camera.fov * 0.5 * Math.PI / 180) * 2;
                return { cam: camera.position.toArray().map(Math.round), fish: f.group.position.toArray().map(Math.round), d: +d.toFixed(1), px: Math.round(px), scale: +f.mesh.scale.x.toFixed(2) };
              })(),
              pickCenter: (function () {
                var h = pick(null);
                return h ? { id: h.speciesId, d: Math.round(h.dist) } : null;
              })(),
              meshScale: (function () {
                var f = A.Creatures.list.filter(function (a) { return a.speciesId === 'chauliodus-sloani'; })[0];
                return f ? f.mesh.scale.x : -1;
              })(),
              first: (function () {
                var seen = {}, out = {};
                A.Creatures.list.forEach(function (a) {
                  if (!seen[a.speciesId]) { seen[a.speciesId] = 1; out[a.speciesId] = a.group.position.toArray().map(function (n) { return Math.round(n); }); }
                });
                return out;
              })(),
              near: A.Creatures.list
                .map(function (a) { return { id: a.speciesId, p: a.group.position.toArray().map(function (n) { return Math.round(n); }), d: Math.round(a.group.position.distanceTo(camera.position)) }; })
                .sort(function (x, y) { return x.d - y.d; }).slice(0, 6)
            }));
            return;
          }
          requestAnimationFrame(loop);
          if (window.__abyssAuto) setTimeout(enterDive, 120);
          }, 40);
        });
      }, 40);
    }, 60);
  }

  let started = false;
  let entered = false;

  function enterDive() {
    if (!started) return;
    entered = true;
    ui.hideStart();
    controls.setEnabled(true);
    controls.requestLock();
    // 首次点击时给一次定位提示
    setTimeout(() => {
      if (controls.dragMode) ui.toast(I.t('drag.hint'), 4200);
    }, 400);
  }

  // ------------------------------------------------------------ 交互
  function onEscape() {
    if (ui.panel) {
      ui.closePanel();
      return;
    }
    if (controls.locked) {
      controls.exitLock();
      ui.showResume(true);
    } else if (!controls.dragMode) {
      ui.showResume(true);
    }
  }

  function onSelect(ndc) {
    if (!entered) return;
    if (ui.panel) return;
    if (ndc) mouseNdc.set(ndc.x, ndc.y);
    const hit = pick(ndc || null);
    if (!hit) return;
    if (hit.dist > SEEK_RANGE) {
      ui.toast(I.t('toast.toofar'), 1800);
      return;
    }
    const id = hit.speciesId;
    const isNew = !ui.found.has(id);
    if (isNew) {
      ui.found.add(id);
      ui.saveFound();
      ui.refreshCounts();
      const sp = A.SPECIES_BY_ID[id];
      ui.toast(I.t('toast.discovered', { name: I.f(sp.name) }), 2400);
    }
    ui.openCodex(id, isNew);
    controls.setEnabled(false);
    controls.exitLock();
    ui.showResume(false);
  }

  function pick(ndc) {
    const list = A.Creatures.proxies;
    if (!list || !list.length) return null;
    if (ndc) raycaster.setFromCamera(ndc, camera);
    else raycaster.setFromCamera(ndcCenter, camera);
    const hits = raycaster.intersectObjects(list, false);
    if (!hits.length) return null;
    const h = hits[0];
    return { speciesId: h.object.userData.speciesId, dist: h.distance, object: h.object };
  }

  function updateHover() {
    if (!entered || ui.panel) {
      ui.setReticleActive(false);
      ui.setBracket(false);
      ui.showTicker(null);
      hoverAgent = null;
      return;
    }
    const ndc = controls.locked ? ndcCenter : mouseNdc;
    const hit = pick(controls.locked ? null : ndc);
    if (hit && hit.dist <= SEEK_RANGE) {
      ui.setReticleActive(true);
      // 底部提示条：告诉观者「准星上是什么」，不必先点开图鉴
      ui.showTicker(hit.speciesId);
      hoverDist = hit.dist;
      // 屏幕投影，绘制目标括号
      hit.object.getWorldPosition(tmpV);
      const dist = tmpV.distanceTo(camera.position);
      tmpV.project(camera);
      const w = window.innerWidth, h = window.innerHeight;
      const sx = (tmpV.x * 0.5 + 0.5) * w;
      const sy = (-tmpV.y * 0.5 + 0.5) * h;
      const r = hit.object.userData.radius || 1;
      const sr = (r / Math.max(dist, 0.5)) * (h * 0.5) / Math.tan((camera.fov * 0.5) * Math.PI / 180);
      const size = clamp(sr * 2.2, 26, Math.min(w, h) * 0.55);
      ui.setBracket(true, sx, sy, size, dist);
    } else {
      ui.setReticleActive(!!hit);
      ui.setBracket(false);
      ui.showTicker(null);
    }
  }

  // 鼠标在非锁定状态下的位置（用于悬停）
  window.addEventListener('mousemove', (e) => {
    mouseNdc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  });

  // ------------------------------------------------------------ 主循环
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    if (controls) {
      controls.update(dt);
      const depth = controls.getDepth();
      A.World.update(dt, camera, depth, controls.lampOn);
      A.Creatures.tick(t);
      if (A.Models && A.Models.tick) A.Models.tick(t);
      A.Creatures.update(t, dt, camera);
      A.Creatures.updateLights(t, camera);
      ui.updateHUD(depth, controls.getZone());
    }

    frameN++;
    if (frameN % 3 === 0) updateHover();

    renderer.render(scene, camera);
  }

  // ------------------------------------------------------------ 尺寸
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
  window.addEventListener('resize', onResize);

  // 语言切换后刷新 HUD 静态文本
  document.addEventListener('abyss:lang', () => { });

  // 调试：?auto=1 自动进入，?cam=x,z,depth,yaw,pitch 指定初始机位
  const params = new URLSearchParams(location.search);
  window.__abyssAuto = params.has('auto');
  window.__abyssCam = params.get('cam');
  window.__abyssStill = params.get('still');

  // 供自动化探针使用的调试引用（不影响运行）
  if (params.has('debug')) {
    window.__abyssDebug = true;
  }

  window.addEventListener('load', boot);
  if (document.readyState === 'complete') boot();
})();
