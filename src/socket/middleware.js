const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const User = require('./../models/userModel');

exports.protectIo = async (socket, next) => {
  try {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) {
      return next(new Error('No cookies found'));
    }

    const parsedCookies = cookie.parse(cookies);
    const token = parsedCookies.jwt;

    if (!token) {
      return next(new Error('Token required'));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error('The user no longer exists'));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
};
