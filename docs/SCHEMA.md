# SentinelMesh Kafka Message Contract

**Status:** FROZEN at `schema_version = 1.0.0` (initial freeze, Phase 2.0).
**Authoritative artifacts:** this document, [`docs/schemas/*.json`](schemas/), [`docs/types.ts`](types.ts), [`docs/models.py`](models.py).
**Single source of truth:** the JSON Schemas under [`docs/schemas/`](schemas/). `types.ts` and `models.py` are **generated** from them and MUST NOT be hand-edited.

Every Kafka message produced by any SentinelMesh service — on **any** of the five pipeline topics or their dead-letter topics — MUST conform to this contract. Messages that do not validate are not allowed onto the pipeline topics; producers route them to the corresponding `.dlq` topic with a failure reason instead.

---

## 1. Envelope

Every Kafka message value is a JSON object with exactly two top-level keys:

```json
{
  "header": { ... },
  "payload": { ... }
}
```

Additional top-level keys are forbidden (`additionalProperties: false`).

### 1.1 `header` fields (identical on every topic)

| Field | Type | Required | Description |
|---|---|---|---|
| `schema_version` | string (semver) | yes | Version of this contract the message conforms to. **MUST be `"1.0.0"` at this freeze.** Bump rules in §4. |
| `org_id` | string | yes | Tenant identifier. Default `"org-000"` for single-tenant deployments. Lowercase, kebab-case, ≤ 64 chars, `^[a-z0-9][a-z0-9-]{0,63}$`. |
| `event_id` | string (UUID) | yes | Globally unique ID for **this specific message on this specific topic**. UUIDv7 RECOMMENDED (time-sortable); UUIDv4 accepted. Regenerated every time a message is written to a new topic. |
| `produced_at` | string (RFC3339 UTC, ms precision) | yes | Wall-clock instant the producer wrote this message. Format: `YYYY-MM-DDTHH:MM:SS.sssZ` (trailing `Z` mandatory — always UTC, never a local-time offset). Example: `"2026-06-20T08:21:34.123Z"`. |
| `producer` | string | yes | Identity of the producing service in the form `<service-name>/<version>[@<instance>]`. Examples: `"zeek_producer/1.0.0@site-a-zeek-01"`, `"normaliser/1.0.0"`, `"gnn_inference/1.0.0"`. |
| `trace_id` | string (UUID) | yes | End-to-end trace identifier. **Set once at ingestion, copied forward unchanged through all five pipeline stages.** See §3 for the invariant. UUIDv7 RECOMMENDED. |

### 1.2 `payload` field

`payload` is a topic-specific JSON object. Its shape is defined per topic in §2. `payload` MUST NOT be empty (`{}`) and MUST NOT be null.

---

## 2. Per-topic payload shapes

| Topic | Payload schema | Status |
|---|---|---|
| `raw_logs` | [`raw_log.payload.schema.json`](schemas/raw_log.payload.schema.json) | **Frozen at 1.0.0** |
| `processed_events` | [`processed_event.payload.schema.json`](schemas/processed_event.payload.schema.json) | **Frozen at 1.0.0** |
| `graph_snapshots` | [`graph_snapshot.payload.schema.json`](schemas/graph_snapshot.payload.schema.json) | Draft — finalised in Phase 3 |
| `detections` | [`detection.payload.schema.json`](schemas/detection.payload.schema.json) | Draft — finalised in Phase 4 |
| `analyst_briefs` | [`analyst_brief.payload.schema.json`](schemas/analyst_brief.payload.schema.json) | Draft — finalised in Phase 7 |

For each of the five pipeline topics there is a corresponding `<topic>.dlq` topic. DLQ messages use the same envelope; their `payload` is `{ "reason": <string>, "stage": <string>, "raw": <original message as JSON or base64> }` (see [`schemas/dlq.payload.schema.json`](schemas/dlq.payload.schema.json)).

### 2.1 `raw_logs` payload (frozen)

Discriminated union on `source`. Two variants in the initial freeze: `"zeek"` and `"suricata"`.

**Common fields (both variants):**

| Field | Type | Required | Notes |
|---|---|---|---|
| `source` | enum: `"zeek"` \| `"suricata"` | yes | Discriminator. |
| `log_type` | string | yes | Vendor-native log family. Zeek: `"conn"`, `"dns"`, `"http"`, `"ssl"`, ... Suricata: `"flow"`, `"alert"`, `"dns"`, `"http"`, `"tls"`, `"fileinfo"`. |
| `sensor_id` | string | yes | Stable identifier of the sensor instance, e.g. `"site-a-zeek-01"`. Lowercase, `^[a-z0-9][a-z0-9-]{0,63}$`. |
| `received_at` | string (RFC3339 UTC, ms) | yes | Sensor-side timestamp of the underlying event (Zeek `ts`, Suricata `timestamp`), converted to RFC3339 UTC. |
| `raw` | object | yes | Verbatim vendor row preserved for forensic replay. For Zeek TSV: a JSON object with one key per `#fields` column (raw string values). For Suricata: the original eve.json line parsed as JSON. |

