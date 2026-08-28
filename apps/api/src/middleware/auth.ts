import { Request, Response, NextFunction } from "express";
import { UserRole, User } from "../models/User.js";
import { verifyAccessToken, TokenPayload } from "../utils/tokens.js";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT Bearer token
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Missing or malformed Bearer token.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
      return;
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Access token expired. Please refresh your session.",
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Invalid or corrupted access token.",
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware generator
 * @param allowedRoles Array of roles authorized to access the route
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(
          ", "
        )}] role(s). Your role is '${req.user.role}'.`,
      });
      return;
    }

    next();
  };
};
