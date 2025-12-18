-- Mockup Data for Asset Management System
-- ข้อมูลตัวอย่างสำหรับทดสอบระบบ

-- ============================================
-- 1. ประเภทปัญหา
-- ============================================
INSERT INTO problem_types (name, description) VALUES
('ไม่เปิดเครื่อง', 'อุปกรณ์ไม่สามารถเปิดได้'),
('จอภาพไม่แสดงผล', 'จอภาพไม่แสดงภาพหรือแสดงภาพผิดปกติ'),
('เสียงดังผิดปกติ', 'อุปกรณ์มีเสียงดังผิดปกติ'),
('ช้า/ค้าง', 'ระบบทำงานช้าหรือค้าง'),
('ไวรัส/มัลแวร์', 'พบไวรัสหรือมัลแวร์ในระบบ'),
('เชื่อมต่อเครือข่ายไม่ได้', 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตหรือเครือข่ายได้'),
('เครื่องพิมพ์ไม่ทำงาน', 'เครื่องพิมพ์ไม่สามารถพิมพ์ได้'),
('ซอฟต์แวร์ผิดพลาด', 'ซอฟต์แวร์ทำงานผิดพลาดหรือไม่สามารถใช้งานได้'),
('ฮาร์ดแวร์เสียหาย', 'อุปกรณ์ฮาร์ดแวร์เสียหาย'),
('อื่นๆ', 'ปัญหาอื่นๆ ที่ไม่ได้ระบุ')
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. สาขา (Branches)
-- ============================================
INSERT INTO branches (branch_code, branch_name, address, phone, email) VALUES
('HQ', 'สำนักงานใหญ่', '123 ถนนสุขุมวิท กรุงเทพมหานคร 10110', '02-123-4567', 'hq@company.com'),
('BR001', 'สาขาเชียงใหม่', '456 ถนนนิมมานเหมินทร์ เชียงใหม่ 50200', '053-123-456', 'chiangmai@company.com'),
('BR002', 'สาขาพัทยา', '789 ถนนพัทยา ชลบุรี 20150', '038-123-456', 'pattaya@company.com'),
('BR003', 'สาขาหาดใหญ่', '321 ถนนนิพัทธ์สงเคราะห์ สงขลา 90110', '074-123-456', 'hatyai@company.com')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. แผนก (Departments)
-- ============================================
INSERT INTO departments (department_code, department_name, branch_id) VALUES
('IT', 'แผนก IT', 1),
('HR', 'แผนกทรัพยากรบุคคล', 1),
('FIN', 'แผนกการเงิน', 1),
('SALES', 'แผนกขาย', 1),
('IT-BR001', 'แผนก IT สาขาเชียงใหม่', 2),
('IT-BR002', 'แผนก IT สาขาพัทยา', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. User Profiles
-- ============================================
INSERT INTO user_profiles (profile_name, description, permissions) VALUES
('Admin', 'ผู้ดูแลระบบ', '{"all": true}'),
('Technician', 'ช่างซ่อม', '{"repair": {"create": true, "update": true, "view": true}, "pm": {"create": true, "update": true, "view": true}}'),
('Manager', 'ผู้จัดการ', '{"view": true, "report": true, "approve": true}'),
('User', 'ผู้ใช้งานทั่วไป', '{"repair": {"create": true, "view": true}, "borrow": {"create": true, "view": true}}')
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. อุปกรณ์ทั่วไป (Equipment) - ตัวอย่าง
-- ============================================
-- ต้องมี users และ locations ก่อน
-- สมมติว่ามี user_id = 1 และ location_id = 1

-- ============================================
-- 6. คอมพิวเตอร์ (Computers) - ตัวอย่าง
-- ============================================
-- ต้องรอให้มี users ก่อน

-- ============================================
-- 7. จอภาพ (Monitors) - ตัวอย่าง
-- ============================================

-- ============================================
-- 8. เครื่องพิมพ์ (Printers) - ตัวอย่าง
-- ============================================

-- ============================================
-- 9. อุปกรณ์เครือข่าย (Network Devices) - ตัวอย่าง
-- ============================================
INSERT INTO network_devices (asset_code, name, brand, model, serial_number, device_type, ip_address, branch, status, created_by) VALUES
('NET24001', 'Router สำนักงานใหญ่', 'Cisco', 'ASR 1000', 'CISCO-001', 'Router', '192.168.1.1', 'สำนักงานใหญ่', 'Available', 1),
('NET24002', 'Switch ชั้น 1', 'HP', 'ProCurve 2920', 'HP-001', 'Switch', '192.168.1.10', 'สำนักงานใหญ่', 'Available', 1),
('NET24003', 'Access Point ชั้น 2', 'Ubiquiti', 'UniFi AP AC Pro', 'UBNT-001', 'Access Point', '192.168.1.20', 'สำนักงานใหญ่', 'Available', 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. ตลับหมึก (Cartridges)
-- ============================================
INSERT INTO cartridges (model, brand, color, type, price, printer_model) VALUES
('HP 305 Black', 'HP', 'Black', 'Original', 450.00, 'HP LaserJet Pro M404dn'),
('HP 305 Color', 'HP', 'Color', 'Original', 1200.00, 'HP LaserJet Pro M404dn'),
('Canon PG-47', 'Canon', 'Black', 'Original', 350.00, 'Canon PIXMA G3010'),
('Canon CL-57', 'Canon', 'Color', 'Original', 450.00, 'Canon PIXMA G3010'),
('Brother TN-660', 'Brother', 'Black', 'Original', 550.00, 'Brother HL-L2350DW')
ON CONFLICT DO NOTHING;

INSERT INTO cartridge_stock (cartridge_id, quantity, min_stock) VALUES
(1, 10, 5),
(2, 8, 5),
(3, 15, 10),
(4, 12, 10),
(5, 6, 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- 11. อะไหล่ (Spare Parts)
-- ============================================
INSERT INTO spare_parts (part_code, name, category, brand, model, unit_price, unit) VALUES
('SP001', 'RAM DDR4 8GB', 'Memory', 'Kingston', 'KVR16N11S8/8', 1200.00, 'ชิ้น'),
('SP002', 'SSD 256GB', 'Storage', 'Samsung', '870 EVO', 2500.00, 'ชิ้น'),
('SP003', 'Power Supply 500W', 'Power', 'Corsair', 'CV550', 1800.00, 'ชิ้น'),
('SP004', 'Keyboard', 'Peripheral', 'Logitech', 'K120', 350.00, 'ชิ้น'),
('SP005', 'Mouse', 'Peripheral', 'Logitech', 'M100', 250.00, 'ชิ้น'),
('SP006', 'HDMI Cable', 'Cable', 'Generic', 'HDMI 2.0', 150.00, 'เส้น'),
('SP007', 'VGA Cable', 'Cable', 'Generic', 'VGA', 100.00, 'เส้น'),
('SP008', 'Ethernet Cable Cat6', 'Cable', 'Generic', 'Cat6', 80.00, 'เมตร')
ON CONFLICT DO NOTHING;

INSERT INTO spare_parts_stock (spare_part_id, quantity, min_stock, max_stock) VALUES
(1, 20, 10, 50),
(2, 15, 10, 40),
(3, 10, 5, 30),
(4, 30, 20, 100),
(5, 25, 20, 100),
(6, 50, 30, 200),
(7, 40, 30, 200),
(8, 200, 100, 500)
ON CONFLICT DO NOTHING;

-- ============================================
-- 12. โดเมน (Domains)
-- ============================================
INSERT INTO domains (domain_name, registrar, registration_date, expiry_date, alert_days, hosting_provider, hosting_expiry_date, ssl_type, ssl_expiry_date, created_by) VALUES
('example.com', 'Namecheap', '2020-01-15', '2025-01-15', 30, 'Cloudflare', '2025-01-15', 'SSL Certificate', '2025-01-15', 1),
('company.co.th', 'THNIC', '2019-06-01', '2024-06-01', 30, 'AWS', '2024-12-31', 'Wildcard SSL', '2024-12-31', 1),
('app.example.com', 'Namecheap', '2021-03-20', '2025-03-20', 30, 'DigitalOcean', '2025-03-20', 'Let''s Encrypt', '2025-03-20', 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- 13. ซอฟต์แวร์ (Software Licenses)
-- ============================================
INSERT INTO software_licenses (software_name, version, license_type, license_key, total_licenses, used_licenses, purchase_date, purchase_price, vendor, expiry_date, created_by) VALUES
('Microsoft Office 365', '2021', 'Subscription', 'XXXXX-XXXXX-XXXXX-XXXXX', 50, 35, '2023-01-01', 50000.00, 'Microsoft', '2024-12-31', 1),
('Windows 11 Pro', '11', 'Perpetual', 'XXXXX-XXXXX-XXXXX-XXXXX', 100, 85, '2022-06-01', 8000.00, 'Microsoft', NULL, 1),
('Adobe Creative Cloud', '2024', 'Subscription', 'XXXXX-XXXXX-XXXXX-XXXXX', 20, 15, '2023-01-01', 120000.00, 'Adobe', '2024-12-31', 1),
('Antivirus Enterprise', '2024', 'Subscription', 'XXXXX-XXXXX-XXXXX-XXXXX', 200, 180, '2023-01-01', 150000.00, 'Kaspersky', '2024-12-31', 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- 14. สัญญา (Contracts)
-- ============================================
INSERT INTO contracts (contract_number, contract_type, title, vendor_company, vendor_contact, vendor_phone, vendor_email, start_date, end_date, contract_value, alert_days, status, created_by) VALUES
('CNT-2024-001', 'Lease', 'สัญญาเช่าคอมพิวเตอร์', 'ABC Computer Co., Ltd.', 'คุณสมชาย ใจดี', '02-111-2222', 'contact@abccomputer.com', '2024-01-01', '2024-12-31', 500000.00, 30, 'Active', 1),
('CNT-2024-002', 'Service', 'สัญญาบริการบำรุงรักษา', 'XYZ Service Co., Ltd.', 'คุณสมหญิง รักงาน', '02-333-4444', 'service@xyzservice.com', '2024-01-01', '2024-12-31', 300000.00, 30, 'Active', 1),
('CNT-2024-003', 'Maintenance', 'สัญญาบำรุงรักษาเครื่องพิมพ์', 'Print Service Co., Ltd.', 'คุณสมศักดิ์ ขยัน', '02-555-6666', 'maintenance@printservice.com', '2024-01-01', '2024-12-31', 200000.00, 30, 'Active', 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- 15. System Settings
-- ============================================
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description) VALUES
('system_name', 'ระบบจัดการทรัพย์สิน IT', 'text', 'general', 'ชื่อระบบ'),
('company_name', 'บริษัท ตัวอย่าง จำกัด', 'text', 'general', 'ชื่อบริษัท'),
('company_address', '123 ถนนสุขุมวิท กรุงเทพมหานคร 10110', 'text', 'general', 'ที่อยู่บริษัท'),
('company_phone', '02-123-4567', 'text', 'general', 'เบอร์โทรศัพท์'),
('company_email', 'info@company.com', 'email', 'general', 'อีเมลบริษัท'),
('warranty_alert_days', '30', 'number', 'notification', 'จำนวนวันแจ้งเตือนก่อนประกันหมดอายุ'),
('pm_alert_days', '7', 'number', 'notification', 'จำนวนวันแจ้งเตือนก่อนถึงกำหนด PM'),
('contract_alert_days', '30', 'number', 'notification', 'จำนวนวันแจ้งเตือนก่อนสัญญาหมดอายุ'),
('email_notification_enabled', 'true', 'boolean', 'notification', 'เปิด/ปิดการแจ้งเตือนทางอีเมล'),
('line_notify_enabled', 'false', 'boolean', 'notification', 'เปิด/ปิดการแจ้งเตือนผ่าน LINE Notify'),
('line_notify_token', '', 'text', 'notification', 'LINE Notify Token')
ON CONFLICT DO NOTHING;

