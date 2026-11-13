// Seeds the database with a default admin user + a couple of demo records.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Plan = require('../models/Plan');

const seed = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ email: 'admin@procrm.com' });
  if (existingAdmin) {
    if (existingAdmin.role !== 'super_admin') {
      existingAdmin.role = 'super_admin';
      await existingAdmin.save();
      console.log('Promoted admin@procrm.com to super_admin.');
    }
    await seedPlans(existingAdmin._id);
    console.log('Admin already exists, skipping demo users.');
    process.exit(0);
  }

  const admin = await User.create({
    name: 'Super Admin',
    email: 'admin@procrm.com',
    password: 'Admin@12345',
    role: 'super_admin',
  });

  const manager = await User.create({
    name: 'Demo Manager',
    email: 'manager@procrm.com',
    password: 'Manager@12345',
    role: 'manager',
  });

  const exec = await User.create({
    name: 'Demo Sales Exec',
    email: 'sales@procrm.com',
    password: 'Sales@12345',
    role: 'sales_executive',
  });

  await Customer.create({
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '555-0100',
    company: 'Acme Corp',
    assignedTo: exec._id,
    createdBy: admin._id,
  });

  await Lead.create({
    name: 'Jane Prospect',
    email: 'jane@prospect.com',
    company: 'Prospect Inc',
    status: 'new',
    estimatedValue: 5000,
    assignedTo: exec._id,
    createdBy: admin._id,
  });

  await seedPlans(admin._id);

  console.log('Seed complete. Login with:');
  console.log('  admin@procrm.com / Admin@12345 (Super Admin)');
  console.log('  manager@procrm.com / Manager@12345');
  console.log('  sales@procrm.com / Sales@12345');

  await mongoose.connection.close();
  process.exit(0);
};

const seedPlans = async (createdBy) => {
  const plans = [
    {
      name: 'Starter',
      description: 'For small teams starting with organized customer and lead follow-up.',
      priceMonthly: 19,
      maxUsers: 5,
      maxCustomers: 1000,
      maxLeads: 1000,
      features: ['Customer and lead management', 'Tasks and calendar', 'Basic sales reports', 'Email support'],
      status: 'active',
      sortOrder: 1,
      createdBy,
    },
    {
      name: 'Growth',
      description: 'For growing teams that need pipeline visibility, team roles, and exports.',
      priceMonthly: 59,
      maxUsers: 20,
      maxCustomers: 10000,
      maxLeads: 10000,
      features: ['Everything in Starter', 'Deals pipeline', 'Team management', 'PDF and CSV exports', 'Priority email support'],
      status: 'active',
      sortOrder: 2,
      createdBy,
    },
    {
      name: 'Enterprise',
      description: 'For larger companies that need advanced controls and higher capacity.',
      priceMonthly: 149,
      maxUsers: 100,
      maxCustomers: 50000,
      maxLeads: 50000,
      features: ['Everything in Growth', 'Super admin controls', 'Plan management', 'Advanced reporting', 'Priority support'],
      status: 'active',
      sortOrder: 3,
      createdBy,
    },
  ];

  for (const plan of plans) {
    const { createdBy: ownerId, ...planUpdate } = plan;
    await Plan.findOneAndUpdate(
      { name: plan.name },
      { $set: planUpdate, $setOnInsert: { createdBy: ownerId } },
      { upsert: true, new: true, runValidators: true }
    );
  }

  await Plan.updateMany(
    { name: { $nin: plans.map((plan) => plan.name) } },
    { $set: { status: 'inactive' } }
  );
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
