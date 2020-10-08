# About

Solid mesh modeling for three.js.

## Featrues

- Manipulate `BufferGeometry` directly.
- Support vertex color and mutlimaterial.
- Dump clean mesh.

## Examples

- [Gallery Frame](https://ycw.github.io/three-csg-modeller/examples/gallery-frame)
- [Cross Pipe](https://ycw.github.io/three-csg-modeller/examples/cross-pipe)

## Installation

Via npm ( `npm i ycw/three-csg-modeller#v0.1.0` )

```js
import Modeller from "three-csg-modeller"
```

Via cdn

```js
import Modeller from "https://cdn.jsdelivr.net/gh/ycw/three-csg-modeller@0.1.0/src/index.js"
```

## Usage

```js
// Construct a modeller.
const modeller = new Modeller(THREE);

// Create a model.
const sphere = modeller.model(new THREE.Mesh(
    new THREE.SphereBufferGeometry(1),
    new THREE.MeshBasicMaterial({ color: "red" })
));

// Create another model.
const box = modeller.model(new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 2),
    new THREE.MeshBasicMaterial({ color: "blue" })
));

// Subtract a sphere model from a box model.
const hollow = sphere.subtract(box);

// Build a mesh from a model.
const mesh = hollow.build();
```

## API

### `Modeller`

`.model(mesh)`
- Construct a model from `mesh`, return a `Model` instance.
- Input `mesh` must hold a `BufferGeometry` instead of `Geometry`. That 
  `BufferGeometry` must contain attribute `position` and may optionally
  include attributes `normal`, `uv` and `color`. 
- Both indexed and non-indexed buffer geometry are supported.
- Multi-material is supported.

### `Model`

`modelA.union(modelB)`
- Returns a new model holding result of modelA `|` modelB.

`modelA.subtract(modelB)`
- Returns a new model holding result of modelA `-` modelB.

`modelA.intersect(modelB)`
- Returns a new model holding result of modelA `&` modelB.

`model.applyMatrix4(matrix)` 
- Returns a new model holding the transformed one. 
- `model` remains unchanged.

`model.build()`
- Build a `Mesh` from model. The mesh holds `BufferGeoemtry`, which attributes
  have been sorted by materials; unused materials are plucked; orphan group 
  in `geometry.groups` is eliminated. Currently, the geometry is always 
  "non-indexed".

## Credits

- [evanw/csg.js](https://evanw.github.io/csg.js/)
- [mrdoob/three.js](https://github.com/mrdoob/three.js)

## License

[MIT](LICENSE)