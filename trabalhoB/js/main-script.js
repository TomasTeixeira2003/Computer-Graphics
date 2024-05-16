import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var scene, renderer;
var camera, camera1, camera2, camera3, camera4, camera5, camera6;

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
var crane, jib, block, trolley;

// grabbable objects
var objects
var grabbedObject;
var h_grabbedObject;
var grabbingObject = false;
var inPosition = false;

// clock
var clock = new THREE.Clock();
var delta_t;

var geometry, mesh;
var cable_y_offset = 0;

///////////////
/* CONSTANTS */
///////////////

const ORTHOGRAPHIC_HEIGHT = 300;

// base
const H_BASE = 10;
const W_BASE = 20;

// tower
const H_TOWER = 220;
const W_TOWER = 10;

// jib and counter-jib
const H_JIB_CJIB = 10;
const L_CJIB = 50;
const L_JIB = 180;
const L_JIB_CJIB = L_CJIB + W_TOWER + L_JIB; // jib length + counter-jib length

// pendants
const W_PENDANT = 1;
const L_FRONT_PENDANT = 120;
const L_REAR_PENDANT = 30;
const ALPHA = 4 * Math.PI / 180;   // rad(4°)
const BETA = 15 * Math.PI / 180;   // rad(15°)

// cabin
const W_CABIN = 10;
const H_CABIN = 15;
const L_CABIN = 20;

// counterweight
const W_CWEIGHT = 12;
const H_CWEIGHT = 20;
const L_CWEIGHT = 10;
const D_CWEIGHT = 25; // distance between the tower and the counterweight

// trolley
const W_TROLLEY = 12;
const H_TROLLEY = 5;
const D_TROLLEY = 80;
const CABLE_INDEX = 1; // used while performing cable animation

// cable
const W_CABLE = W_PENDANT;
const H_CABLE = 50;

// claw block
const W_BLOCK = 8;
const H_BLOCK = 4;

// claws
const W_CLAW = 4;
const H_CLAW = 10;
const R_BLOCK = H_CLAW

// jib rotation
const JIB_SPEED = 0.8;
const MAX_THETA1 = Math.PI;
const MIN_THETA1 = - Math.PI;

// trolley movement
const TROLLEY_SPEED = 20;
const MAX_DELTA1 = L_JIB;
const MIN_DELTA1 = 3 * W_TROLLEY / 2 + W_BASE / 2;

// claw block momevemt
const CLAW_BLOCK_SPEED = 30;
const MAX_DELTA2 = - H_TROLLEY;
const MIN_DELTA2 = - (0.9 * H_TOWER + H_JIB_CJIB / 2 - H_TROLLEY - H_CLAW);

// claws movement and rotation
const CLAW_SPEED = 0.5;
const MAX_THETA2 = Math.PI / 6;
const MIN_THETA2 = -Math.PI / 8;

// container 
const W_CONTAINER_BASE = 50;
const H_CONTAINER_BASE = 5;
const L_CONTAINER_BASE = 80;
const W_CONTAINER_SIDE = H_CONTAINER_BASE;
const H_CONTAINER_SIDE = W_CONTAINER_BASE;
const L_CONTAINER_SIDE = L_CONTAINER_BASE;
const W_CONTAINER_FRONT = W_CONTAINER_BASE;
const H_CONTAINER_FRONT = W_CONTAINER_BASE;
const L_CONTAINER_FRONT = H_CONTAINER_BASE;

// grabble objects
const CUBE_SIDE = 15;
const DODECAHEDRON_RADIUS = 10;
const ICOSAHEDRON_RADIUS = 8;
const TORUS_RADIUS = 12;
const TORUS_TUBE = 2;
const TORUS_KNOT_RADIUS = 14;
const TORUS_KNOT_TUBE = 2;
const CAPSULE_RADIUS = 8;
const CAPSULE_LENGHT = 4;

// grabbing animation
const RAISING_HEIGHT = -135;
const LOWERING_HEIGHT = -185;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

