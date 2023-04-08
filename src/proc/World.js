import Prando from "prando"
import SimplexNoise from "simplex-noise"
import { Terrain, TerrainTypes } from "./terrain"
import env, { TAU } from "../env"
import shuffle from "../util/shuffle"

import RTree from "rtree"

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
    .map((t,i) => t.name !== "SEA" && t.name !== "ROCK" ? i : -1 )
    .filter(n => n >= 0)


function createBiomes(prando)
{
    const biomes = new Array(256)
    for (let i = 0; i < 256; i++)
    {
        biomes[i] = Biomes[0 | prando.next(0, Biomes.length)]
    }
    return biomes
}

function getRandomValues(prando, count)
{
    const out = []
    for (let i = 0; i < count; i++)
    {
        out.push(prando.next())
    }
    return out;
}

export const MAX_HEIGHT = 120

export const MAX_LATITUDE = 10800 // 2 * 10 hex patches in cartesian coordinates (not hex q/r)
//export const MAX_LONGITUDE = MAX_LATITUDE * 2



function norm(rnd, array, slices = 4)
{
    let sum = 0
    for (let i = 0; i < array.length; i += 2)
    {
        const weight = array[i + 1]
        sum += weight
    }

    const factor = 1/(sum * slices);

    const out = []
    for (let i = 0; i < array.length; i += 2)
    {
        const terrain = array[i]
        let sliceWeight = array[i + 1] * factor
        for (let j = 0; j < slices; j++)
        {
            out.push(
                [
                    terrain,
                    sliceWeight
                ]
            )
        }
    }

    shuffle(rnd, out)

    sum = 0
    for (let i = 0; i < out.length; i++)
    {
        const e = out[i]

        const weight = e[1]
        sum += weight
        e[1] = sum
    }
    
    return out
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

    /**
     * RTree for faces
     *
     * @type {RTree}
     */
    rTree = null

    nh = []
    bo = []

    biomeLookup = []
    biomeMask = 0

    TROPIC = []
    MODERATE = []

    constructor(seed)
    {
        console.log("WORLD: seed = ", seed)
        
        this.seed = seed;
        const prando = new Prando(seed)
        this.rnd = prando;

        // noise offsets x/y for 3 octaves
        this.nh = getRandomValues(prando, 6)
        this.bo = getRandomValues(prando, 9)

        this.biomeMask = prando.nextInt()
        this.biomeLookup = createBiomes(prando)
        this.noise = new SimplexNoise(() => prando.next());

        this.rTree = new RTree()

        this.TROPIC = norm(
            prando,
            [Terrain.RAINFOREST, 3, Terrain.RAINFOREST_2,3, Terrain.TALL_GRASS,2, Terrain.GRASS,1, Terrain.MUD,1, Terrain.SAND, 1]
        )
        this.MODERATE = norm(
            prando,
            [Terrain.DARK_WOODS,4, Terrain.DIRT,1, Terrain.WOODS,4, Terrain.TALL_GRASS,4, Terrain.MUD,1,Terrain.SAND, 1, Terrain.GRASS, 4]
        )

        console.log("TROPIC", this.TROPIC)
        console.log("MODERATE", this.MODERATE)
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

        const ns0 = 0.0007
        const ns1 = ns0 * 0.11
        const ns2 = ns0 * -0.19

        // three octaves of noise
        const h = (noise.noise3D(ox0 + x * ns0, oy0 + z * ns0, 0) * 0.6 +
                   noise.noise3D(ox1 + x * ns1, oy1 + z * ns1, offset) * 0.25 +
                   noise.noise3D(ox2 + x * ns2, oy2 + z * ns2, offset) * 0.15) * MAX_HEIGHT
        return Math.min(MAX_HEIGHT,h + 12)
    }

    getBiome(x,y, z)
    {
    
        const tempNs = 0.00007
        const moistNs = 0.00005
        const ns2 = 0.0013

        const [ tempNx, tempNy, moistNx, moistNy, flavorNx, flavorNy, tempNz, moistNz, flavorNz ] = this.bo

        const tempMalus = Math.min(1,1 - Math.cos(y/MAX_LATITUDE * TAU/4) * 4) + z * 0.03
        const moistureBonus = Math.pow(Math.cos(y/MAX_LATITUDE * TAU/4),2) * 0.6

        const temperature = Math.max(-1, this.noise.noise3D(tempNx + x * tempNs,tempNy + y * tempNs, tempNz) * 0.8 - tempMalus)
        const moisture = Math.min(1,this.noise.noise3D(moistNx + x * moistNs,moistNy + y * moistNs, moistNz) + moistureBonus)
        const flavor = (this.noise.noise3D(flavorNx + x * ns2,flavorNy + y * ns2, flavorNz) * 2 + this.noise.noise3D(flavorNy + y * ns2, flavorNx + x * ns2, flavorNx) * 3)/5

        const isPolar = temperature < -0.25
        if (z < 0)
        {
            if (z < -10)
            {
                return isPolar ? Terrain.ICE : Terrain.DEEP_SEA
            }
            return isPolar ? Terrain.ICE : Terrain.SEA
        }
        else if (z < 12 && !isPolar)
        {
            return Terrain.SAND
        }

        if (isPolar)
        {
            return Terrain.SNOW
        }

        if (moisture < -0.3)
        {
            if (temperature < 0.8)
            {
                return Terrain.STEPPE
            }
            else
            {
                return Terrain.SAND
            }
        }

        let area
        if (temperature > 0.7 && moisture > 0.9)
        {
            area = this.TROPIC
        }
        else
        {
            area = this.MODERATE
        }

        let value = 1 + Math.max(-1.5,
            Math.min(1.5,
                flavor + moisture * 0.5
            )
        ) / 1.5

        const last = area.length - 1
        for (let i = 0; i < last; i++)
        {
            const [terrain, limit] = area[i]

            if (value < limit)
            {
                return terrain
            }
            value -= limit
        }
        return area[last][0]
    }
}
