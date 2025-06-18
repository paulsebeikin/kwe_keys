const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../db/schema');

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Apply authentication to all routes
router.use(authenticateToken);

router.get('/', (req, res) => {
    try {
        const remotes = db.prepare('SELECT * FROM remotes ORDER BY assigned_at DESC').all();
        res.json(remotes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/history/:unit', (req, res) => {
    try {
        const { unit } = req.params;
        const history = db.prepare('SELECT * FROM remote_history WHERE unit = ? ORDER BY created_at DESC').all(unit);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', (req, res) => {
    const { unit, remoteId } = req.body;
    
    if (!unit || !remoteId) {
        return res.status(400).json({ message: 'Unit and remoteId are required' });
    }
    
    try {
        db.prepare('INSERT INTO remotes (unit, remote_id, assigned_by) VALUES (?, ?, ?)').run(unit, remoteId, req.user.username);
        db.prepare('INSERT INTO remote_history (unit, remote_id, action, by) VALUES (?, ?, ?, ?)').run(unit, remoteId, 'assigned', req.user.username);
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
        const { unit } = req.body;
        const remote = db.prepare('SELECT * FROM remotes WHERE remote_id = ?').get(remoteId);
        
        if (remote) {
            db.prepare('INSERT INTO remote_history (unit, remote_id, action, by) VALUES (?, ?, ?, ?)').run(remote.unit, remoteId, 'unassigned', req.user.username);
            
            db.prepare('UPDATE remotes SET unit = ?, updated_at = ?, updated_by = ? WHERE remote_id = ?').run(unit, new Date().toISOString(), req.user.username, remoteId);
            
            db.prepare('INSERT INTO remote_history (unit, remote_id, action, by) VALUES (?, ?, ?, ?)').run(unit, remoteId, 'reassigned', req.user.username);
            
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
            db.prepare('INSERT INTO remote_history (unit, remote_id, action, by) VALUES (?, ?, ?, ?)').run(remote.unit, remoteId, 'deleted', req.user.username);
            
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
