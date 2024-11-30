const express = require("express");
const router = express.Router();
const User = require("../models/usersModel");
const Booking = require("../models/bookingsModel");
const Coupon = require("../models/couponModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");

// Registration route
router.post("/register", async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).send({ message: "User Already Exists", success: false });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;

        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).send({ message: "User created successfully", success: true });
    } catch (error) {
        res.status(500).send({ message: error.message, success: false });
    }
});

// Login route
router.post("/login", async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email });

        if (!userExists) {
            return res.status(404).send({ message: "User not found", success: false });
        }

        const passwordMatch = await bcrypt.compare(req.body.password, userExists.password);
        if (!passwordMatch) {
            return res.status(401).send({ message: "Incorrect password", success: false });
        }

        const token = jwt.sign({ userId: userExists._id, isAdmin: userExists.isAdmin }, "BusKaro", { expiresIn: "1d" });

        res.send({ message: "Login successful", success: true, data: token });
    } catch (error) {
        res.status(500).send({ message: error.message, success: false });
    }
});

// Profile route
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).send({ message: "User not found", success: false });
        }

        const recentTransactions = await Booking.find({ user: req.user.userId })
            .populate("bus", "name number journeyDate")
            .sort({ createdAt: -1 })
            .limit(4);

        res.send({
            message: "Profile fetched successfully",
            success: true,
            data: { user, coins: user.coins || 0, recentTransactions },
        });
    } catch (error) {
        res.status(500).send({ message: error.message, success: false });
    }
});

// Redeem coins
router.post("/redeem", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (user.coins < 5) {
            return res.status(400).send({ message: "Not enough coins to redeem a coupon", success: false });
        }

        const coupon = new Coupon({ code: "DISCOUNT20", user: req.user.userId });
        await coupon.save();

        user.coins = 0;
        await user.save();

        res.send({ message: "Coupon redeemed successfully", success: true, data: { couponCode: coupon.code } });
    } catch (error) {
        res.status(500).send({ message: error.message, success: false });
    }
});

// Add the missing route: /get-user-by-id
router.post("/get-user-by-id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).send({ message: "User not found", success: false });
        }

        res.send({
            message: "User fetched successfully",
            success: true,
            data: {
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                coins: user.coins || 0,
            },
        });
    } catch (error) {
        res.status(500).send({ message: error.message, success: false });
    }
});

router.get('/get-all-users', authMiddleware, async (req, res) => {
    
    try {
        const users = await User.find({}, 'name email isAdmin');
        res.status(200).send({
            success: true,
            message: "Users fetched successfully",
            data: users,
        });
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).send({
            success: false,
            message: "Error fetching users",
        });
    }
});


module.exports = router;
