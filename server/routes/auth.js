const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db/schema');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to validate input
const validateInput = (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password || password.length < 6) {
        return res.status(400).json({ message: 'Invalid input' });
    }
    next();
};

router.post('/login', validateInput, async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/register', validateInput, async (req, res) => {
    try {
        const { username, password } = req.body;
        const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try {
            stmt.run(username, hashedPassword);
            res.status(201).json({ message: 'User registered successfully' });
        } catch (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                res.status(400).json({ message: 'Username already exists' });
            } else {
                throw err;
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
