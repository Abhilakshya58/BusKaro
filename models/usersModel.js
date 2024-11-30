const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    coins: { type: Number, default: 0 }, // New field for coins
}, {
    timestamps: true,
});

module.exports = mongoose.model("User", userSchema);
