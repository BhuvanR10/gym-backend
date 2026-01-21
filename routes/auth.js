const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { adminLogin } = require("../controllers/authController");

// Login
router.post("/login", adminLogin);

// TEMP: Create admin (use once)


module.exports = router;
