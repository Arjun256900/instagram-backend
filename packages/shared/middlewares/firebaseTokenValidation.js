import { adminAuth } from "../config/firebase.js";

export const validateFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.log("Firebase token validation error:", error);
    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        error: "Token expired",
      });
    }

    if (error.code === "auth/argument-error") {
      return res.status(401).json({
        error: "Invalid token format",
      });
    }

    return res.status(401).json({
      error: "Unauthorized: Invalid token",
    });
  }
};
