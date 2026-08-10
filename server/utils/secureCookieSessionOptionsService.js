export class SecureCookieSessionOptionsService {
  static getRefreshCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh'
    };
  }

  static clearRefreshCookie(res) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/api/auth/refresh'
    });
  }
}

export default SecureCookieSessionOptionsService;
