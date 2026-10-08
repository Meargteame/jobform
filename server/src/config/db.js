const mongoose = require('mongoose');
const { setMemoryMode, seedMemoryStore } = require('./memoryStore');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobform';

  try {
    console.log(`[Database] Connecting to MongoDB at: ${uri}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
    setMemoryMode(false);
    return conn;
  } catch (err) {
    console.warn(`[Database] Could not connect to MongoDB (${err.message}).`);
    console.log(`[Database] ✨ Seamlessly activating In-Memory Store for immediate zero-config operation!`);
    setMemoryMode(true);
    await seedMemoryStore();
    return null;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (_) {}
};

module.exports = { connectDB, disconnectDB };
