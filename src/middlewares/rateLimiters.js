const RateLimiterFactory = require('../utils/rateLimiterFactory');

exports.loginLimiter = RateLimiterFactory.create({
  windowMinutes: 10,
  maxRequests: 5,
  message: 'Too many login attempts. Please try again later.',
});

exports.forgotPasswordLimiter = RateLimiterFactory.create({
  windowMinutes: 15,
  maxRequests: 3,
  message: 'Too many password reset attempts. Try again later.',
});

exports.createSubjectLimiter = RateLimiterFactory.create({
  windowMinutes: 60,
  maxRequests: 10,
  message: 'Too many subjects created. Try again later.',
});

exports.createRoomLimiter = RateLimiterFactory.create({
  windowMinutes: 10,
  maxRequests: 4,
  message: 'Too many rooms created. Try again later.',
});

exports.verificationCodeLimiter = RateLimiterFactory.create({
  windowMinutes: 10,
  maxRequests: 4,
  message: 'Too many attempts. Try again later.',
});
