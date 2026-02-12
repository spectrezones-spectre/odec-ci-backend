import rateLimit from "express-rate-limit";

const createLimiter = ({ windowMs, max, error, code }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error,
        code,
        path: req.originalUrl,
        timestamp: new Date().toISOString(),
      });
    },
  });

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  error: "Trop de tentatives de connexion. Reessayez plus tard.",
  code: "AUTH_RATE_LIMIT_EXCEEDED",
});

export const contactLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  error: "Trop d'envois de messages. Reessayez plus tard.",
  code: "CONTACT_RATE_LIMIT_EXCEEDED",
});

export const aiLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 30,
  error: "Trop de requetes IA. Reessayez plus tard.",
  code: "AI_RATE_LIMIT_EXCEEDED",
});

