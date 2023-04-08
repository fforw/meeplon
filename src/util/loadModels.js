// Instantiate a loader
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const loader = new GLTFLoader();

/**
 * Loads the given GLTF file and returns a promise resolving to a map
 * of child objects contained in that scene.
 *
 * @param {String} url              GLTF file URI
 * @param {function} onProgress     optional progress callback
 *
 * @return {Promise<Object>} map of objects
 */
export default function loadModels(url, onProgress = null)
{
    return new Promise(((resolve, reject) => {
        // Load a glTF resource
        loader.load(
            // resource URL
            url,
            // called when the resource is loaded
            gltf => {
                const objects = {}
                gltf.scene.children.forEach( k => {
                    objects[k.name] = k
                })
                resolve(objects)
            } ,
            // called while loading is progressing
            onProgress,
            // called when loading has errors
            reject
        );
    }))
}
