const mongoose = require('mongoose');
const FederatedUpdateSchema = new mongoose.Schema({
  update_id:    { type: String, required: true, unique: true },
  org_id:       String,
  round_number: Number,
  submitted_at: Date,
  update_norm:  Number,
  dp_epsilon_used: Number,
  accepted:     Boolean,
  aggregated_at:Date
});
module.exports = mongoose.model('FederatedUpdate', FederatedUpdateSchema);
