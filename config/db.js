const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

pool.on("connection", (connection) => {
  console.log("✅ MySQL connected:", connection.threadId);
});

pool.on("error", (err) => {
  console.error("❌ MySQL Pool Error:", err);
});

/* ===============================
   PROMISE QUERY HELPER (OPTIONAL)
================================ */
const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

module.exports = {
  pool,
  query,
};
