import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/sup_authRoutes/authRoutes.js";
import rbacRoutes from "./routes/sup_authRoutes/rbacRoutes.js";
import userRoutes from "./routes/sup_authRoutes/userRoutes.js";
import churchRoutes from "./routes/sup_authRoutes/churchRoutes.js";

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`${req.method} :: ${req.originalUrl}`);
  next();
});

// Routes
// Using /api prefix for RBAC to match user request /api/roles
app.use("/api/auth", authRoutes);
app.use("/api/church", churchRoutes);
app.use("/api", rbacRoutes);
app.use("/api/users", userRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.send("ChurchOS API is running...");
});

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is healthy" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
