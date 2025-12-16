import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

// Asset validation schema
export const assetCreateSchema = z.object({
  serialNumber: z.string().min(1, 'Serial number is required').max(50, 'Serial number must be less than 50 characters'),
  assetName: z.string().min(1, 'Asset name is required').max(200, 'Asset name must be less than 200 characters'),
  assetType: z.enum(['Hardware', 'Software', 'Physical Asset'], {
    errorMap: () => ({ message: 'Asset type must be Hardware, Software, or Physical Asset' }),
  }),
  categoryId: z.number().int().positive('Category ID must be a positive integer'),
  locationId: z.number().int().positive('Location ID must be a positive integer'),
  acquisitionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Acquisition date must be in YYYY-MM-DD format'),
  cost: z.number().nonnegative('Cost must be greater than or equal to 0'),
  status: z.enum(['Available', 'In Use', 'Maintenance', 'Retired', 'Lost']).optional().default('Available'),
  description: z.string().optional(),
  vendorSupplier: z.string().max(200, 'Vendor/Supplier must be less than 200 characters').optional(),
  warrantyExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Warranty expiry date must be in YYYY-MM-DD format').optional(),
});

export const assetUpdateSchema = assetCreateSchema.partial().omit({ serialNumber: true });

// Checkout validation schema
export const checkoutSchema = z.object({
  assignedTo: z.string().min(1, 'Assigned to is required'),
  assignedLocation: z.string().min(1, 'Assigned location is required').max(200, 'Assigned location must be less than 200 characters'),
  checkoutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Checkout date must be in YYYY-MM-DD format').optional(),
  expectedReturnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected return date must be in YYYY-MM-DD format').optional(),
  purposeReason: z.string().optional(),
});

