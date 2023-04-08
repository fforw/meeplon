import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three"
import { distance } from "three/nodes"
import AABB from "../util/AABB"
import DebugLines from "../util/DebugLines"
import getDistance from "../util/getDistance"


export function calculateNormalFromHeightMap(world, x0, z0)
{
    const e = 0.01

    const x1 = x0 + e
    const z1 = z0

    const x2 = x0
    const z2 = z0 + e

    const y0 = world.calculateHeight(x0,z0)
    const y1 = world.calculateHeight(x1,z1)
    const y2 = world.calculateHeight(x2,z2)

    return calculateNormal(x0, y0, z0, x1, y1, z1, x2, y2, z2)
}

export function calculateNormal(x0, y0, z0, x1, y1, z1, x2, y2, z2)
{
    const ax = x1 - x0
    const ay = y1 - y0
    const az = z1 - z0
    const bx = x2 - x0
    const by = y2 - y0
    const bz = z2 - z0

    const nx = ay * bz - az * by
    const ny = az * bx - ax * bz
    const nz = ax * by - ay * bx

    const f = 1/ Math.sqrt(nx * nx + ny * ny + nz * nz);

    // if (f === Infinity)
    // {
    //     return [0,1,0]
    // }

    return [
        nx * f,
        ny * f,
        nz * f
    ]
}


// console.log(TerrainTypes.map((t,i) => t.name + ": " + i + ",").join("\n"))

function initCenterAndAABB(world,face)
{
    const patchX = 0
    const patchY = 0

    const first = face.halfEdge;
    let curr = first;

    let x = 0
    let z = 0

    const aabb = new AABB()
    do
    {
        const next = curr.next;

        const x0 = 0|patchX + curr.vertex.x
        const z0 = 0|patchY + curr.vertex.y

        x += x0;
        z += z0;

        aabb.add(x,z)

        curr = next
    }  while (curr !== first)
    x >>= 2
    z >>= 2

    aabb.grow(1)

    face.center = [
        x,
        Math.round(world.calculateHeight(x, z)),
        z
    ]
    face.aabb = aabb

    world.rTree.insert(aabb, face)
}

function getArea(face) {
    const patchX = 0
    const patchY = 0

    const first = face.halfEdge;
    let curr = first;

    let area = 0
    do
    {
        const next = curr.next;

        const x0 = 0|patchX + curr.vertex.x
        const z0 = 0|patchY + curr.vertex.y
        const x1 = 0|patchX + next.vertex.x
        const z1 = 0|patchY + next.vertex.y

        area += z1 * x0 - x1 * z0;

        curr = next
    }  while (curr !== first)

    return area / 2;
}

function initializeFaces(world, faces)
{
    faces.forEach(
        face => {
            initCenterAndAABB(world, face)

            face.forEachHalfEdge(he => {
                const { vertex } = he
                if (vertex.biome < 0)
                {
                    vertex.z = world.calculateHeight(vertex.x, vertex.y)
                    vertex.biome = world.getBiome(vertex.x, vertex.y, vertex.z)
                    if (vertex.z < 10)
                    {
                        vertex.z = 10
                    }

                }
            })
        }
    )
}


class GeomPerMat
{
    world = null
    indices = []
    vertices = []
    normals = []
    terrain = -1

    constructor(
        world,
        terrain
    )
    {
        this.world = world
        this.terrain = terrain
    }


    triFn()
    {
        const vOff = this.vertices.length/3
        return (a, b, c) => this.indices.push(vOff + a, vOff + b, vOff + c)
    }


    addVertices(x, y, z)
    {
        this.vertices.push(x,y,z)
    }

    addNormal(x, y, z)
    {
        const l = Math.sqrt(x * x + y * y + z * z);
        const f = 1/l
        x *= f
        y *= f
        z *= f
        this.normals.push(x,y,z)
    }

    getVertex(idx)
    {
        const off = idx * 3
        const x = this.vertices[off]
        const y = this.vertices[off + 1]
        const z = this.vertices[off + 2]

        return [x,y,z]
    }



