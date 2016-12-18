import * as crypto from 'crypto';

// let text = ':1234567890:40:140000:1234567891:24695665:';

// let hmac = crypto.createHmac('sha256', 'W7v7nEzHlolA1XNyAHaE6ftYKBswtRQg');
// hmac.update(text);
// let computedHmac = hmac.digest('base64');
// console.log(computedHmac);

const hash = crypto.createHash('sha256');

hash.update('hello');
let computedHash= hash.digest('base64');
console.log(computedHash);



// StbjnrwpYmgniKWqB78asvK/ipifTDmmZjH2chOcF/Q=
// pVjAMyUOcLk3IIa1+6GMIa39X6xcelZd1SmXgSKLQ0A=


// LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=
// LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=
