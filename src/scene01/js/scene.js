let scene
let camera
let renderer
window.addEventListener('resize', onResize, false)
function init(){
    let stats = initStats()

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/innerHeight, 0.1, 100)
    renderer = new THREE.WebGLRenderer()
    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true

    const spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(-40, 40, -15);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    spotLight.shadow.camera.far = 130;
    spotLight.shadow.camera.near = 40;

    const axes = new THREE.AxesHelper(20);
    scene.add(axes);
    const planeGeometry = new THREE.PlaneGeometry(60, 20);
    const planeMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(15, 0, 0);
    plane.receiveShadow = true
    scene.add(plane);
    // create a cube
    const cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
    const cubeMaterial = new THREE.MeshLambertMaterial({
        color: 0xff0000
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(-4, 3, 0);
    cube.castShadow = true
    scene.add(cube);
    // create a sphere
    const sphereGeometry = new THREE.SphereGeometry(4, 20, 20);
    const sphereMaterial = new THREE.MeshLambertMaterial({
        color: 0x7777FF
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true
    sphere.position.set(20, 4, 2);
    scene.add(sphere);
    scene.add(spotLight)
    // position and point the camera to the center of the scene
    camera.position.set(-30, 40, 30);
    camera.lookAt(scene.position);
    // add the output of the renderer to the html element
    document.getElementById("webgl-output").appendChild(renderer.domElement);
    // render the scene

    var controls = new function() {
        this.rotationSpeed = 0.02;
        this.bouncingSpeed = 0.03;
        this.fogDensity = 0.01;
    }
    var gui = new dat.GUI();
    gui.add(controls, 'rotationSpeed', 0, 0.5);
    gui.add(controls, 'bouncingSpeed', 0, 0.5);
    gui.add(controls, 'fogDensity', 0, 0.5)

    let step = 0
    function renderScene(){
        stats.update()
        scene.fog = new THREE.FogExp2(0x000000, controls.fogDensity)
        // scene.overrideMaterial = new THREE.MeshLambertMaterial({color: 0xaaaaaa});

        cube.rotation.x += controls.rotationSpeed
        cube.rotation.y += controls.rotationSpeed
        cube.rotation.z += controls.rotationSpeed

        step+=controls.bouncingSpeed;
        sphere.position.x = 20 + 10*(Math.cos(step));
        sphere.position.y = 2 + 10*Math.abs(Math.sin(step));

        requestAnimationFrame(renderScene)
        renderer.render(scene, camera);
    }
    renderScene()
}


function onResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}