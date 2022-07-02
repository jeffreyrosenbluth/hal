import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Textures
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const redMatcap = textureLoader.load('/textures/matcaps/red.png');
const goldMatcap = textureLoader.load('/textures/matcaps/gold.png');
const fibers = textureLoader.load('/textures/fibers2.jpeg');

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/city/px.png',
    '/textures/environmentMaps/city/nx.png',
    '/textures/environmentMaps/city/py.png',
    '/textures/environmentMaps/city/ny.png',
    '/textures/environmentMaps/city/pz.png',
    '/textures/environmentMaps/city/nz.png'
])

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
// sphereMaterial.opacity = 0.2;
sphereMaterial.alphaMap = fibers;
sphereMaterial.alphaTest = 0.0;
sphereMaterial.side = THREE.DoubleSide;

const ballMaterial = new THREE.MeshMatcapMaterial()
ballMaterial.matcap = goldMatcap

const material = new THREE.MeshStandardMaterial()
material.metalness = 1.0
material.roughness = 0.0
material.envMap = environmentMapTexture

const tweaks = {
    save: () => takeScreenshot(3000, 3000),
    cyl_length: 0.3,
}

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.83, 64, 64),
    sphereMaterial
)
sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))
// sphere.rotation.x = -1.0;
// sphere.position.x = - 1.5

const cyl1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.04, tweaks.cyl_length, 64, 64),
    ballMaterial
)
cyl1.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))
cyl1.position.z = 0.78;
cyl1.position.y = 0.22;

const cyl2 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05,tweaks.cyl_length, 64, 64),
    ballMaterial
)
cyl2.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))
cyl2.rotation.z = 0.8;
cyl2.position.z = 0.78;
cyl2.position.y = -0.16;
cyl2.position.x = 0.18;

const cyl3 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, tweaks.cyl_length, 64, 64),
    ballMaterial
)
cyl3.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))
cyl3.rotation.z = -0.8;
cyl3.position.z = 0.78;
cyl3.position.y = -0.16;
cyl3.position.x = -0.18;

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(1.05, 0.1, 64, 128),
    material
)
torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2))
// torus.position.x = 1.5
scene.add(sphere, cyl1, cyl2, cyl3, torus)

let sphereFolder = gui.addFolder('Sphere');
sphereFolder.add(sphereMaterial, 'alphaTest', 0, 1, 0.01).name('Alpha');
sphereFolder.add(sphere.rotation, 'x', 0, 3.1415, 0.01).name('Rotation');
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