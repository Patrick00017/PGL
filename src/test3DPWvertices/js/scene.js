let scene
let camera
let renderer
window.addEventListener('resize', onResize, false)

function init() {
    let vertices = []
    let points = JSON.parse(body_vertices).data[0]
    for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points[i].length; j++) {
            vertices.push(points[i][j])
        }
    }
    let float_vertices = new Float32Array(vertices)

    //joint
    let poses = JSON.parse(joint).data[0]
    // const pose_material = new THREE.LineBasicMaterial({color: 0x0000ff});
    const pose_material = new THREE.PointsMaterial({color: 0x0000ff});
    const pose_points = [];
    for (let i = 0; i < poses.length; i++) {
        pose_points.push(...poses[i])
    }

    const pose_geometry = new THREE.BufferGeometry();
    pose_geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( pose_points, 3 ) );
    const line = new THREE.Points(pose_geometry, pose_material);
    line.position.set(0, 0, 0)


    let stats = initStats()

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / innerHeight, 0.1, 100)
    renderer = new THREE.WebGLRenderer()
    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true
    camera.position.set(-1, 2, 1);
    camera.lookAt(scene.position);


    const geometry = new THREE.BufferGeometry();

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.addAttribute('position', new THREE.BufferAttribute(float_vertices, 3));
    const material = new THREE.MeshBasicMaterial({color: 0xff0000});
    const obj = new THREE.Mesh(geometry, material);
    obj.position.set(0, 0, 0)
    scene.add(obj)
    scene.add(line)


    // add the output of the renderer to the html element
    document.getElementById("webgl-output").appendChild(renderer.domElement);
    // render the scene

    var controls = new function () {
        this.bonex = 0;
        this.boney = 0;
        this.bonez = 0;
    }
    var gui = new dat.GUI();
    gui.add(controls, 'bonex', -10, 10);
    gui.add(controls, 'boney', -10, 10);
    gui.add(controls, 'bonez', -10, 10)

    function renderScene() {
        stats.update()
        line.position.x = controls.bonex
        line.position.y = controls.boney
        line.position.z = controls.bonez
        requestAnimationFrame(renderScene)
        renderer.render(scene, camera);
    }

    renderScene()
}


function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}