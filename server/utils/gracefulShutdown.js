import mongoose from 'mongoose';

export const createGracefulShutdown = ({
  server,
  closeDatabase = () => mongoose.connection.close(),
  exit = (code) => process.exit(code),
  logger = console,
  timeoutMs = 10000,
}) => {
  let shutdownPromise;

  return (signal) => {
    if (shutdownPromise) return shutdownPromise;

    shutdownPromise = new Promise((resolve) => {
      logger.info(`Received ${signal}; starting graceful shutdown`);

      const forceTimer = setTimeout(() => {
        logger.error('Graceful shutdown timed out; forcing exit');
        exit(1);
        resolve(1);
      }, timeoutMs);
      forceTimer.unref?.();

      server.close(async (serverError) => {
        let exitCode = serverError ? 1 : 0;
        if (serverError) logger.error('HTTP server failed to close cleanly', serverError);

        try {
          await closeDatabase();
        } catch (databaseError) {
          exitCode = 1;
          logger.error('MongoDB connection failed to close cleanly', databaseError);
        }

        clearTimeout(forceTimer);
        logger.info('Graceful shutdown complete');
        exit(exitCode);
        resolve(exitCode);
      });
    });

    return shutdownPromise;
  };
};
