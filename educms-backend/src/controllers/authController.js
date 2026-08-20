const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/helpers');

const signTokens = (user) => {
  const payload = { userId: user.user_id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });

  return { accessToken, refreshToken };
};

const sanitizeUser = (user) => {
  const { password_hash, verification_token, ...safe } = user;
  return safe;
};

const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (await User.findByEmail(email)) {
      return res.status(409).json(errorResponse('Email already registered'));
    }
    if (await User.findByUsername(username)) {
      return res.status(409).json(errorResponse('Username already taken'));
    }

    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const user = await User.create({ username, email, passwordHash, firstName, lastName });
    const tokens = signTokens(user);

    res.status(201).json(successResponse({ user, ...tokens }, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user || !user.is_active) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    await User.updateLastLogin(user.user_id);
    const tokens = signTokens(user);

    res.json(successResponse({ user: sanitizeUser(user), ...tokens }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json(errorResponse('Invalid or expired refresh token'));
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.is_active) {
      return res.status(401).json(errorResponse('Invalid or expired refresh token'));
    }

    const tokens = signTokens(user);
    res.json(successResponse(tokens, 'Token refreshed'));
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json(errorResponse('User not found'));
    }
    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, me };
