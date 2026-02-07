const { Schema, model, models } = require('mongoose');

const monkSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    bio: { type: String },
    avatarUrl: { type: String },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = models.Monk || model('Monk', monkSchema);
