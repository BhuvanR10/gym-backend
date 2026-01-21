const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { adminLogin } = require("../controllers/authController");

// Login
router.post("/login", adminLogin);

// TEMP: Create admin (use once)
router.post("/create-admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO admin (username, password) VALUES (?, ?)",
      [username, hashed]
    );

    res.json({ message: "Admin created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

module.exports = router;
