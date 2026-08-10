import IdempotencyKey from '../models/IdempotencyKey.js';

/**
 * Middleware to enforce idempotency on state-mutating requests (POST, PATCH, PUT, DELETE)
 * using the Idempotency-Key header.
 */
export const useIdempotency = async (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];

  // Skip idempotency for requests without the header or for non-mutation methods
  if (!idempotencyKey || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  // Idempotency keys are user-scoped to prevent collisions between different accounts
  const userId = req.user?._id;
  if (!userId) {
    return next();
  }

  try {
    let record;
    let wasCreated = false;
    try {
      // Attempt to acquire an idempotency lease/lock by creating a database record
      record = await IdempotencyKey.create({
        key: idempotencyKey,
        userId,
        status: 'processing'
      });
      wasCreated = true;
    } catch (err) {
      if (err.code === 11000) {
        // Record already exists for this user-key combo. Load the existing session.
        record = await IdempotencyKey.findOne({ key: idempotencyKey, userId });
      } else {
        throw err;
      }
    }

    if (!record) {
      return res.status(500).json({
        success: false,
        message: 'Idempotency record creation failed.'
      });
    }

    if (!wasCreated) {
      // 1. Request is currently being processed by another thread
      if (record.status === 'processing') {
        return res.status(409).json({
          success: false,
          message: 'A duplicate request with this Idempotency-Key is already in progress.'
        });
      }

      // 2. Request was already completed previously. Return cached status and response body.
      if (record.status === 'resolved') {
        return res.status(record.responseStatus).json(record.responseBody);
      }
    }

    // Intercept outbound JSON and string payloads to cache them in the database
    const originalSend = res.send;
    const originalJson = res.json;

    res.json = function (body) {
      // Restore standard Express responders
      res.send = originalSend;
      res.json = originalJson;

      // Persist status and output body
      IdempotencyKey.findOneAndUpdate(
        { key: idempotencyKey, userId },
        {
          status: 'resolved',
          responseStatus: res.statusCode,
          responseBody: body
        }
      ).catch(err => console.error('[Idempotency] Failed to resolve json cache:', err.message));

      return originalJson.call(this, body);
    };

    res.send = function (body) {
      res.send = originalSend;
      res.json = originalJson;

      let responseBody = body;
      try {
        responseBody = JSON.parse(body);
      } catch (e) {
        // Body is not valid JSON, store as raw string
      }

      IdempotencyKey.findOneAndUpdate(
        { key: idempotencyKey, userId },
        {
          status: 'resolved',
          responseStatus: res.statusCode,
          responseBody
        }
      ).catch(err => console.error('[Idempotency] Failed to resolve send cache:', err.message));

      return originalSend.call(this, body);
    };

    next();
  } catch (error) {
    console.error('[Idempotency] Middleware Error:', error);
    next(error);
  }
};
