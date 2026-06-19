// TODO: Real-time alert feed connected via useWebSocket
// Displays: severity badge, src_ip → dst_ip, MITRE technique, anomaly score, timestamp
export default function AlertFeed({ alerts = [] }) {
  if (!alerts.length) return <p className="text-gray-500 text-sm">No alerts</p>;
  return (
    <ul className="space-y-2">
      {alerts.map(a => (
        <li key={a.alert_id} className="bg-gray-800 rounded-lg p-3 text-sm">
          <span className="text-red-400 font-bold mr-2">[SEV {a.severity}]</span>
          {a.src_ip} → {a.dst_ip} | {a.mitre_technique_id} | score: {a.anomaly_score}
        </li>
      ))}
    </ul>
  );
}
