const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Something went wrong. Please try again later.',
  DEFAULT: 'An unexpected error occurred.',
};

const getHttpErrorMessage = (status) => {
  if (status >= 500) return ERROR_MESSAGES.SERVER;
  if (status === 401) return ERROR_MESSAGES.UNAUTHORIZED;
  if (status === 403) return ERROR_MESSAGES.FORBIDDEN;
  if (status === 404) return ERROR_MESSAGES.NOT_FOUND;
  if (status === 422 || status === 400) return ERROR_MESSAGES.VALIDATION;
  return null;
};

export const parseApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    return {
      message: data?.message || data?.error || getHttpErrorMessage(status) || ERROR_MESSAGES.DEFAULT,
      status,
      errors: data?.errors || data?.details || null,
    };
  }

  if (error.request) {
    if (error.code === 'ECONNABORTED') {
      return { message: ERROR_MESSAGES.TIMEOUT, status: 0 };
    }
    return { message: ERROR_MESSAGES.NETWORK, status: 0 };
  }

  return { message: error.message || ERROR_MESSAGES.DEFAULT, status: 0 };
};

export const showApiError = (error, showToast) => {
  const { message: message, errors: errors } = parseApiError(error);

  if (errors && Array.isArray(errors)) {
    errors.forEach((err) => {
      showToast(err.msg || err.message || err, 'error');
    });
    return;
  }

  if (errors && typeof errors === 'object') {
    const firstKey = Object.keys(errors)[0];
    const msg = errors[firstKey]?.msg || errors[firstKey]?.message || errors[firstKey];
    showToast(msg || message, 'error');
    return;
  }

  showToast(message, 'error');
};

export const getFieldError = (error, field) => {
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    const fieldErr = error.response.data.errors.find(
      (e) => e.path === field || e.field === field || e.param === field
    );
    return fieldErr?.msg || fieldErr?.message || null;
  }

  if (error?.response?.data?.errors?.[field]) {
    return error.response.data.errors[field]?.msg || error.response.data.errors[field] || null;
  }

  return null;
};

export default parseApiError;
