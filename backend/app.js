import express from 'express';
import cors from 'cors';
import containersRoutes from './routes/containers.js';
import equipmentRoutes from './routes/equipment.js';
import metricsRoutes from './routes/metrics.js';
import resourceUsageRoutes from './routes/resource_usage.js';
import usersRoutes from './routes/users.js';
import vesselsRoutes from './routes/vessels.js';
import weatherConditionsRoutes from './routes/weather_conditions.js';
import weatherRoutes from './routes/weather.js';
import portStatusRoutes from './routes/port_status.js';
import teamRoutes from './routes/team.js';
import simulationLogsRoutes from './routes/simulation_logs.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/containers', containersRoutes);
app.use('/equipment', equipmentRoutes);
app.use('/metrics', metricsRoutes);
app.use('/resource_usage', resourceUsageRoutes);
app.use('/users', usersRoutes);
app.use('/api/users', usersRoutes);
app.use('/vessels', vesselsRoutes);
app.use('/weather_conditions', weatherConditionsRoutes);
app.use('/weather', weatherRoutes);
app.use('/port_status', portStatusRoutes);
app.use('/team', teamRoutes);
app.use('/simulation_logs', simulationLogsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 