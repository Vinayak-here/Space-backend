import type { Request, Response, NextFunction } from "express";
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
