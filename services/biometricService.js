const axios = require("axios");
const xml2js = require("xml2js");
const db = require("../config/db");

const DEVICE_IP = "192.168.1.200";
const DEVICE_PORT = 4370; // change to 4370 if needed

async function fetchAttendanceFromDevice() {
  try {
    const response = await axios.post(
      `http://${DEVICE_IP}:${DEVICE_PORT}/iWsService`,
      `
      <GetAttLog>
        <ArgComKey>0</ArgComKey>
        <Arg>
          <PIN>*</PIN>
        </Arg>
      </GetAttLog>
      `,
      { headers: { "Content-Type": "text/xml" } }
    );

    const parsed = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
    });

    const logs = parsed.GetAttLogResponse?.Row;

    if (!logs) {
      console.log("ℹ️ No new attendance logs");
      return;
    }

    const records = Array.isArray(logs) ? logs : [logs];

    for (const log of records) {
      const biometric_id = log.PIN;
      const check_time = log.DateTime;

      db.query(
        "SELECT member_id FROM members WHERE biometric_id = ?",
        [biometric_id],
        (err, rows) => {
          if (err || rows.length === 0) return;

          const member_id = rows[0].member_id;

          db.query(
            `
            INSERT INTO attendance (member_id, check_time)
            SELECT ?, ?
            WHERE NOT EXISTS (
              SELECT 1 FROM attendance
              WHERE member_id = ?
              AND DATE(check_time) = DATE(?)
            )
            `,
            [member_id, check_time, member_id, check_time]
          );
        }
      );
    }

    console.log(`✅ Attendance synced (${records.length})`);
  } catch (err) {
    console.error("❌ Biometric fetch failed:", err.message);
  }
}

module.exports = { fetchAttendanceFromDevice };