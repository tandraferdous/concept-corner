import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  course: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    items: [
      {
        course: {
          type: Schema.Types.ObjectId,
          ref: 'Course',
          required: true,
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 });

const Cart = mongoose.model<ICart>('Cart', cartSchema);

export default Cart;
