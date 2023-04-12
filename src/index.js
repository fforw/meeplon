import "./style.css"
import HexagonPatch from "./proc/HexagonPatch"
import env from "./env"
import perfNow from "performance-now"
import $entity from "@fforw/entity/entity.macro"
import $log from "./util/log.macro"

import {
    AmbientLight, BoxBufferGeometry,
    DirectionalLight,
    DirectionalLightHelper, DoubleSide, InstancedBufferAttribute, InstancedBufferGeometry,
    Mesh,
    MeshStandardMaterial,
    Quaternion, RawShaderMaterial,
    Scene,
    Vector3,
    WebGLRenderer
} from "three"

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js"
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"
import { BokehPass } from "three/addons/postprocessing/BokehPass.js"
import World from "./proc/World"
import { calculateNormalFromHeightMap, Terrain, TerrainTypes } from "./proc/terrain"
import loadModels from "./util/loadModels"
import Camera from "./system/Camera"
import Controller from "./system/Controller"
import { buttonPressed } from "./util/util"
import customizeMaterialShader from "./util/customizeMaterialShader"


const WIREFRAME = false

const sys = require("./entity/config")

const TAU = Math.PI * 2

let camera, scene, renderer, controller

let mouseX = 0, mouseY = 0, mouseFirst = true;
let mouseDeltaX = 0, mouseDeltaY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let width = window.innerWidth;
let height = window.innerHeight;

const postprocessing = {};

//const cameraTarget = new Vector3(0,0,0)

//const seed = 1412
//const seed = 1138731272
const seed = -1174255477
//const seed = (Math.random() * 4294967296) & 0xffffffff
const world = new World(seed)
env.init(world)


function cubes(x = 0, y = 0, z = 0)
{
    const size = 10
    return [
         size + x,  size + y,  size + z,
         size + x,  size + y, -size + z,
        -size + x,  size + y,  size + z,
        -size + x,  size + y, -size + z,
         size + x, -size + y,  size + z,
         size + x, -size + y, -size + z,
        -size + x, -size + y,  size + z,
        -size + x, -size + y, -size + z

    ]
}


