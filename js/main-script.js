import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var camera, scene, renderer;

var materials = [new THREE.MeshBasicMaterial({ color: 0xbbbbbb, wireframe: true }),
                 new THREE.MeshBasicMaterial({ color: 0xffdd00, wireframe: true }),
                 new THREE.MeshBasicMaterial({ color: 0xffaa00, wireframe: true})]

var geometry, mesh;

///////////////
/* CONSTANTS */
///////////////

const HBASE = 10;
const WBASE = 20;

const HTOWER = 220;
const WTOWER = 10; 

const HJIBCJIB = 10;
const LCJIB = 50;                        // l_clança
const LJIB = 180;                        // l_lança
const LJIBCJIB = LCJIB + WTOWER + LJIB;  // l_clança + w_torre + l_lança

const WPENDANT = 2;
const ALPHA = 4 * Math.PI / 180;   // rad(4°)
const BETA = 15 * Math.PI / 180;   // rad(15°)

const LPENDANT1 = 120;
const LPENDANT2 = 30;

const WCABIN = 10;
const HCABIN = 15;
const LCABIN = 20;

const WCWEIGHT = 10;
const HCWEIGHT = 20;
const LCWEIGHT = 10;
const DCWEIGHT = 25;

const WTROLLEY = 10;
const HTROLLEY = 5;
const DTROLLEY = 80;

const WCABLE = WPENDANT;
const HCABLE = 50;              // TODO: ADD DELTA2

const WBLOCK = 8;
const HBLOCK = 4;