**Zeek-specific fields** (present when `source == "zeek"`):

| Field | Type | Required | Notes |
|---|---|---|---|
| `uid` | string | no | Zeek connection UID. |
| `id_orig_h` | string (IP) | yes | Originator IPv4 or IPv6 address. |
| `id_orig_p` | integer (0–65535) | yes | Originator port. |
| `id_resp_h` | string (IP) | yes | Responder IP. |
| `id_resp_p` | integer (0–65535) | yes | Responder port. |
| `proto` | enum: `"tcp"` \| `"udp"` \| `"icmp"` \| `"other"` | yes | Lowercased. |
| `service` | string \| null | no | Zeek-inferred service (`"http"`, `"dns"`, ...). |
| `duration` | number (seconds) \| null | no | Float. |
| `orig_bytes` | integer \| null | no | Payload bytes orig→resp. |
| `resp_bytes` | integer \| null | no | Payload bytes resp→orig. |
| `conn_state` | string \| null | no | Zeek conn_state code (`S0`, `SF`, `REJ`, ...). |
| `history` | string \| null | no | Zeek connection state history string. |
| `orig_pkts` | integer \| null | no | Packets orig→resp. |
| `resp_pkts` | integer \| null | no | Packets resp→orig. |
| `local_orig` | boolean \| null | no | |
| `local_resp` | boolean \| null | no | |

**Suricata-specific fields** (present when `source == "suricata"`):

| Field | Type | Required | Notes |
|---|---|---|---|
| `flow_id` | integer | no | Suricata flow_id. |
| `src_ip` | string (IP) | yes | |
| `src_port` | integer (0–65535) | no | Absent for some event_types (e.g. icmp dns). |
| `dest_ip` | string (IP) | yes | |
| `dest_port` | integer (0–65535) | no | |
| `proto` | enum: `"tcp"` \| `"udp"` \| `"icmp"` \| `"other"` | yes | Lowercased. Suricata's `IPv6-ICMP`, `ICMPv6`, etc. fold to `"other"`. |
| `community_id` | string | no | Community ID v1 if Suricata is configured to emit it. |
| `bytes_toserver` | integer | no | From `flow.bytes_toserver`. |
| `bytes_toclient` | integer | no | From `flow.bytes_toclient`. |
| `pkts_toserver` | integer | no | |
| `pkts_toclient` | integer | no | |
| `alert_signature_id` | integer | no | Present iff `log_type == "alert"`. |
| `alert_signature` | string | no | Present iff `log_type == "alert"`. |
| `alert_category` | string | no | Present iff `log_type == "alert"`. |
| `alert_severity` | integer (1–5) | no | Present iff `log_type == "alert"`. |

### 2.2 `processed_events` payload (frozen)

Canonical, vendor-neutral 5-tuple event. One `processed_event` corresponds to one `raw_log` (the normaliser does not aggregate at this stage).

| Field | Type | Required | Notes |
|---|---|---|---|
| `ts` | string (RFC3339 UTC, ms) | yes | Canonical event timestamp (from raw `received_at`). |
| `src_ip` | string (IP) | yes | |
| `dst_ip` | string (IP) | yes | |
| `src_port` | integer (0–65535) \| null | no | Null for ICMP and a few Suricata event_types. |
| `dst_port` | integer (0–65535) \| null | no | |
| `protocol` | enum: `"tcp"` \| `"udp"` \| `"icmp"` \| `"other"` | yes | Lowercased. |
| `bytes_sent` | integer (≥0) | yes | src→dst payload bytes. Zero if unknown. |
| `bytes_recv` | integer (≥0) | yes | dst→src payload bytes. Zero if unknown. |
| `packets_sent` | integer (≥0) \| null | no | |
| `packets_recv` | integer (≥0) \| null | no | |
| `duration_ms` | integer (≥0) \| null | no | Connection duration in milliseconds. |
| `alert_flag` | boolean | yes | True iff this event indicates a flagged condition. Rule: Suricata `log_type == "alert"` OR Zeek `conn_state ∈ {"S0", "REJ", "RSTR", "RSTO"}` (configurable). |
| `alert_signature` | string \| null | no | Populated for Suricata alerts. |
| `alert_category` | string \| null | no | Populated for Suricata alerts. |
| `conn_state` | string \| null | no | Zeek conn_state, preserved for downstream graph features. |
| `community_id` | string \| null | no | Community ID v1, when available. |
| `sensor_id` | string | yes | Forwarded from raw_log. |
| `source` | enum: `"zeek"` \| `"suricata"` | yes | Forwarded from raw_log. |

### 2.3 `graph_snapshots` payload (DRAFT, Phase 3)

