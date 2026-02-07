const { Schema, model, models } = require('mongoose');

const dharmaTalkSchema = new Schema(
  {
    monk: { type: Schema.Types.ObjectId, ref: 'Monk', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    tags: [{ type: String, trim: true, lowercase: true }],
    duration: { type: Number, required: true }, // seconds
    audioUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    type: { type: String, enum: ['audio'], default: 'audio' },
  },
  { timestamps: true }
);

module.exports = models.DharmaTalk || model('DharmaTalk', dharmaTalkSchema);
