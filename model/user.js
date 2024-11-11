const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                // Basic regex for a 10-digit phone number, modify as needed
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
    },
    accountType: {
        type: String,
        enum: ["Savings", "Checking", "Business"],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    url:{
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
