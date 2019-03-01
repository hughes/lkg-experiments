import {
  Vector,
  Random,
  RandomInUnitRadius,
  RandomInUnitRadius_naive,
} from './geometry.js';

let holoplay;
let width, height;

function handleResize(renderer, camera) {
  width = window.innerWidth;
  height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width/height;
  camera.updateProjectionMatrix();
}

function transform(p) {
  const r2 = p.x * p.x + p.z * p.z;
  let r = Math.sqrt(r2);
  let angle = Math.atan2(p.x, p.z);

  const angleFactor = (angle + r2*4) * 5;

  const dA = 0.1*Math.sin(angleFactor) * (r+1);
  const newA = angle + dA;
  const newX = Math.cos(newA);
  const newZ = Math.sin(newA);

  const dr = 1/(r+0.1);
  r = r - dr;

  p.x = newX * r;
  p.z = newZ * r;

  p.y = p.y * 0.25 * Math.sin(r) / r;
  // p.y = p.y * Math.cos(r2*15);
  p.y = p.y * Math.cos(angle);
}

function initScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(15, window.innerWidth/window.innerHeight, 0.01, 100);
  camera.position.x = -0.96;
  camera.position.y = 3.3;
  camera.position.z = 9.95;
  const controls = new THREE.OrbitControls(camera);

  const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.5,
    roughness: 0.2,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  mesh.visible = false;

  const loader = new THREE.TextureLoader();
  const starTexture = loader.load('./star5.png');
  const starMaterial = new THREE.PointsMaterial({
    map: starTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    size: 0.01,
  });

  const axesHelper = new THREE.AxesHelper(2);
  scene.add(axesHelper);
  axesHelper.visible = false;

  const starsGeometry = new THREE.Geometry();
  const d = 1;
  console.time('generate points');
  for (let i = 0; i < 1e6; i++) {
    const position = RandomInUnitRadius_naive();

    transform(position);

    const star = new THREE.Vector3();
    star.x = position.x * d;
    star.y = position.y * d;
    star.z = position.z * d;
    starsGeometry.vertices.push(star);
  }
  console.timeEnd('generate points');
  const starField = new THREE.Points(starsGeometry, starMaterial);
  scene.add(starField);

  
  const cloudTexture = loader.load('./star4.png');
  const cloudMaterial = new THREE.PointsMaterial({
    map: cloudTexture,
    transparent: true,
    blending: THREE.SubtractiveBlending,
    depthWrite: false,
    size: 0.1,
  });
  const cloudsGeometry = new THREE.Geometry();
  console.time('generate points');
  for (let i = 0; i < 1e4; i++) {
    const position = RandomInUnitRadius_naive();

    transform(position);

    const cloud = new THREE.Vector3();
    cloud.x = position.x * d;
    cloud.y = position.y * d;
    cloud.z = position.z * d;
    cloudsGeometry.vertices.push(cloud);
  }
  console.timeEnd('generate points');
  const cloudField = new THREE.Points(cloudsGeometry, cloudMaterial);
  scene.add(cloudField);

  const light = new THREE.HemisphereLight(0xeeddff, 0x110022);
  light.position.set(0, 2, -2);
  scene.add(light);

  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 1);
  document.body.appendChild(renderer.domElement);

  //Resize window on size change
  window.addEventListener('resize', () => handleResize(renderer, camera));
  handleResize(renderer, camera);

  function update(dt) {
    const speed = {
      y: 0.2,
      // x: 1,
    }
    // starField.rotation.x += speed.x * dt;
    starField.rotation.y += speed.y * dt;
    cloudField.rotation.y += speed.y * dt;
    
    controls.update();

    // mesh.rotation.y += dt * 
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