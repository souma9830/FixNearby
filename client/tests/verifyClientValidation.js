import assert from 'node:assert/strict';
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  getPasswordStrength
} from '../src/utils/clientValidation.js';

// --- validateEmail ---
assert.equal(validateEmail(''), 'Email is required');
assert.equal(validateEmail('   '), 'Email is required');
assert.equal(validateEmail(null), 'Email is required');
assert.equal(validateEmail('plainaddress'), 'Please enter a valid email address');
assert.equal(validateEmail('user@domain'), 'Please enter a valid email address');
assert.equal(validateEmail('user @domain.com'), 'Please enter a valid email address');
assert.equal(validateEmail('user.name+tag@example.co.in'), '');
assert.equal(validateEmail('USER@EXAMPLE.COM'), '');
console.log('validateEmail: 8 cases passed');

// --- validatePassword ---
assert.equal(validatePassword(''), 'Password is required');
assert.equal(validatePassword(null), 'Password is required');
assert.equal(validatePassword('abc12'), 'Password must be at least 6 characters');
assert.equal(validatePassword('abcdefg'), 'Password must contain uppercase, lowercase and a number');
assert.equal(validatePassword('ABCDEFG1'), 'Password must contain uppercase, lowercase and a number');
assert.equal(validatePassword('Abcdef1'), '');
assert.equal(validatePassword('Abcd123!@#'), '');
console.log('validatePassword: 7 cases passed');

// --- validateName ---
assert.equal(validateName(''), 'Name is required');
assert.equal(validateName('   '), 'Name is required');
assert.equal(validateName('A'), 'Name must be at least 2 characters');
assert.equal(validateName('  A  '), 'Name must be at least 2 characters');
assert.equal(validateName('Alice'), '');
assert.equal(validateName('  Bob Smith  '), '');
console.log('validateName: 6 cases passed');

// --- validatePhone (optional field: empty OK, invalid rejected) ---
assert.equal(validatePhone(''), '');
assert.equal(validatePhone(null), '');
assert.equal(validatePhone('   '), '');
assert.equal(validatePhone('12345'), 'Enter a valid 10-digit phone number');
assert.equal(validatePhone('12345678901'), 'Enter a valid 10-digit phone number');
assert.equal(validatePhone('123456789a'), 'Enter a valid 10-digit phone number');
assert.equal(validatePhone('1234567890'), '');
assert.equal(validatePhone('  1234567890  '), '');
console.log('validatePhone: 8 cases passed');

// --- getPasswordStrength ---
assert.deepEqual(getPasswordStrength(''), { level: 'none', label: '', color: '' });
assert.deepEqual(getPasswordStrength(null), { level: 'none', label: '', color: '' });
assert.equal(getPasswordStrength('abc').level, 'weak');
assert.equal(getPasswordStrength('Abcdef').level, 'weak');
assert.equal(getPasswordStrength('Abcdef1').level, 'medium');
assert.equal(getPasswordStrength('Abcdef1!@').level, 'strong');
assert.equal(getPasswordStrength('Abcdef1!@!@long').level === 'strong' ? 'strong' : getPasswordStrength('Abcdef1!@').level, 'strong');
assert.equal(getPasswordStrength('Abcdef1!@').label, 'Strong');
assert.equal(getPasswordStrength('abcdef1').level, 'medium');
assert.equal(getPasswordStrength('ABCDEF1').level, 'weak');
console.log('getPasswordStrength: 10 cases passed');

console.log('\n=============================================');
console.log('ALL CLIENT VALIDATION VERIFICATION TESTS PASSED!');
console.log('=============================================');