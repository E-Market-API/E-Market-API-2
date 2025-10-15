const attempts = new Map();

export const couponRateLimit = (req, res, next) => {
    const key = req.ip + req.body?.code;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxAttempts = 5;

    if (!attempts.has(key)) {
        attempts.set(key, []);
    }

    const userAttempts = attempts.get(key);
    const recentAttempts = userAttempts.filter(time => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
        logFailedValidation(req, 'Rate limit exceeded');
        return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    }

    userAttempts.push(now);
    attempts.set(key, userAttempts.slice(-maxAttempts));
    next();
};

const logFailedValidation = (req, reason) => {
    const logEntry = `[${new Date().toISOString()}] COUPON_VALIDATION_FAILED - IP: ${req.ip}, Code: ${req.body?.code}, Reason: ${reason}\n`;
    import('fs').then(fs => {
        fs.appendFile('./logs/coupon-failures.log', logEntry, () => {});
    });
};

export { logFailedValidation };
