import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

const JWKS_URI = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;

const client = jwksRsa({
  jwksUri: JWKS_URI,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

async function getKey(header: any, callback: (err: any, key?: any) => void) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.getPublicKey();
    callback(err, signingKey);
  });
}

export function cognitoAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

  if (!token) {
    // No token provided, set user to null
    (req as any).user = null;
    return next();
  }

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: 'Token is invalid', error: err.message });
    }

    (req as any).accountId = decoded.sub;

    next();
  });
}
