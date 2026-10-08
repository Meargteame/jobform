const path = require('path');
const dotenv = require('dotenv');

// Load env from root or server
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to current dir .env

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 BetterForm API running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`===============================================`);
    });

    // Graceful shutdown handling
    const exitHandler = () => {
      if (server) {
        server.close(() => {
          console.log('BetterForm server closed.');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', exitHandler);
    process.on('SIGINT', exitHandler);
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
