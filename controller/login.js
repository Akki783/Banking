const jwt = require('jsonwebtoken');
const Account = require('../model/user'); // Adjust path if needed

const JWT_SECRET = 'your_secret_key_here'; // Use a strong secret key
exports.JWT_SECRET = JWT_SECRET;
const TOKEN_EXPIRY = '2h'; // Token expiry duration
exports.TOKEN_EXPIRY = TOKEN_EXPIRY;

// Login API
exports.login = async (req, res, next) => {
  const { email, phoneNumber, accountNumber, password } = req.body;

  try {
    // Validate input
    if (!password || (!email && !phoneNumber && !accountNumber)) {
      return res.status(400).json({ success: false, error: 'Provide email, phone number, or account number along with password.' });
    }

    // Find the user by email, phone number, or account number
    const user = await Account.findOne({
      $or: [
        { email },
        { phoneNumber },
        { accountNumber },
      ],
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found.' });
    }

    // Validate the password (plain text comparison)
    if (user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    // Generate a JWT token
    const token = jwt.sign(
        {
          id: user._id,
          accountNumber: user.accountNumber,
          email: user.email,
          name: user.name,
          issuedAt: Math.floor(Date.now() / 1000), // Current time in seconds
          expiresAt: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY, // Expiry time in seconds
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );
      

    // Send response with token
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
    });
  } catch (error) {
    next(error);
  }
};
