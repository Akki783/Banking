// Import mongoose for MongoDB interaction
const mongoose = require("mongoose");
require("dotenv").config();

// Function to connect to the MongoDB database
async function dbconnect() {
    try {
        // Connect to MongoDB using the connection URL from environment variables
        mongoose.connect(process.env.MONGODB_URL);
        console.log("DB connected successfully....");

    } catch (error) {
        console.log("DB Connection Fail", error.message);
    }
}
module.exports = dbconnect;
