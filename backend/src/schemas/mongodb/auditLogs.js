const mongoose = require('mongoose');
const AuditLogSchema = new mongoose.Schema({
  event_id:    { type: String, required: true, unique: true },
  actor_id:    String,
  action:      String,
  target_type: String,
  target_id:   String,
  timestamp:   { type: Date, default: Date.now },
  ip:          String,
  result:      { type: String, enum: ['success','failure'] },
  prev_hash:   String,
  hash:        String
});
module.exports = mongoose.model('AuditLog', AuditLogSchema);
