/**
 * modelBuilder.js
 * Builds the 3D human model using Three.js primitives.
 * More anatomically proportioned figure with trait-driven morphs.
 */

const ModelBuilder = (() => {
  let humanGroup = null;
  const scene = () => Scene.getScene();

  // ── Material factory ─────────────────────────────────────
  function mat(color, rough = 0.75, metal = 0.02, opts = {}) {
    return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: rough, metalness: metal, ...opts });
  }

  // ── Geometry helpers ─────────────────────────────────────
  function sphere(rx, ry, rz, segs = 18) {
    const g = new THREE.SphereGeometry(1, segs, Math.floor(segs * 0.7));
    g.scale(rx, ry, rz);
    return g;
  }

  function cyl(rTop, rBot, h, segs = 12) {
    return new THREE.CylinderGeometry(rTop, rBot, h, segs);
  }

  function box(w, h, d) { return new THREE.BoxGeometry(w, h, d, 2, 2, 2); }

  function add(geo, material, pos, rot, parent) {
    const m = new THREE.Mesh(geo, material);
    m.castShadow = true;
    m.receiveShadow = true;
    if (pos) m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    (parent || humanGroup).add(m);
    return m;
  }

  // ── State ─────────────────────────────────────────────────
  let state = {};

  // ── Build ──────────────────────────────────────────────────
  function build(traits) {
    state = traits || {};

    if (humanGroup) {
      scene().remove(humanGroup);
      humanGroup.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    }

    humanGroup = new THREE.Group();

    // ── Resolve trait colors ──────────────────────────────
    const skinHex  = _resolveSkin();
    const skinDark = _darken(skinHex, 0.78);
    const skinMid  = _darken(skinHex, 0.88);
    const eyeHex   = _resolveEye();
    const hairHex  = _resolveHair();
    const lipHex   = _darken(skinHex, 0.82);

    // Materials
    const mSkin    = mat(skinHex, 0.7, 0.03);
    const mSkinDk  = mat(skinDark, 0.78, 0.03);
    const mSkinMd  = mat(skinMid, 0.73, 0.02);
    const mEye     = mat(eyeHex, 0.05, 0.6);
    const mSclera  = mat(0xf8f3ea, 0.35, 0.0);
    const mPupil   = mat(0x080808, 0.3, 0.0);
    const mHair    = mat(hairHex, 0.88, 0.04);
    const mLip     = mat(lipHex, 0.65, 0.05);
    const mCloth   = mat(0x1a2535, 0.92);
    const mCloth2  = mat(0x0f1820, 0.92);
    const mShoe    = mat(0x0c1018, 0.95);
    const mNail    = mat(_darken(skinHex, 0.9), 0.3, 0.1);

    // ── Proportions ────────────────────────────────────────
    const heightScale = state.height === 'short' ? 0.87
                      : state.height === 'tall'  ? 1.13 : 1.0;
    const broadNose   = state.noseShape === 'broad';
    const narrowNose  = state.noseShape === 'narrow';
    const upturnedNose = state.noseShape === 'upturned';
    const hasDimples  = state.dimples === 'present';
    const hasFreckles = state.freckles === 'present';
    const sixFingers  = state.polydactyly === 'six';
    const isFullBeard = state.beardDensity === 'thick';
    const isBald      = state.baldness === 'bald';
    const isThinning  = state.baldness === 'thinning';
    const fullLips    = state.mouthShape === 'full';
    const thinLips    = state.mouthShape === 'thin';
    const hasCupid    = state.mouthShape === 'cupid';
    const cleftChin   = state.chinShape === 'cleft';
    const squareChin  = state.chinShape === 'square';

    // ── SKELETON / BODY ────────────────────────────────────

    // === LEGS ===
    // Thighs
    for (const s of [-1, 1]) {
      add(cyl(0.115, 0.10, 0.52, 10), mCloth,  [s*0.115, 0.21, 0]);       // thigh
      add(cyl(0.095, 0.08, 0.46, 10), mCloth2, [s*0.115,-0.22, 0]);       // shin
      // Knee bump
      add(sphere(0.095,0.08,0.08,10), mCloth,  [s*0.115, 0.02, 0.04]);
      // Foot
      const foot = new THREE.Group();
      add(box(0.11, 0.065, 0.24), mShoe, [0, 0, 0.06], null, foot);
      add(sphere(0.06, 0.04, 0.05, 8), mShoe, [0, 0.02, -0.04], null, foot);
      foot.position.set(s*0.115, -0.49, 0);
      humanGroup.add(foot);
    }

    // === PELVIS / HIPS ===
    add(cyl(0.26, 0.24, 0.20, 12), mCloth2, [0, 0.50, 0]);

    // === TORSO ===
    // Lower torso (belly)
    add(cyl(0.24, 0.26, 0.22, 14), mCloth,  [0, 0.73, 0]);
    // Chest
    add(cyl(0.26, 0.24, 0.26, 14), mCloth,  [0, 0.98, 0]);
    // Pectoral curve
    for (const s of [-1, 1]) {
      add(sphere(0.11,0.09,0.08,10), mCloth, [s*0.12, 1.06, 0.18]);
    }
    // Shirt collar
    add(cyl(0.15, 0.20, 0.04, 12), mCloth2, [0, 1.12, 0]);

    // === SHOULDERS ===
    for (const s of [-1, 1]) {
      add(sphere(0.12, 0.10, 0.10, 10), mCloth, [s*0.30, 1.10, 0]);
    }

    // === ARMS ===
    for (const s of [-1, 1]) {
      // Upper arm
      add(cyl(0.075, 0.065, 0.50, 9), mCloth,  [s*0.36, 0.88, 0], [0, 0, s*0.10]);
      // Elbow
      add(sphere(0.07,0.065,0.065,9), mCloth,  [s*0.41, 0.63, 0]);
      // Forearm
      add(cyl(0.065, 0.055, 0.42, 9), mSkin,   [s*0.43, 0.41, 0], [0, 0, s*0.08]);
      // Wrist
      add(sphere(0.055,0.048,0.048,9), mSkin,  [s*0.46, 0.22, 0]);
      // Hand
      _buildHand(s, mSkin, mSkinDk, mNail, sixFingers);
    }

    // === NECK ===
    add(cyl(0.09, 0.10, 0.16, 10), mSkin,   [0, 1.27, 0]);
    // Trapezius
    for (const s of [-1, 1]) {
      add(cyl(0.06, 0.10, 0.14, 8), mSkin,  [s*0.16, 1.24, -0.02], [0, 0, s*0.4]);
    }

    // === HEAD ===
    const headY = 1.61;
    _buildHead(headY, mSkin, mSkinDk, mSkinMd, mEye, mSclera, mPupil, mHair, mLip,
               { broadNose, narrowNose, upturnedNose, hasDimples, hasFreckles,
                 isFullBeard, isBald, isThinning, fullLips, thinLips, hasCupid,
                 cleftChin, squareChin, skinHex });

    // ── Apply height scale ──────────────────────────────────
    humanGroup.scale.y = heightScale;
    humanGroup.position.y = 0;
    humanGroup.rotation.y = Math.PI * 0.05;

    scene().add(humanGroup);
  }

  // ── Head ────────────────────────────────────────────────
  function _buildHead(headY, mSkin, mSkinDk, mSkinMd, mEye, mSclera, mPupil, mHair, mLip, opts) {
    const { broadNose, narrowNose, upturnedNose, hasDimples, hasFreckles,
            isFullBeard, isBald, isThinning, fullLips, thinLips, hasCupid,
            cleftChin, squareChin, skinHex } = opts;

    // Skull
    const skull = new THREE.SphereGeometry(0.22, 24, 20);
    skull.scale(1.0, 1.18, 0.97);
    const skullMesh = new THREE.Mesh(skull, mSkin);
    skullMesh.castShadow = true;
    skullMesh.position.set(0, headY, 0);
    humanGroup.add(skullMesh);

    // Cranium back bump
    add(sphere(0.18, 0.14, 0.12, 14), mSkin, [0, headY + 0.10, -0.12]);

    // Forehead ridge
    add(sphere(0.16, 0.04, 0.10, 12), mSkin, [0, headY + 0.20, 0.16]);

    // ── CHEEKBONES ──
    for (const s of [-1, 1]) {
      add(sphere(0.10, 0.07, 0.08, 12), mSkin, [s*0.18, headY-0.02, 0.12]);
    }

    // ── JAWLINE ──
    const jawW = squareChin ? 0.36 : 0.30;
    add(sphere(jawW*0.5, 0.06, 0.14, 14), mSkin, [0, headY-0.18, 0.10]);
    for (const s of [-1, 1]) {
      add(sphere(0.11, 0.08, 0.09, 10), mSkin, [s*0.16, headY-0.16, 0.04]);
    }

    // ── CHIN ──
    const chinW = squareChin ? 0.13 : 0.09;
    add(sphere(chinW, 0.07, 0.09, 10), mSkin, [0, headY-0.25, 0.13]);
    if (cleftChin) {
      add(sphere(0.025, 0.04, 0.02, 8), mSkinDk, [0, headY-0.265, 0.175]);
    }

    // ── EARS ──
    for (const s of [-1, 1]) {
      const ear = new THREE.Group();
      add(sphere(0.04, 0.07, 0.03, 10), mSkinDk, [0,0,0], null, ear);       // auricle
      add(sphere(0.025,0.05,0.02, 8),  mSkin,  [0, -0.04, 0], null, ear);   // lobe
      add(sphere(0.02, 0.02, 0.015, 7), mSkinDk, [0, 0.03, 0.005], null, ear); // tragus
      ear.position.set(s*0.22, headY+0.01, 0.01);
      humanGroup.add(ear);
    }

    // ── NOSE ──
    const nW = broadNose ? 1.55 : narrowNose ? 0.68 : 1.0;
    const nH = upturnedNose ? 0.04 : 0.08;
    const nZ = 0.225;
    // Bridge
    add(cyl(0.014*nW, 0.022*nW, 0.13, 8), mSkin, [0, headY+0.01, nZ-0.04], [0.45, 0, 0]);
    // Tip
    add(sphere(0.030*nW, 0.025, 0.022, 10), mSkinDk, [0, headY-0.055+nH, nZ]);
    // Nostrils
    for (const s of [-1, 1]) {
      add(sphere(0.022*nW, 0.018, 0.016, 8), mSkinDk, [s*0.025*nW, headY-0.06+nH, nZ-0.005]);
    }
    // Nostril holes
    for (const s of [-1, 1]) {
      add(sphere(0.012*nW, 0.010, 0.010, 7),
          mat(0x050508, 0.9), [s*0.026*nW, headY-0.065+nH, nZ+0.005]);
    }
    // Tip-bottom ridge
    add(sphere(0.028*nW, 0.012, 0.012, 8), mSkinDk, [0, headY-0.072+nH, nZ+0.008]);

    // ── EYES ──
    const eyeY = headY + 0.055;
    const eyeZ = 0.185;
    for (const s of [-1, 1]) {
      const ex = s * 0.075;
      // Eye socket recess (darker)
      add(sphere(0.052, 0.044, 0.025, 12), mSkinDk, [ex, eyeY, eyeZ - 0.005]);
      // Sclera (white)
      add(sphere(0.042, 0.035, 0.028, 14), mSclera, [ex, eyeY, eyeZ + 0.003]);
      // Iris
      add(sphere(0.022, 0.022, 0.015, 12), mEye,    [ex, eyeY, eyeZ + 0.016]);
      // Pupil
      add(sphere(0.011, 0.011, 0.010, 10), mPupil,  [ex, eyeY, eyeZ + 0.022]);
      // Cornea gloss
      add(sphere(0.025, 0.025, 0.010, 10),
          mat(0xffffff, 0.0, 0.0, { transparent: true, opacity: 0.1 }),
          [ex, eyeY, eyeZ + 0.020]);

      // Upper eyelid
      const uldGeo = new THREE.SphereGeometry(0.046, 12, 8, 0, Math.PI*2, 0, Math.PI*0.4);
      const uld = new THREE.Mesh(uldGeo, mSkin);
      uld.position.set(ex, eyeY+0.012, eyeZ + 0.014);
      uld.rotation.x = 0.2;
      uld.castShadow = true;
      humanGroup.add(uld);

      // Lower eyelid
      add(sphere(0.044, 0.012, 0.018, 10), mSkinDk, [ex, eyeY-0.024, eyeZ + 0.010]);

      // Eyebrow
      const browMat = mat(_darken(state.hairColor === 'platinum' ? '#E8C97A' : state._hairHex || '#3D1F15', 0.7), 0.9);
      add(sphere(0.046, 0.013, 0.013, 10), browMat, [ex, eyeY+0.044, eyeZ+0.010], [0, s*0.15, s*0.12]);
    }

    // ── MOUTH ──
    const mouthY = headY - 0.145;
    const lipThick = fullLips ? 0.018 : thinLips ? 0.009 : 0.013;
    const lipW     = fullLips ? 0.065 : thinLips ? 0.045 : 0.055;

    // Upper lip (with cupid's bow shape)
    if (hasCupid) {
      for (const s of [-1, 1]) {
        add(sphere(lipW*0.55, lipThick*1.3, lipThick*0.8, 10), mLip, [s*0.020, mouthY+0.012, 0.215]);
      }
      add(sphere(0.015, lipThick*0.7, lipThick*0.6, 8), mLip, [0, mouthY+0.008, 0.215]);
    } else {
      add(sphere(lipW, lipThick, lipThick*0.7, 12), mLip, [0, mouthY+0.011, 0.215]);
    }
    // Lower lip
    add(sphere(lipW*1.05, lipThick*1.4, lipThick*0.9, 12), mLip, [0, mouthY-0.011, 0.215]);
    // Mouth line
    add(sphere(lipW*0.98, 0.006, 0.005, 12),
        mat(_darken(skinHex, 0.70), 0.9), [0, mouthY, 0.218]);
    // Philtrum groove
    add(sphere(0.012, 0.025, 0.006, 8), mSkinDk, [0, mouthY+0.035, 0.213]);

    // ── DIMPLES ──
    if (hasDimples) {
      const dMat = mat(_darken(skinHex, 0.83), 0.85);
      for (const s of [-1, 1]) {
        add(sphere(0.015, 0.012, 0.006, 8), dMat, [s*0.105, mouthY+0.010, 0.195]);
      }
    }

    // ── NASOLABIAL FOLDS (subtle) ──
    for (const s of [-1, 1]) {
      add(sphere(0.008, 0.04, 0.005, 8), mSkinDk, [s*0.075, headY-0.09, 0.200]);
    }

    // ── BEARD ──
    if (isFullBeard) {
      const bMat = mat(state._hairHex || '#3D1F15', 0.92);
      // Jaw beard
      add(sphere(0.32, 0.10, 0.14, 16), bMat, [0, headY-0.20, 0.05]);
      // Chin beard
      add(sphere(0.12, 0.08, 0.10, 12), bMat, [0, headY-0.28, 0.13]);
      // Cheek stubble
      for (const s of [-1, 1]) {
        add(sphere(0.10, 0.06, 0.07, 10), bMat, [s*0.14, headY-0.12, 0.12]);
      }
      // Mustache
      add(sphere(0.10, 0.025, 0.025, 10), bMat, [0, mouthY+0.028, 0.218]);
    }

    // ── FRECKLES ──
    if (hasFreckles) {
      const fMat = mat(0x9B6040, 0.95);
      const frecklePositions = [
        [ 0.06, headY+0.04, 0.215], [-0.08, headY+0.03, 0.213],
        [ 0.11, headY+0.02, 0.205], [-0.05, headY+0.06, 0.214],
        [ 0.03, headY-0.02, 0.216], [-0.12, headY+0.05, 0.200],
        [ 0.14, headY+0.04, 0.195], [ 0.02, headY+0.08, 0.212],
        [ 0.08, headY-0.01, 0.210], [-0.06, headY+0.01, 0.218],
        [ 0.17, headY+0.02, 0.185], [-0.15, headY+0.03, 0.188],
      ];
      frecklePositions.forEach(([x,y,z]) => {
        const s = 0.007 + Math.random()*0.004;
        add(sphere(s, s, s*0.3, 5), fMat, [x, y, z]);
      });
    }

    // ── HAIR ──
    _buildHair(headY, mHair, isBald, isThinning);
  }

  // ── Hair ────────────────────────────────────────────────
  function _buildHair(headY, mHair, isBald, isThinning) {
    const type = state.hairTexture || 'wavy';
    if (isBald) return; // no hair

    const coverFrac = isThinning ? 0.4 : 1.0;

    // Skull cap
    const capGeo = new THREE.SphereGeometry(0.225, 18, 14, 0, Math.PI*2, 0, Math.PI*0.5);
    capGeo.scale(1.0, 1.18, 0.97);
    const capMesh = new THREE.Mesh(capGeo, mHair);
    capMesh.castShadow = true;
    capMesh.position.set(0, headY, 0);
    humanGroup.add(capMesh);

    if (isThinning) {
      // Sparse strands only
      for (let i = 0; i < 6; i++) {
        const a = (i/6)*Math.PI*2;
        add(cyl(0.01, 0.006, 0.08+Math.random()*0.05, 4), mHair,
          [Math.cos(a)*0.16, headY+0.14+Math.random()*0.04, Math.sin(a)*0.10]);
      }
      return;
    }

    if (type === 'straight') {
      // Flat panel sides + top
      add(box(0.44, 0.06, 0.35), mHair, [0, headY+0.21, -0.02]);
      for (const s of [-1, 1]) {
        add(cyl(0.02, 0.016, 0.30, 5), mHair, [s*0.22, headY+0.01, -0.04], [0,0,s*0.15]);
      }
    } else if (type === 'curly' || type === 'coiled') {
      const puffCount = type === 'coiled' ? 18 : 12;
      for (let i = 0; i < puffCount; i++) {
        const a = (i/puffCount) * Math.PI*2;
        const r = type === 'coiled' ? 0.24 : 0.20;
        const pR = type === 'coiled' ? 0.055 : 0.065;
        add(sphere(pR+Math.random()*0.02, pR+Math.random()*0.02, pR+Math.random()*0.01, 7), mHair,
          [Math.cos(a)*r*0.85, headY+0.14+Math.random()*0.10, Math.sin(a)*r*0.65]);
      }
      // Top puffs
      for (let i = 0; i < 5; i++) {
        add(sphere(0.07, 0.065, 0.05, 7), mHair,
          [(Math.random()-0.5)*0.18, headY+0.24+Math.random()*0.06, (Math.random()-0.5)*0.12]);
      }
    } else {
      // Wavy — side strands
      for (let i = 0; i < 10; i++) {
        const a = (i/10) * Math.PI * 2;
        const strandGeo = new THREE.CylinderGeometry(0.014, 0.008, 0.28, 4);
        const strand = new THREE.Mesh(strandGeo, mHair);
        strand.position.set(
          Math.cos(a)*0.21, headY - 0.05,
          Math.sin(a)*0.13
        );
        strand.rotation.z = Math.cos(a)*0.45;
        strand.rotation.x = Math.sin(a)*0.22 + 0.35;
        strand.castShadow = true;
        humanGroup.add(strand);
      }
    }
  }

  // ── Hand ────────────────────────────────────────────────
  function _buildHand(side, mSkin, mSkinDk, mNail, sixFingers) {
    const hand = new THREE.Group();
    const fingerCount = sixFingers ? 6 : 5;

    // Palm
    add(box(0.09, 0.04, 0.10), mSkin, [0, 0, 0.02], null, hand);
    // Palm thickness variation
    add(sphere(0.05, 0.035, 0.055, 8), mSkin, [0, 0, -0.01], null, hand);

    // Finger positions [xOffset, zOffset, length, name]
    const fingerDefs = [
      [-0.038, 0.08, 0.058, 'index'],
      [-0.012, 0.09, 0.065, 'middle'],
      [ 0.014, 0.085, 0.058, 'ring'],
      [ 0.038, 0.075, 0.048, 'pinky'],
    ];

    // If 6 fingers, add extra pinky
    if (sixFingers) {
      fingerDefs.push([0.060, 0.062, 0.042, 'extra']);
    }

    // Thumb (always)
    const thumbGeo = cyl(0.014, 0.012, 0.048, 7);
    const thumb = new THREE.Mesh(thumbGeo, mSkin);
    thumb.position.set(-0.058, 0, -0.025);
    thumb.rotation.set(0.2, 0, -0.6);
    thumb.castShadow = true;
    hand.add(thumb);
    // Thumb tip
    add(sphere(0.015, 0.014, 0.013, 7), mSkin, [0,0,0.028], null, thumb);
    add(sphere(0.013, 0.007, 0.006, 6), mNail, [0,0.008,0.030], null, thumb);

    fingerDefs.forEach(([x, z, len, name]) => {
      const fGrp = new THREE.Group();
      // Two phalanges
      add(cyl(0.013, 0.012, len, 7), mSkin, [0, 0, 0], null, fGrp);
      add(cyl(0.012, 0.010, len*0.85, 7), mSkin, [0, 0, len*0.92], null, fGrp);
      // Fingertip
      add(sphere(0.012, 0.013, 0.011, 8), mSkin, [0, 0, len*1.8], null, fGrp);
      // Nail
      add(sphere(0.011, 0.006, 0.008, 7), mNail, [0, 0.009, len*1.81], null, fGrp);
      // Knuckles
      add(sphere(0.015, 0.013, 0.011, 7), mSkinDk, [0, 0, -0.005], null, fGrp);
      add(sphere(0.013, 0.011, 0.010, 7), mSkinDk, [0, 0, len*0.9-0.005], null, fGrp);

      fGrp.rotation.x = Math.PI / 2;
      fGrp.position.set(x, 0.005, z);
      hand.add(fGrp);
    });

    hand.rotation.x = -Math.PI / 2;
    hand.rotation.z = side * 0.06;
    hand.position.set(side * 0.46, 0.14, 0);
    humanGroup.add(hand);
  }

  // ── Color resolvers ──────────────────────────────────────
  function _resolveSkin() {
    const map = {
      type1: '#FFDFC4', type2: '#F5C98A', type3: '#C8935A',
      type4: '#8B5C2A', type5: '#4E2810', type6: '#2A1508',
    };
    return map[state.skinTone] || '#F5C98A';
  }

  function _resolveEye() {
    const map = {
      blue: '#4a8fd6', gray: '#8a9bab', green: '#3a9a5c',
      violet: '#7050c0', hazel: '#8B6200', amber: '#d4880a',
      brown: '#5C3010',
    };
    return map[state.eyeColor] || '#5C3010';
  }

  function _resolveHair() {
    const map = {
      platinum: '#F0ECE0', blonde: '#E8C97A', red: '#C03020',
      auburn: '#8B3820', brown: '#6B3520', black: '#181010',
      white: '#F5F2F0',
    };
    const hex = map[state.hairColor] || '#6B3520';
    state._hairHex = hex; // cache for beard
    return hex;
  }

  function _darken(hexStr, factor) {
    const c = new THREE.Color(hexStr);
    c.multiplyScalar(factor);
    return c;
  }

  function getGroup() { return humanGroup; }

  return { build, getGroup };
})();
