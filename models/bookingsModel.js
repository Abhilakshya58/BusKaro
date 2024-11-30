const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bus: {
      type: mongoose.Schema.ObjectId,
      ref: "Bus", // Reference to the Bus model
      required: [true, "Bus ID is required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User", // Reference to the User model
      required: [true, "User ID is required"],
    },
    seats: {
      type: [String], // Array of seat IDs
      required: [true, "Seats are required"],
      validate: {
        validator: function (seats) {
          return seats.length > 0; // Ensure at least one seat is booked
        },
        message: "At least one seat must be booked",
      },
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true, // Ensure each transaction ID is unique
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create an index for faster queries by user and bus
bookingSchema.index({ user: 1, bus: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
