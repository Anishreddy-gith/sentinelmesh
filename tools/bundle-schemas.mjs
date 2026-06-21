// Bundles all SentinelMesh schemas into a single self-contained JSON Schema document
// for the code generators. We fully DEREFERENCE rather than just bundle: every
// $ref is replaced with the inlined target, so the output has zero $ref entries.
//
// Why dereference (not bundle):
//   * quicktype 23.x (npm-installed in CI) chokes on $defs-based $refs in some
//     transitive-dep configurations: "Error: Key $defs not in schema object".
//     Fully dereferenced output sidesteps every $ref-resolution code path in
//     both quicktype and datamodel-code-generator.
//   * No circular refs in our schemas (verified), so dereference is safe.
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
  const dereferenced = await $RefParser.dereference(ENTRY, {
    dereference: { circular: false },
  });
  const json = JSON.stringify(dereferenced, null, 2) + "\n";
  if (outPath) {
    writeFileSync(outPath, json, "utf-8");
    console.error(`bundled -> ${outPath}`);
  } else {
    process.stdout.write(json);
  }
}

main().catch((err) => {
  console.error("bundle-schemas failed:", err);
  process.exit(1);
});
