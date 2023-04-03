import env, { SCALE } from "./env"
import { BufferGeometry, Float32BufferAttribute } from "three"

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
    //console.log("AREAS", faces.map(getArea))
    faces.forEach(
        face => {
            const center = calculateCenter(world, face)
            face.center = center
            face.biome = world.getBiome(center[0], center[2])
        }
    )
    console.log("FACE BIOMES", faces.map(f => f.biome))
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


    addNormal(x0, z0)
    {
        const e = 0.1

        const x1 = x0 + e
        const z1 = z0

        const x2 = x0
        const z2 = z0 + e

        const y0 = this.world.calculateHeight(x0,z0)
        const y1 = this.world.calculateHeight(x1,z1)
        const y2 = this.world.calculateHeight(x2,z2)

        const ax = x1 - x0
        const ay = y1 - y0
        const az = z1 - z0
        const bx = x2 - x0
        const by = y2 - y0
        const bz = z2 - z0


        const nx = ay * bz - az * by
        const ny = az * bx - ax * bz
        const nz = ax * by - ay * bx

        const f = -1 / Math.sqrt(nx * nx + ny * ny + nz * nz);

        this.normals.push(
            nx * f,
            ny * f,
            nz * f
        )

    }

    createThreeGeometry()
    {
        const geometry = new BufferGeometry()
        geometry.setIndex(this.indices)
        geometry.setAttribute("position", new Float32BufferAttribute(this.vertices, 3))
        geometry.setAttribute("normal", new Float32BufferAttribute(this.normals, 3))
        return geometry
    }
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


    createGeometries()
    {
        const patchX = 0
        const patchY = 0

        const { world } = this

        const geoms = TerrainTypes.map( tt => new GeomPerMat(world,tt))
        const faces = this.faces
        for (let i = 0; i < faces.length; i++)
        {
            const face = faces[i]

            const group = geoms[face.biome]
            const tri = group.triFn()

            const first = face.halfEdge
            let curr = first

            let cx = 0
            let cz = 0
            do
            {
                const next = curr.next

                const x0 = 0 | patchX + curr.vertex.x
                const z0 = 0 | patchY + curr.vertex.y
                const x1 = 0 | patchX + next.vertex.x
                const z1 = 0 | patchY + next.vertex.y

                const mx = (x0 + x1) / 2
                const mz = (z0 + z1) / 2

                const y0 = world.calculateHeight(x0, z0)
                const my = world.calculateHeight(mx, mz)


                group.addVertices(x0, y0, z0)
                group.addNormal(x0,z0)

                group.addVertices(mx, my, mz)
                group.addNormal(mx,mz)

                cx += mx
                cz += mz

                curr = next
            } while (curr !== first)

            cx >>= 2
            cz >>= 2

            const cy = world.calculateHeight(cx, cz)
            group.addVertices(
                cx, cy, cz
            )
            group.addNormal(cx, cz)

            // We turn each quad into 8 tris in ccw order
            // 0   1     2
            //  +---+---+
            //  |  /|\  |
            //  | / | \ |
            //  |/  |8 \|
            // 7+---+---+3
            //  |\  |  /|
            //  | \ | / |
            //  |  \|/  |
            //  +---+---+
            // 6    5    4

            tri(0, 7, 1)
            tri(7, 8, 1)

            tri(1, 3, 2)
            tri(3, 1, 8)

            tri(5, 3, 8)
            tri(3, 5, 4)

            tri(5, 7, 6)
            tri(7, 5, 8)
        }

        //console.log("position",vertices)
        //console.log("NORMALS", normals)

        return geoms
    }

}
