const redis = require("redis");

async function connectToRedis() {
  try {
    // Create Redis client with the connection string
    const redisClient = redis.createClient({
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

    return redisClient; // Return the connected client
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
    throw err;
  }
}

module.exports = connectToRedis;
