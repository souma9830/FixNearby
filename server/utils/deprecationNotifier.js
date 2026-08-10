/**
 * In-memory store for deprecated routes.
 * @type {Map<string, { sunsetDate: Date, message: string }>}
 */
const deprecatedRoutes = new Map();

/**
 * Logs deprecation and stores in an in-memory Map
 *
 * @param {string} routeName - Name or path of the route
 * @param {Date|string} sunsetDate - Date when the route will be sunset
 * @param {string} message - Deprecation message
 */
export const markDeprecated = (routeName, sunsetDate, message) => {
  console.warn(`[DEPRECATION] Route ${routeName} is deprecated and will be removed on ${sunsetDate}. ${message}`);
  deprecatedRoutes.set(routeName, { sunsetDate: new Date(sunsetDate), message });
};

/**
 * Returns array of all deprecated routes with their sunset dates
 *
 * @returns {Array<{ routeName: string, sunsetDate: Date, message: string }>} List of deprecated routes
 */
export const getDeprecatedRoutes = () => {
  return Array.from(deprecatedRoutes.entries()).map(([routeName, details]) => ({
    routeName,
    sunsetDate: details.sunsetDate,
    message: details.message
  }));
};

/**
 * Returns boolean indicating if a route is deprecated
 *
 * @param {string} routeName - Name or path of the route
 * @returns {boolean} True if deprecated
 */
export const isDeprecated = (routeName) => {
  return deprecatedRoutes.has(routeName);
};

/**
 * Logs usage of deprecated routes with timestamp and IP
 *
 * @param {string} routeName - Name or path of the route
 * @param {import('express').Request} req - Express request object
 */
export const logDeprecationUsage = (routeName, req) => {
  const ip = req.ip || req.connection?.remoteAddress || 'Unknown IP';
  const timestamp = new Date().toISOString();
  console.warn(`[DEPRECATED ROUTE USAGE] ${timestamp} - Route: ${routeName}, IP: ${ip}, User-Agent: ${req.get('user-agent')}`);
};
