import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { ParametricGeometries } from "three/addons/geometries/ParametricGeometries.js";

///////////////
/* CONSTANTS */
///////////////

// skydome
const SKYDOME_RADIUS = 300;
const SKYDOME_WIDTH = 32;
const SKYDOME_HEIGHT = 16;
const SKYDOME_PHI_START = 0;
const SKYDOME_PHI_LENGHT = 2 * Math.PI;
const SKYDOME_THETA_START = 0;
const SKYDOME_THETA_LENGHT = Math.PI / 2;

// cylinder
const CYLINDER_RADIUS = 20;
const CYLINDER_HEIGHT = 30;

// rings
const RING_HEIGHT = CYLINDER_HEIGHT / 3;
const RING_WIDTH = 30;
const IRING_IRADIUS = CYLINDER_RADIUS;
const IRING_ORADIUS = IRING_IRADIUS + RING_WIDTH;
const IRING_SURFACES_RADIUS = IRING_IRADIUS + RING_WIDTH / 2;
const MRING_IRADIUS = IRING_ORADIUS;
const MRING_ORADIUS = MRING_IRADIUS + RING_WIDTH;
const MRING_SURFACES_RADIUS = MRING_IRADIUS + RING_WIDTH / 2;
const ORING_IRADIUS = MRING_ORADIUS;
const ORING_ORADIUS = ORING_IRADIUS + RING_WIDTH;
const ORING_SURFACES_RADIUS = ORING_IRADIUS + RING_WIDTH / 2;

// total number of items
const RING_NUMBER = 3;
const SURFACE_NUMBER = 8;

// speeds
const SURFACE_SPEED = 2;
const CYLINDER_SPEED = 0.1;
const RING_SPEED = 10;

// indexes
const SURFACES_INDEX = 3;
const CYLINDER_INDEX = 4;
const GOURAUD_INDEX = 0;
const PHONG_INDEX = 1;
const CARTOON_INDEX = 2;
const NORMALMAP_INDEX = 3;
const BASIC_INDEX = 4;

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var scene, renderer, camera, camera1, camera2;

// lights
var ambientLight, directionalLight;

// object3D(s)
var carousel, cylinder, innerRing, middleRing, outerRing;
var innerRing = new THREE.Object3D();
var middleRing = new THREE.Object3D();
var outerRing = new THREE.Object3D();

var rings = [
    { object: innerRing, innerRadius: IRING_IRADIUS, outerRadius: IRING_ORADIUS, surfaces: [], rSurfaces: IRING_SURFACES_RADIUS },
    { object: middleRing, innerRadius: MRING_IRADIUS, outerRadius: MRING_ORADIUS, surfaces: [], rSurfaces: MRING_SURFACES_RADIUS },
    { object: outerRing, innerRadius: ORING_IRADIUS, outerRadius: ORING_ORADIUS, surfaces: [], rSurfaces: ORING_SURFACES_RADIUS },
];

// clock
var clock = new THREE.Clock();
var delta_t;

var geometry, mesh;

var colors = [
    0x07C8F9,           // inner ring
    0x0A85ED,           // medium ring
    0x0D41E1,           // outer ring
    0xFF00FF,           // parametric surfaces
    0xACEDFD            // cylinder
]

var materials = [
    [new THREE.MeshLambertMaterial({ color: colors[0], side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ color: colors[0], side: THREE.DoubleSide }),
    new THREE.MeshToonMaterial({ color: colors[0], side: THREE.DoubleSide }),
    new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: colors[0], side: THREE.DoubleSide })
    ],
    [new THREE.MeshLambertMaterial({ color: colors[1], side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ color: colors[1], side: THREE.DoubleSide }),
    new THREE.MeshToonMaterial({ color: colors[1], side: THREE.DoubleSide }),
    new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: colors[1], side: THREE.DoubleSide })
    ],
    [new THREE.MeshLambertMaterial({ color: colors[2], side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ color: colors[2], side: THREE.DoubleSide }),
    new THREE.MeshToonMaterial({ color: colors[2], side: THREE.DoubleSide }),
    new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: colors[2], side: THREE.DoubleSide })
    ],
    [new THREE.MeshLambertMaterial({ color: colors[3], side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ color: colors[3], side: THREE.DoubleSide }),
    new THREE.MeshToonMaterial({ color: colors[3], side: THREE.DoubleSide }),
    new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: colors[3], side: THREE.DoubleSide })
    ],
    [new THREE.MeshLambertMaterial({ color: colors[4], side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ color: colors[4], side: THREE.DoubleSide }),
    new THREE.MeshToonMaterial({ color: colors[4], side: THREE.DoubleSide }),
    new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: colors[4], side: THREE.DoubleSide })
    ]
]

