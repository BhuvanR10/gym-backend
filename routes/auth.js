const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { adminLogin } = require("../controllers/authController");

// LOGIN
router.post("/login", adminLogin);

// TEMP: CREATE DEMO ADMIN (USE ONCE)


module.exports = router;
