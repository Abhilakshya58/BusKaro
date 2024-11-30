const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    user: { type: mongoose.Schema.ObjectId, ref: "User" }, // Nullable for global coupons
    isGlobal: { type: Boolean, default: false }, // Indicates if it's a global coupon
    used: { type: Boolean, default: false }, // Whether the coupon has been used
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Coupon", couponSchema);
