const express = require("express");
const router = express.Router();
const Coupon = require("../models/couponModel");
const User = require("../models/usersModel");
const authMiddleware = require("../middlewares/authMiddleware");

// Fetch available coupons
router.get("/available", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).send({ success: false, message: "User not found" });

    const coupons = [
      { title: "DISCOUNT25", description: "BusKaro", requiredCoins: 25, id: "1" },
      { title: "Puma Shopping", description: "Puma Stores", requiredCoins: 50, id: "2" },
      { title: "Myntra Code", description: "Myntra Shopping", requiredCoins: 70, id: "3" },
      { title: "Mamaearth Discount", description: "Mamaearth Products", requiredCoins: 100, id: "4" },
    ];

    res.send({ success: true, data: coupons });
  } catch (error) {
    res.status(500).send({ success: false, message: "Failed to fetch coupons", data: error.message });
  }
});

// Redeem a coupon
router.post("/redeem", authMiddleware, async (req, res) => {
    try {
      const { couponId } = req.body;
  
      if (!couponId) {
        return res.status(400).send({ success: false, message: "Coupon ID is required" });
      }
  
      const user = await User.findById(req.user.userId);
  
      if (!user) {
        return res.status(404).send({ success: false, message: "User not found" });
      }
  
      const coupons = {
        "1": { requiredCoins: 20 },
        "2": { requiredCoins: 50 },
        "3": { requiredCoins: 70 },
        "4": { requiredCoins: 100 },
      };
  
      const selectedCoupon = coupons[couponId];
  
      if (!selectedCoupon) {
        return res.status(400).send({ success: false, message: "Invalid coupon ID" });
      }
  
      if (user.coins < selectedCoupon.requiredCoins) {
        return res.status(400).send({
          success: false,
          message: `You need ${selectedCoupon.requiredCoins} coins to redeem this coupon`,
        });
      }
  
      user.coins -= selectedCoupon.requiredCoins;
      await user.save();
  
      return res.status(200).send({ success: true, message: "Coupon redeemed successfully!" });
    } catch (error) {
      console.error("Error redeeming coupon:", error.message);
      return res.status(500).send({
        success: false,
        message: "Failed to redeem coupon",
        error: error.message,
      });
    }
  });

  // Apply a coupon
// Apply a coupon
// Apply a coupon
router.post("/apply", authMiddleware, async (req, res) => {
  try {
      const { couponCode } = req.body;

      if (!couponCode) {
          return res.status(400).send({ success: false, message: "Coupon code is required" });
      }

      // Check if the coupon exists in the database
      const coupon = await Coupon.findOne({
          code: couponCode,
          $or: [
              { isGlobal: true }, // Global coupon
              { user: req.user.userId }, // User-specific coupon
          ],
      });

      if (!coupon) {
          // If the coupon does not exist
          return res.status(400).send({
              success: false,
              message: "Coupon has expired or is invalid",
          });
      }

      if (coupon.used) {
          // If the coupon has already been used
          return res.status(400).send({
              success: false,
              message: "Coupon has already been used",
          });
      }

      // If the coupon is valid and not used
      res.status(200).send({
          success: true,
          message: "Coupon is valid",
          discount: 0.25, // Example: 25% discount
          couponId: coupon._id,
      });
  } catch (error) {
      console.error("Error validating coupon:", error.message);
      res.status(500).send({
          success: false,
          message: "An error occurred while validating the coupon",
          error: error.message,
      });
  }
});


router.post("/mark-used", async (req, res) => {
  try {
      const { couponCode } = req.body;

      if (!couponCode) {
          return res.status(400).send({ success: false, message: "Coupon code is required" });
      }

      const coupon = await Coupon.findOne({ code: couponCode });

      if (!coupon) {
          return res.status(400).send({ success: false, message: "Invalid coupon code" });
      }

      
      await coupon.save();

      res.status(200).send({ success: true, message: "Coupon marked as used successfully" });
  } catch (error) {
      console.error("Error marking coupon as used:", error.message);
      res.status(500).send({ success: false, message: error.message });
  }
});



  
  
  

module.exports = router;
