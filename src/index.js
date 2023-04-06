const WIREFRAME = false

import "./style.css"
import HexagonPatch from "./HexagonPatch"
import env, { SCALE } from "./env"
import perfNow from "performance-now"

import {
    AmbientLight,
    BoxGeometry, BufferGeometry, ConeBufferGeometry,
    DirectionalLight,
    DirectionalLightHelper, LineBasicMaterial, LineSegments,
    Mesh,
    MeshStandardMaterial,
    PCFSoftShadowMap,
    PerspectiveCamera,
    Scene, Vector3,
    WebGLRenderer
} from "three"


import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js"
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"
import { BokehPass } from "three/addons/postprocessing/BokehPass.js"
import World from "./World"
import { Terrain } from "./terrain"
import loadModel from "./loadModel"

const TAU = Math.PI * 2

let camera, scene, renderer

let mouseX = 0, mouseY = 0, mouseFirst = true;
let mouseDeltaX = 0, mouseDeltaY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let width = window.innerWidth;
let height = window.innerHeight;

const postprocessing = {};

const cameraRadius = 50

let cameraHeight = 1
let cameraAngle = 0

const adjustedZero = new Vector3(0,0,0)

function init()
{
    //const seed = 1412
    const seed = -202558213
    //const seed = (Math.random() * 4294967296) & 0xffffffff
    const world = new World(seed)
    env.init(world)

    adjustedZero.setY(world.calculateHeight(0,0) + 5)

    const container = document.getElementById("root")

    camera = new PerspectiveCamera( 50, width / height, 1, 30000 );

    scene = new Scene();

    renderer = new WebGLRenderer();
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = PCFSoftShadowMap; // default THREE.PCFShadowMap
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    container.appendChild( renderer.domElement );

    const ambientLight = new AmbientLight("#4572ff", 0.4)
    scene.add(ambientLight)

    const directionalLight = new DirectionalLight( 0xffffff, 1 );
    // directionalLight.castShadow = true
    //Set up shadow properties for the light
    // directionalLight.shadow.mapSize.width = 512; // default
    // directionalLight.shadow.mapSize.height = 512; // default
    // directionalLight.shadow.camera.near = 0.5; // default
    // directionalLight.shadow.camera.far = 500; // default

    directionalLight.position.set(0,adjustedZero.y + 20,10);
    directionalLight.target.position.copy(adjustedZero)
    directionalLight.target.updateWorldMatrix()

    scene.add( directionalLight );
    const helper = new DirectionalLightHelper( directionalLight, 2 );
    helper.position.copy(adjustedZero)
    scene.add( helper );

    const patch = new HexagonPatch(0, 0)
    const terrain = new Terrain(scene, world, patch)

    const [geoms, lines] = terrain.createGeometries(msTiles)


    geoms.forEach(
        (geom) => {
            const geometry = geom.createThreeGeometry()
            if (geometry)
            {
                const material = new MeshStandardMaterial({
                    roughness: 0.9,
                    ... geom.terrain.material,
                    wireframe: WIREFRAME,
                    //vertexColors: true
                })

                const mesh = new Mesh(geometry, material)
                // mesh.castShadow = true
                // mesh.receiveShadow = true
                scene.add(mesh)
            }
        }
    )

    if (lines.length)
    {
        const material = new LineBasicMaterial({
            color: 0x7f000000,
            depthTest: false
        });

        const geometry = new BufferGeometry().setFromPoints( lines );

        const line = new LineSegments( geometry, material );
        scene.add( line );
    }

    const material = new MeshStandardMaterial({
        roughness: 0.9,
        color: "#c55"
    })

    const cubeGeo = new ConeBufferGeometry(5,10)
    const cube = new Mesh(cubeGeo, material)
    // cube.castShadow = true
    // cube.receiveShadow = true
    cube.position.copy(adjustedZero)
    scene.add(cube)
    //
    // tiles.forEach( t => {
    //
    //     t.position.setY(10)
    //     scene.add(t)
    // })

    ///////////////////////////////////////////////

    initPostprocessing();

    renderer.autoClear = false;

    container.style.touchAction = 'none';
    container.addEventListener( 'pointermove', onPointerMove );

    window.addEventListener( 'resize', onWindowResize );

    postprocessing.bokeh.uniforms[ 'focus' ].value = 100;
    postprocessing.bokeh.uniforms[ 'aperture' ].value = 0.00005;
    //postprocessing.bokeh.uniforms[ 'maxblur' ].value = 0.015;
    postprocessing.bokeh.uniforms[ 'maxblur' ].value = 0.005;
}

function onPointerMove( event ) {

    if ( event.isPrimary === false ) return;

    const prevX = mouseX
    const prevY = mouseY

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

    if (!mouseFirst && !event.shiftKey)
    {
        mouseDeltaX += (mouseX - prevX)
        mouseDeltaY += (mouseY - prevY)
    }
    mouseFirst = false
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    width = window.innerWidth;
    height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height );
    postprocessing.composer.setSize( width, height );

}

function initPostprocessing() {

    const renderPass = new RenderPass( scene, camera );

    const bokehPass = new BokehPass( scene, camera, {
        focus: 1.0,
        aperture: 0.025,
        maxblur: 0.01
    } );

    const composer = new EffectComposer( renderer );

    composer.addPass( renderPass );
    composer.addPass( bokehPass );

    postprocessing.composer = composer;
    postprocessing.bokeh = bokehPass;

}

function animate() {

    requestAnimationFrame( animate);
    render();
}

function render() {

    const time = perfNow() * 0.005;

    const sensitivity = 0.00036
    const sensitivityY = 0.05
    cameraAngle += mouseDeltaX * sensitivity

    const cameraX = Math.cos(cameraAngle) * cameraRadius
    const cameraZ = Math.sin(cameraAngle) * cameraRadius

    const camBase = env.world.calculateHeight(cameraX, cameraZ);

    const minY = camBase + 10
    const maxY = camBase + 250

    cameraHeight -= mouseDeltaY * sensitivityY
    cameraHeight = cameraHeight < minY ? minY : cameraHeight > maxY ? maxY : cameraHeight

    camera.position.set(cameraX, cameraHeight, cameraZ)

    camera.lookAt( adjustedZero );

    postprocessing.bokeh.uniforms.focus.value = camera.position.clone().sub(adjustedZero).length()
    postprocessing.composer.render( 0.01 );

    mouseDeltaX = Math.floor(mouseDeltaX * 90) / 100
    mouseDeltaY = Math.floor(mouseDeltaY * 90) / 100

}

let msTiles = {}

Promise.all([
    loadModel("media/marching-squares.glb")
])
.then(
    ([gltf]) => {

        gltf.scene.children.forEach( k => {
            msTiles[k.name] = k
        })

        // console.log("TILE NAMES", Object.keys(msTiles))
        // console.log("TILES", msTiles)

        init();

        console.log("RTREE", env.world.rTree)

        animate();

        window.addEventListener("gamepadconnected", (e) => {

            document.getElementById("img-ghostpad").className = "invisible"
            document.getElementById("img-gamepad").className = ""

            const gp = navigator.getGamepads()[e.gamepad.index];

            console.log(`Gamepad connected at index ${gp.index}: ${gp.id}. It has ${gp.buttons.length} buttons and ${gp.axes.length} axes.`)


        });

        window.addEventListener("gamepaddisconnected", (e) => {

            document.getElementById("img-ghostpad").className = ""
            document.getElementById("img-gamepad").className = "invisible"

        });

    }
)


