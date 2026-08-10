/**
 * Request validation middleware and schema factory
 */

/**
 * Creates a schema validation object
 * @param {Object} rules - The validation rules per field
 * @returns {Object} Object with a validate method
 */
export const createSchema = (rules) => {
  return {
    validate: (data) => {
      const errors = [];
      const actualData = data || {};
      
      for (const [field, rule] of Object.entries(rules)) {
        const value = actualData[field];
        
        // Required check
        if (rule.required && (value === undefined || value === null || value === '')) {
          errors.push({ field, message: `${field} is required` });
          continue;
        }

        if (value !== undefined && value !== null && value !== '') {
          // Type check
          if (rule.type) {
            if (rule.type === 'array' && !Array.isArray(value)) {
              errors.push({ field, message: `${field} must be an array` });
            } else if (rule.type !== 'array' && typeof value !== rule.type) {
              errors.push({ field, message: `${field} must be of type ${rule.type}` });
            }
          }
          
          // String checks
          if (typeof value === 'string') {
            if (rule.minLength && value.length < rule.minLength) {
              errors.push({ field, message: `${field} must be at least ${rule.minLength} characters long` });
            }
            if (rule.maxLength && value.length > rule.maxLength) {
              errors.push({ field, message: `${field} must be at most ${rule.maxLength} characters long` });
            }
            if (rule.pattern && !rule.pattern.test(value)) {
              errors.push({ field, message: `${field} format is invalid` });
            }
          }
          
          // Number checks
          if (typeof value === 'number') {
            if (rule.min !== undefined && value < rule.min) {
              errors.push({ field, message: `${field} must be at least ${rule.min}` });
            }
            if (rule.max !== undefined && value > rule.max) {
              errors.push({ field, message: `${field} must be at most ${rule.max}` });
            }
          }
          
          // Enum check
          if (rule.enum && !rule.enum.includes(value)) {
            errors.push({ field, message: `${field} must be one of: ${rule.enum.join(', ')}` });
          }
          
          // Custom check
          if (rule.custom) {
            const customResult = rule.custom(value);
            if (customResult !== true) {
              errors.push({ field, message: customResult || `${field} is invalid` });
            }
          }
        }
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    }
  };
};

/**
 * Express middleware to validate request based on provided schema
 * @param {Object} schema - Object containing body, params, and/or query schema objects
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const allErrors = [];

    ['body', 'params', 'query'].forEach(source => {
      if (schema[source]) {
        const result = schema[source].validate(req[source]);
        if (!result.valid) {
          allErrors.push(...result.errors.map(err => ({ ...err, source })));
        }
      }
    });

    if (allErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: allErrors
      });
    }

    next();
  };
};
