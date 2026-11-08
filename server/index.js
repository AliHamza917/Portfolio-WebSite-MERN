const fs = require("fs");
const path = require("path");
// Loads server/utills/.env or server/.env locally. On Vercel/Render the variables come from the dashboard.
const envPath = fs.existsSync(path.join(__dirname, "utills", ".env"))
  ? path.join(__dirname, "utills", ".env")
  : path.join(__dirname, ".env");
require("dotenv").config({ path: envPath });

const { validateJwtSecret } = require("./utills/auth-validator");

// Fail startup if JWT_SECRET is missing or weak in production
const secretCheck = validateJwtSecret();
if (!secretCheck.valid) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL CONFIGURATION ERROR:", secretCheck.message);
    process.exit(1);
  } else {
    console.warn("⚠️ Security Notice:", secretCheck.message);
  }
}

const express = require("express");
const cors = require("cors");
const DBconnection = require("./utills/db");
const errorHandler = require("./middleware/errorHandler");

const authRouter = require("./router/auth-router");
const projectRouter = require("./router/project-router");
const skillRouter = require("./router/skill-router");
const contactRouter = require("./router/contact-router");
const profileRouter = require("./router/profile-router");

const app = express();
const Port = process.env.PORT || 8000;

// Parse allowed frontend origins from CLIENT_URL (comma-separated if multiple)
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/$/, ""))
  .filter(Boolean);

const defaultDevOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

const allowedOrigins = new Set([...configuredOrigins, ...defaultDevOrigins]);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, server-to-server) or matching origins
    if (
      !origin ||
      allowedOrigins.has(origin) ||
      process.env.NODE_ENV !== "production" ||
      configuredOrigins.length === 0
    ) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (does not need the database)
app.get(["/", "/api"], (req, res) => {
  res.json({ message: "Portfolio API is running successfully" });
});

// Make sure the database is connected before any /api route runs
app.use("/api", async (req, res, next) => {
  try {
    await DBconnection();
    next();
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/skills", skillRouter);
app.use("/api/contact", contactRouter);
app.use("/api/profile", profileRouter);

// Error handling middleware
app.use(errorHandler);

// Local / Render: start a normal server. Vercel: just export the app.
if (!process.env.VERCEL) {
  DBconnection()
    .then(() => {
      app.listen(Port, () => console.log(`Server is Running on Port ${Port}`));
    })
    .catch((err) => {
      console.error("MongoDB Connection Error:", err.message);
      process.exit(1);
    });
}

module.exports = app;
