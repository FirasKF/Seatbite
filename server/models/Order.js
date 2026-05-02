import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    qty:        { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestName: {
      type: String,
      trim: true,
      required: function () { return !this.user; },
    },
    showtime:  { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true, index: true },
    seat:      { type: String, required: true, match: /^[A-J][1-9][0-9]?$/ },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'items must be a non-empty array',
      },
    },
    total:  { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['confirmed', 'preparing', 'onway', 'delivered'], default: 'confirmed' },
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

// Two orders cannot claim the same seat on the same showtime.
orderSchema.index({ showtime: 1, seat: 1 }, { unique: true });

export default mongoose.model('Order', orderSchema);
