/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Cherishu seed — TalkyTools standard credentials.
 * Reference: _shared/templates/seed.template.ts
 *
 * Cherishu has two parallel auth systems:
 *   - PlatformAdmin (super admin at /sup-min)
 *   - User with roles EMPLOYEE / MANAGER / HR_ADMIN / SUPER_ADMIN (workspace login)
 *
 * Standard cred mapping for Cherishu:
 *   - Super Admin → PlatformAdmin: superadmin@cherishu.com / Shu_bham12!
 *   - Admin       → User HR_ADMIN: admin@cherishu.com / Admin@2026!
 *   - Demo User   → User EMPLOYEE: user@cherishu.com / User@2026!
 *
 * Seed is idempotent (uses upsert) and creates a demo workspace "Acme Inc."
 * with sample colleagues, recognitions, and rewards so the demo experience
 * is alive from minute one.
 */

import { PrismaClient, RewardType, RewardProvider } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PROJECT_DOMAIN = "cherishu.com";

const SUPER_ADMIN = {
  email: `superadmin@${PROJECT_DOMAIN}`,
  name: "Super Admin",
  password: "Shu_bham12!",
};

const ADMIN = {
  email: `admin@${PROJECT_DOMAIN}`,
  name: "Admin",
  password: "Admin@2026!",
};

const DEMO_USER = {
  email: `user@${PROJECT_DOMAIN}`,
  name: "Demo User",
  password: "User@2026!",
};

