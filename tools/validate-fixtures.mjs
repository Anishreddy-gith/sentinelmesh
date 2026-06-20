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

function loadAllSchemas(ajv) {
  const files = [
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
  for (const rel of files) {
    const p = join(SCHEMA_DIR, rel);
    const schema = JSON.parse(readFileSync(p, "utf-8"));
    ajv.addSchema(schema);
  }
}

function schemaIdForFixture(filename) {
  const base = basename(filename, ".json");
  const topicKey = base.split(".")[0];
  const rel = TOPIC_TO_SCHEMA[topicKey];
  if (!rel) {
    throw new Error(`Unknown topic prefix '${topicKey}' for fixture ${filename}`);
  }
  return `https://sentinelmesh.io/schemas/${rel}`;
}

function stripInternalKeys(obj) {
  if (Array.isArray(obj)) return obj.map(stripInternalKeys);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith("_")) continue;
      out[k] = stripInternalKeys(v);
    }
    return out;
  }
  return obj;
}

function listFixtures(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => join(dir, f));
}

function main() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats.default ? addFormats.default(ajv) : addFormats(ajv);
  loadAllSchemas(ajv);

  let pass = 0;
  let fail = 0;
  const failures = [];

  const expectations = [
    { dir: "valid",   shouldPass: true  },
    { dir: "invalid", shouldPass: false },
  ];

  for (const { dir, shouldPass } of expectations) {
    const fixtures = listFixtures(join(FIXTURE_DIR, dir));
    for (const fixturePath of fixtures) {
      const raw = JSON.parse(readFileSync(fixturePath, "utf-8"));
      const data = stripInternalKeys(raw);
      const schemaId = schemaIdForFixture(fixturePath);
      const validate = ajv.getSchema(schemaId);
      if (!validate) {
        failures.push({ fixturePath, msg: `schema not registered: ${schemaId}` });
        fail++;
        continue;
      }
      const ok = validate(data);
      const rel = fixturePath.replace(ROOT + "/", "");
      if (ok === shouldPass) {
        console.log(`PASS  ${rel}  (expected ${shouldPass ? "valid" : "invalid"})`);
        pass++;
      } else {
        const errSummary = ok
          ? "validator accepted a fixture that should have been rejected"
          : ajv.errorsText(validate.errors, { separator: "; " });
        failures.push({ fixturePath: rel, msg: errSummary });
        console.log(`FAIL  ${rel}  -> ${errSummary}`);
        fail++;
      }
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) {
    process.exit(1);
  }
}

main();
