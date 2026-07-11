import { handleAdminSession } from '../../server/adminAuth.mjs';

export const handler = async (event) => {
  return handleAdminSession({
    method: event.httpMethod,
    body: event.body || '{}',
    headers: event.headers || {},
  });
};
