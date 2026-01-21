const db = require("../config/db");

/**
 * Handles biometric attendance data from the device.
 * Expects a POST request with { "PIN": "member_biometric_id", "DateTime": "YYYY-MM-DD HH:MM:SS" }
 */
exports.markAttendance = async (req, res) => {
  const { PIN, DateTime } = req.body;

  if (!PIN || !DateTime) {
    return res.status(400).json({ message: "Invalid data" });
  }

  // Find member by biometric_id
  db.query(
    "SELECT member_id FROM members WHERE biometric_id = ?",
    [PIN],
    (err, rows) => {
      if (err) {
        console.error("Database error while fetching member:", err);
        return res.status(500).json({ message: "Database error" });
      }
      if (rows.length === 0) {
        return res.status(404).json({ message: "Member not found" });
      }

      const member_id = rows[0].member_id;

      // Prevent duplicate attendance for same day
      const insertQuery = `
        INSERT INTO attendance (member_id, check_time)
        SELECT ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM attendance
          WHERE member_id = ?
          AND DATE(check_time) = DATE(?)
        )
      `;

      db.query(
        insertQuery,
        [member_id, DateTime, member_id, DateTime],
        (err2) => {
          if (err2) {
            console.error("Attendance insert failed:", err2);
            return res
              .status(500)
              .json({ message: "Attendance insert failed" });
          }

          if (this.sql.affectedRows === 0) {
            return res.status(200).json({ message: "Attendance already marked for today" });
          }

          res.json({ message: "Attendance marked successfully" });
        }
      );
    }
  );
};
