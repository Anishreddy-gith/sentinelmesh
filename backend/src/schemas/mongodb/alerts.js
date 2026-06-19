const mongoose = require('mongoose');
const AlertSchema = new mongoose.Schema({
  alert_id:          { type: String, required: true, unique: true },
  org_id:            String,
  timestamp:         Date,
  src_ip:            String,
  dst_ip:            String,
  protocol:          String,
  suricata_category: String,
  zeek_log_ref:      String,
  anomaly_score:     Number,
  mitre_technique_id:String,
  analyst_brief:     String,
  status:            { type: String, enum: ['new','triaged','closed'], default: 'new' },
  assigned_to:       String,
  severity:          { type: Number, min: 1, max: 5 }
}, { timestamps: true });
module.exports = mongoose.model('Alert', AlertSchema);
