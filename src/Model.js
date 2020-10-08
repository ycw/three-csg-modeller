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

function csgToModel(THREE, csg) {
    const m = new Model(THREE);
    m._csg = csg;
    return m;
}

function meshToModel(THREE, mesh) {
    const m = new Model(THREE);
    m._csg = CSG.fromPolygons(meshToPolygons(THREE, mesh));
    return m;
}

function meshToPolygons(THREE, mesh) {

    // Compute transformation matrix.
    const clone = mesh.clone();
    clone.updateMatrix();

    // Snapshot material array.
    if (Array.isArray(mesh.material)) {
        clone.material = Array.from(mesh.material);
    }

    const polygons = [];
    const geom = mesh.geometry;
    const positions = geom.attributes.position.array;
    const { normal, uv, color } = geom.attributes;
    const hasNormalAttrib = normal !== undefined;
    const normals = hasNormalAttrib ? normal.array : null;
    const hasUvAttrib = uv !== undefined;
    const uvs = hasUvAttrib ? uv.array : null;
    const hasColorAttrib = color !== undefined;
    const colors = hasColorAttrib ? color.array : null;
    const indexAttrib = geom.index;
    const elemCount = indexAttrib ? indexAttrib.count : positions.length / 3;
    const shouldApplyMatrix = !clone.matrix.equals(new THREE.Matrix4());

    for (let elemIdx = 0, $3i = 0, $3i3 = 0; elemIdx < elemCount; elemIdx += 3) {
        const vertices = [];
        for (let j = 0; j < 3; ++j) {
            const i = (indexAttrib === null) ? elemIdx + j : indexAttrib.array[elemIdx + j];
            $3i = 3 * i;
            $3i3 = $3i + 3;
            const position = shouldApplyMatrix
                ? new THREE.Vector3().fromArray(positions, $3i).applyMatrix4(clone.matrix)
                : positions.subarray($3i, $3i3);
            const normal = hasNormalAttrib
                ? normals.subarray($3i, $3i3)
                : null;
            const uv = hasUvAttrib
                ? new THREE.Vector2().fromArray(uvs, 2 * i)
                : null;
            const color = hasColorAttrib
                ? colors.subarray($3i, $3i3)
                : null;
            vertices.push(new CSG.Vertex(position, normal, uv, color));
        }

        let mI = 0;
        for (const { start, count, materialIndex } of geom.groups) {
            if (elemIdx >= start && elemIdx < start + count) {
                mI = materialIndex;
                break;
            }
        }

        polygons.push(new CSG.Polygon(vertices, { m: clone.material, mI }));
    }

    return polygons;
}

function csgToMesh(THREE, csg) {
    const polygons = csg.toPolygons();

    // Group vertices by `Material`.

    let vertsCount = 0;
    const matMap = new Map();
    for (const { vertices, shared: { m, mI } } of polygons) {
        const mat = Array.isArray(m) ? m[mI] : m;
        matMap.has(mat) || matMap.set(mat, []);
        matMap.get(mat).push(vertices);
        vertsCount += vertices.length;
    }

    // Alloc typedarrays to hold buffer attributes data.

    const positions = new Float32Array(vertsCount * 3);
    const normals = new Float32Array(vertsCount * 3);
    const uvs = new Float32Array(vertsCount * 2);
    const colors = new Float32Array(vertsCount * 3);

    const materials = [];
    const geom = new THREE.BufferGeometry();

    let start = 0;
    let count = 0; // how many indices a render group contains.
    let positionsIdx = 0;
    let normalsIdx = 0;
    let uvsIdx = 0;
    let colorsIdx = 0;
    let materialIndex = 0;

    let hasNormal = false, someHasNormal = false;
    let hasUv = false, someHasUv = false;
    let hasColor = false, someHasColor = false;

    const indices = []; // holding actual data of element index buffer
    let index = 0; // index number already used

    for (const [material, vertsArray] of matMap.entries()) {

        // Indice count. Since `vertesArray[n]` holds triangle fan verts 
        // if it has 4 verts, indice count should += 6 (2 tris).
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
                positions.set([pos.x, pos.y, pos.z], positionsIdx);
                positionsIdx += 3;

                someHasNormal |= (hasNormal = normal !== null);
                normals.set(hasNormal ? [normal.x, normal.y, normal.z] : [0, 0, 0], normalsIdx);
                normalsIdx += 3;

                someHasUv |= (hasUv = uv !== null);
                uvs.set(hasUv ? uv.toArray() : [0, 0], uvsIdx);
                uvsIdx += 2;

                someHasColor |= (hasColor = color !== null);
                colors.set(hasColor ? [color.x, color.y, color.z] : [0, 0, 0], colorsIdx);
                colorsIdx += 3;
            }
        }

        materials.push(material);
        geom.addGroup(start, count, materialIndex);
        start += count;
        materialIndex += 1;
    }

    // Set element index buffer.

    geom.index = (index > 65536)
        ? new THREE.Uint32BufferAttribute(indices, 1)
        : new THREE.Uint16BufferAttribute(indices, 1);

    // Pluck buffer attributes.

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

    return new THREE.Mesh(geom, materials);
}
