const { Schema, model, models } = require('mongoose');

const chantingLogSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
  },
  { timestamps: true }
);

chantingLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = models.ChantingLog || model('ChantingLog', chantingLogSchema);
