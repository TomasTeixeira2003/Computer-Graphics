import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var camera, camera1, camera2, camera3, camera4, camera5, camera6, scene, renderer;

var materials = [new THREE.MeshBasicMaterial({ color: 0xbbbbbb, wireframe: true }),
                 new THREE.MeshBasicMaterial({ color: 0xffdd00, wireframe: true }),
                 new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true }),
                 new THREE.MeshBasicMaterial({ color: 0x4d4dff, wireframe: true })]

var geometry, mesh;

var jib, block, trolley;

var cable_y_offset = 0;

var clock = new THREE.Clock();

///////////////
/* CONSTANTS */
///////////////

const H_BASE = 10;
const W_BASE = 20;

const H_TOWER = 220;
const W_TOWER = 10; 

const H_JIB_CJIB = 10;
const L_CJIB = 50;                        // l_clança
const L_JIB = 180;                        // l_lança
const L_JIB_CJIB = L_CJIB + W_TOWER + L_JIB;  // l_clança + w_torre + l_lança

const W_PENDANT = 1;
const ALPHA = 4 * Math.PI / 180;   // rad(4°)
const BETA = 15 * Math.PI / 180;   // rad(15°)

const L_FRONT_PENDANT = 120;
const L_BACK_PENDANT = 30;

const W_CABIN = 10;
const H_CABIN = 15;
const L_CABIN = 20;

const W_CWEIGHT = 12;
const H_CWEIGHT = 20;
const L_CWEIGHT = 10;
const D_CWEIGHT = 25;

const W_TROLLEY = 12;
const H_TROLLEY = 5;
const D_TROLLEY = 80;

const W_CABLE = W_PENDANT;
const H_CABLE = 50;

const W_BLOCK = 8;
const H_BLOCK = 4;

const W_CLAW = 8;
const H_CLAW = 10;

const JIB_SPEED = 0.8;
const MAX_THETA1 = Math.PI;
const MIN_THETA1 = - Math.PI;

const TROLLEY_SPEED = 20;
const MAX_DELTA1 = L_JIB;
const MIN_DELTA1 = 3 * W_TROLLEY/2 + W_BASE/2;

const CLAW_BLOCK_SPEED = 30;
const MAX_DELTA2 = - H_TROLLEY;
const MIN_DELTA2 = - (0.9 * H_TOWER + H_JIB_CJIB/2 - H_TROLLEY -  2 * H_CLAW);

const CLAW_SPEED = 0.5;

const W_CONTAINER_BASE = 50;
const H_CONTAINER_BASE = 5;
const L_CONTAINER_BASE = 80;

const W_CONTAINER_SIDE = H_CONTAINER_BASE;
const H_CONTAINER_SIDE = W_CONTAINER_BASE;
const L_CONTAINER_SIDE = L_CONTAINER_BASE;

const W_CONTAINER_FRONT = W_CONTAINER_BASE;
const H_CONTAINER_FRONT = W_CONTAINER_BASE;
const L_CONTAINER_FRONT = H_CONTAINER_BASE;

