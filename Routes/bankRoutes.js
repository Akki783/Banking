const express = require('express');
const router = express.Router();
const {
  createAccount,
  checkBalance,
  transferMoney,
  deposit 
} = require('../controller/BankController');

// Define routes
router.post('/accounts', createAccount);
router.get('/accounts/balance', checkBalance);
router.post('/accounts/transfer', transferMoney);
router.post('/accounts/deposit', deposit);

module.exports = router; // Export the router
