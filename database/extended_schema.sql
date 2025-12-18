-- Extended Asset Management System Database Schema
-- PostgreSQL
-- สร้างตารางสำหรับระบบแจ้งซ่อมและฟีเจอร์เพิ่มเติม

-- ============================================
-- 1. ระบบแจ้งซ่อม (Repair Management)
-- ============================================

-- ตารางประเภทปัญหา
CREATE TABLE IF NOT EXISTS problem_types (
    problem_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตารางงานซ่อม
CREATE TABLE IF NOT EXISTS repair_tickets (
    ticket_id SERIAL PRIMARY KEY,
    job_id VARCHAR(50) UNIQUE NOT NULL, -- Job ID อัตโนมัติ
    asset_id INTEGER REFERENCES assets(asset_id),
    equipment_id INTEGER, -- สำหรับอุปกรณ์ทั่วไป
    computer_id INTEGER, -- สำหรับคอมพิวเตอร์
    monitor_id INTEGER, -- สำหรับจอภาพ
    printer_id INTEGER, -- สำหรับเครื่องพิมพ์
    network_device_id INTEGER, -- สำหรับอุปกรณ์เครือข่าย
    problem_type_id INTEGER REFERENCES problem_types(problem_type_id),
    priority VARCHAR(20) NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled')),
    reported_by INTEGER NOT NULL REFERENCES users(user_id),
    assigned_to INTEGER REFERENCES users(user_id), -- ช่าง
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(200),
    reported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    root_cause TEXT,
    solution TEXT,
    total_cost DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตารางไฟล์แนบงานซ่อม
CREATE TABLE IF NOT EXISTS repair_attachments (
    attachment_id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES repair_tickets(ticket_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    uploaded_by INTEGER NOT NULL REFERENCES users(user_id),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตาราง Timeline งานซ่อม
CREATE TABLE IF NOT EXISTS repair_timeline (
    timeline_id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES repair_tickets(ticket_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    note TEXT,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตารางอะไหล่ที่ใช้ในงานซ่อม
CREATE TABLE IF NOT EXISTS repair_spare_parts (
    repair_part_id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES repair_tickets(ticket_id) ON DELETE CASCADE,
    spare_part_id INTEGER NOT NULL, -- จะอ้างอิงตาราง spare_parts
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(15, 2) NOT NULL DEFAULT 0,
    used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_by INTEGER NOT NULL REFERENCES users(user_id)
);

-- ============================================
-- 2. อุปกรณ์ทั่วไป (Equipment)
-- ============================================

CREATE TABLE IF NOT EXISTS equipment (
    equipment_id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL, -- รหัสทรัพย์สินอัตโนมัติ
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(50),
    purchase_date DATE,
    purchase_price DECIMAL(15, 2),
    warranty_expiry_date DATE,
    warranty_alert_days INTEGER DEFAULT 30, -- แจ้งเตือนก่อนหมดกี่วัน
    department VARCHAR(100),
    owner_id INTEGER REFERENCES users(user_id),
    location_id INTEGER REFERENCES locations(location_id),
    status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'In Use', 'Repair', 'Retired', 'Disposed')),
    allow_borrow BOOLEAN DEFAULT true,
    ip_address VARCHAR(45),
    mac_address VARCHAR(17),
    description TEXT,
    image_url VARCHAR(500),
    qr_code VARCHAR(500),
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. คอมพิวเตอร์ (Computers)
-- ============================================

CREATE TABLE IF NOT EXISTS computers (
    computer_id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(50),
    computer_type VARCHAR(20) NOT NULL CHECK (computer_type IN ('PC', 'Laptop')),
    cpu VARCHAR(200),
    ram VARCHAR(100),
    storage VARCHAR(200),
    storage_type VARCHAR(20) CHECK (storage_type IN ('HDD', 'SSD', 'NVMe')),
    os VARCHAR(100),
    os_version VARCHAR(50),
    purchase_date DATE,
    purchase_price DECIMAL(15, 2),
    warranty_expiry_date DATE,
    warranty_alert_days INTEGER DEFAULT 30,
    contract_number VARCHAR(100), -- เลขที่สัญญาเช่า
    contract_start_date DATE,
    contract_end_date DATE,
    monthly_rent DECIMAL(15, 2),
    lessor_company VARCHAR(200), -- บริษัทผู้ให้เช่า
    lessor_contact VARCHAR(200),
    it_responsible_id INTEGER REFERENCES users(user_id),
    user_id INTEGER REFERENCES users(user_id), -- ผู้เช่า/ผู้ใช้
    branch VARCHAR(100),
    department VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    description TEXT,
    image_url VARCHAR(500),
    qr_code VARCHAR(500),
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. จอภาพ (Monitors)
-- ============================================

CREATE TABLE IF NOT EXISTS monitors (
    monitor_id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(50),
    screen_size INTEGER, -- นิ้ว
    resolution VARCHAR(50),
    display_type VARCHAR(20) CHECK (display_type IN ('IPS', 'VA', 'TN', 'OLED')),
    ports VARCHAR(200), -- พอร์ตเชื่อมต่อ
    purchase_date DATE,
    purchase_price DECIMAL(15, 2),
    warranty_expiry_date DATE,
    warranty_alert_days INTEGER DEFAULT 30,
    computer_id INTEGER REFERENCES computers(computer_id), -- เชื่อมกับคอมพิวเตอร์
    it_responsible_id INTEGER REFERENCES users(user_id),
    branch VARCHAR(100),
    department VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    description TEXT,
    image_url VARCHAR(500),
    qr_code VARCHAR(500),
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. เครื่องพิมพ์ (Printers)
-- ============================================

CREATE TABLE IF NOT EXISTS printers (
    printer_id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(50),
    printer_type VARCHAR(20) CHECK (printer_type IN ('Laser', 'Inkjet', 'Dot Matrix', 'Thermal')),
    color_type VARCHAR(20) CHECK (color_type IN ('Color', 'Monochrome')),
    ip_address VARCHAR(45),
    purchase_date DATE,
    purchase_price DECIMAL(15, 2),
    warranty_expiry_date DATE,
    warranty_alert_days INTEGER DEFAULT 30,
    location_id INTEGER REFERENCES locations(location_id),
    branch VARCHAR(100),
    department VARCHAR(100),
    it_responsible_id INTEGER REFERENCES users(user_id),
    is_shared BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    description TEXT,
    image_url VARCHAR(500),
    qr_code VARCHAR(500),
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. อุปกรณ์เครือข่าย (Network Devices)
-- ============================================

CREATE TABLE IF NOT EXISTS network_devices (
    network_device_id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(50),
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('Router', 'Switch', 'Access Point', 'Firewall', 'Modem', 'Other')),
    ip_address VARCHAR(45),
    mac_address VARCHAR(17),
    port_count INTEGER,
    bandwidth VARCHAR(50),
    vlan VARCHAR(100),
    firmware_version VARCHAR(100),
    location VARCHAR(200), -- ห้อง Server/Rack
    branch VARCHAR(100),
    it_responsible_id INTEGER REFERENCES users(user_id),
    purchase_date DATE,
    purchase_price DECIMAL(15, 2),
    warranty_expiry_date DATE,
    warranty_alert_days INTEGER DEFAULT 30,
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    description TEXT,
    image_url VARCHAR(500),
    qr_code VARCHAR(500),
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. ตลับหมึก (Cartridges/Toner)
-- ============================================

CREATE TABLE IF NOT EXISTS cartridges (
    cartridge_id SERIAL PRIMARY KEY,
    model VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    color VARCHAR(20) CHECK (color IN ('C', 'M', 'Y', 'K', 'Black', 'Color')),
    type VARCHAR(50) CHECK (type IN ('Original', 'Compatible', 'Refill')),
    price DECIMAL(15, 2) DEFAULT 0,
    printer_model VARCHAR(200), -- รุ่นเครื่องพิมพ์ที่ใช้
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตาราง Stock ตลับหมึก
CREATE TABLE IF NOT EXISTS cartridge_stock (
    stock_id SERIAL PRIMARY KEY,
    cartridge_id INTEGER NOT NULL REFERENCES cartridges(cartridge_id),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_stock INTEGER NOT NULL DEFAULT 5,
    location VARCHAR(200), -- ตำแหน่งจัดเก็บ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตารางประวัติการรับ-เบิกตลับหมึก
CREATE TABLE IF NOT EXISTS cartridge_transactions (
    transaction_id SERIAL PRIMARY KEY,
    cartridge_id INTEGER NOT NULL REFERENCES cartridges(cartridge_id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('Receive', 'Issue', 'Adjust')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15, 2),
    total_price DECIMAL(15, 2),
    printer_id INTEGER REFERENCES printers(printer_id),
    repair_ticket_id INTEGER REFERENCES repair_tickets(ticket_id),
    notes TEXT,
    performed_by INTEGER NOT NULL REFERENCES users(user_id),
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. อะไหล่ (Spare Parts)
-- ============================================

CREATE TABLE IF NOT EXISTS spare_parts (
    spare_part_id SERIAL PRIMARY KEY,
    part_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'ชิ้น',
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตาราง Stock อะไหล่
CREATE TABLE IF NOT EXISTS spare_parts_stock (
    stock_id SERIAL PRIMARY KEY,
    spare_part_id INTEGER NOT NULL REFERENCES spare_parts(spare_part_id),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_stock INTEGER NOT NULL DEFAULT 5,
    max_stock INTEGER,
    location VARCHAR(200), -- ตำแหน่งจัดเก็บ
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตารางประวัติการรับ-เบิกอะไหล่
CREATE TABLE IF NOT EXISTS spare_parts_transactions (
    transaction_id SERIAL PRIMARY KEY,
    spare_part_id INTEGER NOT NULL REFERENCES spare_parts(spare_part_id),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('Receive', 'Issue', 'Adjust', 'Return')),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15, 2),
    total_price DECIMAL(15, 2),
    repair_ticket_id INTEGER REFERENCES repair_tickets(ticket_id),
    notes TEXT,
    performed_by INTEGER NOT NULL REFERENCES users(user_id),
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. ยืม-คืนอุปกรณ์ (Equipment Borrowing)
-- ============================================

CREATE TABLE IF NOT EXISTS borrow_requests (
    request_id SERIAL PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    equipment_id INTEGER REFERENCES equipment(equipment_id),
    computer_id INTEGER REFERENCES computers(computer_id),
    monitor_id INTEGER REFERENCES monitors(monitor_id),
    printer_id INTEGER REFERENCES printers(printer_id),
    network_device_id INTEGER REFERENCES network_devices(network_device_id),
    requested_by INTEGER NOT NULL REFERENCES users(user_id),
    approved_by INTEGER REFERENCES users(user_id),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Borrowed', 'Returned', 'Overdue')),
    request_reason TEXT NOT NULL,
    borrow_date DATE NOT NULL,
    expected_return_date DATE NOT NULL,
    actual_return_date DATE,
    condition_before VARCHAR(20) CHECK (condition_before IN ('Excellent', 'Good', 'Fair', 'Poor')),
    condition_after VARCHAR(20) CHECK (condition_after IN ('Excellent', 'Good', 'Fair', 'Poor')),
    rejection_reason TEXT,
    approved_at TIMESTAMP,
    borrowed_at TIMESTAMP,
    returned_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. บำรุงรักษาเชิงป้องกัน (PM)
-- ============================================

CREATE TABLE IF NOT EXISTS pm_schedules (
    schedule_id SERIAL PRIMARY KEY,
    schedule_name VARCHAR(200) NOT NULL,
    equipment_id INTEGER REFERENCES equipment(equipment_id),
    computer_id INTEGER REFERENCES computers(computer_id),
    monitor_id INTEGER REFERENCES monitors(monitor_id),
    printer_id INTEGER REFERENCES printers(printer_id),
    network_device_id INTEGER REFERENCES network_devices(network_device_id),
    frequency_type VARCHAR(20) NOT NULL CHECK (frequency_type IN ('Monthly', 'Quarterly', 'SemiAnnual', 'Annual', 'Custom')),
    frequency_value INTEGER NOT NULL DEFAULT 1, -- จำนวนเดือน/ไตรมาส/ปี
    next_due_date DATE NOT NULL,
    assigned_to INTEGER REFERENCES users(user_id), -- ช่าง
    is_active BOOLEAN DEFAULT true,
    alert_days INTEGER DEFAULT 7, -- แจ้งเตือนก่อนถึงกำหนดกี่วัน
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตาราง Checklist PM
CREATE TABLE IF NOT EXISTS pm_checklists (
    checklist_id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL REFERENCES pm_schedules(schedule_id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    item_order INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตารางผลการทำ PM
CREATE TABLE IF NOT EXISTS pm_results (
    result_id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL REFERENCES pm_schedules(schedule_id),
    due_date DATE NOT NULL,
    performed_date DATE,
    performed_by INTEGER REFERENCES users(user_id),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Skipped')),
    findings TEXT,
    actions_taken TEXT,
    next_due_date DATE,
    attachments JSONB, -- รูปภาพ/ไฟล์
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตารางผล Checklist แต่ละรายการ
CREATE TABLE IF NOT EXISTS pm_checklist_results (
    checklist_result_id SERIAL PRIMARY KEY,
    result_id INTEGER NOT NULL REFERENCES pm_results(result_id) ON DELETE CASCADE,
    checklist_id INTEGER NOT NULL REFERENCES pm_checklists(checklist_id),
    is_checked BOOLEAN DEFAULT false,
    note TEXT,
    checked_at TIMESTAMP
);

-- ============================================
-- 11. โดเมน (Domains)
-- ============================================

CREATE TABLE IF NOT EXISTS domains (
    domain_id SERIAL PRIMARY KEY,
    domain_name VARCHAR(255) NOT NULL UNIQUE,
    registrar VARCHAR(200),
    registration_date DATE,
    expiry_date DATE NOT NULL,
    alert_days INTEGER DEFAULT 30,
    hosting_provider VARCHAR(200),
    hosting_package VARCHAR(100),
    hosting_cost DECIMAL(15, 2),
    hosting_expiry_date DATE,
    ssl_type VARCHAR(50),
    ssl_issuer VARCHAR(200),
    ssl_expiry_date DATE,
    ssl_alert_days INTEGER DEFAULT 30,
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 12. ซอฟต์แวร์ (Software Licenses)
-- ============================================

CREATE TABLE IF NOT EXISTS software_licenses (
    license_id SERIAL PRIMARY KEY,
    software_name VARCHAR(200) NOT NULL,
    version VARCHAR(100),
    license_type VARCHAR(50) NOT NULL CHECK (license_type IN ('Perpetual', 'Subscription', 'Trial')),
    license_key TEXT,
    total_licenses INTEGER NOT NULL DEFAULT 1 CHECK (total_licenses > 0),
    used_licenses INTEGER NOT NULL DEFAULT 0 CHECK (used_licenses >= 0),
    purchase_date DATE,
    purchase_price DECIMAL(15, 2),
    vendor VARCHAR(200),
    expiry_date DATE,
    alert_days INTEGER DEFAULT 30,
    invoice_number VARCHAR(100),
    contract_number VARCHAR(100),
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการติดตั้ง License บนเครื่อง
CREATE TABLE IF NOT EXISTS license_installations (
    installation_id SERIAL PRIMARY KEY,
    license_id INTEGER NOT NULL REFERENCES software_licenses(license_id) ON DELETE CASCADE,
    computer_id INTEGER REFERENCES computers(computer_id),
    equipment_id INTEGER REFERENCES equipment(equipment_id),
    installed_by INTEGER REFERENCES users(user_id),
    installed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    uninstalled_date DATE,
    notes TEXT
);

-- ============================================
-- 13. สัญญา (Contracts)
-- ============================================

CREATE TABLE IF NOT EXISTS contracts (
    contract_id SERIAL PRIMARY KEY,
    contract_number VARCHAR(100) NOT NULL UNIQUE,
    contract_type VARCHAR(50) NOT NULL CHECK (contract_type IN ('Lease', 'Service', 'Maintenance', 'Other')),
    title VARCHAR(200) NOT NULL,
    vendor_company VARCHAR(200) NOT NULL,
    vendor_contact VARCHAR(200),
    vendor_phone VARCHAR(50),
    vendor_email VARCHAR(255),
    vendor_address TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    contract_value DECIMAL(15, 2),
    payment_terms TEXT,
    alert_days INTEGER DEFAULT 30,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Cancelled', 'Renewed')),
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตารางเอกสารสัญญา
CREATE TABLE IF NOT EXISTS contract_documents (
    document_id SERIAL PRIMARY KEY,
    contract_id INTEGER NOT NULL REFERENCES contracts(contract_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('Contract', 'Quotation', 'Invoice', 'Other')),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    uploaded_by INTEGER NOT NULL REFERENCES users(user_id),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 14. ผู้ใช้และสิทธิ์ (Users & Permissions)
-- ============================================

-- เพิ่มคอลัมน์ในตาราง users ที่มีอยู่แล้ว
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(100);

-- ตาราง User Profiles (Role แบบละเอียด)
CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id SERIAL PRIMARY KEY,
    profile_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}', -- เก็บสิทธิ์แบบ JSON
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตารางการกำหนด Profile ให้ User
CREATE TABLE IF NOT EXISTS user_profile_assignments (
    assignment_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    profile_id INTEGER NOT NULL REFERENCES user_profiles(profile_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, profile_id)
);

-- ============================================
-- 15. LDAP/Active Directory
-- ============================================

CREATE TABLE IF NOT EXISTS ldap_settings (
    setting_id SERIAL PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT false,
    ldap_type VARCHAR(20) NOT NULL CHECK (ldap_type IN ('LDAP', 'Active Directory')),
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 389,
    base_dn VARCHAR(500) NOT NULL,
    admin_dn VARCHAR(500),
    admin_password VARCHAR(255), -- ควรเข้ารหัส
    username_attribute VARCHAR(50) DEFAULT 'sAMAccountName',
    default_role VARCHAR(20) DEFAULT 'Staff',
    default_profile_id INTEGER REFERENCES user_profiles(profile_id),
    user_filter VARCHAR(500),
    sync_schedule VARCHAR(50), -- Cron expression
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 16. ตั้งค่าระบบ (System Settings)
-- ============================================

CREATE TABLE IF NOT EXISTS system_settings (
    setting_id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'text',
    category VARCHAR(50),
    description TEXT,
    updated_by INTEGER REFERENCES users(user_id),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตารางสาขา (Branches)
CREATE TABLE IF NOT EXISTS branches (
    branch_id SERIAL PRIMARY KEY,
    branch_code VARCHAR(50) UNIQUE NOT NULL,
    branch_name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ตารางแผนก (Departments)
CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    department_code VARCHAR(50) UNIQUE NOT NULL,
    department_name VARCHAR(200) NOT NULL,
    branch_id INTEGER REFERENCES branches(branch_id),
    manager_id INTEGER REFERENCES users(user_id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Indexes
-- ============================================

-- Repair Management
CREATE INDEX IF NOT EXISTS idx_repair_tickets_status ON repair_tickets(status);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_assigned_to ON repair_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_reported_by ON repair_tickets(reported_by);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_asset_id ON repair_tickets(asset_id);
CREATE INDEX IF NOT EXISTS idx_repair_tickets_job_id ON repair_tickets(job_id);
CREATE INDEX IF NOT EXISTS idx_repair_timeline_ticket ON repair_timeline(ticket_id);

-- Equipment
CREATE INDEX IF NOT EXISTS idx_equipment_asset_code ON equipment(asset_code);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(location_id);

-- Computers
CREATE INDEX IF NOT EXISTS idx_computers_asset_code ON computers(asset_code);
CREATE INDEX IF NOT EXISTS idx_computers_status ON computers(status);
CREATE INDEX IF NOT EXISTS idx_computers_contract_end ON computers(contract_end_date);

-- Monitors
CREATE INDEX IF NOT EXISTS idx_monitors_asset_code ON monitors(asset_code);
CREATE INDEX IF NOT EXISTS idx_monitors_computer_id ON monitors(computer_id);

-- Printers
CREATE INDEX IF NOT EXISTS idx_printers_asset_code ON printers(asset_code);
CREATE INDEX IF NOT EXISTS idx_printers_status ON printers(status);

-- Network Devices
CREATE INDEX IF NOT EXISTS idx_network_devices_asset_code ON network_devices(asset_code);
CREATE INDEX IF NOT EXISTS idx_network_devices_type ON network_devices(device_type);

-- Cartridges
CREATE INDEX IF NOT EXISTS idx_cartridge_stock_cartridge ON cartridge_stock(cartridge_id);
CREATE INDEX IF NOT EXISTS idx_cartridge_transactions_date ON cartridge_transactions(transaction_date);

-- Spare Parts
CREATE INDEX IF NOT EXISTS idx_spare_parts_part_code ON spare_parts(part_code);
CREATE INDEX IF NOT EXISTS idx_spare_parts_stock_part ON spare_parts_stock(spare_part_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_transactions_date ON spare_parts_transactions(transaction_date);

-- Borrowing
CREATE INDEX IF NOT EXISTS idx_borrow_requests_status ON borrow_requests(status);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_requested_by ON borrow_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_expected_return ON borrow_requests(expected_return_date);

-- PM
CREATE INDEX IF NOT EXISTS idx_pm_schedules_next_due ON pm_schedules(next_due_date);
CREATE INDEX IF NOT EXISTS idx_pm_schedules_is_active ON pm_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_pm_results_schedule ON pm_results(schedule_id);
CREATE INDEX IF NOT EXISTS idx_pm_results_status ON pm_results(status);

-- Domains
CREATE INDEX IF NOT EXISTS idx_domains_expiry ON domains(expiry_date);
CREATE INDEX IF NOT EXISTS idx_domains_ssl_expiry ON domains(ssl_expiry_date);

-- Software Licenses
CREATE INDEX IF NOT EXISTS idx_software_licenses_expiry ON software_licenses(expiry_date);
CREATE INDEX IF NOT EXISTS idx_license_installations_license ON license_installations(license_id);

-- Contracts
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- ============================================
-- Triggers
-- ============================================

-- Trigger สำหรับอัปเดต updated_at
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_computers_updated_at BEFORE UPDATE ON computers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitors_updated_at BEFORE UPDATE ON monitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_printers_updated_at BEFORE UPDATE ON printers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_network_devices_updated_at BEFORE UPDATE ON network_devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repair_tickets_updated_at BEFORE UPDATE ON repair_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_borrow_requests_updated_at BEFORE UPDATE ON borrow_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pm_schedules_updated_at BEFORE UPDATE ON pm_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pm_results_updated_at BEFORE UPDATE ON pm_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cartridge_stock_updated_at BEFORE UPDATE ON cartridge_stock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spare_parts_updated_at BEFORE UPDATE ON spare_parts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spare_parts_stock_updated_at BEFORE UPDATE ON spare_parts_stock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_software_licenses_updated_at BEFORE UPDATE ON software_licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ldap_settings_updated_at BEFORE UPDATE ON ldap_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Function สำหรับสร้าง Job ID อัตโนมัติ
-- ============================================

CREATE OR REPLACE FUNCTION generate_job_id()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_job_id VARCHAR(50);
    year_part VARCHAR(4);
    seq_num INTEGER;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    -- หา sequence number ของปีนี้
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_id FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM repair_tickets
    WHERE job_id LIKE 'JOB-' || year_part || '-%';
    
    new_job_id := 'JOB-' || year_part || '-' || LPAD(seq_num::TEXT, 6, '0');
    RETURN new_job_id;
END;
$$ LANGUAGE plpgsql;

-- Function สำหรับสร้าง Asset Code อัตโนมัติ
CREATE OR REPLACE FUNCTION generate_asset_code(prefix VARCHAR(10))
RETURNS VARCHAR(50) AS $$
DECLARE
    new_code VARCHAR(50);
    year_part VARCHAR(4);
    seq_num INTEGER;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YY');
    
    -- หา sequence number ของปีนี้
    SELECT COALESCE(MAX(CAST(SUBSTRING(asset_code FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM equipment
    WHERE asset_code LIKE prefix || year_part || '%';
    
    new_code := prefix || year_part || LPAD(seq_num::TEXT, 6, '0');
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