const WCLAW = 8;
const HCLAW = 10;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(100));

    createCrane(0, 0, 0);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCamera() {
    'use strict';
    camera = new THREE.PerspectiveCamera(70,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);
    camera.position.x = 250;
    camera.position.y = 250;
    camera.position.z = 250;
    camera.lookAt(scene.position);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function addCraneBase(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(WBASE, HBASE, WBASE);
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.position.set(x, y + HBASE/2, z);
    obj.add(mesh);
}

function addCraneTower(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(WTOWER, HTOWER, WTOWER);
    mesh = new THREE.Mesh(geometry, materials[1]);
    mesh.position.set(x, y + HTOWER/2 + HBASE, z);
    obj.add(mesh);
}

function addFrontPendant(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(WPENDANT/2, WPENDANT/2, LPENDANT1); 
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.x = -Math.PI / 2 + ALPHA;
    mesh.position.set(x, y + Math.sin(ALPHA) * LPENDANT1/2 + HJIBCJIB/2, z + WTOWER/2 - LPENDANT1/2 + Math.cos(ALPHA) * LPENDANT1);
    obj.add(mesh);
}

function addRearPendant(obj, x, y, z) {
    'use strict';

    geometry = new THREE.CylinderGeometry(WPENDANT/2, WPENDANT/2, LPENDANT2); 
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.x = Math.PI / 2 - BETA;
    mesh.position.set(x, y + Math.sin(BETA) * LPENDANT2/2 + HJIBCJIB/2, z - WTOWER/2 + LPENDANT2/2 - Math.cos(BETA) * LPENDANT2);
    obj.add(mesh);
}

function addCabin(obj, x, y, z) {
    'use strict';
    
    geometry = new THREE.BoxGeometry(WCABIN, HCABIN, LCABIN);
    mesh = new THREE.Mesh(geometry, materials[2]);
    mesh.position.set(x - WCABIN/2 - WTOWER/2, y - HCABIN/2 - HJIBCJIB/2, z + WCABIN/2 - WTOWER/2);
    obj.add(mesh);
}

function addCounterWeight(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(WCWEIGHT, HCWEIGHT, WCWEIGHT);
    mesh = new THREE.Mesh(geometry, materials[2]);
    mesh.position.set(x, y + HJIBCJIB/2 - HCWEIGHT/2, z - WTOWER/2 - LCWEIGHT - DCWEIGHT);
    obj.add(mesh);
}

function addCable(obj, x, y, z) {
    geometry = new THREE.CylinderGeometry(WCABLE/2, WCABLE/2, HCABLE); 
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.position.set(x, y - HCABLE/2 - HTROLLEY/2, z);
    obj.add(mesh);
}

function addClaw1(obj, x, y, z) {
    const geometry = new THREE.BufferGeometry();

    // creates a right tetrahedron
    const vertices = new Float32Array([
        -WCLAW/2, -HCLAW/2, -WCLAW/2,
         WCLAW/2, -HCLAW/2, -WCLAW/2,
        -WCLAW/2,  HCLAW/2, -WCLAW/2,

        -WCLAW/2, -HCLAW/2, -WCLAW/2,
        -WCLAW/2, -HCLAW/2,  WCLAW/2,
        -WCLAW/2,  HCLAW/2, -WCLAW/2,

        -WCLAW/2, -HCLAW/2, -WCLAW/2,
        -WCLAW/2, -HCLAW/2,  WCLAW/2,
         WCLAW/2, -HCLAW/2, -WCLAW/2,

         WCLAW/2, -HCLAW/2, -WCLAW/2,
        -WCLAW/2,  HCLAW/2, -WCLAW/2,
        -WCLAW/2, -HCLAW/2,  WCLAW/2,
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ) );

    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.z = Math.PI;
    mesh.position.set(x, y - HCLAW/2 - HBLOCK, z - WBLOCK/2);

    // TODO: ADD THETA2

    obj.add(mesh);
}

function addClaw2(obj, x, y, z) {
    const geometry = new THREE.BufferGeometry();

    // creates a right tetrahedron
    const vertices = new Float32Array([
        -WCLAW/2, -HCLAW/2, -WCLAW/2,
         WCLAW/2, -HCLAW/2, -WCLAW/2,
         WCLAW/2,  HCLAW/2, -WCLAW/2,

        -WCLAW/2, -HCLAW/2, -WCLAW/2,
        -WCLAW/2, -HCLAW/2,  WCLAW/2,
         WCLAW/2,  HCLAW/2, -WCLAW/2,

        -WCLAW/2, -HCLAW/2, -WCLAW/2,
        -WCLAW/2, -HCLAW/2,  WCLAW/2,
         WCLAW/2, -HCLAW/2, -WCLAW/2,

         WCLAW/2, -HCLAW/2, -WCLAW/2,
         WCLAW/2,  HCLAW/2, -WCLAW/2,
        -WCLAW/2, -HCLAW/2,  WCLAW/2,
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ) );
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.z = Math.PI;
    mesh.position.set(x, y - HCLAW/2 - HBLOCK, z + WBLOCK/2);

    // TODO: ADD THETA2

    obj.add(mesh);
}

function addClaw3(obj, x, y, z) {
    const geometry = new THREE.BufferGeometry();

    // creates a right tetrahedron
    const vertices = new Float32Array([
         WCLAW/2, -HCLAW/2,  WCLAW/2,
        -WCLAW/2, -HCLAW/2,  WCLAW/2,
         WCLAW/2,  HCLAW/2,  WCLAW/2,

         WCLAW/2, -HCLAW/2,  WCLAW/2,
         WCLAW/2, -HCLAW/2, -WCLAW/2,
         WCLAW/2,  HCLAW/2,  WCLAW/2,

         WCLAW/2, -HCLAW/2,  WCLAW/2,
         WCLAW/2, -HCLAW/2, -WCLAW/2,
        -WCLAW/2, -HCLAW/2,  WCLAW/2,

        -WCLAW/2, -HCLAW/2,  WCLAW/2,
         WCLAW/2,  HCLAW/2,  WCLAW/2,
         WCLAW/2, -HCLAW/2, -WCLAW/2,
    ]);

    geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ) );
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.z = Math.PI;
    mesh.position.set(x - WBLOCK/2, y - HCLAW/2 - HBLOCK, z);

    // TODO: ADD THETA2

    obj.add(mesh);
}

