const requestCounts = new Map();

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxRequests = 30; // max requests per window

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  // Filter out old timestamps outside the window
  const timestamps = requestCounts.get(ip).filter(t => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again in a moment.'
    });
  }

  timestamps.push(now);
  requestCounts.set(ip, timestamps);
  next();
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  const windowMs = 60000;

  for (const [ip, timestamps] of requestCounts.entries()) {
    const filtered = timestamps.filter(t => now - t < windowMs);
    if (filtered.length === 0) {
      requestCounts.delete(ip);
    } else {
      requestCounts.set(ip, filtered);
    }
  }
}, 60000);
