const db = require("../config/db");
const { sendEmail } = require("./emailService");
const { expiryTemplate } = require("./emailTemplates");


const sendExpiryReminders = () => {
  const sql = `
    SELECT 
      name,
      email,
      end_date,
      DATEDIFF(DATE(end_date), CURDATE()) AS days_left
    FROM members
    WHERE email IS NOT NULL
    AND DATEDIFF(DATE(end_date), CURDATE()) IN (7, 3, 1, 0)
  `;

  db.query(sql, async (err, members) => {
    if (err) {
      console.error("Reminder error:", err);
      return;
    }

    for (const m of members) {
      let subject = "";
      let message = "";

      if (m.days_left === 7) {
        subject = "⏳ Membership Expiry in 7 Days";
        message = `
          <h3>Hello ${m.name},</h3>
          <p>Your gym membership will expire in <strong>7 days</strong>.</p>
          <p>Please plan your renewal to continue your workouts.</p>
        `;
      } 
      else if (m.days_left === 3) {
        subject = "⚠️ Membership Expiry in 3 Days";
        message = `
          <h3>Hello ${m.name},</h3>
          <p>Your gym membership will expire in <strong>3 days</strong>.</p>
          <p>Please renew soon to avoid interruption.</p>
        `;
      } 
      else if (m.days_left === 1) {
        subject = "🚨 Membership Expiry Tomorrow";
        message = `
          <h3>Hello ${m.name},</h3>
          <p>Your gym membership will expire <strong>tomorrow</strong>.</p>
          <p>Please renew immediately.</p>
        `;
      } 
      else if (m.days_left === 0) {
        subject = "❌ Membership Expired Today";
        message = `
          <h3>Hello ${m.name},</h3>
          <p>Your gym membership <strong>expires today</strong>.</p>
          <p>Please renew to continue accessing the gym.</p>
        `;
      }

      // Send email
      await sendEmail(
        m.email,
        subject,
        expiryTemplate(m.name, m.days_left, m.end_date)
      );
    }

    console.log(`📧 Expiry reminder emails sent: ${members.length}`);
  });
};

module.exports = { sendExpiryReminders };
