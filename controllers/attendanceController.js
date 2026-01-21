const db = require("../config/db");

// Sync Biometric Logs (dummy for now)
exports.syncBiometricLogs = (req, res) => {
  const logs = req.body.logs;

  logs.forEach(log => {
    const checkSql = `
      SELECT 
        CASE 
          WHEN CURDATE() > end_date THEN 'Expired'
          ELSE 'Active'
        END AS status
      FROM members
      WHERE member_id = ?
    `;

    db.query(checkSql, [log.member_id], (err, result) => {
      if (result[0].status === "Active") {
        const insertSql = `
          INSERT INTO attendance (member_id, check_time)
          VALUES (?, ?)
        `;
        db.query(insertSql, [log.member_id, `${log.date} ${log.time}`]);
      }
    });
  });

  res.json({ message: "Attendance synced (active members only)" });
};

// Get Today Attendance
exports.getTodayAttendance = (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const sql = "SELECT * FROM attendance WHERE DATE(check_time) = ?";
  db.query(sql, [today], (err, results) => {
    if (err) return res.json({ error: err });
    res.json(results);
  });
};
