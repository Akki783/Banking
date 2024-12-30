const express = require("express");
const router = express.Router();
const {
  createAccount,
  checkBalance,
  transferMoney,
  deposit,
  handleQrScan,
  fetchDetailsFromPhoneNumber,
  qrCode,
  processUserInteraction,
  checkPhoneNumber
} = require("../controller/BankController");

const { login, verifyToken } = require("../controller/login");

const {
  getUserTransactions,
  getUserTransactionsForMessage,
} = require("../controller/transcation");
const { authenticateToken } = require("../middleWare/auth");

// Define routes
router.post("/login", login);
router.get("/verifyToken", verifyToken);

router.post("/accounts", createAccount);
router.get("/accounts/balance", authenticateToken, checkBalance);
router.post("/accounts/transfer", authenticateToken, transferMoney);
router.post("/accounts/deposit", deposit);
router.get("/scan", handleQrScan);
router.get("/scan/:accountId", handleQrScan);

router.get("/transcationHistory", authenticateToken, getUserTransactions);
router.get("/getUserTransactionsForMessage",authenticateToken, getUserTransactionsForMessage);

router.get("/accounts/userDetails", fetchDetailsFromPhoneNumber);
router.get("/accounts/qrCode", authenticateToken, qrCode);

router.get("/getAccountData", processUserInteraction);
router.get("/existingNumber", checkPhoneNumber);

module.exports = router; // Export the router
