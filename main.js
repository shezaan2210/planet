import './style.css'

import * as THREE from 'three';
import gsap from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// Create the scene
const scene = new THREE.Scene();

// Loading Screen Elements
const loadingScreen = document.getElementById('loadingScreen');
const progressBar = document.getElementById('progressBar');
const loadingText = document.getElementById('loadingText');

// Setup loading manager
const loadingManager = new THREE.LoadingManager();

// Update progress
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  const progress = (itemsLoaded / itemsTotal) * 100;
  progressBar.style.width = `${progress}%`;
  loadingText.innerText = `Loading... ${Math.round(progress)}%`;
};

// On load, fade out loading screen
loadingManager.onLoad = () => {
  gsap.to(loadingScreen, { opacity: 0, duration: 1, onComplete: () => {
    loadingScreen.style.display = 'none';
  }});
};

// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager);

// Create a camera
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 9);


let isThrottled = false;
let scrollCount = 0

function throttleWheelEvent(event) {
  if (!isThrottled) {
    isThrottled = true;
    console.log(event.deltaY < 0 ? 'Scrolled Up' : 'Scrolled Down');

    scrollCount = (scrollCount + 1) % 4

    const headings = document.querySelectorAll('.headings')
    const paragraph = document.querySelectorAll('.para')
    gsap.to([headings, paragraph], {
      y: `-=${100}%`,
      duration: 1,
      ease: 'power4.inOut'
    })



    gsap.to(spheres.rotation, {
          y: `+=${Math.PI / 2}`,
          duration: 1,
          ease: 'power4.inOut',
        })

        spheresMesh.forEach((sphere) => {
          gsap.to(sphere.rotation, {
            y: `-=${Math.PI}`,
            duration: 1,
            ease: 'power4.inOut'
          });
        });

    if(scrollCount === 0){
      gsap.to([headings, paragraph], {
        y: 0,
        duration: 1,
        ease: 'power4.inOut'
      })
    }

    setTimeout(() => {
      isThrottled = false;
    }, 2000); // Throttle duration of 2 seconds
  }


}

window.addEventListener('wheel', throttleWheelEvent);



const canvas = document.querySelector('#webgl')

// Create a renderer and set its size
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Load HDR environment
const loader = new RGBELoader(loadingManager);
loader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr', (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});

const bigSphereRadius = 50;
const bigSphereGeometry = new THREE.SphereGeometry(bigSphereRadius, 64, 64);
const starTexture = textureLoader.load('./stars3.jpg');
starTexture.colorSpace = THREE.SRGBColorSpace;
const bigSphereMaterial = new THREE.MeshStandardMaterial({
  map: starTexture,
  transparent: true,
  opacity: 1,
  side: THREE.BackSide // Render the inside of the sphere
});
const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);
scene.add(bigSphere);

const radius = 1.3;
const segments = 64;
const textures = [
  './mercury/mercury.jpg',
  './earth/earth2.jpg',
  './mars/mars2.jpg',
  './venus/venus2.jpg'
];

const spheresMesh = []

const cloudsTexture = textureLoader.load('./earth/clouds.jpg'); // Cloud texture for Earth
const atmosphereTexture = textureLoader.load('./venus/atmosphere.jpg')
atmosphereTexture.colorSpace = THREE.SRGBColorSpace

const spheres = new THREE.Group();
const orbitRadius = 4.5;

for (let i = 0; i < 4; i++) {
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({});
  const sphere = new THREE.Mesh(geometry, material);

  spheresMesh.push(sphere)

  // Load each planet's texture
  const texture = textureLoader.load(textures[i]);
  texture.colorSpace = THREE.SRGBColorSpace;
  material.map = texture;

  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);

  // Add Earth clouds layer
  if (i === 1) { // Earth is at index 1
    const cloudsGeometry = new THREE.SphereGeometry(radius * 1.002, segments, segments);
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      alphaMap: cloudsTexture,
      transparent: true,
      opacity: 0.4,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    sphere.add(cloudsMesh); // Add clouds as a child of the Earth sphere
  }

  spheres.add(sphere);
}

spheres.rotation.x = 0.12;
spheres.position.y = -0.7;
scene.add(spheres);



// Animation loop
function animate() {
  requestAnimationFrame(animate);
  spheresMesh.forEach((sphere)=>{
    sphere.rotation.y += .001
  })
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});

animate();
