const rateLimit = require('express-rate-limit');

const limiter = {
     gen: rateLimit({
          windowMs: 10 * 60 * 1000, // 10 minutes
          max: 100, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
          standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
          legacyHeaders: false, // Disable the `X-RateLimit-*` headers
     }),
     mod: rateLimit({
          windowMs: 10 * 60 * 1000, // 10 minutes
          max: 10, // Limit each IP to 10 requests per `window` (here, per 10 minutes)
          standardHeaders: true,
          legacyHeaders: false,
     }),
     auth: rateLimit({
          windowMs: 1 * 60 * 1000, // 1 minute
          max: 3, // Limit each IP to 5 requests per `window`
          standardHeaders: true,
          legacyHeaders: false,
     })
};

module.exports = limiter;