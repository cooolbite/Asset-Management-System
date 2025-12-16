/**
 * Script สำหรับช่วยตั้งค่า Database
 * รันด้วย: node scripts/setup-database.js
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  try {
    console.log('🚀 เริ่มตั้งค่า Database...\n');

    // ตรวจสอบ .env.local
    if (!process.env.DATABASE_URL) {
      console.log('⚠️  ไม่พบ DATABASE_URL ใน .env.local');
      console.log('กรุณาสร้างไฟล์ .env.local และตั้งค่า DATABASE_URL');
      console.log('ดูตัวอย่างในไฟล์ env.local.template\n');
      
      const createEnv = await question('ต้องการสร้างไฟล์ .env.local ตอนนี้ไหม? (y/n): ');
      if (createEnv.toLowerCase() === 'y') {
        const username = await question('PostgreSQL Username (default: postgres): ') || 'postgres';
        const password = await question('PostgreSQL Password: ');
        const host = await question('PostgreSQL Host (default: localhost): ') || 'localhost';
        const port = await question('PostgreSQL Port (default: 5432): ') || '5432';
        const database = await question('Database Name (default: asset_management): ') || 'asset_management';

        const envContent = `# Database Configuration
DATABASE_URL=postgresql://${username}:${password}@${host}:${port}/${database}

# JWT Secret (ต้องมีความยาวอย่างน้อย 32 ตัวอักษร)
JWT_SECRET=asset-management-secret-key-2024-min-32-chars
JWT_REFRESH_SECRET=asset-management-refresh-secret-key-2024-min-32-chars

# JWT Expiration (in seconds)
JWT_EXPIRES_IN=86400
JWT_REFRESH_EXPIRES_IN=604800

# Node Environment
NODE_ENV=development
`;

        fs.writeFileSync('.env.local', envContent);
        console.log('✅ สร้างไฟล์ .env.local สำเร็จ\n');
        
        // Reload env
        require('dotenv').config({ path: '.env.local' });
      } else {
        rl.close();
        process.exit(1);
      }
    }

    // ทดสอบการเชื่อมต่อ
    console.log('🔍 กำลังทดสอบการเชื่อมต่อ Database...');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    try {
      await pool.query('SELECT NOW()');
      console.log('✅ เชื่อมต่อ Database สำเร็จ!\n');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('⚠️  Database ยังไม่ถูกสร้าง');
        const createDb = await question('ต้องการสร้าง Database ตอนนี้ไหม? (y/n): ');
        if (createDb.toLowerCase() === 'y') {
          // แยก connection string เพื่อสร้าง database
          const dbUrl = new URL(process.env.DATABASE_URL.replace('postgresql://', 'http://'));
          const dbName = dbUrl.pathname.substring(1);
          const adminUrl = process.env.DATABASE_URL.replace(`/${dbName}`, '/postgres');
          
          console.log('📝 กำลังสร้าง Database...');
          const adminPool = new Pool({ connectionString: adminUrl });
          await adminPool.query(`CREATE DATABASE ${dbName}`);
          await adminPool.end();
          console.log(`✅ สร้าง Database "${dbName}" สำเร็จ!\n`);
        } else {
          console.log('กรุณาสร้าง Database ด้วยตนเองแล้วรัน script นี้อีกครั้ง');
          rl.close();
          process.exit(1);
        }
      } else {
        throw error;
      }
    }

    // ตรวจสอบ Tables
    console.log('🔍 กำลังตรวจสอบ Tables...');
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
      console.log(`⚠️  ไม่พบ Tables: ${missingTables.join(', ')}`);
      const runSchema = await question('ต้องการรัน SQL Schema ตอนนี้ไหม? (y/n): ');
      
      if (runSchema.toLowerCase() === 'y') {
        console.log('📝 กำลังรัน SQL Schema...');
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // แยกคำสั่ง SQL
        const statements = schemaSQL
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await pool.query(statement);
            } catch (err) {
              // ข้าม errors ที่เกี่ยวกับ table already exists
              if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
                console.warn(`Warning: ${err.message}`);
              }
            }
          }
        }
        
        console.log('✅ รัน SQL Schema สำเร็จ!\n');
      } else {
        console.log('กรุณารัน database/schema.sql ด้วยตนเอง');
        rl.close();
        process.exit(1);
      }
    } else {
      console.log('✅ พบ Tables ทั้งหมดแล้ว!\n');
    }

    // ตรวจสอบ Admin User
    console.log('🔍 กำลังตรวจสอบ Admin User...');
    const userResult = await pool.query(
      "SELECT user_id, username, email, role, status FROM users WHERE username = 'admin'"
    );

    if (userResult.rows.length === 0) {
      console.log('⚠️  ไม่พบ Admin User');
      const createAdmin = await question('ต้องการสร้าง Admin User ตอนนี้ไหม? (y/n): ');
      
      if (createAdmin.toLowerCase() === 'y') {
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash('admin123', 10);
        
        await pool.query(
          `INSERT INTO users (username, email, password_hash, full_name, role, status)
           VALUES ($1, $2, $3, $4, 'Admin', 'Active')
           ON CONFLICT (username) DO NOTHING`,
          ['admin', 'admin@example.com', passwordHash, 'System Administrator']
        );
        
        console.log('✅ สร้าง Admin User สำเร็จ!');
        console.log('   Username: admin');
        console.log('   Password: admin123\n');
      }
    } else {
      console.log('✅ พบ Admin User แล้ว!\n');
    }

    await pool.end();
    console.log('🎉 ตั้งค่า Database เสร็จสมบูรณ์!');
    console.log('คุณสามารถเริ่มใช้งานระบบได้แล้วที่ http://localhost:3000\n');

  } catch (error) {
    console.error('\n❌ เกิดข้อผิดพลาด:', error.message);
    console.log('\n💡 คำแนะนำ:');
    
    if (error.message.includes('password authentication failed')) {
      console.log('   - ตรวจสอบรหัสผ่านใน .env.local');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('   - ตรวจสอบว่า PostgreSQL service ทำงานอยู่');
      console.log('   - ตรวจสอบ host และ port ใน .env.local');
    } else {
      console.log('   - ตรวจสอบ DATABASE_URL ใน .env.local');
      console.log('   - ตรวจสอบว่า PostgreSQL ทำงานอยู่');
    }
    
    rl.close();
    process.exit(1);
  } finally {
    rl.close();
  }
}

setupDatabase();

