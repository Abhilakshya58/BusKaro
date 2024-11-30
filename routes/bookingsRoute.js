const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middlewares/authMiddleware");
const Bus = require("../models/busModels");
const Booking = require("../models/bookingsModel");
const Coupon = require("../models/couponModel");

// Route to book seats with coupon logic
router.post("/book-seat", authMiddleware, async (req, res) => {
    try {
        const { busId, seats, transactionId, couponCode } = req.body;

        // Validate bus ID
        if (!mongoose.Types.ObjectId.isValid(busId)) {
            return res.status(400).send({ success: false, message: "Invalid bus ID" });
        }

        // Find the bus
        const bus = await Bus.findById(busId);
        if (!bus) {
            return res.status(404).send({ success: false, message: "Bus not found" });
        }

        // Check if seats are already booked
        const alreadyBooked = seats.filter((seat) => bus.seatsBooked.includes(seat));
        if (alreadyBooked.length > 0) {
            return res.status(400).send({
                success: false,
                message: "Some seats are already booked",
                data: { alreadyBooked },
            });
        }

        // Apply coupon logic
        let discount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOneAndUpdate(
                {
                    code: couponCode,
                    used: false,
                    $or: [{ user: req.user.userId }, { isGlobal: true }],
                },
                { used: true }
            );

            if (coupon) {
                discount = 0.2; // Example: 20% discount
            } else {
                return res.status(400).send({ success: false, message: "Invalid or expired coupon" });
            }
        }

        // Calculate total fare with discount
        const fare = bus.fare * seats.length * (1 - discount);

        // Save booking
        const booking = new Booking({
            user: req.user.userId,
            bus: busId,
            seats,
            transactionId,
            fare,
        });

        await booking.save();

        // Update bus document with booked seats
        bus.seatsBooked.push(...seats);
        await bus.save();

        return res.status(200).send({
            success: true,
            message: "Booking successful",
            data: booking,
        });
    } catch (error) {
        console.error("Error booking seats:", error);
        return res.status(500).send({
            success: false,
            message: "Booking failed",
            error: error.message,
        });
    }
});

// Route to get bookings by user ID
router.post("/get-bookings-by-user-id", authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const bookings = await Booking.find({ user: req.user.userId })
            .populate("bus", "name number from to journeyDate departure arrival type fare")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).send({
            message: "Bookings fetched successfully",
            data: bookings,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return res.status(500).send({
            message: "Booking fetch failed",
            success: false,
            error: error.message,
        });
    }
});

// Route to get all bookings (for admin)
router.post("/get-all-bookings", authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const bookings = await Booking.find()
            .populate("bus", "name number from to journeyDate departure arrival type fare")
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).send({
            message: "All bookings fetched successfully",
            data: bookings,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        return res.status(500).send({
            message: "Failed to fetch all bookings",
            success: false,
            error: error.message,
        });
    }
});

// Route to get a single booking by ID
router.get("/get-booking/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send({ success: false, message: "Invalid booking ID" });
        }

        const booking = await Booking.findById(id)
            .populate("bus", "name number from to journeyDate departure arrival type fare")
            .populate("user", "name email");

        if (!booking) {
            return res.status(404).send({
                message: "Booking not found",
                success: false,
            });
        }

        return res.status(200).send({
            message: "Booking fetched successfully",
            data: booking,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        return res.status(500).send({
            message: "Failed to fetch booking",
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;
