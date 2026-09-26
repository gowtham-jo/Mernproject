import mongoose from 'mongoose';

/**
 * Connect to MongoDB with production-grade error handling.
 *
 * Guarantees:
 * - MONGODB_URI environment variable MUST be set (no silent fallback).
 * - NO localhost/127.0.0.1 fallback — production must use MongoDB Atlas.
 * - Process exits on connection failure so the server never accepts
 *   requests against a disconnected database.
 * - Connection string and credentials are NEVER logged.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('=========================================');
    console.error('[FATAL] MONGODB_URI environment variable is not configured.');
    console.error('The server cannot start without a database connection.');
    console.error('Set MONGODB_URI in your environment variables or .env file.');
    console.error('=========================================');
    process.exit(1);
  }

  console.log('[Database] MONGODB_URI configured: true');
  console.log('[Database] Connecting to MongoDB...');

  // Register connection lifecycle event listeners (before connecting)
  mongoose.connection.on('connected', () => {
    console.log(`[Database] MongoDB connected successfully (host: ${mongoose.connection.host}, db: ${mongoose.connection.name})`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Database] MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected');
  });

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    console.error('=========================================');
    console.error(`[FATAL] Failed to connect to MongoDB: ${error.message}`);
    console.error('Please verify:');
    console.error('  1. MONGODB_URI is a valid MongoDB connection string');
    console.error('  2. MongoDB Atlas Network Access allows this IP (use 0.0.0.0/0 for Render)');
    console.error('  3. Database user credentials are correct');
    console.error('  4. The database cluster is running');
    console.error('=========================================');
    process.exit(1);
  }
};

/**
 * Returns the current Mongoose connection readyState as a human-readable string.
 * Safe to expose in health-check responses.
 */
export const getDBStatus = () => {
  const state = mongoose.connection.readyState;
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return stateMap[state] || 'unknown';
};
