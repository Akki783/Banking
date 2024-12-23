require("dotenv").config()
const redis = require("redis");

let redisClient; // Declare redisClient at the top level

async function connectToRedis() {
  try {
    // Create Redis client with the connection string
    redisClient = redis.createClient({
        url: process.env.REDIS,  // Redis URL with the rediss:// protocol
        socket: {
          tls: true,  // This ensures the connection uses TLS (SSL)
          rejectUnauthorized: false,  // In production, you should validate certificates (set to true), but false works in some cases with self-signed certificates
        },
      });
      

    redisClient.on("connect", () => {
      console.log("✅ Connected to Redis");
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis Error:", err);
    });

    // Connect to Redis
    await redisClient.connect();

    console.log("✅ Redis client initialized");
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
    throw err;
  }
}


// Initialize Redis client on load
(async () => {
  try {
    await connectToRedis();
  } catch (err) {
    console.error("❌ Redis client initialization failed:", err);
  }
})();

module.exports = redisClient;
