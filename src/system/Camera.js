import { PerspectiveCamera } from "three"
import $entity from "@fforw/entity/entity.macro"
import env, { TAU } from "../env"
import getDistance from "../util/getDistance"
import { easeInCubic, easeInOutCubic, easeOutCubic } from "../util/easing"
const sys = require("../entity/config")

const cameraTargetMask = sys.mask(["Appearance", "CameraTarget"])

function limit(v,min,max)
{
    return Math.min(max, Math.max(min, v))
}

export default class Camera
{
    /**
     * Three.js camera
     *
     * @type {PerspectiveCamera}
     */
    camera = null
    targetEntity = -1
    currentDistance = 0

    yaw = 0
    pitch = TAU/8
    distance = 70

    constructor(aspect)
    {
        this.camera = new PerspectiveCamera( 50, aspect, 1, 30000 );

        sys.onEnter(cameraTargetMask, entity => {
            return this.targetEntity = entity
        })
    }

    update()
    {
        const { targetEntity, camera, distance } = this

        $entity( targetEntity => {

            const targetX = targetEntity.x
            const targetY = targetEntity.y
            const targetZ = targetEntity.z

            const { x, y, z } = camera.position

            this.currentDistance = getDistance(targetX, targetY, targetZ, x, y, z)

            const minPitch = -TAU * 0.01
            const maxPitch =  TAU * 0.4

            this.pitch = limit(this.pitch, minPitch, maxPitch)

            //console.log("YAW", this.yaw, "PITCH", this.pitch)

            const d = distance * (0.45 + 0.55 * easeOutCubic(Math.pow(((this.pitch - minPitch) / (maxPitch - minPitch)),2)))

            const cameraX = targetX + Math.cos(this.yaw) * d
            const cameraZ = targetZ + Math.sin(this.yaw) * d

            //const camBase = env.world.calculateHeight(targetX + cameraX, targetZ + cameraZ);

            const cameraY = targetY + Math.sin(this.pitch) * d

            camera.position.set(cameraX, cameraY, cameraZ)
            camera.lookAt( targetX, targetY + 8, targetZ );
        })
    }

    updateAspectRatio(aspect)
    {
        const { camera } = this

        camera.aspect = aspect;
        camera.updateProjectionMatrix();

    }
}
