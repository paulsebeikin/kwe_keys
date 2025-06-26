const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function parseBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function authenticateToken(request) {
  const { default: jwt } = await import('jsonwebtoken');
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function snakeToCamel(obj) {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  } else if (
    obj &&
    typeof obj === 'object' &&
    obj.constructor === Object // Only plain objects
  ) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
        snakeToCamel(value)
      ])
    );
  }
  return obj;
}
