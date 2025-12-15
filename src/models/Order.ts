import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IOrderItem {
  productId: string;
  title: string;
  store?: string;
  imageUrl?: string;
  quantity: number;
  estimatedUSD: number;
}

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  buyer: {
    fullName: string;
    email: string;
    phone: string;
    dni: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
  };
  items: IOrderItem[];
  totalUSD: number;
  status: "pending" | "paid" | "processing" | "shipped" | "completed" | "canceled";
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: String,
    title: String,
    store: String,
    imageUrl: String,
    quantity: { type: Number, default: 1 },
    estimatedUSD: Number,
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    buyer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      dni: { type: String, required: true },
      province: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    items: { type: [OrderItemSchema], required: true },
    totalUSD: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "completed", "canceled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order =
  (models.Order as mongoose.Model<IOrder>) || model<IOrder>("Order", OrderSchema);
