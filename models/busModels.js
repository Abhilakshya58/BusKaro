const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
    capacity: { type: Number, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    journeyDate: { type: String, required: true },
    departure: { type: String, required: true },
    arrival: { type: String, required: true },
    fare: { type: Number, required: true },
    seatsBooked: { type: Array, default: [] },
    lockedSeats: { type: Object, default: {} },
    status: { type: String, default: 'Yet-to-Start' },
    driverName: { type: String, required: true },
    driverContact: { type: String, required: true },
  });
  

module.exports = mongoose.model('Bus', busSchema);
