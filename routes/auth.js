const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { adminLogin } = require("../controllers/authController");

// LOGIN
router.post("/login", adminLogin);

// TEMP: CREATE DEMO ADMIN (USE ONCE)
router.post("/create-demo-admin", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username & password required" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO admin (username, password) VALUES (?, ?)";

    db.query(sql, [username, hash], (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Admin exists or DB error" });
      }

      res.json({ message: "Demo admin created successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
