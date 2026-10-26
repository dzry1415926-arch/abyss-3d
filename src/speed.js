/* ABYSS — 移动速度设置
 *
 * 原来的问题：controls.js 里 hSpeed = 10.5 / vSpeed = 7.0 是写死的常量，
 * 改速度必须改代码。这里把它抽成「基准速度 × 用户倍率」。
 *
 * 为什么用倍率而不是直接存速度值：
 *   基准速度是场景尺度的一部分（地形 1000m 见方、可视距离百来米），
 *   将来如果调整基准，用户已保存的偏好（"我习惯 1.4 倍"）仍然有意义；
 *   存绝对速度就会在基准变化后失去意义。
 */
(function () {
  const A = window.ABYSS;
  const { clamp } = A.util;

  const KEY = 'abyss.speed.v1';

  // 基准速度：原硬编码值。倍率 1.0 = 改动前的手感
  const BASE = { h: 10.5, v: 7.0 };

  // 三档预设。范围 0.4–2.6 是实测出来的：
  // 低于 0.4 在那个尺度下几乎看不出在动；高于 2.6 会明显冲过头、来不及停。
  const PRESETS = {
    slow: { mul: 0.45, label: 'slow' },
    normal: { mul: 1.0, label: 'normal' },
    fast: { mul: 1.9, label: 'fast' }
  };

  const MIN = 0.40, MAX = 2.60;

  const Speed = {
    mul: 1.0,
    BASE: BASE,
    MIN: MIN,
    MAX: MAX,
    PRESETS: PRESETS,
    _listeners: [],

    init() {
      let saved = null;
      try { saved = parseFloat(localStorage.getItem(KEY)); } catch (e) { }
      // 读不到、非数字、越界 → 回落到默认倍率。
      // 直接信任 localStorage 会被手改坏的值把相机速度搞成 0 或天量。
      if (isFinite(saved) && saved >= MIN && saved <= MAX) this.mul = saved;
      else this.mul = 1.0;
      this.apply();
      return this.mul;
    },

    // 实际参与运动的速度（米 / 秒）
    hSpeed() { return BASE.h * this.mul; },
    vSpeed() { return BASE.v * this.mul; },

    set(mul, silent) {
      const v = clamp(+mul, MIN, MAX);
      if (!isFinite(v)) return this.mul;
      this.mul = v;
      this.apply();
      try { localStorage.setItem(KEY, String(v)); } catch (e) { }
      if (!silent) this._emit();
      return this.mul;
    },

    // 控制器每帧读 Speed.hSpeed()，所以这里不需要"通知"控制器，
    // 只把当前档位算出来给界面用。
    apply() {
      this.preset = this.matchPreset();
    },

    matchPreset() {
      // 容差 0.02：滑块步长 0.05，拖到 1.00 时浮点可能落在 0.9999
      const near = (a, b) => Math.abs(a - b) < 0.021;
      if (near(this.mul, PRESETS.slow.mul)) return 'slow';
      if (near(this.mul, PRESETS.normal.mul)) return 'normal';
      if (near(this.mul, PRESETS.fast.mul)) return 'fast';
      return 'custom';
    },

    onChange(fn) { if (typeof fn === 'function') this._listeners.push(fn); },
    _emit() { this._listeners.forEach((f) => { try { f(this.mul, this.preset); } catch (e) { } }); },

    // 供测试：直接量「走固定距离要多久」，验证滑块与真实位移一致
    measure(distance, seconds) {
      return distance / (this.hSpeed() * seconds);
    }
  };

  A.Speed = Speed;
})();