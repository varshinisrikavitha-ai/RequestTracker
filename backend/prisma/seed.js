const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Departments
  const itDept = await prisma.department.upsert({
    where: { name: 'Information Technology' },
    update: {},
    create: { name: 'Information Technology' },
  });

  const hrDept = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: { name: 'Human Resources' },
  });

  const financeDept = await prisma.department.upsert({
    where: { name: 'Finance' },
    update: {},
    create: { name: 'Finance' },
  });

  // Categories
  await prisma.category.createMany({
    data: [
      { name: 'Hardware Request', departmentId: itDept.id },
      { name: 'Software Installation', departmentId: itDept.id },
      { name: 'Network Issue', departmentId: itDept.id },
      { name: 'Leave Request', departmentId: hrDept.id },
      { name: 'Payroll Issue', departmentId: financeDept.id },
    ],
    skipDuplicates: true,
  });

  // Admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@requesttracker.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@requesttracker.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // IT Department Head
  const headPassword = await bcrypt.hash('Head@123', 12);
  await prisma.user.upsert({
    where: { email: 'ithead@requesttracker.com' },
    update: {},
    create: {
      name: 'IT Department Head',
      email: 'ithead@requesttracker.com',
      password: headPassword,
      role: 'DEPARTMENT_HEAD',
      departmentId: itDept.id,
    },
  });

  // Staff user
  const staffPassword = await bcrypt.hash('Staff@123', 12);
  await prisma.user.upsert({
    where: { email: 'staff@requesttracker.com' },
    update: {},
    create: {
      name: 'John Staff',
      email: 'staff@requesttracker.com',
      password: staffPassword,
      role: 'STAFF',
      departmentId: itDept.id,
    },
  });

  console.log('✅ Seeding complete!');
  console.log('');
  console.log('Seed accounts:');
  console.log('  Admin:   admin@requesttracker.com  /  Admin@123');
  console.log('  Head:    ithead@requesttracker.com /  Head@123');
  console.log('  Staff:   staff@requesttracker.com  /  Staff@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
