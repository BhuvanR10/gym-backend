require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");

const { fetchAttendanceFromDevice } = require("./services/biometricService");
const { syncAttendanceFromDevice } = require("./services/biometricSync");
const { sendExpiryReminders } = require("./services/reminderService");

const biometricRoutes = require("./routes/biometric");

const app = express();

// ================= Middleware =================
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// ================= Database =================
require("./config/db");

// ================= Routes =================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/members", require("./routes/members"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/biometric", biometricRoutes);

// ================= Health Check =================
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

// ================= CRON JOBS =================
cron.schedule("0 9 * * *", sendExpiryReminders);
cron.schedule("5 9 * * *", syncAttendanceFromDevice);
cron.schedule("10 9 * * *", fetchAttendanceFromDevice);

// ================= Error Safety =================
process.on("unhandledRejection", err => {
  console.error("Unhandled Promise Rejection:", err);
});

// ================= Start Server =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
