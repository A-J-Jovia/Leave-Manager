const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'mysql://root:iPIcXONjblPjOnYUnTVfGNRlcJpkwXFH@metro.proxy.rlwy.net:28900/railway';

// ── Table DDL ────────────────────────────────────────────────

const CREATE_USERS = `
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  \`name\`       VARCHAR(100)  NOT NULL,
  \`email\`      VARCHAR(255)  NOT NULL,
  \`password\`   VARCHAR(255)  NOT NULL,
  \`role\`       ENUM('Principal','HOD','Professor','Student') NOT NULL,
  \`isApproved\` TINYINT(1)    NOT NULL DEFAULT 0,
  \`created_at\` TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uq_users_email\` (\`email\`),
  INDEX \`idx_users_role\`        (\`role\`),
  INDEX \`idx_users_isApproved\`  (\`isApproved\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const CREATE_LEAVES = `
CREATE TABLE IF NOT EXISTS \`leaves\` (
  \`id\`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`user_id\`       INT UNSIGNED NOT NULL,
  \`reason\`        TEXT         NOT NULL,
  \`from_date\`     DATE         NOT NULL,
  \`to_date\`       DATE         NOT NULL,
  \`status\`        ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  \`approver_role\` ENUM('Principal','HOD','Professor')   NOT NULL,
  \`created_at\`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\`    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_leaves_user_id\`
    FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX \`idx_leaves_user_id\`       (\`user_id\`),
  INDEX \`idx_leaves_status\`        (\`status\`),
  INDEX \`idx_leaves_approver_role\` (\`approver_role\`),
  INDEX \`idx_leaves_created_at\`    (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// ── Seed data ────────────────────────────────────────────────

const PRINCIPAL = {
  name: 'Emily',
  email: 'emily@gmail.com',
  password: 'emily123',
  role: 'Principal',
};

// ── Main ─────────────────────────────────────────────────────

async function setup() {
  let connection;

  try {
    console.log('Connecting to Railway MySQL...');
    connection = await mysql.createConnection(DATABASE_URL);
    console.log('Connected successfully.\n');

    // 1. Create tables
    console.log('Creating table: users...');
    await connection.execute(CREATE_USERS);
    console.log('  users — OK');

    console.log('Creating table: leaves...');
    await connection.execute(CREATE_LEAVES);
    console.log('  leaves — OK\n');

    // 2. Add CHECK constraint (safe to fail if already exists)
    try {
      await connection.execute(`
        ALTER TABLE \`leaves\`
          ADD CONSTRAINT \`chk_leaves_dates\`
          CHECK (\`to_date\` >= \`from_date\`)
      `);
      console.log('CHECK constraint on leaves.dates — added');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME' || err.message.includes('Duplicate')) {
        console.log('CHECK constraint on leaves.dates — already exists, skipped');
      } else {
        console.warn('CHECK constraint warning:', err.message);
      }
    }

    // 3. Seed default Principal
    console.log('\nChecking for default Principal user...');
    const [rows] = await connection.execute(
      'SELECT id FROM `users` WHERE email = ?',
      [PRINCIPAL.email]
    );

    if (rows.length > 0) {
      console.log(`  Principal "${PRINCIPAL.email}" already exists — skipped.`);
    } else {
      const hashedPassword = await bcrypt.hash(PRINCIPAL.password, 10);
      await connection.execute(
        `INSERT INTO \`users\` (name, email, password, role, isApproved)
         VALUES (?, ?, ?, ?, ?)`,
        [PRINCIPAL.name, PRINCIPAL.email, hashedPassword, PRINCIPAL.role, true]
      );
      console.log(`  Principal "${PRINCIPAL.email}" created successfully.`);
    }

    console.log('\nDatabase setup complete.');
  } catch (err) {
    console.error('\nSetup failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

setup();
