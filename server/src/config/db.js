const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobform';

  try {
    console.log(`[Database] Connecting to MongoDB at: ${uri}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[Database] MongoDB connection failed: ${err.message}`);
    console.warn(
      `[Database] Note: Ensure MongoDB is running locally (e.g., 'mongod' or docker) or set MONGODB_URI in .env (e.g. MongoDB Atlas connection string).`
    );
    throw err;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB };
