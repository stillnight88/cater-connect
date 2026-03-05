import mongoose from 'mongoose';

// MongoDB Connection State - Prevents multiple connections in development (Next.js hot reload)
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Global cache for mongoose connection - Required for Next.js development hot-reload
declare global {
    var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
}

// eslint-disable-next-line prefer-const
let cached: MongooseCache = global.mongooseCache || {
    conn: null,
    promise: null,
};

if (!global.mongooseCache) {
    global.mongooseCache = cached;
}

/**
 * Connect to MongoDB with connection pooling and graceful shutdown
 * Connection is cached globally to prevent multiple connections in Next.js development (hot reload) and serverless environments
 * @returns Mongoose instance
 */
export async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) {
        return cached.conn;      // Return existing connection if available
    }

    // Return existing connection promise if in progress
    if (!cached.promise) {
        const options = {
            bufferCommands: false, // Disable mongoose buffering (fail fast)
            maxPoolSize: 10, // Maximum number of connections in pool
            minPoolSize: 2, // Minimum number of connections in pool
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            serverSelectionTimeoutMS: 10000, // Timeout for server selection (10s)
        };

        cached.promise = mongoose
            .connect(MONGODB_URI!, options)
            .then((mongooseInstance) => {
                console.log('MongoDB connected successfully');
                return mongooseInstance;
            })
            .catch((error) => {
                cached.promise = null;
                console.error('MongoDB connection error:', error);
                throw error;
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }

    return cached.conn;
}

// Disconnect from MongoDB, Used during graceful shutdown
export async function disconnectDB(): Promise<void> {
    if (!cached.conn) {
        return;
    }

    try {
        await mongoose.disconnect();
        cached.conn = null;
        cached.promise = null;
        console.log('MongoDB disconnected successfully');
    } catch (error) {
        console.error('MongoDB disconnection error:', error);
        throw error;
    }
}

// Check if MongoDB is connected
export function isConnected(): boolean {
    return mongoose.connection.readyState === 1;
}

// Get current connection state - 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
export function getConnectionState(): number {
    return mongoose.connection.readyState;
}

// Graceful shutdown handler
export async function gracefulShutdown(signal: string): Promise<void> {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    try {
        await disconnectDB();
        console.log('Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
}

// Register shutdown handlers
if (typeof process !== 'undefined' && process.on) {
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

// Connection event listeners for debugging
if (process.env.NODE_ENV === 'development') {
    mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
        console.error('Mongoose connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose disconnected from MongoDB');
    });
}