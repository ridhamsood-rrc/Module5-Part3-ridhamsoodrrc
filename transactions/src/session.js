// Reads the login session that the Flask backend stores in the "session" cookie.
//
// Flask signs this cookie with its SECRET_KEY (itsdangerous, HMAC-SHA1). This
// service gets the same SECRET_KEY, so it can check the signature and trust the
// user_id inside it. A cookie that was changed or forged fails the check.
const crypto = require('crypto');
const zlib = require('zlib');

const SALT = 'cookie-session';

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    let value = part.slice(index + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    cookies[name] = value;
  }
  return cookies;
}

// Returns the session data (e.g. { user_id: "..." }) or null if missing/invalid.
function readFlaskSession(cookieValue, secretKey) {
  if (!cookieValue || !secretKey) return null;

  const lastDot = cookieValue.lastIndexOf('.');
  if (lastDot <= 0) return null;
  const signedValue = cookieValue.slice(0, lastDot);   // "[.]payload.timestamp"
  const signature = cookieValue.slice(lastDot + 1);

  // itsdangerous "hmac" key derivation, then HMAC-SHA1 over the signed value.
  const key = crypto.createHmac('sha1', secretKey).update(SALT).digest();
  const expected = crypto.createHmac('sha1', key).update(signedValue).digest();
  const given = Buffer.from(signature, 'base64url');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return null;
  }

  let payload = signedValue.slice(0, signedValue.lastIndexOf('.'));  // drop timestamp
  const compressed = payload.startsWith('.');
  if (compressed) payload = payload.slice(1);

  try {
    let data = Buffer.from(payload, 'base64url');
    if (compressed) data = zlib.inflateSync(data);
    return JSON.parse(data.toString('utf8'));
  } catch {
    return null;
  }
}

module.exports = { parseCookies, readFlaskSession };
