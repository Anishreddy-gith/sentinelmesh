// Bundles all SentinelMesh schemas into a single self-contained JSON Schema document
// by resolving every external $ref in-place. The bundled output is consumed by both
// quicktype (-> docs/types.ts) and datamodel-code-generator (-> docs/models.py),
// neither of which handles cross-file modular $refs gracefully.
//
// Output is written to the path given as the first CLI argument (default: stdout).

import $RefParser from "@apidevtools/json-schema-ref-parser";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ENTRY = resolve(ROOT, "docs/schemas/_all.schema.json");

async function main() {
  const outPath = process.argv[2];
  const bundled = await $RefParser.bundle(ENTRY, {
    dereference: { circular: "ignore" },
  });
  // ref-parser URL-encodes '$' as %24 inside $ref paths (RFC-correct but neither
  // quicktype nor datamodel-code-generator decode it). Decode all %24 -> $ in $ref
  // string values; leave the rest of the document untouched.
  const rewritten = rewriteRefs(bundled);
  const json = JSON.stringify(rewritten, null, 2) + "\n";
  if (outPath) {
    writeFileSync(outPath, json, "utf-8");
    console.error(`bundled -> ${outPath}`);
  } else {
    process.stdout.write(json);
  }
}

function rewriteRefs(node) {
  if (Array.isArray(node)) return node.map(rewriteRefs);
  if (node && typeof node === "object") {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      if (k === "$ref" && typeof v === "string") {
        out[k] = v.replace(/%24/g, "$");
      } else {
        out[k] = rewriteRefs(v);
      }
    }
    return out;
  }
  return node;
}

main().catch((err) => {
  console.error("bundle-schemas failed:", err);
  process.exit(1);
});