    createThreeGeometry()
    {
        if (!this.indices.length)
        {
            return null;
        }

        // console.log("index", this.indices)
        // console.log("position", this.vertices)
        // console.log("normal", this.normals)

        const geometry = new BufferGeometry()
        geometry.setIndex(this.indices)
        geometry.setAttribute("position", new Float32BufferAttribute(this.vertices, 3))
        geometry.setAttribute("normal", new Float32BufferAttribute(this.normals, 3))
        return geometry
    }
}

let tileNameLookup = [
    null,
    "case-1",
    "case-2",
    "case-3",
    "case-4",
    "case-m5",
    "case-6",
    "case-7",
    "case-8",
    "case-9",
    "case-m10",
    "case-11",
    "case-12",
    "case-13",
    "case-14",
    "case-15",

    // multi case
    null,
    "case-m1",
    "case-m2",
    "case-3",
    "case-m4",
    "case-m5",
    "case-6",
    "case-7",
    "case-m8",
    "case-9",
    "case-m10",
    "case-11",
    "case-12",
    "case-13",
    "case-14",
    "case-15",
]



function getStats(diffs)
{

    let median
    const len = diffs.length
    let half = len >> 1
    if ((len & 1) === 0)
    {
        median = diffs[half].diff
    }
    else
    {
        median = (diffs[half].diff + diffs[half + 1].diff)/2
    }

    console.log("DIFFS", diffs)
    console.log("Median Height difference", median)
    console.log("Average Height difference", diffs.reduce((a,b) => a + b.diff, 0) / diffs.length)

}

function getEdgesByHeightDifference(faces)
{
    const edgesCounted = new Set()

    const differences = []
    for (let i = 0; i < faces.length; i++)
    {
        const face = faces[i]

        const first = face.halfEdge;
        let curr = first;
        do
        {
            let edge = curr.edge
            if (!edgesCounted.has(edge) && curr.twin)
            {
                edgesCounted.add(edge)

                const y0 = face.center[2]
                const y1 = curr.twin.face.center[2]

                const diff = Math.abs(y0-y1)
                differences.push({diff, edge})
            }

            curr = curr.next

        } while (curr !== first)
    }

    differences.sort((a,b) => a.diff - b.diff)

    return differences
}


export class Terrain {
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

