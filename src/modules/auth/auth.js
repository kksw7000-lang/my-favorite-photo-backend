import { expressjwt } from 'express-jwt';

const verifyAccessToken = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  getToken: (req) => req.cookies?.accessToken,
  credentialsRequired: true,
});

const verifyRefreshToken = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  getToken: (req) => req.cookies?.refreshToken,
  credentialsRequired: true,
});

export default { verifyRefreshToken, verifyAccessToken };
