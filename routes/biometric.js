const express = require("express");
const router = express.Router();
const biometricController = require("../controllers/biometricController");

/**
 * Device sends:
 * {
 *   "PIN": "101",
 *   "DateTime": "2026-01-20 18:45:00"
 * }
 */
router.post("/attendance", biometricController.markAttendance);

module.exports = router;
