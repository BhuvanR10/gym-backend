const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const db = require("../config/db");

router.get("/stats", auth, (req, res) => {
    console.log("Dashboard stats requested by admin:", req.admin);
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM members) AS totalMembers,
      (SELECT COUNT(*) FROM members WHERE CURDATE() <= DATE(end_date)) AS activeMembers,
      (SELECT COUNT(*) FROM members WHERE CURDATE() > DATE(end_date)) AS expiredMembers,
      (SELECT COUNT(*) FROM attendance WHERE DATE(check_time) = CURDATE()) AS todayAttendance
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Dashboard stats error" });
    }
    res.json(result[0]);
  });
});

module.exports = router;
