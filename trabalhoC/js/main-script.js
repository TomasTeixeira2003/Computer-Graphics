import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { ParametricGeometries } from "three/addons/geometries/ParametricGeometries.js";

///////////////
/* CONSTANTS */
///////////////

// skydome
const SKYDOME_RADIUS = 175;
const SKYDOME_WIDTH = 32;
const SKYDOME_HEIGHT = 16;
const SKYDOME_PHI_START = 0;
const SKYDOME_PHI_LENGHT = 2 * Math.PI;
const SKYDOME_THETA_START = 0;
const SKYDOME_THETA_LENGHT = Math.PI / 2;

// mobius strip
const MOBIUS_RADIUS = 45;
const MOBIUS_WIDTH = 16;

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
const SPOT_LIGHT_NUMBER = 24;

// speeds
const SURFACE_SPEED = 2;
const CAROUSEL_SPEED = 0.1;
const RING_SPEED = 10;

// indexes
const CYLINDER_INDEX = 6;
const MOBIUS_STRIP_INDEX = 7;
const SKYDOME_INDEX = 8;
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
var pointLights = [], spotLights = [];

// object3D(s)
var carousel;
var innerRing = new THREE.Object3D();
var middleRing = new THREE.Object3D();
var outerRing = new THREE.Object3D();

// meshes
var mobiusStrip, cylinder;
var geometry, mesh;

var rings = [
    { object: innerRing, innerRadius: IRING_IRADIUS, outerRadius: IRING_ORADIUS, surfaces: [], rSurfaces: IRING_SURFACES_RADIUS },
    { object: middleRing, innerRadius: MRING_IRADIUS, outerRadius: MRING_ORADIUS, surfaces: [], rSurfaces: MRING_SURFACES_RADIUS },
    { object: outerRing, innerRadius: ORING_IRADIUS, outerRadius: ORING_ORADIUS, surfaces: [], rSurfaces: ORING_SURFACES_RADIUS },
];

// clock
var clock = new THREE.Clock();
var delta_t;

// colors
var colors = [
    0x07C8F9,           // inner ring
    0x0A85ED,           // medium ring
    0x0D41E1,           // outer ring
    0xFFBE0B,           // inner ring parametric surfaces
    0xFB5607,           // medium ring parametric surfaces
    0xFF006E,           // outer ring parametric surfaces
    0xACEDFD,           // cylinder
    0x007700            // mobius strip
]

// skydome and skydome textures
var skydome;

// the still taken from the video was upscaled for better visual results
var map = new THREE.TextureLoader().load('textures/texture.png');
var bmap = new THREE.TextureLoader().load('textures/bumpmap.png');
var dmap = new THREE.TextureLoader().load('textures/displacementmap.png');