        initializeFaces(world, this.faces)
    }


    createGeometries(msTiles)
    {
        const MARK_FACES = false

        const patchX = 0
        const patchY = 0

        const { world } = this

        const geoms = TerrainTypes.map( tt => new GeomPerMat(world,tt))

        const faces = this.faces

        const debug = new DebugLines();

        for (let i = 0; i < faces.length; i++)
        {
            const face = faces[i]
            const first = face.halfEdge
            const { biome: biome0 } = first.vertex
            const { biome: biome1 } = first.next.vertex
            const { biome: biome2 } = first.next.next.vertex
            const { biome: biome3 } = first.next.next.next.vertex


            const localBiomes = new Set([
                biome0,
                biome1,
                biome2,
                biome3
            ])

            const multiMode = localBiomes.size > 2

            if (localBiomes.size === 1)
            {
                // easiest case. We only have one biome, case-15 with that biome, done
                this.insert(msTiles["case-15"], face, geoms[biome0])
            }
            else
            {
                for (let terrain of localBiomes)
                {
                    // multicolor marching squares lookup. First 16 values are the normal ms cases, the next 16 are for
                    // multicolor mode where some tiles switch over to a blocky form to ensure tile coverage
                    const tileName = tileNameLookup[
                        ((terrain === biome0) * 8 + (terrain === biome1) * 4 + (terrain === biome2) * 2 + (terrain === biome3)) +
                        multiMode * 16
                    ]

                    if (tileName)
                    {
                        this.insert(msTiles[tileName], face, geoms[terrain])
                    }
                }
            }

            const { vertex: vertex0 } = first
            const { vertex: vertex1 } = first.next
            const { vertex: vertex2 } = first.next.next
            const { vertex: vertex3 } = first.next.next.next


            if (MARK_FACES)
            {
                debug.line(
                    new Vector3(vertex0.x, vertex0.z, vertex0.y),
                    new Vector3(vertex1.x, vertex1.z, vertex1.y)
                )
                debug.line(
                    new Vector3(vertex1.x, vertex1.z, vertex1.y),
                    new Vector3(vertex2.x, vertex2.z, vertex2.y)
                )
                debug.line(
                    new Vector3(vertex2.x, vertex2.z, vertex2.y),
                    new Vector3(vertex3.x, vertex3.z, vertex3.y)
                )
                debug.line(
                    new Vector3(vertex3.x, vertex3.z, vertex3.y),
                    new Vector3(vertex0.x, vertex0.z, vertex0.y)
                )

                debug.line(
                    new Vector3(vertex0.x, vertex0.z, vertex0.y),
                    new Vector3(
                        (vertex0.x * 4 + vertex1.x + vertex2.x + vertex3.x)/7,
                        (vertex0.z * 4 + vertex1.z + vertex2.z + vertex3.z)/7,
                        (vertex0.y * 4 + vertex1.y + vertex2.y + vertex3.y)/7,
                    )
                )
            }
        }

        let diff = getEdgesByHeightDifference(faces)
        getStats(diff)

        // diff.filter(e => e.diff > 15).forEach(
        //     ({edge}) => {
        //
        //         const vertex0 = edge.halfEdge.vertex
        //         const vertex1 = edge.halfEdge.next.vertex
        //
        //         debug.line(
        //             new Vector3(vertex0.x, vertex0.z, vertex0.y),
        //             new Vector3(vertex1.x, vertex1.z, vertex1.y),
        //             "#f0f"
        //         )
        //     }
        // )

        return [geoms, debug]
    }


    insert(tile, face, geom)
    {
        //console.log("INSERT", tile, face, biome)

        if (tile.type !== "Mesh")
        {
            throw new Error("Expecting only meshes, is: " + geometry.type)
        }

        const { world } = this
        const { geometry } = tile

        const first = face.halfEdge
        const { vertex: vertex0 } = first
        const { vertex: vertex1 } = first.next
        const { vertex: vertex2 } = first.next.next
        const { vertex: vertex3 } = first.next.next.next


        const verticesIn = geometry.attributes.position.array
        const normalsIn = geometry.attributes.normal.array
        const indexIn = geometry.index.array

        const tri = geom.triFn()

        // hexagon patch vertices are z-up, so we swap
        const { x: x0, y: z0, z: y0} = vertex0
        const { x: x1, y: z1, z: y1} = vertex1
        const { x: x2, y: z2, z: y2} = vertex2
        const { x: x3, y: z3, z: y3} = vertex3

        for (let i = 0; i < verticesIn.length; i += 3)
        {
            let xIn = verticesIn[i    ]
            let yIn = -verticesIn[i + 1]
            let zIn = verticesIn[i + 2]

            let x = xIn + 0.5
            const y = yIn
            let z = zIn + 0.5

            const scale = (getDistance(x0,y0,z0,x2,y2,z2))/ Math.sqrt(2)

            let rx2, ry2, rz2
            let localUp;
            {
                const rx0 = x0 + (x1 - x0 ) * x
                const ry0 = y0 + (y1 - y0 ) * x
                const rz0 = z0 + (z1 - z0 ) * x

                const rx1 = x3 + (x2 - x3 ) * x
                const ry1 = y3 + (y2 - y3 ) * x
                const rz1 = z3 + (z2 - z3 ) * x

                rx2 = rx0 + (rx1 - rx0 ) * z
                ry2 = ry0 + (ry1 - ry0 ) * z
                rz2 = rz0 + (rz1 - rz0 ) * z

                localUp = calculateNormalFromHeightMap(world, rx2, rz2)

                //console.log("LOCAL UP", localUp)

                rx2 += localUp[0] * y * scale
                ry2 += localUp[1] * y * scale
                rz2 += localUp[2] * y * scale

                geom.addVertices(rx2, ry2, rz2)
            }


            {
                const nx = x + normalsIn[i    ]
                const ny = y - normalsIn[i + 1]
                const nz = z + normalsIn[i + 2]

                const rx0 = x0 + (x1 - x0 ) * nx
                const ry0 = y0 + (y1 - y0 ) * nx
                const rz0 = z0 + (z1 - z0 ) * nx

                const rx1 = x3 + (x2 - x3 ) * nx
                const ry1 = y3 + (y2 - y3 ) * nx
                const rz1 = z3 + (z2 - z3 ) * nx

                let rnx = rx0 + (rx1 - rx0 ) * nz
                let rny = ry0 + (ry1 - ry0 ) * nz
                let rnz = rz0 + (rz1 - rz0 ) * nz

                rnx += localUp[0] * ny * scale
                rny += localUp[1] * ny * scale
                rnz += localUp[2] * ny * scale

                geom.addNormal(rnx - rx2, rny - ry2, rnz - rz2)
            }
        }

        for (let i = 0; i < indexIn.length; i+=3)
        {
            const a = indexIn[i]
            const b = indexIn[i+1]
            const c = indexIn[i+2]

            tri(a,b,c)
        }
    }
}

