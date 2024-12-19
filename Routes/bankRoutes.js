const express = require("express");
const router = express.Router();
const {
  createAccount,
  checkBalance,
  transferMoney,
  deposit,
  handleQrScan,
} = require("../controller/BankController");

const { login } = require("../controller/login");

const {
  getUserTransactions,
  getUserTransactionsForMessage,
} = require("../controller/transcation");
const { authenticateToken } = require("../middleWare/auth");

// Define routes
router.post("/login", login);

router.post("/accounts", createAccount);
router.get("/accounts/balance",authenticateToken, checkBalance);
router.post("/accounts/transfer",authenticateToken, transferMoney);
router.post("/accounts/deposit", deposit);
router.get("/scan", handleQrScan);
router.get("/transcationHistory",authenticateToken, getUserTransactions);
router.get("/getUserTransactionsForMessage", getUserTransactionsForMessage);

module.exports = router; // Export the router
