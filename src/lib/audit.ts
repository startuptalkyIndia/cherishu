import { prisma } from "./prisma";

export type AuditActorType = "user" | "platform_admin" | "system";

export interface AuditEntry {
  workspaceId?: string | null;
  actorType: AuditActorType;
  actorId?: string | null;
  action: string; // e.g. "user.invited", "reward.deleted"
  target?: string | null; // entity id being acted on
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget audit log writer. Never throws — failures are logged
 * but don't block the action that triggered them.
 */
export async function audit(entry: AuditEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        workspaceId: entry.workspaceId || null,
        actorType: entry.actorType,
        actorId: entry.actorId || null,
        action: entry.action,
        target: entry.target || null,
        metadata: entry.metadata as any,
      },
    });
  } catch (e) {
    console.error(`[audit-fail] ${entry.action}:`, e);
  }
}

// Convenience wrappers — keeps action names consistent.
export const auditUser = (
  action: "invited" | "disabled" | "enabled" | "role_changed" | "points_adjusted" | "deleted",
  ctx: { workspaceId: string; actorId: string; targetUserId: string; metadata?: Record<string, unknown> }
) => audit({ workspaceId: ctx.workspaceId, actorType: "user", actorId: ctx.actorId, action: `user.${action}`, target: ctx.targetUserId, metadata: ctx.metadata });

export const auditReward = (
  action: "created" | "updated" | "deleted" | "activated" | "deactivated",
  ctx: { workspaceId: string | null; actorId: string; rewardId: string; metadata?: Record<string, unknown> }
) => audit({ workspaceId: ctx.workspaceId, actorType: "user", actorId: ctx.actorId, action: `reward.${action}`, target: ctx.rewardId, metadata: ctx.metadata });

export const auditRedemption = (
  action: "fulfilled" | "cancelled" | "approved",
  ctx: { workspaceId: string; actorId: string; redemptionId: string; metadata?: Record<string, unknown> }
) => audit({ workspaceId: ctx.workspaceId, actorType: "user", actorId: ctx.actorId, action: `redemption.${action}`, target: ctx.redemptionId, metadata: ctx.metadata });

export const auditWorkspace = (
  action: "settings_updated" | "plan_changed" | "auto_kudos_toggled" | "email_settings_updated" | "chat_webhook_updated",
  ctx: { workspaceId: string; actorId: string; metadata?: Record<string, unknown> }
) => audit({ workspaceId: ctx.workspaceId, actorType: "user", actorId: ctx.actorId, action: `workspace.${action}`, target: ctx.workspaceId, metadata: ctx.metadata });

export const auditNomination = (
  action: "submitted" | "approved" | "rejected" | "awarded",
  ctx: { workspaceId: string; actorId: string; nominationId: string; metadata?: Record<string, unknown> }
) => audit({ workspaceId: ctx.workspaceId, actorType: "user", actorId: ctx.actorId, action: `nomination.${action}`, target: ctx.nominationId, metadata: ctx.metadata });

export const auditMerchant = (
  action: "created" | "updated" | "deleted" | "catalog_imported",
  ctx: { actorId: string; merchantId: string; metadata?: Record<string, unknown> }
) => audit({ workspaceId: null, actorType: "platform_admin", actorId: ctx.actorId, action: `merchant.${action}`, target: ctx.merchantId, metadata: ctx.metadata });
