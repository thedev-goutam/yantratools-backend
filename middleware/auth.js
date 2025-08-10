const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), 'mySecretToken');
    req.userId = decoded.id; // assuming your payload contains { id: user_id }
    next();
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid token.' });
  }
};