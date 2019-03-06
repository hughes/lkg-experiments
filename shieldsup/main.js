let width, height;
let holoplay;
let isFullscreen = false;


async function getSource(path) {
  const response = await fetch(path);
  return await response.text();
}

function handleResize(renderer, camera) {
  width = window.innerWidth;
  height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
}


async function initScene() {
  const scene = new THREE.Scene();
  const shipScene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(15, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 1;
  const controls = new THREE.OrbitControls(camera);

  const geometry = new THREE.BoxGeometry( 0.15, 0.15, 0.15 );
  const material = new THREE.MeshStandardMaterial({
    color: 0xff6600,
    metalness: 0.5,
    roughness: 0.8,
  });
  // const mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  const gltf = await loadGLTF('./stage.glb');

  const vertexShaderSrc = await getSource(document.getElementById('vertexShader').getAttribute('src'));
  const shieldRingShaderSrc = await getSource(document.getElementById('shieldRingShader').getAttribute('src'));
  const shipShaderSrc = await getSource(document.getElementById('shipShader').getAttribute('src'));
	const shieldRingMaterial = new THREE.ShaderMaterial({
		vertexShader: vertexShaderSrc,
    fragmentShader: shieldRingShaderSrc,
    uniforms: {
      health: new THREE.Uniform(0.85),
      goodShieldColor: new THREE.Uniform(new THREE.Vector3(0.4, 0.55, 1.00)),
      lowShieldColor: new THREE.Uniform(new THREE.Vector3(1.0, 0.25, 0.2)),
    },
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });
  const ring = gltf.scene.getObjectByName('shield_ring');
  ring.material = shieldRingMaterial;
  scene.add(ring);

  const sphere = gltf.scene.getObjectByName('shield_sphere');
  sphere.material = material;
  // scene.add(sphere);

  const shipMaterial = new THREE.ShaderMaterial({
		vertexShader: vertexShaderSrc,
    fragmentShader: shipShaderSrc,
    uniforms: {
      resolution: new THREE.Uniform(new THREE.Vector2(width, height)),
    },
    side: THREE.DoubleSide,
  });
  const shipLineMaterial = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    // wireframe: true
  });
  const ship = gltf.scene.getObjectByName('ship2');
  ship.material = material;
  scene.add(ship);
  // scene.add(gltf.scene);

  const light = new THREE.HemisphereLight( 0xeeddff, 0x110022 );
  light.position.set( 0, -0.6, -0.6 );
  light.intensity = 4;
  scene.add(light);

  const renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor( 0x000000, 1 );
  document.body.appendChild( renderer.domElement );


  
  const gui = new dat.GUI();
  const params = {
    health: shieldRingMaterial.uniforms.health.value,
    goodShieldColor: shieldRingMaterial.uniforms.goodShieldColor.value,
  };
  gui.add(params, 'health', 0, 1, 0.01);
  // gui.addColor(params, 'goodShieldColor');
  gui.open();

  function update(dt) {
    // controls.update();
    const now = new Date();
    const t = now / 1000;
    const oldHealth = shieldRingMaterial.uniforms.health.value;
    let newHealth;
    if(true || isFullscreen) {
      newHealth = Math.sin(t + Math.sin(t) * 0.5) + 0.7;
    } else {
      newHealth = params.health;
    }
    shieldRingMaterial.uniforms.health.value = newHealth;
    if(newHealth < oldHealth) {
      // maybe someone shot us!
      if(Math.random() < 2 * dt) {
        console.log('pew');
      }
    }

    shipMaterial.uniforms.resolution.value.x = width;
    shipMaterial.uniforms.resolution.value.y = height;

    ship.rotation.y += Math.sin(t * 4) * 0.001 + Math.sin(t * 2.8) * 0.0005;
    ship.rotation.x += Math.cos(t * 6.8) * 0.001;
    ship.rotation.z = Math.cos(t * 1.8) * 0.05;
  }


  //Resize window on size change
  window.addEventListener('resize', () => handleResize(renderer, camera));
  handleResize(renderer, camera);
  holoplay = new HoloPlay(scene, camera, renderer);
  animate(renderer, camera, scene, update);
}


async function loadGLTF(path) {
  const loader = new THREE.GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(path, resolve, null, reject);
  });
}

function animate(renderer, camera, scene, update, lastFrameTime=new Date()) {
  const now = new Date();
  const dt = (now - lastFrameTime) / 1000;
  update(dt);
  
  isFullscreen = holoplay && width === 2560 && height === 1600;
  if(isFullscreen) {
    holoplay.render(scene, camera, renderer);
  } else {
    renderer.render(scene, camera);
  }
  
  requestAnimationFrame(() => animate(renderer, camera, scene, update, now));
}

initScene();