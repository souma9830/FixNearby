import dotenv from 'dotenv';
dotenv.config();

const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT'
];

/**
 * Validates that all required environment variables are set.
 * Throws a fatal error and terminates the process if any are missing.
 */
export const validateEnv = () => {
  const missing = [];

  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error('========================================================================');
    console.error('FATAL SYSTEM STARTUP ERROR: Missing Required Environment Configuration');
    console.error('========================================================================');
    for (const name of missing) {
      console.error(`  [MISSING]: ${name} is not defined in the environment.`);
    }
    console.error('------------------------------------------------------------------------');
    console.error('Solution: Create a '.env' file in your server directory and set the values.');
    console.error('Refer to '.env.example' for configuration templates.');
    console.error('========================================================================');
    process.exit(1);
  } else {
    // Basic verification of MONGODB_URI format
    const uri = process.env.MONGODB_URI;
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      console.warn('⚠️  Warning: MONGODB_URI does not appear to be a valid MongoDB connection string format.');
    }
    console.log('✔ Server configuration variables validated successfully.');
  }
};
