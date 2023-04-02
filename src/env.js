import World from "./World"


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
