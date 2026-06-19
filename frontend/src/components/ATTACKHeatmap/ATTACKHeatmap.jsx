// TODO: D3.js heatmap of MITRE ATT&CK techniques triggered
// X-axis: tactic categories, Y-axis: technique IDs, colour = alert count
export default function ATTACKHeatmap() {
  return (
    <div className="text-gray-500 text-sm text-center py-8">
      ATT&CK Heatmap — D3.js (TODO: connect to /api/detections for technique counts)
    </div>
  );
}
