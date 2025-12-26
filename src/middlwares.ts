import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { ZodError } from "zod";

export const validate =
  (schema: any) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Invalid request body",
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            details,
          },
        });
      }

      next(err);
    }
  };


  
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    `${req.ip}:${req.body?.username || "unknown"}`,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
    data: null,
    error: { code: "RATE_LIMITED" },
    meta: null,
  },
});