export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">SentinelMesh — SOC Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-gray-900 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">Live Alert Feed</h2>
          {/* TODO: AlertFeed component — WebSocket connected */}
          <p className="text-gray-500 text-sm">No alerts — connect Kafka consumer</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">Host Risk Scores</h2>
          {/* TODO: RiskScorePanel component */}
        </div>
        <div className="col-span-2 bg-gray-900 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">Analyst Brief</h2>
          {/* TODO: AnalystBrief component */}
        </div>
        <div className="bg-gray-900 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">FL Model Metrics</h2>
          {/* TODO: FLMetrics component */}
        </div>
        <div className="col-span-3 bg-gray-900 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-3">MITRE ATT&CK Heatmap</h2>
          {/* TODO: ATTACKHeatmap component — D3.js */}
        </div>
      </div>
    </div>
  );
}
