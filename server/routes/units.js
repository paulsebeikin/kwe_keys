const express = require('express');
const router = express.Router();
const db = require('../db/schema');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', (req, res) => {
    try {
        const units = db.prepare('SELECT * FROM units ORDER BY unit_number').all();
        res.json(units);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', (req, res) => {
    const { unitNumber, owner } = req.body;
    
    if (!unitNumber || !owner) {
        return res.status(400).json({ message: 'Unit number and owner are required' });
    }
    
    try {
        db.prepare('INSERT INTO units (unit_number, owner) VALUES (?, ?)')
          .run(parseInt(unitNumber), owner);
        res.status(201).json({ message: 'Unit created successfully' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            res.status(400).json({ message: 'Unit number already exists' });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
});

router.put('/:unitNumber', (req, res) => {
    try {
        const unitNumber = parseInt(req.params.unitNumber);
        const { owner } = req.body;
        
        const result = db.prepare('UPDATE units SET owner = ?, updated_at = ? WHERE unit_number = ?')
          .run(owner, new Date().toISOString(), unitNumber);
        
        if (result.changes > 0) {
            res.json({ message: 'Unit updated successfully' });
        } else {
            res.status(404).json({ message: 'Unit not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:unitNumber', (req, res) => {
    try {
        const unitNumber = parseInt(req.params.unitNumber);
        const result = db.prepare('DELETE FROM units WHERE unit_number = ?').run(unitNumber);
        
        if (result.changes > 0) {
            res.json({ message: 'Unit deleted successfully' });
        } else {
            res.status(404).json({ message: 'Unit not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
