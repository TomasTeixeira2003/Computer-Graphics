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

// mobius strip
const MOBIUS_RADIUS = 30;
const MOBIUS_WIDTH = 8;

// cylinder
const CYLINDER_RADIUS = 20;
const CYLINDER_HEIGHT = 30;

// rings
const RING_HEIGHT = CYLINDER_HEIGHT / 3;
const RING_WIDTH = 35;
const IRING_IRADIUS = CYLINDER_RADIUS;
const IRING_ORADIUS = IRING_IRADIUS + RING_WIDTH;
const IRING_SURFACES_RADIUS = IRING_IRADIUS + RING_WIDTH / 2;
const MRING_IRADIUS = IRING_ORADIUS;
const MRING_ORADIUS = MRING_IRADIUS + RING_WIDTH;
const MRING_SURFACES_RADIUS = MRING_IRADIUS + RING_WIDTH / 2;
const ORING_IRADIUS = MRING_ORADIUS;
const ORING_ORADIUS = ORING_IRADIUS + RING_WIDTH;
const ORING_SURFACES_RADIUS = ORING_IRADIUS + RING_WIDTH / 2;

// surfaces
const KLEIN_HEIGHT = 20;
const PLANE_HEIGHT = 10;
const PLANE_WIDTH = 8;

// total number of items
const RING_NUMBER = 3;
const SURFACE_NUMBER = 8;
const POINT_LIGHT_NUMBER = 8;

// speeds
const SURFACE_SPEED = 2;
const CYLINDER_SPEED = 0.1;
const RING_SPEED = 10;

// indexes
const SURFACES_INDEX = 3;
const CYLINDER_INDEX = 4;
const MOBIUS_STRIP_INDEX = 5;
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
var pointLights = [];

// object3D(s)
var carousel, mobiusStrip, cylinder, innerRing, middleRing, outerRing;
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
    0xACEDFD,           // cylinder
    0x00FF00            // mobius strip
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
    ],
    [new THREE.MeshLambertMaterial({ color: colors[5], side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ color: colors[5], side: THREE.DoubleSide }),
    new THREE.MeshToonMaterial({ color: colors[5], side: THREE.DoubleSide }),
    new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: colors[5], side: THREE.DoubleSide })
    ]
]

function plane(width, height) {
    return function (u, v, target) {
        const x = u * width - width / 2;
        const y = 0;
        const z = v * height;

        target.set(x, y, z);
    };
}

function elliptic_torus(a, b, c) {
    return function (u, v, target) {
        u *= 11/6 * Math.PI;
        v *= 2 * Math.PI;
        const x = (c + a * Math.cos(v)) * Math.cos(u);
        const y = (c + a * Math.cos(v)) * Math.sin(u);
        const z = b * Math.sin(v);
        target.set(x, y, z);
    }
}

function one_sheeted_hyperboloid(a, c) {
    return function (u, v, target) {
        u *= 11/6 * Math.PI;
        v = 2 * v - 1;
        const x = a * Math.cosh(v) * Math.cos(u);
        const y = a * Math.cosh(v) * Math.sin(u);
        const z = c * Math.sinh(v);
        target.set(x, y, z);
    }
}

function two_sheeted_hyperboloid(a, c) {
    return function (u, v, target) {
        if (u == 0.5) return;
        u = (u - 0.5) * 2;
        v *= 11/6 * Math.PI;
        const x = a * Math.sinh(u) * Math.cos(v);
        const y = a * Math.sinh(u) * Math.sin(v);
        const z = c * Math.cosh(u) * u / Math.abs(u);
        target.set(x, y, z);
    }
}

function paraboloid(a) {
    return function (u, v, target) {
        v *= 11/6 * Math.PI;
        u *= 2;
        const x = a * u * Math.cos(v);
        const y = a * u * Math.sin(v);
        const z = Math.pow(u, 2);
        target.set(x, y, z);
    }
}

