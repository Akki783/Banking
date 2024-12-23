const { createClient } = require("redis");

const RedisClient = createClient({
  username:  process.env.REDISUSER, // Use the correct username for your Redis instance
  password: process.env.REDISUSERPSW, // Ensure the password is set in your .env
  socket: {
    host: "redis-17314.c264.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 17314,
  },
});

// Error handling
RedisClient.on("error", (err) => console.log("Redis Error:", err));

async function connectToRedis() {
  try {
    await RedisClient.connect();
    console.log("✅ Redis Connected");
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
    process.exit(1); // Exit if Redis connection fails
  }
}

// Call the function to connect
connectToRedis();

// Export the Redis client once connected
module.exports = RedisClient;
