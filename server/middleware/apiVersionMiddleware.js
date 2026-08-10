import { logDeprecationUsage } from '../utils/deprecationNotifier.js';

/**
 * Extracts API version from URL path prefix (/api/v1/), X-API-Version header, or api_version query param.
 * Defaults to 'v1'. Sets req.apiVersion and adds X-API-Version response header.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
export const apiVersionMiddleware = (req, res, next) => {
  let version = 'v1'; // Default version

  // Check URL path prefix (e.g., /api/v1/...)
  const pathMatch = req.originalUrl.match(/^\/api\/(v\d+)\//);
  if (pathMatch) {
    version = pathMatch[1];
  } else if (req.headers['x-api-version']) {
    version = req.headers['x-api-version'];
  } else if (req.query.api_version) {
    version = req.query.api_version;
  }

  req.apiVersion = version;
  res.setHeader('X-API-Version', version);
  next();
};

/**
 * Returns middleware that adds Sunset and Deprecation headers with the sunset date,
 * and Link header pointing to the alternative endpoint. Also logs deprecation usage.
 *
 * @param {Date|string} sunsetDate - The date the endpoint will be sunset
 * @param {string} [alternativeEndpoint] - The alternative endpoint to use
 * @returns {import('express').RequestHandler} Express middleware function
 */
export const deprecationWarning = (sunsetDate, alternativeEndpoint) => {
  return (req, res, next) => {
    res.setHeader('Deprecation', 'true');
    const dateStr = new Date(sunsetDate).toUTCString();
    res.setHeader('Sunset', dateStr);

    if (alternativeEndpoint) {
      res.setHeader('Link', `<${alternativeEndpoint}>; rel="alternate"`);
    }

    logDeprecationUsage(req.originalUrl, req);
    next();
  };
};

/**
 * Returns middleware that rejects requests below the minimum version with 400 status.
 *
 * @param {string} minVersion - The minimum version required (e.g., 'v2')
 * @returns {import('express').RequestHandler} Express middleware function
 */
export const requireMinVersion = (minVersion) => {
  return (req, res, next) => {
    const currentVersionNum = parseInt(req.apiVersion.replace('v', ''), 10);
    const minVersionNum = parseInt(minVersion.replace('v', ''), 10);

    if (currentVersionNum < minVersionNum) {
      return res.status(400).json({
        success: false,
        message: `This endpoint requires API version ${minVersion} or higher.`
      });
    }

    next();
  };
};
