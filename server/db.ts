import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Helper function to create database connection with retry logic
async function createPoolWithRetry(maxRetries = 5, baseDelay = 1000): Promise<Pool> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 10000, // 10 second timeout
      });

      // Test the connection
      await pool.query('SELECT 1');
      console.log(`✅ Database connected successfully on attempt ${attempt}`);
      return pool;
    } catch (error: any) {
      lastError = error;
      const isRetryable = 
        error.code === 'EAI_AGAIN' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.message?.includes('getaddrinfo') ||
        error.message?.includes('timeout');

      if (!isRetryable || attempt === maxRetries) {
        console.error(`❌ Database connection failed after ${attempt} attempts:`, error.message);
        throw new Error(`Failed to connect to database: ${error.message}`);
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`⚠️ Connection attempt ${attempt}/${maxRetries} failed (${error.code || error.message}), retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Failed to connect to database');
}

// Create the pool with connection timeout and proper configuration
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 second timeout
});

export const db = drizzle({ client: pool, schema });

// Initialize the pool with retry logic in the background
// This ensures the first connection is established with retry logic
createPoolWithRetry().catch(error => {
  console.error('Failed to initialize database connection:', error);
  process.exit(1);
});
