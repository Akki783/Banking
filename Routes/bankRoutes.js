const express = require("express");
const router = express.Router();
const {
  createAccount,
  checkBalance,
  transferMoney,
  deposit,
  handleQrScan,
} = require("../controller/BankController");

const {
  getUserTransactions,
  getUserTransactionsForMessage,
} = require("../controller/transcation");

// Define routes
router.post("/accounts", createAccount);
router.get("/accounts/balance", checkBalance);
router.post("/accounts/transfer", transferMoney);
router.post("/accounts/deposit", deposit);
router.get("/scan", handleQrScan);
router.get("/transcationHistory", getUserTransactions);
router.get("/getUserTransactionsForMessage", getUserTransactionsForMessage);

module.exports = router; // Export the router
