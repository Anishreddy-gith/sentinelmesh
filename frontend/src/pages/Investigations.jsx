export default function Investigations() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-2xl font-bold text-cyan-400 mb-4">Investigations</h1>
      <div className="bg-gray-900 rounded-xl p-4">
        {/* TODO: list open detections with analyst briefs and MITRE technique tags */}
        <p className="text-gray-500 text-sm">No open investigations</p>
      </div>
    </div>
  );
}
