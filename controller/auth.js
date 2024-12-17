const User = require("../model/user");
const { cloudinary } = require("../config/cloudinary");

const otpGenerator = require('otp-generator')


const createUser = async (req, res) => {
    const { name, email, password, phoneNumber, accountType, balance, url } = req.body;

    try {
        // Check if all required fields are provided
        if (!name || !email || !password || !phoneNumber || !accountType) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!",
                name, email, password, phoneNumber, accountType, balance, url
            });
        }


        const existingEmail = await User.findOne({ email });
        const existingPhoneNumber = await User.findOne({ phoneNumber });

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is already in use!"
            });
        }

        if (existingPhoneNumber) {
            return res.status(400).json({
                success: false,
                message: "Phone number is already in use!"
            });
        }

        let accountNumber = otpGenerator.generate(16, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

        let findAccount_Number = User.findOne({ accountNumber });

        while (!findAccount_Number) {
            accountNumber = otpGenerator.generate(16, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
            findAccount_Number = User.findOne({ accountNumber });
            console.log("inside loop",findAccount_Number)
        }

        // Upload file to Cloudinary


        // Create a new user object and save it to the database
        const newUser = new User({
            name,
            email,
            password, // Note: Password should be hashed in a real-world scenario
            phoneNumber,
            accountNumber,
            balance: balance || 0, // Default balance is 0 if not provided
            accountType,
            url
        });

        await newUser.save();

        newUser.password = null;

        // Send the created user data in the response (excluding password)
        res.status(200).json({
            success: true,
            message: "User created successfully",
            user: newUser
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: `Server Error : ${error.message}`
        });
    }
};

const getUser = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ phoneNumber });

        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "User Not Found"
            });
        }

        existingUser.password = null;

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user: existingUser
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: `Server Error : ${error.message}`
        });
    }
}

module.exports = { createUser, getUser };