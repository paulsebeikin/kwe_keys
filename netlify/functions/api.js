import serverless from "serverless-http";
import express from "express";

const authRoutes = require('../../server/routes/auth');
const remoteRoutes = require('../../server/routes/remotes');
const unitRoutes = require('../../server/routes/units');

const api = express();

// Routes
api.use('/auth', authRoutes);
api.use('/remotes', remoteRoutes);
api.use('/units', unitRoutes);

export const handler = serverless(api);
