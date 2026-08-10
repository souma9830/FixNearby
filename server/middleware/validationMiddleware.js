/**
 * Input validation and sanitization middleware for authentication routes.
 */

/**
 * Strong-password policy regex.
 *
 * Requirements (mirrors the client-side usePasswordStrength hook so that
 * frontend hints and backend enforcement stay in sync):
 *  - At least 8 characters
 *  - At least one uppercase letter  [A-Z]
 *  - At least one lowercase letter  [a-z]
 *  - At least one digit             [0-9]
 *  - At least one special character [!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]
 *
 * Rationale: NIST SP 800-63B and OWASP ASVS 2.1 both recommend strength-
 * based password policies over simple length limits.  A 6-character minimum
 * with no composition rules is trivially brute-forced offline even with
 * bcrypt at cost 10.
 */
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).{8,}$/;

const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 8 characters and include an uppercase letter, ' +
  'a lowercase letter, a digit, and a special character.';

export const validateRegistration = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name is required and must be at least 2 characters.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required.' });
  }

  if (!STRONG_PASSWORD_REGEX.test(password)) {
    return res.status(400).json({ error: PASSWORD_POLICY_MESSAGE });
  }

  if (phone !== undefined && phone !== '') {
    if (typeof phone !== 'string' || !/^\d{10}$/.test(phone.trim())) {
      return res.status(400).json({
        error: 'Phone number must contain exactly 10 digits.',
      });
    }
  }

  next();
};


export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    return res.status(400).json({ error: 'Password is required.' });
  }

  next();
};
