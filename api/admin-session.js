import { handleAdminSession } from '../server/adminAuth.mjs';

export default async function handler(request, response) {
  const result = await handleAdminSession(request);

  Object.entries(result.headers).forEach(([key, value]) => {
    response.setHeader(key, value);
  });
  response.status(result.statusCode).send(result.body);
}
