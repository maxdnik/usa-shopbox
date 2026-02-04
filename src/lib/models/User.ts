import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const AddressSchema = new Schema(
  {
    street: { type: String, default: "" }, // legacy
    streetName: { type: String, default: "" },
    streetNumber: { type: String, default: "" },
    floor: { type: String, default: "" },
    apartment: { type: String, default: "" },
    city: { type: String, default: "" },
    province: { type: String, default: "" },
    postalCode: { type: String, default: "" },
  },
  { _id: false }
);

const ArcaSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    totalUSD: { type: Number, default: 0 },
    usedUSD: { type: Number, default: 0 },
  },
  { _id: false }
);

const BillingSchema = new Schema(
  {
    fullName: { type: String, default: "" },
    dni: { type: String, default: "" },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    province: { type: String, default: "" },
    postalCode: { type: String, default: "" },
  },
  { _id: false }
);

const PaymentMethodSchema = new Schema(
  {
    type: { type: String, enum: ["card", "mp", "transfer"], required: true },
    last4: { type: String, default: "" },
    brand: { type: String, default: "" },
    label: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    // ✅ tus campos actuales (register usa fullName)
    fullName: { type: String, default: "" },

    // ✅ opcional (por compatibilidad si en algún lado usás name)
    name: { type: String, default: "" },

    email: { type: String, required: true, unique: true, index: true },
    image: { type: String, default: "" },

    // ✅ login credentials
    password: { type: String, default: "" }, // hash bcrypt

    // ✅ google/credentials (tu register manda provider: "credentials")
    provider: { type: String, default: "credentials" },

    role: { type: String, default: "user" },

    phone: { type: String, default: "" },
    dni: { type: String, default: "" },

    address: { type: AddressSchema, default: () => ({}) },
    arca: { type: ArcaSchema, default: () => ({}) },
    billing: { type: BillingSchema, default: () => ({}) },

    paymentMethods: { type: [PaymentMethodSchema], default: [] },

    cart: { type: Array, default: [] },
  },
  { timestamps: true }
);

type UserType = InferSchemaType<typeof UserSchema>;

export const User: Model<UserType> =
  (mongoose.models.User as Model<UserType>) ||
  mongoose.model<UserType>("User", UserSchema);

export default User;
