/**
 * Initializes a webcam video stream for an HTML video element
 * @param {HTMLVideoElement} videoElement 
 * @param {number} width
 * @param {number} height
 */
async function initWebcam(videoElement, width, height) {
  // create a video stream
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {width, height},
    });
  } catch(error) {
    return console.error('Unable to access the webcam.', error);
  }

  // apply the stream to the video element
  videoElement.srcObject = stream;
  videoElement.play();
}

function initRenderer(container) {
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  // renderer.toneMapping = THREE.LinearToneMapping;
  // renderer.toneMappingExposure = 1.0;
  // renderer.autoClear = false;
  // renderer.setClearColor(0x000000, 1);
  renderer.setSize(container.offsetWidth, container.offsetHeight );
  container.appendChild(renderer.domElement);
  return renderer;
}


function runDemo(container, demo) {
  container.onclick = null;
  demo(container);
}

const demos = {basicWebcamDemo};
function basicWebcamDemo(container) {
  const videoElement = document.getElementById('video');
  
  // initialize the webcam
  const videoWidth = 640, videoHeight = 480;
  initWebcam(videoElement, videoWidth, videoHeight);

  // create a renderer and scene
  const renderer = initRenderer(container);
  const {width, height} = renderer.getSize();
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(
    -width/2, width/2, height/2, -height/2,
    1, 1000,
  );
  camera.position.z = 1;
  scene.add(camera);

  // create a video texture
  videoTexture = new THREE.VideoTexture(videoElement);

  // populate the scene
  const aspectRatio = videoHeight / videoWidth;
  plane = new THREE.PlaneGeometry(width, width * aspectRatio);
  videoMaterial = new THREE.MeshBasicMaterial({map: videoTexture});
  mesh = new THREE.Mesh(plane, videoMaterial);
  scene.add(mesh);
  
  animate(renderer, scene, camera);
}
function shaderDemo(container) {
  const videoElement = document.getElementById('video');
  
  // initialize the webcam
  const videoWidth = 640, videoHeight = 480;
  initWebcam(videoElement, videoWidth, videoHeight);

  // create a renderer, scene and camera
  const renderer = initRenderer(container);
  const {width, height} = renderer.getSize();
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -width/2, width/2, height/2, -height/2,
    1, 10000,
  );
  camera.position.z = 1000;
  scene.add(camera);

  // create a video texture
  const videoTexture = new THREE.VideoTexture(videoElement);
  
  // create the shader material
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader:   document.getElementById('vertexshader').innerText,
    fragmentShader: document.getElementById('fragmentshader').innerText,
    uniforms: {
      texture: new THREE.Uniform(videoTexture),
    },
  });

  // populate the scene width a sphere & shader
  const sphere = new THREE.SphereGeometry(100, 10, 10);
  const mesh = new THREE.Mesh(sphere, shaderMaterial);
  scene.add(mesh);
  
  function update(t, dt) {
    // wiggle the sphere a bit
    mesh.rotation.y = Math.sin(t);
    mesh.rotation.x = Math.cos(t * 0.8);
  }
  
  animate(renderer, scene, camera, update);
}

function cubeMapDemo(container) {
  
  const videoElement = document.getElementById('video');
  
  // initialize the webcam
  const videoWidth = 640, videoHeight = 480;
  initWebcam(videoElement, videoWidth, videoHeight);

  // create a scene for the cubemap
  const cubeMapScene = new THREE.Scene();
  const cubeMapCamera = new THREE.CubeCamera(1, 1000, 128);

  // create a video texture
  const videoTexture = new THREE.VideoTexture(videoElement);
  
  // create the shader material
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader:   document.getElementById('vertexshader').innerText,
    fragmentShader: document.getElementById('fragmentshader').innerText,
    uniforms: {
      texture: new THREE.Uniform(videoTexture),
    },
  });

  // populate the cubemap scene with a sphere & shader
  const sphere = new THREE.SphereGeometry(100, 10, 10);
  const sphereMesh = new THREE.Mesh(sphere, shaderMaterial);
  cubeMapScene.add(sphereMesh);

  // create a renderer, scene and camera
  const renderer = initRenderer(container);
  const {width, height} = renderer.getSize();
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(
    -width/2, width/2, height/2, -height/2,
    1, 10000,
  );
  camera.position.z = 1000;
  scene.add(camera);

  // populate the scene with a textured plane
  const aspectRatio = videoHeight / videoWidth;
  const plane = new THREE.PlaneGeometry(width, width * aspectRatio);
  const material = new THREE.MeshBasicMaterial({map: cubeMapCamera.renderTarget});
  const mesh = new THREE.Mesh(plane, material);
  scene.add(mesh);

  function update() {
    cubeMapCamera.update(renderer, cubeMapScene);
  }
  
  animate(renderer, scene, camera, update);
}

function animate(renderer, scene, camera) {
  requestAnimationFrame(() => animate(renderer, scene, camera));
  renderer.render(scene, camera);
}

function populateDemoSources() {
  document.querySelectorAll('[data-demo]').forEach(container => {
    const demo = demos[container.getAttribute('data-demo')];
    container.onclick = () => {
      container.innerHTML = '';
      runDemo(container, demo);
    }
    
    // check for a nearby code block to populate
    const sourceDetails = container.nextElementSibling.querySelector('pre')
    const source = document.createElement('code');
    
    if(source) {
      source.innerHTML = demo.toString();
      source.classList = 'language-js hljs javascript';
      sourceDetails.appendChild(source);
    }
  });
}
populateDemoSources();