import express from 'express';
const router = express.Router();

// In-memory storage for logs (replace with DB in production)
let simulationLogs = [];

// POST /simulation_logs - insert a new log
router.post('/', (req, res) => {
  // Le body doit contenir : user_id, user_name, user_role, action, category, timestamp, details
  const log = { id: Date.now(), ...req.body };
  simulationLogs.push(log);
  res.status(201).json(log);
});

// GET /simulation_logs - get all logs
router.get('/', (req, res) => {
  res.json(simulationLogs);
});

export default router; 