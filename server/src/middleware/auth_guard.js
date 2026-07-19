import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import User from "../models/user.js";

export const authGuard = async (req, res, next) => {
  const token = req.cookies?.access_token;
 
  if (!token) {
    console.log("No token found!");
    return res.status(401).json({ message: "Authentication required." });
  }
 
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
 
    // Reject tokens that weren't issued for general access
    // (e.g. blocks the mfa_pending temp token from accessing real routes)
    if (payload.purpose !== "access") {
      console.log("No access token found!");
      return res.status(401).json({ message: "Authentication required." });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "Authentication required." });
    }
 
    req.user = user;
    next();
  } catch (e){
    // Covers: expired, tampered, wrong secret — all return the same 401
    console.log("Error checking auth state:", e);
    return res.status(401).json({ message: "Authentication required." });
  }
};

export const mfaPendingGuard = async (req, res, next) => {
  const token = req.cookies?.mfa_pending;
 
  if (!token) {
    return res.status(401).json({ error: "MFA verification required." });
  }
 
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
 
    if (payload.purpose !== "mfa_pending") {
      return res.status(401).json({ error: "MFA verification required." });
    }
 
    // Fetch full Mongoose document — verify2fa needs user.mfaSecret + .save()
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: "MFA verification required." });
    }
 
    req.user = user;   // full Mongoose doc
    next();
 
  } catch (e) {
    console.error("mfaPendingGuard error:", e.message);
    return res.status(401).json({ error: "MFA verification required." });
  }
};