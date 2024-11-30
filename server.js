require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const http = require("http");

const usersRoute = require("./routes/usersRoute");
const bookingsRoute = require("./routes/bookingsRoute");
const busesRoute = require("./routes/busesRoute");
const paymentRoute = require("./routes/paymentsRoute"); // Include Payment Route
const couponRoute = require("./routes/couponRoutes"); // Include Coupon Route

const { initializeWebSocket } = require("./websocket"); // WebSocket Integration
require("./config/dbConfig");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/users", usersRoute);
app.use("/api/bookings", bookingsRoute);
app.use("/api/buses", busesRoute);
app.use("/api/payments", paymentRoute); // Keep Payment Route
app.use("/api/coupons", couponRoute); // Keep Coupon Route

// Initialize HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
initializeWebSocket(server);

// Start server
server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
