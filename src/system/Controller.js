import entitySystem from "../entity/config"

import $entity from "../util/entity.macro"
import env from "../env"
import { buttonPressed } from "../util/util"


const controllerMask = entitySystem.mask(["Appearance", "Controlled"])
export default class Controller
{
    controlledEntity = -1
    gamepad = null
    camera = null

    constructor(camera)
    {
        this.camera = camera

        entitySystem.onEnter(controllerMask, entity => {
            console.log("Set controlled to", entity)
            return this.controlledEntity = entity
        })
    }

    update()
    {
        const { controlledEntity, gamepad, camera } = this

        if (gamepad && controlledEntity >= 0 && camera)
        {

            $entity(controlledEntity => {

                const sensitivity = buttonPressed(gamepad.buttons[7]) ? 1.5 : 0.5
                const xAxis = gamepad.axes[0].toFixed(4)
                const yAxis = gamepad.axes[1].toFixed(4)

                const dx = Math.cos(camera.yaw)
                const dy = Math.sin(camera.yaw)

                controlledEntity.x += dx * yAxis * sensitivity + dy * xAxis * sensitivity
                controlledEntity.y = env.world.calculateHeight(controlledEntity.x, controlledEntity.z)
                controlledEntity.z += dy * yAxis * sensitivity - dx * xAxis * sensitivity
            })

            {
                const sensitivityX = 0.036
                const sensitivityY = 0.03

                const xAxis = gamepad.axes[3].toFixed(4)
                const yAxis = gamepad.axes[4].toFixed(4)

                camera.pitch += yAxis * sensitivityY
                camera.yaw += xAxis * sensitivityX
            }
        }
    }
}
