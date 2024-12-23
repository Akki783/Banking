const redis = require("redis");

let redisClient; // Declare redisClient at the top level

async function connectToRedis() {
  try {
    // Create Redis client with the connection string
    redisClient = redis.createClient({
      url: "redis://red-ctkf8bogph6c739d179g:6379", // Replace with your actual Redis connection string
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
