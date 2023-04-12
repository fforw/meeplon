import domready from "domready"
import "./style.css"
import World, { MAX_LATITUDE } from "./proc/World"
import { TerrainTypes } from "./proc/terrain"
import Color from "./util/Color"
import perfNow from "performance-now"

const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
const DEG2RAD_FACTOR = TAU / 360;

const config = {
    width: 0,
    height: 0
};

/**
 * @type CanvasRenderingContext2D
 */
let ctx;
let canvas;

const pink = Color.from("#f0f")

const range = 10000


domready(
    () => {

        canvas = document.createElement("canvas");
        document.getElementById("root").appendChild(canvas)
        ctx = canvas.getContext("2d");

        const width = (window.innerWidth * 0.9) | 0;
        const height = width >> 1

        config.width = width;
        config.height = height;

        canvas.width = width;
        canvas.height = height;

        const seed = -1174255477
        const world = new World(seed)

        const paint = () => {

            const start = perfNow()

            ctx.fillStyle = "#000";
            ctx.fillRect(0,0, width, height);

            let imageData = ctx.getImageData(0,0,width, height)
            const { data } = imageData
            let off = 0

            const cx = width >> 1
            const cy = height >> 1

            const h = MAX_LATITUDE * 2
            const f = h / height
            for (let y = 0; y < height; y++)
            {
                for (let x = 0; x < width; x++)
                {
                    const x0 = x - cx
                    const y0 = y - cy

                   const biome = world.getBiome(x0 * f, y0 * f, Math.max(-10, world.calculateHeight(x0 * f, y0 * f)));

                   const color = biome !== undefined ?  Color.from(TerrainTypes[biome].material.color) : pink
                    data[off ] = color.r
                    data[off + 1 ] = color.g
                    data[off + 2 ] = color.b
                    off += 4;
                }
            }

            ctx.putImageData(imageData,0 ,0)

            const end = perfNow()

            console.log("Time:" + (Math.round(end-start/100)/1000) + "s")

        }

        paint()

        //canvas.addEventListener("click", paint, true)
    }
);
