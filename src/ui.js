/* ABYSS — 界面控制：HUD / 图鉴 / 探索记录 / 语言 / 提示 */
(function () {
  const A = window.ABYSS;
  const I = A.I18n;
  const { clamp, lerp } = A.util;

  const D_MIN = 300, D_MAX = 1150;

  const UI = {
    found: new Set(),
    currentId: null,
    panel: null, // 'codex' | 'log' | null
    _toastT: 0,
    _isNew: false,
    _keysOpen: true,

    init(cb) {
      this.cb = cb || {};
      const $ = (id) => document.getElementById(id);
      this.el = {
        hud: $('hud'), depth: $('depthVal'), zone: $('zoneVal'),
        temp: $('tempVal'), pres: $('presVal'),
        rulerMarker: $('rulerMarker'), rulerDepth: $('rulerDepth'), rulerTicks: $('rulerTicks'),
        logBtn: $('logBtn'), logCount: $('logCount'), foundVal: $('foundVal'),
        foundTotal: $('foundTotal'), logProgressTotal: $('logProgressTotal'),
        lampBtn: $('lampBtn'), lampVal: $('lampVal'),
        reticle: $('reticle'), bracket: $('bracket'), bracketDist: $('bracketDist'),
        codex: $('codex'), logPanel: $('logPanel'), logList: $('logList'),
        logProgress: $('logProgress'),
        scrim: $('scrim'), toast: $('toast'),
        start: $('start'), resume: $('resume'), dragHint: $('dragHint'),
        startLoad: $('startLoad'), loadBar: $('loadBar'), loadText: $('loadText'),
        enterBtn: $('enterBtn'),
        keys: $('keysPanel'), keysToggle: $('keysToggle'),
        ticker: $('ticker'), tkIdx: $('tkIdx'), tkCn: $('tkCn'), tkLatin: $('tkLatin'),

        // 图鉴字段：编号 / 名字 / 学名 / 纲科 / 深度 / 体型 / 发光 / 正文
        cxNo: $('cxNo'), cxTotal: $('cxTotal'),
        cxName: $('cxName'), cxEn: $('cxEn'), cxLatin: $('cxLatin'),
        cxOrder: $('cxOrder'), cxFamily: $('cxFamily'),
        cxDepth: $('cxDepth'), cxSize: $('cxSize'), cxBiolum: $('cxBiolum'),
        cxHabitat: $('cxHabitat'), cxMorph: $('cxMorph'), cxEco: $('cxEco'),
        cxNote: $('cxNote'), cxBand: $('cxBand'), cxMark: $('cxMark'), cxTicks: $('cxTicks'),
        cxNew: $('cxNew'), cxPrev: $('cxPrev'), cxNext: $('cxNext'),

        // 标本查看器
        spec: $('spec'), specView: $('specView'), specState: $('specState'),
        specStateText: $('specStateText'), specHint: $('specHint'),
        specSpin: $('specSpin'), specReset: $('specReset'),
        specMeta: $('specMeta'), specScale: $('specScale'),

        // 移动速度
        speedCtl: $('speedCtl'), speedToggle: $('speedToggle'),
        speedRange: $('speedRange'), speedVal: $('speedVal'), speedBody: $('speedBody')
      };

      this.el.cxTotal.textContent = String(A.SPECIES.length).padStart(2, '0');
      if (this.el.foundTotal) this.el.foundTotal.textContent = A.SPECIES.length;
      if (this.el.logProgressTotal) this.el.logProgressTotal.textContent = '/ ' + A.SPECIES.length;

      this.loadFound();
      this.buildRuler();
      this.buildGaugeTicks();
      this.bind();
      this.initSpecimen();
      this.initSpeed();
      this.applyLang();
      this.refreshCounts();
      this.renderLog();
    },

    // ---------------------------------------------------------- 标本查看器
    initSpecimen() {
      const S = A.Specimen;
      if (!S) return;
      // 容器此刻可能还没布局（抽屉是 translateX 隐藏的，clientWidth 为 0），
      // 所以初始化失败也不报错，等真正 openCodex 时再试一次。
      const ok = S.init(this.el.specView);
      S.onStatus = (kind, reason) => this.setSpecStatus(kind, reason);
      if (!ok) {
        this.setSpecStatus('error', S._err === 'webgl' ? 'webgl' : 'no-data');
        return;
      }
      this.el.specSpin.addEventListener('click', () => {
        const on = this.el.specSpin.getAttribute('aria-pressed') !== 'true';
        this.el.specSpin.setAttribute('aria-pressed', on ? 'true' : 'false');
        S.setAutoSpin(on);
      });
      this.el.specReset.addEventListener('click', () => S.resetView(true));
    },

    setSpecStatus(kind, reason) {
      const st = this.el.specState;
      st.setAttribute('data-state', kind);
      if (kind === 'error') {
        st.classList.add('is-error');
        // 失败必须给出可读原因，不能留空
        this.el.specStateText.textContent = I.t('spec.fail.' + reason) || I.t('spec.loading');
      } else if (kind === 'loading') {
        st.classList.remove('is-error');
        this.el.specStateText.textContent = I.t('spec.loading');
      } else {
        st.classList.remove('is-error');
      }
      // 只有 ready 才隐藏状态层、显示操作提示
      st.classList.toggle('is-hidden', kind === 'ready');
      this.el.specHint.classList.toggle('is-hidden', kind !== 'ready');
    },

    // ---------------------------------------------------------- 移动速度
    initSpeed() {
      const Sp = A.Speed;
      if (!Sp) return;
      Sp.init();

      const sync = () => {
        const mul = Sp.mul;
        this.el.speedVal.textContent = mul.toFixed(2) + '×';
        this.el.speedRange.value = String(mul);
        // 预设按钮高亮：只有倍率确实等于某一档才点亮，否则三档全灭，
        // 这样「手动拖到 1.37」不会错误地显示成「正常」
        this.el.speedCtl.querySelectorAll('[data-speed]').forEach((b) => {
          b.classList.toggle('on', b.getAttribute('data-speed') === Sp.preset);
        });
        this.el.speedCtl.setAttribute('data-preset', Sp.preset);
      };

      this.el.speedRange.addEventListener('input', () => {
        Sp.set(parseFloat(this.el.speedRange.value));
        sync();
      });
      this.el.speedCtl.querySelectorAll('[data-speed]').forEach((b) => {
        b.addEventListener('click', () => {
          const p = Sp.PRESETS[b.getAttribute('data-speed')];
          if (!p) return;
          Sp.set(p.mul);
          sync();
        });
      });
      this.el.speedToggle.addEventListener('click', () => {
        const open = this.el.speedToggle.getAttribute('aria-expanded') === 'true';
        this.el.speedToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        this.el.speedBody.classList.toggle('is-collapsed', open);
      });

      this._syncSpeed = sync;
      sync();
      // 订阅变化：任何来源改动倍率都要反映到界面上。
      // 之前只有 input / click 两个入口主动调 sync()，从别处调 Speed.set()
      // 界面就停在旧值 —— 实测 mul 已是 1.37，右下角还写着 1.00×。
      Sp.onChange(() => sync());
    },

    loadFound() {
      try {
        const raw = localStorage.getItem(A.STORE.FOUND);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) arr.forEach((id) => { if (A.SPECIES_BY_ID[id]) this.found.add(id); });
        }
      } catch (e) { }
    },

    saveFound() {
      try { localStorage.setItem(A.STORE.FOUND, JSON.stringify([...this.found])); } catch (e) { }
    },

    bind() {
      const $ = (id) => document.getElementById(id);

      document.querySelectorAll('[data-lang]').forEach((b) => {
        b.addEventListener('click', () => {
          this.setLang(b.getAttribute('data-lang'));
          if (this.cb.onLang) this.cb.onLang();
        });
      });

      this.el.logBtn.addEventListener('click', () => this.toggleLog());
      this.el.lampBtn.addEventListener('click', () => { if (this.cb.onLampToggle) this.cb.onLampToggle(); });
      $('cxClose').addEventListener('click', () => this.closePanel());
      $('logClose').addEventListener('click', () => this.closePanel());
      this.el.resume.addEventListener('click', () => { if (this.cb.onResume) this.cb.onResume(); });
      this.el.enterBtn.addEventListener('click', () => { if (this.cb.onEnter) this.cb.onEnter(); });

      // 上一 / 下一物种：在已发现的物种里循环，避免翻到"未记录"的空条目
      this.el.cxPrev.addEventListener('click', () => this.stepSpecies(-1));
      this.el.cxNext.addEventListener('click', () => this.stepSpecies(1));

      // 操作提示可收起：常驻面板挡视线，收起后只留一个词
      this.el.keysToggle.addEventListener('click', () => {
        this._keysOpen = !this._keysOpen;
        this.el.keys.classList.toggle('is-collapsed', !this._keysOpen);
        this.el.keysToggle.setAttribute('aria-expanded', this._keysOpen ? 'true' : 'false');
      });

      // 面板内部点击不关闭；点击遮罩关闭
      this.el.codex.addEventListener('mousedown', (e) => e.stopPropagation());
      this.el.logPanel.addEventListener('mousedown', (e) => e.stopPropagation());
      this.el.scrim.addEventListener('click', () => this.closePanel());

      // 抽屉内滚动不传播到场景
      this.el.codex.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });

      // 标本区必须完全吃掉指针事件：
      // 否则在标本上拖拽旋转会同时触发主场景的 mousemove → 相机跟着转，
      // 关掉抽屉后观者会发现自己已经漂到别处了。
      if (this.el.spec) {
        ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'mousedown', 'mousemove', 'mouseup', 'dblclick', 'click']
          .forEach((k) => this.el.spec.addEventListener(k, (e) => e.stopPropagation(), { passive: k === 'wheel' }));
      }

      // 键盘：← → 翻物种
      window.addEventListener('keydown', (e) => {
        if (this.panel !== 'codex') return;
        if (e.key === 'ArrowLeft') { e.preventDefault(); this.stepSpecies(-1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); this.stepSpecies(1); }
      });
    },

    // ---------------------------------------------------------- 语言
    setLang(lang) {
      I.set(lang);
      this.applyLang();
      this.refreshCounts();
      this.renderLog();
      if (this.currentId && this.panel === 'codex') this.fillCodex(this.currentId, this._isNew);
    },

    applyLang() {
      document.documentElement.lang = I.lang === 'en' ? 'en' : 'zh-CN';
      document.querySelectorAll('[data-i18n]').forEach((n) => {
        const k = n.getAttribute('data-i18n');
        const s = I.t(k);
        if (s) n.textContent = s;
      });
      document.querySelectorAll('[data-lang]').forEach((b) => {
        b.classList.toggle('on', b.getAttribute('data-lang') === I.lang);
      });
      this.el.lampVal.textContent = I.t('hud.on');
      this.updateZone(this._zone || 'crest');
      // 速度控件的档位文案与提示会随语言变化
      if (this._syncSpeed) this._syncSpeed();
      // 标本区的失败提示是运行时生成的，语言切换后要重刷
      if (A.Specimen && A.Specimen.status) {
        this.setSpecStatus(A.Specimen.status, A.Specimen._err || '');
      } else {
        this.el.specStateText.textContent = I.t('spec.loading');
      }
    },

    // ---------------------------------------------------------- HUD
    buildRuler() {
      const ticks = [
        { d: 300, zone: 'zone.crest' },
        { d: 450, zone: 'zone.flank' },
        { d: 700, zone: 'zone.plain' },
        { d: 880, zone: 'zone.canyon' },
        { d: 1120 }
      ];
      const box = this.el.rulerTicks;
      box.innerHTML = '';
      ticks.forEach((t) => {
        const y = ((t.d - D_MIN) / (D_MAX - D_MIN)) * 100;
        const el = document.createElement('div');
        el.className = 'ruler-tick' + (t.zone ? ' zone' : '');
        el.style.top = y + '%';
        el.innerHTML = '<i></i><span>' + t.d + '</span>';
        box.appendChild(el);
      });
    },

    buildGaugeTicks() {
      const box = this.el.cxTicks;
      box.innerHTML = '';
      [400, 600, 800, 1000].forEach((d) => {
        const y = ((d - D_MIN) / (D_MAX - D_MIN)) * 132;
        const el = document.createElement('div');
        el.className = 'gauge-tick';
        el.style.top = y + 'px';
        el.innerHTML = '<span>' + d + '</span>';
        box.appendChild(el);
      });
    },

    updateHUD(depth, zone) {
      const d = Math.round(depth);
      this.el.depth.textContent = String(d).padStart(4, '0');
      this.el.rulerDepth.textContent = d;
      this.el.rulerMarker.style.top = (((depth - D_MIN) / (D_MAX - D_MIN)) * 100).toFixed(2) + '%';
      this.updateZone(zone);
      const t = lerp(4.4, 1.7, clamp((depth - 300) / 800, 0, 1));
      this.el.temp.textContent = t.toFixed(1);
      this.el.pres.textContent = (1 + depth / 10).toFixed(1);
      if (this.panel === 'codex' && this.currentId) this.updateGaugeMark(depth);
    },

    updateZone(zone) {
      this._zone = zone;
      this.el.zone.textContent = I.t('zone.' + zone);
      this.el.zone.setAttribute('data-zone', zone);
    },

    setLamp(on) {
      this.el.lampBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      this.el.lampVal.textContent = on ? I.t('hud.on') : I.t('hud.off');
    },

    setReticleActive(v) { this.el.reticle.classList.toggle('is-active', !!v); },

    setBracket(on, x, y, size, dist) {
      const b = this.el.bracket;
      if (!on) { b.classList.add('is-hidden'); return; }
      b.classList.remove('is-hidden');
      b.style.transform = 'translate(' + (x - size / 2) + 'px,' + (y - size / 2) + 'px)';
      b.style.width = size + 'px';
      b.style.height = size + 'px';
      this.el.bracketDist.textContent = Math.round(dist) + ' m';
    },

    // 准星掠过时的物种提示条（不打断操作，只说明「这是什么」）
    showTicker(id) {
      const sp = id && A.SPECIES_BY_ID[id];
      const el = this.el.ticker;
      if (!sp) { el.classList.add('is-hidden'); this._tickerId = null; return; }
      if (this._tickerId === id) return;
      this._tickerId = id;
      const other = I.lang === 'zh' ? 'en' : 'zh';
      this.el.tkIdx.textContent = String(sp.index).padStart(2, '0');
      this.el.tkCn.textContent = I.f(sp.name);
      this.el.tkLatin.textContent = sp.latin;
      el.classList.remove('is-hidden');
    },

    refreshCounts() {
      const n = this.found.size;
      this.el.logCount.textContent = n + '/' + A.SPECIES.length;
      this.el.foundVal.textContent = n;
      this.el.logProgress.textContent = n;
    },

    // ---------------------------------------------------------- 图鉴
    openCodex(id, isNew) {
      const sp = A.SPECIES_BY_ID[id];
      if (!sp) return;
      this.currentId = id;
      this._isNew = !!isNew;
      this.fillCodex(id, isNew);
      this.el.codex.classList.add('is-open');
      this.el.codex.setAttribute('aria-hidden', 'false');
      this.el.logPanel.classList.remove('is-open');
      this.el.logPanel.setAttribute('aria-hidden', 'true');
      this.panel = 'codex';
      this.el.scrim.classList.add('is-on');
      // 让 HUD 右下角（速度控件）给抽屉让位。
      // 抽屉宽 460px 固定在右侧，速度控件也在右下 —— 不标记状态就只能互相压。
      // 实测桌面端速度控件底边 698.6、抽屉页脚顶边 690，被盖住 8.6px；
      // 手机竖屏更糟，压掉 10.6px，正好是「下一物种」按钮的下沿。
      document.body.setAttribute('data-panel', 'codex');

      // 展示区此刻才真正有尺寸，必须在这之后初始化 / 重排
      this.showSpecimen(id);
    },

    showSpecimen(id) {
      const S = A.Specimen;
      if (!S) return;
      if (!S.inited) {
        if (!S.init(this.el.specView)) {
          this.setSpecStatus('error', S._err === 'webgl' ? 'webgl' : 'no-data');
          return;
        }
      }
      // 抽屉刚打开，容器尺寸要下一帧才稳定
      requestAnimationFrame(() => {
        S.resize();
        S.setVisible(true);
        S.show(id);
        this.updateSpecMeta(id);
      });
    },

    updateSpecMeta(id) {
      const S = A.Specimen;
      const sp = A.SPECIES_BY_ID[id];
      if (!sp) { this.el.specScale.textContent = '—'; return; }
      const probe = S && S.probe ? S.probe() : null;
      // 展示尺寸取自真实包围盒，不是配置里的名义尺寸 ——
      // 这样观者看到的是「这个模型实际多大」，配置里写错也会立刻暴露
      if (probe && probe.hasHolder) {
        const b = S.bboxSize();
        if (b) {
          this.el.specScale.textContent =
            b.map((n) => (n >= 1 ? n.toFixed(2) : n.toFixed(3))).join(' × ') + ' m';
          return;
        }
      }
      this.el.specScale.textContent = I.f(sp.size) || '—';
    },

    // 翻页：只在「已记录」的物种之间移动。
    // 若只找到一只，则按全表顺序移动（方便浏览），但未记录的仍可查看资料。
    stepSpecies(dir) {
      if (!this.currentId) return;
      const list = A.SPECIES;
      const cur = list.findIndex((s) => s.id === this.currentId);
      if (cur < 0) return;
      const idx = (cur + dir + list.length) % list.length;
      const next = list[idx];
      if (!next) return;
      const isNew = !this.found.has(next.id);
      this.currentId = next.id;
      this._isNew = isNew;
      this.fillCodex(next.id, isNew);
      // 标本必须跟着翻页一起换，否则面板里的模型和文字会对不上
      this.showSpecimen(next.id);
      // 翻页不做整块重绘，只做一次轻微的横向位移，避免"突然跳转"
      const sc = this.el.codex.querySelector('.codex-scroll');
      if (sc) {
        sc.scrollTop = 0;
        sc.animate(
          [{ opacity: 0.35, transform: 'translateX(' + (dir > 0 ? 10 : -10) + 'px)' },
           { opacity: 1, transform: 'translateX(0)' }],
          { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
      }
    },

    fillCodex(id, isNew) {
      const sp = A.SPECIES_BY_ID[id];
      if (!sp) return;
      const other = I.lang === 'zh' ? 'en' : 'zh';

      this.el.cxNo.textContent = String(sp.index).padStart(2, '0');
      this.el.cxName.textContent = I.f(sp.name);
      this.el.cxEn.textContent = sp.name[other] || '';
      this.el.cxLatin.textContent = sp.latin;

      // 分类：taxon 形如「辐鳍鱼纲 · 巨口鱼科」，拆成两栏更易扫读
      const tax = I.f(sp.taxon) || '';
      const parts = tax.split('·');
      this.el.cxOrder.textContent = (parts[0] || '').trim() || '—';
      this.el.cxFamily.textContent = (parts[1] || '').trim() || '—';

      this.el.cxDepth.textContent = sp.depth.min + '–' + sp.depth.max + ' m';
      this.el.cxSize.textContent = I.f(sp.size);
      this.el.cxBiolum.textContent = sp.bioluminescent ? I.t('codex.biolumYes') : I.t('codex.biolumNo');
      this.el.cxHabitat.textContent = I.f(sp.habitat);
      this.el.cxMorph.textContent = I.f(sp.morphology);
      this.el.cxEco.textContent = I.f(sp.ecology);
      this.el.cxNote.textContent = I.f(sp.depth.note);
      this.el.cxNew.classList.toggle('is-on', !!isNew);

      const top = ((sp.depth.min - D_MIN) / (D_MAX - D_MIN)) * 132;
      const bot = ((sp.depth.max - D_MIN) / (D_MAX - D_MIN)) * 132;
      this.el.cxBand.style.top = top + 'px';
      this.el.cxBand.style.height = Math.max(4, bot - top) + 'px';
      this.updateGaugeMark(this._depth || 300);
      this.el.codex.querySelector('.codex-scroll').scrollTop = 0;

      // 首尾不置灰：物种表是环形的，翻一圈会回来
      this.el.cxPrev.disabled = false;
      this.el.cxNext.disabled = false;
    },

    updateGaugeMark(depth) {
      this._depth = depth;
      const y = ((clamp(depth, D_MIN, D_MAX) - D_MIN) / (D_MAX - D_MIN)) * 132;
      this.el.cxMark.style.top = y + 'px';
    },

    // ---------------------------------------------------------- 记录
    toggleLog() {
      if (this.panel === 'log') { this.closePanel(); return; }
      this.renderLog();
      this.el.logPanel.classList.add('is-open');
      this.el.logPanel.setAttribute('aria-hidden', 'false');
      this.el.codex.classList.remove('is-open');
      this.el.codex.setAttribute('aria-hidden', 'true');
      this.panel = 'log';
      this.el.scrim.classList.add('is-on');
    },

    renderLog() {
      const list = this.el.logList;
      if (!list) return;
      list.innerHTML = '';
      const other = I.lang === 'zh' ? 'en' : 'zh';
      A.SPECIES.forEach((sp) => {
        const found = this.found.has(sp.id);
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'log-item ' + (found ? 'is-found' : 'is-locked');
        const num = String(sp.index).padStart(2, '0');
        if (found) {
          item.innerHTML =
            '<span class="log-num">' + num + '</span>' +
            '<span class="log-texts">' +
            '<span class="log-zh">' + I.f(sp.name) + '</span>' +
            '<span class="log-en">' + (sp.name[other] || '') + '</span>' +
            '<span class="log-latin">' + sp.latin + '</span>' +
            '</span><span class="log-dot"></span>';
          item.addEventListener('click', () => {
            this.openCodex(sp.id, false);
            if (this.cb.onOpenFromLog) this.cb.onOpenFromLog();
          });
        } else {
          item.innerHTML =
            '<span class="log-num">' + num + '</span>' +
            '<span class="log-texts">' +
            '<span class="log-zh">' + I.t('log.locked') + '</span>' +
            '<span class="log-en">' + sp.depth.min + '–' + sp.depth.max + ' m · ' + I.t('log.lockedHint') + '</span>' +
            '</span><span class="log-dot"></span>';
        }
        list.appendChild(item);
      });
    },

    closePanel() {
      this.el.codex.classList.remove('is-open');
      this.el.codex.setAttribute('aria-hidden', 'true');
      this.el.logPanel.classList.remove('is-open');
      this.el.logPanel.setAttribute('aria-hidden', 'true');
      this.el.scrim.classList.remove('is-on');
      this.panel = null;
      document.body.removeAttribute('data-panel');
      // 关闭时停止渲染循环并释放展示副本：
      // 抽屉隐藏后继续跑 requestAnimationFrame 是纯浪费，而且 WebGL 上下文
      // 数量有上限（浏览器通常 8–16 个），长期挂着没必要。
      // 注意只是从场景里摘掉节点，共享的 geometry / material 保持不动。
      if (A.Specimen && A.Specimen.inited) {
        A.Specimen.setVisible(false);
        A.Specimen.clear();
      }
      if (this.cb.onPanelClose) this.cb.onPanelClose();
    },

    // ---------------------------------------------------------- 提示
    toast(text, ms) {
      const el = this.el.toast;
      el.textContent = text;
      el.classList.add('is-on');
      clearTimeout(this._toastT);
      this._toastT = setTimeout(() => el.classList.remove('is-on'), ms || 2600);
    },

    // ---------------------------------------------------------- 启动 / 暂停
    hideStart() {
      this.el.start.classList.add('is-hidden');
      this.el.hud.classList.remove('is-hidden');
      this.el.hud.setAttribute('aria-hidden', 'false');
    },

    setProgress(p, key) {
      this.el.loadBar.style.width = Math.round(p * 100) + '%';
      if (key) this.el.loadText.textContent = I.t(key);
    },

    enableEnter(on) { this.el.enterBtn.disabled = !on; },

    setLocked(locked, dragMode) {
      document.body.classList.toggle('is-locked', locked);
      this.el.resume.classList.toggle('is-hidden', locked || this.panel !== null);
      this.el.dragHint.classList.toggle('is-hidden', locked || !dragMode);
      if (!locked && dragMode && this.panel === null) {
        this.el.dragHint.classList.remove('is-hidden');
      }
    },

    showResume(on) {
      this.el.resume.classList.toggle('is-hidden', !on);
    }
  };

  A.UIManager = UI;
})();