export const TerrainTypes = [
    {
        "name": "SEA",
        heightOffset: -5,
        material : {
            roughness: 0.1,
            color : "#002888",
        }
    },
    {
        "name": "DEEP_SEA",
        heightOffset: -5,
        material : {
            roughness: 0.2,
            color : "#060f69",
        }
    },
    {
        "name": "GRASS",
        heightOffset: -2,
        material : {
            roughness: 0.96,
            color: "#284",
        }
    },
    {
        "name": "WATER",
        heightOffset: -5,
        material : {
            roughness: 0.05,
            color: "#004290",
        }
    },
    {
        "name": "TALL_GRASS",
        heightOffset: -2,
        material : {
            roughness: 0.98,
            color: "#4b8822",
        }
    },
    {
        "name": "REEDS",
        material : {
            roughness: 0.98,
            color: "#7e8822",
        }
    },
    {
        "name": "WOODS",
        heightOffset: -1,
        material : {
            roughness: 0.94,
            color: "#1c6b37",
        }
    },
    {
        "name": "DARK_WOODS",
        heightOffset: -1,
        material : {
            roughness: 0.94,
            color: "#103b29",
        }
    },
    {
        "name": "DIRT",
        heightOffset: 0,
        material : {
            roughness: 0.99,
            color: "#4d2605",
        }
    },
    {
        "name": "MUD",
        heightOffset: -1,
        material : {
            roughness: 0.7,
            color: "#38261e",
        }
    },
    {

        "name": "SAND",
        heightOffset: -3,
        material : {
            roughness: 0.99,
            color : "#afaa41",
        }
    },
    {
        "name": "ICE",
        heightOffset: 0,
        material : {
            roughness: 0.3,
            color : "#8989f8",
        }
    },
    {
        "name": "SNOW",
        heightOffset: -3,
        material : {
            roughness: 0.99,
            color : "#bbbbff",
        }
    },
    {
        "name": "ROCK",
        heightOffset: 0,
        material : {
            roughness: 0.7,
            color : "#777",
        }
    },
    {
        "name": "RAINFOREST",
        heightOffset: -1,
        material : {
            roughness: 0.95,
            color: "#049439",
        }
    },
    {
        "name": "RAINFOREST_2",
        heightOffset: -1,
        material : {
            roughness: 0.96,
            color: "#056442",
        }
    },
    {
        heightOffset: -2,
        "name": "STEPPE",
        material : {
            roughness: 0.96,
            color : "#93a167",
        }
    },
]

// console.log(TerrainTypes.map((t,i) => "Terrain." + t.name + " = " + i).join("\n"))

Terrain.SEA = 0
Terrain.DEEP_SEA = 1
Terrain.GRASS = 2
Terrain.WATER = 3
Terrain.TALL_GRASS = 4
Terrain.REEDS = 5
Terrain.WOODS = 6
Terrain.DARK_WOODS = 7
Terrain.DIRT = 8
Terrain.MUD = 9
Terrain.SAND = 10
Terrain.ICE = 11
Terrain.SNOW = 12
Terrain.ROCK = 13
Terrain.RAINFOREST = 14
Terrain.RAINFOREST_2 = 15
Terrain.STEPPE = 16
