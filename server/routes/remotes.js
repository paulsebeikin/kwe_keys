const express = require('express');
const router = express.Router();
const db = require('../db/schema');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', (req, res) => {
    try {
        const remotes = db.prepare('SELECT * FROM remotes ORDER BY assigned_at DESC').all();
        res.json(remotes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/history/:unitNumber', (req, res) => {
    try {
        const { unitNumber } = req.params;
        const history = db.prepare('SELECT * FROM remote_history WHERE unit_number = ? ORDER BY created_at DESC').all(parseInt(unitNumber));
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', (req, res) => {
    const { unitNumber, remoteId, entranceId, exitId } = req.body;
    
    if (!unitNumber || !remoteId) {
        return res.status(400).json({ message: 'Unit number and remoteId are required' });
    }
    
    try {
        db.prepare('INSERT INTO remotes (unit_number, remote_id, entrance_id, exit_id, assigned_by) VALUES (?, ?, ?, ?, ?)')
          .run(parseInt(unitNumber), remoteId, entranceId || null, exitId || null, req.user.username);
        db.prepare('INSERT INTO remote_history (unit_number, remote_id, action, by) VALUES (?, ?, ?, ?)')
          .run(parseInt(unitNumber), remoteId, 'assigned', req.user.username);
        res.status(201).json({ message: 'Remote assigned successfully' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            res.status(400).json({ message: 'Remote ID already exists' });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
});

router.put('/:remoteId', (req, res) => {
    try {
        const { remoteId } = req.params;
        const { unitNumber } = req.body;
        const remote = db.prepare('SELECT * FROM remotes WHERE remote_id = ?').get(remoteId);
        
        if (remote) {
            db.prepare('INSERT INTO remote_history (unit_number, remote_id, action, by) VALUES (?, ?, ?, ?)')
              .run(remote.unit_number, remoteId, 'unassigned', req.user.username);
            
            db.prepare('UPDATE remotes SET unit_number = ?, updated_at = ?, updated_by = ? WHERE remote_id = ?')
              .run(parseInt(unitNumber), new Date().toISOString(), req.user.username, remoteId);
            
            db.prepare('INSERT INTO remote_history (unit_number, remote_id, action, by) VALUES (?, ?, ?, ?)')
              .run(parseInt(unitNumber), remoteId, 'reassigned', req.user.username);
            
            res.json({ message: 'Remote updated successfully' });
        } else {
            res.status(404).json({ message: 'Remote not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:remoteId', (req, res) => {
    try {
        const { remoteId } = req.params;
        const remote = db.prepare('SELECT * FROM remotes WHERE remote_id = ?').get(remoteId);
        
        if (remote) {
            db.prepare('INSERT INTO remote_history (unit_number, remote_id, action, by) VALUES (?, ?, ?, ?)')
              .run(remote.unit_number, remoteId, 'deleted', req.user.username);
            
            db.prepare('DELETE FROM remotes WHERE remote_id = ?').run(remoteId);
            res.json({ message: 'Remote deleted successfully' });
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
        const remote = await Remote.findOne({ remoteId });
        
        if (remote) {
            await History.create({
                unit: remote.unit,
                remoteId,
                action: 'deleted',
                by: req.user.username
            });
            
            await Remote.deleteOne({ remoteId });
            res.json({ message: 'Remote deleted successfully' });
        } else {
            res.status(404).json({ message: 'Remote not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
