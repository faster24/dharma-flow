const { Schema, model, models } = require('mongoose');

const userSchema = new Schema(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, index: true },
    displayName: { type: String },
    photoURL: { type: String },
  },
  { timestamps: true }
);

module.exports = models.User || model('User', userSchema);
