"use strict";
const crypto = require("crypto");
let text = ':1234567890:40:140000:1234567891:24695665:';
let hmac = crypto.createHmac('sha256', 'W7v7nEzHlolA1XNyAHaE6ftYKBswtRQg');
hmac.update(text);
let computedHmac = hmac.digest('base64');
console.log(computedHmac);