const path = require("path");
// Loads server/utills/.env locally. On Vercel/Render the variables come from the dashboard.
require("dotenv").config({ path: path.join(__dirname, "utills", ".env") });

const express = require("express");
const cors = require("cors");
const DBconnection = require("./utills/db");

const authRouter = require("./router/auth-router");
const projectRouter = require("./router/project-router");
const skillRouter = require("./router/skill-router");
const contactRouter = require("./router/contact-router");
const profileRouter = require("./router/profile-router");

const app = express();
const Port = process.env.PORT || 8000;

// Allowed frontends: localhost + any URLs listed in CLIENT_URL (comma separated)
const allowedOrigins = [
  "http://localhost:3000",
  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((u) => u.trim().replace(/\/$/, ""))
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow tools like Postman (no origin) and listed frontends
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: "GET,POST,PUT,DELETE,PATCH,HEAD,OPTIONS",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (does not need the database)
app.get("/", (req, res) => {
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
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

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
