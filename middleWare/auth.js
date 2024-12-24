const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key_here';

// Middleware to validate JWT token and check expiration
exports.authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.decode(token); // Decode the token payload without verifying it

    // Check if the token has expired
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    if (decoded.exp && decoded.exp < currentTime) {
      return res.status(403).json({ success: false, error: 'Token has expired. Please log in again.' });
    }

    // If not expired, verify the token's validity
    jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded token data to request object
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Invalid token.' });
  }
};