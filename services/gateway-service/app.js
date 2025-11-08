import express from "express";
import proxy from "express-http-proxy";
import dotenv from "dotenv";
import { validateFirebaseToken } from "../../packages/shared/middlewares/firebaseTokenValidation.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log("➡️ Incoming:", req.method, req.url);
  next();
});

// PUBLIC (no auth)
app.use(
  "/api/auth",
  proxy("http://auth-service:5000", {
    proxyReqPathResolver: (req) => {
      // For /api/auth/signup -> /auth/signup
      return req.originalUrl.replace(/^\/api\/auth/, "/auth");
    },
    proxyErrorHandler: (err, res, next) => {
      console.error("Proxy error to auth:", err);
      next(err);
    },
  })
);

// PROTECTED
app.use(
  "/api/profile",
  validateFirebaseToken,
  proxy("http://profile-service:6000", {
    proxyReqPathResolver: (req) =>
      req.originalUrl.replace(/^\/api\/profile/, "/profile"),
  })
);
// Health check
app.get("/health", (req, res) => res.send("Gateway-service healthy ✅"));

export default app;
