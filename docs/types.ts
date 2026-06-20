/**
 * Aggregator schema used solely by the code generators (quicktype,
 * datamodel-code-generator) to produce docs/types.ts and docs/models.py from a single entry
 * point. Not used at runtime for validation; validation uses the per-message schemas under
 * messages/.
 *
 * Full envelope + raw_log payload. This is what producers validate against before send and
 * consumers validate against on receive.
 *
 * Schema shared by every <topic>.dlq topic.
 */
export interface SentinelMeshMessage {
    header:  Header;
    payload: RawLogsPayload;
}

export interface Header {
    /**
     * Per-message unique ID. UUIDv7 recommended (time-sortable); UUIDv4 accepted.
     */
    event_id: string;
    /**
     * Tenant identifier. Default 'org-000' for single-tenant deployments.
     */
    org_id: string;
    /**
     * RFC3339 UTC timestamp with millisecond precision (trailing 'Z' mandatory).
     */
    produced_at: string;
    /**
     * Producing service identity. Form: '<service-name>/<version>[@<instance>]'.
     */
    producer: string;
    /**
     * Frozen at 1.0.0 for the initial freeze. See docs/SCHEMA.md §4 for bump rules.
     */
    schema_version: "1.0.0";
    /**
     * End-to-end trace identifier. Set once at ingestion, copied forward unchanged through all
     * pipeline stages. See docs/SCHEMA.md §3.
     */
    trace_id: string;
}

/**
 * Discriminated union of Zeek conn-style records and Suricata eve.json records. Variant is
 * selected on the `source` field. See docs/SCHEMA.md §2.1.
 *
 * Canonical, vendor-neutral 5-tuple event derived from a single raw_logs message. See
 * docs/SCHEMA.md §2.2.
 *
 * Payload shape for every <topic>.dlq topic. See docs/SCHEMA.md §2.6.
 */
export interface RawLogsPayload {
    conn_state?: null | string;
    duration?:   number | null;
    history?:    null | string;
    id_orig_h?:  string;
    id_orig_p?:  number;
    id_resp_h?:  string;
    id_resp_p?:  number;
    local_orig?: boolean | null;
    local_resp?: boolean | null;
    /**
     * Vendor-native log family. Zeek: 'conn'|'dns'|'http'|'ssl'|...
     *
     * Vendor-native log family. Suricata: 'flow'|'alert'|'dns'|'http'|'tls'|'fileinfo'.
     */
    log_type?:   string;
    orig_bytes?: number | null;
    orig_pkts?:  number | null;
    proto?:      Proto;
    /**
     * Verbatim vendor row, preserved for forensic replay.
     *
     * Original message body. JSON-stringified if it was valid JSON; otherwise base64 bytes
     * prefixed with 'b64:'.
     */
    raw?: Raw;
    /**
     * Sensor-side event timestamp, normalised to RFC3339 UTC ms.
     */
    received_at?: string;
    resp_bytes?:  number | null;
    resp_pkts?:   number | null;
    /**
     * Stable sensor instance identifier.
     */
    sensor_id?:          string;
    service?:            null | string;
    source?:             Source;
    uid?:                null | string;
    alert_category?:     null | string;
    alert_severity?:     number | null;
    alert_signature?:    null | string;
    alert_signature_id?: number | null;
    bytes_toclient?:     number | null;
    bytes_toserver?:     number | null;
    community_id?:       null | string;
    dest_ip?:            string;
    dest_port?:          number | null;
    flow_id?:            number | null;
    pkts_toclient?:      number | null;
    pkts_toserver?:      number | null;
    src_ip?:             string;
    /**
     * Null for ICMP or when the source vendor omits it.
     */
    src_port?: number | null;
    /**
     * True iff event indicates a flagged condition. Rule: Suricata log_type=='alert' OR Zeek
     * conn_state in {S0,REJ,RSTR,RSTO}.
     */
    alert_flag?: boolean;
    /**
     * dst->src payload bytes. Zero if unknown.
     */
    bytes_recv?: number;
    /**
     * src->dst payload bytes. Zero if unknown.
     */
    bytes_sent?:   number;
    dst_ip?:       string;
    dst_port?:     number | null;
    duration_ms?:  number | null;
    packets_recv?: number | null;
    packets_sent?: number | null;
    protocol?:     Proto;
    /**
     * Canonical event timestamp (RFC3339 UTC ms).
     */
    ts?:                     string;
    contributing_trace_ids?: string[];
    edge_count?:             number;
    edges?:                  { [key: string]: any }[];
    node_count?:             number;
    nodes?:                  { [key: string]: any }[];
    window_end?:             string;
    window_start?:           string;
    anomalous_edges?:        AnomalousEdge[];
    anomalous_nodes?:        string[];
    detection_id?:           string;
    explanation?:            { [key: string]: any };
    gnn_scores?:             { [key: string]: number };
    model_name?:             string;
    model_version?:          string;
    threshold?:              number;
    brief_text?:             string;
    confidence?:             number;
    generated_by?:           string;
    mitre_tactic?:           string;
    mitre_technique_id?:     string;
    mitre_technique_name?:   string;
    /**
     * Human-readable validator/exception message.
     */
    detail?: null | string;
    /**
     * Short machine-readable failure code.
     */
    reason?: Reason;
    /**
     * Logical stage that rejected the message, e.g. 'zeek_producer.parse',
     * 'normaliser.schema_validation'.
     */
    stage?: string;
    [property: string]: any;
}

export interface AnomalousEdge {
    dst: string;
    src: string;
    [property: string]: any;
}

export enum Proto {
    Icmp = "icmp",
    Other = "other",
    Tcp = "tcp",
    Udp = "udp",
}

export type Raw = { [key: string]: any } | string;

/**
 * Short machine-readable failure code.
 */
export enum Reason {
    InternalError = "internal_error",
    JsonDecodeError = "json_decode_error",
    MissingRequiredField = "missing_required_field",
    SchemaValidationFailed = "schema_validation_failed",
    UnknownEventType = "unknown_event_type",
    UnparseableTimestamp = "unparseable_timestamp",
    UnsupportedLogType = "unsupported_log_type",
}

export enum Source {
    Suricata = "suricata",
    Zeek = "zeek",
}
