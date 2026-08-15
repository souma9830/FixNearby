const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const PHONE_REGEX = /^[0-9]{10}$/;

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validatePassword = (password) => {
  if (!password || !password.trim()) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (!PASSWORD_REGEX.test(password)) return 'Password must contain uppercase, lowercase and a number';
  return '';
};

export const validateName = (name) => {
  if (!name || !name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return '';
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return '';
  if (!PHONE_REGEX.test(phone.trim())) return 'Enter a valid 10-digit phone number';
  return '';
};

export const isValidCoordinates = (lat, lng) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const getPasswordStrength = (password) => {
  if (!password) return { level: 'none', label: '', color: '' };
  if (password.length < 6) return { level: 'weak', label: 'Weak', color: 'text-red-500 bg-red-500 w-1/3' };
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
  const mediumRegex = /^(?=.*[a-z])(?=.*[0-9])/;
  if (strongRegex.test(password) && password.length >= 8) return { level: 'strong', label: 'Strong', color: 'text-green-600 bg-green-500 w-full' };
  if (mediumRegex.test(password) && password.length >= 6) return { level: 'medium', label: 'Medium', color: 'text-orange-500 bg-orange-400 w-2/3' };
  return { level: 'weak', label: 'Weak', color: 'text-red-500 bg-red-500 w-1/3' };
};
