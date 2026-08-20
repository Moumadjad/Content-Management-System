const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/helpers');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(errorResponse('Missing or invalid Authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (error) {
    return res.status(401).json(errorResponse('Invalid or expired token'));
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json(errorResponse('Authentication required'));
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json(errorResponse('Insufficient permissions'));
  }

  next();
};

module.exports = { verifyToken, requireRole };