async function main() {
  console.log(`\n🌱 Seeding ${PROJECT_DOMAIN}…\n`);

  // 1) Platform super admin → /sup-min login (PlatformAdmin table)
  const superHash = await bcrypt.hash(SUPER_ADMIN.password, 10);
  await prisma.platformAdmin.upsert({
    where: { email: SUPER_ADMIN.email },
    update: { passwordHash: superHash, name: SUPER_ADMIN.name },
    create: { email: SUPER_ADMIN.email, name: SUPER_ADMIN.name, passwordHash: superHash },
  });
  console.log(`✓ Super admin: ${SUPER_ADMIN.email}`);

  // 2) Demo workspace (idempotent)
  const existingWs = await prisma.workspace.findUnique({ where: { slug: "acme" } });
  let workspace = existingWs;
  if (!existingWs) {
    workspace = await prisma.workspace.create({
      data: {
        name: "Acme Inc.",
        slug: "acme",
        monthlyBudgetPoints: 50000,
        values: {
          create: [
            { name: "Customer Obsession", emoji: "🎯", description: "Customers first." },
            { name: "Ownership", emoji: "💪", description: "Own the outcome." },
            { name: "Innovation", emoji: "💡", description: "Challenge the status quo." },
            { name: "Team Spirit", emoji: "🤝", description: "Win together." },
          ],
        },
        badges: {
          create: [
            { name: "Team Player", emoji: "🤝", color: "indigo" },
            { name: "Above & Beyond", emoji: "🚀", color: "purple" },
            { name: "Innovator", emoji: "💡", color: "yellow" },
            { name: "Customer Hero", emoji: "🏆", color: "green" },
          ],
        },
      },
    });
  }

  // 3) Standard workspace users (HR admin + demo user)
  const adminHash = await bcrypt.hash(ADMIN.password, 10);
  await prisma.user.upsert({
    where: { email: ADMIN.email },
    update: { passwordHash: adminHash, role: "HR_ADMIN", name: ADMIN.name },
    create: {
      email: ADMIN.email,
      name: ADMIN.name,
      passwordHash: adminHash,
      role: "HR_ADMIN",
      jobTitle: "People Ops",
      department: "HR",
      workspaceId: workspace!.id,
      giveablePoints: 2000,
      redeemablePoints: 500,
    },
  });
  console.log(`✓ Admin: ${ADMIN.email}`);

  const userHash = await bcrypt.hash(DEMO_USER.password, 10);
  await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: { passwordHash: userHash, role: "EMPLOYEE", name: DEMO_USER.name },
    create: {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      passwordHash: userHash,
      role: "EMPLOYEE",
      jobTitle: "Engineer",
      department: "Engineering",
      workspaceId: workspace!.id,
      giveablePoints: 500,
      redeemablePoints: 300,
    },
  });
  console.log(`✓ Demo user: ${DEMO_USER.email}`);

  // 4) Demo colleagues (so the feed feels alive)
  const teammates = [
    { email: `priya@${PROJECT_DOMAIN}`, name: "Priya Sharma", role: "MANAGER" as const, jobTitle: "Engineering Manager" },
    { email: `raj@${PROJECT_DOMAIN}`, name: "Raj Patel", role: "EMPLOYEE" as const, jobTitle: "Senior Engineer" },
    { email: `anita@${PROJECT_DOMAIN}`, name: "Anita Desai", role: "EMPLOYEE" as const, jobTitle: "Product Designer" },
    { email: `vikram@${PROJECT_DOMAIN}`, name: "Vikram Singh", role: "EMPLOYEE" as const, jobTitle: "Data Analyst" },
    { email: `sana@${PROJECT_DOMAIN}`, name: "Sana Khan", role: "MANAGER" as const, jobTitle: "Marketing Lead" },
  ];

  const teammatePassword = await bcrypt.hash(DEMO_USER.password, 10);
  for (const t of teammates) {
    await prisma.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        email: t.email,
        name: t.name,
        passwordHash: teammatePassword,
        role: t.role,
        jobTitle: t.jobTitle,
        department: "Engineering",
        workspaceId: workspace!.id,
        giveablePoints: 500,
        redeemablePoints: 800,
      },
    });
  }

  // 5) Sample recognitions (only on first run)
  const existingCount = await prisma.recognition.count({ where: { workspaceId: workspace!.id } });
  if (existingCount < 5) {
    const badges = await prisma.badge.findMany({ where: { workspaceId: workspace!.id } });
    const values = await prisma.companyValue.findMany({ where: { workspaceId: workspace!.id } });
    const allUsers = await prisma.user.findMany({ where: { workspaceId: workspace!.id } });

    const messages = [
      "Crushing it on the launch — thank you for stepping up!",
      "Your code review feedback saved us from a huge bug. Legend.",
      "The client loved the new dashboard design. Incredible work.",
      "Thank you for mentoring the new interns this week.",
      "Your analysis unlocked our top-line growth insight of the quarter.",
      "Stayed late to ship the release — we owe you one.",
    ];

    for (let i = 0; i < 8 && allUsers.length >= 2; i++) {
      const sender = allUsers[i % allUsers.length];
      const receiver = allUsers[(i + 1) % allUsers.length];
      if (sender.id === receiver.id) continue;
      await prisma.recognition.create({
        data: {
          workspaceId: workspace!.id,
          senderId: sender.id,
          receiverId: receiver.id,
          message: messages[i % messages.length],
          points: [50, 100, 150, 200, 50][i % 5],
          badgeId: badges[i % badges.length]?.id ?? null,
          valueId: values[i % values.length]?.id ?? null,
          createdAt: new Date(Date.now() - i * 3600_000),
        },
      });
    }
  }

  // 6) Platform-wide rewards (only on first run)
  const platformRewards = [
    { name: "Amazon India Gift Card", desc: "Shop anything on Amazon.in", type: "GIFT_CARD", provider: "AMAZON_INCENTIVES", pts: 500, val: 500, cat: "Shopping", featured: true },
    { name: "Flipkart Voucher", desc: "Use on Flipkart.com", type: "GIFT_CARD", provider: "XOXODAY", pts: 500, val: 500, cat: "Shopping" },
    { name: "Starbucks ₹250", desc: "Coffee on us", type: "GIFT_CARD", provider: "XOXODAY", pts: 250, val: 250, cat: "Food & Dining" },
    { name: "Swiggy ₹500", desc: "Lunch sorted", type: "GIFT_CARD", provider: "XOXODAY", pts: 500, val: 500, cat: "Food & Dining", featured: true },
    { name: "Uber ₹1000", desc: "Ride vouchers", type: "GIFT_CARD", provider: "XOXODAY", pts: 1000, val: 1000, cat: "Travel" },
    { name: "Netflix 1-month", desc: "One month subscription", type: "SUBSCRIPTION", provider: "MANUAL", pts: 649, val: 649, cat: "Entertainment" },
    { name: "Spotify Premium 3-month", desc: "Three months of ad-free music", type: "SUBSCRIPTION", provider: "MANUAL", pts: 350, val: 350, cat: "Entertainment" },
    { name: "Spa Day at Four Seasons", desc: "Full day spa experience", type: "EXPERIENCE", provider: "MANUAL", pts: 8000, val: 8000, cat: "Wellness", featured: true },
    { name: "Standing Desk", desc: "Premium height-adjustable desk", type: "MERCHANDISE", provider: "MANUAL", pts: 12000, val: 12000, cat: "Workspace" },
    { name: "Noise Cancelling Headphones", desc: "Sony WH-1000XM5", type: "MERCHANDISE", provider: "AMAZON_INCENTIVES", pts: 25000, val: 25000, cat: "Electronics" },
    { name: "Donate to TeachForIndia", desc: "On your behalf", type: "CHARITY", provider: "MANUAL", pts: 500, val: 500, cat: "Charity" },
    { name: "Cashback to UPI", desc: "Direct to your UPI account", type: "CASHBACK", provider: "TREMENDOUS", pts: 1000, val: 1000, cat: "Cashback" },
    { name: "Weekend Getaway — Goa", desc: "2-night stay for two", type: "TRAVEL", provider: "MANUAL", pts: 40000, val: 40000, cat: "Travel", featured: true },
    { name: "Cherishu T-Shirt", desc: "Limited edition swag", type: "CUSTOM_SWAG", provider: "MANUAL", pts: 200, val: 0, cat: "Swag" },
    { name: "₹100 Generic Voucher", desc: "Use across brands", type: "VOUCHER", provider: "XOXODAY", pts: 100, val: 100, cat: "General" },
  ];

  const rewardsExist = await prisma.reward.count({ where: { workspaceId: null } });
  if (rewardsExist === 0) {
    for (const r of platformRewards) {
      await prisma.reward.create({
        data: {
          workspaceId: null,
          name: r.name,
          description: r.desc,
          type: r.type as RewardType,
          provider: r.provider as RewardProvider,
          pointsCost: r.pts,
          currencyValue: r.val,
          currency: "INR",
          category: r.cat,
          featured: r.featured || false,
        },
      });
    }
  }

  console.log("\n✅ Seed complete.\n");
  console.log("🔑 Standard credentials:");
  console.log(`   Super Admin (PlatformAdmin)  ${SUPER_ADMIN.email} / ${SUPER_ADMIN.password}   → /sup-min`);
  console.log(`   Admin (HR_ADMIN)             ${ADMIN.email} / ${ADMIN.password}   → /login`);
  console.log(`   Demo User (EMPLOYEE)         ${DEMO_USER.email} / ${DEMO_USER.password}   → /login\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
