import helmet from 'helmet';

export class HardenedCorsHelmetConfigService {
  static getCorsOptions() {
    const whitelist = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(',');
    return {
      origin: (origin, callback) => {
        if (!origin || whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('CORS Access Violation: Domain origin blocked'));
        }
      },
      credentials: true
    };
  }

  static getHelmetOptions() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          objectSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false
    });
  }
}

export default HardenedCorsHelmetConfigService;
