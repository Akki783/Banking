const Transaction = require('../model/transcation');
const moment = require('moment');
const Account = require("../model/user");


// Fetch transaction history for a specific account
exports.getUserTransactions = async (req, res, next) => {
  try {
    // const { accountNumber } = req.params;
    const accountNumber = req.user.accountNumber;

    // Fetch all transactions where the account is either the from or to account
    const transactions = await Transaction.find({
      $or: [{ fromAccount: accountNumber }, { toAccount: accountNumber }],
    }).sort({ transactionDate: -1 }).limit(5); // Sort by transaction date in descending order

    // Check if transactions exist for the given account
    if (transactions.length === 0) {
      return res.status(404).json({ error: 'No transactions found for this account.' });
    }

    // Format transaction date using moment.js
    const formattedTransactions = transactions.map(transaction => ({
      fromAccount: transaction.fromAccount,
      toAccount: transaction.toAccount,
      amount: transaction.amount,
      transactionType: transaction.transactionType,
      transactionDate: moment(transaction.transactionDate).format('YYYY-MM-DD HH:mm:ss'), // Format date
    }));

    // Respond with the formatted transactions
    res.status(200).json({
      message: 'Transactions fetched successfully',
      transactions: formattedTransactions,
    });
  } catch (err) {
    next(err);
  }
};


exports.getUserTransactionsForMessage = async (req, res, next) => {
  const { accountNumber, password } = req.body;

  try {
    // Validate the presence of accountNumber and password
    if (!accountNumber || !password) {
      return res.status(400).json({ success: false, error: 'Account number and password are required.' });
    }

    // Find the account by account number
    const userAccount = await Account.findOne({ accountNumber });

    if (!userAccount) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }

    // Compare the provided password with the stored password (plain text comparison)
    if (userAccount.password !== password) {
      return res.status(400).json({ success: false, error: 'Invalid password.' });
    }

    // Fetch all transactions related to this account number
    const transactions = await Transaction.find({
      $or: [
        { fromAccount: accountNumber },
        { toAccount: accountNumber },
      ]
    }).sort({ transactionDate: -1 }).limit(5);

    // Format the message for WhatsApp or social media
    let message = `💳 Transaction History for ${userAccount.name} | Account Number: ${userAccount.accountNumber}. Recent Transactions: `;

    transactions.forEach((transaction, index) => {
      const direction = transaction.fromAccount === accountNumber ? 'Debit' : 'Credit';
      message += `${index + 1}) Type: ${direction}, Amount: ₹${transaction.amount}, `;
      message += `To/From: ${transaction.fromAccount === accountNumber ? transaction.toAccount : transaction.fromAccount}, `;
      message += `Date: ${new Date(transaction.transactionDate).toLocaleString()}. `;
    });

    // Respond with the formatted message
    res.status(200).json({
      success: true,
      message,
    });
  } catch (err) {
    next(err);
  }
};
