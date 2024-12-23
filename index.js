/*
require("dotenv").config();
const express = require("express");
const PORT = process.env.PORT || 3000;
const { createUser, getUser } = require("./controller/auth");
const fileUpload = require("express-fileupload");
const dbconnect = require("./config/mongodb_config");
const app = express();


app.use(express.json());
// app.use('/api/v1',);

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

dbconnect();

app.get("/test911", (req, res) => {
    return res.status(200).json({
        success: true,
        message: `Server is running.`
    })
})

app.get("/user", getUser);
app.post("/user", createUser);

app.listen(PORT, () => {
    console.log(`Server running on : http://localhost:${PORT}`);
})
    */

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bankRoutes = require("./Routes/bankRoutes");
const errorHandler = require("./middleWare/errorHandling");
const Account = require("./model/user");
const RedisClient = require("./config/redis");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/bank", bankRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });
