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

    geometry = new THREE.BoxGeometry(20, 10, 20);
    mesh = new THREE.Mesh(geometry, materials[0]);
    mesh.position.set(x, y + 5, z);
    obj.add(mesh);
}

function addCraneTower(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(10, 220, 10);
    mesh = new THREE.Mesh(geometry, materials[1]);
    mesh.position.set(x, y + 120, z);
    obj.add(mesh);
}

function addCraneJib(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(10, 10, 260);
    mesh = new THREE.Mesh(geometry, materials[1]);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createCrane(x, y, z) {
    'use strict';

    var crane = new THREE.Object3D();

    addCraneBase(crane, 0, 0, 0);
    addCraneTower(crane, 0, 0, 0);

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