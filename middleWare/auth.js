const jwt = require("jsonwebtoken");
const JWT_SECRET = 'your_secret_key_here'; // Use a strong secret key


exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  // console.log(token)

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify signature and `exp`
    console.log(decoded)
    // Manual validation for `expiresAt` (if needed)
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.expiresAt && decoded.expiresAt < currentTime) {
      console.log(`expiration Time: ${decoded.expiresAt}.\nCurrent Time : ${currentTime}.`)
      return res.status(403).json({
        success: false,
        error: 'Token has expired. Please log in again.',
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.log(err)
    const errorMessage =
      err.name === 'TokenExpiredError'
        ? 'Token has expired. Please log in again......'
        : 'Something went wrong....';
    return res.status(403).json({ success: false, error: errorMessage });
  }
};
