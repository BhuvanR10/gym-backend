const db = require("../config/db");

// Add New Member
exports.addMember = (req, res) => {
  const { name, phone, plan_type, start_date, end_date, biometric_id } = req.body;

  const sql = `
    INSERT INTO members (name, phone, plan_type, start_date, end_date, biometric_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, phone, plan_type, start_date, end_date, biometric_id],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Database error" });
      }
      res.json({ message: "Member added successfully" });
    }
  );
};


// Get all members
exports.getMembers = (req, res) => {
  const sql = `
    SELECT *,
    CASE
      WHEN CURDATE() > DATE(end_date) THEN 'Expired'
      ELSE 'Active'
    END AS status
    FROM members
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};


// Get member by ID
exports.getMemberById = (req, res) => {
  const sql = `
    SELECT *,
    CASE
      WHEN CURDATE() > DATE(end_date) THEN 'Expired'
      ELSE 'Active'
    END AS status
    FROM members
    WHERE member_id = ?
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0]);
  });
};

// Get Member Details (for activity log)
exports.getMemberDetails = async (req, res) => {
  const member_id = req.params.id;

  try {
    // Fetch basic member info
    const memberInfo = await new Promise((resolve, reject) => {
      db.query(
        `SELECT
          member_id, name, phone, email, plan_type, start_date, end_date,
          CASE
            WHEN CURDATE() > DATE(end_date) THEN 'Expired'
            ELSE 'Active'
          END AS status
        FROM members WHERE member_id = ?`,
        [member_id],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows[0]);
        }
      );
    });

    if (!memberInfo) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Fetch membership history (assuming a 'membership_history' table or similar for past plans)
    // For now, we'll just return the current plan details as the 'history'
    // A more robust solution would involve a dedicated 'membership_history' table.
    const membershipHistory = [{
      plan_type: memberInfo.plan_type,
      start_date: memberInfo.start_date,
      end_date: memberInfo.end_date,
      status: memberInfo.status
    }];

    // Fetch attendance history
    const attendanceHistory = await new Promise((resolve, reject) => {
      db.query(
        `SELECT check_time FROM attendance WHERE member_id = ? ORDER BY check_time DESC`,
        [member_id],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });

    res.json({
      member: memberInfo,
      membershipHistory: membershipHistory,
      attendanceHistory: attendanceHistory,
    });
  } catch (error) {
    console.error("Error fetching member details:", error);
    res.status(500).json({ message: "Failed to fetch member details" });
  }
};
