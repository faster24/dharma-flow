const { Schema, model, models } = require('mongoose');

const categorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = models.Category || model('Category', categorySchema);
