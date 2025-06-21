import serverless from "serverless-http";
import express from "express";

const authRoutes = require('../../routes/auth');
const remoteRoutes = require('../../routes/remotes');
const unitRoutes = require('../../routes/units');

const api = express();

// Routes
api.use('/auth', authRoutes);
api.use('/remotes', remoteRoutes);
api.use('/units', unitRoutes);

export const handler = serverless(api);
