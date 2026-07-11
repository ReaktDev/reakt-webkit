import { handleAdminAuth } from '../../server/adminAuth.mjs';

export const handler = async (event) => {
  return handleAdminAuth({
    method: event.httpMethod,
    body: event.body || '{}',
    headers: event.headers || {},
  });
};
