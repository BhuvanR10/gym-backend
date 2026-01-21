const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM admin WHERE username = ?";

  db.query(sql, [username], async (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = result[0];

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { admin_id: admin.admin_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });
  });
};
// TEMP: Create admin (use once)
// exports.createAdmin = async (req, res) => {
//   const { username, password } = req.body;
//   const hashedPassword = await bcrypt.hash(password, 10);

//   const sql = "INSERT INTO admin (username, password) VALUES (?, ?)";
//   db.query(sql, [username, hashedPassword], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ message: "Database error" });
//     }
//     res.json({ message: "Admin created", admin_id: result.insertId });
//   });
// };
