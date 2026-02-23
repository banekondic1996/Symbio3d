/**
 * model3d.js v4 — Simple, working 3D human figure
 *
 * Design principles:
 * 1. Camera is FIXED at a known position. Figure is built to fill that view.
 * 2. ONE material per color type — shared across all meshes of that type.
 *    Changing material.color INSTANTLY recolors ALL meshes using it.
 * 3. Named sub-groups stored in PARTS{} — sliders operate on these directly.
 * 4. Figure height = 2.0 units. Camera at z=3.2, y=1.0, looking at y=1.0.
 *    FOV=40. This gives comfortable framing.
 */

const Model3D = (() => {
  'use strict';

  let scene, camera, renderer;
  let root = null;          // the human figure group
  let mixer = null;
  const clock = new THREE.Clock();

  // Camera orbit state
  let dragActive = false, shiftDrag = false;
  let lastMouse = { x: 0, y: 0 };
  let autoSpin = true;
  let usingGLB = false;

  // Named part groups — set in buildFigure(), used in applySliders()
  const PARTS = {};

  // Shared materials — ONE instance per semantic type
  // ALL skin meshes share M.skin, ALL hair meshes share M.hair, etc.
  const M = {};

  // Bone + morph refs for GLB path
  const GLB_BONES = {};
  const GLB_MORPHS = {};
  const CUSTOM = {};

  let lastTraits  = {};
  let lastSliders = {};

  const SLIDER_DEF = {
    'head-width': 100, 'head-height': 100, 'nose-width': 100,
    'eye-size': 100, 'eye-spacing': 100, 'lip-volume': 100,
    'jaw-width': 100, 'shoulder-width': 100, 'torso-width': 100,
    'waist-ratio': 100, 'leg-length': 100, 'arm-length': 100,
    'neck-width': 100, 'ear-size': 100, 'brow-thickness': 100,
  };

  const GLB_URLS = [
    // ── DISABLE first model to see second one ─────────────────────────────────────────────────
    // ── DISABLE  '/js/model.glb', 
    'https://cdn.jsdelivr.net/gh/hmthanh/3d-human-model@master/Thanh.glb',
    'https://raw.githubusercontent.com/hmthanh/3d-human-model/master/Thanh.glb'
  ];

  // ── init ─────────────────────────────────────────────────
  function init() {
    const canvas = document.getElementById('canvas3d');
    if (!canvas) { console.error('No #canvas3d'); return; }

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 2);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    try { renderer.outputEncoding = THREE.sRGBEncoding; } catch(e){}

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080c);
    scene.fog = new THREE.FogExp2(0x06080c, 0.008);

    // Camera: figure is 2 units tall, centered around y=1.0
    // We want the feet (y=0) to the head (y=2) fully visible
    // At FOV=40, z=3.2, y=1.0: half-height visible = 3.2 * tan(20°) = 1.165 units above/below camera
    // Camera at y=1.0, so visible from -0.165 to 2.165 — perfect
    camera = new THREE.PerspectiveCamera(40, 1, 0.05, 200);
    camera.position.set(0, 1.5, 3.0);
    camera.lookAt(0, 1, 0);

    setupLights();
    setupGround();
    bindControls(canvas);
    window.addEventListener('resize', onResize);
    onResize();

    buildFigure();
    tryLoadGLB(0);
    animate();
  }

  // ── GLB ──────────────────────────────────────────────────
  function tryLoadGLB(attempt) {
    if (attempt > 80) return;
    const Loader = (window.THREE && window.THREE.GLTFLoader) || window.GLTFLoader;
    if (!Loader) { setTimeout(() => tryLoadGLB(attempt + 1), 100); return; }

    setStatus('Loading GLB…');
    const loader = new Loader();

    const tryUrl = (i) => {
      if (i >= GLB_URLS.length) { setStatus('Procedural'); return; }
      loader.load(GLB_URLS[i],
        gltf => onGLBLoaded(gltf),
        p => { if (p.total) setStatus(`${Math.round(p.loaded/p.total*100)}%`); },
        () => tryUrl(i + 1)
      );
    };
    tryUrl(0);
  }

  function onGLBLoaded(gltf) {
    if (root) { scene.remove(root); disposeGroup(root); }
    Object.keys(GLB_BONES).forEach(k => delete GLB_BONES[k]);
    Object.keys(GLB_MORPHS).forEach(k => delete GLB_MORPHS[k]);

    root = gltf.scene;
    usingGLB = true;

    root.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = obj.receiveShadow = true;
        if (obj.morphTargetDictionary) {
          const MAP = {
            mouthOpen: ['mouthOpen','jawOpen'], mouthSmile: ['mouthSmile','smile'],
            eyeWide: ['eyeWideLeft','eyeWide'], noseWide: ['noseSneerLeft','noseWide'],
            cheekPuff: ['cheekPuff'], eyeSquint: ['eyeSquintLeft','eyeSquint'],
          };
          for (const [alias, names] of Object.entries(MAP)) {
            for (const n of names) {
              if (obj.morphTargetDictionary[n] !== undefined) {
                (GLB_MORPHS[alias] = GLB_MORPHS[alias] || []).push({mesh:obj, idx:obj.morphTargetDictionary[n]});
              }
            }
          }
        }
      }
      const BMAP = {
        head:['Head','mixamorigHead'], neck:['Neck','mixamorigNeck'],
        leftArm:['LeftArm','mixamorigLeftArm'], rightArm:['RightArm','mixamorigRightArm'],
        leftForeArm:['LeftForeArm','mixamorigLeftForeArm'], rightForeArm:['RightForeArm','mixamorigRightForeArm'],
        leftUpLeg:['LeftUpLeg','mixamorigLeftUpLeg'], rightUpLeg:['RightUpLeg','mixamorigRightUpLeg'],
        leftLeg:['LeftLeg','mixamorigLeftLeg'], rightLeg:['RightLeg','mixamorigRightLeg'],
        leftShoulder:['LeftShoulder','mixamorigLeftShoulder'], rightShoulder:['RightShoulder','mixamorigRightShoulder'],
      };
      for (const [alias, names] of Object.entries(BMAP)) {
        if (!GLB_BONES[alias] && names.some(n => obj.name === n)) GLB_BONES[alias] = obj;
      }
    });

    // Scale to 2.0 units tall, feet at y=0
    const b = new THREE.Box3().setFromObject(root);
    const h = b.max.y - b.min.y;
    root.scale.setScalar(1.9 / Math.max(h, 0.001));
    const b2 = new THREE.Box3().setFromObject(root);
    root.position.set(-(b2.min.x+b2.max.x)/2, -b2.min.y, -(b2.min.z+b2.max.z)/2);

    scene.add(root);

    if (gltf.animations?.length) {
      mixer = new THREE.AnimationMixer(root);
      const clip = gltf.animations.find(a=>/idle/i.test(a.name)) || gltf.animations[0];
      if (clip) mixer.clipAction(clip).play();
    }

    setStatus('GLB ✓');
    applyTraits(lastTraits);
    applySliders(lastSliders);
  }

  // ══════════════════════════════════════════════════════════
  // FIGURE BUILD
  //
  // Coordinate system: Y up, figure 2.0 units tall
  //   y=0.00  floor (feet bottom)
  //   y=2.00  top of head
  //
  // All meshes that should be the same color USE THE SAME MATERIAL INSTANCE.
  // M.skin is passed by reference to THREE.Mesh — changing M.skin.color
  // changes the color of EVERY mesh that was given M.skin.
  // ══════════════════════════════════════════════════════════
  function buildFigure() {
    if (root) { scene.remove(root); disposeGroup(root); }
    Object.keys(PARTS).forEach(k => delete PARTS[k]);
    usingGLB = false;

    // Create ONE material instance per color type
    M.skin  = mat(0xE8C090, 0.65, 0.05);
    M.hair  = mat(0x2A1505, 0.88, 0.02);
    M.iris  = mat(0x5C3010, 0.08, 0.40);
    M.lip   = mat(0xC87862, 0.60, 0.06);
    M.beard = mat(0x2A1505, 0.90, 0.01);
    M.cloth = mat(0x1A2535, 0.92, 0.00);
    M.dark  = mat(0x0F1820, 0.95, 0.00);
    M.shoe  = mat(0x0C1018, 0.97, 0.00);
    M.white = mat(0xF8F3EA, 0.28, 0.00);
    M.pupil = mat(0x080808, 0.05, 0.00);
    M.lid   = mat(0xD8A870, 0.68, 0.02);
    M.nail  = mat(0xE0C090, 0.20, 0.14);

    const g = new THREE.Group();  // root group

    // Helper: create mesh and add to a group (or root)
    function mk(geo, material, px, py, pz, parent) {
      const m = new THREE.Mesh(geo, material);
      m.castShadow = m.receiveShadow = true;
      m.position.set(px || 0, py || 0, pz || 0);
      (parent || g).add(m);
      return m;
    }

    // Geometry helpers
    function C(rt, rb, h, s) { return new THREE.CylinderGeometry(rt, rb, h, s||14); }
    function S(rx, ry, rz, s) {
      const geo = new THREE.SphereGeometry(1, s||18, Math.round((s||18)*0.75));
      geo.scale(rx, ry, rz);
      return geo;
    }
    function B(w, h, d) { return new THREE.BoxGeometry(w, h, d, 2, 2, 2); }

    // ── SHOES (y: 0 → 0.11) ────────────────────────────────
    for (const s of [-1, 1]) {
      mk(B(0.120, 0.110, 0.250), M.shoe, s*0.115, 0.055, 0.025);
    }

    // ── LEGS ───────────────────────────────────────────────
    // Two named groups. Base y = 0.11 (top of shoe).
    // Leg group scaled on Y by leg-length slider.
    // Natural height of leg content inside group: ~0.84 units
    // Pelvis base = 0.11 + 0.84*ll

    for (const side of ['L', 'R']) {
      const sx = side === 'L' ? -1 : 1;
      const lg = new THREE.Group();
      lg.name = 'leg' + side;

      // Ankle sphere
      mk(S(0.052, 0.046, 0.046, 10), M.skin, 0, 0.03, 0, lg);
      // Shin
      mk(C(0.055, 0.050, 0.390, 12), M.dark, 0, 0.225, 0, lg);
      // Knee
      mk(S(0.062, 0.058, 0.055, 10), M.dark, 0, 0.420, 0.018, lg);
      // Thigh
      mk(C(0.093, 0.075, 0.390, 12), M.cloth, 0, 0.620, 0, lg);

      lg.position.set(sx * 0.115, 0.11, 0);
      PARTS['leg' + side] = lg;
      g.add(lg);
    }

    // ── PELVIS ─────────────────────────────────────────────
    // Positioned at y = 0.11 + 0.84 = 0.95
    const pelvisGroup = new THREE.Group();
    pelvisGroup.name = 'pelvis';
    mk(C(0.215, 0.198, 0.185, 16), M.dark, 0, 0.0925, 0, pelvisGroup);
    for (const s of [-1, 1]) {
      mk(S(0.090, 0.078, 0.072, 10), M.dark, s*0.200, 0.088, 0, pelvisGroup);
    }
    pelvisGroup.position.y = 0.95;
    PARTS.pelvis = pelvisGroup;
    g.add(pelvisGroup);

    // ── TORSO ──────────────────────────────────────────────
    // Torso base at y=1.135 (top of pelvis)
    // Torso group scaled on X by torso-width and shoulder-width
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'torso';
    // Belly
    mk(C(0.185, 0.214, 0.205, 16), M.cloth, 0, 0.1025, 0, torsoGroup);
    // Chest
    mk(C(0.210, 0.185, 0.300, 16), M.cloth, 0, 0.358, 0, torsoGroup);
    // Pecs
    for (const s of [-1, 1]) {
      mk(S(0.085, 0.070, 0.070, 10), M.cloth, s*0.100, 0.435, 0.124, torsoGroup);
    }
    // Collar
    mk(C(0.125, 0.182, 0.058, 14), M.dark, 0, 0.538, 0, torsoGroup);

    torsoGroup.position.y = 1.135;
    PARTS.torso = torsoGroup;
    g.add(torsoGroup);

    // ── SHOULDER BUMPS ─────────────────────────────────────
    // These are separate so shoulder-width slider can move them
    PARTS.shoulderL = mk(S(0.108, 0.085, 0.085, 12), M.cloth, -0.262, 1.685, 0);
    PARTS.shoulderR = mk(S(0.108, 0.085, 0.085, 12), M.cloth,  0.262, 1.685, 0);

    // ── ARMS ───────────────────────────────────────────────
    // Each arm is a group. Position = shoulder socket.
    // Content hangs DOWN (negative y inside group).
    for (const side of ['L', 'R']) {
      const sx = side === 'L' ? -1 : 1;
      const ag = new THREE.Group();
      ag.name = 'arm' + side;

      // Upper arm: from 0 to -0.330
      mk(C(0.056, 0.048, 0.330, 10), M.cloth, 0, -0.165, 0, ag);
      // Elbow
      mk(S(0.050, 0.046, 0.044, 10), M.cloth, 0, -0.340, 0.010, ag);
      // Forearm (SKIN): from -0.340 to -0.670
      mk(C(0.044, 0.037, 0.330, 10), M.skin, 0, -0.505, 0, ag);
      // Wrist
      mk(S(0.037, 0.033, 0.033, 10), M.skin, 0, -0.675, 0, ag);
      // Palm
      mk(S(0.040, 0.028, 0.044, 10), M.skin, 0, -0.740, 0.007, ag);
      // Fingers (4)
      const fxo = [-0.028, -0.009, 0.009, 0.026];
      const fln = [0.062, 0.070, 0.064, 0.052];
      fxo.forEach((fx, i) => {
        const fl = fln[i];
        mk(C(0.009, 0.008, fl, 6), M.skin, fx, -0.740-fl/2-0.010, 0.025, ag).rotation.x = 0.20;
        mk(S(0.009, 0.009, 0.007, 6), M.skin, fx, -0.740-fl-0.015, 0.038, ag);
      });
      // Thumb
      const thumb = mk(C(0.011, 0.009, 0.052, 6), M.skin, sx*(-0.044), -0.740, 0.008, ag);
      thumb.rotation.set(0.07, 0, sx*(-0.50));

      ag.position.set(sx * 0.262, 1.685, 0);
      ag.rotation.z = sx * 0.07;
      PARTS['arm' + side] = ag;
      g.add(ag);
    }

    // ── NECK ───────────────────────────────────────────────
    const neckGroup = new THREE.Group();
    neckGroup.name = 'neck';
    mk(C(0.072, 0.080, 0.170, 12), M.skin, 0, 0.085, 0, neckGroup);
    for (const s of [-1, 1]) {
      mk(C(0.045, 0.080, 0.105, 8), M.skin, s*0.140, 0.070, -0.013, neckGroup)
        .rotation.set(0, 0, s*0.38);
    }
    neckGroup.position.y = 1.685;
    PARTS.neck = neckGroup;
    g.add(neckGroup);

    // ── HEAD ───────────────────────────────────────────────
    // Neck top = 1.685 + 0.170 = 1.855
    // Head center = 1.855 + 0.145 = 2.000  (head radius ~0.145 vertical)
    // Head top = 2.000 + 0.145 = 2.145  (plus hair ~0.04 → 2.185 ≈ 2.2)
    // Perfect: figure is ~2.0–2.2 units. Camera sees y=−0.165 to y=2.165.

    const HEAD_Y = 2.00;

    const headGroup = new THREE.Group();
    headGroup.name = 'head';
    headGroup.position.set(0, HEAD_Y, 0);

    // Skull
    const skullGeo = new THREE.SphereGeometry(0.143, 28, 22);
    skullGeo.scale(0.96, 1.00, 0.935);
    mk(skullGeo, M.skin, 0, 0, 0, headGroup);

    // Back of cranium
    mk(S(0.118, 0.096, 0.090, 12), M.skin, 0, 0.066, -0.083, headGroup);
    // Forehead
    mk(S(0.106, 0.033, 0.068, 12), M.skin, 0, 0.158, 0.096, headGroup);

    // Cheekbones
    for (const s of [-1, 1]) {
      mk(S(0.065, 0.048, 0.054, 10), M.skin, s*0.122, -0.011, 0.082, headGroup);
    }

    // Jaw group (can be scaled by jaw-width slider)
    const jawGrp = new THREE.Group();
    jawGrp.name = 'jaw';
    mk(S(0.101, 0.042, 0.092, 14), M.skin, 0, -0.105, 0.062, jawGrp);
    for (const s of [-1, 1]) {
      mk(S(0.071, 0.053, 0.059, 10), M.skin, s*0.107, -0.100, 0.033, jawGrp);
    }
    headGroup.add(jawGrp);
    PARTS.jaw = jawGrp;

    // Chin group
    const chinGrp = new THREE.Group();
    chinGrp.name = 'chin';
    PARTS.chinMesh = mk(S(0.059, 0.045, 0.059, 10), M.skin, 0, -0.156, 0.085, chinGrp);
    headGroup.add(chinGrp);
    PARTS.chin = chinGrp;

    // Ears
    PARTS.ears = [];
    for (const s of [-1, 1]) {
      const earGrp = new THREE.Group();
      earGrp.name = s < 0 ? 'earL' : 'earR';
      mk(S(0.026, 0.048, 0.019, 10), M.skin, 0, 0, 0, earGrp);
      const lobe = mk(S(0.016, 0.033, 0.013, 8), M.skin, 0, -0.042, 0.007, earGrp);
      lobe.name = 'earLobe';
      earGrp.position.set(s*0.151, -0.004, 0.005);
      PARTS.ears.push(earGrp);
      headGroup.add(earGrp);
    }

    // Nose group
    const noseGrp = new THREE.Group();
    noseGrp.name = 'nose';
    mk(S(0.017, 0.040, 0.015, 10), M.skin, 0, 0.021, 0.143, noseGrp); // bridge
    mk(S(0.030, 0.021, 0.026, 10), M.skin, 0, -0.020, 0.151, noseGrp); // tip
    for (const s of [-1, 1]) {
      mk(S(0.020, 0.015, 0.017, 8), M.skin, s*0.024, -0.021, 0.148, noseGrp); // nostrils
    }
    headGroup.add(noseGrp);
    PARTS.nose = noseGrp;

    // Eyes
    PARTS.eyes = [];
    for (const s of [-1, 1]) {
      const eyeGrp = new THREE.Group();
      eyeGrp.name = s < 0 ? 'eyeL' : 'eyeR';
      eyeGrp.position.set(s*0.050, 0.014, 0.132);
      mk(S(0.022, 0.020, 0.015, 12), M.white, 0, 0, 0, eyeGrp);  // sclera
      const iris = mk(S(0.013, 0.013, 0.011, 10), M.iris, 0, 0, 0.008, eyeGrp);
      iris.name = 'iris';
      mk(S(0.007, 0.007, 0.005, 8), M.pupil, 0, 0, 0.012, eyeGrp);  // pupil
      mk(S(0.024, 0.008, 0.012, 8), M.lid,   0, 0.008, 0.002, eyeGrp); // lid
      PARTS.eyes.push(eyeGrp);
      headGroup.add(eyeGrp);
    }

    // Brows
    PARTS.brows = [];
    for (const s of [-1, 1]) {
      const brow = mk(S(0.024, 0.009, 0.009, 8), M.hair, s*0.050, 0.034, 0.128, headGroup);
      brow.name = 'brow';
      PARTS.brows.push(brow);
    }

    // Mouth group
    const mouthGrp = new THREE.Group();
    mouthGrp.name = 'mouth';
    mk(S(0.036, 0.009, 0.008, 10), M.lip, 0, -0.078, 0.145, mouthGrp); // line
    PARTS.upperLip = mk(S(0.034, 0.011, 0.009, 10), M.lip, 0, -0.073, 0.145, mouthGrp);
    PARTS.lowerLip = mk(S(0.038, 0.014, 0.011, 10), M.lip, 0, -0.084, 0.146, mouthGrp);
    headGroup.add(mouthGrp);
    PARTS.mouth = mouthGrp;

    // Hair cap
    const hairGrp = new THREE.Group();
    hairGrp.name = 'hair';
    const capGeo = new THREE.SphereGeometry(0.147, 22, 16, 0, Math.PI*2, 0, Math.PI*0.52);
    capGeo.scale(0.97, 1.00, 0.945);
    mk(capGeo, M.hair, 0, 0, 0, hairGrp);
    // Default side strands
    for (const s of [-1, 1]) {
      const strand = mk(C(0.012, 0.008, 0.190, 5), M.hair, s*0.142, -0.050, -0.025, hairGrp);
      strand.rotation.set(0, 0, s*0.17);
      strand.name = 'strand';
    }
    headGroup.add(hairGrp);
    PARTS.hairGrp = hairGrp;

    // Beard group (hidden by default)
    const beardGrp = new THREE.Group();
    beardGrp.name = 'beard';
    beardGrp.visible = false;
    mk(S(0.106, 0.048, 0.094, 14), M.beard, 0, -0.110, 0.058, beardGrp); // jaw shadow
    mk(S(0.063, 0.050, 0.063, 10), M.beard, 0, -0.163, 0.087, beardGrp); // chin beard
    mk(S(0.033, 0.010, 0.009,  8), M.beard, 0, -0.066, 0.147, beardGrp); // mustache
    headGroup.add(beardGrp);
    PARTS.beardGrp = beardGrp;

    g.add(headGroup);
    PARTS.headGroup = headGroup;

    g.rotation.y = Math.PI * 0.04;
    root = g;
    scene.add(root);
    setStatus('Procedural');
  }

  function mat(hex, rough, metal) {
    return new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal||0 });
  }

  // ══════════════════════════════════════════════════════════
  // APPLY TRAITS
  // ══════════════════════════════════════════════════════════
  function applyTraits(traits) {
    lastTraits = traits || {};
    if (!root) return;
    usingGLB ? applyTraitsGLB(traits) : applyTraitsProc(traits);
    applyCustomParts();
    updateBar(traits);
  }

  function applyTraitsProc(t) {
    // ── Skin tone: set the ONE shared skin material color ──
    const skinHex = SKIN[t.skinTone] || SKIN.type2;
    M.skin.color.set(skinHex);

    // Auto-adjust lip color to skin tone
    const sc = M.skin.color;
    M.lip.color.setRGB(Math.min(sc.r*0.80+0.16, 1), sc.g*0.66, sc.b*0.60);

    // Lid color follows skin
    M.lid.color.setRGB(sc.r*0.88, sc.g*0.82, sc.b*0.80);

    // ── Hair color: one shared material ──
    const hairHex = HAIR[t.hairColor] || HAIR.brown;
    M.hair.color.set(hairHex);
    M.beard.color.set(hairHex); // beard matches hair

    // ── Eye (iris) color ──
    M.iris.color.set(EYE[t.eyeColor] || EYE.brown);

    // ── Height: scale whole figure vertically ──
    const hs = t.height === 'short' ? 0.88 : t.height === 'tall' ? 1.12 : 1.00;
    root.scale.set(root.scale.x, hs, root.scale.z);

    // ── Nose shape ──
    if (PARTS.nose) {
      const nw = t.noseShape === 'broad' ? 1.50 : t.noseShape === 'narrow' ? 0.68 : 1.00;
      PARTS.nose.scale.set(nw, t.noseShape === 'upturned' ? 0.82 : 1.00, nw * 0.92);
    }

    // ── Mouth shape ──
    if (PARTS.upperLip && PARTS.lowerLip) {
      const lv = t.mouthShape === 'full' ? 1.70 : t.mouthShape === 'thin' ? 0.52 : 1.00;
      const mw = t.mouthShape === 'full' ? 1.18 : t.mouthShape === 'thin' ? 0.86 : 1.00;
      PARTS.upperLip.scale.set(mw, lv, 1.0);
      PARTS.lowerLip.scale.set(mw * 1.04, lv * 1.22, 1.0);
    }

    // ── Chin shape ──
    if (PARTS.chinMesh) {
      // Remove old cleft
      const old = PARTS.headGroup && PARTS.headGroup.getObjectByName('_cleft');
      if (old) old.parent.remove(old);

      if (t.chinShape === 'cleft') {
        PARTS.chinMesh.scale.set(0.86, 1.00, 0.86);
        if (PARTS.headGroup) {
          const dg = new THREE.SphereGeometry(1, 7, 5);
          dg.scale(0.014, 0.011, 0.006);
          const dm = new THREE.Mesh(dg, M.skin.clone());
          dm.material.color.multiplyScalar(0.76);
          dm.position.set(0, -0.162, 0.091);
          dm.name = '_cleft';
          PARTS.headGroup.add(dm);
        }
      } else if (t.chinShape === 'square') {
        PARTS.chinMesh.scale.set(1.30, 0.86, 1.04);
        if (PARTS.jaw) PARTS.jaw.scale.set(1.18, 1.00, 1.00);
      } else if (t.chinShape === 'pointed') {
        PARTS.chinMesh.scale.set(0.72, 1.22, 0.84);
        if (PARTS.jaw) PARTS.jaw.scale.set(0.88, 1.00, 1.00);
      } else {
        PARTS.chinMesh.scale.set(1.0, 1.0, 1.0);
        if (PARTS.jaw) PARTS.jaw.scale.set(1.0, 1.0, 1.0);
      }
    }

    // ── Ear lobe ──
    if (PARTS.ears) {
      PARTS.ears.forEach(earGrp => {
        const lobe = earGrp.getObjectByName('earLobe');
        if (!lobe) return;
        const ls = t.earLobe === 'attached' ? 0.60 : t.earLobe === 'detached' ? 1.32 : 1.00;
        lobe.scale.setScalar(ls);
        lobe.position.y = t.earLobe === 'attached' ? -0.030 : -0.042;
      });
    }

    // ── Beard ──
    if (PARTS.beardGrp) {
      const bd = t.beardDensity || 'none';
      if (bd === 'none') {
        PARTS.beardGrp.visible = false;
      } else {
        PARTS.beardGrp.visible = true;
        const [jaw, chin, must] = PARTS.beardGrp.children;
        if (bd === 'sparse') {
          jaw.visible = true; jaw.material.transparent = true; jaw.material.opacity = 0.28;
          chin.visible = false;
          must.visible = true; must.material.transparent = false;
        } else if (bd === 'medium') {
          jaw.visible = true; jaw.material.transparent = true; jaw.material.opacity = 0.65;
          chin.visible = true; chin.material.transparent = false;
          must.visible = true; must.material.transparent = false;
        } else {
          jaw.visible = true; jaw.material.transparent = false;
          chin.visible = true; chin.material.transparent = false;
          must.visible = true; must.material.transparent = false;
          PARTS.beardGrp.scale.setScalar(1.08);
        }
        if (bd !== 'thick') PARTS.beardGrp.scale.setScalar(1.0);
      }
    }

    // ── Baldness ──
    if (PARTS.hairGrp) {
      const bald = t.baldness;
      PARTS.hairGrp.traverse(m => {
        if (!m.isMesh) return;
        if (bald === 'bald') { m.visible = false; }
        else if (bald === 'thinning') { m.visible = true; m.material.transparent = true; m.material.opacity = 0.40; }
        else { m.visible = true; m.material.transparent = false; m.material.opacity = 1.0; }
      });
    }

    // ── Hair texture ──
    rebuildStrands(t.hairTexture, t.baldness);

    // ── Dimples ──
    if (PARTS.headGroup) {
      ['_dimL','_dimR'].forEach(n => {
        const d = PARTS.headGroup.getObjectByName(n);
        if (d) d.parent.remove(d);
      });
      if (t.dimples === 'present') {
        for (const s of [-1, 1]) {
          const dg = new THREE.SphereGeometry(1, 7, 5); dg.scale(0.010, 0.007, 0.004);
          const dm = new THREE.Mesh(dg, M.skin.clone());
          dm.material.color.multiplyScalar(0.79);
          dm.position.set(s*0.062, -0.082, 0.122);
          dm.name = s<0 ? '_dimL' : '_dimR';
          PARTS.headGroup.add(dm);
        }
      }
    }

    // ── Freckles ──
    if (PARTS.headGroup) {
      const exF = [];
      PARTS.headGroup.traverse(o => { if (o.name==='_freckle') exF.push(o); });
      exF.forEach(o => o.parent.remove(o));
      if (t.freckles === 'present') {
        const fm = M.skin.clone(); fm.color.multiplyScalar(0.72);
        [[0.044,0.027,0.130],[-0.048,0.020,0.129],[0.065,0.012,0.124],
         [-0.033,0.032,0.132],[0.017,-0.011,0.134],[-0.072,0.026,0.120],
         [0.085,0.020,0.116]].forEach(([x,y,z]) => {
          const fg = new THREE.SphereGeometry(1, 5, 4); fg.scale(0.0044, 0.0044, 0.0022);
          const fr = new THREE.Mesh(fg, fm); fr.position.set(x,y,z); fr.name='_freckle';
          PARTS.headGroup.add(fr);
        });
      }
    }
  }

  function rebuildStrands(texture, baldness) {
    if (!PARTS.hairGrp) return;
    const toRemove = [];
    PARTS.hairGrp.traverse(o => { if (o.name==='strand') toRemove.push(o); });
    toRemove.forEach(o => PARTS.hairGrp.remove(o));
    if (baldness === 'bald') return;

    const type = texture || 'wavy';
    if (type === 'straight') {
      for (const s of [-1, 1]) {
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.008,0.210,5), M.hair);
        st.castShadow = true; st.name = 'strand';
        st.position.set(s*0.142, -0.048, -0.022);
        st.rotation.set(0, 0, s*0.16);
        PARTS.hairGrp.add(st);
      }
    } else if (type === 'curly' || type === 'coiled') {
      const count = type === 'coiled' ? 18 : 12;
      const r = type === 'coiled' ? 0.040 : 0.036;
      for (let i = 0; i < count; i++) {
        const a = (i/count) * Math.PI * 2;
        const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 6), M.hair);
        puff.castShadow = true; puff.name = 'strand';
        puff.position.set(Math.cos(a)*0.148*0.82, 0.096+Math.random()*0.055, Math.sin(a)*0.148*0.68);
        PARTS.hairGrp.add(puff);
      }
    } else {
      // wavy (default)
      for (const s of [-1, 1]) {
        const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.008,0.190,5), M.hair);
        st.castShadow = true; st.name = 'strand';
        st.position.set(s*0.142, -0.050, -0.025);
        st.rotation.set(0, 0, s*0.17);
        PARTS.hairGrp.add(st);
      }
    }
  }

  function applyTraitsGLB(t) {
    const sc = new THREE.Color(SKIN[t.skinTone]||SKIN.type2);
    const hc = new THREE.Color(HAIR[t.hairColor]||HAIR.brown);
    const ec = new THREE.Color(EYE[t.eyeColor]||EYE.brown);
    root.traverse(obj => {
      if (!obj.isMesh) return;
      const n = (obj.name||'').toLowerCase();
      [].concat(obj.material).forEach(m => {
        if (!m.color) return;
        if (/skin|face|head|arm|hand|leg|neck|ear|body/i.test(n)
            || (m.color.r>0.5 && m.color.g>0.35 && m.color.b>0.18)) {
          m.color.lerp(sc, 0.6); m.needsUpdate=true;
        }
        if (/hair|brow/i.test(n)) { m.color.copy(hc); m.needsUpdate=true; }
        if (/iris|pupil/i.test(n)) { m.color.copy(ec); m.needsUpdate=true; }
      });
    });
    const hs = t.height==='short' ? 0.88 : t.height==='tall' ? 1.12 : 1.00;
    root.scale.set(root.scale.x, hs, root.scale.z);
  }

  // ══════════════════════════════════════════════════════════
  // APPLY SLIDERS
  // Sliders pass values 30–250 (default 100).
  // v(id) → multiplier: 100 → 1.0, 150 → 1.5, 70 → 0.7
  // ══════════════════════════════════════════════════════════
  function applySliders(sliders) {
    lastSliders = sliders || {};
    if (!root) return;
    if (usingGLB) { applySliders_GLB(sliders); return; }

    const v = id => ((sliders[id] !== undefined ? sliders[id] : SLIDER_DEF[id])||100) / 100;

    const hw  = v('head-width');
    const hh  = v('head-height');
    const nw  = v('neck-width');
    const sw  = v('shoulder-width');
    const tw  = v('torso-width');
    const ll  = v('leg-length');
    const al  = v('arm-length');
    const es  = v('eye-size');
    const esp = v('eye-spacing');
    const lv  = v('lip-volume');
    const noseW = v('nose-width');
    const jawW  = v('jaw-width');
    const earSz = v('ear-size');
    const browT = v('brow-thickness');

    // HEAD: scale the whole head group
    if (PARTS.headGroup) {
      PARTS.headGroup.scale.set(hw, hh, (hw + 1.0) * 0.5);
    }

    // NOSE WIDTH (compensated for head scale so slider acts independently)
    if (PARTS.nose) {
      PARTS.nose.scale.set(noseW, 1.0, noseW * 0.90);
    }

    // EYE SIZE + SPACING (positions/sizes in local head space, compensated for head scale)
    if (PARTS.eyes && PARTS.eyes.length === 2) {
      const BASE_X = 0.050;
      PARTS.eyes.forEach((eg, i) => {
        const side = i === 0 ? -1 : 1;
        eg.scale.setScalar(es);
        eg.position.x = side * BASE_X * esp;
      });
    }

    // BROW THICKNESS
    if (PARTS.brows) {
      PARTS.brows.forEach(b => { b.scale.set(1.0, browT, 1.0); });
    }

    // JAW WIDTH
    if (PARTS.jaw) {
      PARTS.jaw.scale.set(jawW, 1.0, jawW * 0.94);
    }

    // LIP VOLUME
    if (PARTS.upperLip) PARTS.upperLip.scale.set(1.0, lv, 1.0);
    if (PARTS.lowerLip) PARTS.lowerLip.scale.set(1.0, lv * 1.18, 1.0);

    // EAR SIZE
    if (PARTS.ears) {
      PARTS.ears.forEach(eg => eg.scale.setScalar(earSz));
    }

    // NECK WIDTH
    if (PARTS.neck) {
      PARTS.neck.scale.set(nw, 1.0, nw);
    }

    // SHOULDER WIDTH
    // Move shoulder bumps and arm group origins outward
    const BASE_SX = 0.262;
    if (PARTS.shoulderL) PARTS.shoulderL.position.x = -BASE_SX * sw;
    if (PARTS.shoulderR) PARTS.shoulderR.position.x =  BASE_SX * sw;
    if (PARTS.armL) PARTS.armL.position.x = -BASE_SX * sw;
    if (PARTS.armR) PARTS.armR.position.x =  BASE_SX * sw;

    // TORSO WIDTH
    if (PARTS.torso) {
      PARTS.torso.scale.set(tw, 1.0, tw * 0.90);
    }

    // LEG LENGTH
    // Scale leg groups on Y. Then shift everything above the legs up.
    const BASE_LEG_H = 0.84;   // natural leg group height
    const legTop = 0.11 + BASE_LEG_H * ll;  // where legs end (feet top + scaled leg height)

    if (PARTS.legL) PARTS.legL.scale.set(1.0, ll, 1.0);
    if (PARTS.legR) PARTS.legR.scale.set(1.0, ll, 1.0);

    // Shift pelvis, torso, shoulders, arms, neck, head up by leg delta
    const legDelta = (ll - 1.0) * BASE_LEG_H;
    const BASE = { pelvis: 0.95, torso: 1.135, sY: 1.685, neck: 1.685, head: 2.00 };
    if (PARTS.pelvis) PARTS.pelvis.position.y = BASE.pelvis + legDelta;
    if (PARTS.torso)  PARTS.torso.position.y  = BASE.torso + legDelta;
    if (PARTS.shoulderL) { PARTS.shoulderL.position.y = BASE.sY + legDelta; }
    if (PARTS.shoulderR) { PARTS.shoulderR.position.y = BASE.sY + legDelta; }
    if (PARTS.armL)  PARTS.armL.position.y  = BASE.sY + legDelta;
    if (PARTS.armR)  PARTS.armR.position.y  = BASE.sY + legDelta;
    if (PARTS.neck)  PARTS.neck.position.y  = BASE.neck + legDelta;
    if (PARTS.headGroup) PARTS.headGroup.position.y = BASE.head + legDelta;

    // ARM LENGTH: scale arm group on Y (arms hang downward inside group)
    if (PARTS.armL) PARTS.armL.scale.set(1.0, al, 1.0);
    if (PARTS.armR) PARTS.armR.scale.set(1.0, al, 1.0);
  }

  function applySliders_GLB(sliders) {
    const v = id => ((sliders[id]||SLIDER_DEF[id]||100)) / 100;
    const bs = (alias, sx, sy, sz) => { const b=GLB_BONES[alias]; if(b) b.scale.set(sx,sy,sz); };
    bs('head',          v('head-width'),    v('head-height'), v('head-width'));
    bs('neck',          v('neck-width'),     1,               v('neck-width'));
    bs('leftShoulder',  v('shoulder-width'), 1,               1);
    bs('rightShoulder', v('shoulder-width'), 1,               1);
    bs('leftArm',       1, v('arm-length'),  1);
    bs('rightArm',      1, v('arm-length'),  1);
    bs('leftForeArm',   1, v('arm-length'),  1);
    bs('rightForeArm',  1, v('arm-length'),  1);
    bs('leftUpLeg',     1, v('leg-length'),  1);
    bs('rightUpLeg',    1, v('leg-length'),  1);
    bs('leftLeg',       1, v('leg-length'),  1);
    bs('rightLeg',      1, v('leg-length'),  1);
    morph('noseWide',  (v('nose-width')  - 1) * 1.4);
    morph('eyeWide',   (v('eye-size')    - 1) * 0.9);
    morph('mouthSmile',(v('lip-volume')  - 1) * 0.8);
  }

  function morph(alias, value) {
    const t = GLB_MORPHS[alias];
    if (!t) return;
    const v = Math.max(-1, Math.min(2, value));
    t.forEach(({mesh, idx}) => { if(mesh.morphTargetInfluences) mesh.morphTargetInfluences[idx]=v; });
  }

  // ── Custom parts ──────────────────────────────────────────
  function loadCustomPart(partName, file) {
    const Loader = (window.THREE && window.THREE.GLTFLoader) || window.GLTFLoader;
    if (!Loader) return Promise.reject(new Error('GLTFLoader not ready'));
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      new Loader().load(url, gltf => {
        URL.revokeObjectURL(url);
        const grp = gltf.scene;
        grp.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
        if (root) {
          const b = new THREE.Box3().setFromObject(root);
          const h = Math.max(b.max.y - b.min.y, 0.01);
          const pb = new THREE.Box3().setFromObject(grp);
          const ph = Math.max(pb.max.y - pb.min.y, 0.01);
          grp.scale.setScalar((h * 0.15) / ph);
        }
        CUSTOM[partName] = grp;
        applyCustomParts();
        resolve(grp);
      }, null, err => { URL.revokeObjectURL(url); reject(err); });
    });
  }

  function removeCustomPart(partName) {
    delete CUSTOM[partName];
    if (!root) return;
    root.traverse(o => { if (o.isMesh && matchPart(o.name, partName)) o.visible = true; });
    const ex = root.getObjectByName('_cp_' + partName);
    if (ex) ex.parent.remove(ex);
  }

  function getCustomParts() { return Object.keys(CUSTOM); }

  function applyCustomParts() {
    if (!root) return;
    for (const [name, grp] of Object.entries(CUSTOM)) {
      root.traverse(o => { if (o.isMesh && matchPart(o.name, name)) o.visible = false; });
      if (!root.getObjectByName('_cp_' + name)) {
        grp.name = '_cp_' + name;
        root.add(grp);
      }
    }
  }

  function matchPart(meshName, partName) {
    const n = (meshName||'').toLowerCase();
    const MAP = {
      mouth:['mouth','lip','jaw'], nose:['nose','nostril'],
      eyes:['eye','iris','pupil','sclera'], ears:['ear','lobe'],
      hair:['hair','brow','eyebrow'], head:['head','skull','face'],
    };
    return (MAP[partName]||[partName]).some(k => n.includes(k));
  }

  // ── Camera views ──────────────────────────────────────────
 // ── VIEWS ─────────────────────────────────────────────────
  function setView(v) {
    const CTR=1.5, HFACE=2.62;
    const V={front:{p:[0,CTR,5.0],a:[0,CTR,0]},side:{p:[5.0,CTR,0],a:[0,CTR,0]},
              face:{p:[0,HFACE,1.8],a:[0,HFACE,0]},back:{p:[0,CTR,-5.0],a:[0,CTR,0]}};
    if (!V[v]) return;
    autoRot=false; _lerp(V[v].p, V[v].a, 700);
    document.querySelectorAll('.mc-btn[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  }

  function setSex(sex) {
    const lbl = document.getElementById('mb-sex-label');
    if (lbl) lbl.textContent = sex.charAt(0).toUpperCase() + sex.slice(1);
    if (usingGLB && GLB_BONES.spine) {
      GLB_BONES.spine.scale.set(sex==='female'?0.87:1.0, 1.0, sex==='female'?0.90:1.0);
      return;
    }
    // Procedural: adjust shoulder/hip proportions
    if (!root) return;
    const isFem = sex === 'female';
    const BASE_SX = 0.262;
    const sw_mod = isFem ? 0.88 : 1.00;
    if (PARTS.shoulderL) PARTS.shoulderL.position.x = -BASE_SX * sw_mod;
    if (PARTS.shoulderR) PARTS.shoulderR.position.x =  BASE_SX * sw_mod;
    if (PARTS.armL) PARTS.armL.position.x = -BASE_SX * sw_mod;
    if (PARTS.armR) PARTS.armR.position.x =  BASE_SX * sw_mod;
    if (PARTS.torso)  PARTS.torso.scale.set(isFem?0.90:1.0, 1.0, isFem?0.90:1.0);
    if (PARTS.pelvis) PARTS.pelvis.scale.set(isFem?1.12:1.0, 1.0, isFem?1.10:1.0);
  }

  // ── Scene helpers ─────────────────────────────────────────
  function setupLights() {
    scene.add(new THREE.AmbientLight(0x1a2540, 0.72));
    const key = new THREE.DirectionalLight(0xfff8f0, 1.18);
    key.position.set(1.8, 3.5, 3.0);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { near:0.5, far:14, left:-2, right:2, top:3.5, bottom:-0.5 });
    key.shadow.bias = -0.0003;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x00e5b4, 0.28);
    rim.position.set(-2.2, 3.0, -2.2);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0x6080c0, 0.22);
    fill.position.set(-1.5, 0.8, 2.0);
    scene.add(fill);
  }

  function setupGround() {
    const pg = new THREE.PlaneGeometry(12, 12);
    // Shadow catcher
    const sh = new THREE.Mesh(pg, new THREE.ShadowMaterial({ opacity: 0.40 }));
    sh.rotation.x = -Math.PI / 2; sh.receiveShadow = true;
    scene.add(sh);
    // Floor
    const fl = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ color: 0x06090e, roughness: 1 }));
    fl.rotation.x = -Math.PI / 2; fl.position.y = -0.001; fl.receiveShadow = true;
    scene.add(fl);
    // Grid at y=0 (foot level)
    const grid = new THREE.GridHelper(10, 20, 0x111a28, 0x0c1320);
    grid.position.y = 0.001;
    scene.add(grid);
    // Glow ring
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.20, 0.24, 48),
      new THREE.MeshBasicMaterial({ color: 0x00e5b4, opacity: 0.24, transparent: true, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002;
    scene.add(ring);
  }

  function bindControls(canvas) {
    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) { dragActive = true; shiftDrag = e.shiftKey; autoSpin = false; }
      lastMouse = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!dragActive) return;
      const dx = e.clientX - lastMouse.x, dy = e.clientY - lastMouse.y;
      if (shiftDrag) {
        camera.position.x -= dx * 0.003;
        camera.position.y += dy * 0.003;
        camera.lookAt(0, camera.position.y, 0);
      } else if (root) {
        root.rotation.y += dx * 0.012;
      }
      lastMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { dragActive = false; });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('wheel', e => {
      camera.position.z = Math.max(0.8, Math.min(9, camera.position.z + e.deltaY * 0.005));
    }, { passive: true });
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) { dragActive = true; autoSpin = false; lastMouse = {x:e.touches[0].clientX,y:e.touches[0].clientY}; }
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!dragActive || e.touches.length !== 1) return;
      if (root) root.rotation.y += (e.touches[0].clientX - lastMouse.x) * 0.012;
      lastMouse = {x:e.touches[0].clientX,y:e.touches[0].clientY};
    }, { passive: true });
    canvas.addEventListener('touchend', () => { dragActive = false; });
  }

  function onResize() {
    const el = renderer.domElement;
    const w = el.clientWidth, h = el.clientHeight;
    if (w > 0 && h > 0) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    if (mixer) mixer.update(dt);
    if (autoSpin && root && !dragActive) root.rotation.y += 0.004;
    renderer.render(scene, camera);
  }

  function lerpCamera(tp, la, ms) {
    const t0 = performance.now(), from = camera.position.clone(), to = new THREE.Vector3(...tp);
    const tick = now => {
      const t = Math.min((now - t0) / ms, 1);
      const e = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
      camera.position.lerpVectors(from, to, e);
      camera.lookAt(...la);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function setStatus(txt) {
    const el = document.getElementById('mb-model-status');
    if (el) el.textContent = txt;
  }

  function updateBar(traits) {
    const nv = window.NonVisual ? Object.keys(NonVisual.getSelected()).length : 0;
    const total = Object.keys(traits).length + nv;
    const el = document.getElementById('trait-count');
    if (el) el.textContent = total;
    const bar = document.getElementById('mb-traits');
    if (bar) bar.textContent = total > 0 ? `${total} trait${total!==1?'s':''} active` : 'No traits selected';
    const hEl = document.getElementById('mb-height');
    if (hEl) hEl.textContent = traits.height==='short' ? '152–165' : traits.height==='tall' ? '180–195' : '165–180';
  }

  function disposeGroup(grp) {
    grp.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) [].concat(o.material).forEach(m => m.dispose());
    });
  }

  // Color tables
  const SKIN = {
    type1:'#FFDFC4', type2:'#F5C98A', type3:'#C8935A',
    type4:'#8B5C2A', type5:'#4E2810', type6:'#2A1508'
  };
  const HAIR = {
    platinum:'#F0ECE0', blonde:'#E8C97A', red:'#C03020',
    auburn:'#8B3820', brown:'#6B3520', black:'#181010', white:'#F5F2F0'
  };
  const EYE = {
    blue:'#4a8fd6', gray:'#8a9bab', green:'#3a9a5c',
    violet:'#7050c0', hazel:'#8B6200', amber:'#d4880a', brown:'#5C3010'
  };

  return {
    init, applyTraits, applySliders, setView, setSex,
    loadCustomPart, removeCustomPart, getCustomParts,
    setTraits: applyTraits, render: () => {},
  };
})();

const Model = Model3D;
