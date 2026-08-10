/**
 * Utility class for building and executing Mongoose queries.
 */
class QueryBuilder {
  /**
   * Default projections for various models to exclude sensitive/unnecessary data.
   * @type {Object.<string, string>}
   */
  static DEFAULT_PROJECTIONS = {
    User: '-password -resetPasswordToken -resetPasswordExpire -passwordChangedAt',
    Worker: '-password -resetPasswordToken -resetPasswordExpire -passwordChangedAt -blockedSlots',
    Booking: '-statusHistory'
  };

  /**
   * Initialize a new QueryBuilder instance.
   * @param {Object} model - The Mongoose model to query.
   */
  constructor(model) {
    this.model = model;
    this.query = null;
    this.filter = {};
    this.isPaginated = false;
    this.paginationOptions = null;
  }

  /**
   * Set the filter criteria for the query.
   * @param {Object} filter - The filter object.
   * @returns {QueryBuilder} The current QueryBuilder instance for chaining.
   */
  find(filter = {}) {
    this.filter = filter;
    this.query = this.model.find(filter);
    
    // Apply default projections if applicable
    if (this.model && this.model.modelName && QueryBuilder.DEFAULT_PROJECTIONS[this.model.modelName]) {
      this.query = this.query.select(QueryBuilder.DEFAULT_PROJECTIONS[this.model.modelName]);
    }
    
    return this;
  }

  /**
   * Specify fields to select or exclude in the results.
   * @param {string|Object} fields - Fields to select.
   * @returns {QueryBuilder} The current QueryBuilder instance for chaining.
   */
  select(fields) {
    if (this.query) {
      this.query = this.query.select(fields);
    }
    return this;
  }

  /**
   * Enable lean mode for the query, returning plain JS objects instead of Mongoose documents.
   * @returns {QueryBuilder} The current QueryBuilder instance for chaining.
   */
  lean() {
    if (this.query) {
      this.query = this.query.lean();
    }
    return this;
  }

  /**
   * Set the sorting order for the query results.
   * @param {Object|string} sortObj - The sort configuration.
   * @returns {QueryBuilder} The current QueryBuilder instance for chaining.
   */
  sort(sortObj) {
    if (this.query && sortObj) {
      this.query = this.query.sort(sortObj);
    }
    return this;
  }

  /**
   * Configure pagination for the query.
   * @param {number} page - The page number (1-indexed).
   * @param {number} limit - The number of results per page.
   * @returns {QueryBuilder} The current QueryBuilder instance for chaining.
   */
  paginate(page = 1, limit = 20) {
    this.isPaginated = true;
    this.paginationOptions = {
      page: Math.max(1, parseInt(page, 10)),
      limit: Math.max(1, parseInt(limit, 10))
    };
    
    const skip = (this.paginationOptions.page - 1) * this.paginationOptions.limit;
    
    if (this.query) {
      this.query = this.query.skip(skip).limit(this.paginationOptions.limit);
    }
    
    return this;
  }

  /**
   * Specify references to populate in the results.
   * @param {Object|string|Array} popConfig - The population configuration.
   * @returns {QueryBuilder} The current QueryBuilder instance for chaining.
   */
  populate(popConfig) {
    if (this.query && popConfig) {
      this.query = this.query.populate(popConfig);
    }
    return this;
  }

  /**
   * Execute the query and return the results.
   * @returns {Promise<Object|Array>} The query results, optionally wrapped in a pagination object.
   */
  async exec() {
    if (!this.query) {
      this.query = this.model.find(this.filter);
    }

    if (this.isPaginated) {
      const { page, limit } = this.paginationOptions;
      
      const [data, total] = await Promise.all([
        this.query.exec(),
        this.model.countDocuments(this.filter)
      ]);
      
      const totalPages = Math.ceil(total / limit);
      
      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    }
    
    return await this.query.exec();
  }
}

export default QueryBuilder;
