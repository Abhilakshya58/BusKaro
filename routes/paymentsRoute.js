const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY); // Use secret key
const { v4: uuidv4 } = require("uuid");
const Coupon = require("../models/couponModel"); // Import Coupon model

// Debugging Stripe Key
console.log("Stripe Secret Key:", process.env.STRIPE_KEY);
if (!process.env.STRIPE_KEY) {
    console.error("Stripe API key is not defined. Please check your .env file.");
    process.exit(1);
}

// Payment Route
// Payment Route
router.post("/make-payment", async (req, res) => {
    try {
        const { token, amount, couponId } = req.body;

        let discount = 0;

        // Validate coupon without updating `used`
        if (couponId) {
            const coupon = await Coupon.findById(couponId);

            if (!coupon) {
                return res.status(400).send({ success: false, message: "Invalid coupon" });
            }

            if (coupon.used) {
                return res.status(400).send({ success: false, message: "Coupon has already been used" });
            }

            discount = 0.25; // Example: 25% discount
        }

        const discountedAmount = Math.floor(amount - amount * discount);

        if (discountedAmount <= 0) {
            return res.status(400).send({
                success: false,
                message: "Invalid discounted amount. Check the coupon or total fare.",
            });
        }

        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id,
        });

        const payment = await stripe.charges.create(
            {
                amount: discountedAmount,
                currency: "inr",
                customer: customer.id,
                receipt_email: token.email,
            },
            { idempotencyKey: uuidv4() }
        );

        if (payment) {
            res.status(200).send({
                success: true,
                message: "Payment successful",
                data: {
                    transactionId: payment.id,
                    discountedAmount,
                },
            });
        } else {
            res.status(500).send({ success: false, message: "Payment failed" });
        }
    } catch (error) {
        console.error("Error during payment:", error.message);
        res.status(500).send({ success: false, message: error.message });
    }
});






module.exports = router;
