import CSG from "../lib/csg.js"

export default class Model {

    constructor(THREE) {
        this._THREE = THREE;
        this._csg = null;
    }

    union(model) {
        return csgToModel(this._THREE, this._csg.union(model._csg));
    }

    subtract(model) {
        return csgToModel(this._THREE, this._csg.subtract(model._csg));
    }

    intersect(model) {
        return csgToModel(this._THREE, this._csg.intersect(model._csg));
    }

    applyMatrix4(matrix) {
        const mesh = this.build();
        mesh.geometry.applyMatrix4(matrix);
        return Model._fromMesh(this._THREE, mesh);
    }

    build() {
        return csgToMesh(this._THREE, this._csg);
    }

    static _fromMesh(THREE, mesh) {
        return meshToModel(THREE, mesh);
    }

}



// -
// Construct a `Model` from CSG instance.
//
function csgToModel(THREE, csg) {
    const m = new Model(THREE);
    m._csg = csg;
    return m;
}



// -
// Construct a `Model` from `THREE.Mesh`.
// 
function meshToModel(THREE, mesh) {
    const m = new Model(THREE);
    m._csg = CSG.fromPolygons(meshToPolygons(THREE, mesh));
    return m;
}



// -
// Construct `CSG.Polygon`s from a `THREE.Mesh`.
//
function meshToPolygons(THREE, mesh) {

    // Compute transformation matrix. The matrix is applied to geometry
    // during "populate position attribute" step. This will save one loop.
    const clone = mesh.clone();
    clone.updateMatrix();
    const { matrix } = clone;
    const shouldApplyMatrix = !matrix.equals(new THREE.Matrix4());

    // Array of `CSG.Polygon`.
    const polygons = [];

    const positions = mesh.geometry.attributes.position.array;
    const { normal, uv, color } = mesh.geometry.attributes;
    const normals = normal && normal.array;
    const uvs = uv && uv.array;
    const colors = color && color.array;
    const indices = mesh.geometry.index && mesh.geometry.index.array;
    const groups = mesh.geometry.groups;
    const vertexCount = indices ? indices.length : positions.length / 3;

    // Loop through vertices to create `CSG.Polygon` for each 3-vertices.
    // - Each `CSG.Polygon` contains `CSG.Vertex[]` and a `THREE.Material`.
    // - A `CSG.Vertex` must contain `.pos` (CSG.Vector) and optionally include 
    //   `normal` (CSG.Vector), `uv` (THREE.Vector2) and `color` (CSG.Vector). 

    for (let i = 0; i < vertexCount; i += 3) {
        const vertices = [];
        for (let j = 0; j < 3; ++j) {
            const n = indices ? indices[i + j] : i + j;
            vertices.push(new CSG.Vertex(
                shouldApplyMatrix
                    ? new THREE.Vector3().fromArray(positions, 3 * n).applyMatrix4(matrix)
                    : positions.subarray(3 * n, 3 * n + 3),
                normals && normals.subarray(3 * n, 3 * n + 3),
                uvs && new THREE.Vector2().fromArray(uvs, 2 * n),
                colors && colors.subarray(3 * n, 3 * n + 3)
            ));
        }

        // Probing `Material` from `geom.groups` only makes sense if `mesh.material` is an array.
        if (Array.isArray(mesh.material)) {
            let material;
            for (const { start, count, materialIndex } of groups) {
                if (i >= start && i < start + count) {
                    material = mesh.material[materialIndex];
                    break;
                }
            }
            polygons.push(new CSG.Polygon(vertices, material));
        }
        else {
            // `mesh.material` is a single `Material`, it's safe to ignore `groups`.
            polygons.push(new CSG.Polygon(vertices, mesh.material));
        }
    }

    return polygons;
}



// -
// Construct a `THREE.Mesh` from a CSG instance. The mesh will contain an indexed
// BufferGeometry which buffer attributes are sorted by `Material`.
// 
function csgToMesh(THREE, csg) {
    
    // Group vertices by `Material` and find vertex count in same loop. 
    const polygons = csg.toPolygons();
    const matMap = new Map(); // Map<Material{}, CSG.Vertex[][]>
    let vertexCount = 0;
    for (const { vertices, shared: material } of polygons) {
        if (matMap.has(material)) {
            matMap.get(material).push(vertices);
        }
        else {
            matMap.set(material, [vertices]);
        }
        vertexCount += vertices.length;
    }

    // Alloc TypedArrays to hold buffer attributes data.
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const colors = new Float32Array(vertexCount * 3);

    // Populate `.attributes`, `.index`, `.groups` and `mesh.material` in same loop.
    const geom = new THREE.BufferGeometry();
    const materials = [];
    const mesh = new THREE.Mesh(geom, materials);

    let start = 0;
    let count = 0; // indices count of the current render group.
    let materialIndex = 0;

    let positionsIdx = 0;
    let normalsIdx = 0;
    let uvsIdx = 0;
    let colorsIdx = 0;

    let someHasNormal; // truthy/falsy;
    let someHasUv;     // ditto
    let someHasColor;  // ditto

    const indices = []; // holding actual data of element index buffer
    let index = 0; // index number already used

    for (const [material, vertsArray] of matMap.entries()) {
        count = 0;
        for (const verts of vertsArray) {

            // Populate indices
            for (let i = 1, I = verts.length - 1; i < I; ++i) {
                indices.push(index, index + i, index + i + 1);
            }
            index += verts.length;
            count += (verts.length - 2) * 3;

            // Populate buffer attributes
            for (const { pos, normal, uv, color } of verts) {
                // `position`
                positions[positionsIdx++] = pos.x;
                positions[positionsIdx++] = pos.y;
                positions[positionsIdx++] = pos.z;
                
                // `normal`
                someHasNormal || (someHasNormal = normal);
                if (normal) {
                    normals[normalsIdx++] = normal.x;
                    normals[normalsIdx++] = normal.y;
                    normals[normalsIdx++] = normal.z;
                }
                else {
                    normalsIdx += 3;
                }

                // `uv`
                someHasUv || (someHasUv = uv);
                if (uv) {
                    uvs[uvsIdx++] = uv.x;
                    uvs[uvsIdx++] = uv.y;
                }
                else {
                    uvsIdx += 2;
                }

                // `color`
                someHasColor || (someHasColor = color);
                if (color) {
                    colors[colorsIdx++] = color.x;
                    colors[colorsIdx++] = color.y;
                    colors[colorsIdx++] = color.z;
                }
                else {
                    colorsIdx += 3;
                }
            }
        }

        materials.push(material);
        geom.addGroup(start, count, materialIndex);
        start += count;
        materialIndex += 1;
    }

    // Set element index buffer.

    if (index <= 65535) {
        geom.index = new THREE.Uint16BufferAttribute(indices, 1);
    }
    else {
        console.warn("index > 65535");
        geom.index = new THREE.Uint32BufferAttribute(indices, 1);
    }

    // Set buffer attributes.

    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    if (someHasNormal) {
        geom.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    }

    if (someHasUv) {
        geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    }

    if (someHasColor) {
        geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    }

    return mesh;
}
