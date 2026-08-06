import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { GeminiRouter } from "./routes/gemini";
const app = express();
const PORT = process.env.PORT || 5001;
import { connectDatabse } from "./config/connection";
import userRouter from "./routes/userRoutes";

connectDatabse();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "https://quickmed-animeshog.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Log the origin for debugging
      console.log('CORS request from origin:', origin);
      
      // Allow all origins in development, or specific origins in production
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked for origin:', origin);
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

// Add root route for Vercel
app.get("/", (_req: Request, res: Response): void => {
  res.status(200).json({
    message: "QuickMed API is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Add health route before catch-all
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

// Add catch-all route handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.baseUrl} not found` });
});

app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    console.error(err.stack);
    res.status(500).json({
      message: "An unexpected error occurred",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Change export to module.exports for Vercel
module.exports = app;
