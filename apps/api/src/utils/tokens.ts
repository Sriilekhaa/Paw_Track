import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserRole } from "../models/User.js";

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "paw_track_fallback_access_secret_2026!";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "paw_track_fallback_refresh_secret_2026!";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (payload: { id: string }): string => {
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    }
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
};

// Fast and secure cryptographic hash for refresh token storage in DB
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
