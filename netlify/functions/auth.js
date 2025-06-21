const { snakeToCamel } = require('../../server/utils/caseConverter');
const { login, register } = require('../../server/controllers/authController');

exports.handler = async function(event, context) {
  // Handle POST /auth/login
  if (event.httpMethod === 'POST' && event.path.endsWith('/auth/login')) {
    try {
      const data = JSON.parse(event.body);
      const result = await login(data);
      return {
        statusCode: 200,
        body: JSON.stringify(snakeToCamel(result))
      };
    } catch (err) {
      return { statusCode: 401, body: JSON.stringify({ error: err.message }) };
    }
  }
  // Handle POST /auth/register
  if (event.httpMethod === 'POST' && event.path.endsWith('/auth/register')) {
    try {
      const data = JSON.parse(event.body);
      const result = await register(data);
      return {
        statusCode: 201,
        body: JSON.stringify(snakeToCamel(result))
      };
    } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
    }
  }
  // ...add other auth endpoints as needed...
  return { statusCode: 404, body: 'Not found' };
};
