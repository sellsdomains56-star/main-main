import type { NextFunction, Request, Response } from "express";
import { limit } from "./routes/account.js";

/** Standard protective headers on every API response. */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin"); // photos and reels are shown by the apps
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.removeHeader("X-Powered-By");
  next();
}

/** At most `max` requests per IP (and per signed-in person) to this route in `windowMs`. */
export const rateLimit = (name: string, max: number, windowMs: number, message = "Too many requests. Please wait a moment and try again.") =>
  (req: Request, _res: Response, next: NextFunction) => {
    limit(`${name}:ip:${req.ip}`, max, windowMs, message);
    next();
  };
