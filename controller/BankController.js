require("dotenv").config();
const Transaction = require("../model/transcation");
const Account = require("../model/user");
const QRCode = require("qrcode");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, TOKEN_EXPIRY } = require("./login");
const baseUrl = process.env.BASE_URL || "http://localhost:4000";
const redisClient = require("../config/redis");
const crypto = require('crypto'); // For generating UUID
const CryptoJS = require('crypto-js'); // For SHA256 hashing

const config = {
  cloudinary: {
    cloud_name: process.env.CLOUD_NAME || "dxnvzxkyf",
    api_key: process.env.API_KEY || "665885989761969",
    api_secret: process.env.API_SECRET || "CR8kvRBdNDQpISlQkZRPK3sfp_o",
  },
};

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Function to generate a unique account number
const generateAccountNumber = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `${Date.now()}${randomDigits}`; // e.g., 17081705631234123
};

// Create Account API
exports.createAccount = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber, accountType, url } = req.body;

    // Input validation
    if (!name || !email || !password || !phoneNumber || !accountType) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required." });
    }

    // Check if account already exists
    const existingAccount = await Account.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        error: "Account already exists with this email or phone number.",
      });
    }

    // Generate account number
    const accountNumber = generateAccountNumber();

    // Create a new account instance
    const account = new Account({
      name,
      email,
      password,
      phoneNumber,
      accountNumber,
      balance: 0,
      accountType,
      url,
    });

    await account.save();

    const scanUrl = `https://banking-8t8y.onrender.com/api/bank/scan?accountId=${account._id}`;

    QRCode.toDataURL(scanUrl, async (err, qrCodeImage) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, error: "Error generating QR code." });
      }

      try {
        // Upload QR code to Cloudinary
        const uploadedImage = await cloudinary.uploader.upload(qrCodeImage, {
          folder: "bank_accounts/qr_codes",
          public_id: account.accountNumber,
        });

        // Save QR code URL to the account
        account.url = uploadedImage.secure_url; // Ensure the field is 'url' and consistent
        await account.save();

        // Generate a JWT token
        const token = jwt.sign(
          {
            id: account._id, // Use the account object
            accountNumber: account.accountNumber, // Use the account object
            email: account.email, // Use the account object
            name: account.name, // Use the account object
            issuedAt: Math.floor(Date.now() / 1000), // Current time in seconds
            expiresAt: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY, // Expiry time in seconds
          },
          JWT_SECRET,
          { expiresIn: TOKEN_EXPIRY }
        );

        res.status(201).json({
          success: true,
          message: "Account created successfully with QR code.",
          account: {
            name: account.name,
            email: account.email,
            phoneNumber: account.phoneNumber,
            accountNumber: account.accountNumber,
            balance: account.balance,
            accountType: account.accountType,
            url: account.url,
            qrCodeUrl: uploadedImage.secure_url, // Send the URL of the QR code
            createdAt: account.createdAt,
            token,
          },
        });
      } catch (uploadErr) {
        console.error("Cloudinary Upload Error:", uploadErr);
        return res.status(500).json({
          success: false,
          error: "Error uploading QR code to Cloudinary.",
        });
      }
    });
  } catch (err) {
    next(err);
  }
};

// Handle QR Scan API
/*
exports.handleQrScan = async (req, res, next) => {
  try {
    const accountId = req.params.accountId || req.query.accountId;

    // Validate accountId
    if (!accountId) {
      return res
        .status(400)
        .json({ success: false, error: "Account ID is required." });
    }

    // Fetch the account from the database
    const account = await Account.findById(accountId);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found." });
    }

    // Generate a unique token
    const uniqueToken = crypto.randomUUID();

    // Store user data in Redis with an expiry (e.g., 5 minutes)
    const userData = JSON.stringify({
      accountId: account._id,
      name: account.name,
      email: account.email,
      phoneNumber: account.phoneNumber,
    });

    await redisClient.setEx(uniqueToken, 300, userData); // 300 seconds (5 minutes)

    // Redirect user to WhatsApp
    const whatsappNumber = "+918655741286";
    const whatsappMessage = encodeURIComponent(
      `Hello ${account.name}, your account with account number ${account.accountNumber} is being accessed via QR code.`
    );
    const whatsappRedirectUrl = `https://wa.me/${whatsappNumber}`;

    return res.redirect(whatsappRedirectUrl);
  } catch (err) {
    // Log the error
    console.error("Error during QR scan:", err);
    next(err);
  }
};
*/

exports.handleQrScan = async (req, res, next) => {
  try {
    const accountId = req.params.accountId || req.query.accountId;

    // Validate accountId
    if (!accountId) {
      return res
        .status(400)
        .json({ success: false, error: "Account ID is required." });
    }

    // Fetch the account from the database
    const account = await Account.findById(accountId);
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found." });
    }

    // Generate a unique token
    const uniqueToken = crypto.randomUUID();

    // Create a reference ID (could be a hash or just a shortened version of the token)
    const hash = CryptoJS.SHA256(uniqueToken).toString(); // Generate SHA256 hash
    const referenceId = hash.substring(0, 10); // Get the first 10 characters

    // Store user data in Redis with the reference ID as the key
    const userData = JSON.stringify({
      accountId: account._id,
      accountNumber : account.accountNumber,
      name: account.name,
      email: account.email,
      phoneNumber: account.phoneNumber,
    });

    await redisClient.setEx(referenceId, 300, userData); // 300 seconds (5 minutes)

    // Redirect user to WhatsApp with the reference ID, not the token
    const whatsappNumber = "+918655741286";
    const whatsappMessage = encodeURIComponent(
      `Hello ${account.name}, your account with account number ${account.accountNumber} is being accessed via QR code. Use this reference ID: ${referenceId}`
    );
    const whatsappRedirectUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

    return res.redirect(whatsappRedirectUrl);
  } catch (err) {
    // Log the error
    console.error("Error during QR scan:", err);
    next(err);
  }
};

