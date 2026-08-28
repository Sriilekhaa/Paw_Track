import { Request, Response } from "express";
import { User, UserRole } from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../utils/tokens.js";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["citizen", "field_worker", "admin"]).default("citizen"),
  organization: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email, password, role, organization } = parseResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
      return;
    }

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role as UserRole,
      organization,
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ id: user._id.toString() });

    // Store hashed refresh token for rotation and revocation
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          createdAt: user.createdAt,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: "15m",
        },
      },
    });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration.",
    });
  }
};

/**
 * Login existing user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parseResult.data;

    // Find user with password selected
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password +refreshToken"
    );

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({ id: user._id.toString() });

    // Store hashed refresh token in database (replacing any existing one)
    user.refreshToken = hashToken(refreshToken);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          createdAt: user.createdAt,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: "15m",
        },
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login.",
    });
  }
};

/**
 * Refresh access token & rotate refresh token
 * POST /api/auth/refresh
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = refreshSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Refresh token is required.",
      });
      return;
    }

    const { refreshToken } = parseResult.data;

    // Verify cryptographic signature of the refresh token
    let payload: { id: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token. Please log in again.",
      });
      return;
    }

    // Lookup user in DB with stored hashed refresh token
    const user = await User.findById(payload.id).select("+refreshToken");
    if (!user || !user.refreshToken) {
      res.status(401).json({
        success: false,
        message: "Session expired or revoked. Please log in again.",
      });
      return;
    }

    // Verify token hash against DB record
    const providedHash = hashToken(refreshToken);
    if (user.refreshToken !== providedHash) {
      // Possible token theft or reuse: invalidate stored token immediately
      user.refreshToken = null;
      await user.save();

      res.status(403).json({
        success: false,
        message:
          "Refresh token reuse detected. For security, session has been revoked.",
      });
      return;
    }

    // Issue new access token AND rotate new refresh token
    const newAccessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({ id: user._id.toString() });

    // Save newly rotated refresh token hash in DB
    user.refreshToken = hashToken(newRefreshToken);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully with rotation.",
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: "15m",
        },
      },
    });
  } catch (error: any) {
    console.error("Refresh Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during token refresh.",
    });
  }
};

/**
 * Invalidate session / Logout
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully. Session invalidated.",
    });
  } catch (error: any) {
    console.error("Logout Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout.",
    });
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error: any) {
    console.error("GetCurrentUser Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error fetching user profile.",
    });
  }
};
