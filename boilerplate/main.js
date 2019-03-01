let holoplay;

function handleResize(renderer, camera) {
  width = window.innerWidth;
  height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
}

function initScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(15, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 1;

  const geometry = new THREE.BoxGeometry( 0.15, 0.15, 0.15 );
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.5,
    roughness: 0.2,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const light = new THREE.HemisphereLight( 0xeeddff, 0x110022 );
  light.position.set( 0, 0.2, -0.2 );
  scene.add( light );

  const renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor( 0x000000, 1 );
  document.body.appendChild( renderer.domElement );

  //Resize window on size change
  window.addEventListener('resize', () => handleResize(renderer, camera));
  handleResize(renderer, camera);

  function update(dt) {
    const speed = {
      y: 0.8,
      x: 1,
    }
    mesh.rotation.x += speed.x * dt;
    mesh.rotation.y += speed.y * dt;
  }

  holoplay = new HoloPlay(scene, camera, renderer);
  animate(renderer, camera, scene, update);
}

function animate(renderer, camera, scene, update, lastFrameTime=new Date()) {
  const now = new Date();
  const dt = (now - lastFrameTime) / 1000;
  update(dt);
  
  if(holoplay && width === 2560 && height === 1600) {
    holoplay.render();
  } else {
    renderer.render( scene, camera );
  }
  
  requestAnimationFrame(() => animate(renderer, camera, scene, update, now));
}

initScene();