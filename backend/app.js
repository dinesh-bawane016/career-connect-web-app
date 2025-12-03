import express from "express";
import dbConnection from "./database/dbConnection.js";
import jobRouter from "./routes/jobRoutes.js";
import userRouter from "./routes/userRoutes.js";
import applicationRouter from "./routes/applicationRoutes.js";
import { config } from "dotenv";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

const app = express();
config({ path: "./config/config.env" });

// ---------- SMART CORS Setup ----------
app.use(
  cors({
    origin: (origin, callback) => {
      // 1. Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      // 2. Define allowed origins (Localhost + Your Main Production URL)
      const allowedOrigins = [
        process.env.FRONTEND_URL, // The main URL from Render settings
        "http://localhost:3000",  // Local React
        "http://localhost:5173"   // Local Vite
      ];

      // 3. Check if the origin is in the allowed list OR if it is a Vercel preview
      // This line `origin.endsWith(".vercel.app")` allows ALL Vercel deployments automatically
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin); // Debugging log
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // allow cookies/auth headers
  })
);

// ---------- Middleware ----------
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// ---------- Routes ----------
app.use("/api/v1/user", userRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/application", applicationRouter);

// ---------- Connect to DB ----------
dbConnection();

// ---------- Error Handling ----------
app.use(errorMiddleware);

export default app;