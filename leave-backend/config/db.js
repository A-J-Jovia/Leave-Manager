const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

let connection;

if (process.env.DATABASE_URL) {
  // ✅ Railway / Production
  connection = mysql.createPool(process.env.DATABASE_URL);
} else {
  // ✅ Local development
  connection = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'leave_management',
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

// Health check
connection.getConnection((err, conn) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('Database connected successfully');
  conn.release();
});

// Error handler
connection.on('error', (err) => {
  console.error('Database error:', err.message);
});

module.exports = connection;