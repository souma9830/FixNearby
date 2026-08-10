export const rotateRefreshToken = (token) => {
  if (!token) throw new Error('Token required');
  return { accessToken: 'new_access_token', refreshToken: 'new_refresh_token' };
};
