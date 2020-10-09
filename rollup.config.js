import { terser } from "rollup-plugin-terser";

export default {
    input: "src/index.js",
    output: [
        // { file: "lib.js", format: "cjs" },
        // { file: "lib.min.js", format: "cjs", plugins: [terser()] },
        // { file: "lib.esm.js", format: "esm", plugins: [terser()] },
        { 
            file: "dist/lib.esm.js", 
            format: "esm", 
            plugins: [terser()],
            sourcemap: true
        },
    ],
};