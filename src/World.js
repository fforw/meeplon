import Prando from "prando"
import SimplexNoise from "simplex-noise"



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

    constructor(seed)
    {
        this.seed = seed;
        this.rnd = new Prando(seed);
        this.noise = new SimplexNoise();

    }
}
