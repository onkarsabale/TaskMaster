import { createServer } from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './config/socket.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
    await connectDB();

    const httpServer = createServer(app);
    const io = initSocket(httpServer);
    // Share io instance globally or via middleware if needed
    app.set('io', io);

    httpServer.listen(env.PORT, () => {
        logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
};

startServer();
