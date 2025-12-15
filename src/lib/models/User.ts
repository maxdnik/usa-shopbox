import mongoose, { Schema, type Model, type InferSchemaType } from "mongoose";

const AddressSchema = new Schema(
  {
    // ✅ Legacy (lo dejamos para compatibilidad con datos viejos)
    street: { type: String, default: "" },

    // ✅ Nuevos campos separados
    streetName: { type: String, default: "" },
    streetNumber: { type: String, default: "" },

    // ✅ Opcionales
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
    last4: { type: String, default: "" }, // opcional para card
    brand: { type: String, default: "" }, // opcional
    label: { type: String, default: "" }, // ej: "MP de Max"
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, unique: true, index: true, required: true },
    image: { type: String, default: "" },

    phone: { type: String, default: "" },
    dni: { type: String, default: "" },

    address: { type: AddressSchema, default: () => ({}) },
    arca: { type: ArcaSchema, default: () => ({}) },
    billing: { type: BillingSchema, default: () => ({}) },

    paymentMethods: { type: [PaymentMethodSchema], default: [] },

    cart: { type: Array, default: [] }, // lo dejé como lo venías usando
  },
  { timestamps: true }
);

type UserType = InferSchemaType<typeof UserSchema>;

export const User: Model<UserType> =
  (mongoose.models.User as Model<UserType>) ||
  mongoose.model<UserType>("User", UserSchema);
