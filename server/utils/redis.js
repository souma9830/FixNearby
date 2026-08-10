import IORedis from 'ioredis';

let client = null;

function createClient() {
  if (client) return client;

  client = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: () => null,
  });

  client.on('error', () => {});

  return client;
}

export async function getRedis() {
  const c = createClient();
  if (c.status === 'ready') return c;

  try {
    await c.connect();
  } catch {
    return null;
  }

  return c.status === 'ready' ? c : null;
}

export function getRedisClient() {
  return createClient();
}
