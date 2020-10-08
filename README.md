# About

Solid mesh modeling for three.js.

## Featrues

- Manipulate `BufferGeometry` directly.
- Support vertex color and mutli-material.
- Dump mesh with indexed `BufferGeometry`.

## Examples

- [Cross Pipe](https://ycw.github.io/three-csg-modeller/examples/cross-pipe)
To demo that re-assigning material will influence subsequent models only.
- [Extrude Inwards](https://ycw.github.io/three-csg-modeller/examples/extrude-inwards) 
To show that set-operation methods likes `A.union(B)`, are not commutative in 
terms of vertex data. I use this "feature" to correct faces uvs w/o touching
single bit of `attributes.uv.array`. 
- [Gallery Frame](https://ycw.github.io/three-csg-modeller/examples/gallery-frame) 
A bare multi-material example.
- [Gradient Color](https://ycw.github.io/three-csg-modeller/examples/gradient-color) 
A bare vertex color example.

## Installation

Via npm ( `npm i ycw/three-csg-modeller#v0.1.4` )

```js
import Modeller from "three-csg-modeller"
```

Via cdn

```js
import Modeller from "https://cdn.jsdelivr.net/gh/ycw/three-csg-modeller@0.1.4/src/index.js"
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
- Build a `Mesh` from model. The mesh holds an "indexed" `BufferGeometry`.

## Credits

- [evanw/csg.js](https://evanw.github.io/csg.js/)
- [mrdoob/three.js](https://github.com/mrdoob/three.js)

## License

[MIT](LICENSE)