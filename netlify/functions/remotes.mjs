import { sql } from './server/_schema.mjs';
import { parseBody, authenticateToken, snakeToCamel } from './server/_utils.mjs';

export default async (request, context) => {
  const user = await authenticateToken(request);
  if (!user) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  // Remove leading /api/remotes and any trailing slash (except for root)
  let pathname = url.pathname.replace(/^\/api\/remotes/, '');
  if (pathname === '' || pathname === '/') {
    pathname = '/';
  } else {
    pathname = pathname.replace(/\/+$/, '');
  }

  try {
    // GET /remotes
    if (request.method === 'GET' && pathname === '/') {
      const result = await sql`SELECT * FROM remotes ORDER BY assigned_at DESC`;      
      return new Response(JSON.stringify(snakeToCamel(result)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // GET /remotes/history/:unitNumber
    if (request.method === 'GET' && /^\/history\/\d+$/.test(pathname)) {
      const unitNumber = pathname.split('/')[2];
      const result = await sql`SELECT * FROM remote_history WHERE unit_number = ${parseInt(unitNumber)} ORDER BY created_at DESC`;
      return new Response(JSON.stringify(snakeToCamel(result)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // POST /remotes
    if (request.method === 'POST' && pathname === '/') {
      const { unitNumber, remoteId, entranceId, exitId } = await parseBody(request);
      if (!unitNumber || !remoteId) {
        return new Response(JSON.stringify({ message: 'Unit number and remoteId are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      try {
        const now = new Date().toISOString();
        await sql`INSERT INTO remotes (unit_number, remote_id, entrance_id, exit_id, assigned_by, assigned_at, updated_at) VALUES (${parseInt(unitNumber)}, ${remoteId}, ${entranceId || null}, ${exitId || null}, ${user.username}, ${now}, ${now})`;
        await sql`INSERT INTO remote_history (unit_number, remote_id, action, by) VALUES (${parseInt(unitNumber)}, ${remoteId}, 'assigned', ${user.username})`;
        return new Response(JSON.stringify({ message: 'Remote assigned successfully' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
          return new Response(JSON.stringify({ message: 'Remote ID already exists' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        throw error;
      }
    }

    // PUT /remotes/:remoteId
    if (request.method === 'PUT' && /^\/\w+$/.test(pathname)) {
      const remoteId = pathname.split('/')[1];
      const { unitNumber, entranceId, exitId } = await parseBody(request);
      const result = await sql`SELECT * FROM remotes WHERE remote_id = ${remoteId}`;
      const remote = result[0];
      if (remote) {
        await sql`INSERT INTO remote_history (unit_number, remote_id, action, by) VALUES (${remote.unit_number}, ${remoteId}, 'unassigned', ${user.username})`;
        await sql`UPDATE remotes SET unit_number = ${parseInt(unitNumber)}, entrance_id = ${entranceId}, exit_id = ${exitId}, updated_at = ${new Date().toISOString()} WHERE remote_id = ${remoteId}`;
        await sql`INSERT INTO remote_history (unit_number, remote_id, action, by) VALUES (${parseInt(unitNumber)}, ${remoteId}, 'reassigned', ${user.username})`;
        return new Response(JSON.stringify({ message: 'Remote updated successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ message: 'Remote not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // DELETE /remotes/:remoteId
    if (request.method === 'DELETE' && /^\/\w+$/.test(pathname)) {
      const remoteId = pathname.split('/')[1];
      const result = await sql`SELECT * FROM remotes WHERE remote_id = ${remoteId}`;
      const remote = result[0];
      if (remote) {
        await sql`INSERT INTO remote_history (unit_number, remote_id, action, by) VALUES (${remote.unit_number}, ${remoteId}, 'deleted', ${user.username})`;
        await sql`DELETE FROM remotes WHERE remote_id = ${remoteId}`;
        return new Response(JSON.stringify({ message: 'Remote deleted successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ message: 'Remote not found' }), {
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
    console.error('Error handling request:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};