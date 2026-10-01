require("dotenv").config({ path: "./utills/.env" });
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

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://your-portfolio-domain.vercel.app" // update later
  ],
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/skills", skillRouter);
app.use("/api/contact", contactRouter);
app.use("/api/profile", profileRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Portfolio API is running successfully" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

DBconnection().then(() => {
  app.listen(Port, () => {
    console.log(`Server is Running on Port ${Port}`);
  });
});
