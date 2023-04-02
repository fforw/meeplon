import "./style.css"
import HexagonPatch from "./HexagonPatch"
import env from "./env"
import perfNow from "performance-now"

import {
    BufferGeometry,
    DirectionalLight, DoubleSide,
    Float32BufferAttribute, Mesh, MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    WebGLRenderer
} from "three"

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js"
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"
import { BokehPass } from "three/addons/postprocessing/BokehPass.js"
import World from "./World"


const TAU = Math.PI * 2

let camera, scene, renderer

let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let width = window.innerWidth;
let height = window.innerHeight;

const postprocessing = {};


function calculateNormal(x0, y0)
{
    const e = 0.1

    const x1 = x0 + e
    const y1 = y0

    const x2 = x0
    const y2 = y0 + e

    const z0 = Terrain.calculateHeight(x0,y0)
    const z1 = Terrain.calculateHeight(x1,y1)
    const z2 = Terrain.calculateHeight(x2,y2)

    const ax = x1 - x0
    const ay = y1 - y0
    const az = z1 - z0
    const bx = x2 - x0
    const by = y2 - y0
    const bz = z2 - z0


    const nx = ay * bz - az * by
    const ny = az * bx - ax * bz
    const nz = ax * by - ay * bx

    const f = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
    return [
        nx * f,
        ny * f,
        nz * f
    ]
}


class Terrain
{
    /**
     * @type {Scene}
     */
    scene = null

    /**
     *
     * @type {HexagonPatch}
     */
    patch = null

    world = null

    /**
     *
     * @type {Array.<Face>}
     */
    faces = null

    constructor(scene, world, patch)
    {
        this.scene = scene
        this.world = world
        this.patch = patch
        this.faces = this.patch.build()
    }

    static calculateHeight(x,y)
    {
        const noise = env.world.noise;

        const ns0 = 0.0015
        const ns1= ns0 * 2
        const ns2= ns1 * 2

        const height = 100

        const h = ((
                noise.noise2D(x * ns0, y * ns0) +
                noise.noise2D(x * ns1, y * ns1) * 0.5 +
                noise.noise2D(x * ns2, y * ns2) * 0.25
            ) / 1.75) * height

        return h > -0.5 ? h : 0
    }

    createGeometry()
    {
        const patchX = 0
        const patchY = 0

        const geometry = new BufferGeometry()

        const indices = []

        const vertices = []
        const normals = []
        const colors = []

        const faces = this.faces
        for (let i = 0; i < faces.length; i++)
        {
            const face = faces[i]

            let isFlat = false

            const vOff = vertices.length/3
            const tri = (x,y,z) => indices.push(vOff + x, vOff + y, vOff + z)

            const first = face.halfEdge
            let curr = first

            let cx = 0
            let cy = 0
            do
            {
                const next = curr.next

                const x0 = 0 | (patchX + curr.vertex.x)
                const y0 = 0 | (patchY + curr.vertex.y)
                const x1 = 0 | (patchX + next.vertex.x)
                const y1 = 0 | (patchY + next.vertex.y)

                const mx = (x0 + x1) / 2
                const my = (y0 + y1) / 2

                const z0 = Terrain.calculateHeight(x0,y0)
                vertices.push(
                    x0,y0,z0,
                    mx,my,Terrain.calculateHeight(mx,my)
                )

                normals.push(
                    ... calculateNormal(x0,y0),
                    ... calculateNormal(mx,my)
                )

                colors.push(0,128,0)
                colors.push(0,128,0)

                cx += mx
                cy += my

                curr = next
            } while (curr !== first)

            cx >>= 2
            cy >>= 2


            vertices.push(
                cx,cy,Terrain.calculateHeight(cx,cy),
            )

            normals.push(
                ... calculateNormal(cx,cy)
            )

            colors.push(0,128,0)

            tri(0,1,7)
            tri(7,1,8)

            tri(1,2,3)
            tri(3,8,1)

            tri(5,8,3)
            tri(3,4,5)

            tri(5,6,7)
            tri(7,8,5)
        }


        geometry.setIndex(indices)
        geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3))
        geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3))
        geometry.setAttribute("color", new Float32BufferAttribute(colors, 3))

        return geometry
    }

}



function init() {

    const container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new PerspectiveCamera( 70, width / height, 1, 3000 );
    camera.position.z = 400;

    scene = new Scene();

    renderer = new WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height );
    container.appendChild( renderer.domElement );

    const directionalLight = new DirectionalLight( 0xffffff, 1 );

    directionalLight.position.set(0,5,10)
    directionalLight.target.position.set(0,0,0)
    directionalLight.target.updateWorldMatrix()

    scene.add( directionalLight );

    ///////////////////////////////////////////////

    const patch = new HexagonPatch(0, 0, 32)

    const world = new World()
    env.init(world)

    const terrain = new Terrain(scene, world, patch)

    const geometry = terrain.createGeometry();

    const material = new MeshStandardMaterial({
        roughness: 0.8,
        vertexColors: true
    })

    const mesh = new Mesh(geometry, material)
    scene.add(mesh)

    ///////////////////////////////////////////////

    initPostprocessing();

    renderer.autoClear = false;

    container.style.touchAction = 'none';
    container.addEventListener( 'pointermove', onPointerMove );

    window.addEventListener( 'resize', onWindowResize );

    postprocessing.bokeh.uniforms[ 'focus' ].value = 100;
    postprocessing.bokeh.uniforms[ 'aperture' ].value = 0.025;
    //postprocessing.bokeh.uniforms[ 'maxblur' ].value = 0.015;
    postprocessing.bokeh.uniforms[ 'maxblur' ].value = 0.015;
}

function onPointerMove( event ) {

    if ( event.isPrimary === false ) return;

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

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

    camera.position.x = ( mouseX - camera.position.x ) * 0.144;
    camera.position.y = ( - ( mouseY ) - camera.position.y ) * 0.144;

    camera.lookAt( scene.position );

    //postprocessing.bokeh.uniforms.maxblur.value = Math.sin(time) * 0.03
    postprocessing.composer.render( 0.01 );

}

init();
animate();

