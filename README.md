# Asset Management System

A comprehensive full-stack asset management system built with Next.js, designed for tracking and managing hardware, software, and physical assets in organizations.

## Features

- **Asset Management**: Complete CRUD operations for assets with detailed tracking
- **Check-in/Check-out System**: Track asset assignments and returns
- **Category & Location Management**: Organize assets by categories and locations
- **Vendor/Supplier Management**: Maintain vendor information
- **User & Role Management**: Admin and Staff roles with role-based access control
- **Transaction History**: Complete audit trail of all asset movements
- **Search & Filter**: Advanced search and filtering capabilities
- **Dashboard**: Overview statistics and recent activities
- **JWT Authentication**: Secure server-side authentication

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: CSS Modules
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/cooolbite/asset-management-system.git
cd asset-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/asset_management
JWT_SECRET=your-secret-key-min-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters-long
JWT_EXPIRES_IN=86400
JWT_REFRESH_EXPIRES_IN=604800
```

4. **Set up the database**

```bash
# Create database
psql -U postgres -c "CREATE DATABASE asset_management;"

# Run schema
psql -U postgres -d asset_management -f database/schema.sql

# Add vendors table
npm run add-vendors
```

5. **Create admin user**

```bash
npm run create-admin
```

Default credentials:
- Username: `admin`
- Password: `admin123`

6. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
asset-management-system/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── assets/       # Asset management endpoints
│   │   ├── categories/   # Category management endpoints
│   │   ├── locations/    # Location management endpoints
│   │   ├── transactions/ # Transaction endpoints
│   │   ├── users/        # User management endpoints
│   │   └── vendors/      # Vendor management endpoints
│   ├── dashboard/         # Dashboard pages
│   ├── login/           # Login page
│   └── layout.tsx       # Root layout
├── components/          # React components
├── lib/                 # Utility libraries
│   ├── auth.ts         # Authentication utilities
│   ├── db.ts           # Database connection
│   ├── middleware.ts   # API middleware
│   └── validation.ts   # Validation schemas
├── database/           # Database scripts
│   ├── schema.sql      # Main database schema
│   └── add_vendors_table.sql  # Vendors table
└── scripts/            # Utility scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Assets
- `GET /api/assets` - List assets (with search, filter, pagination)
- `POST /api/assets` - Create asset (Admin only)
- `GET /api/assets/[id]` - Get asset details
- `PUT /api/assets/[id]` - Update asset (Admin only)
- `POST /api/assets/[id]/checkout` - Check-out asset

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (Admin only)
- `GET /api/categories/[id]` - Get category details
- `PUT /api/categories/[id]` - Update category (Admin only)
- `DELETE /api/categories/[id]` - Delete category (Admin only)

### Locations
- `GET /api/locations` - List locations
- `POST /api/locations` - Create location (Admin only)
- `GET /api/locations/[id]` - Get location details
- `PUT /api/locations/[id]` - Update location (Admin only)
- `DELETE /api/locations/[id]` - Delete location (Admin only)

### Vendors
- `GET /api/vendors` - List vendors
- `POST /api/vendors` - Create vendor (Admin only)
- `GET /api/vendors/[id]` - Get vendor details
- `PUT /api/vendors/[id]` - Update vendor (Admin only)
- `DELETE /api/vendors/[id]` - Delete vendor (Admin only)

### Transactions
- `GET /api/transactions` - List transactions (with filters)

### Users
- `GET /api/users` - List users (Admin only)
- `POST /api/users` - Create user (Admin only)

## User Roles

### Admin
- Full access to all features
- Can create, edit, and delete assets, categories, locations, vendors, and users
- Can view all transactions

### Staff
- View-only access to assets
- Can check-out and check-in assets
- Can view own transaction history

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run create-admin` - Create admin user
- `npm run test-db` - Test database connection
- `npm run run-schema` - Run database schema
- `npm run add-vendors` - Add vendors table

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**cooolbite**

## Acknowledgments

Built with Next.js, PostgreSQL, and modern web technologies.
