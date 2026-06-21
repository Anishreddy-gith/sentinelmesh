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
import { resolve, dirname, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const ENTRY = resolve(ROOT, "docs/schemas/_all.schema.json");

function safeOutputPath(rawPath) {
  // Reject anything that would escape the workspace root. The Makefile uses
  // a relative path ('.bundled.schema.json' from tools/) and that's the only
  // supported caller; defend against accidental misuse.
  const absolute = isAbsolute(rawPath) ? rawPath : resolve(rawPath);
  const rel = relative(ROOT, absolute);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`Refusing to write outside the workspace root: ${absolute}`);
  }
  return absolute;
}

const outPathArg = process.argv[2];
const dereferenced = await $RefParser.dereference(ENTRY, {
  dereference: { circular: false },
});
const json = JSON.stringify(dereferenced, null, 2) + "\n";

if (outPathArg) {
  const outPath = safeOutputPath(outPathArg);
  writeFileSync(outPath, json, "utf-8");
  console.error(`bundled -> ${outPath}`);
} else {
  process.stdout.write(json);
}
