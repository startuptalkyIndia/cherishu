/* eslint-disable @typescript-eslint/no-require-imports */
import { PrismaClient, RewardType, RewardProvider } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Cherishu…");

  // Platform super admin
  const superAdminPass = await bcrypt.hash("Admin@Cherishu2026", 10);
  await prisma.platformAdmin.upsert({
    where: { email: "superadmin@cherishu.com" },
    update: { passwordHash: superAdminPass },
    create: { email: "superadmin@cherishu.com", name: "Cherishu Super Admin", passwordHash: superAdminPass },
  });

  // Demo workspace: Acme Inc.
  const existing = await prisma.workspace.findUnique({ where: { slug: "acme" } });
  let workspace = existing;
  if (!existing) {
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

  const adminPass = await bcrypt.hash("Admin@123", 10);
  const userPass = await bcrypt.hash("User@123", 10);

  const demoUsers = [
    { email: "admin@cherishu.com", name: "Admin User", role: "HR_ADMIN" as const, jobTitle: "People Ops", giveable: 2000, redeem: 500 },
    { email: "priya@acme.com", name: "Priya Sharma", role: "MANAGER" as const, jobTitle: "Engineering Manager", giveable: 1500, redeem: 800 },
    { email: "raj@acme.com", name: "Raj Patel", role: "EMPLOYEE" as const, jobTitle: "Senior Engineer", giveable: 500, redeem: 1200 },
    { email: "anita@acme.com", name: "Anita Desai", role: "EMPLOYEE" as const, jobTitle: "Product Designer", giveable: 500, redeem: 950 },
    { email: "vikram@acme.com", name: "Vikram Singh", role: "EMPLOYEE" as const, jobTitle: "Data Analyst", giveable: 500, redeem: 300 },
    { email: "sana@acme.com", name: "Sana Khan", role: "EMPLOYEE" as const, jobTitle: "Marketing Lead", giveable: 500, redeem: 600 },
  ];

  const users = [];
  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash: u.email === "admin@cherishu.com" ? adminPass : userPass,
        role: u.role,
        jobTitle: u.jobTitle,
        department: "Engineering",
        workspaceId: workspace!.id,
        giveablePoints: u.giveable,
        redeemablePoints: u.redeem,
      },
    });
    users.push(user);
  }

  // Seed recognitions
  const existingCount = await prisma.recognition.count({ where: { workspaceId: workspace!.id } });
  if (existingCount < 5) {
    const badges = await prisma.badge.findMany({ where: { workspaceId: workspace!.id } });
    const values = await prisma.companyValue.findMany({ where: { workspaceId: workspace!.id } });

    const messages = [
      "Crushing it on the launch — thank you for stepping up!",
      "Your code review feedback saved us from a huge bug. Legend.",
      "The client loved the new dashboard design. Incredible work.",
      "Thank you for mentoring the new interns this week.",
      "Your analysis unlocked our top-line growth insight of the quarter.",
      "Stayed late to ship the release — we owe you one.",
    ];

    for (let i = 0; i < 8; i++) {
      const sender = users[i % users.length];
      const receiver = users[(i + 1) % users.length];
      if (sender.id === receiver.id) continue;
      await prisma.recognition.create({
        data: {
          workspaceId: workspace!.id,
          senderId: sender.id,
          receiverId: receiver.id,
          message: messages[i % messages.length],
          points: [50, 100, 150, 200, 50][i % 5],
          badgeId: badges[i % badges.length].id,
          valueId: values[i % values.length].id,
          createdAt: new Date(Date.now() - i * 3600_000),
        },
      });
    }
  }

  // Seed platform-wide rewards catalog (workspaceId = null)
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

  console.log("✅ Seed complete.");
  console.log("\n🔑 Login credentials:");
  console.log("   HR Admin:     admin@cherishu.com / Admin@123");
  console.log("   Employee:     priya@acme.com / User@123");
  console.log("   Super Admin:  superadmin@cherishu.com / Admin@Cherishu2026 (at /sup-min)");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
