import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    city:  { type: String, required: true, trim: true },
    area:  { type: String, trim: true },
    chain: { type: String, enum: ['muvi', 'AMC', 'VOX'], required: true, index: true },
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

export default mongoose.model('Venue', venueSchema);