var materials = [
    [new THREE.MeshLambertMaterial({ color: colors[0] }),
    new THREE.MeshPhongMaterial({ color: colors[0], shininess: 50, specular: 0x6e6e6e }),
    new THREE.MeshToonMaterial({ color: colors[0] }),
    new THREE.MeshNormalMaterial(),
    new THREE.MeshBasicMaterial({ color: colors[0] })
    ],
    [new THREE.MeshLambertMaterial({ color: colors[1] }),
    new THREE.MeshPhongMaterial({ color: colors[1], shininess: 50, specular: 0x6e6e6e }),
    new THREE.MeshToonMaterial({ color: colors[1] }),
    new THREE.MeshNormalMaterial(),
    new THREE.MeshBasicMaterial({ color: colors[1] })
    ],
    [new THREE.MeshLambertMaterial({ color: colors[2] }),
    new THREE.MeshPhongMaterial({ color: colors[2], shininess: 50, specular: 0x6e6e6e }),
    new THREE.MeshToonMaterial({ color: colors[2] }),
    new THREE.MeshNormalMaterial(),
    new THREE.MeshBasicMaterial({ color: colors[2] })
    ],
    [new THREE.MeshLambertMaterial({ color: colors[3], side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ color: colors[3], side: THREE.DoubleSide, shininess: 50, specular: 0x6e6e6e}),
    new THREE.MeshToonMaterial({ color: colors[3], side: THREE.DoubleSide }),
    new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: colors[3], side: THREE.DoubleSide })
    ],
    [new THREE.MeshLambertMaterial({ color: colors[4], side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ color: colors[4], side: THREE.DoubleSide, shininess: 50, specular: 0x6e6e6e}),
    new THREE.MeshToonMaterial({ color: colors[4], side: THREE.DoubleSide }),
    new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: colors[4], side: THREE.DoubleSide })
    ],
    [new THREE.MeshLambertMaterial({ color: colors[5], side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ color: colors[5], side: THREE.DoubleSide, shininess: 50, specular: 0x6e6e6e}),
    new THREE.MeshToonMaterial({ color: colors[5], side: THREE.DoubleSide }),
    new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: colors[5], side: THREE.DoubleSide })
    ],
    [new THREE.MeshLambertMaterial({ color: colors[6] }),
    new THREE.MeshPhongMaterial({ color: colors[6], shininess: 50, specular: 0x6e6e6e }),
    new THREE.MeshToonMaterial({ color: colors[6] }),
    new THREE.MeshNormalMaterial(),
    new THREE.MeshBasicMaterial({ color: colors[6] })
    ],
    [new THREE.MeshLambertMaterial({ color: colors[7], side: THREE.DoubleSide }),
    new THREE.MeshPhongMaterial({ color: colors[7], side: THREE.DoubleSide, shininess: 50, specular: 0x005c00 }),
    new THREE.MeshToonMaterial({ color: colors[7], side: THREE.DoubleSide }),
    new THREE.MeshNormalMaterial({ side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ color: colors[7], side: THREE.DoubleSide })
    ],
    [new THREE.MeshLambertMaterial({ map: map, side: THREE.BackSide, bumpMap: bmap, bumpScale: 8, displacementMap: dmap, displacementScale: 2, }),
    new THREE.MeshPhongMaterial({ map: map, side: THREE.BackSide, bumpMap: bmap, bumpScale: 8, displacementMap: dmap, displacementScale: 2, shininess: 50, specular: 0x6e6e6e }),
    new THREE.MeshToonMaterial({ map: map, side: THREE.BackSide, bumpMap: bmap, bumpScale: 8, displacementMap: dmap, displacementScale: 2, }),
    new THREE.MeshNormalMaterial({ side: THREE.BackSide, bumpMap: bmap, bumpScale: 8, displacementMap: dmap, displacementScale: 2, }),
    new THREE.MeshBasicMaterial({ map: map, side: THREE.BackSide, })
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
        u *= 2 * Math.PI;
        v *= 2 * Math.PI;
        const x = (c + a * Math.cos(v)) * Math.cos(u);
        const y = b * Math.sin(v);
        const z = (c + a * Math.cos(v)) * Math.sin(u);
        target.set(x, y, z);
    }
}

function one_sheeted_hyperboloid(a, c) {
    return function (u, v, target) {
        u *= 2 * Math.PI;
        v = 2 * v - 1;
        const x = a * Math.cosh(v) * Math.cos(u);
        const y = c * Math.sinh(v);
        const z = a * Math.cosh(v) * Math.sin(u);
        target.set(x, y, z);
    }
}

function parabolic_hyperboloid(a, b) {
    return function (u, v, target) {
        u = (u - 0.5) * 2 * Math.PI;
        v = (v - 0.5) * 2;
        const x = u; 
        const y = v; 
        const z = v*v / b*b - u*u/a*a;
        target.set(x, y, z);
    }
}

function pillow(a) {
    return function (u, v, target) {
        v *= Math.PI;
        u *= 2 * Math.PI;
        const x = a * Math.cos(u);
        const y = a * Math.cos(v);
        const z = a * Math.sin(u) * Math.sin(v)
        target.set(x, y, z);
    }
}

