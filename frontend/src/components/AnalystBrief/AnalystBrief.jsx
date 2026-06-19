// TODO: Display BERT-generated analyst brief for selected detection
export default function AnalystBrief({ brief = null }) {
  if (!brief) return <p className="text-gray-500 text-sm">Select a detection to view brief</p>;
  return (
    <div className="text-sm text-gray-200 leading-relaxed">
      <p>{brief.generated_text}</p>
      <p className="text-gray-500 mt-2">Confidence: {(brief.confidence * 100).toFixed(1)}%</p>
    </div>
  );
}
