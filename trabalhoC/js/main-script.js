import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var scene, renderer, camera, camera1, camera2;

var geometry, mesh, material;
var materials = [new THREE.MeshBasicMaterial({ color: 0xbbbbbb, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0xffdd00, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x4d4dff, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x2d2d9c, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0xD2042D, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x660f56, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x295e11, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x179799, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0xE918BB, wireframe: true }),
    new THREE.MeshBasicMaterial({ color: 0x74d455, wireframe: true })]
    
// object3D(s)
var carousel, cylinder, innerRing, middleRing, outterRing;

///////////////
/* CONSTANTS */
///////////////

// skydome
const SKYDOME_RADIUS = 1000;
const SKYDOME_WIDTH = 32;
const SKYDOME_HEIGHT = 16;
const SKYDOME_PHI_START = 0;
const SKYDOME_PHI_LENGHT = 6.283185307179586;
const SKYDOME_THETA_START = 0;
const SKYDOME_THETA_LENGHT = 1.64619455048105;

// cylinder
const R_CYLINDER = 20;
const H_CYLINDER = 100;

// rings
const H_RING = 10;
const RING_WIDTH = 30;
const INNER_RING_IRADIUS = R_CYLINDER;
const INNER_RING_ORADIUS = INNER_RING_IRADIUS + RING_WIDTH;
const MIDDLE_RING_IRADIUS = INNER_RING_ORADIUS;
const MIDDLE_RING_ORADIUS = MIDDLE_RING_IRADIUS + RING_WIDTH;
const OUTTER_RING_IRADIUS = MIDDLE_RING_ORADIUS;
const OUTTER_RING_ORADIUS = OUTTER_RING_IRADIUS + RING_WIDTH;

const extrudeSettings = {
	steps: 2,
	depth: 16,
	bevelEnabled: true,
	bevelThickness: 1,
	bevelSize: 1,
	bevelOffset: 0,
	bevelSegments: 1
};

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';

    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(100));

    createSkydome();
    createCarousel();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createPrespectiveCamera(x, y, z) {
    'use strict';
    var camera = new THREE.PerspectiveCamera(70,
        window.innerWidth / window.innerHeight,
        1,
        1000);
    camera.position.set(x, y, z);
    camera.lookAt(scene.position);

    return camera;
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createRing(ring, innerRadius, outterRadius) {
    'use strict';

    ring = new THREE.Object3D();
    ring.position.set(0, 0, 0);

    cylinder.add(ring);

    geometry = new THREE.RingGeometry(innerRadius, outterRadius, 32);
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.position.set(0, 0, 0);
    mesh.rotation.x = Math.PI/2;
    ring.add(mesh);
    // for (var i = 0; i < objects.length; i++) {
    //     addObjectToRing(ring, objects[i]);
    // }
}

function createCenterCylinder() {
    'use strict';

    cylinder = new THREE.Object3D();
    cylinder.position.set(0, 0, 0);

    carousel.add(cylinder);
    
    geometry = new THREE.CylinderGeometry(R_CYLINDER, R_CYLINDER, H_CYLINDER);
    mesh = new THREE.Mesh(geometry, materials[1]);
    mesh.position.set(0, H_CYLINDER/2, 0);
    cylinder.add(mesh);

    createRing(innerRing, INNER_RING_IRADIUS, INNER_RING_ORADIUS);
    createRing(middleRing, MIDDLE_RING_IRADIUS, MIDDLE_RING_ORADIUS);
    createRing(outterRing, OUTTER_RING_IRADIUS, OUTTER_RING_ORADIUS);
}

function createCarousel() {
    'use strict';
    carousel = new THREE.Object3D();
    carousel.position.set(0, 0, 0);
    
    scene.add(carousel);
    createCenterCylinder();

}

function createSkydome() {
    'use strict';

    geometry = new THREE.SphereGeometry(
        SKYDOME_RADIUS, SKYDOME_WIDTH, SKYDOME_HEIGHT, SKYDOME_PHI_START, 
        SKYDOME_PHI_LENGHT, SKYDOME_THETA_START, SKYDOME_THETA_LENGHT
    ); 

    const texture = new THREE.TextureLoader().load('textures/texture.png' ); 
    material = new THREE.MeshBasicMaterial( { map:texture, side: THREE.BackSide } );
    mesh = new THREE.Mesh( geometry, material ); 
    
    scene.add(mesh);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xFFFFFF);
    document.body.appendChild(renderer.domElement);

    createScene();
    camera = createPrespectiveCamera(100, 100, 100);
    render();
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////

function animate() {
    'use strict';
    update();
    render();
    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
}

init();
animate();