import mongoose from 'mongoose';

const showtimeSchema = new mongoose.Schema(
  {
    movie:    { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    venue:    { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true, index: true },
    startsAt: { type: Date, required: true, index: true },
    hall:     { type: String, trim: true },
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

// Compound index for the common query: showtimes for a (movie, venue) pair, sorted by startsAt.
showtimeSchema.index({ movie: 1, venue: 1, startsAt: 1 });

export default mongoose.model('Showtime', showtimeSchema);
