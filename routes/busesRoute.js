const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Bus = require('../models/busModels');
const Booking = require('../models/bookingsModel')

// Route for adding a new bus
router.post('/add-bus', async (req, res) => {
    try {
      console.log("Received payload for adding a bus:", req.body);
  
      const { number, name, capacity, fare, driverName, driverContact } = req.body;
  
      // Check required fields
      if (!number || !name || !capacity || !fare || !driverName || !driverContact) {
        console.log("Validation failed: Missing required fields");
        return res.status(400).send({
          success: false,
          message: 'All required fields must be provided',
        });
      }
  
      // Normalize and validate bus number
      const busNumber = String(number).trim().toUpperCase();
      console.log("Normalized bus number:", busNumber);
  
      const existingBus = await Bus.findOne({ number: busNumber });
      if (existingBus) {
        console.log("Validation failed: Bus with this number already exists");
        return res.status(400).send({
          success: false,
          message: 'Bus with this number already exists',
        });
      }
  
      const newBus = new Bus({ ...req.body, number: busNumber });
      console.log("New bus object created:", newBus);
  
      await newBus.save();
      console.log("Bus added successfully:", newBus);
  
      return res.status(200).send({
        success: true,
        message: 'Bus added successfully',
        data: newBus,
      });
    } catch (error) {
      console.error('Error adding bus:', error.message);
      return res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  });
  
  

// Route to fetch all buses
router.post('/get-all-buses', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const buses = await Bus.find().skip(skip).limit(limit);

        return res.status(200).send({
            success: true,
            message: 'Buses fetched successfully',
            data: buses,
        });
    } catch (error) {
        console.error('Error fetching buses:', error.message);
        return res.status(500).send({ success: false, message: error.message });
    }
});

// Route for updating an existing bus by its ID
router.post('/update-bus/:id', authMiddleware, async (req, res) => {
    try {
        const allowedUpdates = [
            'name',
            'number',
            'capacity',
            'from',
            'to',
            'journeyDate',
            'departure',
            'arrival',
            'fare',
            'status', // Add this
            'driverName', // Allow driver name update
            'driverContact', // Allow driver contact update
        ];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).send({ success: false, message: 'Invalid updates!' });
        }

        const bus = await Bus.findById(req.params.id);

        if (!bus) {
            return res.status(404).send({
                success: false,
                message: 'Bus not found',
            });
        }

        updates.forEach((update) => (bus[update] = req.body[update]));
        await bus.save();

        return res.status(200).send({
            success: true,
            message: 'Bus updated successfully',
        });
    } catch (error) {
        console.error('Error updating bus:', error.message);
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
});

// Route for deleting a bus by its ID
router.delete('/delete-bus/:id', authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send({ success: false, message: 'Invalid bus ID' });
        }

        const bus = await Bus.findById(req.params.id);

        if (!bus) {
            return res.status(404).send({
                success: false,
                message: 'Bus not found',
            });
        }

        await Bus.findByIdAndDelete(req.params.id);

        return res.status(200).send({
            success: true,
            message: 'Bus deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting bus:', error.message);
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
});

// Route to fetch a bus by its ID
router.post('/get-bus-by-id', authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body._id)) {
            return res.status(400).send({ success: false, message: 'Invalid bus ID' });
        }

        const bus = await Bus.findById(req.body._id);

        if (!bus) {
            return res.status(404).send({
                success: false,
                message: 'Bus not found',
            });
        }

        return res.status(200).send({
            success: true,
            message: 'Bus fetched successfully',
            data: {
                ...bus._doc,
                lockedSeats: Object.keys(bus.lockedSeats),
            },
        });
    } catch (error) {
        console.error('Error fetching bus:', error.message);
        res.status(500).send({ success: false, message: error.message });
    }
});

// Route to fetch buses for the current date with specific statuses
router.get('/get-today-buses', authMiddleware, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const buses = await Bus.find({
            journeyDate: today,
            status: { $in: ['Yet-to-Start', 'Running'] },
        });

        return res.status(200).send({
            success: true,
            message: 'Buses fetched successfully',
            data: buses,
        });
    } catch (error) {
        console.error('Error fetching today buses:', error.message);
        res.status(500).send({ success: false, message: error.message });
    }
});

// Route to fetch today's booked buses for the logged-in user
router.get('/get-booked-today-buses', authMiddleware, async (req, res) => {
  try {
      const today = new Date().toISOString().split('T')[0];

      const userBookings = await Booking.find({ user: req.user.userId }).populate('bus');

      const todayBuses = userBookings
          .map((booking) => booking.bus)
          .filter(
              (bus) =>
                  bus && // Ensure bus is not null
                  (bus.status === 'Yet-to-Start' || bus.status === 'Running') &&
                  bus.journeyDate === today
          );

      return res.status(200).send({
          success: true,
          message: "Today's booked buses fetched successfully",
          data: todayBuses,
      });
  } catch (error) {
      console.error("Error fetching today's booked buses:", error.message);
      res.status(500).send({
          success: false,
          message: error.message,
      });
  }
});

module.exports = router;
