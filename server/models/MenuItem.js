import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name:      { type: String, trim: true },
    nameEn:    { type: String, required: true, trim: true },
    price:     { type: Number, required: true, min: 0 },
    emoji:     { type: String, default: '' },
    cat:       { type: String, enum: ['snacks', 'meals', 'drinks'], required: true, index: true },
    available: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret._id; return ret; },
    },
  }
);

export default mongoose.model('MenuItem', menuItemSchema);