function init()
{
    const container = document.getElementById("root")

    camera = new Camera(width / height)

    controller = new Controller(camera)

    scene = new Scene();

    renderer = new WebGLRenderer();
    renderer.physicallyCorrectLights = true
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = PCFSoftShadowMap; // default THREE.PCFShadowMap
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    container.appendChild( renderer.domElement );

    const ambientLight = new AmbientLight("#4572ff", 1.5)
    scene.add(ambientLight)

    const directionalLight = new DirectionalLight( 0xffffff, 4 );
    // directionalLight.castShadow = true
    //Set up shadow properties for the light
    // directionalLight.shadow.mapSize.width = 512; // default
    // directionalLight.shadow.mapSize.height = 512; // default
    // directionalLight.shadow.camera.near = 0.5; // default
    // directionalLight.shadow.camera.far = 500; // default

    const initialTarget = new Vector3(0, Math.max(14, world.calculateHeight(0,0) + 7), 0)

    directionalLight.position.set(0,initialTarget.y + 20,10);
    directionalLight.target.position.copy(initialTarget)
    directionalLight.target.updateWorldMatrix()

    scene.add( directionalLight );
    const helper = new DirectionalLightHelper( directionalLight, 2 );
    helper.position.copy(initialTarget)
    scene.add( helper );

    const patch = new HexagonPatch(0, 0)
    const terrain = new Terrain(scene, world, patch)



    const [geoms, debug] = terrain.createGeometries(msTiles)


    let empties = []
    geoms.forEach(
        (geom, terrain) => {
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
            else
            {
                empties.push(TerrainTypes[terrain].name)
            }
        }
    )

    if (empties.length)
    {
        console.log("No geometry for types " + empties.join(", "))
    }

    debug.addToScene(scene)

    const minCode = terrain.faces.map(f => f.code).reduce((a,b) => Math.min(Math.abs(a),Math.abs(b)), Infinity)

    const range = 400

    console.log("MATCHES", terrain.faces.filter( f => Math.abs(f.code - minCode ) < range ))


    {
        const cubeGeo = new InstancedBufferGeometry().copy(new BoxBufferGeometry(10, 10, 10))
        cubeGeo.instanceCount = 56;

        cubeGeo.setAttribute("cubePos", new InstancedBufferAttribute(new Float32Array([
            ... cubes(0,0,0),
            ... cubes(30,0,0),
            ... cubes(0,30,0),
            ... cubes(0,0,30),
            ... cubes(-30,0,0),
            ... cubes(0,-30,0),
            ... cubes(0,0,-30),
        ]), 3, 1));

        const vertexShader = [
            "precision highp float;",
            "",
            "uniform mat4 modelViewMatrix;",
            "uniform mat4 projectionMatrix;",
            "",
            "attribute vec3 position;",
            "attribute vec3 cubePos;",
            "",
            "void main() {",
            "",
            "	gl_Position = projectionMatrix * modelViewMatrix * vec4( cubePos + position, 1.0 );",
            "",
            "}"
        ].join("\n")
        const fragmentShader = [
            "precision highp float;",
            "",
            "void main() {",
            "",
            "	gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);",
            "",
            "}"
        ].join("\n")

        // const mat = new RawShaderMaterial({
        //     uniforms: {},
        //     vertexShader: vertexShader,
        //     fragmentShader: fragmentShader,
        //     side: DoubleSide,
        //     transparent: false,
        //     onBeforeCompile( shader, renderer)
        //     {
        //         console.log(shader.vertexShader)
        //     }
        // })

        const mat = new MeshStandardMaterial(
            customizeMaterialShader({
                    roughness: 0.05,
                    color: "#fff",
                },

                // language=glsl
                `
                    attribute vec3 cubePos;
                    `,

                // language=glsl
                `
                    vec4 mvPosition = vec4( transformed, 1.0 );

                    mvPosition = modelViewMatrix * vec4( cubePos + position, 1.0 );

                    gl_Position = projectionMatrix * mvPosition;`
            ))


        var mesh = new Mesh(cubeGeo, mat);

        mesh.position.set(0,150,0)
        mesh.frustumCulled = false


        scene.add(mesh);
    }


    const material = new MeshStandardMaterial({
        roughness: 0.9,
        color: "#c55"
    })

    // const cubeGeo = new ConeBufferGeometry(5,10)
    // const cube = new Mesh(cubeGeo, material)
    // cube.castShadow = true
    // cube.receiveShadow = true
    player.position.copy(initialTarget)

    player.scale.set(5,5,5)
    scene.add(player)

    playerEntity = sys.newEntity({
        // Identity
        id: -1,

        // Appearance
        x: initialTarget.x,
        y: initialTarget.y - 7,
        z: initialTarget.z,

        // Health
        health: 100
    })

    sys.addComponent(playerEntity, "CameraTarget")
    sys.addComponent(playerEntity, "Controlled")


    $entity(playerEntity => {
        console.log({playerEntity, id: playerEntity.id})

    })

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

    camera.updateAspectRatio(width / height)

    renderer.setSize( width, height );
    postprocessing.composer.setSize( width, height );

}

