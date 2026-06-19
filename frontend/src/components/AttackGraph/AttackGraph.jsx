// TODO: Render Sigma.js graph from Neo4j /api/graph/hosts and /api/graph/attack-paths
// Nodes = hosts coloured by risk_score, edges = COMMUNICATES_WITH with ATT&CK annotation
export default function AttackGraph() {
  return (
    <div id="sigma-container" style={{ width: '100%', height: '100%' }}>
      {/* Sigma.js mounts here */}
    </div>
  );
}
