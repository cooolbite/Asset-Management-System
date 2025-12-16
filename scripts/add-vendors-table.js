/**
 * Script สำหรับเพิ่ม Vendors Table
 * รันด้วย: node scripts/add-vendors-table.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function addVendorsTable() {
  try {
    console.log('🚀 กำลังเพิ่ม Vendors Table...\n');

    if (!process.env.DATABASE_URL) {
      console.error('❌ ไม่พบ DATABASE_URL ใน .env.local');
      process.exit(1);
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // ทดสอบการเชื่อมต่อ
    console.log('🔍 กำลังทดสอบการเชื่อมต่อ Database...');
    await pool.query('SELECT NOW()');
    console.log('✅ เชื่อมต่อ Database สำเร็จ!\n');

    // อ่านไฟล์ SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'add_vendors_table.sql');
    console.log('📖 กำลังอ่านไฟล์ add_vendors_table.sql...');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // แยกคำสั่ง SQL โดยระวังเรื่อง semicolon ใน function
    const statements = [];
    let currentStatement = '';
    const lines = sqlContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // ข้าม comment และ empty lines
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      currentStatement += trimmedLine + '\n';
      
      // จบ statement เมื่อเจอ ; ที่ไม่ใช่ใน function
      if (trimmedLine.endsWith(';') && !currentStatement.includes('CREATE FUNCTION')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // เพิ่ม statement สุดท้ายถ้ามี
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`📝 พบ ${statements.length} คำสั่ง SQL\n`);

    // รันคำสั่ง SQL
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (!statement || statement.length < 10) {
        continue;
      }

      try {
        await pool.query(statement);
        process.stdout.write(`\r⏳ กำลังรัน: ${i + 1}/${statements.length}...`);
      } catch (error) {
        // ข้าม errors ที่เกี่ยวกับ already exists
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate')) {
          // Skip
        } else {
          console.error(`\n⚠️  Error ใน statement ${i + 1}: ${error.message.substring(0, 100)}`);
        }
      }
    }

    console.log('\n');

    // ตรวจสอบ Table
    console.log('🔍 กำลังตรวจสอบ Vendors Table...');
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'vendors'
    `);

    if (tableCheck.rows.length > 0) {
      console.log('✅ Vendors Table ถูกสร้างแล้ว!');

      // ตรวจสอบข้อมูลตัวอย่าง
      const vendorsCheck = await pool.query('SELECT COUNT(*) as count FROM vendors');
      console.log(`   พบ ${vendorsCheck.rows[0].count} รายการผู้ขาย/ซัพพลายเออร์\n`);
    } else {
      console.log('⚠️  Vendors Table ยังไม่ถูกสร้าง');
    }

    await pool.end();
    console.log('🎉 เสร็จสมบูรณ์!');

  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาด:', error.message);
    process.exit(1);
  }
}

addVendorsTable();