// Check account balance
exports.checkBalance = async (req, res, next) => {
  try {
    // const { accountNumber } = req.body;

    const accountNumber = req.user.accountNumber;

    const account = await Account.findOne({ accountNumber });
    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found" });
    }

    res.status(200).json({ success: true, balance: account });
  } catch (err) {
    console.log("Error in checkBalance API : ",err)
    next(err);
  }
};

exports.transferMoney = async (req, res, next) => {
  const { toAccount, amount } = req.body;

  const fromAccount = req.user.accountNumber;

  // console.log(fromAccount)

  if (!toAccount || amount <= 0) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid transfer details." });
  }

  if (fromAccount === toAccount) {
    return res
      .status(400)
      .json({ success: false, error: "Both Account numbers are same..." });
  }

  try {
    const sender = await Account.findOne({ accountNumber: fromAccount });
    const receiver = await Account.findOne({ accountNumber: toAccount });

    if (!sender || !receiver) {
      return res.status(404).json({
        success: false,
        error: "Sender or receiver account not found.",
      });
    }

    // Ensure balances are numbers
    sender.balance = Number(sender.balance);
    receiver.balance = Number(receiver.balance);

    if (sender.balance < amount) {
      return res
        .status(400)
        .json({ success: false, error: "Insufficient balance." });
    }

    // Perform transfer
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    // Log the debit and credit transactions
    const debitTransaction = new Transaction({
      fromAccount,
      toAccount,
      amount,
      transactionType: "Debit", // Debit for the sender
    });

    const creditTransaction = new Transaction({
      fromAccount: toAccount,
      toAccount: fromAccount,
      amount,
      transactionType: "Credit", // Credit for the receiver
    });

    // Save both transactions
    await debitTransaction.save();
    await creditTransaction.save();

    res.status(200).json({
      success: true,
      message: "Transfer successful",
      sender: {
        accountNumber: sender.accountNumber,
        balance: sender.balance,
      },
      receiver: {
        accountNumber: receiver.accountNumber,
        balance: receiver.balance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Add amount to an existing account (deposit with transaction logging)
exports.deposit = async (req, res, next) => {
  try {
    const { accountNumber, amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount. Please provide a positive number.",
      });
    }

    // Find the account by account number
    const account = await Account.findOne({ accountNumber });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found." });
    }

    // Add the amount to the balance
    account.balance += amount;

    // Save the updated account
    await account.save();

    // Log the deposit transaction
    const transaction = new Transaction({
      fromAccount: accountNumber,
      toAccount: accountNumber,
      amount,
      transactionType: "Credit", // Deposit is a credit transaction
    });

    // Save the transaction
    await transaction.save();

    res.status(200).json({
      success: true,
      message: "Amount added successfully.",
      account: {
        accountNumber: account.accountNumber,
        balance: account.balance,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.fetchDetailsFromPhoneNumber = async (req, res) => {
  const { phoneNumber } = req.params;

  try {
    const account = await Account.findOne({ phoneNumber });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found" });
    }

    res.status(200).json({
      success: true,
      data: account, // Send the entire account details
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

exports.qrCode = async (req, res) => {
  const accountNumber = req.user.accountNumber;

  try {
    console.log(accountNumber);
    if (!accountNumber) {
      return res
        .status(404)
        .json({ success: false, error: "Account Number undefined" });
    }

    // Fetch the account from the correct model
    const account = await Account.findOne({ accountNumber });
    console.log(account);

    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: "Account not found" });
    }

    res.status(200).json({
      success: true,
      data: { url: account.url },
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/*
exports.processUserInteraction = async (req, res) => {
  try {
    const { token } = req.body;

    // Fetch data from Redis
    const userData = await redisClient.get(token);
    if (!userData) {
      return res.status(400).json({ success: false, error: "Invalid or expired token." });
    }

    // Parse the retrieved data
    const parsedData = JSON.parse(userData);

    console.log("User Data:", parsedData);

    res.json({ success: true, data: parsedData });
  } catch (err) {
    console.error("Error processing interaction:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};
*/

exports.processUserInteraction = async (req, res) => {
  try {
    const { referenceId } = req.body;

    // Fetch data from Redis using the reference ID (not the token)
    const userData = await redisClient.get(referenceId);
    if (!userData) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired reference ID." });
    }

    // Parse the retrieved data
    const parsedData = JSON.parse(userData);

    console.log("User Data:", parsedData);

    res.json({ success: true, data: parsedData });
  } catch (err) {
    console.error("Error processing interaction:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.checkPhoneNumber = async (req, res, next) => {
  const { phoneNumber } = req.body;

  // Validate input
  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      error: 'Phone number is required.',
    });
  }

  try {
    // Check if phone number exists in the database
    const user = await Account.findOne({ phoneNumber });

    if (user) {
      return res.status(200).json({
        success: true,
        message: 'Phone number exists.'
      });
    }

    // Phone number does not exist
    return res.status(404).json({
      success: false,
      message: 'Phone number does not exist.',
    });
  } catch (error) {
    // Handle any errors
    next(error);
  }
};