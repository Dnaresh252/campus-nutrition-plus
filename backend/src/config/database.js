const { Pool } = require("pg");
require("dotenv").config();

// Support both DATABASE_URL (Render/Railway) and individual vars (local dev)
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // required for Render PostgreSQL
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "campus_nutrition",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
    };

// Production-grade connection pool (handles 1000+ concurrent users)
const pool = new Pool({
  ...poolConfig,

  // Connection pool settings for high traffic
  max: 20, // Maximum connections
  min: 2, // Minimum connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Timeout if can't connect in 10s

  // Keepalive for stable connections
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Test connection on startup
pool.on("connect", () => {
  console.log("✅ Database connected successfully");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err);
  process.exit(-1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await pool.end();
  console.log("Database pool closed");
  process.exit(0);
});

// Query helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 100ms)
    if (duration > 100) {
      console.warn(`⚠️  Slow query (${duration}ms):`, text);
    }

    return res;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  query,
  transaction,
};
