import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IUser extends Document {
  email: string;
  fullName: string;
  phone?: string;
  dni?: string;
  address?: {
    province: string;
    city: string;
    street: string;
    postalCode: string;
  };
  createdAt: Date;
}

const AddressSchema = new Schema(
  {
    province: String,
    city: String,
    street: String,
    postalCode: String,
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    phone: String,
    dni: String,
    address: AddressSchema,
  },
  { timestamps: true }
);

export const User =
  (models.User as mongoose.Model<IUser>) || model<IUser>("User", UserSchema);
