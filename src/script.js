import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const gui = new dat.GUI()

// Textures
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const redMatcap = textureLoader.load('/textures/matcaps/red.png');
const goldMatcap = textureLoader.load('/textures/matcaps/gold.png');
const fibers = textureLoader.load('/textures/fibers2.jpeg');

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/bridge/px.png',
    '/textures/environmentMaps/bridge/nx.png',
    '/textures/environmentMaps/bridge/py.png',
    '/textures/environmentMaps/bridge/ny.png',
    '/textures/environmentMaps/bridge/pz.png',
    '/textures/environmentMaps/bridge/nz.png'
])

const gltfLoader = new GLTFLoader();

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const light = new THREE.PointLight(0xffffff, 0.5)
light.position.x = 2
light.position.y = 3
light.position.z = 4
scene.add(light)

const sphereMaterial = new THREE.MeshMatcapMaterial();
sphereMaterial.matcap = redMatcap;
sphereMaterial.transparent = true;
// sphereMaterial.alphaMap = fibers;
sphereMaterial.opacity = 0.3
// sphereMaterial.alphaTest = 0.25;
sphereMaterial.side = THREE.DoubleSide;

const ballMaterial = new THREE.MeshMatcapMaterial()
ballMaterial.matcap = goldMatcap

const material = new THREE.MeshStandardMaterial()
material.metalness = 0.8
material.roughness = 0.1
material.envMap = environmentMapTexture

const tweaks = {
    save: () => takeScreenshot(3000, 3000),
    cyl_length: 0.4,
}

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.83, 64, 64),
    sphereMaterial
)
sphere.rotation.x = 0.5;

const cyl1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.04, tweaks.cyl_length, 64, 64),
    ballMaterial
)
cyl1.position.y = 0.35;

const cyl2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05,tweaks.cyl_length, 64, 64),
    ballMaterial
)
cyl2.rotation.z = 0.8;
cyl2.position.y = -0.22;
cyl2.position.x = 0.25;

const cyl3 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, tweaks.cyl_length, 64, 64),
    ballMaterial
)
cyl3.rotation.z = -0.8;
cyl3.position.y = -0.22;
cyl3.position.x = -0.25;

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.1, 64, 128),
    material
)

const starMaterial = new THREE.MeshStandardMaterial();
starMaterial.color = new THREE.Color('red');
starMaterial.flatShading = true;


const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 1), starMaterial);
scene.add(sphere, torus);

gltfLoader.load(
    '/models/barrel/barrel.gltf',
    (gltf) =>
    {
        const barrel = gltf.scene.children[0];
        barrel.position.y = -0.45;
        scene.add(barrel);
    },
    (progress) =>
    {
        console.log('progress')
        console.log(progress)
    },
    (error) =>
    {
        console.log('error')
        console.log(error)
    }
)

let sphereFolder = gui.addFolder('Sphere');
sphereFolder.add(sphereMaterial, 'opacity', 0, 1, 0.01).name('Opacity');
let ringFolder = gui.addFolder('Ring');
ringFolder.add(material, 'metalness').min(0).max(1).step(0.0001).name('Reflectivity');
ringFolder.add(material, 'roughness').min(0).max(1).step(0.0001).name('Roughness');
ringFolder.add(torus.rotation, 'y', 0, 3.1415, 0.01).name('Vertical rotation')
ringFolder.add(torus.rotation, 'x', 0, 3.1415, 0.01).name('Horizontal rotation')
gui.add(tweaks, 'save')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 1.75
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

function dataURIToBlob(dataURI) {
    const binStr = window.atob(dataURI.split(',')[1]);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        arr[i] = binStr.charCodeAt(i);
    }
    return new window.Blob([arr]);
}

function saveDataURI(name, dataURI) {
    const blob = dataURIToBlob(dataURI);

    // force download
    const link = document.createElement('a');
    link.download = name;
    link.href = window.URL.createObjectURL(blob);
    link.onclick = () => {
        window.setTimeout(() => {
            window.URL.revokeObjectURL(blob);
            link.removeAttribute('href');
        }, 500);

    };
    link.click();
}


function defaultFileName(ext) {
    const str = `${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}${ext}`;
    return str.replace(/\//g, '-').replace(/:/g, '.');
}

function takeScreenshot(width, height) {

    // set camera and renderer to desired screenshot dimension
    camera.aspect = 1.0;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);

    renderer.render(scene, camera, null, false);

    const DataURI = renderer.domElement.toDataURL('image/png');

    // save
    saveDataURI(defaultFileName('.png'), DataURI);

    // reset to old dimensions by invoking the on window resize function
    window.dispatchEvent(new Event('resize'));

}