function one_sheeted_hyperboloid(a, c) {
    return function (u, v, target) {
        const x = a * (Math.cos(u) - Math.sin(u) * v);
        const y = a * (Math.cos(u) * v + Math.sin(u));
        const z = c * v;
        target.set(x, y, z);
    }
}

function two_sheeted_hyperboloid(a, c) {
    return function (u, v, target) {
        const x = a * Math.sinh(u) * Math.cos(v);
        const y = a * Math.sinh(u) * Math.sin(v);
        const z = c * Math.cosh(u);
        target.set(x, y, z);
    }
}

function paraboloid(a, h) {
    return function (u, v, target) {
        const x = a * Math.sqrt(u / h) * Math.cos(v);
        const y = a * Math.sqrt(u / h) * Math.sin(v);
        const z = u;
        target.set(x, y, z);
    }
}

function pseudosphere(a, h) {
    return function (u, v, target) {
        const x = a * Math.cos(v) / Math.cosh(u);
        const y = a * Math.sin(v) / Math.cosh(u);
        const z = h * (u - Math.tanh(u));
        target.set(x, y, z);
    }
}

function elliptic_torus(a, b, c) {
    return function (u, v, target) {
        const x = (c + a * Math.cos(v)) * Math.cos(u);
        const y = (c + a * Math.cos(v)) * Math.sin(u);
        const z = b * Math.sin(v);
        target.set(x, y, z);
    }
}

var param_surfaces = [
    ParametricGeometries.klein,
    ParametricGeometries.plane(10, 10),
    ParametricGeometries.mobius3d,
    elliptic_torus(10, 10, 10),
    one_sheeted_hyperboloid(5, 5),
    two_sheeted_hyperboloid(10, 10),
    paraboloid(100, 100),
    pseudosphere(10, 10)
]

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';

    scene = new THREE.Scene();
    scene.add(new THREE.AxesHelper(100));

    ambientLight = new THREE.AmbientLight(0xFFC58F, 0.4);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(250, 250, 250);
    directionalLight.lookAt(scene.position);
    scene.add(directionalLight);

    createSkydome();
    createCarousel();
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

