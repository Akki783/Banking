require("dotenv").config();
const Transaction = require("../model/transcation");
const Account = require("../model/user");
const QRCode = require("qrcode");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");
const baseUrl = process.env.BASE_URL || "http://localhost:4000";


const config = {
  cloudinary: {
    cloud_name: "dxnvzxkyf",
    api_key: "665885989761969",
    api_secret: "CR8kvRBdNDQpISlQkZRPK3sfp_o",
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

/*
exports.createAccount = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber, accountType, url } = req.body;

    // Input Validation
    if (!name || !email || !password || !phoneNumber || !accountType) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if account exists with same email or phone number
    const existingAccount = await Account.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingAccount) {
      return res.status(400).json({
        error: "Account already exists with this email or phone number.",
      });
    }

    // Generate account number
    const accountNumber = generateAccountNumber();

    // Create a new account
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

    // Generate QR Code with Account Details
    const qrData = JSON.stringify({
      name,
      email,
      phoneNumber,
      accountNumber,
      accountType,
    });


    QRCode.toDataURL(qrData, async (err, qrCodeImage) => {
      if (err) {
        return res.status(500).json({ error: "Error generating QR code" });
      }

      try {
        // Upload the QR code image to Cloudinary
        const uploadedImage = await cloudinary.uploader.upload(qrCodeImage, {
          folder: "bank_accounts/qr_codes", // Store in a specific folder
          public_id: accountNumber, // Use account number as image identifier
        });


        // Save QR code URL to the account object
        account.qrCodeUrl = uploadedImage.secure_url; // Save QR URL in the account

        // Save the account with QR code URL
        await account.save();

        res.status(201).json({
          message: "Account created successfully with QR code",
          account: {
            name: account.name,
            email: account.email,
            phoneNumber: account.phoneNumber,
            accountNumber: account.accountNumber,
            balance: account.balance,
            accountType: account.accountType,
            url: account.url,
            qrCodeUrl: account.qrCodeUrl, // Return the QR code URL
            createdAt: account.createdAt,
          },
        });
      } catch (uploadErr) {
        res
          .status(500)
          .json({ error: "Error uploading QR code to Cloudinary" });
      }
    });
  } catch (err) {
    next(err);
  }
};

*/

// Create Account API
exports.createAccount = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber, accountType, url } = req.body;

    // Input validation
    if (!name || !email || !password || !phoneNumber || !accountType) {
      return res.status(400).json({success: false , error: "All fields are required." });
    }

    // Check if account already exists
    const existingAccount = await Account.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    if (existingAccount) {
      return res
        .status(400)
        .json({
          success: false ,
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
        return res.status(500).json({ success: false ,error: "Error generating QR code." });
      }

      try {
        // Upload QR code to Cloudinary
        const uploadedImage = await cloudinary.uploader.upload(qrCodeImage, {
          folder: "bank_accounts/qr_codes",
          public_id: account.accountNumber,
        });

        // Save QR code URL to the account
        account.qrCodeUrl = uploadedImage.secure_url;
        await account.save();

        res.status(201).json({
          success: true ,
          message: "Account created successfully with QR code.",
          account: {
            name: account.name,
            email: account.email,
            phoneNumber: account.phoneNumber,
            accountNumber: account.accountNumber,
            balance: account.balance,
            accountType: account.accountType,
            url: account.url,
            qrCodeUrl: account.qrCodeUrl,
            createdAt: account.createdAt,
          },
        });
      } catch (uploadErr) {
        console.error("Cloudinary Upload Error:", uploadErr);
        return res
          .status(500)
          .json({success: false , error: "Error uploading QR code to Cloudinary." });
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.handleQrScan = async (req, res, next) => {
  try {
    const { accountId } = req.query;

    // Validate accountId
    if (!accountId) {
      return res.status(400).json({success: false , error: "Account ID is required." });
    }

    // Fetch the account from the database
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({success: false , error: "Account not found." });
    }

    // Prepare webhook payload
    const webhookData = {
      name: account.name,
      email: account.email,
      phoneNumber: account.phoneNumber,
      accountNumber: account.accountNumber
    };

    // Trigger the webhook
    await axios.post(
      "https://webhook.site/d1ba59e8-89bc-4276-bc11-788cbf284645", // Your webhook URL
      webhookData
    );

    res.status(200).json({
      success: true ,
      message: "QR code scanned successfully.",
      account: {
        name: account.name,
        email: account.email,
        phoneNumber: account.phoneNumber,
        accountNumber: account.accountNumber
      },
    });
  } catch (err) {
    console.log(err)
    next(err);
  }
};

// Check account balance
exports.checkBalance = async (req, res, next) => {
  try {
    const { accountNumber } = req.body;

    const account = await Account.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({success: false , error: "Account not found" });
    }

    res.status(200).json({ success: true ,balance: account });
  } catch (err) {
    next(err);
  }
};

/*
// Transfer money (with transaction logging)
exports.transferMoney = async (req, res, next) => {
  const { fromAccount, toAccount, amount } = req.body;

  if (!fromAccount || !toAccount || amount <= 0) {
    return res.status(400).json({success: false , error: "Invalid transfer details." });
  }

  if (fromAccount === toAccount) {
    return res.status(400).json({ success: false ,error: "Both Account numbers are same..." });
  }

  try {
    const sender = await Account.findOne({ accountNumber: fromAccount });
    const receiver = await Account.findOne({ accountNumber: toAccount });

    if (!sender || !receiver) {
      return res
        .status(404)
        .json({success: false , error: "Sender or receiver account not found." });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ success: false ,error: "Insufficient balance." });
    }

    // Perform transfer
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    // Log the debit transaction for the sender
    const debitTransaction = new Transaction({
      fromAccount,
      toAccount,
      amount,
      transactionType: "Debit", // Debit for the sender
    });

    // Log the credit transaction for the receiver
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
*/

exports.transferMoney = async (req, res, next) => {
  const { fromAccount, toAccount, amount } = req.body;

  if (!fromAccount || !toAccount || amount <= 0) {
    return res.status(400).json({ success: false, error: "Invalid transfer details." });
  }

  if (fromAccount === toAccount) {
    return res.status(400).json({ success: false, error: "Both Account numbers are same..." });
  }

  try {
    const sender = await Account.findOne({ accountNumber: fromAccount });
    const receiver = await Account.findOne({ accountNumber: toAccount });

    if (!sender || !receiver) {
      return res.status(404).json({ success: false, error: "Sender or receiver account not found." });
    }

    // Ensure balances are numbers
    sender.balance = Number(sender.balance);
    receiver.balance = Number(receiver.balance);

    if (sender.balance < amount) {
      return res.status(400).json({ success: false, error: "Insufficient balance." });
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
      return res
        .status(400)
        .json({ success: false ,error: "Invalid amount. Please provide a positive number." });
    }

    // Find the account by account number
    const account = await Account.findOne({ accountNumber });

    if (!account) {
      return res.status(404).json({success: false , error: "Account not found." });
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
