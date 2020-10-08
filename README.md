# About

Solid mesh modeling for three.js.

## Featrues

- Manipulate `BufferGeometry` directly.
- Support vertex color and mutlimaterial.
- Dump mesh with indexed `BufferGeometry`.

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
const modeller = new Modeller(THREE);
const sphereModel = modeller.model(new THREE.Mesh(
    new THREE.SphereBufferGeometry(1),
    new THREE.MeshBasicMaterial({ color: "red" })
));
const boxModel = modeller.model(new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 2),
    new THREE.MeshBasicMaterial({ color: "blue" })
));
const model = sphereModel.subtract(boxModel);
const mesh = model.build();
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

`.union(modelB)`
- Returns a new model holding result of this model `|` modelB.

`.subtract(modelB)`
- Returns a new model holding result of this model `-` modelB.

`.intersect(modelB)`
- Returns a new model holding result of this model `&` modelB.

`.applyMatrix4(matrix)` 
- Returns a new model holding the transformed one. 
- This model remains unchanged.

`.build()`
- Build a `Mesh` from model. The mesh holds a "indexed" `BufferGeoemtry`, its
  render groups have been grouped by materials; unused materials are plucked.

## Credits

- [evanw/csg.js](https://evanw.github.io/csg.js/)
- [mrdoob/three.js](https://github.com/mrdoob/three.js)

## License

[MIT](LICENSE)