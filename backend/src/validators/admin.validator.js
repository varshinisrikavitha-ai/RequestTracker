const { z } = require('zod');

const optionalCuidFromForm = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().cuid().optional()
);

const nullableCuidFromForm = z.preprocess(
  (value) => (value === '' ? null : value),
  z.string().cuid().nullable().optional()
);

const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').max(100),
});

const categorySchema = z.object({
  name: z.string().min(2).max(100),
  departmentId: z.string().cuid('Invalid department ID'),
});

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['ADMIN', 'DEPARTMENT_HEAD', 'STAFF', 'VIEWER']),
  departmentId: optionalCuidFromForm,
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['ADMIN', 'DEPARTMENT_HEAD', 'STAFF', 'VIEWER']).optional(),
  departmentId: nullableCuidFromForm,
  isActive: z.boolean().optional(),
});

module.exports = { departmentSchema, categorySchema, createUserSchema, updateUserSchema };
