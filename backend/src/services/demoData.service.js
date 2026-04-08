const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;

const DEFAULT_DEPARTMENT = 'IT';

const DEMO_DEPARTMENTS = ['Engineering', 'Design', 'IT', 'HR', 'Finance'];

const DEMO_CATEGORIES = [
  { name: 'Hardware', department: 'Engineering' },
  { name: 'Software', department: 'Engineering' },
  { name: 'Design Tools', department: 'Design' },
  { name: 'Graphics', department: 'Design' },
  { name: 'Network', department: 'IT' },
  { name: 'Access', department: 'IT' },
  { name: 'Recruitment', department: 'HR' },
  { name: 'Leave', department: 'HR' },
  { name: 'Budget', department: 'Finance' },
  { name: 'Payroll', department: 'Finance' },
];

const DEMO_USERS = [
  {
    name: 'System Admin',
    email: 'admin@requesttracker.com',
    password: 'Admin@123',
    role: 'ADMIN',
    department: null,
  },
  {
    name: 'Varshini Admin',
    email: 'varshini.admin@requesttracker.com',
    password: 'Admin@123',
    role: 'ADMIN',
    department: null,
  },
  {
    name: 'IT Head',
    email: 'ithead@requesttracker.com',
    password: 'Head@123',
    role: 'DEPARTMENT_HEAD',
    department: 'IT',
  },
  {
    name: 'Design Head',
    email: 'designhead@requesttracker.com',
    password: 'Head@123',
    role: 'DEPARTMENT_HEAD',
    department: 'Design',
  },
  {
    name: 'John Smith',
    email: 'john.smith@company.com',
    password: 'Password@123',
    role: 'STAFF',
    department: 'Engineering',
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@company.com',
    password: 'Password@123',
    role: 'STAFF',
    department: 'HR',
  },
];

const SAMPLE_TEMPLATES = [
  {
    title: 'Hardware Upgrade Request',
    description: 'Requesting workstation hardware upgrade for improved performance.',
    priority: 'HIGH',
    status: 'SUBMITTED',
  },
  {
    title: 'Software Access Request',
    description: 'Need required software access to continue current project tasks.',
    priority: 'MEDIUM',
    status: 'UNDER_REVIEW',
  },
];

const ensureCatalog = async () => {
  const departments = {};
  for (const name of DEMO_DEPARTMENTS) {
    const department = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    departments[name] = department;
  }

  const categoriesByDepartment = {};

  for (const def of DEMO_CATEGORIES) {
    const department = departments[def.department];
    const category = await prisma.category.upsert({
      where: {
        name_departmentId: {
          name: def.name,
          departmentId: department.id,
        },
      },
      update: {},
      create: {
        name: def.name,
        departmentId: department.id,
      },
    });

    if (!categoriesByDepartment[def.department]) {
      categoriesByDepartment[def.department] = [];
    }
    categoriesByDepartment[def.department].push(category);
  }

  return { departments, categoriesByDepartment };
};

const getDefaultDepartmentId = async () => {
  const { departments } = await ensureCatalog();
  return departments[DEFAULT_DEPARTMENT].id;
};

const ensureUserDepartment = async (user) => {
  if (user.role === 'ADMIN') return user;
  if (user.departmentId) return user;

  const defaultDepartmentId = await getDefaultDepartmentId();
  return prisma.user.update({
    where: { id: user.id },
    data: { departmentId: defaultDepartmentId },
  });
};

const createStatusHistory = async (requestId, userId, status) => {
  const sequence =
    status === 'UNDER_REVIEW'
      ? ['SUBMITTED', 'UNDER_REVIEW']
      : ['SUBMITTED'];

  for (const step of sequence) {
    await prisma.requestStatusHistory.create({
      data: {
        requestId,
        status: step,
        updatedBy: userId,
        comment: step === 'UNDER_REVIEW' ? 'Moved to review queue' : 'Request submitted',
      },
    });
  }
};

const ensureSampleDataForUser = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) return { created: 0, skipped: true };

  const normalizedUser = await ensureUserDepartment(user);
  const existingCount = await prisma.request.count({ where: { createdBy: normalizedUser.id } });
  if (existingCount > 0) return { created: 0, skipped: true };

  const { departments, categoriesByDepartment } = await ensureCatalog();

  const departmentName =
    DEMO_DEPARTMENTS.find((name) => departments[name].id === normalizedUser.departmentId) ||
    DEFAULT_DEPARTMENT;

  const departmentId =
    normalizedUser.role === 'ADMIN' && !normalizedUser.departmentId
      ? departments[DEFAULT_DEPARTMENT].id
      : normalizedUser.departmentId || departments[DEFAULT_DEPARTMENT].id;

  const categoryPool = categoriesByDepartment[departmentName] || categoriesByDepartment[DEFAULT_DEPARTMENT];

  let created = 0;
  for (let index = 0; index < SAMPLE_TEMPLATES.length; index += 1) {
    const template = SAMPLE_TEMPLATES[index];
    const category = categoryPool[index % categoryPool.length];

    const request = await prisma.request.create({
      data: {
        title: `${template.title} - ${normalizedUser.name}`,
        description: template.description,
        priority: template.priority,
        status: template.status,
        categoryId: category.id,
        departmentId,
        createdBy: normalizedUser.id,
      },
    });

    await createStatusHistory(request.id, normalizedUser.id, template.status);
    created += 1;
  }

  return { created, skipped: false };
};

const bootstrapDemoData = async () => {
  const { departments } = await ensureCatalog();

  let usersCreatedOrUpdated = 0;
  let sampleRequestsCreated = 0;

  for (const demoUser of DEMO_USERS) {
    const hashedPassword = await bcrypt.hash(demoUser.password, BCRYPT_ROUNDS);
    const departmentId = demoUser.department ? departments[demoUser.department].id : null;

    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        name: demoUser.name,
        password: hashedPassword,
        role: demoUser.role,
        departmentId,
        isActive: true,
      },
      create: {
        name: demoUser.name,
        email: demoUser.email,
        password: hashedPassword,
        role: demoUser.role,
        departmentId,
        isActive: true,
      },
    });

    usersCreatedOrUpdated += 1;
    const sampleResult = await ensureSampleDataForUser(user.id);
    sampleRequestsCreated += sampleResult.created;
  }

  return {
    usersCreatedOrUpdated,
    sampleRequestsCreated,
    demoUserCredentials: DEMO_USERS.map((user) => ({
      email: user.email,
      password: user.password,
      role: user.role,
    })),
  };
};

module.exports = {
  bootstrapDemoData,
  ensureSampleDataForUser,
  getDefaultDepartmentId,
};
