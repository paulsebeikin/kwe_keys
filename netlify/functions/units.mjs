import { sql } from './server/_schema.mjs';
import { parseBody, authenticateToken, snakeToCamel } from './server/_utils.mjs';

export const config = {
  path: '/api/units'
}

export default async (request, context) => {
  const user = await authenticateToken(request);
  if (!user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/api\/units/, '') || '/';

  try {
    // GET /units
    if (request.method === 'GET' && pathname === '/') {
      const result = await sql`SELECT * FROM units ORDER BY unit_number`;
      return new Response(JSON.stringify(snakeToCamel(result)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // POST /units
    if (request.method === 'POST' && pathname === '/') {
      const { unitNumber, owner } = await parseBody(request);
      if (!unitNumber || !owner) {
        return new Response(JSON.stringify({ message: 'Unit number and owner are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      try {
        await sql`INSERT INTO units (unit_number, owner) VALUES (${parseInt(unitNumber)}, ${owner})`;
        return new Response(JSON.stringify({ message: 'Unit created successfully' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        if (error.code === '23505') {
          return new Response(JSON.stringify({ message: 'Unit number already exists' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        throw error;
      }
    }

    // PUT /units/:unitNumber
    if (request.method === 'PUT' && /^\/\d+$/.test(pathname)) {
      const unitNumber = parseInt(pathname.split('/')[1]);
      const { owner } = await parseBody(request);
      const result = await sql`UPDATE units SET owner = ${owner}, updated_at = NOW() WHERE unit_number = ${unitNumber}`;
      if (result.length > 0) {
        return new Response(JSON.stringify({ message: 'Unit updated successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ message: 'Unit not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // DELETE /units/:unitNumber
    if (request.method === 'DELETE' && /^\/\d+$/.test(pathname)) {
      const unitNumber = parseInt(pathname.split('/')[1]);
      const result = await sql`DELETE FROM units WHERE unit_number = ${unitNumber}`;
      if (result.length > 0) {
        return new Response(JSON.stringify({ message: 'Unit deleted successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ message: 'Unit not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Not found
    return new Response(JSON.stringify({ message: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};