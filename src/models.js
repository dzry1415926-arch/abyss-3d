/* ABYSS — 外部 GLB 模型管线
 * - 注册表：物种 ID -> 文件 / 许可 / 作者 / 缩放 / 朝向
 * - 异步预加载 + 缓存；加载失败自动回退到程序化模型
 * - 统一做深海材质适配（降饱和、压暗、提高粗糙度）
 */
(function () {
  const A = (window.ABYSS = window.ABYSS || {});

  // ---------------------------------------------------------------- 自建模型公共描述
  // 全部由 D:/ABYSS/blender/scripts 下的程序化脚本生成（原创几何 + 解析 UV + 程序化图集）。
  // 导出约定：glTF Y-up，体长沿 -Z（= Blender +Y 经 Y-up 转换），单位体长 1.0。
  const OWN = 'ABYSS 自建 — Blender 3.5 程序化建模脚本';
  const AUTHOR = 'ABYSS / build_all.py';
  const LIC = 'Project-owned (original work)';

  // 注册表：物种 ID -> 模型定义
  //   file         GLB 路径
  //   normDim/normTarget  归一化依据的维度与目标尺寸（米）
  //   pivot        'bottom' 让底点贴地（固着 / 爬行类），默认中心对齐
  //   grade        深海调色参数
  //   soft         半透明胶质体
  //   pulse/sway   顶点动画（伞体搏动 / 口腕拖曳）
  //   rim          菲涅耳边缘光
  const REGISTRY = {
    // ============================================================ 鱼纲（11）
    // 蝰鱼：长獠牙 + 蛇形躯干。体长归一化，牙被计入包围盒所以按 z 维。
    'chauliodus-sloani': {
      file: 'assets/models/chauliodus_sloani.glb',
      source: OWN, author: AUTHOR, license: LIC,
      url: 'D:/ABYSS/blender/scripts/build_all.py',
      normDim: 'y', normTarget: 0.34, yaw: Math.PI,
      grade: { desat: 0.08, dark: 0.98, rough: 0.40 },
      rim: { material: 'Body', rim: 0.50, rimColor: 0x7fa8c4 }
    },
    'myctophum-punctatum': {
      file: 'assets/models/myctophum_punctatum.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.09, yaw: Math.PI,
      grade: { desat: 0.06, dark: 1.0, rough: 0.42, keepEmissive: true },
      rim: { material: 'Body', rim: 0.45, rimColor: 0x8fc4d8 }
    },
    'argyropelecus-aculeatus': {
      file: 'assets/models/argyropelecus_aculeatus.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.07, yaw: Math.PI,
      grade: { desat: 0.05, dark: 1.0, rough: 0.38 },
      rim: { material: 'Body', rim: 0.55, rimColor: 0xa8d8e8 }
    },
    'eurypharynx-pelecanoides': {
      file: 'assets/models/eurypharynx_pelecanoides.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.85, yaw: Math.PI,
      grade: { desat: 0.10, dark: 0.95, rough: 0.50 },
      rim: { material: 'Body', rim: 0.40, rimColor: 0x6a7a8a }
    },
    'macropinna-microstoma': {
      file: 'assets/models/macropinna_microstoma.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.16, yaw: Math.PI,
      grade: { desat: 0.05, dark: 1.02, rough: 0.30 },
      soft: { depthWrite: false, side: THREE.DoubleSide },
      rim: { material: 'Body', rim: 0.62, rimColor: 0x9fd8e0 }
    },
    'anoplogaster-cornuta': {
      file: 'assets/models/anoplogaster_cornuta.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.17, yaw: Math.PI,
      grade: { desat: 0.08, dark: 0.94, rough: 0.52 },
      rim: { material: 'Body', rim: 0.42, rimColor: 0x8a5a48 }
    },
    'malacosteus-niger': {
      file: 'assets/models/malacosteus_niger.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.21, yaw: Math.PI,
      grade: { desat: 0.06, dark: 0.92, rough: 0.46 },
      rim: { material: 'Body', rim: 0.48, rimColor: 0x9a4a4a }
    },
    'nemichthys-scolopaceus': {
      file: 'assets/models/nemichthys_scolopaceus.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 1.20, yaw: Math.PI,
      grade: { desat: 0.06, dark: 1.0, rough: 0.44 },
      rim: { material: 'Body', rim: 0.44, rimColor: 0xb8d0d8 }
    },
    'bathypterois-grallator': {
      file: 'assets/models/bathypterois_grallator.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.36, yaw: Math.PI, pivot: 'bottom',
      grade: { desat: 0.08, dark: 0.96, rough: 0.48 },
      rim: { material: 'Body', rim: 0.42, rimColor: 0x7a90a0 }
    },
    'careproctus-rastrinus': {
      file: 'assets/models/careproctus_rastrinus.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.22, yaw: Math.PI, pivot: 'bottom',
      grade: { desat: 0.05, dark: 1.04, rough: 0.34 },
      soft: { depthWrite: false, side: THREE.DoubleSide },
      rim: { material: 'Body', rim: 0.58, rimColor: 0xe8b0a8 }
    },
    'coryphaenoides-armatus': {
      file: 'assets/models/coryphaenoides_armatus.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.72, yaw: Math.PI,
      grade: { desat: 0.08, dark: 0.98, rough: 0.44 },
      rim: { material: 'Body', rim: 0.44, rimColor: 0xa8b8c0 }
    },
    'chlamydoselachus-anguineus': {
      file: 'assets/models/chlamydoselachus_anguineus.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 1.70, yaw: Math.PI,
      grade: { desat: 0.10, dark: 0.90, rough: 0.52 },
      rim: { material: 'Body', rim: 0.40, rimColor: 0x8a7a68 }
    },
    'alepocephalus-bairdii': {
      file: 'assets/models/sloyd-fish.glb',
      source: 'Sloyd.ai — Free Sea Creature 3D Models',
      author: 'Sloyd (AI generated)',
      license: 'CC BY 4.0',
      url: 'https://www.sloyd.ai/free-3d-models/model/fish-rx9r5',
      normDim: 'max', normTarget: 0.44, yaw: Math.PI,
      grade: { desat: 0.35, dark: 0.78, rough: 0.55 }
    },

    // ============================================================ 水母 / 栉水母 / 樽海鞘（5）
    'stygiomedusa-gigantea': {
      file: 'assets/models/stygiomedusa.glb',
      source: OWN, author: 'ABYSS / build_stygiomedusa.py', license: LIC,
      url: 'D:/ABYSS/blender/scripts/build_stygiomedusa.py',
      // 伞径 1.44 m：按 X 维（直径）归一化到 1.44，口腕长度不被压缩
      normDim: 'x', normTarget: 1.44, anchor: 'top',
      // 胶质体在深海里最忌被压暗成黑块，这里几乎不压暗，交给场景灯光
      grade: { desat: 0.05, dark: 1.02, rough: 0.30 },
      soft: { depthWrite: false, side: THREE.DoubleSide },
      pulse: { material: 'Bell', amp: 0.035, speed: 0.55 },
      sway: { material: 'Arm', amp: 0.30, freq: 0.35, speed: 0.22 },
      rim: { material: 'Bell', rim: 0.55, rimColor: 0x9a6470 }
    },
    'atolla-wyvillei': {
      file: 'assets/models/atolla_wyvillei.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'x', normTarget: 0.44, anchor: 'top',
      grade: { desat: 0.05, dark: 1.04, rough: 0.28, keepEmissive: true },
      soft: { depthWrite: false, side: THREE.DoubleSide },
      pulse: { material: 'Bell', amp: 0.045, speed: 0.85 },
      rim: { material: 'Bell', rim: 0.60, rimColor: 0xc05a58 }
    },
    'crossota-millsae': {
      file: 'assets/models/crossota_millsae.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'x', normTarget: 0.12, anchor: 'top',
      grade: { desat: 0.05, dark: 1.05, rough: 0.26, keepEmissive: true },
      soft: { depthWrite: false, side: THREE.DoubleSide },
      pulse: { material: 'Bell', amp: 0.050, speed: 0.70 },
      rim: { material: 'Bell', rim: 0.62, rimColor: 0xd07a60 }
    },
    'beroe-cucumis': {
      file: 'assets/models/beroe_cucumis.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.14, anchor: 'top',
      grade: { desat: 0.04, dark: 1.05, rough: 0.22, keepEmissive: true },
      soft: { depthWrite: false, side: THREE.DoubleSide },
      pulse: { material: 'Cmb', amp: 0.030, speed: 0.9 },
      rim: { material: 'Cmb', rim: 0.70, rimColor: 0x7ae0f0 }
    },
    'salpa-maxima': {
      file: 'assets/models/salpa_maxima.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.13,
      grade: { desat: 0.04, dark: 1.04, rough: 0.20, keepEmissive: true },
      soft: { depthWrite: false, side: THREE.DoubleSide },
      rim: { material: 'Body', rim: 0.60, rimColor: 0x9ae0f0 }
    },

    // ============================================================ 头足类（6）
    'vampyroteuthis-infernalis': {
      file: 'assets/models/vampyroteuthis_infernalis.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.32, anchor: 'top',
      grade: { desat: 0.06, dark: 0.98, rough: 0.36 },
      rim: { material: 'Body', rim: 0.52, rimColor: 0xa04a5a }
    },
    'grimpoteuthis-sp': {
      file: 'assets/models/grimpoteuthis_sp.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.26, anchor: 'top',
      grade: { desat: 0.05, dark: 1.02, rough: 0.34 },
      rim: { material: 'Body', rim: 0.58, rimColor: 0xd08a90 }
    },
    'cranchia-scabra': {
      file: 'assets/models/cranchia_scabra.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.20,
      grade: { desat: 0.06, dark: 1.0, rough: 0.38 },
      rim: { material: 'Body', rim: 0.50, rimColor: 0xc08070 }
    },
    'architeuthis-dux': {
      file: 'assets/models/architeuthis_dux.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 4.20, yaw: Math.PI / 2,
      grade: { desat: 0.08, dark: 0.94, rough: 0.42 },
      rim: { material: 'Body', rim: 0.46, rimColor: 0xc89080 }
    },
    'bathypolypus-arcticus': {
      file: 'assets/models/bathypolypus_arcticus.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.22, pivot: 'bottom',
      grade: { desat: 0.06, dark: 1.0, rough: 0.38 },
      rim: { material: 'Body', rim: 0.50, rimColor: 0xc8a0a0 }
    },
    // ============================================================ 甲壳类（5）
    'bathynomus-giganteus': {
      file: 'assets/models/bathynomus_giganteus.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.42, pivot: 'bottom',
      grade: { desat: 0.08, dark: 0.98, rough: 0.50 },
      rim: { material: 'Body', rim: 0.40, rimColor: 0xc8b890 }
    },
    'eurythenes-gryllus': {
      file: 'assets/models/eurythenes_gryllus.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.085, pivot: 'bottom',
      grade: { desat: 0.08, dark: 0.96, rough: 0.52 },
      rim: { material: 'Body', rim: 0.42, rimColor: 0xb09880 }
    },
    'acanthephyra-purpurea': {
      file: 'assets/models/acanthephyra_purpurea.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.075,
      grade: { desat: 0.06, dark: 1.0, rough: 0.46 },
      rim: { material: 'Body', rim: 0.48, rimColor: 0xd06070 }
    },
    'chaceon-quinquedens': {
      file: 'assets/models/chaceon_quinquedens.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'x', normTarget: 0.20, pivot: 'bottom',
      grade: { desat: 0.08, dark: 0.98, rough: 0.48 },
      rim: { material: 'Body', rim: 0.44, rimColor: 0xd08060 }
    },
    'munidopsis-serricornis': {
      file: 'assets/models/munidopsis_serricornis.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.06, pivot: 'bottom',
      grade: { desat: 0.05, dark: 1.02, rough: 0.42 },
      rim: { material: 'Body', rim: 0.52, rimColor: 0xe0b0a8 }
    },
    'colossendeis-sea-spider': {
      file: 'assets/models/colossendeis_sea_spider.glb',
      source: OWN, author: AUTHOR, license: LIC,
      // 海蜘蛛按足展归一化：腿是它的全部，躯干只有几毫米
      normDim: 'x', normTarget: 0.42, pivot: 'bottom',
      grade: { desat: 0.08, dark: 1.0, rough: 0.50 },
      rim: { material: 'Body', rim: 0.44, rimColor: 0xc0a090 }
    },

    // ============================================================ 棘皮类（5）
    'henricia-sanguinolenta': {
      file: 'assets/models/henricia_sanguinolenta.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'x', normTarget: 0.15, pivot: 'bottom',
      grade: { desat: 0.06, dark: 1.0, rough: 0.48 },
      rim: { material: 'Body', rim: 0.46, rimColor: 0xd85050 }
    },
    'ophiura-sarsii': {
      file: 'assets/models/ophiura_sarsii.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'x', normTarget: 0.18, pivot: 'bottom',
      grade: { desat: 0.08, dark: 1.0, rough: 0.50 },
      rim: { material: 'Body', rim: 0.42, rimColor: 0xb8a090 }
    },
    'sperosoma-giganteum': {
      file: 'assets/models/sperosoma_giganteum.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'x', normTarget: 0.14, pivot: 'bottom',
      grade: { desat: 0.08, dark: 0.96, rough: 0.52 },
      rim: { material: 'Body', rim: 0.38, rimColor: 0x9a8aa0 }
    },
    'scotoplanes-globosa': {
      file: 'assets/models/scotoplanes_globosa.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.09, pivot: 'bottom',
      grade: { desat: 0.05, dark: 1.04, rough: 0.40 },
      rim: { material: 'Body', rim: 0.54, rimColor: 0xe0a0a8 }
    },

    // ============================================================ 刺胞 / 珊瑚 / 海笔（3）
    'actiniaria-deep': {
      file: 'assets/models/actiniaria_deep.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.30, pivot: 'bottom',
      grade: { desat: 0.05, dark: 1.02, rough: 0.38 },
      rim: { material: 'Body', rim: 0.56, rimColor: 0xe8b088 }
    },
    'keratoisis-flexibilis': {
      file: 'assets/models/keratoisis_flexibilis.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.62, pivot: 'bottom',
      grade: { desat: 0.06, dark: 1.0, rough: 0.46 },
      rim: { material: 'Body', rim: 0.48, rimColor: 0xe0d0b8 }
    },
    'pennatula-phosphorea': {
      file: 'assets/models/pennatula_phosphorea.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.30, pivot: 'bottom',
      grade: { desat: 0.05, dark: 1.02, rough: 0.42, keepEmissive: true },
      rim: { material: 'Body', rim: 0.54, rimColor: 0xd08090 }
    },

    // ============================================================ 多毛 / 玻璃海绵 / 管虫 / 贻贝（4）
    'polynoid-scale-worm': {
      file: 'assets/models/polynoid_scale_worm.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.075, pivot: 'bottom',
      grade: { desat: 0.08, dark: 1.0, rough: 0.48 },
      rim: { material: 'Body', rim: 0.46, rimColor: 0xc8bca8 }
    },
    'euplectella-aspergillum': {
      file: 'assets/models/euplectella_aspergillum.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 0.26, pivot: 'bottom',
      // 玻璃海绵：半透明的硅质骨架，双面 + 不写深度
      grade: { desat: 0.04, dark: 1.05, rough: 0.30 },
      soft: { depthWrite: false, side: THREE.DoubleSide, opacity: 0.86 },
      rim: { material: 'Body', rim: 0.68, rimColor: 0xd8e8f0 }
    },
    'lamellibrachia-luymesi': {
      file: 'assets/models/lamellibrachia_luymesi.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'y', normTarget: 1.10, pivot: 'bottom',
      grade: { desat: 0.05, dark: 1.02, rough: 0.44 },
      rim: { material: 'Body', rim: 0.52, rimColor: 0xe08078 }
    },
    'bathymodiolus-childressi': {
      file: 'assets/models/bathymodiolus_childressi.glb',
      source: OWN, author: AUTHOR, license: LIC,
      normDim: 'z', normTarget: 0.16, pivot: 'bottom',
      grade: { desat: 0.10, dark: 1.0, rough: 0.46 },
      rim: { material: 'Body', rim: 0.46, rimColor: 0x8098a8 }
    },

    // ============================================================ 自建鮟鱇（保留早期版本）
    'melanocetus-johnsonii': {
      file: 'assets/models/anglerfish.glb',
      source: OWN, author: 'ABYSS / build_anglerfish_v2.py', license: LIC,
      url: 'D:/ABYSS/blender/scripts/build_anglerfish_v2.py',
      normDim: 'y', normTarget: 0.19, pivot: 'bottom',
      // 自建模型已按场景色调制作，只做轻微压制，不要二次降饱和
      grade: { desat: 0.06, dark: 0.92, rough: 0.42, keepEmissive: true },
      rim: { material: 'Body', rim: 0.9, rimColor: 0x8fc0d4 }
    }
  };

  const Models = {
    cache: {},
    registry: REGISTRY,
    _loader: null,
    // 预加载完成前 A.__organicMat 还不存在，用这个标志避免加装边缘光失败
    ready: false,
    // 需要在每帧推进 uPulse 的材质（胶质体搏动）
    pulses: [],

    loader() {
      if (!this._loader) this._loader = new THREE.GLTFLoader();
      return this._loader;
    },

    has(id) { return !!REGISTRY[id]; },

    preload(onProgress) {
      const ids = Object.keys(REGISTRY);
      let done = 0;
      return Promise.all(ids.map((id) => new Promise((resolve) => {
        const def = REGISTRY[id];
        const t = setTimeout(() => { done++; onProgress && onProgress(done, ids.length); resolve(null); }, 20000);
        this.loader().load(def.file, (gltf) => {
          clearTimeout(t);
          try {
            const root = gltf.scene;
            this.grade(root, def.grade, def);
            root.traverse((o) => {
              if (o.isMesh) {
                o.castShadow = false;
                o.receiveShadow = false;
                o.frustumCulled = true;
                o.userData.speciesId = id;
              }
            });
            this.cache[id] = root;
          } catch (e) { this.cache[id] = null; }
          done++; onProgress && onProgress(done, ids.length);
          resolve(this.cache[id]);
        }, undefined, () => {
          clearTimeout(t);
          this.cache[id] = null;
          done++; onProgress && onProgress(done, ids.length);
          resolve(null);
        });
      }))).then((r) => {
        // 预加载结束、有机材质工厂已就绪，补上之前挂起的边缘光
        this.ready = true;
        (this._pendingRim || []).forEach(([g, opt]) => this.addRim(g, opt));
        this._pendingRim = null;
        return r;
      });
    },

    // 深海材质适配：把外部素材统一到场景的色调与粗糙度
    // def 可选字段：
    //   normDim  'x'|'y'|'max'  归一化依据的包围盒维度
    //   normTarget               归一化后的目标尺寸（米）
    //   anchor   'center'|'top'  模型原点位置（top 用于伞体悬挂、口腕下垂的生物）
    //   soft     { depthWrite, side, opacity }  半透明胶质体排序处理
    grade(root, g, def) {
      if (!g) return;
      def = def || {};
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      // 归一化基准维度：x=体宽/腕展，y=体高，z=体长。max 为通用兜底。
      const dim = def.normDim === 'x' ? size.x
        : def.normDim === 'y' ? size.y
          : def.normDim === 'z' ? size.z
            : Math.max(size.x, size.y, size.z);
      const target = def.normTarget || 1.0; // 实际由物种缩放再调整
      const s = target / Math.max(dim, 0.001);
      root.scale.setScalar(s);
      box.setFromObject(root);
      const c = box.getCenter(new THREE.Vector3());
      root.position.sub(c);
      if (def.anchor === 'top') {
        // 顶点落在原点：水母一类生物以伞体为锚点，口腕自然向下拖出
        root.position.y -= (box.max.y - box.min.y) * 0.5;
      } else if (def.anchor === 'bottom') {
        // 底点落在原点：固着类（海绵/海葵/珊瑚）与爬行类贴在海床上，
        // 否则按中心对齐会有一半身体埋进地形里。
        root.position.y += (box.max.y - box.min.y) * 0.5;
      }

      root.traverse((o) => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (!m) return;
          if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
          if (m.color) {
            const col = m.color.clone();
            const lum = 0.2126 * col.r + 0.7152 * col.g + 0.0722 * col.b;
            col.lerp(new THREE.Color(lum, lum, lum), g.desat).multiplyScalar(g.dark);
            m.color.copy(col);
          }
          m.roughness = g.rough;
          m.metalness = Math.min(0.15, m.metalness || 0);
          // 自建模型的发光器（esca）需要保留，否则失去鮟鱇最关键的识别特征
          if (m.emissive && !g.keepEmissive) m.emissive.setRGB(0, 0, 0);
          m.side = def.soft ? (def.soft.side || THREE.DoubleSide) : THREE.FrontSide;
          // 半透明胶质体：双面可见、不写深度，否则伞面会把自己的内腔遮成黑块
          if (def.soft) {
            m.transparent = true;
            m.depthWrite = !!def.soft.depthWrite;
            if (def.soft.opacity != null) m.opacity = def.soft.opacity;
            m.alphaTest = 0;
          }
          m.needsUpdate = true;
        });
      });
    },

    // 给 GLB 材质注入「伞体搏动」与「拖曳摆动」两种顶点动画。
    // 两者都只改顶点位置，不依赖骨骼，因此对任何静态网格 GLB 都适用。
    //   pulse: { material, amp, speed }  —— 伞面沿径向缩放、竖向略压扁
    //   sway:  { material, amp, freq, speed } —— 距锚点越远摆幅越大
    addMotion(root, def, phase) {
      const box = new THREE.Box3().setFromObject(root);
      const topY = box.max.y;
      const span = Math.max(0.001, topY - box.min.y);
      const self = this;

      const inject = (m, kind) => {
        const cfg = kind === 'pulse' ? def.pulse : def.sway;
        if (!cfg) return;
        // 幂等：同一材质只注入一次。
        // 早期没有这个判断，每个个体都对同一份材质再包一层 onBeforeCompile，
        // 14 只个体的物种就会把 uniform 声明重复 14 遍 →
        // 着色器报 'uRim'/'uMTime' redefinition，整只生物变成纯黑不渲染。
        if (m.userData.__motion === kind) return;
        const uni = {
          uMTime: { value: phase || 0 },
          uTop: { value: topY },
          uSpan: { value: span },
          uAmp: { value: cfg.amp },
          uSpeed: { value: cfg.speed || 0.5 },
          uFreq: { value: cfg.freq || 1.0 }
        };
        m.userData.__motion = kind;
        const prev = m.onBeforeCompile;
        m.onBeforeCompile = (shader, renderer) => {
          if (prev) prev.call(m, shader, renderer);
          Object.assign(shader.uniforms, uni);
          shader.vertexShader = shader.vertexShader
            .replace('#include <common>', `#include <common>
              uniform float uMTime; uniform float uTop; uniform float uSpan;
              uniform float uAmp; uniform float uSpeed; uniform float uFreq;`)
            .replace('#include <begin_vertex>', `#include <begin_vertex>
              float mDepth = clamp((uTop - transformed.y) / uSpan, 0.0, 1.0);
              // 同种个体共享同一份材质与 uniform，若只按 uMTime 推进，
              // 一整群水母会完全同频搏动，像机械复制品。
              // 用个体自身的世界坐标派生一个固定相位偏移，代价为零，
              // 却能让每只的节奏错开。
              float iPhase = dot(modelMatrix[3].xz, vec2(0.37, 0.61)) + modelMatrix[3].y * 0.21;
              ${kind === 'pulse' ? `
              // 伞体搏动：径向扩张 + 竖向压缩，像真实的伞腔排水
              float mp = 0.5 + 0.5 * sin(uMTime * uSpeed * 6.283 + iPhase);
              float mr = 1.0 + uAmp * mp;
              float my = 1.0 - uAmp * 0.55 * mp;
              transformed.xz *= mr;
              transformed.y = uTop - (uTop - transformed.y) * my;
              ` : `
              // 拖曳摆动：越远离伞体，横向位移越大（口腕自由端摇摆最明显）
              float sw = mDepth * mDepth;
              float ph = uMTime * uSpeed * 6.283 + transformed.y * uFreq + iPhase;
              transformed.x += sin(ph) * uAmp * sw;
              transformed.z += cos(ph * 0.77 + 1.3) * uAmp * sw * 0.8;
              `}`);
        };
        m.userData.motionUniforms = uni;
        // 同一份材质只保留一个 uMTime 引用，避免 pulses 数组无谓膨胀
        if (self.pulses.indexOf(uni) < 0) self.pulses.push(uni);
      };

      root.traverse((o) => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (!m) return;
          if (def.pulse && m.name === def.pulse.material) inject(m, 'pulse');
          if (def.sway && m.name === def.sway.material) inject(m, 'sway');
        });
      });
    },

    // 每帧推进所有 GLB 顶点动画的时间
    tick(t) {
      for (let i = 0; i < this.pulses.length; i++) this.pulses[i].uMTime.value = t;
    },

    instance(id, scale) {
      const src = this.cache[id];
      if (!src) return null;
      const def = REGISTRY[id];
      const g = src.clone(true);
      g.traverse((o) => { if (o.isMesh) o.userData.speciesId = id; });
      g.rotation.y = def.yaw || 0;
      g.scale.multiplyScalar(scale * (def.scale || 1));
      // 姿态基准：bottom 让模型底点贴到 group 原点。
      // 固着 / 爬行类必须用 bottom —— 之前所有 GLB 都按几何中心对齐，
      // 海绵、海葵、珊瑚会有一半陷进地形。
      // 依据是物种数据里的 model.axis === 'y'（底点贴地），
      // 注册表里的 pivot 只是兜底，避免两处配置不一致。
      const sp = A.SPECIES_BY_ID && A.SPECIES_BY_ID[id];
      const bottom = def.pivot === 'bottom' || !!(sp && sp.model && sp.model.axis === 'y');
      g.position.y += (def.lift || 0) +
        (bottom ? this.halfHeight(id) * scale * (def.scale || 1) : 0);
      // 顶点动画（伞体搏动 / 口腕拖曳摆动）
      if (def.pulse || def.sway) this.addMotion(g, def);
      // 自建模型：加一层边缘光，避免在近黑的深海里失去轮廓
      if (def.rim) {
        if (A.Models.ready) this.addRim(g, def.rim);
        else (this._pendingRim = this._pendingRim || []).push([g, def.rim]);
      }
      return g;
    },

    // 归一化后的半高（世界单位）。预加载时算一次并缓存，避免每帧算包围盒。
    halfHeight(id) {
      if (!this._hh) this._hh = {};
      if (this._hh[id] != null) return this._hh[id];
      const src = this.cache[id];
      if (!src) return 0;
      const b = new THREE.Box3().setFromObject(src);
      const h = (b.max.y - b.min.y) * 0.5;
      this._hh[id] = h;
      return h;
    },

    // 把项目统一的边缘光加到外部/自建模型上。
    // 直接在 GLB 原生材质上注入菲涅耳项，而不是替换成新建材质：
    // 替换会丢掉 glTF 导出的 transparency / alphaMode / side 等信息，
    // 对胶质体（如冥河水母）会造成伞面变成不透明白块。
    addRim(root, opt) {
      root.traverse((o) => {
        if (!o.isMesh) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((mat) => {
          if (!mat || mat.name !== opt.material) return;
          // 幂等保护：clone() 共享材质引用，若每个个体都注入一次，
          // 同一份材质的 fragmentShader 会被替换 N 遍，
          // GLSL 里重复声明 uniform 直接编译失败（'uRim' redefinition）。
          if (mat.userData && mat.userData.__rim) {
            // 已注入过，只同步用户可能调整的强度，不重复插桩
            mat.userData.__rimU.uRim.value = opt.rim;
            if (opt.rimColor != null) mat.userData.__rimU.uRimColor.value.set(opt.rimColor);
            return;
          }
          const uni = {
            uRim: { value: opt.rim },
            uRimColor: { value: new THREE.Color(opt.rimColor || 0x9fd4e4) }
          };
          mat.userData = mat.userData || {};
          mat.userData.__rim = true;
          mat.userData.__rimU = uni;
          // 必须链式调用前一个钩子：同材质可能已由 addMotion 注入顶点动画，
          // 直接覆盖会让伞体搏动/腕摆动失效。
          const prevHook = mat.onBeforeCompile;
          mat.onBeforeCompile = (shader, renderer) => {
            if (prevHook) prevHook.call(mat, shader, renderer);
            Object.assign(shader.uniforms, uni);
            shader.fragmentShader = shader.fragmentShader
              .replace('#include <common>', `#include <common>
                uniform float uRim; uniform vec3 uRimColor;`)
              .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
                float fres = 1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
                totalEmissiveRadiance += uRimColor * pow(fres, 3.0) * uRim;`);
          };
          // 让 three 重新编译这份材质（哪怕之前已编译过）
          mat.needsUpdate = true;
        });
      });
    }
  };

  A.Models = Models;
})();
