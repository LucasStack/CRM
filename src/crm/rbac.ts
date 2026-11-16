import type { RoleId, Scope } from "./types";

export const PERMISSIONS = [
  "clients.view",
  "clients.create",
  "clients.update",
  "clients.delete",
  "clients.merge",
  "leads.view",
  "leads.create",
  "leads.update",
  "leads.convert",
  "opportunities.view",
  "opportunities.update",
  "quotes.manage",
  "sales.view",
  "sales.create",
  "products.cost_view",
  "finance.view",
  "tasks.manage",
  "files.manage",
  "reports.view",
  "export.full",
  "users.manage",
  "settings.manage",
  "audit.view",
  "privacy.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLES: Record<RoleId, { label: string; scope: Scope; perms: Permission[] }> = {
  super_admin: { label: "Super Admin", scope: "all", perms: [...PERMISSIONS] },
  admin: {
    label: "Administrador",
    scope: "all",
    perms: PERMISSIONS.filter((p) => p !== "settings.manage"),
  },
  gerente: {
    label: "Gerente",
    scope: "all",
    perms: [
      "clients.view", "clients.create", "clients.update", "clients.merge",
      "leads.view", "leads.create", "leads.update", "leads.convert",
      "opportunities.view", "opportunities.update", "quotes.manage",
      "sales.view", "sales.create", "products.cost_view", "finance.view",
      "tasks.manage", "files.manage", "reports.view", "export.full",
    ],
  },
  supervisor: {
    label: "Supervisor",
    scope: "team",
    perms: [
      "clients.view", "clients.create", "clients.update",
      "leads.view", "leads.update", "leads.convert",
      "opportunities.view", "opportunities.update", "quotes.manage",
      "sales.view", "sales.create", "tasks.manage", "files.manage", "reports.view",
    ],
  },
  vendedor: {
    label: "Vendedor",
    scope: "own",
    perms: [
      "clients.view", "clients.create", "clients.update",
      "leads.view", "leads.create", "leads.update", "leads.convert",
      "opportunities.view", "opportunities.update", "quotes.manage",
      "sales.view", "sales.create", "tasks.manage", "files.manage",
    ],
  },
  financeiro: {
    label: "Financeiro",
    scope: "all",
    perms: ["clients.view", "sales.view", "products.cost_view", "finance.view", "reports.view", "export.full"],
  },
};

export function can(role: RoleId, perm: Permission): boolean {
  return ROLES[role].perms.includes(perm);
}

export function scopeOf(role: RoleId): Scope {
  return ROLES[role].scope;
}

/** IDs cujos registros o usuário pode enxergar, dado o escopo do papel. */
export function visibleOwnerIds(meId: string, myRole: RoleId, myTeam: string, users: { id: string; teamId: string }[]): string[] | "all" {
  const s = scopeOf(myRole);
  if (s === "all") return "all";
  if (s === "team") return users.filter((u) => u.teamId === myTeam).map((u) => u.id);
  return [meId];
}

export function inScope(ownerId: string, meId: string, myRole: RoleId, myTeam: string, users: { id: string; teamId: string }[]): boolean {
  const visible = visibleOwnerIds(meId, myRole, myTeam, users);
  return visible === "all" || visible.includes(ownerId);
}