function createScene() {
    'use strict';

    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(100));

    createCrane();
    createContainer();
    createGrabbableObjects();
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
    camera.position.set(x, y, z);
    camera.lookAt(scene.position);

    return camera;
}

function createOrthographicCamera(x, y, z, target) {
    'use strict';
    var ratio = window.innerWidth / window.innerHeight;
    var camera = new THREE.OrthographicCamera(-ORTHOGRAPHIC_HEIGHT * ratio,
        ORTHOGRAPHIC_HEIGHT * ratio,
        ORTHOGRAPHIC_HEIGHT,
        -ORTHOGRAPHIC_HEIGHT,
        1,
        10000);
    camera.position.set(x, y, z);
    camera.lookAt(target);

    return camera;
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function addCraneBase() {
    'use strict';

    geometry = new THREE.BoxGeometry(W_BASE, H_BASE, W_BASE);
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.position.set(0, H_BASE / 2, 0);
    crane.add(mesh);
}

function addCraneTower() {
    'use strict';

    geometry = new THREE.BoxGeometry(W_TOWER, H_TOWER, W_TOWER);
    mesh = new THREE.Mesh(geometry, materials[1]);
    mesh.position.set(0, H_TOWER / 2 + H_BASE, 0);
    crane.add(mesh);
}

function addFrontPendant() {
    'use strict';

    geometry = new THREE.CylinderGeometry(W_PENDANT / 2, W_PENDANT / 2, L_FRONT_PENDANT);
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.x = -Math.PI / 2 + ALPHA;
    mesh.position.set(
        0,
        Math.sin(ALPHA) * L_FRONT_PENDANT / 2 + H_JIB_CJIB / 2,
        W_TOWER / 2 - L_FRONT_PENDANT / 2 + Math.cos(ALPHA) * L_FRONT_PENDANT
    );
    jib.add(mesh);
}

function addRearPendant() {
    'use strict';

    geometry = new THREE.CylinderGeometry(W_PENDANT / 2, W_PENDANT / 2, L_REAR_PENDANT);
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.x = Math.PI / 2 - BETA;
    mesh.position.set(
        0,
        Math.sin(BETA) * L_REAR_PENDANT / 2 + H_JIB_CJIB / 2,
        - W_TOWER / 2 + L_REAR_PENDANT / 2 - Math.cos(BETA) * L_REAR_PENDANT
    );
    jib.add(mesh);
}

function addCabin() {
    'use strict';

    geometry = new THREE.BoxGeometry(W_CABIN, H_CABIN, L_CABIN);
    mesh = new THREE.Mesh(geometry, materials[2]);
    mesh.position.set(
        - W_CABIN / 2 - W_TOWER / 2,
        - H_CABIN / 2 - H_JIB_CJIB / 2,
        W_CABIN / 2 - W_TOWER / 2
    );
    jib.add(mesh);
}

function addCounterWeight() {
    'use strict';

    geometry = new THREE.BoxGeometry(W_CWEIGHT, H_CWEIGHT, W_CWEIGHT);
    mesh = new THREE.Mesh(geometry, materials[2]);
    mesh.position.set(
        0,
        H_JIB_CJIB / 2 - H_CWEIGHT / 2 + 2,
        - W_TOWER / 2 - L_CWEIGHT - D_CWEIGHT
    );
    jib.add(mesh);
}

function addCable() {
    geometry = new THREE.CylinderGeometry(W_CABLE / 2, W_CABLE / 2, H_CABLE);
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.position.set(0, - H_CABLE / 2 - H_TROLLEY / 2, 0);
    trolley.add(mesh);
}

function addClaw(x, y, z, rot) {
    geometry = new THREE.ConeGeometry(W_CLAW / 2, -H_CLAW, 3);
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.y = rot;
    mesh.position.set(x, y, z);

    block.add(mesh);
}

function createBlockAndClaw(x, y, z) {
    'use strict';

    block = new THREE.Object3D();
    block.userData = { movingDown: false, movingUp: false, closing: false, opening: false }
    block.position.set(x, y, z);

    trolley.add(block);

    geometry = new THREE.BoxGeometry(W_BLOCK, H_BLOCK, W_BLOCK);
    mesh = new THREE.Mesh(geometry, materials[2]);
    mesh.position.set(0, - H_BLOCK / 2, 0);
    block.add(mesh);

    // different angle values are used to rotate the claws so that they are 
    // facing the center of the claw
    addClaw(0, -H_CLAW / 2 - H_BLOCK, -W_BLOCK / 2, 0);
    addClaw(0, -H_CLAW / 2 - H_BLOCK, W_BLOCK / 2, Math.PI);
    addClaw(-W_BLOCK / 2, -H_CLAW / 2 - H_BLOCK, 0, Math.PI / 2);
    addClaw(W_BLOCK / 2, -H_CLAW / 2 - H_BLOCK, 0, 3 * Math.PI / 2);

    camera6 = createPerspectiveCamera(0, - H_BLOCK, 0);
    camera6.lookAt(0, -500, 0);
    camera6.rotateZ(Math.PI);  // rotate camera towards the front of the crane
    block.add(camera6);
}

function createTrolley(x, y, z) {
    'use strict';

    trolley = new THREE.Object3D();
    trolley.userData = { movingForward: false, movingBackwards: false };
    trolley.position.set(x, y, z);

    jib.add(trolley);

    geometry = new THREE.BoxGeometry(W_TROLLEY, H_TROLLEY, W_TROLLEY);
    mesh = new THREE.Mesh(geometry, materials[2]);
    mesh.position.set(0, 0, 0);
    trolley.add(mesh);

    addCable();
    createBlockAndClaw(0, - H_CABLE - H_TROLLEY / 2, 0);
}

function createCraneJib(x, y, z) {
    'use strict';

    jib = new THREE.Object3D();
    jib.userData = { rotatingRight: false, rotatingLeft: false };
    jib.position.set(x, y, z);

    crane.add(jib);

    geometry = new THREE.BoxGeometry(W_TOWER, H_JIB_CJIB, L_JIB_CJIB);
    mesh = new THREE.Mesh(geometry, materials[1]);
    mesh.position.set(0, 0, W_TOWER / 2 + L_JIB / 2 - L_CJIB / 2);
    jib.add(mesh);

    addFrontPendant();
    addRearPendant();
    addCabin();
    addCounterWeight();

    createTrolley(0, - H_JIB_CJIB / 2, D_TROLLEY + W_TOWER / 2 + W_TROLLEY / 2);
}

function createCrane() {
    'use strict';
    crane = new THREE.Object3D();
    crane.position.set(0, 0, 0);
    
    scene.add(crane);

    addCraneBase();
    addCraneTower();

    createCraneJib(0, H_BASE + 0.9 * H_TOWER + H_JIB_CJIB / 2, 0);
}

function createContainer() {
    'use strict';

    // base
    geometry = new THREE.BoxGeometry(W_CONTAINER_BASE, H_CONTAINER_BASE, L_CONTAINER_BASE);
    mesh = new THREE.Mesh(geometry, materials[4]);
    mesh.position.set(150, H_CONTAINER_BASE / 2, 100);
    scene.add(mesh);

    // left-side
    geometry = new THREE.BoxGeometry(W_CONTAINER_SIDE, H_CONTAINER_SIDE, L_CONTAINER_SIDE);
    mesh = new THREE.Mesh(geometry, materials[3]);
    mesh.position.set(150 - W_CONTAINER_BASE / 2, H_CONTAINER_SIDE / 2, 100);
    scene.add(mesh);

    // right-side
    geometry = new THREE.BoxGeometry(W_CONTAINER_SIDE, H_CONTAINER_SIDE, L_CONTAINER_SIDE);
    mesh = new THREE.Mesh(geometry, materials[3]);
    mesh.position.set(150 + W_CONTAINER_BASE / 2, H_CONTAINER_SIDE / 2, 100);
    scene.add(mesh);

    // front
    geometry = new THREE.BoxGeometry(W_CONTAINER_FRONT, H_CONTAINER_FRONT, L_CONTAINER_FRONT);
    mesh = new THREE.Mesh(geometry, materials[3]);
    mesh.position.set(150, W_CONTAINER_BASE / 2, 100 - L_CONTAINER_BASE / 2);
    scene.add(mesh);

    // back
    geometry = new THREE.BoxGeometry(W_CONTAINER_FRONT, H_CONTAINER_FRONT, L_CONTAINER_FRONT);
    mesh = new THREE.Mesh(geometry, materials[3]);
    mesh.position.set(150, W_CONTAINER_BASE / 2, 100 + L_CONTAINER_BASE / 2);
    scene.add(mesh);
}

function createGrabbableObjects() {
    'use strict';

    // cube
    geometry = new THREE.BoxGeometry(CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);
    var cube = new THREE.Mesh(geometry, materials[5]);
    cube.position.set(100, CUBE_SIDE / 2, 100);
    geometry.computeBoundingSphere();
    var r_cube = geometry.boundingSphere.radius;
    scene.add(cube);

    // dodecahedron
    geometry = new THREE.DodecahedronGeometry(DODECAHEDRON_RADIUS);
    var dodecahedron = new THREE.Mesh(geometry, materials[6]);
    dodecahedron.position.set(-20, DODECAHEDRON_RADIUS, 120);
    geometry.computeBoundingSphere();
    var r_dodecahedron = geometry.boundingSphere.radius;
    scene.add(dodecahedron);

    // icosahedron
    geometry = new THREE.IcosahedronGeometry(ICOSAHEDRON_RADIUS);
    var icosahedron = new THREE.Mesh(geometry, materials[7]);
    icosahedron.position.set(20, ICOSAHEDRON_RADIUS, 30);
    geometry.computeBoundingSphere();
    var r_icosahedron = geometry.boundingSphere.radius;
    scene.add(icosahedron);

    // torus
    geometry = new THREE.TorusGeometry(TORUS_RADIUS, TORUS_TUBE);
    var torus = new THREE.Mesh(geometry, materials[8]);
    torus.position.set(-100, TORUS_RADIUS + TORUS_TUBE, -140);
    torus.rotateY(Math.PI / 4);
    geometry.computeBoundingSphere();
    var r_torus = geometry.boundingSphere.radius;
    scene.add(torus);

    // torus knot
    geometry = new THREE.TorusKnotGeometry(TORUS_KNOT_RADIUS, TORUS_KNOT_TUBE);
    var torusKnot = new THREE.Mesh(geometry, materials[9]);
    torusKnot.position.set(50, TORUS_KNOT_RADIUS + TORUS_KNOT_TUBE * 4, -80);
    geometry.computeBoundingSphere();
    var r_torusKnot = geometry.boundingSphere.radius;
    scene.add(torusKnot);

    // capsule
    geometry = new THREE.CapsuleGeometry(CAPSULE_RADIUS, CAPSULE_LENGHT);
    var capsule = new THREE.Mesh(geometry, materials[10]);
    capsule.position.set(-160, CAPSULE_LENGHT / 2 + CAPSULE_RADIUS, 0);
    geometry.computeBoundingSphere();
    var r_capsule = geometry.boundingSphere.radius;
    scene.add(capsule);

    objects = [
        { object: cube, radius: r_cube },
        { object: dodecahedron, radius: r_dodecahedron },
        { object: icosahedron, radius: r_icosahedron },
        { object: torus, radius: r_torus },
        { object: torusKnot, radius: r_torusKnot },
        { object: capsule, radius: r_capsule }
    ];   
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////

function checkCollisions() {
    'use strict';
    if (grabbingObject)
        return;

    var blockPosition = new THREE.Vector3();
    block.getWorldPosition(blockPosition); 

    for (var i = 0; i < objects.length; i++) {
        var objPosition = objects[i].object.position;
        if (Math.pow(R_BLOCK + objects[i].radius, 2) >= blockPosition.distanceToSquared(objPosition)) {
            grabbingObject = true;
            grabbedObject = objects[i].object;
            objPosition.set(0, -objects[i].radius - H_BLOCK - H_CLAW / 2, 0);
            h_grabbedObject = 2 * objects[i].radius;
            block.add(grabbedObject);
            return;
        }
    }
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////

function handleCollisions() {
    'use strict';
    if (!grabbingObject)
        return;
    var rotateRight = jib.rotation.y > 1 + JIB_SPEED * delta_t;
    var rotateLeft = jib.rotation.y < 1 - JIB_SPEED * delta_t;

    // raises object
    if (block.position.y < RAISING_HEIGHT + h_grabbedObject && !inPosition) {
        block.position.y += CLAW_BLOCK_SPEED * delta_t;
        cable_y_offset += CLAW_BLOCK_SPEED * delta_t;
        trolley.children[CABLE_INDEX].position.y = -(H_CABLE - cable_y_offset) / 2 - H_TROLLEY / 2;
        trolley.children[CABLE_INDEX].scale.y -= CLAW_BLOCK_SPEED * delta_t / H_CABLE;
    }
    // jib and trolley get int the right position
    else if (rotateRight || rotateLeft || trolley.position.z < MAX_DELTA1) {
        
        if (rotateLeft && MIN_THETA1 < jib.rotation.y)
            jib.rotation.y += JIB_SPEED * delta_t;
        if (rotateRight && jib.rotation.y < MAX_THETA1)
            jib.rotation.y -= JIB_SPEED * delta_t;
        if (trolley.position.z < MAX_DELTA1)
            trolley.position.z += TROLLEY_SPEED * delta_t;
    }

    // lowers object
    else if (block.position.y > LOWERING_HEIGHT + h_grabbedObject) {
        inPosition = true;
        block.position.y -= CLAW_BLOCK_SPEED * delta_t;
        cable_y_offset -= CLAW_BLOCK_SPEED * delta_t;
        trolley.children[CABLE_INDEX].position.y = -(H_CABLE - cable_y_offset) / 2 - H_TROLLEY / 2;
        trolley.children[CABLE_INDEX].scale.y += CLAW_BLOCK_SPEED * delta_t / H_CABLE;
    }
    else {
        grabbingObject = false;
        inPosition = false;
        block.remove(grabbedObject);
    }
}

////////////
/* UPDATE */
////////////

function update() {
    'use strict';

    checkCollisions();
    handleCollisions();

    if (grabbingObject)
        return;

    // jib rotation
    if (jib.userData.rotatingRight && jib.rotation.y < MAX_THETA1)
        jib.rotation.y += JIB_SPEED * delta_t;
    if (jib.userData.rotatingLeft && jib.rotation.y > MIN_THETA1)
        jib.rotation.y -= JIB_SPEED * delta_t;
    
    // trolley movement
    if (trolley.userData.movingForward && trolley.position.z < MAX_DELTA1)
        trolley.position.z += TROLLEY_SPEED * delta_t;
    if (trolley.userData.movingBackwards && trolley.position.z > MIN_DELTA1)
        trolley.position.z -= TROLLEY_SPEED * delta_t;

    // block movement
    if (block.userData.movingDown && block.position.y > MIN_DELTA2) {
        block.position.y -= CLAW_BLOCK_SPEED * delta_t;
        // adjust cable position and size accordingly
        cable_y_offset -= CLAW_BLOCK_SPEED * delta_t;
        trolley.children[CABLE_INDEX].position.y = -(H_CABLE - cable_y_offset) / 2 - H_TROLLEY / 2;
        trolley.children[CABLE_INDEX].scale.y += CLAW_BLOCK_SPEED * delta_t / H_CABLE;
    }
    if (block.userData.movingUp && block.position.y < MAX_DELTA2) {
        block.position.y += CLAW_BLOCK_SPEED * delta_t;
        // adjust cable position and size accordingly
        cable_y_offset += CLAW_BLOCK_SPEED * delta_t;
        trolley.children[CABLE_INDEX].position.y = -(H_CABLE - cable_y_offset) / 2 - H_TROLLEY / 2;
        trolley.children[CABLE_INDEX].scale.y -= CLAW_BLOCK_SPEED * delta_t / H_CABLE;
    }

    // rotations are equal for all claws, so one comparison is sufficient        
    if (block.userData.opening && block.children[1].rotation.x < MAX_THETA2) {
        block.children[1].rotateX(CLAW_SPEED * delta_t);
        block.children[2].rotateX(CLAW_SPEED * delta_t);
        block.children[3].rotateX(CLAW_SPEED * delta_t);
        block.children[4].rotateX(CLAW_SPEED * delta_t);

        // adjust claw position for a more realistic opening animation
        var claw_movement = CLAW_SPEED * delta_t * Math.cos(CLAW_SPEED * delta_t) * H_CLAW / 2;
        block.children[1].position.z -= claw_movement;
        block.children[2].position.z += claw_movement;
        block.children[3].position.x -= claw_movement;
        block.children[4].position.x += claw_movement;
    }

    // rotations are equal for all claws, so one comparison is sufficient
    if (block.userData.closing && block.children[1].rotation.x > MIN_THETA2) {
        block.children[1].rotateX(-CLAW_SPEED * delta_t);
        block.children[2].rotateX(-CLAW_SPEED * delta_t);
        block.children[3].rotateX(-CLAW_SPEED * delta_t);
        block.children[4].rotateX(-CLAW_SPEED * delta_t);

        // adjust claw position for a more realistic closing animation
        var claw_movement = CLAW_SPEED * delta_t * Math.cos(CLAW_SPEED * delta_t) * H_CLAW / 2;
        block.children[1].position.z += claw_movement;
        block.children[2].position.z -= claw_movement;
        block.children[3].position.x += claw_movement;
        block.children[4].position.x -= claw_movement;
    }
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
    camera1 = createOrthographicCamera(250, 0, 0, new THREE.Vector3(0, 0, 0));
    camera2 = createOrthographicCamera(0, 0, 250, new THREE.Vector3(0, 0, 0));
    camera3 = createOrthographicCamera(0, 250, 0, new THREE.Vector3(0, 0, 0));
    camera4 = createOrthographicCamera(300, 300, 300, new THREE.Vector3(0, 0, 0));
    camera5 = createPerspectiveCamera(300, 300, 300);

    camera = camera1;

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
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
            jib.userData.rotatingLeft = true;
            break;
        case 65: //A
            jib.userData.rotatingRight = true;
            break;
        case 87: //W
            trolley.userData.movingForward = true;
            break;
        case 83: //S
            trolley.userData.movingBackwards = true;
            break;
        case 68: //D
            block.userData.movingDown = true;
            break;
        case 69: //E
            block.userData.movingUp = true;
            break;
        case 82: //R
            block.userData.opening = true;
            break;
        case 70: //F
            block.userData.closing = true;
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////

function onKeyUp(e) {
    'use strict';

    switch (e.keyCode) {
        case 81: //Q
            jib.userData.rotatingLeft = false;
            break;
        case 65: //A
            jib.userData.rotatingRight = false;
            break;
        case 87: //W
            trolley.userData.movingForward = false;
            break;
        case 83: //S
            trolley.userData.movingBackwards = false;
            break;
        case 68: //D
            block.userData.movingDown = false;
            break;
        case 69: //E
            block.userData.movingUp = false;
            break;
        case 82: //R
            block.userData.opening = false;
            break;
        case 70: //F
            block.userData.closing = false;
            break;
    }
}

init();
animate();