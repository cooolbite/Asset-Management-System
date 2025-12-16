/**
 * Script สำหรับรัน SQL Schema โดยอัตโนมัติ
 * รันด้วย: node scripts/run-schema.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSchema() {
  try {
    console.log('🚀 กำลังรัน SQL Schema...\n');

    if (!process.env.DATABASE_URL) {
      console.error('❌ ไม่พบ DATABASE_URL ใน .env.local');
      console.log('กรุณาสร้างไฟล์ .env.local และตั้งค่า DATABASE_URL');
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

    // อ่านไฟล์ schema.sql
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    console.log('📖 กำลังอ่านไฟล์ schema.sql...');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // แยกคำสั่ง SQL โดยใช้ ; เป็นตัวแบ่ง
    // แต่ต้องระวังเรื่อง ; ใน function body
    const statements = [];
    let currentStatement = '';
    let inFunction = false;
    
    const lines = schemaSQL.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // ข้าม comment และ empty lines
      if (line.startsWith('--') || line === '') {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // ตรวจสอบว่าเป็น function หรือไม่
      if (line.includes('CREATE OR REPLACE FUNCTION') || line.includes('CREATE FUNCTION')) {
        inFunction = true;
      }
      
      // จบ function เมื่อเจอ $$ language
      if (inFunction && line.includes('$$ language')) {
        inFunction = false;
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
      
      // จบ statement ปกติเมื่อเจอ ;
      if (!inFunction && line.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // เพิ่ม statement สุดท้ายถ้ามี
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`📝 พบ ${statements.length} คำสั่ง SQL\n`);

    // รันคำสั่ง SQL ทีละคำสั่ง
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (!statement || statement.length < 10) {
        continue;
      }

      try {
        await pool.query(statement);
        successCount++;
        
        // แสดง progress
        if ((i + 1) % 5 === 0 || i === statements.length - 1) {
          process.stdout.write(`\r⏳ กำลังรัน: ${i + 1}/${statements.length}...`);
        }
      } catch (error) {
        // ข้าม errors ที่เกี่ยวกับ already exists หรือ duplicate
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.message.includes('does not exist') && error.message.includes('DROP')) {
          skipCount++;
        } else {
          errorCount++;
          console.error(`\n⚠️  Error ใน statement ${i + 1}: ${error.message.substring(0, 100)}`);
        }
      }
    }

    console.log('\n');
    console.log('✅ รัน SQL Schema เสร็จสิ้น!');
    console.log(`   สำเร็จ: ${successCount}`);
    console.log(`   ข้าม (already exists): ${skipCount}`);
    if (errorCount > 0) {
      console.log(`   ข้อผิดพลาด: ${errorCount}`);
    }

    // ตรวจสอบ Tables
    console.log('\n🔍 กำลังตรวจสอบ Tables...');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const requiredTables = ['users', 'categories', 'locations', 'assets', 'transactions', 'refresh_tokens', 'audit_logs'];
    const existingTables = tablesResult.rows.map(r => r.table_name);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.log(`⚠️  Tables ที่ยังไม่พบ: ${missingTables.join(', ')}`);
    } else {
      console.log('✅ พบ Tables ทั้งหมดแล้ว!');
      tablesResult.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
    }

    await pool.end();
    console.log('\n🎉 เสร็จสมบูรณ์!');

  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาด:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 แก้ไข: ตรวจสอบรหัสผ่านใน .env.local');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 แก้ไข: ตรวจสอบว่า PostgreSQL service ทำงานอยู่');
    } else if (error.message.includes('does not exist')) {
      console.log('\n💡 แก้ไข: สร้าง Database ก่อน: CREATE DATABASE asset_management;');
    }
    
    process.exit(1);
  }
}

runSchema();

