const redis = require("redis");
const redisClient = redis.createClient();

const connectRedis = async () => {
  redisClient.on("connect", () => console.log("Connected to Redis"));
  redisClient.on("error", (err) => console.error("Redis Error:", err));

  await redisClient.connect();
};

module.exports = connectRedis;
