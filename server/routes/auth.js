const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { sql } = require('../db/schema');

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
        const result = await sql`SELECT * FROM users WHERE username = ${username}`;
        const user = result[0];
        
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                {
                    username,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            res.json({
                token,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
