const Account = require("../model/user");

// Function to generate a unique account number
const generateAccountNumber = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  return `${Date.now()}${randomDigits}`; // e.g., 17081705631234123
};

// Create a new account with validation
exports.createAccount = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber, accountType, url } = req.body;

    // Input Validation
    if (!name || !email || !password || !phoneNumber || !accountType) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const existingAccount = await Account.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingAccount) {
      return res
        .status(400)
        .json({
          error: "Account already exists with this email and phone number.",
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

    await account.save();

    res.status(201).json({
      message: "Account created successfully",
      account: {
        name: account.name,
        email: account.email,
        phoneNumber: account.phoneNumber,
        accountNumber: account.accountNumber,
        balance: account.balance,
        accountType: account.accountType,
        url: account.url,
        createdAt: account.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Check account balance
exports.checkBalance = async (req, res, next) => {
  try {
    const { accountNumber } = req.body;

    const account = await Account.findOne({ accountNumber });
    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    res.status(200).json({ balance: account });
  } catch (err) {
    next(err);
  }
};

// Transfer money
exports.transferMoney = async (req, res, next) => {
  const { fromAccount, toAccount, amount } = req.body;

  if (!fromAccount || !toAccount || amount <= 0) {
    return res.status(400).json({ error: "Invalid transfer details." });
  }

  if(fromAccount === toAccount)
  {
    return res.status(400).json({ error: "Both Account numbers are same..." });
  }

  try {
    const sender = await Account.findOne({ accountNumber: fromAccount });
    const receiver = await Account.findOne({ accountNumber: toAccount });

    if (!sender || !receiver) {
      return res
        .status(404)
        .json({ error: "Sender or receiver account not found." });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    // Perform transfer
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: "Transfer successful", sender, receiver });
  } catch (err) {
    next(err);
  }
};

// Add amount to an existing account
exports.deposit = async (req, res, next) => {
  try {
    const { accountNumber, amount } = req.body;
    // Validate the amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid amount. Please provide a positive number." });
    }

    // Find the account by account number
    const account = await Account.findOne({ accountNumber });

    // Check if account exists
    if (!account) {
      return res.status(404).json({ error: "Account not found." });
    }

    // Add the amount to the balance
    account.balance += amount;

    // Save the updated account
    await account.save();

    res.status(200).json({
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
