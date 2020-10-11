# About

Solid mesh modeling for three.js.

## Featrues

- Manipulate `BufferGeometry` directly.
- Support vertex color and mutli-material.
- Dump mesh with indexed `BufferGeometry`.

## Examples

- [Gradient Crown](https://ycw.github.io/three-csg-modeller/examples/gradient-crown) (vertex color)
- [Gallery Frame](https://ycw.github.io/three-csg-modeller/examples/gallery-frame) (mutli-material)
- [Cross Pipe](https://ycw.github.io/three-csg-modeller/examples/cross-pipe) (reassign material)
- [Extrude Inwards](https://ycw.github.io/three-csg-modeller/examples/extrude-inwards) (set-ops)

## Installation

Via npm ( `npm i ycw/three-csg-modeller#v0.1.8` )

```js
import Modeller from "three-csg-modeller"
```

Via cdn

```js
import Modeller from "https://cdn.jsdelivr.net/gh/ycw/three-csg-modeller@0.1.8/dist/lib.esm.js"
```

## Usage

```js
// Demo basic subtraction
const modeller = new Modeller(THREE);
const sphereModel = modeller.model(new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.5),
    new THREE.MeshLambertMaterial({ color: "black" })
));
const boxModel = modeller.model(new THREE.Mesh(
  new THREE.BoxBufferGeometry(0.5, 0.5, 1),
    new THREE.MeshLambertMaterial({ color: "white" })
));
const model = sphereModel.subtract(boxModel);
const mesh = model.build();
```

Live result: [Basic Subtract](https://ycw.github.io/three-csg-modeller/examples/basic-subtract)

## API

### `Modeller`

`.model(mesh)`
- Construct a model from a `THREE.Mesh`, it returns a `Model` instance.
- The param `mesh` must hold a `BufferGeometry` instead of `Geometry`. That 
  `BufferGeometry` must have `attributes.position` provided. Others supported
  attributes are `normal`, `uv` and `color`.

### `Model`

`.union(modelB)`
- Return a new model holding result of this model `|` modelB.

`.subtract(modelB)`
- Return a new model holding result of this model `-` modelB.

`.intersect(modelB)`
- Return a new model holding result of this model `&` modelB.

`.applyMatrix4(matrix)` 
- `matrix` is a `THREE.Matrix4`.
- Return a new transformed model.

`.build()`
- Build a `Mesh` from model. The mesh holds an "indexed" `BufferGeometry`.

## Credits

- [evanw/csg.js](https://evanw.github.io/csg.js/)
- [mrdoob/three.js](https://github.com/mrdoob/three.js)

## License

[MIT](LICENSE)