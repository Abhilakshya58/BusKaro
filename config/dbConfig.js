const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// Connect to MongoDB using the environment variable
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout if needed
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection failed:', err.message));

// Optional: Event listeners for connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});
