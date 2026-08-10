import mongoose from 'mongoose';

const mongoStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

export const createHealthHandlers = ({
  connection = mongoose.connection,
  startedAt = Date.now(),
} = {}) => {
  const live = (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'fixnearby-api',
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
    });
  };

  const ready = (req, res) => {
    const databaseState = mongoStates[connection.readyState] || 'unknown';
    const isReady = connection.readyState === 1;

    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'not_ready',
      dependencies: {
        mongodb: databaseState,
      },
      timestamp: new Date().toISOString(),
    });
  };

  return { live, ready };
};

export const healthHandlers = createHealthHandlers();
