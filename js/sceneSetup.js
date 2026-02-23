/**
 * sceneSetup.js
 * Three.js scene, camera, renderer, lighting, and mouse controls.
 */

const Scene = (() => {
  let scene, camera, renderer;
  let isDragging = false, isShiftDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let autoRotate = true;
  let wireframeMode = false;
  let animId = null;

  function init(canvasEl) {
    const vp = canvasEl.parentElement;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvasEl, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputEncoding = THREE.sRGBEncoding;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080c);
    scene.fog = new THREE.FogExp2(0x06080c, 0.018);

    // Camera
    camera = new THREE.PerspectiveCamera(40, 1, 0.05, 200);
    camera.position.set(0, 1.65, 4.8);
    camera.lookAt(0, 1.0, 0);

    // Lights
    _setupLights();

    // Ground
    _setupGround();

    // Events
    _bindEvents(canvasEl);

    resize();
    window.addEventListener('resize', resize);

    // Start loop
    _loop();
  }

  function _setupLights() {
    // Ambient
    scene.add(new THREE.AmbientLight(0x1a2540, 0.5));

    // Key light (warm-cool)
    const key = new THREE.DirectionalLight(0xfff8f0, 1.3);
    key.position.set(2.5, 5, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 20;
    key.shadow.camera.left  = -3;
    key.shadow.camera.right =  3;
    key.shadow.camera.top   =  5;
    key.shadow.camera.bottom= -1;
    key.shadow.bias = -0.0004;
    scene.add(key);

    // Rim (cyan-ish back light)
    const rim = new THREE.DirectionalLight(0x00e5b4, 0.35);
    rim.position.set(-3, 4, -2.5);
    scene.add(rim);

    // Fill (cool blue from front-left)
    const fill = new THREE.DirectionalLight(0x6080c0, 0.25);
    fill.position.set(-2, 1, 3);
    scene.add(fill);

    // Under-fill for skin sub-surface simulation
    const under = new THREE.PointLight(0xf04020, 0.08, 5);
    under.position.set(0, 0.5, 1.5);
    scene.add(under);
  }

  function _setupGround() {
    // Shadow catcher
    const geo  = new THREE.PlaneGeometry(14, 14);
    const mat  = new THREE.ShadowMaterial({ opacity: 0.3 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Visible ground
    const geoV = new THREE.PlaneGeometry(14, 14);
    const matV = new THREE.MeshStandardMaterial({ color: 0x06090e, roughness: 1, metalness: 0 });
    const meshV = new THREE.Mesh(geoV, matV);
    meshV.rotation.x = -Math.PI / 2;
    meshV.position.y = -0.001;
    meshV.receiveShadow = true;
    scene.add(meshV);

    // Grid
    const grid = new THREE.GridHelper(12, 24, 0x111a28, 0x0c1320);
    grid.position.y = 0.001;
    scene.add(grid);

    // Origin circle glow
    const ringGeo = new THREE.RingGeometry(0.28, 0.32, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5b4, opacity: 0.25, transparent: true, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    scene.add(ring);
  }

  function _bindEvents(canvasEl) {
    canvasEl.addEventListener('mousedown', e => {
      if (e.button === 0 && e.shiftKey) { isShiftDragging = true; autoRotate = false; }
      else if (e.button === 0) { isDragging = true; }
      prevMouse = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    });

    window.addEventListener('mousemove', e => {
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;

      if (isDragging && ModelBuilder.getGroup()) {
        ModelBuilder.getGroup().rotation.y += dx * 0.012;
      }
      if (isShiftDragging) {
        camera.position.x -= dx * 0.004;
        camera.position.y += dy * 0.004;
      }
      prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      isShiftDragging = false;
    });

    canvasEl.addEventListener('contextmenu', e => e.preventDefault());

    canvasEl.addEventListener('wheel', e => {
      camera.position.z += e.deltaY * 0.006;
      camera.position.z = Math.max(1.5, Math.min(12, camera.position.z));
    }, { passive: true });
  }

  function resize() {
    const vp = renderer.domElement.parentElement;
    const w = vp.clientWidth;
    const h = vp.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function _loop() {
    animId = requestAnimationFrame(_loop);
    const group = ModelBuilder.getGroup();
    if (autoRotate && group && !isDragging) {
      group.rotation.y += 0.004;
    }
    renderer.render(scene, camera);
  }

  function setView(view) {
    switch (view) {
      case 'front': camera.position.set(0, 1.65, 4.8);   camera.lookAt(0, 1.0, 0); break;
      case 'side':  camera.position.set(4.8, 1.65, 0);   camera.lookAt(0, 1.0, 0); break;
      case 'back':  camera.position.set(0, 1.65, -4.8);  camera.lookAt(0, 1.0, 0); break;
      case '34':    camera.position.set(3.4, 1.9, 3.4);  camera.lookAt(0, 1.0, 0); break;
      case 'top':   camera.position.set(0, 6.5, 0.5);    camera.lookAt(0, 1.0, 0); break;
    }
    if (view !== 'front') autoRotate = false;
  }

  function setAutoRotate(val) { autoRotate = val; }

  function setWireframe(val) {
    wireframeMode = val;
    scene.traverse(obj => {
      if (obj.isMesh && obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => { m.wireframe = val; });
        } else {
          obj.material.wireframe = val;
        }
      }
    });
  }

  function getScene() { return scene; }
  function getCamera() { return camera; }
  function isWireframe() { return wireframeMode; }

  return { init, resize, setView, setAutoRotate, setWireframe, getScene, getCamera, isWireframe };
})();
