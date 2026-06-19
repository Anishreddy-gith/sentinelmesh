export default function ThreatGraph() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-2xl font-bold text-cyan-400 mb-4">Attack Graph</h1>
      <div className="bg-gray-900 rounded-xl h-[600px] flex items-center justify-center">
        {/* TODO: Sigma.js graph — render host communication graph from Neo4j API */}
        <p className="text-gray-500">Sigma.js attack graph visualisation — connect /api/graph/hosts</p>
      </div>
    </div>
  );
}