function createStereoCamera() {
    // TODO
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function addSpotlightToSurface(surface) {
    const spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(0, 0, 0);

    // TODO


    surface.add(spotLight);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createSurfaces(ring, index) {
    for (var i = 0; i < SURFACE_NUMBER; i++) {
        ring.surfaces[i] = new THREE.Object3D();
        var surface = ring.surfaces[i];
        surface.position.set(
            ring.rSurfaces * Math.cos(i * Math.PI / 4),
            RING_HEIGHT + 10, // TODO: add height of surface
            ring.rSurfaces * Math.sin(i * Math.PI / 4)
        );
        ring.object.add(surface);
        addSpotlightToSurface(surface);

        // TODO: fix this chaos
        const geometry = new ParametricGeometry(param_surfaces[(i + index) % SURFACE_NUMBER], 100, 100);
        mesh = new THREE.Mesh(geometry, materials[SURFACES_INDEX][GOURAUD_INDEX]);
        mesh.scale.set(1.5, 1.5, 1.5);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, 0, 0);
        surface.add(mesh);
    }
}

function createRingShape(ring) {
    const shape = new THREE.Shape();
    const points = 64;

    shape.moveTo(ring.innerRadius, 0);
    for (let i = 1; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;   // rotate anti-clockwise
        shape.lineTo(Math.cos(angle) * ring.innerRadius, Math.sin(angle) * ring.innerRadius);
    }
    shape.moveTo(ring.outerRadius, 0);
    for (let i = 1; i <= points; i++) {
        const angle = -(i / points) * Math.PI * 2;  // rotate clockwise
        shape.lineTo(Math.cos(angle) * ring.outerRadius, Math.sin(angle) * ring.outerRadius);
    }

    return shape;
}

function createRing(ring, initial_height, index) {
    'use strict';

    ring.object.userData = { moving: false, direction: 1 };
    ring.object.position.set(0, initial_height, 0);

    cylinder.add(ring.object);

    const path = new THREE.Curve();
    path.getPoint = function (t) { return new THREE.Vector3(0, 0, RING_HEIGHT * t); };

    const geometry = new THREE.ExtrudeGeometry(createRingShape(ring), { steps: 64, extrudePath: path });
    const mesh = new THREE.Mesh(geometry, materials[index][GOURAUD_INDEX]);

    // we rotate the mesh after extruding as to extrude we need to use the 
    // 2D shape in the xOy plane so that the extrusion is done at the z axis
    mesh.rotation.x = Math.PI / 2;
    ring.object.add(mesh);
    mesh.position.set(0, RING_HEIGHT / 2, 0);

    createSurfaces(ring, index);
}

function createCenterCylinder() {
    'use strict';

    cylinder = new THREE.Object3D();
    cylinder.position.set(0, 0, 0);

    carousel.add(cylinder);

    geometry = new THREE.CylinderGeometry(CYLINDER_RADIUS, CYLINDER_RADIUS, CYLINDER_HEIGHT);
    mesh = new THREE.Mesh(geometry, materials[CYLINDER_INDEX][GOURAUD_INDEX]);
    mesh.position.set(0, CYLINDER_HEIGHT / 2, 0);
    cylinder.add(mesh);

    for (var ringIndex = 0; ringIndex < RING_NUMBER; ringIndex++)
        createRing(rings[ringIndex], RING_HEIGHT * ringIndex, ringIndex);
}

function createCarousel() {
    'use strict';
    carousel = new THREE.Object3D();
    carousel.position.set(0, 0, 0);

    scene.add(carousel);
    createCenterCylinder();

    carousel.userData = { lighting: true, shading_type: 0 };
}

function createSkydome() {
    'use strict';

    geometry = new THREE.SphereGeometry(
        SKYDOME_RADIUS, SKYDOME_WIDTH, SKYDOME_HEIGHT, SKYDOME_PHI_START,
        SKYDOME_PHI_LENGHT, SKYDOME_THETA_START, SKYDOME_THETA_LENGHT
    );

    const texture = new THREE.TextureLoader().load('textures/texture.png');
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    mesh = new THREE.Mesh(geometry, material);

    scene.add(mesh);
}

////////////
/* UPDATE */
////////////
function update() {
    'use strict';
    for (var ringIndex = 0; ringIndex < RING_NUMBER; ringIndex++) {

        // rotate surfaces
        for (var surfaceIndex = 0; surfaceIndex < SURFACE_NUMBER; surfaceIndex++)
            rings[ringIndex].surfaces[surfaceIndex].rotateY(SURFACE_SPEED * delta_t);

        // move rings
        var ring = rings[ringIndex].object
        if (ring.userData.moving) {
            ring.position.y += ring.userData.direction * RING_SPEED * delta_t;

            // change direction
            if (ring.position.y < 0 || ring.position.y > CYLINDER_HEIGHT - RING_HEIGHT)
                ring.userData.direction = -ring.userData.direction;
        }
    }

    cylinder.rotateY(CYLINDER_SPEED * delta_t);
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
    camera1 = createPerspectiveCamera(150, 150, 150);
    camera2 = createStereoCamera();

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

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    'use strict';

}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////

function changeToShading(index) {
    if (!carousel.userData.lighting)
        return;

    cylinder.children[0].material = materials[CYLINDER_INDEX][index];
    for (let i = 0; i < RING_NUMBER; i++) {
        rings[i].object.children[0].material = materials[i][index];
        for (let j = 0; j < SURFACE_NUMBER; j++)
            rings[i].surfaces[j].children[1].material = materials[SURFACES_INDEX][index];
    }
}

function onKeyDown(e) {
    'use strict';

    switch (e.keyCode) {
        case 49: //1
            innerRing.userData.moving = true;
            break;
        case 50: //2
            middleRing.userData.moving = true;
            break;
        case 51: //3
            outerRing.userData.moving = true;
            break;
        case 68: //D
            directionalLight.visible = !directionalLight.visible;
            break;
        case 69: //E
            changeToShading(CARTOON_INDEX);
            carousel.userData.shading_type = CARTOON_INDEX;
            break;
        case 81: //Q
            changeToShading(GOURAUD_INDEX);
            carousel.userData.shading_type = GOURAUD_INDEX;
            break;
        case 82: //R
            changeToShading(NORMALMAP_INDEX);
            carousel.userData.shading_type = NORMALMAP_INDEX;
            break;
        case 84: //T
            if (carousel.userData.lighting) {
                changeToShading(BASIC_INDEX);
                carousel.userData.lighting = !carousel.userData.lighting;
            }
            else {
                carousel.userData.lighting = !carousel.userData.lighting;
                changeToShading(carousel.userData.shading_type);
            }
            break;
        case 87: //W
            changeToShading(PHONG_INDEX);
            carousel.userData.shading_type = PHONG_INDEX;
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    'use strict';

    switch (e.keyCode) {
        case 49: //1
            innerRing.userData.moving = false;
            break;
        case 50: //2
            middleRing.userData.moving = false;
            break;
        case 51: //3
            outerRing.userData.moving = false;
            break;
    }
}

init();
animate();