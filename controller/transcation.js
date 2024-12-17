const Transaction = require('../model/transcation');
const moment = require('moment');

// Fetch transaction history for a specific account
exports.getTransactions = async (req, res, next) => {
  try {
    const { accountNumber } = req.params;

    // Fetch all transactions where the account is either the from or to account
    const transactions = await Transaction.find({
      $or: [{ fromAccount: accountNumber }, { toAccount: accountNumber }],
    }).sort({ transactionDate: -1 }); // Sort by transaction date in descending order

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
