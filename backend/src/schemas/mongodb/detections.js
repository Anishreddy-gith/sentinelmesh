const mongoose = require('mongoose');
const DetectionSchema = new mongoose.Schema({
  detection_id:    { type: String, required: true, unique: true },
  org_id:          String,
  window_start:    Date,
  window_end:      Date,
  anomalous_nodes: [String],
  anomalous_edges: [{ src: String, dst: String }],
  gnn_scores:      mongoose.Schema.Types.Mixed,
  explanation:     { top_edges: Array },
  mitre_mapping:   [{ technique_id: String, tactic: String, confidence: Number }],
  brief_id:        String
}, { timestamps: true });
module.exports = mongoose.model('Detection', DetectionSchema);
