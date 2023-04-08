import { BufferGeometry, LineBasicMaterial, LineSegments, Vector3 } from "three"


/**
 * Helper class to add one or more layers of xray lines to the scene.
 */
export default class DebugLines
{
    /**
     * Debug line layers.
     * @type {Array.<{color,vertices}>}
     */
    layers = []


    /**
     * Adds a line. Takes either a pair of Vector3 or 4 numbers. Last
     * argument is an optional color. If there is no layer with that color, a new
     * layer will be created.
     *
     * @param {number|Vector3} x0       first vector or x-coordinate
     * @param {number|Vector3} y0       second vector or y-coordinate
     * @param {number|string} [z0]      color or z-coordinate
     * @param {number} [x1]             second x-coordinate
     * @param {number} [y1]             second y-coordinate
     * @param {number} [z1]             second z-coordinate
     * @param {String} [color]          optional color
     */
    line(x0,y0,z0,x1,y1, z1, color = "#000")
    {
        let v0,v1,col
        if (typeof x0 === "number" && typeof y0 === "number")
        {
            v0 = new Vector3(x0,y0,z0)
            v1 = new Vector3(x1,y1,z1)
            col = color
        }
        else
        {
            v0 = x0
            v1 = y0
            col = z0 || "#000"
        }

        let layer = this.layers.find(l => l.color === col);
        if (! layer)
        {
            layer = {
                color: col,
                points: []
            }

            this.layers.push(layer)
        }

        layer.points.push(v0,v1)
    }


    /**
     * Adds all line layers to the scene
     *
     * @param scene
     */
    addToScene(scene)
    {
        const { layers } = this;

        if (layers.length)
        {
            for (let i = 0; i < layers.length; i++)
            {
                const { color, points } = layers[i]
                const material = new LineBasicMaterial({
                    color,
                    depthTest: false
                });

                const geometry = new BufferGeometry().setFromPoints( points );
                const line = new LineSegments( geometry, material );
                scene.add( line );
            }
        }
    }
}
