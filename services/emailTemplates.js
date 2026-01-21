const baseTemplate = (title, body) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:30px 0;">
          
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
            
            <!-- HEADER -->
            <tr>
              <td style="background:#111827;padding:20px;text-align:center;">
  
                    <img 
                        src=https://raw.githubusercontent.com/BhuvanR10/fitness/refs/heads/main/2023-12-23.png
                        alt="Gym Logo"
                        width="120"
                        style="display:block;margin:0 auto 10px;"
                    />

                    <h2 style="margin:0;color:#ffffff;">Fitness Empire</h2>
                    <p style="margin:5px 0 0;font-size:14px;color:#d1d5db;">
                        Fitness • Strength • Health • Zumba
                    </p>
                </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:30px;color:#333333;">
                ${body}
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background:#f1f5f9;padding:15px;text-align:center;font-size:12px;color:#555;">
                © ${new Date().getFullYear()} Fitness Empire <br/>
                📍  F-27/1C, 16th Main, opp. Kalyani Motors, beside NIE College, Vidyaranyapura, Mysuru, Visveshwara Nagar, Karnataka 570008 | 📞  078290 73184
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};

/* ================================
   WELCOME EMAIL
================================ */
const welcomeTemplate = (name, plan, endDate) =>
  baseTemplate(
    "Welcome to Our Gym",
    `
    <h3>Hello ${name},</h3>
    <p>Welcome to <strong>Fitness Empire</strong>! We are excited to have you.</p>

    <p><strong>Membership Plan:</strong> ${plan}</p>
    <p><strong>Valid Till:</strong> ${endDate}</p>

    <p>Stay consistent, stay strong 💪</p>

    <p style="margin-top:30px;">
      Regards,<br/>
      <strong>Gym Admin</strong>
    </p>
    `
  );

/* ================================
   EXPIRY EMAIL
================================ */
const expiryTemplate = (name, daysLeft, endDate) => {
  let message = "";

  if (daysLeft === 7) {
    message = `Your membership will expire in <strong>7 days</strong>.`;
  } else if (daysLeft === 3) {
    message = `Your membership will expire in <strong>3 days</strong>.`;
  } else if (daysLeft === 1) {
    message = `Your membership will expire <strong>tomorrow</strong>.`;
  } else {
    message = `Your membership <strong>expires today</strong>.`;
  }

  return baseTemplate(
    "Membership Expiry Reminder",
    `
    <h3>Hello ${name},</h3>
    <p>${message}</p>

    <p><strong>Expiry Date:</strong> ${endDate}</p>

    <p>Please renew your membership to continue enjoying gym services.</p>

    <p style="margin-top:30px;">
      💪 <strong>Your Gym Team</strong>
    </p>
    `
  );
};

module.exports = {
  welcomeTemplate,
  expiryTemplate,
};
