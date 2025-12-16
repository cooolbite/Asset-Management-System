-- Add Vendors Table for managing vendors/suppliers
CREATE TABLE IF NOT EXISTS vendors (
    vendor_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    contact_person VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);

-- Trigger for updating updated_at
DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample vendors
INSERT INTO vendors (name, contact_person, email, phone, address, description) VALUES
('ABC Technology Co., Ltd.', 'John Doe', 'contact@abctech.com', '02-123-4567', '123 Tech Street, Bangkok', 'Computer and IT equipment supplier'),
('XYZ Office Supplies', 'Jane Smith', 'sales@xyzoffice.com', '02-987-6543', '456 Office Road, Bangkok', 'Office furniture and supplies')
ON CONFLICT (name) DO NOTHING;

