const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const db = require("../config/db");
const { sendEmail } = require("../services/emailService");
const { welcomeTemplate } = require("../services/emailTemplates");

/* ===== PRE-FLIGHT SAFETY ===== */
router.options("*", (req, res) => res.sendStatus(200));

/* ======================================================
   GET ALL MEMBERS
   GET /api/members
====================================================== */
router.get("/", auth, (req, res) => {
  // Prevent caching (backend only)
  res.setHeader("Cache-Control", "no-store");

  const { status, plan_type, search } = req.query;

  let sql = `
    SELECT 
      member_id,
      name,
      phone,
      email,
      biometric_id,
      plan_type,
      start_date,
      end_date,
      CASE
        WHEN CURDATE() > DATE(end_date) THEN 'Expired'
        ELSE 'Active'
      END AS status
    FROM members
  `;

  const conditions = [];
  const params = [];

  if (status && ["Active", "Expired"].includes(status)) {
    conditions.push(`
      CASE
        WHEN CURDATE() > DATE(end_date) THEN 'Expired'
        ELSE 'Active'
      END = ?
    `);
    params.push(status);
  }

  if (plan_type) {
    conditions.push("plan_type = ?");
    params.push(plan_type);
  }

  if (search) {
    conditions.push("name LIKE ?");
    params.push(`%${search}%`);
  }

  if (conditions.length) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY member_id DESC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("FETCH MEMBERS ERROR:", err);
      return res.status(500).json({ message: "Failed to fetch members" });
    }
    res.json(result);
  });
});

/* ======================================================
   ADD MEMBER
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

  if (!name || !biometric_id || !plan_type || !start_date || !end_date) {
    return res.status(400).json({ message: "Missing required fields" });
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
        console.error("ADD MEMBER ERROR:", err);
        return res.status(500).json({ message: "Insert failed" });
      }

      if (email) {
        const formattedEndDate = new Date(end_date).toLocaleDateString();
        sendEmail(
          email,
          "Welcome to Fitness Empire!",
          welcomeTemplate(name, plan_type, formattedEndDate)
        );
      }

      res.json({ message: "Member added successfully" });
    }
  );
});

/* ======================================================
   UPDATE MEMBER
====================================================== */
router.put("/update/:id", auth, (req, res) => {
  const { id } = req.params;
  const { name, phone, email, plan_type, start_date, end_date } = req.body;

  const sql = `
    UPDATE members
    SET name=?, phone=?, email=?, plan_type=?, start_date=?, end_date=?
    WHERE member_id=?
  `;

  db.query(sql, [name, phone, email, plan_type, start_date, end_date, id], (err, result) => {
    if (err) {
      console.error("UPDATE MEMBER ERROR:", err);
      return res.status(500).json({ message: "Update failed" });
    }
    if (!result.affectedRows) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.json({ message: "Member updated successfully" });
  });
});

/* ======================================================
   DELETE MEMBER
====================================================== */
router.delete("/:id", auth, (req, res) => {
  db.query("DELETE FROM members WHERE member_id = ?", [req.params.id], err => {
    if (err) {
      console.error("DELETE MEMBER ERROR:", err);
      return res.status(500).json({ message: "Delete failed" });
    }
    res.json({ message: "Member deleted successfully" });
  });
});

/* ======================================================
   RENEW MEMBERSHIP
====================================================== */
router.post("/:id/renew", auth, (req, res) => {
  const { new_end_date } = req.body;
  if (!new_end_date) {
    return res.status(400).json({ message: "New end date required" });
  }

  db.query(
    "UPDATE members SET end_date=? WHERE member_id=?",
    [new_end_date, req.params.id],
    err => {
      if (err) {
        console.error("RENEW ERROR:", err);
        return res.status(500).json({ message: "Renewal failed" });
      }
      res.json({ message: "Membership renewed successfully" });
    }
  );
});

/* ======================================================
   EXPIRING MEMBERS
====================================================== */
router.get("/expiring/soon", auth, (req, res) => {
  const sql = `
    SELECT member_id, name, phone, email, end_date,
    DATEDIFF(end_date, CURDATE()) AS days_left
    FROM members
    WHERE DATEDIFF(end_date, CURDATE()) BETWEEN 0 AND 7
    ORDER BY end_date
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("EXPIRING MEMBERS ERROR:", err);
      return res.status(500).json({ message: "Expiring report error" });
    }
    res.json(result);
  });
});

module.exports = router;
