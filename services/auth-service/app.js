import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import loginRoutes from "./routes/login.route.js";
import signupRoutes from "./routes/signup.route.js";

dotenv.config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "auth-service",
    timestamp: new Date().toISOString(),
  });
});

app.use("/login", loginRoutes);
app.use("/signup", signupRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
});

app.use((err, req, res, next) => {
  console.error("Error: ", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

export default app;
