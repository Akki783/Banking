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