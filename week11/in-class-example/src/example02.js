import * as THREE from 'three';

// this is a v useful example allowing for mouse & touchscreen interactions
// https://threejs.org/docs/#OrbitControls
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// imports from custom module
import { getGeodesicDomeMesh, getSpikyMesh, getTetrahedronMesh, Point3d } from './geom.js';


let rendererSize = getRendererSize();

const rotationSpeed = 2 * Math.PI / 8000;

const camera = new THREE.PerspectiveCamera(
    70, // field of view
    rendererSize.width / rendererSize.height, // ratio
);

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer( { antialias: true });

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( rendererSize.width, rendererSize.height );
renderer.setAnimationLoop( animate );
document.getElementById("threejs_animation").appendChild( renderer.domElement );

window.addEventListener( 'resize', onWindowResize, false );

// add orbit controls
const controls = new OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 0, 30 );
controls.update();

// ============================= MATERIAL ===================================
const material = new THREE.MeshPhysicalMaterial({
    roughness: 0.11,
    flatShading: true,
    metalness: .42,
    color: "#000000",
    clearcoat: 0.99,
    transmission: 0.65,
    reflectivity: 0.65,
    side: THREE.DoubleSide,
})

// ============================= GEOM INPUT PARAMETERS ===========================
const geoDomeRadius = 12.
const iterationsCount = 3;
const spacing = geoDomeRadius * 3;

const positions = [
    new THREE.Vector3( -spacing, 0, 0 ),
]

// INPUT GEOMETRY
const initialGeoms = [
    getTetrahedronMesh( geoDomeRadius ),
];
// THREE GEOMETRY
const displayMesh = getNewMeshes( initialGeoms, iterationsCount )[0];

scene.add( displayMesh );

// ============================ LIGHTING =================================
const directionalLight1 = new THREE.DirectionalLight(
    "#ffffff",
    100,
);
directionalLight1.position.set( -20, 20, 0 );

const directionalLight2 = new THREE.DirectionalLight(
    "#ffffff",
    100,
);
directionalLight2.position.set( -4, 5, 5 );

const directionalLight3 = new THREE.DirectionalLight(
    "#ffffff",
    50,
);
directionalLight3.position.set( 0, 5, 5 );

const directionalLight4 = new THREE.DirectionalLight(
    "#ffffff",
    50,
);
directionalLight4.position.set( 6, -10, 10 );
const directionalLight5 = new THREE.DirectionalLight(
    "#ffffff",
    50,
);
directionalLight5.position.set( 0, -10, 0 );

const directionalLight6 = new THREE.DirectionalLight(
    "#ffffff",
    5,
);
directionalLight6.position.set( 0, 0, 20 );

const hemisphereLight = new THREE.HemisphereLight(
    "#ffffff", // loght colour
    "rgb( 255, 255, 255 )", // ground colour
    50, // intensity
);
const ambientLight1 = new THREE.AmbientLight(
    "#ffffff",
    20,
);

const lights = [
    directionalLight1,
    directionalLight2,
    directionalLight3,
    directionalLight4,
    directionalLight5,

    ambientLight1,
    hemisphereLight,
];
lights.forEach( light => {
    light.castShadow = true;
    light.decay = 0;
    scene.add( light );
});

// ANIMATION

function animate() {

    // ROTATE

    displayMesh.rotateY( rotationSpeed );

    
    controls.update();

    renderer.render( scene, camera );
}

// GENERATE GEOM
function getNewMeshes( initialGeoms, iterationsCount ) {

    let meshes = [];

    initialGeoms.map( ( geom, geomIndex ) => {

        let geoDomeMesh = getGeodesicDomeMesh( geom, geoDomeRadius, new Point3d(), iterationsCount );

        let origamiMesh = getSpikyMesh( geom, geoDomeRadius, new Point3d(), iterationsCount );

        let processedMesh = getGeodesicDomeThreeJSMesh( origamiMesh, material, positions[ geomIndex ] );

        processedMesh.castShadow = true;
        processedMesh.receiveShadow = true;
        processedMesh.position.x += spacing;

        meshes.push( processedMesh );

    })
    return meshes
}

function onWindowResize() {
    rendererSize = getRendererSize();
    camera.aspect = rendererSize.width / rendererSize.height;
    camera.updateProjectionMatrix();
    renderer.setSize( rendererSize.width, rendererSize.height );
}

function getMousePosition( mousePosition ) {
    mouseX = mousePosition.layerX;
    mouseY = mousePosition.layerY;
}
function getRendererSize () {
    let rendererWidth = document.getElementById("threejs_animation").clientWidth;
    let rendererHeight = window.screen.height / window.screen.width * rendererWidth;
    return { 'width': rendererWidth, 'height': rendererHeight }
}
function getGeodesicDomeThreeJSMesh( geoDomeMeshObj, geoDomeMaterial, position ) {
    const threeGeom = new THREE.BufferGeometry();

    const faceIndices = [];
    geoDomeMeshObj.faces.forEach( face => {faceIndices.push(...face)});

    const vertices = []
    geoDomeMeshObj.vertices.forEach( vertex => { vertices.push(...vertex.matrix.matrix) });

    const normals =  [];
    geoDomeMeshObj.faceNormals.forEach( faceNormal => { normals.push(...faceNormal.matrix.matrix) });

    threeGeom.setIndex(faceIndices);
    threeGeom.setAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ));

    threeGeom.computeVertexNormals();
    threeGeom.verticesNeedUpdate = true;

    const threeMesh = new THREE.Mesh( threeGeom, geoDomeMaterial );
    threeMesh.position.set( position.x, position.y, position.z );

    return threeMesh
}