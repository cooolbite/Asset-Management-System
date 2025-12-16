/**
 * Script สำหรับสร้าง Admin User
 * รันด้วย: node scripts/create-admin.js
 */

// Load environment variables from .env.local
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not installed or .env.local not found
}

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('❌ ไม่พบ DATABASE_URL ใน .env.local');
  console.log('กรุณาสร้างไฟล์ .env.local และตั้งค่า DATABASE_URL');
  console.log('ดูตัวอย่างในไฟล์ env.local.template');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function createAdmin() {
  try {
    const username = 'admin';
    const email = 'admin@example.com';
    const password = 'admin123';
    const fullName = 'System Administrator';

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const checkResult = await pool.query(
      'SELECT user_id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (checkResult.rows.length > 0) {
      console.log('Admin user already exists');
      await pool.end();
      return;
    }

    // Insert admin user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, full_name, role, status)
       VALUES ($1, $2, $3, $4, 'Admin', 'Active')
       RETURNING user_id, username, email, full_name, role`,
      [username, email, passwordHash, fullName]
    );

    console.log('Admin user created successfully:');
    console.log(result.rows[0]);
    console.log(`\nLogin credentials:`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);

    await pool.end();
  } catch (error) {
    console.error('Error creating admin user:', error);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();

