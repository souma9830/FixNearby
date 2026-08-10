export class ExpressPayloadSchemaValidator {
  static validate(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Payload validation error',
          details: error.details.map(d => d.message)
        });
      }
      next();
    };
  }
}

export default ExpressPayloadSchemaValidator;
