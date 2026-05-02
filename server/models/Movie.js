import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title:  { type: String, required: true, trim: true },
    genre:  { type: String, trim: true },
    rating: { type: String, trim: true },
    lang:   { type: String, enum: ['EN', 'AR'], default: 'EN' },
    poster: { type: String, default: '' },
    chains: [{ type: String, enum: ['muvi', 'AMC', 'VOX'] }],
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

export default mongoose.model('Movie', movieSchema);
