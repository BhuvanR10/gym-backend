const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { query } = require("../config/db");

router.get("/stats", auth, async (req, res) => {
  try {
    const result = await query(`
      SELECT
        (SELECT COUNT(*) FROM members) AS totalMembers,
        (SELECT COUNT(*) FROM members WHERE CURDATE() <= DATE(end_date)) AS activeMembers,
        (SELECT COUNT(*) FROM members WHERE CURDATE() > DATE(end_date)) AS expiredMembers,
        (SELECT COUNT(*) FROM attendance WHERE DATE(check_time) = CURDATE()) AS todayAttendance
    `);

    res.json(result[0]);
  } catch (err) {
    console.error("DASHBOARD STATS ERROR:", err);
    res.status(500).json({ message: "Dashboard stats error" });
  }
});


module.exports = router;
