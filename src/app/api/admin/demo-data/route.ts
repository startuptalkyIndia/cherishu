import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

/**
 * Populate the current workspace with demo data:
 *   - 6 fake teammates (different roles, departments, job titles)
 *   - 15 recent recognitions with varied badges/values/points
 *   - Reactions + a handful of comments
 *   - 2 nominations (1 pending, 1 awarded)
 * Safe to re-run: appends new demo users with suffix if existing.
 */

const DEMO_USERS = [
  { name: "Priya Sharma",   jobTitle: "Engineering Manager", department: "Engineering", role: "MANAGER" as const },
  { name: "Raj Patel",      jobTitle: "Senior Engineer",      department: "Engineering", role: "EMPLOYEE" as const },
  { name: "Anita Desai",    jobTitle: "Product Designer",     department: "Design",       role: "EMPLOYEE" as const },
  { name: "Vikram Singh",   jobTitle: "Data Analyst",         department: "Analytics",    role: "EMPLOYEE" as const },
  { name: "Sana Khan",      jobTitle: "Marketing Lead",       department: "Marketing",    role: "MANAGER" as const },
  { name: "Arjun Mehta",    jobTitle: "Customer Success",     department: "CS",           role: "EMPLOYEE" as const },
];

const MESSAGES = [
  "Crushing it on the product launch this week — thank you for stepping up!",
  "Your code review feedback saved us from a major regression. Legend.",
  "The client loved the new onboarding flow. Truly incredible work.",
  "Thank you for mentoring the new interns. They look up to you.",
  "Your analysis unlocked the top-line growth insight of the quarter.",
  "Stayed late to ship the release — we owe you one big time.",
  "Single-handedly turned that angry customer into a case study.",
  "Went above and beyond on the integration. Smooth as silk now.",
  "Your workshop was a hit — team is buzzing about it.",
  "That's the third major bug you caught this month. Hawk eyes!",
  "Stepped up to cover while I was out. Can't thank you enough.",
  "Brought real empathy to the all-hands. Set the tone for the week.",
  "Picked up a dropped thread and carried it home. Pure ownership.",
  "Documentation you wrote is getting used daily. Thank you!",
  "Beautiful design on the dashboard refresh. Customers noticed.",
];

const EMOJIS = ["🎉", "👏", "💯", "❤️", "🔥", "🙌"];

export async function POST() {
  const admin = await requireRole(["HR_ADMIN", "SUPER_ADMIN"]);
  if (!admin.workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });

  const workspace = await prisma.workspace.findUnique({ where: { id: admin.workspaceId } });
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  // Create demo users (with @demo.{slug} emails so they don't collide with real invites)
  const password = await bcrypt.hash("Demo@123", 10);
  const created = [];
  for (const spec of DEMO_USERS) {
    const base = spec.name.toLowerCase().split(" ")[0];
    let email = `${base}@demo.${workspace.slug}.local`;
    let suffix = 0;
    while (await prisma.user.findUnique({ where: { email } })) {
      suffix++;
      email = `${base}${suffix}@demo.${workspace.slug}.local`;
    }
    const user = await prisma.user.create({
      data: {
        workspaceId: workspace.id,
        email,
        name: spec.name,
        passwordHash: password,
        role: spec.role,
        jobTitle: spec.jobTitle,
        department: spec.department,
        giveablePoints: 500,
        redeemablePoints: 300,
      },
    });
    created.push(user);
  }

  // Also loop the admin into the pool so kudos can flow to/from them
  const pool = [...created, { id: admin.id, name: admin.name }];

  // Fetch badges + values
  const [badges, values] = await Promise.all([
    prisma.badge.findMany({ where: { workspaceId: workspace.id } }),
    prisma.companyValue.findMany({ where: { workspaceId: workspace.id } }),
  ]);

  // Create 15 recognitions spread over the last 7 days
  const kudosIds: string[] = [];
  const now = Date.now();
  for (let i = 0; i < 15; i++) {
    const sender = pool[Math.floor(Math.random() * pool.length)];
    let receiver = pool[Math.floor(Math.random() * pool.length)];
    while (receiver.id === sender.id) {
      receiver = pool[Math.floor(Math.random() * pool.length)];
    }
    const points = [25, 50, 75, 100, 150, 200][Math.floor(Math.random() * 6)];
    const badge = badges.length > 0 ? badges[Math.floor(Math.random() * badges.length)] : null;
    const value = values.length > 0 ? values[Math.floor(Math.random() * values.length)] : null;
    const ageHours = Math.floor(Math.random() * 168); // up to 7 days
    const createdAt = new Date(now - ageHours * 3600 * 1000);

    const rec = await prisma.recognition.create({
      data: {
        workspaceId: workspace.id,
        senderId: sender.id,
        receiverId: receiver.id,
        message: MESSAGES[i % MESSAGES.length],
        points,
        badgeId: badge?.id || null,
        valueId: value?.id || null,
        createdAt,
      },
    });
    kudosIds.push(rec.id);

    // Give the receiver credit
    await prisma.user.update({
      where: { id: receiver.id },
      data: { redeemablePoints: { increment: points } },
    });
  }

  // Add random reactions (1-4 per kudo)
  for (const kudoId of kudosIds) {
    const numReactions = 1 + Math.floor(Math.random() * 4);
    const used = new Set<string>();
    for (let i = 0; i < numReactions; i++) {
      const reactor = pool[Math.floor(Math.random() * pool.length)];
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const key = `${reactor.id}-${emoji}`;
      if (used.has(key)) continue;
      used.add(key);
      try {
        await prisma.reaction.create({ data: { recognitionId: kudoId, userId: reactor.id, emoji } });
      } catch {}
    }
  }

  // Add 5 comments on random kudos
  const comments = [
    "Well deserved! 🙌",
    "Totally agree — you're a rockstar.",
    "Can confirm, huge help last week too.",
    "Hear hear!",
    "This made my day to read.",
  ];
  for (let i = 0; i < 5; i++) {
    const kudoId = kudosIds[Math.floor(Math.random() * kudosIds.length)];
    const commenter = pool[Math.floor(Math.random() * pool.length)];
    await prisma.comment.create({
      data: { recognitionId: kudoId, userId: commenter.id, message: comments[i] },
    });
  }

  // Create 2 nominations (1 pending, 1 awarded)
  if (created.length >= 2) {
    await prisma.nomination.create({
      data: {
        workspaceId: workspace.id,
        nominatorId: created[0].id,
        nomineeId: created[1].id,
        award: "Employee of the Month",
        reason: "Consistently raised the bar for technical excellence this month, especially on the migration project.",
        points: 500,
        status: "PENDING",
      },
    });
    await prisma.nomination.create({
      data: {
        workspaceId: workspace.id,
        nominatorId: created[2].id,
        nomineeId: created[3].id,
        award: "Customer Hero",
        reason: "Turned around a disappointed enterprise customer into our best case study.",
        points: 1000,
        status: "AWARDED",
        decidedAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    ok: true,
    usersAdded: created.length,
    kudos: kudosIds.length,
    comments: 5,
    nominations: 2,
  });
}
