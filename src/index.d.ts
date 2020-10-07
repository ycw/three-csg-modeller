import * as THREE from "three"
import Model from "./Model"

declare export default class Modeller {

    constructor(THREE: THREE);

    /**
     * Construct a model from input mesh. This mesh must use `BufferGeometry` which
     * must contains `attributes.position` and optionally includes attributes of
     * `normal`, `uv` and `color`.
     * @param mesh - The mesh to model.
     */
    model(mesh: THREE.Mesh): Model;

}