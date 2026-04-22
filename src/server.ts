import mongoose from 'mongoose';
import config from './config';
import app from './app';
import { Server } from 'http';

async function connectDatabase() {
  try {
    if (!config.databaser_url) {
      throw new Error('Database URL is not defined in config');
    }
    await mongoose.connect(config.databaser_url as string);
    console.log('📚 Database connected | All Ok');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

// globall error handeling
let server: Server;

process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1); // Immediate exit
});

async function startServer() {
  try {
    // 1. Connect to Database
    await connectDatabase();
    console.log('📦 Database connected');

    // 2. Start Express Server
    server = app.listen(config.port, () => {
      console.log(`🚀 Server listening on port ${config.port}`);
    });

    // 3. Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (error: any) => {
      console.error('❌ Unhandled Rejection:', error);
      if (server) {
        server.close(() => {
          console.info('🛑 Server closed due to unhandled rejection.');
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    // 4. Graceful shutdown on SIGTERM
    process.on('SIGTERM', () => {
      console.info('📴 SIGTERM received. Shutting down gracefully...');
      if (server) {
        server.close(() => {
          console.info('✅ Server closed.');
          process.exit(0);
        });
      }
    });

    // 5. Graceful shutdown on SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      console.info('🧹 SIGINT received. Shutting down gracefully...');
      if (server) {
        server.close(() => {
          console.info('✅ Server closed.');
          process.exit(0);
        });
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1); // Server startup failed
  }
}

startServer();

// In production, use a process manager like PM2 or systemd to automatically restart the server if it crashes.
