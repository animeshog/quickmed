import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { GeminiRouter } from "./routes/gemini";
const app = express();
const PORT = process.env.PORT || 5000; // Changed from 5000 to 5001
import { connectDatabse } from "./config/connection";
import userRouter from "./routes/userRoutes";

connectDatabse();

const allowedOrigins = ["http://localhost:5173", "http://localhost:8080"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Update the logging middleware to only log errors
app.use((req, res, next) => {
  if (
    req.url.includes("/api/auth/chat-history") ||
    req.url.includes("/api/auth/info")
  ) {
    next();
    return;
  }
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", userRouter);
app.use("/api/gemini", GeminiRouter);

// Add catch-all route handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.baseUrl} not found` });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: "An unexpected error occurred",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const server = app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Please try another port or close the application using this port.`
      );
      process.exit(1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });

export default app;