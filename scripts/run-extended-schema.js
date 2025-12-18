const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function runExtendedSchema() {
  const client = await pool.connect();
  
  try {
    console.log('กำลังรัน Extended Schema...');
    
    // อ่านไฟล์ extended_schema.sql
    const schemaPath = path.join(__dirname, '..', 'database', 'extended_schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // แยกคำสั่ง SQL แต่ละคำสั่ง
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`พบ ${statements.length} คำสั่ง SQL`);
    
    // รันคำสั่งทีละคำสั่ง
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        try {
          await client.query(statement);
          if ((i + 1) % 10 === 0) {
            console.log(`ดำเนินการแล้ว ${i + 1}/${statements.length} คำสั่ง...`);
          }
        } catch (error) {
          // ข้าม error ที่เกิดจากตารางหรือ index ที่มีอยู่แล้ว
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate key') &&
              !error.message.includes('relation') ||
              error.message.includes('does not exist')) {
            console.error(`Error at statement ${i + 1}:`, error.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
          }
        }
      }
    }
    
    console.log('✅ Extended Schema รันเสร็จสิ้น');
    
    // รัน mockup data
    console.log('\nกำลังเพิ่ม Mockup Data...');
    const mockupPath = path.join(__dirname, '..', 'database', 'mockup_data.sql');
    const mockupSQL = fs.readFileSync(mockupPath, 'utf8');
    
    const mockupStatements = mockupSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (let i = 0; i < mockupStatements.length; i++) {
      const statement = mockupStatements[i];
      if (statement.length > 0) {
        try {
          await client.query(statement);
        } catch (error) {
          if (!error.message.includes('already exists') && 
              !error.message.includes('duplicate key')) {
            console.error(`Error at mockup statement ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    console.log('✅ Mockup Data เพิ่มเสร็จสิ้น');
    
  } catch (error) {
    console.error('Error running extended schema:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runExtendedSchema();

