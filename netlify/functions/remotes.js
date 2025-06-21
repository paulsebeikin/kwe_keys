const { snakeToCamel } = require('../../server/utils/caseConverter');
const {
  getAllRemotes,
  getRemoteById,
  createRemote,
  updateRemote,
  deleteRemote
} = require('../../server/controllers/remotesController');

exports.handler = async function(event, context) {
  const idMatch = event.path.match(/\/remotes\/(\d+)/);
  // GET /remotes
  if (event.httpMethod === 'GET' && !idMatch) {
    try {
      const remotes = await getAllRemotes();
      return {
        statusCode: 200,
        body: JSON.stringify(snakeToCamel(remotes))
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }
  // GET /remotes/:id
  if (event.httpMethod === 'GET' && idMatch) {
    try {
      const remote = await getRemoteById(idMatch[1]);
      if (!remote) return { statusCode: 404, body: 'Not found' };
      return {
        statusCode: 200,
        body: JSON.stringify(snakeToCamel(remote))
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }
  // POST /remotes
  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      const newRemote = await createRemote(data);
      return {
        statusCode: 201,
        body: JSON.stringify(snakeToCamel(newRemote))
      };
    } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
    }
  }
  // PUT /remotes/:id
  if (event.httpMethod === 'PUT' && idMatch) {
    try {
      const data = JSON.parse(event.body);
      const updatedRemote = await updateRemote(idMatch[1], data);
      return {
        statusCode: 200,
        body: JSON.stringify(snakeToCamel(updatedRemote))
      };
    } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
    }
  }
  // DELETE /remotes/:id
  if (event.httpMethod === 'DELETE' && idMatch) {
    try {
      await deleteRemote(idMatch[1]);
      return { statusCode: 204, body: '' };
    } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
    }
  }
  return { statusCode: 404, body: 'Not found' };
};
