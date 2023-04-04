import Prando from "prando"
import SimplexNoise from "simplex-noise"
import { TerrainTypes } from "./terrain"
import { resolve } from "./util"
import { TAU } from "./env"



// A single iteration of Bob Jenkins' One-At-A-Time hashing algorithm.
function hash( x ) {
    x += ( x << 10 )
    x ^= ( x >>  6 )
    x += ( x <<  3 )
    x ^= ( x >> 11 )
    x += ( x << 15 )
    return x;
}


export const Biomes = TerrainTypes
    .filter(t => t.name !== "SEA" && t.name !== "ROCK")
    .map((t,i) => i )


function createBiomes(prando)
{
    const biomes = new Array(256)
    for (let i = 0; i < 256; i++)
    {
        biomes[i] = Biomes[0 | prando.next(0, Biomes.length)]
    }
    return biomes
}


export default class World
{
    /**
     * Initial world seed
     * @type {number}
     */
    seed = 0

    /**
     *
     * @type {Prando}
     */
    rnd

    /**
     *
     * @type {SimplexNoise}
     */
    noise

    nh = []
    bo = []

    biomeLookup = []
    biomeMask = 0

    constructor(seed)
    {
        console.log("WORLD: seed = ", seed)
        
        this.seed = seed;
        const prando = new Prando(seed)
        this.rnd = prando;

        // noise offsets x/y for 3 octaves
        this.nh = [
            prando.next(),
            prando.next(),
            prando.next(),
            prando.next(),
            prando.next(),
            prando.next()
        ]

        this.bo = [
            prando.next(),
            prando.next(),
            prando.next(),
            prando.next(),
            prando.next(),
            prando.next(),
            prando.next(),
            prando.next(),
        ]

        this.biomeMask = prando.nextInt()
        this.biomeLookup = createBiomes(prando)
        this.noise = new SimplexNoise(() => prando.next());
    }


    /**
     * Calculates the height/y-coordinate for the given x/z coordinates.
     *
     * @param {number} x
     * @param {number} z
     *
     * @param {number} offset
     * @return {number} height or y-coordinate
     */
    calculateHeight(x, z, offset = 0)
    {
        const { noise, nh } = this

        const [ox0, oy0, ox1, oy1, ox2, oy2 ] = nh

        const ns0 = 0.0001
        const ns1 = ns0 * 1.97
        const ns2 = ns1 * 2.13

        const height = 1000

        // three octaves of noise
        const h = (
            ((
               noise.noise3D(ox0 + x * ns0, oy0 + z * ns0, 0) +
               noise.noise3D(ox1 + x * ns1, oy1 + z * ns1, offset) * 0.5 +
               noise.noise3D(ox2 + x * ns2, oy2 + z * ns2, offset) * 0.25
            ) / 1.75) * height
        )
        return h
    }

    getBiome(x,y)
    {
    
        const ns = 0.000023
        const ns2 = 0.00027

        const [ z0,z1,ox0,oy0,ox1,oy1, z2, z3 ] = this.bo

        const n0 = this.noise.noise3D(ox0 + x * ns,oy0 + y * ns, z0)
        const n1 = this.noise.noise3D(ox1 + x * ns,oy1 + y * ns, z1)
        const n2 = this.noise.noise3D(ox0 + x * ns2,oy1 + y * ns2, z2)
        const n3 = this.noise.noise3D(ox1 + x * ns2,oy0 + y * ns2, z3)



        x = ((x + (n0 + n2) * 128) * 0.008)
        y = ((y + (n1 + n3) * 128) * 0.008)


        return this.biomeLookup[
            (y << 4 + x) & 255
        ]
    }

}
