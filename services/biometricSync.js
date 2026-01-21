const axios = require("axios");
const db = require("../config/db");

async function syncAttendanceFromDevice() {
  try {
    const response = await axios.get(
      "http://192.168.1.200/attendance/log"
    );

    const logs = response.data; // depends on device format

    for (const log of logs) {
      const biometric_id = log.pin;
      const check_time = log.datetime;

      const memberQuery =
        "SELECT member_id FROM members WHERE biometric_id = ?";
      
      db.query(memberQuery, [biometric_id], (err, rows) => {
        if (rows.length === 0) return;

        const member_id = rows[0].member_id;

        const insertQuery = `
          INSERT IGNORE INTO attendance (member_id, check_time)
          VALUES (?, ?)
        `;

        db.query(insertQuery, [member_id, check_time]);
      });
    }

    console.log("✅ Attendance synced");
  } catch (err) {
    console.error("❌ Device sync failed", err.message);
  }
}

module.exports = { syncAttendanceFromDevice };
