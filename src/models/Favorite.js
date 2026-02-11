const { Schema, model, models } = require('mongoose');

const favoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sutra: { type: Schema.Types.ObjectId, ref: 'Sutra', required: true, index: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, sutra: 1 }, { unique: true });

module.exports = models.Favorite || model('Favorite', favoriteSchema);