const CABLE_INDEX = 1;          // used while performing cable animation

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(100));

    createCrane(scene, 0, 0, 0);
    createContainer(0, 0, 0);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createPerspectiveCamera(x, y, z) {
    'use strict';
    var camera = new THREE.PerspectiveCamera(70,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
    camera.lookAt(scene.position);

    return camera;
}


function createOrthographicCamera(x, y, z, target) {
    'use strict';
    var camera = new THREE.OrthographicCamera(window.innerWidth / -4,
                                          window.innerWidth / 4,
                                          window.innerHeight / 4,
                                          window.innerHeight / -4,
                                          1,
                                          10000);
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
    camera.lookAt(target);

    return camera;
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function addCraneBase(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(W_BASE, H_BASE, W_BASE);
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.position.set(x, y + H_BASE/2, z);
    obj.add(mesh);
}

function addCraneTower(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(W_TOWER, H_TOWER, W_TOWER);
    mesh = new THREE.Mesh(geometry, materials[1]);
    mesh.position.set(x, y + H_TOWER/2 + H_BASE, z);
    obj.add(mesh);
}

function addFrontPendant(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(W_PENDANT/2, W_PENDANT/2, L_FRONT_PENDANT); 
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.x = -Math.PI / 2 + ALPHA;
    mesh.position.set(x, y + Math.sin(ALPHA) * L_FRONT_PENDANT/2 + H_JIB_CJIB/2, z + W_TOWER/2 - L_FRONT_PENDANT/2 + Math.cos(ALPHA) * L_FRONT_PENDANT);
    obj.add(mesh);
}

function addRearPendant(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(W_PENDANT/2, W_PENDANT/2, L_BACK_PENDANT); 
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.x = Math.PI / 2 - BETA;
    mesh.position.set(x, y + Math.sin(BETA) * L_BACK_PENDANT/2 + H_JIB_CJIB/2, z - W_TOWER/2 + L_BACK_PENDANT/2 - Math.cos(BETA) * L_BACK_PENDANT);
    obj.add(mesh);
}

function addCabin(obj, x, y, z) {
    'use strict';
    
    geometry = new THREE.BoxGeometry(W_CABIN, H_CABIN, L_CABIN);
    mesh = new THREE.Mesh(geometry, materials[2]);
    mesh.position.set(x - W_CABIN/2 - W_TOWER/2, y - H_CABIN/2 - H_JIB_CJIB/2, z + W_CABIN/2 - W_TOWER/2);
    obj.add(mesh);
}

function addCounterWeight(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(W_CWEIGHT, H_CWEIGHT, W_CWEIGHT);
    mesh = new THREE.Mesh(geometry, materials[2]);
    mesh.position.set(x, y + H_JIB_CJIB/2 - H_CWEIGHT/2 + 2, z - W_TOWER/2 - L_CWEIGHT - D_CWEIGHT);
    obj.add(mesh);
}

function addCable(obj, x, y, z) {
    geometry = new THREE.CylinderGeometry(W_CABLE/2, W_CABLE/2, H_CABLE); 
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.position.set(x, y - H_CABLE/2 - H_TROLLEY/2, z);
    obj.add(mesh);
}

function addClaw(obj, x, y, z, rot) {
    const geometry = new THREE.ConeGeometry(W_CLAW/2, H_CLAW, 3);

    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.y = rot + Math.PI;
    mesh.rotation.z = Math.PI;
    mesh.position.set(x, y, z);

    // TODO: ADD THETA2

    obj.add(mesh);
}

function createBlockAndClaw(obj, x, y, z) {
    'use strict';

    block = new THREE.Object3D();
    block.userData = { movingDown: false, movingUp: false, closing: false, opening: false }

    block.position.x = x;
    block.position.y = y;
    block.position.z = z;

    obj.add(block);

    geometry = new THREE.BoxGeometry(W_BLOCK, H_BLOCK, W_BLOCK);
    mesh = new THREE.Mesh(geometry, materials[2]);
    mesh.position.set(0, - H_BLOCK/2, 0);
    block.add(mesh);

    addClaw(block,      0    , -H_CLAW/2 - H_BLOCK, -W_BLOCK/2,  0);
    addClaw(block,      0    , -H_CLAW/2 - H_BLOCK,  W_BLOCK/2,  Math.PI);
    addClaw(block, -W_BLOCK/2, -H_CLAW/2 - H_BLOCK,      0    ,  Math.PI/2);
    addClaw(block,  W_BLOCK/2, -H_CLAW/2 - H_BLOCK,      0    , 3*Math.PI/2);

    block.add(new THREE.AxesHelper(100));
}

function createTrolley(obj, x, y, z) {
    'use strict';

    trolley = new THREE.Object3D();
    trolley.userData = { movingForward: false, movingBackwards: false };

    trolley.position.x = x;
    trolley.position.y = y;
    trolley.position.z = z;

    obj.add(trolley);

    geometry = new THREE.BoxGeometry(W_TROLLEY, H_TROLLEY, W_TROLLEY);
    mesh = new THREE.Mesh(geometry, materials[2]);
    mesh.position.set(0, 0, 0);
    trolley.add(mesh);

    addCable(trolley, 0, 0, 0);
    createBlockAndClaw(trolley, 0, - H_CABLE - H_TROLLEY/2, 0);
}

function createCraneJib(x, y, z) {
    'use strict';
    
    jib = new THREE.Object3D();
    jib.userData = { rotatingRight: false, rotatingLeft: false };

    scene.add(jib);

    jib.position.x = x;
    jib.position.y = y;
    jib.position.z = z;

    geometry = new THREE.BoxGeometry(W_TOWER, H_JIB_CJIB, L_JIB_CJIB);
    mesh = new THREE.Mesh(geometry, materials[1]);
    mesh.position.set(0, 0, W_TOWER/2 + L_JIB/2 - L_CJIB/2);
    jib.add(mesh);

    addFrontPendant(jib, 0, 0, 0);   // Tirante 1
    addRearPendant(jib, 0, 0, 0);    // Tirante 2
    addCabin(jib, 0, 0, 0);
    addCounterWeight(jib, 0, 0, 0);

    createTrolley(jib, 0, - H_JIB_CJIB/2, D_TROLLEY + W_TOWER/2 + W_TROLLEY/2);
}

function createCrane() {
    'use strict';

    addCraneBase(scene, 0, 0, 0);
    addCraneTower(scene, 0, 0, 0);

    createCraneJib(0, H_BASE + 0.9 * H_TOWER + H_JIB_CJIB/2, 0);
}

function createContainer() {
    'use strict';

    // base
    geometry = new THREE.BoxGeometry(W_CONTAINER_BASE, H_CONTAINER_BASE, L_CONTAINER_BASE);
    mesh = new THREE.Mesh(geometry, materials[3]);
    mesh.position.set(200, H_CONTAINER_BASE/2, 100);
    scene.add(mesh);

    // left-side
    geometry = new THREE.BoxGeometry(W_CONTAINER_SIDE, H_CONTAINER_SIDE, L_CONTAINER_SIDE);
    mesh = new THREE.Mesh(geometry, materials[3]);
    mesh.position.set(200 - W_CONTAINER_BASE/2, H_CONTAINER_SIDE/2, 100);
    scene.add(mesh);

    // right-side
    geometry = new THREE.BoxGeometry(W_CONTAINER_SIDE, H_CONTAINER_SIDE, L_CONTAINER_SIDE);
    mesh = new THREE.Mesh(geometry, materials[3]);
    mesh.position.set(200 + W_CONTAINER_BASE/2, H_CONTAINER_SIDE/2, 100);
    scene.add(mesh);

    // front
    geometry = new THREE.BoxGeometry(W_CONTAINER_FRONT, H_CONTAINER_FRONT, L_CONTAINER_FRONT);
    mesh = new THREE.Mesh(geometry, materials[3]);
    mesh.position.set(200, W_CONTAINER_BASE/2, 100 - L_CONTAINER_BASE/2);
    scene.add(mesh);

    // back
    geometry = new THREE.BoxGeometry(W_CONTAINER_FRONT, H_CONTAINER_FRONT, L_CONTAINER_FRONT);
    mesh = new THREE.Mesh(geometry, materials[3]);
    mesh.position.set(200, W_CONTAINER_BASE/2, 100 + L_CONTAINER_BASE/2);
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
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xFFFFFF);
    document.body.appendChild(renderer.domElement);

    createScene();
    camera1 = createOrthographicCamera(0, 0, 2000, new THREE.Vector3(0, 100, 0));
    camera2 = createOrthographicCamera(2000, 0, 0, new THREE.Vector3(0, 100, 80));
    camera3 = createOrthographicCamera(0, 2000, 0, new THREE.Vector3(0, 100, 0));
    camera4 = createOrthographicCamera(0, 2000, 2000, new THREE.Vector3(0, 100, 0));
    camera5 = createPerspectiveCamera(-250, 250, 250);
    camera6 = createPerspectiveCamera(0, 0, 0);

    camera = camera1;


    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);

    render();
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    var delta_t = clock.getDelta();

    if (jib.userData.rotatingRight && jib.rotation.y <= MAX_THETA1)
        jib.rotation.y += JIB_SPEED * delta_t;
    if (jib.userData.rotatingLeft && jib.rotation.y >= MIN_THETA1)
        jib.rotation.y -= JIB_SPEED * delta_t;

    if (trolley.userData.movingForward && trolley.position.z <= MAX_DELTA1)
        trolley.position.z += TROLLEY_SPEED * delta_t;
    if (trolley.userData.movingBackwards && trolley.position.z >= MIN_DELTA1)
        trolley.position.z -= TROLLEY_SPEED * delta_t;

    if (block.userData.movingDown && block.position.y >= MIN_DELTA2) {
        block.position.y -= CLAW_BLOCK_SPEED * delta_t;
        cable_y_offset -= CLAW_BLOCK_SPEED * delta_t;
        trolley.children[CABLE_INDEX].position.y = -(H_CABLE - cable_y_offset)/2 - H_TROLLEY/2;
        trolley.children[CABLE_INDEX].scale.y += CLAW_BLOCK_SPEED * delta_t / H_CABLE;
    }

    if (block.userData.movingUp && block.position.y <= MAX_DELTA2) {
        block.position.y += CLAW_BLOCK_SPEED * delta_t;
        cable_y_offset += CLAW_BLOCK_SPEED * delta_t;
        trolley.children[CABLE_INDEX].position.y = -(H_CABLE - cable_y_offset)/2 - H_TROLLEY/2;
        trolley.children[CABLE_INDEX].scale.y -= CLAW_BLOCK_SPEED * delta_t / H_CABLE;
    }

    if (block.userData.opening) {
        //block.children[1].rotation.x += CLAW_SPEED * delta_t;
        //block.children[2].rotation.x -= CLAW_SPEED * delta_t;
        block.children[3].rotation.z -= CLAW_SPEED * delta_t;
        block.children[4].rotation.z += CLAW_SPEED * delta_t;
    }
    if (block.userData.closing) {
        console.log("rotation.x",block.children[1].rotation.x);
        //console.log(block.children[1].position.z);
        //console.log(block.children[1].position.y);
        //block.children[1].rotation.x -= CLAW_SPEED * delta_t;
        //block.children[2].rotation.x += CLAW_SPEED * delta_t;

        block.children[3].rotation.z += CLAW_SPEED * delta_t;
        block.children[4].rotation.z -= CLAW_SPEED * delta_t;
    }

    camera6.lookAt(trolley.position)        //TODO : FIX CAMERA 6
    camera6.position.copy(block.position);
    
    render();

    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';

    switch (e.keyCode) {
    case 49: //1
        camera = camera1;
        break;
    case 50: //2
        camera = camera2;
        break;
    case 51: //3
        camera = camera3;
        break;
    case 52: //4
        camera = camera4;
        break;
    case 53: //5
        camera = camera5;
        break;
    case 54: //6
        camera = camera6;
        break;
    case 55: //7
        for (let i = 0; i < materials.length; i++)
            materials[i].wireframe = !materials[i].wireframe;   
        break;
    case 81: //Q
    case 113://q
        jib.userData.rotatingLeft = true;
        break;
    case 65: //A
    case 97: //a
        jib.userData.rotatingRight = true;
        break;
    case 87: //W
    case 119://w
        trolley.userData.movingBackwards = true;
        break;
    case 83: //S
    case 115://s
        trolley.userData.movingForward = true;
        break;
    case 68: //D
    case 100://d
        block.userData.movingDown = true;
        break;
    case 69: //E
    case 101://e
        block.userData.movingUp = true;
        break;
    case 82: //R
    case 114://r
        block.userData.opening = true;
        break;
    case 70: //F
    case 102://f
        block.userData.closing = true;
        break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';

    switch (e.keyCode) {
    case 65: //A
    case 97: //a
        jib.userData.rotatingRight = false;
        break;
    case 81: //Q
    case 113://q
        jib.userData.rotatingLeft = false;
        break;
    case 87: //W
    case 119://w
        trolley.userData.movingBackwards = false;
        break;
    case 83: //S
    case 115://s
        trolley.userData.movingForward = false;
        break;
    case 68: //D
    case 100://d
        block.userData.movingDown = false;
        break;
    case 69: //E
    case 101://e
        block.userData.movingUp = false;
        break;
    case 82: //R
    case 114://r
        block.userData.opening = false;
        break;
    case 70: //F
    case 102://f
        block.userData.closing = false;
        break;
    }

}

init();
animate();