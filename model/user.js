const mongoose = require('mongoose');

// Define the schema for a bank account
const accountSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Account holder name
  email: { type: String, required: true, unique: true }, // Unique email
  password: { type: String, required: true }, // Password for account
  phoneNumber: { type: String, required: true, unique: true }, // Unique phone number
  accountNumber: { type: String, required: true, unique: true }, // Auto-generated account number
  balance: { type: Number, default: 0 }, // Default balance starts at 0
  accountType: { type: String, required: true, enum: ['Savings account', 'Current account'] }, // Account type
  url: { type: String, required: false }, // Optional field for any URL
  createdAt: { type: Date, default: Date.now }, // Timestamp for account creation
});

// Pre-save hook to ensure a unique account number is generated
accountSchema.pre('save', function (next) {
  if (!this.accountNumber) {
    // Generate a unique account number if not already set
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    this.accountNumber = `${Date.now()}${randomDigits}`;
  }
  next();
});

// Create the Account model
const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
