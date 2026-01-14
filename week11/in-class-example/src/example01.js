import * as THREE from 'three';

// construct a new scene
const scene = new THREE.Scene();

// construct your camera 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// ADD DESCRIPTIVE COMMENT HERE
const renderer = new THREE.WebGLRenderer();

// ADD DESCRIPTIVE COMMENT HERE 
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ADD A PRIMITIVE GEOMETRY BELOW AND COMMENT HERE
// Create a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// ADD DESCRIPTIVE COMMENT HERE
camera.position.z = 5

// ADD DESCRIPTIVE COMMENT HERE
const animate = function () {
    requestAnimationFrame(animate);
    // MAKE THE SHAPE DO SOMETHING HERE AND COMMENT 
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    // ADD DESCRIPTIVE COMMENT HERE
    renderer.render(scene, camera);
}
// ADD DESCRIPTIVE COMMENT HERE
animate();