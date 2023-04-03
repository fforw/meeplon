// Instantiate a loader
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const loader = new GLTFLoader();

export default function loadModel(url, onProgress = null)
{
    return new Promise(((resolve, reject) => {
        // Load a glTF resource
        loader.load(
            // resource URL
            url,
            // called when the resource is loaded
            resolve,
            // called while loading is progressing
            onProgress,
            // called when loading has errors
            reject
        );
    }))
}
