const { Schema, model, models } = require('mongoose');

const sutraSchema = new Schema(
  {
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'audio'], required: true },
    summary: { type: String },
    tags: [{ type: String, trim: true, lowercase: true }],
    thumbnailUrl: { type: String },
    audioUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = models.Sutra || model('Sutra', sutraSchema);
