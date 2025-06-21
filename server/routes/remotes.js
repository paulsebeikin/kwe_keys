const express = require('express');
const router = express.Router();
const { sql } = require('../db/schema');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (_, res) => {
    try {
        const result = await sql`SELECT * FROM remotes ORDER BY assigned_at DESC`;
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/history/:unitNumber', async (req, res) => {
    try {
        const { unitNumber } = req.params;
        const result = await sql`SELECT * FROM remote_history WHERE unit_number = ${parseInt(unitNumber)} ORDER BY created_at DESC`;
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    const { unitNumber, remoteId, entranceId, exitId } = req.body;
    
    if (!unitNumber || !remoteId) {
        return res.status(400).json({ message: 'Unit number and remoteId are required' });
    }
    
    try {
        await sql`INSERT INTO remotes (unit_number, remote_id, entrance_id, exit_id, assigned_by) VALUES (${parseInt(unitNumber)}, ${remoteId}, ${entranceId || null}, ${exitId || null}, ${req.user.username})`;
        await sql`INSERT INTO remote_history (unit_number, remote_id, action, by) VALUES (${parseInt(unitNumber)}, ${remoteId}, 'assigned', ${req.user.username})`;
        res.status(201).json({ message: 'Remote assigned successfully' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            res.status(400).json({ message: 'Remote ID already exists' });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
});

router.put('/:remoteId', async (req, res) => {
    try {
        const { remoteId } = req.params;
        const { unitNumber } = req.body;
        const result = await sql`SELECT * FROM remotes WHERE remote_id = ${remoteId}`;
        const remote = result[0];
        
        if (remote) {
            await sql`INSERT INTO remote_history (unit_number, remote_id, action, by) VALUES (${remote.unit_number}, ${remoteId}, 'unassigned', ${req.user.username})`;
            
            await sql`UPDATE remotes SET unit_number = ${parseInt(unitNumber)}, updated_at = ${new Date().toISOString()}, updated_by = ${req.user.username} WHERE remote_id = ${remoteId}`;
            
            await sql`INSERT INTO remote_history (unit_number, remote_id, action, by) VALUES (${parseInt(unitNumber)}, ${remoteId}, 'reassigned', ${req.user.username})`;
            
            res.json({ message: 'Remote updated successfully' });
        } else {
            res.status(404).json({ message: 'Remote not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:remoteId', async (req, res) => {
    try {
        const { remoteId } = req.params;
        const result = await sql`SELECT * FROM remotes WHERE remote_id = ${remoteId}`;
        const remote = result[0];
        
        if (remote) {
            await sql`INSERT INTO remote_history (unit_number, remote_id, action, by) VALUES (${remote.unit_number}, ${remoteId}, 'deleted', ${req.user.username})`;
            
            await sql`DELETE FROM remotes WHERE remote_id = ${remoteId}`;
            res.json({ message: 'Remote deleted successfully' });
        } else {
            res.status(404).json({ message: 'Remote not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
