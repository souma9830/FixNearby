export const validateCancellationReason = (req, res, next) => {
  const { cancellationReason, isLateCancellation } = req.body;

  if (!cancellationReason || typeof cancellationReason !== 'string' || cancellationReason.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: 'A valid cancellation reason (at least 5 chars) is required.',
    });
  }

  if (typeof isLateCancellation !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isLateCancellation flag must be a boolean.',
    });
  }

  next();
};
