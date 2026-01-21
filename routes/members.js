const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const db = require("../config/db");
const { sendEmail } = require("../services/emailService");
const { welcomeTemplate } = require("../services/emailTemplates");
const membersController = require("../controllers/membersController"); // Import the members controller

/* ======================================================
   GET ALL MEMBERS (WITH EMAIL)
====================================================== */
router.get("/", auth, (req, res) => {
  const { status, plan_type, search } = req.query; // Get filters and search term from query
  let sql = `
    SELECT 
      member_id,
      name,
      phone,
      email,
      plan_type,
      start_date,
      end_date,
      CASE
        WHEN CURDATE() > DATE(end_date) THEN 'Expired'
        ELSE 'Active'
      END AS status
    FROM members
  `;
  const params = [];
  const conditions = [];

  if (status && (status === 'Active' || status === 'Expired')) {
    conditions.push(`(CASE WHEN CURDATE() > DATE(end_date) THEN 'Expired' ELSE 'Active' END) = ?`);
    params.push(status);
  }

  if (plan_type) {
    conditions.push(`plan_type = ?`);
    params.push(plan_type);
  }

  if (search) {
    conditions.push(`name LIKE ?`);
    params.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(` AND `);
  }

  sql += ` ORDER BY member_id DESC`;

  console.log("Executing SQL for members list:", sql, params); // ADDED LOG for debugging
  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to fetch members" });
    }
    res.json(result);
  });
});

/* ======================================================
   GET MEMBER DETAILS (INCLUDING HISTORY)
====================================================== */
router.get("/:id/details", auth, membersController.getMemberDetails); // New route for member details

/* ======================================================
   ADD MEMBER + SEND WELCOME EMAIL
====================================================== */
router.post("/add", auth, (req, res) => {
  const {
    name,
    phone,
    email,
    biometric_id,
    plan_type,
    start_date,
    end_date
  } = req.body;

  const sql = `
    INSERT INTO members
    (name, phone, email, biometric_id, plan_type, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, phone, email, biometric_id, plan_type, start_date, end_date],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Insert failed" });
      }

      // Send welcome email
      if (email) {
        const formattedEndDate = new Date(end_date).toLocaleDateString();
        sendEmail(email, "Welcome to Fitness Empire!", welcomeTemplate(name, plan_type, formattedEndDate));
      }

      res.json({ message: "Member added successfully" });
    }
  );
});

/* ======================================================
   UPDATE MEMBER (WITH EMAIL)
====================================================== */
router.put("/update/:id", auth, (req, res) => {
  const { name, phone, email, plan_type, start_date, end_date } = req.body;
  const memberId = req.params.id;

  const sql = `
    UPDATE members
    SET
      name = ?,
      phone = ?,
      email = ?,
      plan_type = ?,
      start_date = ?,
      end_date = ?
    WHERE member_id = ?
  `;

  db.query(
    sql,
    [name, phone, email, plan_type, start_date, end_date, memberId],
    (err, result) => {
      if (err) {
        console.error("UPDATE ERROR:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Member not found" });
      }

      res.json({ message: "Member updated successfully" });
    }
  );
});

/* ======================================================
   DELETE MEMBER
====================================================== */
router.delete("/:id", auth, (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM members WHERE member_id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Delete failed" });
    }
    res.json({ message: "Member deleted successfully" });
  });
});

/* ======================================================
   RENEW MEMBERSHIP
====================================================== */
router.post("/:id/renew", auth, (req, res) => {
  const { id } = req.params;
  const { new_end_date } = req.body;

  if (!new_end_date) {
    return res.status(400).json({ message: "New end date required" });
  }

  const sql = `
    UPDATE members
    SET end_date = ?
    WHERE member_id = ?
  `;

  db.query(sql, [new_end_date, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Renewal failed" });
    }
    res.json({ message: "Membership renewed successfully" });
  });
});

/* ======================================================
   MEMBERS EXPIRING SOON (WITH EMAIL)
====================================================== */
router.get("/expiring/soon", auth, (req, res) => {
  const sql = `
    SELECT
      member_id,
      name,
      phone,
      email,
      end_date,
      DATEDIFF(end_date, CURDATE()) AS days_left
    FROM members
    WHERE DATE(end_date) BETWEEN CURDATE()
    AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) -- Fetching members expiring in next 7 days
    ORDER BY end_date ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Backend error fetching expiring members:", err);
      return res.status(500).json({ message: "Expiring report error" });
    }
    res.json(result);
  });
});

router.post("/add", auth, (req, res) => {
  const { name, phone, email, biometric_id, plan_type, start_date, end_date } = req.body;

  if (!biometric_id) {
    return res.status(400).json({ message: "Biometric ID is required" });
  }

  const sql = `
    INSERT INTO members
    (name, phone, email, biometric_id, plan_type, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [name, phone, email, biometric_id, plan_type, start_date, end_date],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Insert failed" });
      }
      // Send welcome email
      if (email) {
        const formattedEndDate = new Date(end_date).toLocaleDateString();
        sendEmail(email, "Welcome to Fitness Empire!", welcomeTemplate(name, plan_type, formattedEndDate));
      }
      res.json({ message: "Member added successfully" });
    }
  );
});

module.exports = router;