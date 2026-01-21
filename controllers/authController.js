exports.adminLogin = (req, res) => {
  console.log("LOGIN BODY FROM FRONTEND:", req.body);

  const { username, password } = req.body;

  const sql = "SELECT * FROM `admin` WHERE username = ?";

  db.query(sql, [username], async (err, results) => {
    console.log("DB RESULT:", results);

    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = results[0];

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { admin_id: admin.admin_id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  });
};
