// Validates every fixture under docs/schemas/fixtures/{valid,invalid}/ against the
// appropriate message schema, derived from the fixture filename prefix.
//
// Naming convention:
//   raw_logs.<anything>.json            -> messages/raw_logs.message.schema.json
//   processed_events.<anything>.json    -> messages/processed_events.message.schema.json
//   graph_snapshots.<anything>.json     -> messages/graph_snapshots.message.schema.json
//   detections.<anything>.json          -> messages/detections.message.schema.json
//   analyst_briefs.<anything>.json      -> messages/analyst_briefs.message.schema.json
//   dlq.<anything>.json                 -> messages/dlq.message.schema.json
//
// Fixtures under valid/   MUST pass validation.
// Fixtures under invalid/ MUST fail validation.

import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SCHEMA_DIR = join(ROOT, "docs", "schemas");
const FIXTURE_DIR = join(SCHEMA_DIR, "fixtures");

const TOPIC_TO_SCHEMA = {
  raw_logs:          "messages/raw_logs.message.schema.json",
  processed_events:  "messages/processed_events.message.schema.json",
  graph_snapshots:   "messages/graph_snapshots.message.schema.json",
  detections:        "messages/detections.message.schema.json",
  analyst_briefs:    "messages/analyst_briefs.message.schema.json",
  dlq:               "messages/dlq.message.schema.json",
};

const SCHEMA_FILES = [
  "envelope.schema.json",
  "raw_log.payload.schema.json",
  "processed_event.payload.schema.json",
  "graph_snapshot.payload.schema.json",
  "detection.payload.schema.json",
  "analyst_brief.payload.schema.json",
  "dlq.payload.schema.json",
  "messages/raw_logs.message.schema.json",
  "messages/processed_events.message.schema.json",
  "messages/graph_snapshots.message.schema.json",
  "messages/detections.message.schema.json",
  "messages/analyst_briefs.message.schema.json",
  "messages/dlq.message.schema.json",
];

function loadAllSchemas(ajv) {
  for (const rel of SCHEMA_FILES) {
    ajv.addSchema(JSON.parse(readFileSync(join(SCHEMA_DIR, rel), "utf-8")));
  }
}

function schemaIdForFixture(filename) {
  const topicKey = basename(filename, ".json").split(".")[0];
  const rel = TOPIC_TO_SCHEMA[topicKey];
  if (!rel) {
    throw new Error(`Unknown topic prefix '${topicKey}' for fixture ${filename}`);
  }
  return `https://sentinelmesh.io/schemas/${rel}`;
}

function stripInternalKeys(obj) {
  if (Array.isArray(obj)) return obj.map(stripInternalKeys);
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!k.startsWith("_")) out[k] = stripInternalKeys(v);
  }
  return out;
}

function listFixtures(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => join(dir, f));
}

function checkOne(ajv, fixturePath, shouldPass) {
  const raw = JSON.parse(readFileSync(fixturePath, "utf-8"));
  const data = stripInternalKeys(raw);
  const schemaId = schemaIdForFixture(fixturePath);
  const validate = ajv.getSchema(schemaId);
  if (!validate) {
    return { ok: false, msg: `schema not registered: ${schemaId}` };
  }
  const accepted = validate(data);
  if (accepted === shouldPass) {
    return { ok: true, msg: null };
  }
  const errSummary = accepted
    ? "validator accepted a fixture that should have been rejected"
    : ajv.errorsText(validate.errors, { separator: "; " });
  return { ok: false, msg: errSummary };
}

function runGroup(ajv, dir, shouldPass) {
  let pass = 0;
  let fail = 0;
  for (const fixturePath of listFixtures(join(FIXTURE_DIR, dir))) {
    const { ok, msg } = checkOne(ajv, fixturePath, shouldPass);
    const rel = fixturePath.replace(`${ROOT}/`, "");
    if (ok) {
      console.log(`PASS  ${rel}  (expected ${shouldPass ? "valid" : "invalid"})`);
      pass++;
    } else {
      console.log(`FAIL  ${rel}  -> ${msg}`);
      fail++;
    }
  }
  return { pass, fail };
}

function main() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const addFormatsFn = addFormats.default ?? addFormats;
  addFormatsFn(ajv);
  loadAllSchemas(ajv);

  const valid = runGroup(ajv, "valid", true);
  const invalid = runGroup(ajv, "invalid", false);
  const pass = valid.pass + invalid.pass;
  const fail = valid.fail + invalid.fail;

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

main();
