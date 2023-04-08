export const SCALE = 10
export const TAU = 2 * Math.PI

let idCounter = 0;

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

    nextId()
    {
        return idCounter++
    }
}

export default new Env()