function initPostprocessing() {

    const renderPass = new RenderPass( scene, camera.camera );

    const bokehPass = new BokehPass( scene, camera.camera, {
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



function logGamepadState()

{
    const { gamepad } = controller
    if (!gamepad)
    {
        return
    }


    const { buttons } = gamepad
    for (let i = 0; i < buttons.length; i++)
    {
        if (buttonPressed(buttons[i]))
        {
            console.log("Button #" + i + " pressed" )
        }
    }

    //console.log("AXES: " + gamepad.axes.map(axis => axis.toFixed(4)))

}

let playerAngle = 0

const up = new Vector3(0,1,0)
const front = new Vector3(0,0,1)
function wrap(number)
{
    const n = number/TAU - (number/TAU | 0);
    return n < 0 ? TAU + n * TAU : n * TAU;
}

function getDistance(x0, y0, z0, x1, y1, z1)
{
    const dx = x1 - x0
    const dy = y1 - y0
    const dz = z1 - z0

    return Math.sqrt(dx * dx + dy * dy + dz * dz)
}



function animate() {

    logGamepadState()



    //angle+=0.05

    const sensitivity = 0.00036

    camera.yaw += mouseDeltaX * sensitivity
    camera.pitch += mouseDeltaY * sensitivity

    controller.update()

    let speed, dx, dy , dz

    $entity((playerEntity) => {

        const prevX = player.position.x;
        const prevY = player.position.y;
        const prevZ = player.position.z;

        player.position.x = playerEntity.x
        player.position.y = playerEntity.y + 7
        player.position.z = playerEntity.z

        const { x, y, z} = player.position;
        
        dx = x - prevX
        dy = y - prevY
        dz = z - prevZ

        speed = Math.sqrt(dx * dx + dy * dy + dz * dz)

        const f = 1 / speed

        dx *= f
        dy *= f
        dz *= f

    })

    const forward = new Vector3(dx, dy, dz)

    const localUp = new Vector3( ... calculateNormalFromHeightMap(world, player.position.x, player.position.z)).multiplyScalar(-1)

    // rotate around the local up axis

    let q2 = new Quaternion().setFromUnitVectors(
        up,
        localUp
    )

    player.quaternion.rotateTowards(q2, 0.2)
    if (speed > 0.5)
    {
        const q = new Quaternion().setFromUnitVectors(
            front.clone().applyQuaternion(q2),
            forward
        )

        player.quaternion.rotateTowards(q, 0.3)
    }

    camera.update()

    postprocessing.bokeh.uniforms.focus.value = camera.currentDistance

    render();
    requestAnimationFrame( animate);
}


function render() {

    const time = perfNow() * 0.005;

    postprocessing.composer.render( 0.01 );

    mouseDeltaX = Math.floor(mouseDeltaX * 90) / 100
    mouseDeltaY = Math.floor(mouseDeltaY * 90) / 100

}

let msTiles
let objects
let primitives
let player
let playerEntity


function getGamepadInfo(gp)
{
    return `[Gamepad #${gp.index}: ${gp.buttons.length} buttons / ${gp.axes.length} axes]`
}


Promise.all([
    loadModels("media/marching-squares.glb"),
    loadModels("media/objects.glb"),
    loadModels("media/primitives.glb"),
])
.then(
    ([glbTiles, glbObjects, glbPrimitives]) => {

        msTiles = glbTiles
        objects = glbObjects
        primitives = glbPrimitives

        // console.log("MS TILES", Object.keys(msTiles), "map", msTiles)
        // console.log("OBJECTS", Object.keys(objects), "map", objects)
        //console.log("PRIMITIVES", Object.keys(primitives), "map", primitives)

        player = primitives["Triangle"]

        init();
        animate();

        window.addEventListener("gamepadconnected", (e) => {

            document.getElementById("img-ghostpad").className = "invisible"
            document.getElementById("img-gamepad").className = ""

            controller.gamepad = navigator.getGamepads()[e.gamepad.index];

            console.log(getGamepadInfo(controller.gamepad), "connected")
        });

        window.addEventListener("gamepaddisconnected", (e) => {

            document.getElementById("img-ghostpad").className = ""
            document.getElementById("img-gamepad").className = "invisible"
            controller.gamepad = null
            console.log(getGamepadInfo(navigator.getGamepads()[e.gamepad.index]), "disconnected")

        });

    }
)

export default {
    world
}

/*
XXX: Interleaved setup

const arraybuffer = new Uint32Array([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7]);
const geometry = new THREE.InstancedBufferGeometry().copy(new THREE.BoxGeometry(1, 1, 1));
geometry.instanceCount = Infinity;
const iIB = new THREE.InstancedInterleavedBuffer(arraybuffer, 2, 1); // this part is important
geometry.setAttribute("attr1", new THREE.InterleavedBufferAttribute(iIB, 1, 0));
geometry.setAttribute("attr2", new THREE.InterleavedBufferAttribute(iIB, 1, 1));

let material = new THREE.MeshLambertMaterial({
  color: 0xff0000,
  //wireframe: true,
  onBeforeCompile: shader => {
    shader.vertexShader = `
      attribute uint attr1;
      attribute uint attr2;
      ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
        transformed.xy += vec2(attr1, attr2); // check, that it's working
      `
    );
    console.log(shader.vertexShader)
  }
});


 */
