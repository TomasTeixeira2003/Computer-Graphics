import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

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
const CYLINDER_RADIUS = 20;
const CYLINDER_HEIGHT = 30;

// rings
const RING_HEIGHT = CYLINDER_HEIGHT/3;
const RING_WIDTH = 30;
const IRING_IRADIUS = CYLINDER_RADIUS;
const IRING_ORADIUS = IRING_IRADIUS + RING_WIDTH;
const IRING_SURFACES_RADIUS = IRING_IRADIUS + RING_WIDTH/2;
const MRING_IRADIUS = IRING_ORADIUS;
const MRING_ORADIUS = MRING_IRADIUS + RING_WIDTH;
const MRING_SURFACES_RADIUS = MRING_IRADIUS + RING_WIDTH/2;
const ORING_IRADIUS = MRING_ORADIUS;
const ORING_ORADIUS = ORING_IRADIUS + RING_WIDTH;
const ORING_SURFACES_RADIUS = ORING_IRADIUS + RING_WIDTH/2;

const RING_NUMBER = 3;
const SURFACE_NUMBER = 8;
const SURFACE_SPEED = 2;

const extrudeSettings = {
	steps: 2,
	depth: 16,
	bevelEnabled: true,
	bevelThickness: 1,
	bevelSize: 1,
	bevelOffset: 0,
	bevelSegments: 1
};

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var scene, renderer, camera, camera1, camera2;

// TODO: colours
var materials = [new THREE.MeshLambertMaterial(),
    new THREE.MeshPhongMaterial(),
    new THREE.MeshToonMaterial(),
    new THREE.MeshNormalMaterial(),
    new THREE.MeshBasicMaterial({color: 0xFF2222 }),
    new THREE.MeshBasicMaterial({color: 0x22FF22, wireframe: true}),
    new THREE.MeshBasicMaterial({color: 0x2222FF }),
    new THREE.MeshBasicMaterial({color: 0x22FFFF })]
    
// object3D(s)
var carousel, cylinder, innerRing, middleRing, outerRing;
var rings = [
    { object: innerRing, innerRadius: IRING_IRADIUS, outerRadius: IRING_ORADIUS, surfaces: [], rSurfaces: IRING_SURFACES_RADIUS },
    { object: middleRing, innerRadius: MRING_IRADIUS, outerRadius: MRING_ORADIUS, surfaces: [], rSurfaces: MRING_SURFACES_RADIUS },
    { object: outerRing, innerRadius: ORING_IRADIUS, outerRadius: ORING_ORADIUS, surfaces: [], rSurfaces: ORING_SURFACES_RADIUS },
];

// clock
var clock = new THREE.Clock();
var delta_t;

var geometry, mesh;

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
function createSurfaces(ring) {
    for (var i = 0; i < 8; i++) {        
        ring.surfaces[i] = new THREE.Object3D();
        ring.surfaces[i].position.set(
            ring.rSurfaces * Math.cos(i * Math.PI / 4),
            RING_HEIGHT, // TODO: add surface height/2
            ring.rSurfaces * Math.sin(i * Math.PI / 4)
        );
        ring.object.add(ring.surfaces[i]);
        
        // TODO: parametric surfaces
        geometry = new THREE.BoxGeometry(10, 10, 10);
        geometry.computeBoundingSphere();
        mesh = new THREE.Mesh(geometry, materials[4]);
        mesh.position.set(0, 0, 0);
        ring.surfaces[i].add(mesh);
    }
}

function createRing(ring) {
    'use strict';

    ring.object = new THREE.Object3D();
    ring.object.position.set(0, 0, 0);

    cylinder.add(ring.object);

    geometry = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32);
    mesh = new THREE.Mesh(geometry, materials[5]);
    mesh.position.set(0, 0, 0);
    mesh.rotation.x = Math.PI/2;
    ring.object.add(mesh);
    createSurfaces(ring);
}

function createCenterCylinder() {
    'use strict';

    cylinder = new THREE.Object3D();
    cylinder.position.set(0, 0, 0);

    carousel.add(cylinder);
    
    geometry = new THREE.CylinderGeometry(CYLINDER_RADIUS, CYLINDER_RADIUS, CYLINDER_HEIGHT);
    mesh = new THREE.Mesh(geometry, materials[6]);
    mesh.position.set(0, CYLINDER_HEIGHT/2, 0);
    cylinder.add(mesh);

    for (var ringIndex = 0; ringIndex < RING_NUMBER; ringIndex++)
        createRing(rings[ringIndex]);
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
    const material = new THREE.MeshBasicMaterial( { map:texture, side: THREE.BackSide } );
    mesh = new THREE.Mesh( geometry, material ); 
    
    scene.add(mesh);
}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';
    for (var ringIndex = 0; ringIndex < RING_NUMBER; ringIndex++)
        for (var surfaceIndex = 0; surfaceIndex < SURFACE_NUMBER; surfaceIndex++)
            rings[ringIndex].surfaces[surfaceIndex].rotateY(SURFACE_SPEED * delta_t);
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
    camera = createPrespectiveCamera(150, 150, 150);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////

function animate() {
    'use strict';
    delta_t = clock.getDelta();
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