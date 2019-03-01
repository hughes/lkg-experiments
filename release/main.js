let camera, scene, renderer, video;
let geometry, material, mesh;
let videoTexture, videoMaterial;
let shaderMaterial;
let suzanne, ref;
let holoplay = null;
let width, height, gltf;

let cubeScene, cubeCamera, pmremGenerator, pmreCubeUVPacker, cubeRenderTarget;
const label = 'new materials (f)';
const params = {
    roughness: 0.18,
    metalness: 0.50,
    exposure: 1.0,
    assignMaterials: function() {
        gltf.scene.children.forEach(child => {
            if(child.type === "Mesh" && child.name !== 'Suzanne') {
                child.material = new THREE.MeshStandardMaterial( {
                    color: new THREE.Color(Math.random() + 0.5, Math.random() + 0.5, Math.random()+0.5),
                    metalness: Math.random(),
                    roughness: Math.random(),
                    envMap: cubeRenderTarget.texture,
                } );
            }
        })
        ref = gltf.scene.getObjectByName('Icosphere');
        ref.material = shaderMaterial;
    },
};
params[label] = params.assignMaterials;
 
init();
animate();

 
function init() {
    scene = new THREE.Scene();

    // Create cube camera
    cubeCamera = new THREE.CubeCamera( 0.001, 1, 128 );
    scene.add( cubeCamera );
    pmremGenerator = new THREE.PMREMGenerator( cubeCamera.renderTarget.texture );
    pmreCubeUVPacker = new THREE.PMREMCubeUVPacker(pmremGenerator.cubeLods);
    cubeRenderTarget = pmreCubeUVPacker.CubeUVRenderTarget;
 
    camera = new THREE.PerspectiveCamera(12.5, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 1;

    video = document.getElementById( 'video' );

    videoTexture = new THREE.VideoTexture( video );
 
    geometry = new THREE.BoxGeometry( 0.15, 0.15, 0.15 );
    // material = new THREE.MeshNormalMaterial();
    var linematerial = new THREE.LineBasicMaterial({
        color: 0x0000ff,
    });
    
    var linegeometry = new THREE.Geometry();
    let w = 0.16;
    let h = 0.095;
    let d = 0.1;
    linegeometry.vertices.push(
        new THREE.Vector3( -w, -h, -d ),
        new THREE.Vector3( -w, h, -d ),
        new THREE.Vector3( w, h, -d ),
        new THREE.Vector3( w, -h, -d ),

        new THREE.Vector3( -w, -h, -d ),

        new THREE.Vector3( -w, -h, d ),
        new THREE.Vector3( -w, h, d ),
        new THREE.Vector3( -w, h, -d ),
        
        new THREE.Vector3( -w, h, d ),
        new THREE.Vector3( -w, h, -d ),
        new THREE.Vector3( -w, h, d ),

        new THREE.Vector3( w, h, d ),
        new THREE.Vector3( w, h, -d ),
        new THREE.Vector3( w, h, d ),

        new THREE.Vector3( w, -h, d ),
        new THREE.Vector3( w, -h, -d ),
        new THREE.Vector3( w, -h, d ),
        
        new THREE.Vector3( -w, -h, d ),
    );
    // scene.add( new THREE.Line( linegeometry, linematerial ) );
    
    videoMaterial = new THREE.MeshBasicMaterial( { map: videoTexture } );
    
	// create the sphere's material
	shaderMaterial = new THREE.ShaderMaterial({
		vertexShader:   document.getElementById('vertexshader').innerText,
        fragmentShader: document.getElementById('fragmentshader').innerText,
        uniforms: {
            texture: new THREE.Uniform(videoTexture),
            resolution: new THREE.Uniform(new THREE.Vector2(640, 480)),
        },
        side: THREE.DoubleSide,
	});
 
    mesh = new THREE.Mesh( geometry, material );
    // scene.add( mesh );
    
    light = new THREE.HemisphereLight( 0x222233, 0x000000 );
    light.position.set( 0, 0.2, -0.2 );
    // scene.add( light );

    //  light = new THREE.PointLight( 0xffffff, 1, 100 );
    // light.position.set( 0.1, 0.1, 0.2 );
    // scene.add( light );
 
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    // renderer.autoClear = false;
    renderer.setClearColor( 0x000000, 1 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //Resize window on size change
    window.addEventListener('resize', handleResize);
    function handleResize() {
        width = window.innerWidth;
        height = window.innerHeight;
        console.log(width, height);
        renderer.setSize(width, height);
        camera.aspect = width/height;
        camera.updateProjectionMatrix();
    }
    handleResize();
    initWebcam();    

    function initWebcam() {
        
        if ( navigator.mediaDevices && navigator.mediaDevices.getUserMedia ) {

            var constraints = { video: { width: 640, height: 480, facingMode: 'user' } };

            navigator.mediaDevices.getUserMedia( constraints ).then( function ( stream ) {

                // apply the stream to the video element used in the texture

                video.srcObject = stream;
                video.play();

            } ).catch( function ( error ) {

                console.error( 'Unable to access the camera/webcam.', error );

            } );

        } else {

            console.error( 'MediaDevices interface not available.' );

        }

    }

    loadModels();
    function loadModels() {
        // Instantiate a loader
        var loader = new THREE.GLTFLoader();

        // Optional: Provide a DRACOLoader instance to decode compressed mesh data
        // THREE.DRACOLoader.setDecoderPath( '/examples/js/libs/draco' );
        // loader.setDRACOLoader( new THREE.DRACOLoader() );

        // Load a glTF resource
        loader.load(
            // resource URL
            './stage.glb',
            // called when the resource is loaded
            function (_gltf) {
                gltf = _gltf;
                console.log('successful load')
                // let model = gltf.scene.getObjectByName('Plane');
                // model.material = videoMaterial;
                // let sphere = gltf.scene.getObjectByName('Icosphere');
                // sphere.material = shaderMaterial;
                suzanne = gltf.scene.getObjectByName('Suzanne');
                suzanne.material = new THREE.MeshStandardMaterial( {
					color: 0xffffff,
					metalness: 0.5,
                    roughness: 0.2,
                    envMap: cubeRenderTarget.texture,
                } );
                
                params.assignMaterials();
                document.addEventListener('keypress', e => {
                    if(e.key === 'f') {
                        params.assignMaterials();
                    }
                })

                

                scene.add( gltf.scene );
                // scene.background = cubeCamera.renderTarget.texture;

            },
            // called while loading is progressing
            function ( xhr ) {

                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

            },
            // called when loading has errors
            function ( error ) {

                console.log( 'An error happened', error );

            }
        );
    }


    holoplay = new HoloPlay(scene, camera, renderer);
 
    var gui = new dat.GUI();

    gui.add(params, 'roughness', 0, 1, 0.01);
    gui.add(params, 'metalness', 0, 1, 0.01);
    gui.add(params, 'exposure', 0, 15, 0.1);
    gui.add(params, label);
    gui.open();
}
 
function animate() {
 
    requestAnimationFrame( animate );
    renderer.toneMappingExposure = params.exposure;
 
    // mesh.rotation.x += 0.01;
    // mesh.rotation.y += 0.02;
    // renderCubeScene();
    if(ref) {
        suzanne.material.roughness = params.roughness;
        suzanne.material.metalness = params.metalness;

        ref.visible = true;
        cubeCamera.position.copy(ref.position);
        cubeCamera.update( renderer, scene );
        ref.visible = false;
        pmremGenerator.update( renderer );
        pmreCubeUVPacker.update(renderer);
    }
    
    if(holoplay && width === 2560 && height === 1600) {
        holoplay.render();
    } else {
        renderer.render( scene, camera );
    }
 
}