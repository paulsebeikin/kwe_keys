import { sql } from './server/_schema.mjs';
import { parseBody } from './server/_utils.mjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware-like input validation
function validateInput({ username, password }) {
  return username && password && password.length >= 6;
}

export const config = {
  path: '/api/auth/login'
}

export default async (request, context) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { default: jwt } = await import('jsonwebtoken');
  const { default: bcrypt } = await import('bcryptjs');
  const body = await parseBody(request);

  if (!validateInput(body)) {
    return new Response(JSON.stringify({ message: 'Invalid input' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { username, password } = body;
    const result = await sql`SELECT * FROM users WHERE username = ${username}`;
    const user = result[0];

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        {
          username,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return new Response(JSON.stringify({
        token,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