function addClaw4(obj, x, y, z) {
    const geometry = new THREE.BufferGeometry();

    // creates a right tetrahedron
    const vertices = new Float32Array([
        WCLAW/2, -HCLAW/2,  WCLAW/2,
       -WCLAW/2, -HCLAW/2,  WCLAW/2,
       -WCLAW/2,  HCLAW/2, -WCLAW/2,

        WCLAW/2, -HCLAW/2,  WCLAW/2,
        WCLAW/2, -HCLAW/2, -WCLAW/2,
       -WCLAW/2,  HCLAW/2, -WCLAW/2,

        WCLAW/2, -HCLAW/2,  WCLAW/2,
        WCLAW/2, -HCLAW/2, -WCLAW/2,
       -WCLAW/2, -HCLAW/2,  WCLAW/2,

       -WCLAW/2, -HCLAW/2,  WCLAW/2,
       -WCLAW/2,  HCLAW/2, -WCLAW/2,
        WCLAW/2, -HCLAW/2, -WCLAW/2,
   ]);

    geometry.setAttribute('position', new THREE.BufferAttribute( vertices, 3 ) );
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.rotation.z = Math.PI;
    mesh.position.set(x + WBLOCK/2, y - HCLAW/2 - HBLOCK, z);

    // TODO: ADD THETA2

    obj.add(mesh);
}

function addBlockAndClaw(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(WBLOCK, HBLOCK, WBLOCK);
    mesh = new THREE.Mesh(geometry, materials[2]);
    mesh.position.set(x, y - HBLOCK/2, z);
    obj.add(mesh);

    addClaw1(obj, x, y, z);
    addClaw2(obj, x, y, z);
    addClaw3(obj, x, y, z);
    addClaw4(obj, x, y, z);
}

function addTrolley(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(WTROLLEY, HTROLLEY, WTROLLEY);
    mesh = new THREE.Mesh(geometry, materials[2]);
    mesh.position.set(x, y, z);  // TODO: ADD DELTA1
    obj.add(mesh);

    addCable(obj, x, y, z);
    addBlockAndClaw(obj, x, y - HCABLE - HTROLLEY/2, z);
}

function addCraneJib(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(WTOWER, HJIBCJIB, LJIBCJIB);
    mesh = new THREE.Mesh(geometry, materials[1]);
    mesh.position.set(x, y, z + WTOWER/2 + LJIB/2 - LCJIB/2);
    obj.add(mesh);

    addFrontPendant(obj, x, y, z);   // Tirante 1
    addRearPendant(obj, x, y, z);    // Tirante 2
    addCabin(obj, x, y, z);
    addCounterWeight(obj, x, y, z);

    // TODO: ADD THETA1
    addTrolley(obj, x, y - HJIBCJIB/2, z + DTROLLEY + WTOWER/2 + WTROLLEY/2);
}

function createCrane(x, y, z) {
    'use strict';

    var crane = new THREE.Object3D();

    addCraneBase(crane, 0, 0, 0);
    addCraneTower(crane, 0, 0, 0);
    addCraneJib(crane, 0, HBASE + 0.9 * HTOWER + HJIBCJIB/2, 0);

    scene.add(crane);

    crane.position.x = x;
    crane.position.y = y;
    crane.position.z = z;
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
    createCamera();

    window.addEventListener("keydown", onKeyDown);

    render();
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
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

    switch (e.keyCode) {
    case 49: //1
        //material.wireframe = !material.wireframe;
        break;
    case 50: //2
        //material.wireframe = !material.wireframe;
        break;
    case 51: //3
        //material.wireframe = !material.wireframe;
        break;
    case 52: //4
        //material.wireframe = !material.wireframe;
        break;
    case 53: //5
        //material.wireframe = !material.wireframe;
        break;
    case 54: //6
        //material.wireframe = !material.wireframe;
        break;
    case 55: //7
        for (let i = 0; i < materials.length; i++)
            materials[i].wireframe = !materials[i].wireframe;   
        break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
}

init();
animate();