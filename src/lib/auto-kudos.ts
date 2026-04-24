import { prisma } from "./prisma";
import { getChatConfig, postToChat } from "./chat-webhooks";

/**
 * Scans all workspaces for users with a birthday or work anniversary "today"
 * (in UTC day), and creates system-generated recognitions. Idempotent —
 * checks for existing system kudos with the same kind for the same user
 * for the current calendar day, so running multiple times per day won't
 * duplicate.
 */
export async function runAutoKudos(now: Date = new Date()) {
  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const month = today.getUTCMonth() + 1;
  const day = today.getUTCDate();

  const workspaces = await prisma.workspace.findMany({
    where: {
      OR: [{ autoBirthdayEnabled: true }, { autoAnniversaryEnabled: true }],
    },
    include: {
      users: {
        where: { isActive: true },
        select: { id: true, name: true, birthday: true, joinedAt: true, redeemablePoints: true },
      },
    },
  });

  let birthdayCount = 0;
  let anniversaryCount = 0;
  const errors: string[] = [];

  for (const ws of workspaces) {
    for (const user of ws.users) {
      // Birthday
      if (ws.autoBirthdayEnabled && user.birthday) {
        const bMonth = user.birthday.getUTCMonth() + 1;
        const bDay = user.birthday.getUTCDate();
        if (bMonth === month && bDay === day) {
          const alreadyPosted = await prisma.recognition.findFirst({
            where: {
              workspaceId: ws.id,
              receiverId: user.id,
              kind: "birthday",
              isSystem: true,
              createdAt: { gte: today, lt: tomorrow },
            },
          });
          if (!alreadyPosted) {
            try {
              const message = ws.autoBirthdayMessage.replace("{name}", user.name.split(" ")[0]);
              await prisma.$transaction([
                prisma.recognition.create({
                  data: {
                    workspaceId: ws.id,
                    senderId: null,
                    receiverId: user.id,
                    message,
                    points: ws.autoBirthdayPoints,
                    isSystem: true,
                    kind: "birthday",
                  },
                }),
                prisma.user.update({
                  where: { id: user.id },
                  data: { redeemablePoints: { increment: ws.autoBirthdayPoints } },
                }),
              ]);
              birthdayCount++;
              // Post to chat if configured
              const chat = await getChatConfig(ws as any, "autoKudos");
              if (chat) {
                postToChat(chat.type, chat.url, {
                  kind: "birthday",
                  workspaceName: ws.name,
                  receiverName: user.name,
                  message,
                  points: ws.autoBirthdayPoints,
                  baseUrl: process.env.NEXTAUTH_URL || "https://cherishu.talkytools.com",
                }).catch(() => {});
              }
            } catch (e: any) {
              errors.push(`birthday ${user.id}: ${e.message}`);
            }
          }
        }
      }

      // Work anniversary
      if (ws.autoAnniversaryEnabled && user.joinedAt) {
        const jMonth = user.joinedAt.getUTCMonth() + 1;
        const jDay = user.joinedAt.getUTCDate();
        const jYear = user.joinedAt.getUTCFullYear();
        if (jMonth === month && jDay === day && jYear < today.getUTCFullYear()) {
          const years = today.getUTCFullYear() - jYear;
          const alreadyPosted = await prisma.recognition.findFirst({
            where: {
              workspaceId: ws.id,
              receiverId: user.id,
              kind: "anniversary",
              isSystem: true,
              createdAt: { gte: today, lt: tomorrow },
            },
          });
          if (!alreadyPosted) {
            try {
              const message = ws.autoAnniversaryMessage
                .replace("{name}", user.name.split(" ")[0])
                .replace("{years}", String(years))
                .replace("{s}", years === 1 ? "" : "s");
              await prisma.$transaction([
                prisma.recognition.create({
                  data: {
                    workspaceId: ws.id,
                    senderId: null,
                    receiverId: user.id,
                    message,
                    points: ws.autoAnniversaryPoints,
                    isSystem: true,
                    kind: "anniversary",
                  },
                }),
                prisma.user.update({
                  where: { id: user.id },
                  data: { redeemablePoints: { increment: ws.autoAnniversaryPoints } },
                }),
              ]);
              anniversaryCount++;
              const chat = await getChatConfig(ws as any, "autoKudos");
              if (chat) {
                postToChat(chat.type, chat.url, {
                  kind: "anniversary",
                  workspaceName: ws.name,
                  receiverName: user.name,
                  message,
                  points: ws.autoAnniversaryPoints,
                  baseUrl: process.env.NEXTAUTH_URL || "https://cherishu.talkytools.com",
                }).catch(() => {});
              }
            } catch (e: any) {
              errors.push(`anniversary ${user.id}: ${e.message}`);
            }
          }
        }
      }
    }
  }

  return { birthdayCount, anniversaryCount, errors, ranAt: now.toISOString() };
}
