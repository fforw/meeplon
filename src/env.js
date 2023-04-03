import World from "./World"

export const SCALE = 10
export const TAU = 2 * Math.PI

export class Env
{
    /**
     * The world
     * @type {World}
     */
    world = null

    init(world)
    {
        this.world = world
    }
}

export default new Env()
