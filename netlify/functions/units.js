const { snakeToCamel } = require('../../server/utils/caseConverter');
const {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit
} = require('../../server/controllers/unitsController');

exports.handler = async function(event, context) {
  const idMatch = event.path.match(/\/units\/(\d+)/);
  // GET /units
  if (event.httpMethod === 'GET' && !idMatch) {
    try {
      const units = await getAllUnits();
      return {
        statusCode: 200,
        body: JSON.stringify(snakeToCamel(units))
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }
  // GET /units/:id
  if (event.httpMethod === 'GET' && idMatch) {
    try {
      const unit = await getUnitById(idMatch[1]);
      if (!unit) return { statusCode: 404, body: 'Not found' };
      return {
        statusCode: 200,
        body: JSON.stringify(snakeToCamel(unit))
      };
    } catch (err) {
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }
  // POST /units
  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body);
      const newUnit = await createUnit(data);
      return {
        statusCode: 201,
        body: JSON.stringify(snakeToCamel(newUnit))
      };
    } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
    }
  }
  // PUT /units/:id
  if (event.httpMethod === 'PUT' && idMatch) {
    try {
      const data = JSON.parse(event.body);
      const updatedUnit = await updateUnit(idMatch[1], data);
      return {
        statusCode: 200,
        body: JSON.stringify(snakeToCamel(updatedUnit))
      };
    } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
    }
  }
  // DELETE /units/:id
  if (event.httpMethod === 'DELETE' && idMatch) {
    try {
      await deleteUnit(idMatch[1]);
      return { statusCode: 204, body: '' };
    } catch (err) {
      return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
    }
  }
  return { statusCode: 404, body: 'Not found' };
};
