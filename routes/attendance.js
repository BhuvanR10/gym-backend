const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const db = require("../config/db");

// Get attendance by date
router.get("/", auth, (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  const sql = `
    SELECT
  a.attendance_id,
  m.name,
  m.phone,
  DATE(a.check_time) AS date,
  TIME(a.check_time) AS time
FROM attendance a
JOIN members m ON a.member_id = m.member_id
WHERE DATE(a.check_time) = ?
ORDER BY a.check_time DESC

  `;

  db.query(sql, [date], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Attendance fetch error" });
    }
    res.json(result);
  });
});

// Monthly attendance report
router.get("/monthly", auth, (req, res) => {
  const { month } = req.query; // format: YYYY-MM

  if (!month) {
    return res.status(400).json({ message: "Month is required" });
  }

  const sql = `
    SELECT 
      m.member_id,
      m.name,
      m.phone,
      COUNT(a.attendance_id) AS total_days
    FROM members m
    LEFT JOIN attendance a
      ON m.member_id = a.member_id
      AND DATE_FORMAT(a.check_time, '%Y-%m') = ?
    GROUP BY m.member_id
    ORDER BY total_days DESC
  `;

  db.query(sql, [month], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Monthly report error" });
    }
    res.json(result);
  });
});

module.exports = router;