Skeleton: `{ window_start, window_end, nodes[], edges[], node_count, edge_count }`. Field-level types frozen in Phase 3. The envelope contract IS already frozen — only the payload shape is draft.

### 2.4 `detections` payload (DRAFT, Phase 4)

Skeleton: `{ detection_id, window_start, window_end, model_name, model_version, anomalous_nodes[], anomalous_edges[], gnn_scores{}, threshold, explanation{} }`.

### 2.5 `analyst_briefs` payload (DRAFT, Phase 7)

Skeleton: `{ detection_id, brief_text, mitre_technique_id, mitre_tactic, mitre_technique_name, confidence, generated_by }`.

### 2.6 DLQ payload (frozen)

| Field | Type | Required | Notes |
|---|---|---|---|
| `stage` | string | yes | Logical stage that rejected the message (`"zeek_producer.parse"`, `"normaliser.schema_validation"`, ...). |
| `reason` | string | yes | Short machine-readable failure code (`"schema_validation_failed"`, `"json_decode_error"`, `"unknown_event_type"`). |
| `detail` | string \| null | no | Human-readable detail (validator error message, exception text). |
| `raw` | string | yes | The original message body. JSON-stringified if it was valid JSON; otherwise base64-encoded bytes (prefixed `"b64:"`). |

---

## 3. The `trace_id` invariant (critical)

`trace_id` is the single field that makes end-to-end debugging possible across the five-topic pipeline.

**Rules:**

1. **Set once at ingestion.** The Zeek producer and the Suricata producer generate a fresh UUID for `header.trace_id` for each `raw_logs` message they emit. No other service is allowed to generate a `trace_id`.
2. **Copied forward unchanged.** Every downstream consumer (normaliser → graph builder → GNN inference → MITRE mapper → brief service) MUST read `header.trace_id` from the inbound envelope and write the **identical value** into `header.trace_id` of every outbound envelope derived from it.
3. **Fan-out preserves trace_id.** If one inbound message produces N outbound messages (e.g. one `graph_snapshot` produces N `detection` messages, one per anomalous node), all N share the same `trace_id` as the inbound message.
4. **Fan-in picks one.** If multiple inbound messages produce one outbound message (e.g. graph builder windows over many `processed_events`), the outbound message MUST carry one of the inbound `trace_id`s — the **earliest by `produced_at`**, with ties broken by `event_id` lex order — and SHOULD additionally carry the others in `payload` (Phase 3 draft schema reserves `payload.contributing_trace_ids[]` for this).
5. **`event_id` is per-message, not per-trace.** Every new write generates a new `event_id`. Only `trace_id` is preserved.

Violation of the trace_id invariant is a hard CI failure: the integration test in Phase 2 walks `raw_logs → processed_events` joining on `trace_id` and the test fails if any `processed_event` carries a `trace_id` not present in `raw_logs`.

---

## 4. Versioning rules (semver)

`header.schema_version` follows semver `MAJOR.MINOR.PATCH`.

| Change kind | Bump | Examples |
|---|---|---|
| Remove a field, rename a field, change a field's type, change a field's enum to exclude a previously valid value, tighten validation (e.g. add `minimum`), change `required` from optional to required, change the envelope shape | **MAJOR** | `1.0.0` → `2.0.0` |
| Add a new optional field, add a new variant to a discriminated union, loosen validation (relax `pattern`, widen `maximum`), add a new topic | **MINOR** | `1.0.0` → `1.1.0` |
| Documentation-only change, comment, example update, fix a typo in a description, regenerate `types.ts`/`models.py` from an unchanged schema | **PATCH** | `1.0.0` → `1.0.1` |

**Bump procedure (atomic — all four must land in one PR):**

1. Edit the JSON Schema(s) under `docs/schemas/`.
2. Update `header.schema_version` constant in [`schemas/envelope.schema.json`](schemas/envelope.schema.json) (its `const`/`enum` for `schema_version`).
3. Run `make schemas` to regenerate `docs/types.ts` and `docs/models.py`.
4. Update §1.1 and the affected payload section in this document; add a `## 5. Changelog` entry.

CI enforces (4) via the `validate-schemas` workflow: if any file under `docs/schemas/` changes, the workflow re-runs `make schemas` and fails the build on any diff in `docs/types.ts` or `docs/models.py`.

**Backward compatibility window:** consumers MUST accept any message whose `header.schema_version` has the same MAJOR as the consumer's expected version, and MAY accept older MAJORs behind a feature flag. Consumers MUST reject (route to DLQ) messages with a strictly newer MAJOR than they were built for.

---

## 5. Changelog

| Version | Date | Notes |
|---|---|---|
| 1.0.0 | 2026-06-20 | Initial freeze. Envelope + `raw_logs` + `processed_events` + DLQ payloads frozen. `graph_snapshots`, `detections`, `analyst_briefs` payloads marked draft pending their respective phases. |
