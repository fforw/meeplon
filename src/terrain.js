import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three"
import { forEachHalfEdge } from "./util"


function calculateNormalFromHeightMap(world, x0, z0)
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

export const TerrainTypes = [
    {
        "name": "SEA",
        material : {
            roughness: 0.1,
            color : "#018",
        }
    },
    {
        "name": "GRASS",
        material : {
            roughness: 0.96,
            color: "#284",
        }
    },
    {
        "name": "TALL_GRASS",
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
        material : {
            roughness: 0.94,
            color: "#1c6b37",
        }
    },
    {
        "name": "DARK_WOODS",
        material : {
            roughness: 0.94,
            color: "#103b29",
        }
    },
    {
        "name": "DIRT",
        material : {
            roughness: 0.99,
            color: "#4d2605",
        }
    },
    {
        "name": "MUD",
        material : {
            roughness: 0.7,
            color: "#38261e",
        }
    },
    {

        "name": "SAND",
        material : {
            roughness: 0.99,
            color : "#afaa41",
        }
    },
    {
        "name": "ICE",
        material : {
            roughness: 0.4,
            color : "#bbbbff",
        }
    },
    {
        "name": "ROCK",
        material : {
            roughness: 0.7,
            color : "#777",
        }
    },
    {
        "name": "WATER",
        material : {
            roughness: 0.05,
            color: "#004290",
        }
    }
]

function calculateCenter(world,face)
{
    const patchX = 0
    const patchY = 0

    const first = face.halfEdge;
    let curr = first;

    let x = 0
    let z = 0
    do
    {
        const next = curr.next;

        const x0 = 0|patchX + curr.vertex.x
        const z0 = 0|patchY + curr.vertex.y

        x += x0;
        z += z0;

        curr = next
    }  while (curr !== first)
    x >>= 2
    z >>= 2

    return [
        x,
        Math.round(world.calculateHeight(x,z)),
        z
    ]
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
            const center = calculateCenter(world, face)
            face.center = center

            forEachHalfEdge(face, he => {
                const { vertex } = he
                if (vertex.biome < 0)
                {
                    vertex.biome = world.getBiome(vertex.x, vertex.y)
                    vertex.z = world.calculateHeight(vertex.x, vertex.y)
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
        const f = -1/l
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
            console.log("No geometry for " + this.terrain.name)
            return null;
        }

        console.log("index", this.indices)
        console.log("position", this.vertices)
        console.log("normal", this.normals)

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

        const lines = []
        const faces = this.faces
        for (let i = 0; i < faces.length; i++)
        {
            const face = faces[i]
            const first = face.halfEdge
            const { biome: biome3 } = first.vertex
            const { biome: biome2 } = first.next.vertex
            const { biome: biome1 } = first.next.next.vertex
            const { biome: biome0 } = first.next.next.next.vertex


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
                    const tileName = tileNameLookup[
                        ((terrain === biome0) + (terrain === biome1) * 2 + (terrain === biome2) * 4 + (terrain === biome3) * 8) +
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
                lines.push(
                    new Vector3(vertex0.x, vertex0.z, vertex0.y),
                    new Vector3(vertex1.x, vertex1.z, vertex1.y)
                )
                lines.push(
                    new Vector3(vertex1.x, vertex1.z, vertex1.y),
                    new Vector3(vertex2.x, vertex2.z, vertex2.y)
                )
                lines.push(
                    new Vector3(vertex2.x, vertex2.z, vertex2.y),
                    new Vector3(vertex3.x, vertex3.z, vertex3.y)
                )
                lines.push(
                    new Vector3(vertex3.x, vertex3.z, vertex3.y),
                    new Vector3(vertex0.x, vertex0.z, vertex0.y)
                )

                lines.push(
                    new Vector3(vertex0.x, vertex0.z, vertex0.y),
                    new Vector3(
                        (vertex0.x * 4 + vertex1.x + vertex2.x + vertex3.x)/7,
                        (vertex0.z * 4 + vertex1.z + vertex2.z + vertex3.z)/7,
                        (vertex0.y * 4 + vertex1.y + vertex2.y + vertex3.y)/7,
                    ),
                )
            }

        }

        return [geoms, lines]
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
            let yIn = verticesIn[i + 1]
            let zIn = verticesIn[i + 2]

            let x = xIn + 0.5
            const y = yIn
            let z = zIn + 0.5

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

                rx2 += localUp[0] * y
                ry2 += localUp[1] * y
                rz2 += localUp[2] * y

                geom.addVertices(rx2, ry2, rz2)
            }

            {
                const nx = x + normalsIn[i    ]
                const ny = y + normalsIn[i + 1]
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

                rnx += localUp[0] * ny
                rny += localUp[1] * ny
                rnz += localUp[2] * ny

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