function pseudosphere(a) {
    return function (u, v, target) {
        u = (u - 0.5) * 7;
        v *= 2 * Math.PI;
        const x = a * Math.cos(v) / Math.cosh(u);
        const y = a * (u - Math.tanh(u));
        const z = a * Math.sin(v) / Math.cosh(u);
        target.set(x, y, z);
    };
}

var paramSurfaces = [
    { func: ParametricGeometries.klein, offset: KLEIN_HEIGHT / 2 },
    { func: ParametricGeometries.mobius3d, offset: 0.5 },
    { func: plane(PLANE_WIDTH, PLANE_HEIGHT), offset: 0 },
    { func: elliptic_torus(2, 2, 2), offset: 4 },
    { func: one_sheeted_hyperboloid(2, 2), offset: 3.1 },
    { func: parabolic_hyperboloid(2, 1), offset: 10},
    { func: pillow(2), offset: 2 },
    { func: pseudosphere(2), offset: 2 }
]

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';

    scene = new THREE.Scene();

    ambientLight = new THREE.AmbientLight(0xFFC58F, 0.4);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
    directionalLight.position.set(250, 250, 250);
    directionalLight.target.position.set(scene.position.x, scene.position.y, scene.position.z);
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

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function addSpotlightToSurface(surface, ring, surfaceIndex) {
    var spotlight = new THREE.SpotLight(0xffffff, 500);
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
    spotlight.shadow.camera.near = 0.5;
    spotlight.shadow.camera.far = 500;

    ring.object.add(spotlight);

    spotlight.position.set(
        ring.innerRadius * Math.cos(surfaceIndex * Math.PI / 4),
        RING_HEIGHT + 2,
        ring.innerRadius * Math.sin(surfaceIndex * Math.PI / 4)
    );

    spotlight.target = surface;
    spotLights.push(spotlight); // in order to be able to turn them on/off
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function createMobiusStrip() {
    geometry = new THREE.BufferGeometry();

    // 0.71 constant is used as an approximation of sqrt(2)/2
    const verticesArray = new Float32Array([
        MOBIUS_RADIUS, MOBIUS_WIDTH/2, 0,
        MOBIUS_RADIUS, -MOBIUS_WIDTH/2, 0,
        0.71 * MOBIUS_RADIUS , MOBIUS_WIDTH/2, 0.71 * MOBIUS_RADIUS,
        0.71 * MOBIUS_RADIUS, -MOBIUS_WIDTH/2, 0.71 * MOBIUS_RADIUS,
        0, 0.71*MOBIUS_WIDTH/2, MOBIUS_RADIUS+0.71*MOBIUS_WIDTH/2,
        0, -0.71*MOBIUS_WIDTH/2, MOBIUS_RADIUS-0.71*MOBIUS_WIDTH/2,
        -0.71 * (MOBIUS_RADIUS+0.71*MOBIUS_WIDTH/2), 0.71*MOBIUS_WIDTH/2, 0.71 * (MOBIUS_RADIUS+0.71*MOBIUS_WIDTH/2),
        -0.71 * (MOBIUS_RADIUS-0.71*MOBIUS_WIDTH/2), -0.71*MOBIUS_WIDTH/2, 0.71 *(MOBIUS_RADIUS-0.71*MOBIUS_WIDTH/2),
        -(MOBIUS_RADIUS+MOBIUS_WIDTH/2), 0, 0,
        -(MOBIUS_RADIUS-MOBIUS_WIDTH/2), 0, 0,
        -0.71 * (MOBIUS_RADIUS+MOBIUS_WIDTH/2), 0, -0.71 * (MOBIUS_RADIUS+MOBIUS_WIDTH/2),
        -0.71 * (MOBIUS_RADIUS-MOBIUS_WIDTH/2), 0, -0.71 * (MOBIUS_RADIUS-MOBIUS_WIDTH/2),
        0, -0.71*MOBIUS_WIDTH/2, -(MOBIUS_RADIUS+0.71*MOBIUS_WIDTH/2),
        0, 0.71*MOBIUS_WIDTH/2, -(MOBIUS_RADIUS-0.71*MOBIUS_WIDTH/2),
        0.71 * (MOBIUS_RADIUS+0.71*MOBIUS_WIDTH/2), -0.71*MOBIUS_WIDTH/2, -0.71 * (MOBIUS_RADIUS+0.71*MOBIUS_WIDTH/2),
        0.71 * (MOBIUS_RADIUS-0.71*MOBIUS_WIDTH/2), 0.71*MOBIUS_WIDTH/2, -0.71 * (MOBIUS_RADIUS-0.71*MOBIUS_WIDTH/2)
    ]);
    const indicesArray = [
        0,1,2,
        2,1,3,
        2,3,4,
        4,3,5,
        4,5,6,
        6,5,7,
        6,7,8,
        8,7,9,
        8,9,10,
        10,9,11,
        10,11,12,
        12,11,13,
        12,13,14,
        14,13,15,
        14,15,1,
        1,15,0
    ];

    geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
    geometry.setIndex(indicesArray);
    geometry.computeVertexNormals();
    geometry.normalsNeedUpdate = true;

    mobiusStrip = new THREE.Mesh(geometry, materials[MOBIUS_STRIP_INDEX][GOURAUD_INDEX]);
    mobiusStrip.position.set(0, 100, 0);

    for (let i = 0; i < 8; i++) {
        const u = (i / 8) * 2 * Math.PI + Math.PI / 6;
        const light = new THREE.PointLight(0xffffff, 60, 250);
        light.position.set(-(MOBIUS_RADIUS + 1.5) * Math.cos(u), 0, -(MOBIUS_RADIUS + 1.5) * Math.sin(u));
        mobiusStrip.add(light);
        pointLights.push(light);
    }

    scene.add(mobiusStrip);
}

function createSurfaces(ring, ringIndex) {
    for (var i = 0; i < SURFACE_NUMBER; i++) {
        geometry = new ParametricGeometry(paramSurfaces[(i + ringIndex) % SURFACE_NUMBER].func, 100, 100);
        geometry.normalsNeedUpdate = true;
        ring.surfaces[i] = new THREE.Mesh(geometry, materials[3 + ringIndex][GOURAUD_INDEX]);
        var surface = ring.surfaces[i];

        surface.scale.set(ringIndex + 1, ringIndex + 1, ringIndex + 1);
        surface.rotation.set(-Math.PI / 2, 0, Math.PI / 3 * (3 * (ringIndex + 1) + i));
        surface.position.set(
            ring.rSurfaces * Math.cos(i * Math.PI / 4),
            RING_HEIGHT + paramSurfaces[(i + ringIndex) % SURFACE_NUMBER].offset * (ringIndex + 1),
            ring.rSurfaces * Math.sin(i * Math.PI / 4),
        );

        ring.object.add(surface);
        addSpotlightToSurface(surface, ring, i);
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

    ring.object.userData = { moving: true, direction: 1 };
    ring.object.position.set(0, initial_height, 0);

    carousel.add(ring.object);

    const path = new THREE.Curve();
    path.getPoint = function (t) { return new THREE.Vector3(0, 0, RING_HEIGHT * t); };

    geometry = new THREE.ExtrudeGeometry(createRingShape(ring), { steps: 64, extrudePath: path });
    geometry.normalsNeedUpdate = true;
    mesh = new THREE.Mesh(geometry, materials[ringIndex][GOURAUD_INDEX]);

    // we rotate the mesh after extruding as to extrude we need to use the 
    // 2D shape in the xOy plane so that the extrusion is done at the z axis
    mesh.rotation.x = Math.PI / 2;
    ring.object.add(mesh);
    mesh.position.set(0, RING_HEIGHT, 0);

    createSurfaces(ring, ringIndex);
}

function createCenterCylinder() {
    'use strict';

    geometry = new THREE.CylinderGeometry(CYLINDER_RADIUS, CYLINDER_RADIUS, CYLINDER_HEIGHT);
    geometry.normalsNeedUpdate = true;
    cylinder = new THREE.Mesh(geometry, materials[CYLINDER_INDEX][GOURAUD_INDEX]);
    cylinder.position.set(0, CYLINDER_HEIGHT / 2, 0);
    carousel.add(cylinder);

    for (var ringIndex = 0; ringIndex < RING_NUMBER; ringIndex++)
        createRing(rings[ringIndex], RING_HEIGHT * (RING_NUMBER - ringIndex-1), ringIndex);
}

function createCarousel() {
    'use strict';
    carousel = new THREE.Object3D();

    // Object3D position is lowered to accommodate VR visualization
    carousel.position.set(0, - CYLINDER_HEIGHT/2 - 2 * RING_HEIGHT, 0);
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
    geometry.normalsNeedUpdate = true;
    skydome = new THREE.Mesh(geometry, materials[SKYDOME_INDEX][GOURAUD_INDEX]);
    
    // mesh position is lowered to accommodate VR visualization
    skydome.position.set(0, - CYLINDER_HEIGHT/2 - 2 * RING_HEIGHT, 0);
    scene.add(skydome);
}

////////////
/* UPDATE */
////////////
function update() {
    'use strict';
    for (var ringIndex = 0; ringIndex < RING_NUMBER; ringIndex++) {
        // rotate surfaces
        for (var surfaceIndex = 0; surfaceIndex < SURFACE_NUMBER; surfaceIndex++)
            rings[ringIndex].surfaces[surfaceIndex].rotateZ(SURFACE_SPEED * delta_t);

        // move rings
        var ring = rings[ringIndex].object
        if (ring.userData.moving) {
            ring.position.y += ring.userData.direction * RING_SPEED * delta_t;

            // change direction
            if (ring.position.y < 0) {
                ring.userData.direction = -ring.userData.direction;
                ring.position.y = 0;
            }
            else if (ring.position.y >= CYLINDER_HEIGHT - RING_HEIGHT) {
                ring.userData.direction = -ring.userData.direction;
                ring.position.y = CYLINDER_HEIGHT - RING_HEIGHT
            }
        }
    }
    carousel.rotateY(CAROUSEL_SPEED * delta_t);
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
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.body.appendChild(renderer.domElement);

    document.body.appendChild(VRButton.createButton(renderer));
    renderer.xr.enabled = true;

    createScene();
    camera1 = createPerspectiveCamera(150, 150, 150);
    camera2 = new THREE.StereoCamera();

    camera = camera1;

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener('resize', onResize, false);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////

function animate() {
    'use strict';
    delta_t = clock.getDelta();
    update();
    render();
    renderer.setAnimationLoop(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
    'use strict';
   
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);  
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////

function changeToShading(index) {
    if (!carousel.userData.lighting)
        return;

    skydome.material = materials[SKYDOME_INDEX][index];
    cylinder.material = materials[CYLINDER_INDEX][index];
    mobiusStrip.material = materials[MOBIUS_STRIP_INDEX][index];
    for (let i = 0; i < RING_NUMBER; i++) {
        rings[i].object.children[0].material = materials[i][index];
        for (let j = 0; j < SURFACE_NUMBER; j++)
            rings[i].surfaces[j].material = materials[3 + i][index];
    }
}

function onKeyDown(e) {
    'use strict';

    switch (e.keyCode) {
        case 49: //1
            innerRing.userData.moving = !innerRing.userData.moving;
            break;
        case 50: //2
            middleRing.userData.moving = !middleRing.userData.moving ;
            break;
        case 51: //3
            outerRing.userData.moving = !outerRing.userData.moving;
            break;
        case 68: //D
            directionalLight.visible = !directionalLight.visible;
            break;
        case 80: //P
            for (let i = 0; i < POINT_LIGHT_NUMBER; i++)
                pointLights[i].visible = !pointLights[i].visible;
            break;
        case 83: //S
            for (let i = 0; i < SPOT_LIGHT_NUMBER; i++)
                spotLights[i].visible = !spotLights[i].visible;
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

init();
animate();