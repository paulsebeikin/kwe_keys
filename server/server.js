const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { snakeToCamel } = require('./utils/caseConverter');
const authRoutes = require('./routes/auth');
const remoteRoutes = require('./routes/remotes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Add response transformation middleware
app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function(body) {
        return originalJson.call(this, snakeToCamel(body));
    };
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/remotes', remoteRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
