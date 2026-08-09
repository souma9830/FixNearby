/**
 * Express middleware to parse and validate pagination and sorting parameters from the query string.
 * It attaches a `pagination` object to the Request object.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
export const paginationMiddleware = (req, res, next) => {
  // Parse page
  let page = parseInt(req.query.page, 10);
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  // Parse limit
  let limit = parseInt(req.query.limit, 10);
  if (isNaN(limit) || limit < 1) {
    limit = 20;
  } else if (limit > 100) {
    limit = 100;
  }

  // Parse sort and order
  const sortField = req.query.sort || 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;
  
  const sort = { [sortField]: order };
  const skip = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    skip,
    sort
  };

  next();
};
