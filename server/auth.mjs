import crypto from "node:crypto";

const COOKIE_NAME = "ocd_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, expectedHash] = stored.split(":");
  const actualHash = crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(actualHash, "hex"), Buffer.from(expectedHash, "hex"));
  } catch {
    return false;
  }
}

export function createSessionToken(payload, secret) {
  const data = {
    email: payload.email,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token, secret) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [encoded, sig] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
  try {
    const valid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
    if (!valid) return null;
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader = "") {
  const out = {};
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export function setSessionCookie(res, token) {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
  );
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export function getSessionFromRequest(req, secret) {
  const cookies = parseCookies(req.headers.cookie || "");
  const token = cookies[COOKIE_NAME];
  return verifySessionToken(token, secret);
}

const loginAttempts = new Map();

export function checkLoginRateLimit(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.firstAt > windowMs) {
    loginAttempts.set(ip, { count: 0, firstAt: now });
    return { allowed: true };
  }
  if (entry.count >= 12) {
    return { allowed: false, retryAfterSeconds: Math.ceil((windowMs - (now - entry.firstAt)) / 1000) };
  }
  return { allowed: true };
}

export function recordFailedLogin(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, firstAt: now };
  entry.count += 1;
  loginAttempts.set(ip, entry);
}

export function clearFailedLogin(ip) {
  loginAttempts.delete(ip);
}
