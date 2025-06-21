const express = require('express');
const router = express.Router();
const { sql } = require('../db/schema');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const result = await sql`SELECT * FROM units ORDER BY unit_number`;
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', async (req, res) => {
    const { unitNumber, owner } = req.body;
    
    if (!unitNumber || !owner) {
        return res.status(400).json({ message: 'Unit number and owner are required' });
    }
    
    try {
        await sql`INSERT INTO units (unit_number, owner) VALUES (${parseInt(unitNumber)}, ${owner})`;
        res.status(201).json({ message: 'Unit created successfully' });
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ message: 'Unit number already exists' });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
});

router.put('/:unitNumber', async (req, res) => {
    try {
        const unitNumber = parseInt(req.params.unitNumber);
        const { owner } = req.body;
        
        const result = await sql`UPDATE units SET owner = ${owner}, updated_at = NOW() WHERE unit_number = ${unitNumber}`;
        
        if (result.length > 0) {
            res.json({ message: 'Unit updated successfully' });
        } else {
            res.status(404).json({ message: 'Unit not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:unitNumber', async (req, res) => {
    try {
        const unitNumber = parseInt(req.params.unitNumber);
        const result = await sql`DELETE FROM units WHERE unit_number = ${unitNumber}`;
        
        if (result.length > 0) {
            res.json({ message: 'Unit deleted successfully' });
        } else {
            res.status(404).json({ message: 'Unit not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
