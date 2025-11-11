const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex'); // 64 bytes = 512-bit
console.log(`JWT_SECRET=${secret}`);
