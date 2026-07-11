import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_TTL_SECONDS = 60 * 60 * 24;

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

const encodeBase64Url = (value) => {
  return Buffer.from(value)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
};

const decodeBase64Url = (value) => {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
};

const readBody = async (request) => {
  if (!request) {
    return {};
  }

  if (typeof request.body === 'object' && request.body !== null) {
    return request.body;
  }

  if (typeof request.body === 'string') {
    return JSON.parse(request.body || '{}');
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
};

const secureCompare = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const getAuthConfig = () => {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!password || !secret) {
    return null;
  }

  return { password, secret };
};

const signPayload = (payload, secret) => {
  return createHmac('sha256', secret).update(payload).digest('base64url');
};

const createSessionToken = (secret) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = encodeBase64Url(
    JSON.stringify({
      iat: issuedAt,
      exp: issuedAt + SESSION_TTL_SECONDS,
    }),
  );
  const signature = signPayload(payload, secret);

  return {
    token: `${payload}.${signature}`,
    expiresAt: new Date((issuedAt + SESSION_TTL_SECONDS) * 1000).toISOString(),
  };
};

const verifySessionToken = (token, secret) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = signPayload(payload, secret);
  if (!secureCompare(signature, expectedSignature)) {
    return false;
  }

  try {
    const parsed = JSON.parse(decodeBase64Url(payload));
    return typeof parsed.exp === 'number' && parsed.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

export const makeResponse = (statusCode, body) => ({
  statusCode,
  headers: jsonHeaders,
  body: JSON.stringify(body),
});

export const handleAdminAuth = async (request) => {
  if (request.method !== 'POST') {
    return makeResponse(405, { error: 'Method not allowed.' });
  }

  const config = getAuthConfig();
  if (!config) {
    return makeResponse(500, {
      error: 'Admin auth is not configured. Set ADMIN_PASSWORD and ADMIN_SESSION_SECRET on your host.',
    });
  }

  try {
    const body = await readBody(request);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!secureCompare(password, config.password)) {
      return makeResponse(401, { error: 'Wrong password.' });
    }

    return makeResponse(200, createSessionToken(config.secret));
  } catch {
    return makeResponse(400, { error: 'Invalid request body.' });
  }
};

export const handleAdminSession = async (request) => {
  if (request.method !== 'POST') {
    return makeResponse(405, { error: 'Method not allowed.' });
  }

  const config = getAuthConfig();
  if (!config) {
    return makeResponse(500, { valid: false });
  }

  try {
    const body = await readBody(request);
    const authHeader =
      request.headers?.authorization || request.headers?.Authorization || request.headers?.get?.('authorization') || '';
    const bearerToken = String(authHeader).startsWith('Bearer ') ? String(authHeader).slice(7) : '';
    const token = bearerToken || (typeof body.token === 'string' ? body.token : '');

    return makeResponse(200, { valid: verifySessionToken(token, config.secret) });
  } catch {
    return makeResponse(400, { valid: false });
  }
};
