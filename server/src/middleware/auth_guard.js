import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";

export function authGuard(req, res, next) {
  const token = req.cookies?.access_token;
 
  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }
 
  try {
    const payload = jwt.verify(token, JWT_SECRET);
 
    // Reject tokens that weren't issued for general access
    // (e.g. blocks the mfa_pending temp token from accessing real routes)
    if (payload.purpose !== "access") {
      return res.status(401).json({ message: "Authentication required." });
    }
 
    req.user = { id: payload.sub };
    next();
  } catch {
    // Covers: expired, tampered, wrong secret — all return the same 401
    return res.status(401).json({ message: "Authentication required." });
  }
}

export function mfaPendingGuard(req, res, next) {
  const token = req.cookies?.mfa_pending;
 
  if (!token) {
    return res.status(401).json({ message: "MFA verification required." });
  }
 
  try {
    const payload = jwt.verify(token, JWT_SECRET);
 
    if (payload.purpose !== "mfa_pending") {
      return res.status(401).json({ message: "MFA verification required." });
    }
 
    req.user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({ message: "MFA verification required." });
  }
}