function pseudosphere(a) {
    return function (u, v, target) {
        u = (u - 0.5) * 7;
        v *= 11/6 * Math.PI;
        const x = a * Math.cos(v) / Math.cosh(u);
        const y = a * Math.sin(v) / Math.cosh(u);
        const z = a * (u - Math.tanh(u));
        target.set(x, y, z);
    };
}

var paramSurfaces = [
    { func: ParametricGeometries.klein, offset: KLEIN_HEIGHT / 2 },
    { func: ParametricGeometries.mobius3d, offset: 0.5 },
    { func: plane(PLANE_WIDTH, PLANE_HEIGHT), offset: 0 },
    { func: elliptic_torus(2, 2, 2), offset: 2 },
    { func: one_sheeted_hyperboloid(2, 2), offset: 2 },
    { func: two_sheeted_hyperboloid(4, 2), offset: 4 },
    { func: paraboloid(2), offset: 0 },
    { func: pseudosphere(2), offset: 5 }
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
    createMobiusStrip();
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
    var spotlight = new THREE.SpotLight(0xffffff, 1);
    spotlight.position.set(0, 100, 0); // Ajuste a posição conforme necessário
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
    spotlight.shadow.camera.near = 0.5;
    spotlight.shadow.camera.far = 500;

    // Direciona a luz para o centro da surface
    spotlight.target.position.set(0, 0, 0);
    surface.add(spotlight);
    surface.add(spotlight.target);

    // Adicione a spotlight à cena global se necessário
    scene.add(spotlight);
    scene.add(spotlight.target);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createMobiusStrip() {
    mobiusStrip = new THREE.Object3D();
    mobiusStrip.position.set(0, 100, 0);
    geometry = new THREE.BufferGeometry();

    const segments = 50;
    const vertices = [];

    for (let i = 0; i <= segments; i++) {
        const t = i * 2 * Math.PI / segments;
        const nextT = (i + 1) * 2 * Math.PI / segments;
        
        const x1 = (MOBIUS_RADIUS + MOBIUS_WIDTH * Math.cos(t / 2)) * Math.cos(t);
        const z1 = (MOBIUS_RADIUS + MOBIUS_WIDTH * Math.cos(t / 2)) * Math.sin(t);
        const y1 = MOBIUS_WIDTH * Math.sin(t / 2);

        const x2 = (MOBIUS_RADIUS - MOBIUS_WIDTH * Math.cos(t / 2)) * Math.cos(t);
        const z2 = (MOBIUS_RADIUS - MOBIUS_WIDTH * Math.cos(t / 2)) * Math.sin(t);
        const y2 = - MOBIUS_WIDTH * Math.sin(t / 2);

        const x3 = (MOBIUS_RADIUS + MOBIUS_WIDTH * Math.cos(nextT / 2)) * Math.cos(nextT);
        const z3 = (MOBIUS_RADIUS + MOBIUS_WIDTH * Math.cos(nextT / 2)) * Math.sin(nextT);
        const y3 = MOBIUS_WIDTH * Math.sin(nextT / 2);

        const x4 = (MOBIUS_RADIUS - MOBIUS_WIDTH * Math.cos(nextT / 2)) * Math.cos(nextT);
        const z4 = (MOBIUS_RADIUS - MOBIUS_WIDTH * Math.cos(nextT / 2)) * Math.sin(nextT);
        const y4 = - MOBIUS_WIDTH * Math.sin(nextT / 2);

        // first triangle
        vertices.push(x1, y1, z1);
        vertices.push(x2, y2, z2);
        vertices.push(x3, y3, z3);

        // second triangle
        vertices.push(x2, y2, z2);
        vertices.push(x3, y3, z3);
        vertices.push(x4, y4, z4);

        // add lights
        if (i % Math.floor(segments / 8) === 0) {
            const light = new THREE.PointLight(0xffffff, 40, 250);
            light.position.set((x1+x2)/2 + Math.cos(t), (y1+y2)/2, (z1+z2)/2 + Math.sin(t));
            pointLights.push(light);
        }
    }

    // convert array and create indicesArray
    const verticesArray = new Float32Array(vertices);
    const indicesArray = new Uint32Array(
        Array.from({ length: (segments+1) * 6 },
        (_, index) => index)
    );

    geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
    geometry.setIndex(new THREE.BufferAttribute(indicesArray, 1));
    geometry.computeVertexNormals();

    mesh = new THREE.Mesh(geometry, materials[MOBIUS_STRIP_INDEX][GOURAUD_INDEX]);
    for (let i = 0; i < POINT_LIGHT_NUMBER; i++)
        mesh.add(pointLights[i]);

    scene.add(mobiusStrip);
    mobiusStrip.add(mesh);
}

function createSurfaces(ring, ringIndex) {
    for (var i = 0; i < SURFACE_NUMBER; i++) {
        ring.surfaces[i] = new THREE.Object3D();
        var surface = ring.surfaces[i];
        surface.position.set(
            ring.rSurfaces * Math.cos(i * Math.PI / 4),
            RING_HEIGHT,
            ring.rSurfaces * Math.sin(i * Math.PI / 4)
        );
        ring.object.add(surface);

        const geometry = new ParametricGeometry(paramSurfaces[(i + ringIndex) % SURFACE_NUMBER].func, 100, 100);
        mesh = new THREE.Mesh(geometry, materials[SURFACES_INDEX][GOURAUD_INDEX]);
        mesh.scale.set(ringIndex + 1, ringIndex + 1, ringIndex + 1);
        mesh.rotation.set(-Math.PI / 2, 0, Math.PI / 3 * (3 * (ringIndex + 1) + i));
        mesh.position.set(
            0,
            paramSurfaces[(i + ringIndex) % SURFACE_NUMBER].offset * (ringIndex + 1),
            0,
        );

        surface.add(mesh);
        addSpotlightToSurface(surface);
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

function createRing(ring, initial_height, ringIndex) {
    'use strict';

    ring.object.userData = { moving: false, direction: 1 };
    ring.object.position.set(0, initial_height, 0);

    cylinder.add(ring.object);

    const path = new THREE.Curve();
    path.getPoint = function (t) { return new THREE.Vector3(0, 0, RING_HEIGHT * t); };

    const geometry = new THREE.ExtrudeGeometry(createRingShape(ring), { steps: 64, extrudePath: path });
    const mesh = new THREE.Mesh(geometry, materials[ringIndex][GOURAUD_INDEX]);

    // we rotate the mesh after extruding as to extrude we need to use the 
    // 2D shape in the xOy plane so that the extrusion is done at the z axis
    mesh.rotation.x = Math.PI / 2;
    ring.object.add(mesh);
    mesh.position.set(0, RING_HEIGHT, 0);

    createSurfaces(ring, ringIndex);
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
        createRing(rings[ringIndex], RING_HEIGHT * (RING_NUMBER - ringIndex-1), ringIndex);
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
    mobiusStrip.children[0].material = materials[MOBIUS_STRIP_INDEX][index];
    for (let i = 0; i < RING_NUMBER; i++) {
        rings[i].object.children[0].material = materials[i][index];
        for (let j = 0; j < SURFACE_NUMBER; j++)
            rings[i].surfaces[j].children[0].material = materials[SURFACES_INDEX][index];
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
        case 80: //P
            for (let i = 0; i < POINT_LIGHT_NUMBER; i++)
                pointLights[i].visible = !pointLights[i].visible;
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
        case 81: //Q
            changeToShading(GOURAUD_INDEX);
            carousel.userData.shading_type = GOURAUD_INDEX;
            break;
        case 87: //W
            changeToShading(PHONG_INDEX);
            carousel.userData.shading_type = PHONG_INDEX;
            break;
        case 69: //E
            changeToShading(CARTOON_INDEX);
            carousel.userData.shading_type = CARTOON_INDEX;
            break;
        case 82: //R
            changeToShading(NORMALMAP_INDEX);
            carousel.userData.shading_type = NORMALMAP_INDEX;
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