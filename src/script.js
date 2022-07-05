import './style.css'
import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

const gui = new dat.GUI()

// Textures
const textureLoader = new THREE.TextureLoader()

const redMatcap = textureLoader.load('/textures/matcaps/red.png');
const leadMatcap = textureLoader.load('/textures/matcaps/lead.png');
const blackMatcap = textureLoader.load('/textures/matcaps/black.png');
const fibers = textureLoader.load('/textures/fibers2.jpeg');


const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const redMaterial = new THREE.MeshMatcapMaterial();
redMaterial.matcap = redMatcap;

const leadMaterial = new THREE.MeshMatcapMaterial();
leadMaterial.matcap = leadMatcap;

const blackMaterial = new THREE.MeshMatcapMaterial();
blackMaterial.matcap = blackMatcap;

const cloudMaterial = new THREE.MeshBasicMaterial({map: fibers});
cloudMaterial.color = new THREE.Color('darkred');

const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: vertexShader,  
    fragmentShader: fragmentShader,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
});

const glowGeometry = new THREE.IcosahedronGeometry(0.46, 1);
const glow = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glow);

const tweaks = {
    save: () => takeScreenshot(3000, 3000),
    cageWidth: 0.02,
}

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 64, 64),
    redMaterial
)

const torusVL = new THREE.Mesh(
    new THREE.TorusGeometry(0.93, tweaks.cageWidth, 64, 128),
    blackMaterial
);
torusVL.rotation.y = 3.14159 / 2.6;

const torusHT = new THREE.Mesh(
    new THREE.TorusGeometry(0.93, tweaks.cageWidth, 64, 128),
    blackMaterial
);
torusHT.rotation.x = 3.14159 / 2.6;

const torusHB = new THREE.Mesh(
    new THREE.TorusGeometry(0.93, tweaks.cageWidth, 64, 128),
    blackMaterial
);
torusHB.rotation.x = -3.14159 / 2.6;

const torusHC = new THREE.Mesh(
    new THREE.TorusGeometry(0.93, tweaks.cageWidth, 64, 128),
    blackMaterial
);
torusHC.rotation.x = -3.14159 / 2;

const torus1 = new THREE.Mesh(
    new THREE.TorusGeometry(0.77, 0.17, 64, 128),
    leadMaterial
);

const torusVR = new THREE.Mesh(
    new THREE.TorusGeometry(0.93, tweaks.cageWidth, 64, 128),
    blackMaterial 
)
torusVR.rotation.y = -3.14159 / 2.6;

const torusVC = new THREE.Mesh(
    new THREE.TorusGeometry(0.93, tweaks.cageWidth, 64, 128),
    blackMaterial 
)
torusVC.rotation.y = -3.14159 / 2;

const torus2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.52, 0.09, 32, 64),
    cloudMaterial
)

scene.add(torusVL, torus1, torusHT, torusHB, torusHC, torusVR, torusVC, torus2, sphere);

// gui.add(tweaks, 'cageWidth', 0, 0.1, 0.001).name('Cage Thickness');
gui.add(tweaks, 'save')

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 1.75
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    controls.update()
    renderer.render(scene, camera)
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