const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function d(dateStr, time = '08:00:00') {
  return new Date(`${dateStr}T${time}.000Z`);
}

async function main() {
  console.log('???  Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.requestStatusHistory.deleteMany();
  await prisma.request.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.department.deleteMany();
  console.log('? Cleared.\n?? Seeding...');

  // -- Departments -------------------------------------------------------------
  const deptNames = ['Engineering','Design','Data Analytics','HR','IT','Finance','Operations','Marketing'];
  const depts = {};
  for (const name of deptNames) {
    depts[name] = await prisma.department.create({ data: { name } });
  }

  // -- Categories --------------------------------------------------------------
  const catDefs = [
    ['Hardware',       'Engineering'],   ['Software',     'Engineering'],  ['Dev Tools',     'Engineering'],
    ['Software',       'Design'],        ['Creative Tools','Design'],
    ['Access',         'Data Analytics'],['Reporting',    'Data Analytics'],
    ['Other',          'HR'],            ['Leave',        'HR'],            ['Recruitment',   'HR'],
    ['Hardware',       'IT'],            ['Access',       'IT'],            ['Network',       'IT'],   ['Software','IT'],
    ['Budget',         'Finance'],       ['Payroll',      'Finance'],
    ['Logistics',      'Operations'],    ['Other',        'Operations'],
    ['Campaign',       'Marketing'],     ['Other',        'Marketing'],
  ];
  const cats = {};
  for (const [name, dept] of catDefs) {
    cats[`${name}|${dept}`] = await prisma.category.create({
      data: { name, departmentId: depts[dept].id },
    });
  }

  // -- Users --------------------------------------------------------------------
  const pw        = await bcrypt.hash('Password@123', 12);
  const adminPw   = await bcrypt.hash('Admin@123',    12);
  const headPw    = await bcrypt.hash('Head@123',     12);

  const userDefs = [
    { name:'System Admin',    email:'admin@requesttracker.com',    password:adminPw, role:'ADMIN',           dept:null            },
    { name:'IT Head',         email:'ithead@requesttracker.com',   password:headPw,  role:'DEPARTMENT_HEAD', dept:'IT'            },
    { name:'John Smith',      email:'john.smith@company.com',      password:pw,      role:'STAFF',           dept:'Engineering'   },
    { name:'Sarah Johnson',   email:'sarah.johnson@company.com',   password:pw,      role:'DEPARTMENT_HEAD', dept:'Design'        },
    { name:'Mike Chen',       email:'mike.chen@company.com',       password:pw,      role:'STAFF',           dept:'Data Analytics'},
    { name:'Emily Rodriguez', email:'emily.rodriguez@company.com', password:pw,      role:'ADMIN',           dept:'HR'            },
    { name:'David Park',      email:'david.park@company.com',      password:pw,      role:'STAFF',           dept:'IT'            },
    { name:'Lisa Anderson',   email:'lisa.anderson@company.com',   password:pw,      role:'DEPARTMENT_HEAD', dept:'Finance'       },
    { name:'Robert Wilson',   email:'robert.wilson@company.com',   password:pw,      role:'DEPARTMENT_HEAD', dept:'Operations'    },
    { name:'Jennifer Taylor', email:'jennifer.taylor@company.com', password:pw,      role:'STAFF',           dept:'Marketing'     },
  ];
  const users = {};
  for (const u of userDefs) {
    users[u.name] = await prisma.user.create({
      data: { name:u.name, email:u.email, password:u.password, role:u.role,
              departmentId: u.dept ? depts[u.dept].id : null },
    });
  }
  const admin = users['System Admin'];

  // -- Requests + Status History ------------------------------------------------
  const reqDefs = [
    {
      title:'New Monitor Setup', description:'Need a new 27-inch monitor for the development team',
      priority:'HIGH', status:'COMPLETED', dept:'Engineering', cat:'Hardware|Engineering',
      creator:'John Smith', createdAt:d('2024-01-15'), updatedAt:d('2024-02-10'),
      history:[
        { status:'SUBMITTED',    comment:null,                      at:d('2024-01-15') },
        { status:'UNDER_REVIEW', comment:null,                      at:d('2024-01-16') },
        { status:'APPROVED',     comment:'Approved by manager',     at:d('2024-01-20') },
        { status:'PROCESSING',   comment:null,                      at:d('2024-02-01') },
        { status:'COMPLETED',    comment:'Processed and delivered', at:d('2024-02-10') },
      ],
    },
    {
      title:'Software License Renewal', description:'Renew licenses for Adobe Creative Suite',
      priority:'CRITICAL', status:'PROCESSING', dept:'Design', cat:'Software|Design',
      creator:'Sarah Johnson', createdAt:d('2024-02-05'), updatedAt:d('2024-02-14'),
      history:[
        { status:'SUBMITTED',    comment:null,                    at:d('2024-02-05') },
        { status:'UNDER_REVIEW', comment:null,                    at:d('2024-02-06') },
        { status:'APPROVED',     comment:'Approved for purchase', at:d('2024-02-08') },
        { status:'PROCESSING',   comment:null,                    at:d('2024-02-10') },
      ],
    },
    {
      title:'Database Access Request', description:'Need access to production database for reporting',
      priority:'MEDIUM', status:'APPROVED', dept:'Data Analytics', cat:'Access|Data Analytics',
      creator:'Mike Chen', createdAt:d('2024-02-08'), updatedAt:d('2024-02-12'),
      history:[
        { status:'SUBMITTED',    comment:null,                       at:d('2024-02-08') },
        { status:'UNDER_REVIEW', comment:'Security review completed',at:d('2024-02-09') },
        { status:'APPROVED',     comment:'Access granted',           at:d('2024-02-12') },
      ],
    },
    {
      title:'Team Building Event', description:'Request for budget allocation for Q1 team building',
      priority:'LOW', status:'UNDER_REVIEW', dept:'HR', cat:'Other|HR',
      creator:'Emily Rodriguez', createdAt:d('2024-02-12'), updatedAt:d('2024-02-13'),
      history:[
        { status:'SUBMITTED',    comment:null, at:d('2024-02-12') },
        { status:'UNDER_REVIEW', comment:null, at:d('2024-02-13') },
      ],
    },
    {
      title:'VPN Configuration', description:'Setup VPN access for remote work',
      priority:'HIGH', status:'REJECTED', dept:'IT', cat:'Access|IT',
      creator:'David Park', createdAt:d('2024-02-10'), updatedAt:d('2024-02-13'),
      history:[
        { status:'SUBMITTED',    comment:null,                                     at:d('2024-02-10') },
        { status:'UNDER_REVIEW', comment:null,                                     at:d('2024-02-11') },
        { status:'REJECTED',     comment:'Company policy requires in-office work', at:d('2024-02-13') },
      ],
    },
    {
      title:'Q2 Marketing Campaign Budget', description:'Budget approval for upcoming Q2 digital marketing campaign',
      priority:'HIGH', status:'SUBMITTED', dept:'Marketing', cat:'Campaign|Marketing',
      creator:'Jennifer Taylor', createdAt:d('2024-02-20'), updatedAt:d('2024-02-20'),
      history:[
        { status:'SUBMITTED', comment:null, at:d('2024-02-20') },
      ],
    },
    {
      title:'Payroll System Upgrade', description:'Upgrade current payroll software to the latest version',
      priority:'CRITICAL', status:'APPROVED', dept:'Finance', cat:'Payroll|Finance',
      creator:'Lisa Anderson', createdAt:d('2024-02-01'), updatedAt:d('2024-02-15'),
      history:[
        { status:'SUBMITTED',    comment:null,                        at:d('2024-02-01') },
        { status:'UNDER_REVIEW', comment:null,                        at:d('2024-02-05') },
        { status:'APPROVED',     comment:'Critical upgrade approved', at:d('2024-02-15') },
      ],
    },
    {
      title:'Office Renovation Logistics', description:'Coordinate logistics for 3rd floor office renovation project',
      priority:'MEDIUM', status:'COMPLETED', dept:'Operations', cat:'Logistics|Operations',
      creator:'Robert Wilson', createdAt:d('2024-01-10'), updatedAt:d('2024-02-28'),
      history:[
        { status:'SUBMITTED',    comment:null,                    at:d('2024-01-10') },
        { status:'UNDER_REVIEW', comment:null,                    at:d('2024-01-12') },
        { status:'APPROVED',     comment:'Budget cleared',        at:d('2024-01-15') },
        { status:'PROCESSING',   comment:'Work in progress',      at:d('2024-01-20') },
        { status:'COMPLETED',    comment:'Renovation completed',  at:d('2024-02-28') },
      ],
    },
    {
      title:'Network Switch Replacement', description:'Replace aging core network switches in server room',
      priority:'HIGH', status:'PROCESSING', dept:'IT', cat:'Network|IT',
      creator:'IT Head', createdAt:d('2024-02-18'), updatedAt:d('2024-02-25'),
      history:[
        { status:'SUBMITTED',    comment:null,                           at:d('2024-02-18') },
        { status:'UNDER_REVIEW', comment:null,                           at:d('2024-02-20') },
        { status:'APPROVED',     comment:'Approved – critical hardware', at:d('2024-02-22') },
        { status:'PROCESSING',   comment:'Vendor order placed',          at:d('2024-02-25') },
      ],
    },
    {
      title:'Annual Leave Policy Update', description:'Review and update company annual leave policy for new fiscal year',
      priority:'LOW', status:'COMPLETED', dept:'HR', cat:'Leave|HR',
      creator:'Emily Rodriguez', createdAt:d('2024-01-05'), updatedAt:d('2024-01-25'),
      history:[
        { status:'SUBMITTED',    comment:null,                       at:d('2024-01-05') },
        { status:'UNDER_REVIEW', comment:null,                       at:d('2024-01-08') },
        { status:'APPROVED',     comment:'Policy approved by board', at:d('2024-01-15') },
        { status:'PROCESSING',   comment:'Drafting new documents',   at:d('2024-01-20') },
        { status:'COMPLETED',    comment:'Policy published',         at:d('2024-01-25') },
      ],
    },
  ];

  const createdReqs = [];
  for (const r of reqDefs) {
    const req = await prisma.request.create({
      data: {
        title:r.title, description:r.description, priority:r.priority, status:r.status,
        categoryId:cats[r.cat].id, departmentId:depts[r.dept].id,
        createdBy:users[r.creator].id, createdAt:r.createdAt, updatedAt:r.updatedAt,
      },
    });
    for (const h of r.history) {
      await prisma.requestStatusHistory.create({
        data:{ requestId:req.id, status:h.status, comment:h.comment, updatedBy:admin.id, createdAt:h.at },
      });
    }
    createdReqs.push(req);
  }

  // -- Notifications ------------------------------------------------------------
  const notifDefs = [
    { user:'John Smith',      message:`Your request "${createdReqs[0].title}" status has been updated to: COMPLETED.`,                                        read:true,  at:d('2024-02-10','10:30:00') },
    { user:'IT Head',         message:`New request "${createdReqs[4].title}" is pending your review.`,                                                         read:false, at:d('2024-02-13','14:15:00') },
    { user:'David Park',      message:`Your request "${createdReqs[4].title}" has been updated to: REJECTED. Comment: Company policy requires in-office work.`,read:false, at:d('2024-02-13','15:45:00') },
    { user:'Sarah Johnson',   message:`Your request "${createdReqs[1].title}" status has been updated to: PROCESSING.`,                                        read:true,  at:d('2024-02-10','09:00:00') },
    { user:'Mike Chen',       message:`Your request "${createdReqs[2].title}" has been approved. Access has been granted.`,                                    read:false, at:d('2024-02-12','11:00:00') },
    { user:'Lisa Anderson',   message:`Your request "${createdReqs[6].title}" has been approved.`,                                                             read:false, at:d('2024-02-15','10:00:00') },
    { user:'Robert Wilson',   message:`Your request "${createdReqs[7].title}" status has been updated to: COMPLETED.`,                                        read:true,  at:d('2024-02-28','16:00:00') },
    { user:'Jennifer Taylor', message:`Your request "${createdReqs[5].title}" has been submitted and is awaiting review.`,                                     read:false, at:d('2024-02-20','08:30:00') },
    { user:'John Smith',      message:'Welcome to the Request Tracker system.',                                                                                read:true,  at:d('2024-01-14','08:00:00') },
  ];
  for (const n of notifDefs) {
    await prisma.notification.create({
      data:{ userId:users[n.user].id, message:n.message, read:n.read, createdAt:n.at },
    });
  }

  console.log('\n? Seeding complete!');
  console.log(`\n  Departments : ${deptNames.length}`);
  console.log(`  Categories  : ${catDefs.length}`);
  console.log(`  Users       : ${userDefs.length}`);
  console.log(`  Requests    : ${reqDefs.length}`);
  console.log(`  Notifications: ${notifDefs.length}`);
  console.log('\n?? Login accounts:');
  console.log('  admin@requesttracker.com        /  Admin@123     (ADMIN)');
  console.log('  ithead@requesttracker.com       /  Head@123      (DEPARTMENT_HEAD – IT)');
  console.log('  john.smith@company.com          /  Password@123  (STAFF – Engineering)');
  console.log('  sarah.johnson@company.com       /  Password@123  (DEPARTMENT_HEAD – Design)');
  console.log('  david.park@company.com          /  Password@123  (STAFF – IT)');
  console.log('  emily.rodriguez@company.com     /  Password@123  (ADMIN)');
  console.log('  <any other mock user>@company.com / Password@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
