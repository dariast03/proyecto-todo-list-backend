import type { Request } from 'express';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

import { env } from '@/common/utils/envConfig';

const rateLimiter = rateLimit({
  legacyHeaders: true,
  limit: env.COMMON_RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  windowMs: 15 * 60 * env.COMMON_RATE_LIMIT_WINDOW_MS,
  keyGenerator: (req, res) => {
    if (req.query.apiKey) return req.query.apiKey as string;

    return ipKeyGenerator(req.ip as string); // better
  },
});

export default rateLimiter;
