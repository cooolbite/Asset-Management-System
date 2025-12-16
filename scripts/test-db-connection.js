/**
 * Script สำหรับทดสอบการเชื่อมต่อ Database
 * รันด้วย: node scripts/test-db-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    console.log('🔍 กำลังทดสอบการเชื่อมต่อ Database...\n');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ ไม่พบ DATABASE_URL ใน .env.local');
      console.log('กรุณาสร้างไฟล์ .env.local และตั้งค่า DATABASE_URL');
      process.exit(1);
    }

    console.log('📋 Database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
    
    // Test connection
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ เชื่อมต่อ Database สำเร็จ!');
    console.log('   เวลาปัจจุบัน:', result.rows[0].current_time);
    console.log('   PostgreSQL Version:', result.rows[0].pg_version.split(',')[0]);
    
    // Check database name
    const dbResult = await pool.query('SELECT current_database() as db_name');
    console.log('   Database:', dbResult.rows[0].db_name);
    
    // Check tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables ที่พบ:');
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️  ไม่พบตาราง - กรุณารัน database/schema.sql');
    } else {
      tablesResult.rows.forEach(row => {
        console.log('   ✓', row.table_name);
      });
    }
    
    // Check admin user
    const userResult = await pool.query(
      "SELECT user_id, username, email, role, status FROM users WHERE username = 'admin'"
    );
    
    console.log('\n👤 Admin User:');
    if (userResult.rows.length === 0) {
      console.log('   ⚠️  ไม่พบ Admin User - กรุณารัน: npm run create-admin');
    } else {
      console.log('   ✓ พบ Admin User:', userResult.rows[0].username);
      console.log('     Email:', userResult.rows[0].email);
      console.log('     Role:', userResult.rows[0].role);
      console.log('     Status:', userResult.rows[0].status);
    }
    
    await pool.end();
    console.log('\n✅ ทดสอบเสร็จสิ้น!');
    
  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาด:', error.message);
    console.log('\n💡 คำแนะนำ:');
    
    if (error.message.includes('password authentication failed')) {
      console.log('   - ตรวจสอบรหัสผ่านใน .env.local');
    } else if (error.message.includes('does not exist')) {
      console.log('   - ตรวจสอบว่า Database ถูกสร้างแล้ว');
      console.log('   - รัน: CREATE DATABASE asset_management;');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('   - ตรวจสอบว่า PostgreSQL service ทำงานอยู่');
      console.log('   - ตรวจสอบ port ใน .env.local (default: 5432)');
    } else {
      console.log('   - ตรวจสอบ DATABASE_URL ใน .env.local');
      console.log('   - ตรวจสอบว่า PostgreSQL ทำงานอยู่');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();

