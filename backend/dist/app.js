import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/error.middleware.js';
import { env } from './config/env.js';
import authRoutes from './modules/auth/auth.routes.js';
import taskRoutes from './modules/tasks/task.routes.js';
import projectRoutes from './modules/projects/project.routes.js';
import userRoutes from './modules/users/user.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
const app = express();
app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map