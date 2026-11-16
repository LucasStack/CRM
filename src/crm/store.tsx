import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as seed from "./seed";
import { can, inScope, type Permission } from "./rbac";
import type {
  Appointment,
  AuditRow,
  Client,
  Consent,
  Contact,
  DataRequest,
  DocFile,
  FinancialEntry,
  Item,
  Lead,
  Notification,
  Opportunity,
  Product,
  Quote,
  Sale,
  Session,
  Settings,
  StageHistory,
  Task,
  User,
} from "./types";

const KEY = "crmcore.state.v2";
export const nowIso = () => new Date().toISOString().slice(0, 16);
export const uid = (p: string) => `${p}_${Math.random().toString(36).slice(2, 8)}`;

export type View =
  | "dashboard" | "clients" | "leads" | "pipeline" | "tasks" | "files"
  | "catalog" | "quotes" | "sales" | "finance" | "reports"
  | "users" | "audit" | "lgpd" | "settings" | "profile";

interface State {
  users: User[];
  clients: Client[];
  contacts: Contact[];
  leads: Lead[];
  opportunities: Opportunity[];
  stageHistory: StageHistory[];
  products: Product[];
  quotes: Quote[];
  sales: Sale[];
  financial: FinancialEntry[];
  tasks: Task[];
  appointments: Appointment[];
  files: DocFile[];
  notifications: Notification[];
  audit: AuditRow[];
  consents: Consent[];
  dataRequests: DataRequest[];
  settings: Settings;
  jobs: { id: string; name: string; queue: string; status: string; createdAt: string }[];
}

const initial = (): State => ({
  users: seed.users,
  clients: seed.clients,
  contacts: seed.contacts,
  leads: seed.leads,
  opportunities: seed.opportunities,
  stageHistory: [],
  products: seed.products,
  quotes: seed.quotes,
  sales: seed.sales,
  financial: seed.financial,
  tasks: seed.tasks,
  appointments: seed.appointments,
  files: seed.files,
  notifications: seed.notifications,
  audit: [],
  consents: seed.consents,
  dataRequests: seed.dataRequests,
  settings: seed.settings,
  jobs: [],
});

interface Ctx {
  s: State;
  view: View;
  setView: (v: View) => void;
  session: Session | null;
  login: (email: string, pass: string) => { ok: boolean; msg: string };
  logout: (reason?: string) => void;
  touch: () => void;
  me: () => User | null;
  permits: (p: Permission) => boolean;
  scopeIds: () => string[] | "all";
  notify: (msg: string) => void;
  toast: string | null;
  markRead: (id: string) => void;
  markAllRead: () => void;
  pushNotif: (userId: string, type: string, title: string, body: string) => void;
  // domínio
  saveClient: (data: Partial<Client>) => { ok: boolean; msg: string; uid?: string; duplicate?: Client };
  updateClient: (uid: string, patch: Partial<Client>) => void;
  deleteClient: (uid: string, reason: string) => void;
  mergeClients: (fromUid: string, toUid: string, justification: string) => void;
  addContact: (clientUid: string, c: Omit<Contact, "id" | "clientUid">) => void;
  saveLead: (data: Partial<Lead>) => { ok: boolean; msg: string };
  convertLead: (uid: string) => void;
  moveStage: (oppUid: string, stageId: string) => void;
  loseOpportunity: (oppUid: string, reason: string) => void;
  saveQuote: (data: { clientUid: string; items: Item[]; discount: number; validUntil: string }) => void;
  sendQuote: (uid: string) => void;
  acceptQuote: (uid: string) => void;
  createSale: (data: { clientUid: string; items: Item[]; status: Sale["status"] }) => void;
  saveTask: (data: Partial<Task>) => void;
  completeTask: (uid: string) => void;
  uploadFile: (name: string, mime: string, size: number, related: string) => { ok: boolean; msg: string };
  downloadFile: (uid: string) => void;
  deleteFile: (uid: string) => void;
  saveUser: (data: Partial<User>) => { ok: boolean; msg: string };
  setRole: (id: string, role: User["role"]) => void;
  toggleUser: (id: string) => void;
  saveSettings: (patch: Partial<Settings>) => void;
  setConsent: (clientUid: string, purpose: string, basis: string) => void;
  revokeConsent: (id: string) => void;
  openRequest: (clientUid: string, kind: DataRequest["kind"]) => void;
  closeRequest: (id: string) => void;
  exportCsv: (kind: string, rows: string[][], head: string[]) => void;
  runBackup: () => void;
  resetDemo: () => void;
  // perfil & segurança
  changePassword: (current: string, next: string, confirm: string) => { ok: boolean; msg: string };
  toggleTwoFactor: (enable: boolean, code?: string) => { ok: boolean; msg: string; secret?: string };
  updateProfile: (patch: { name?: string; email?: string }) => { ok: boolean; msg: string };
  // dados
  exportBackup: () => void;
  importBackup: (json: string) => { ok: boolean; msg: string };
  seedDemo: () => void;
  wipeAll: () => void;
  // onboarding
  isFirstRun: () => boolean;
  completeSetup: (data: { company: string; adminName: string; adminEmail: string; adminPass: string; timezone: string; currency: string; startEmpty: boolean }) => void;
}

const StoreCtx = createContext<Ctx | null>(null);

function load(): State | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as State) : null;
  } catch {
    return null;
  }
}

const emptyState = (): State => ({
  users: [],
  clients: [],
  contacts: [],
  leads: [],
  opportunities: [],
  stageHistory: [],
  products: [],
  quotes: [],
  sales: [],
  financial: [],
  tasks: [],
  appointments: [],
  files: [],
  notifications: [],
  audit: [],
  consents: [],
  dataRequests: [],
  settings: { ...seed.settings },
  jobs: [],
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(() => load() ?? initial());
  const [view, setView] = useState<View>("dashboard");
  const [session, setSession] = useState<Session | null>(() => {
    const raw = localStorage.getItem(KEY + ".session");
    return raw ? (JSON.parse(raw) as Session) : null;
  });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(s));
  }, [s]);
  useEffect(() => {
    if (session) localStorage.setItem(KEY + ".session", JSON.stringify(session));
    else localStorage.removeItem(KEY + ".session");
  }, [session]);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const notify = useCallback((msg: string) => setToast(msg), []);
  const me = useCallback(() => (session ? (s.users.find((u) => u.id === session.userId) ?? null) : null), [session, s.users]);
  const permits = useCallback((p: Permission) => {
    const u = me();
    return u ? can(u.role, p) : false;
  }, [me]);
  const scopeIds = useCallback(() => {
    const u = me();
    if (!u) return [] as string[];
    return inScope(u.id, u.id, u.role, u.teamId, s.users) && u.role === "vendedor"
      ? [u.id]
      : u.role === "supervisor"
      ? s.users.filter((x) => x.teamId === u.teamId).map((x) => x.id)
      : ("all" as const);
  }, [me, s.users]);

  const audit = (action: string, entityType: string, entityUid: string, detail: string) => {
    const u = me();
    setS((prev) => ({
      ...prev,
      audit: [
        {
          id: uid("aud"),
          userId: u?.id ?? "sistema",
          entityType,
          entityUid,
          action,
          detail,
          ip: "203.0.113.42",
          at: nowIso(),
        },
        ...prev.audit,
      ].slice(0, 400),
    }));
  };

  const pushNotif = (userId: string, type: string, title: string, body: string) => {
    setS((prev) => ({
      ...prev,
      notifications: [{ id: uid("ntf"), userId, type, title, body, createdAt: nowIso(), readAt: null }, ...prev.notifications],
    }));
  };

  const login = (email: string, pass: string) => {
    const user = s.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (user?.lockedUntil && user.lockedUntil > Date.now()) {
      const secs = Math.ceil((user.lockedUntil - Date.now()) / 1000);
      audit("login_bloqueado", "users", user.uid, "tentativa durante bloqueio");
      return { ok: false, msg: `Conta bloqueada. Tente novamente em ${secs}s.` };
    }
    const ok = !!user && user.pass === pass && user.status === "active";
    if (!ok) {
      if (user) {
        const attempts = user.failedAttempts + 1;
        const limit = s.settings.maxLoginAttempts;
        const lock = attempts >= limit ? Date.now() + 60_000 : null;
        setS((p) => ({ ...p, users: p.users.map((u) => (u.id === user.id ? { ...u, failedAttempts: lock ? 0 : attempts, lockedUntil: lock, status: lock ? "locked" : u.status } : u)) }));
        if (lock) audit("conta_bloqueada", "users", user.uid, `${attempts} tentativas falhas`);
      }
      audit("login_failed", "users", user?.uid ?? "desconhecido", "credenciais inválidas");
      return { ok: false, msg: "Credenciais inválidas." }; // mensagem genérica: sem enumeração
    }
    setS((p) => ({ ...p, users: p.users.map((u) => (u.id === user.id ? { ...u, failedAttempts: 0, lockedUntil: null, lastLoginAt: nowIso() } : u)) }));
    setSession({ userId: user.id, issuedAt: Date.now(), lastSeen: Date.now(), reauthAt: 0 });
    audit("login", "users", user.uid, "sessão iniciada");
    return { ok: true, msg: "Sessão iniciada." };
  };

  const logout = (reason?: string) => {
    const u = me();
    if (u) audit("logout", "users", u.uid, reason ?? "logout manual");
    setSession(null);
    setView("dashboard");
  };

  const touch = useCallback(() => setSession((sn) => (sn ? { ...sn, lastSeen: Date.now() } : sn)), []);

  const markRead = (id: string) =>
    setS((p) => ({ ...p, notifications: p.notifications.map((n) => (n.id === id ? { ...n, readAt: nowIso() } : n)) }));
  const markAllRead = () => {
    const u = me();
    if (!u) return;
    setS((p) => ({ ...p, notifications: p.notifications.map((n) => (n.userId === u.id && !n.readAt ? { ...n, readAt: nowIso() } : n)) }));
  };

  const dupCheck = (data: Partial<Client>): Client | undefined =>
    s.clients.find(
      (c) =>
        !c.deletedAt &&
        c.uid !== data.uid &&
        ((data.document && c.document.replace(/\D/g, "") === String(data.document).replace(/\D/g, "")) ||
          (data.email && c.email.toLowerCase() === String(data.email).toLowerCase())),
    );

  const saveClient: Ctx["saveClient"] = (data) => {
    if (!permits("clients.create")) return { ok: false, msg: "Sem permissão para criar clientes." };
    if (!data.name || !data.document) return { ok: false, msg: "Nome e documento são obrigatórios." };
    const dup = dupCheck(data);
    if (dup && !data.uid) return { ok: false, msg: `Possível duplicidade com ${dup.name}.`, duplicate: dup };
    const u = me()!;
    const c: Client = {
      id: uid("c"),
      uid: data.uid ?? uid("cli"),
      kind: data.kind ?? "PF",
      name: data.name!,
      document: data.document!,
      email: data.email ?? "",
      phone: data.phone ?? "",
      ownerId: data.ownerId ?? u.id,
      city: data.city ?? "",
      state: data.state ?? "",
      notes: data.notes ?? "",
      createdAt: data.createdAt ?? nowIso(),
      deletedAt: null,
    };
    setS((p) => ({ ...p, clients: [c, ...p.clients] }));
    audit("client_created", "clients", c.uid, `criado por ${u.name}`);
    notify("Cliente salvo e auditado.");
    return { ok: true, msg: "Cliente salvo.", uid: c.uid };
  };

  const updateClient: Ctx["updateClient"] = (uidv, patch) => {
    if (!permits("clients.update")) return notify("Sem permissão para editar.");
    setS((p) => ({ ...p, clients: p.clients.map((c) => (c.uid === uidv ? { ...c, ...patch } : c)) }));
    audit("client_updated", "clients", uidv, Object.keys(patch).join(", "));
    notify("Cliente atualizado.");
  };

  const deleteClient: Ctx["deleteClient"] = (uidv, reason) => {
    if (!permits("clients.delete")) return notify("Sem permissão para excluir.");
    setS((p) => ({ ...p, clients: p.clients.map((c) => (c.uid === uidv ? { ...c, deletedAt: nowIso() } : c)) }));
    audit("client_deleted", "clients", uidv, `soft delete · ${reason}`);
    notify("Cliente arquivado (exclusão lógica).");
  };

  const mergeClients: Ctx["mergeClients"] = (fromUid, toUid, justification) => {
    if (!permits("clients.merge")) return notify("Sem permissão para mesclar.");
    setS((p) => ({
      ...p,
      clients: p.clients.map((c) => (c.uid === fromUid ? { ...c, deletedAt: nowIso() } : c)),
      opportunities: p.opportunities.map((o) => (o.clientUid === fromUid ? { ...o, clientUid: toUid } : o)),
      quotes: p.quotes.map((q) => (q.clientUid === fromUid ? { ...q, clientUid: toUid } : q)),
      sales: p.sales.map((v) => (v.clientUid === fromUid ? { ...v, clientUid: toUid } : v)),
    }));
    audit("client_merged", "clients", toUid, `origem ${fromUid} · ${justification}`);
    notify("Mesclagem concluída em transação.");
  };

  const addContact: Ctx["addContact"] = (clientUid, c) => {
    setS((p) => ({ ...p, contacts: [{ id: uid("ct"), clientUid, ...c }, ...p.contacts] }));
    audit("contact_created", "contacts", clientUid, c.name);
    notify("Contato adicionado.");
  };

  const saveLead: Ctx["saveLead"] = (data) => {
    if (!permits("leads.create")) return { ok: false, msg: "Sem permissão." };
    if (!data.name) return { ok: false, msg: "Nome é obrigatório." };
    const u = me()!;
    const l: Lead = {
      id: uid("l"),
      uid: data.uid ?? uid("lead"),
      name: data.name!,
      email: data.email ?? "",
      phone: data.phone ?? "",
      company: data.company ?? "",
      source: data.source ?? "Site",
      status: data.status ?? "novo",
      ownerId: data.ownerId ?? u.id,
      score: data.score ?? scoreOf(data),
      createdAt: data.createdAt ?? nowIso(),
      convertedTo: null,
    };
    setS((p) => ({ ...p, leads: [l, ...p.leads] }));
    audit("lead_created", "leads", l.uid, `origem ${l.source}`);
    notify("Lead criado com pontuação automática.");
    return { ok: true, msg: "Lead criado." };
  };

  const convertLead: Ctx["convertLead"] = (leadUid) => {
    if (!permits("leads.convert")) return notify("Sem permissão para converter.");
    const lead = s.leads.find((l) => l.uid === leadUid);
    if (!lead || lead.convertedTo) return notify("Lead já convertido.");
    const clientUid = uid("cli");
    const oppUid = uid("opp");
    setS((p) => ({
      ...p,
      leads: p.leads.map((l) => (l.uid === leadUid ? { ...l, status: "convertido", convertedTo: clientUid } : l)),
      clients: [
        {
          id: uid("c"), uid: clientUid, kind: lead.company ? "PJ" : "PF", name: lead.company || lead.name,
          document: "", email: lead.email, phone: lead.phone, ownerId: lead.ownerId, city: "", state: "",
          notes: `Convertido do lead ${lead.name}`, createdAt: nowIso(), deletedAt: null,
        },
        ...p.clients,
      ],
      opportunities: [
        {
          id: uid("o"), uid: oppUid, title: `Oportunidade — ${lead.company || lead.name}`, clientUid,
          pipelineId: "p1", stageId: "s1", ownerId: lead.ownerId, value: 0, expectedClose: nowIso().slice(0, 10),
          status: "aberta", lostReason: null, version: 1, createdAt: nowIso(), updatedAt: nowIso(),
        },
        ...p.opportunities,
      ],
    }));
    audit("lead_converted", "leads", leadUid, `cliente ${clientUid} + oportunidade ${oppUid}`);
    pushNotif(lead.ownerId, "lead", "Lead convertido", `${lead.name} virou cliente e abriu oportunidade.`);
    notify("Lead convertido em cliente + oportunidade (transação única).");
  };

  const moveStage: Ctx["moveStage"] = (oppUid, stageId) => {
    const opp = s.opportunities.find((o) => o.uid === oppUid);
    if (!opp) return;
    const from = seed.stages.find((x) => x.id === opp.stageId)?.name ?? opp.stageId;
    const to = seed.stages.find((x) => x.id === stageId)?.name ?? stageId;
    setS((p) => ({
      ...p,
      opportunities: p.opportunities.map((o) =>
        o.uid === oppUid ? { ...o, stageId, version: o.version + 1, updatedAt: nowIso() } : o,
      ),
      stageHistory: [
        { id: uid("sh"), oppUid, from, to, userId: me()?.id ?? "sistema", at: nowIso() },
        ...p.stageHistory,
      ],
    }));
    audit("opportunity_stage_changed", "opportunities", oppUid, `${from} → ${to}`);
    notify(`Estágio movido: ${from} → ${to}`);
  };

  const loseOpportunity: Ctx["loseOpportunity"] = (oppUid, reason) => {
    setS((p) => ({ ...p, opportunities: p.opportunities.map((o) => (o.uid === oppUid ? { ...o, status: "perdida", lostReason: reason, updatedAt: nowIso() } : o)) }));
    audit("opportunity_lost", "opportunities", oppUid, reason);
    notify("Oportunidade marcada como perdida.");
  };

  const totals = (items: Item[], discount: number) => {
    const subtotal = items.reduce((acc, it) => acc + it.price * it.qty, 0);
    return { subtotal, total: +(subtotal * (1 - discount / 100)).toFixed(2) };
  };

  const saveQuote: Ctx["saveQuote"] = (data) => {
    if (!permits("quotes.manage")) return notify("Sem permissão.");
    if (data.discount > 15) {
      audit("discount_above_limit", "quotes", data.clientUid, `desconto ${data.discount}% exigiu aprovação`);
      notify("Desconto acima de 15%: registrado para aprovação.");
    }
    const u = me()!;
    const q: Quote = {
      id: uid("q"), uid: uid("quo"), number: `PRO-2026-${String(s.quotes.length + 1).padStart(3, "0")}`,
      clientUid: data.clientUid, ownerId: u.id, status: "draft", items: data.items,
      discount: data.discount, validUntil: data.validUntil, createdAt: nowIso(),
    };
    setS((p) => ({ ...p, quotes: [q, ...p.quotes] }));
    audit("quote_created", "quotes", q.uid, `${q.number} · total ${totals(data.items, data.discount).total}`);
    notify(`Proposta ${q.number} criada (totais recalculados no servidor).`);
  };

  const sendQuote: Ctx["sendQuote"] = (quid) => {
    setS((p) => ({
      ...p,
      quotes: p.quotes.map((q) => (q.uid === quid ? { ...q, status: "sent" } : q)),
      jobs: [{ id: uid("job"), name: "SendQuoteEmail", queue: "mail", status: "pending", createdAt: nowIso() }, ...p.jobs],
    }));
    audit("quote_sent", "quotes", quid, "envio enfileirado");
    notify("Proposta enviada: job de e-mail enfileirado.");
  };

  const acceptQuote: Ctx["acceptQuote"] = (quid) => {
    const q = s.quotes.find((x) => x.uid === quid);
    if (!q) return;
    if (new Date(q.validUntil) < new Date(nowIso())) return notify("Proposta expirada: não é possível aceitar.");
    setS((p) => ({ ...p, quotes: p.quotes.map((x) => (x.uid === quid ? { ...x, status: "accepted" } : x)) }));
    audit("quote_accepted", "quotes", quid, q.number);
    notify("Proposta aceita.");
  };

  const createSale: Ctx["createSale"] = (data) => {
    if (!permits("sales.create")) return notify("Sem permissão para registrar venda.");
    const u = me()!;
    const total = totals(data.items, 0).subtotal;
    const saleUid = uid("sal");
    const number = `VEN-2026-${String(s.sales.length + 1).padStart(3, "0")}`;
    try {
      setS((p) => ({
        ...p,
        sales: [
          { id: uid("v"), uid: saleUid, number, clientUid: data.clientUid, ownerId: u.id, items: data.items, total, status: data.status, soldAt: nowIso() },
          ...p.sales,
        ],
        financial: [
          { id: uid("f"), kind: "receita", description: `${number} · venda`, amount: total, origin: `sale:${saleUid}`, dueAt: nowIso().slice(0, 10) },
          ...p.financial,
        ],
      }));
      audit("sale_created", "sales", saleUid, `${number} · ${total} · itens ${data.items.length}`);
      pushNotif(u.id, "venda", "Venda registrada", `${number} no valor de R$ ${total.toLocaleString("pt-BR")}`);
      notify("Venda registrada com lançamento financeiro e auditoria.");
    } catch {
      notify("Falha na transação: nada foi gravado (rollback).");
    }
  };

  const saveTask: Ctx["saveTask"] = (data) => {
    const u = me()!;
    setS((p) => ({
      ...p,
      tasks: [{ id: uid("t"), uid: uid("tsk"), title: data.title ?? "Nova tarefa", ownerId: data.ownerId ?? u.id, dueAt: data.dueAt ?? nowIso(), status: "pending", priority: data.priority ?? "media", related: data.related ?? "" }, ...p.tasks],
    }));
    audit("task_created", "tasks", data.title ?? "", `responsável ${data.ownerId ?? u.id}`);
    notify("Tarefa criada.");
  };

  const completeTask: Ctx["completeTask"] = (tuid) => {
    setS((p) => ({ ...p, tasks: p.tasks.map((t) => (t.uid === tuid ? { ...t, status: "completed" } : t)) }));
    audit("task_completed", "tasks", tuid, "concluída");
    notify("Tarefa concluída.");
  };

  const ALLOWED = ["application/pdf", "image/png", "image/jpeg", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
  const uploadFile: Ctx["uploadFile"] = (name, mime, size, related) => {
    if (/\.(php|phtml|phar|exe|sh|js)$/i.test(name)) {
      audit("upload_rejeitado", "files", name, "extensão não permitida");
      return { ok: false, msg: "Extensão não permitida. Upload recusado." };
    }
    if (!ALLOWED.includes(mime)) {
      audit("upload_rejeitado", "files", name, `mime ${mime} fora da allowlist`);
      return { ok: false, msg: "MIME type fora da lista permitida." };
    }
    if (size > 5 * 1024 * 1024) return { ok: false, msg: "Arquivo acima de 5 MB." };
    const u = me()!;
    setS((p) => ({
      ...p,
      files: [{ id: uid("fl"), uid: uid("fil"), name: name.replace(/[^a-zA-Z0-9._-]/g, "_"), mime, size, ownerId: u.id, related, version: 1, downloads: 0, createdAt: nowIso(), deletedAt: null }, ...p.files],
    }));
    audit("file_upload", "files", name, `${mime} · ${size} bytes`);
    return { ok: true, msg: "Arquivo enviado com nome saneado." };
  };

  const downloadFile: Ctx["downloadFile"] = (fuid) => {
    setS((p) => ({ ...p, files: p.files.map((f) => (f.uid === fuid ? { ...f, downloads: f.downloads + 1 } : f)) }));
    audit("file_download", "files", fuid, "download autorizado");
    notify("Download registrado em auditoria.");
  };

  const deleteFile = (fuid: string) => {
    setS((p) => ({ ...p, files: p.files.map((f) => (f.uid === fuid ? { ...f, deletedAt: nowIso() } : f)) }));
    audit("file_delete", "files", fuid, "exclusão lógica");
    notify("Arquivo removido (exclusão lógica).");
  };

  const saveUser: Ctx["saveUser"] = (data) => {
    if (!permits("users.manage")) return { ok: false, msg: "Sem permissão para gerenciar usuários." };
    if (!data.name || !data.email) return { ok: false, msg: "Nome e e-mail são obrigatórios." };
    if ((data.pass ?? "").length < s.settings.passwordMin && !data.id) return { ok: false, msg: `Senha mínima de ${s.settings.passwordMin} caracteres.` };
    setS((p) => ({
      ...p,
      users: [
        {
          id: data.id ?? uid("u"), uid: data.uid ?? uid("usr"),
          name: data.name!, email: data.email!, pass: data.pass ?? "Trocar@2026",
          role: data.role ?? "vendedor", teamId: data.teamId ?? "t1", status: "active",
          twoFactor: false, failedAttempts: 0, lockedUntil: null, lastLoginAt: null,
        },
        ...p.users,
      ],
    }));
    audit("user_created", "users", data.email!, `papel ${data.role ?? "vendedor"}`);
    notify("Usuário criado.");
    return { ok: true, msg: "Usuário criado." };
  };

  const setRole: Ctx["setRole"] = (id, role) => {
    if (!permits("users.manage")) return notify("Sem permissão para alterar permissões.");
    setS((p) => ({ ...p, users: p.users.map((u) => (u.id === id ? { ...u, role } : u)) }));
    audit("permission_changed", "users", id, `novo papel ${role}`);
    notify("Papel alterado e auditado.");
  };

  const toggleUser: Ctx["toggleUser"] = (id) => {
    setS((p) => ({ ...p, users: p.users.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u)) }));
    audit("user_updated", "users", id, "status alternado");
    notify("Status do usuário atualizado.");
  };

  const saveSettings: Ctx["saveSettings"] = (patch) => {
    if (!permits("settings.manage")) return notify("Somente Super Admin altera configurações críticas.");
    setS((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
    audit("settings_changed", "system_settings", "global", Object.keys(patch).join(", "));
    notify("Configurações salvas com auditoria.");
  };

  const setConsent: Ctx["setConsent"] = (clientUid, purpose, basis) => {
    setS((p) => ({ ...p, consents: [{ id: uid("cs"), clientUid, purpose, legalBasis: basis, policyVersion: "v1.2", grantedAt: nowIso(), revokedAt: null }, ...p.consents] }));
    audit("consent_granted", "consents", clientUid, `${purpose} · ${basis}`);
    notify("Consentimento registrado.");
  };

  const revokeConsent: Ctx["revokeConsent"] = (id) => {
    setS((p) => ({ ...p, consents: p.consents.map((c) => (c.id === id ? { ...c, revokedAt: nowIso() } : c)) }));
    audit("consent_revoked", "consents", id, "revogado pelo titular");
    notify("Consentimento revogado.");
  };

  const openRequest: Ctx["openRequest"] = (clientUid, kind) => {
    setS((p) => ({ ...p, dataRequests: [{ id: uid("dr"), clientUid, kind, status: "aberta", openedAt: nowIso().slice(0, 10), dueAt: new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10), closedAt: null }, ...p.dataRequests] }));
    audit("data_request_created", "data_requests", clientUid, kind);
    notify("Solicitação do titular aberta com prazo de 15 dias.");
  };

  const closeRequest: Ctx["closeRequest"] = (id) => {
    const req = s.dataRequests.find((r) => r.id === id);
    if (!req) return;
    setS((p) => ({
      ...p,
      dataRequests: p.dataRequests.map((r) => (r.id === id ? { ...r, status: "concluida", closedAt: nowIso().slice(0, 10) } : r)),
      clients:
        req.kind === "anonimizacao"
          ? p.clients.map((c) => (c.uid === req.clientUid ? { ...c, name: "Titular anonimizado", email: "", phone: "", document: "***", notes: "Anonimizado a pedido do titular." } : c))
          : p.clients,
    }));
    audit(req.kind === "anonimizacao" ? "data_anonymized" : "data_request_closed", "data_requests", id, req.kind);
    notify("Solicitação concluída e registrada.");
  };

  const exportCsv: Ctx["exportCsv"] = (kind, rows, head) => {
    if (!permits("export.full")) return notify("Sem permissão para exportação completa.");
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kind}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    audit("export_data", "reports", kind, `${rows.length} linhas`);
    notify(`Exportação de ${rows.length} linhas registrada em auditoria.`);
  };

  const runBackup = () => {
    setS((p) => ({ ...p, jobs: [{ id: uid("job"), name: "RunBackup", queue: "maintenance", status: "done", createdAt: nowIso() }, ...p.jobs] }));
    audit("backup_created", "system", "dump", "dump diário simulado");
    notify("Backup executado e verificado (simulado).");
  };

  const resetDemo = () => {
    localStorage.removeItem(KEY);
    localStorage.removeItem(KEY + ".session");
    setS(initial());
    setSession(null);
    notify("Base de demonstração restaurada.");
  };

  const changePassword: Ctx["changePassword"] = (current, next, confirm) => {
    const u = me();
    if (!u) return { ok: false, msg: "Sem sessão." };
    if (u.pass !== current) {
      audit("password_change_failed", "users", u.uid, "senha atual não confere");
      return { ok: false, msg: "Senha atual não confere." };
    }
    if (next.length < s.settings.passwordMin) return { ok: false, msg: `Nova senha precisa de pelo menos ${s.settings.passwordMin} caracteres.` };
    if (next !== confirm) return { ok: false, msg: "As senhas não coincidem." };
    if (!/[A-Z]/.test(next) || !/[0-9]/.test(next) || !/[^A-Za-z0-9]/.test(next))
      return { ok: false, msg: "Use maiúscula, número e símbolo." };
    setS((p) => ({ ...p, users: p.users.map((x) => (x.id === u.id ? { ...x, pass: next } : x)) }));
    audit("password_changed", "users", u.uid, "usuário alterou a própria senha");
    notify("Senha alterada. Argon2id + pepper em produção; aqui é simulado.");
    return { ok: true, msg: "Senha atualizada." };
  };

  const toggleTwoFactor: Ctx["toggleTwoFactor"] = (enable, code) => {
    const u = me();
    if (!u) return { ok: false, msg: "Sem sessão." };
    if (enable) {
      if (!code || code.length < 6) return { ok: false, msg: "Digite o código de 6 dígitos do app autenticador." };
      if (!/^\d{6}$/.test(code)) return { ok: false, msg: "Código deve conter apenas 6 dígitos." };
      setS((p) => ({ ...p, users: p.users.map((x) => (x.id === u.id ? { ...x, twoFactor: true } : x)) }));
      audit("2fa_enabled", "users", u.uid, "TOTP ativado");
      notify("2FA ativado. Guarde os códigos de recuperação em local seguro.");
      return { ok: true, msg: "2FA ativado." };
    }
    setS((p) => ({ ...p, users: p.users.map((x) => (x.id === u.id ? { ...x, twoFactor: false } : x)) }));
    audit("2fa_disabled", "users", u.uid, "TOTP desativado (reautenticação exigida)");
    notify("2FA desativado.");
    return { ok: true, msg: "2FA desativado." };
  };

  const updateProfile: Ctx["updateProfile"] = (patch) => {
    const u = me();
    if (!u) return { ok: false, msg: "Sem sessão." };
    if (patch.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(patch.email)) return { ok: false, msg: "E-mail inválido." };
    setS((p) => ({ ...p, users: p.users.map((x) => (x.id === u.id ? { ...x, ...patch } : x)) }));
    audit("user_updated", "users", u.uid, "perfil próprio atualizado");
    notify("Perfil atualizado.");
    return { ok: true, msg: "Perfil atualizado." };
  };

  const exportBackup = () => {
    const dump = JSON.stringify({ version: 2, at: new Date().toISOString(), data: s }, null, 2);
    const blob = new Blob([dump], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crmcore-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    audit("backup_exported", "system", "json", `${(dump.length / 1024).toFixed(0)} KB`);
    notify("Backup completo exportado em JSON.");
  };

  const importBackup: Ctx["importBackup"] = (json) => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed?.data?.users || !parsed?.data?.settings) return { ok: false, msg: "Estrutura inválida do backup." };
      setS(parsed.data as State);
      audit("backup_restored", "system", "json", "restauração via arquivo");
      notify("Backup restaurado. Sessão preservada.");
      return { ok: true, msg: "Backup restaurado." };
    } catch {
      return { ok: false, msg: "Arquivo JSON inválido." };
    }
  };

  const seedDemo = () => {
    setS(initial());
    audit("demo_seeded", "system", "seed", "dados de demonstração restaurados");
    notify("Dados de demonstração carregados.");
  };

  const wipeAll = () => {
    localStorage.removeItem(KEY);
    localStorage.removeItem(KEY + ".session");
    setS(emptyState());
    setSession(null);
    notify("Ambiente zerado. Retomar onboarding.");
  };

  const isFirstRun = () => s.users.length === 0;

  const completeSetup: Ctx["completeSetup"] = (data) => {
    const admin: User = {
      id: uid("u"), uid: uid("usr"), name: data.adminName, email: data.adminEmail, pass: data.adminPass,
      role: "super_admin", teamId: "t1", status: "active", twoFactor: false,
      failedAttempts: 0, lockedUntil: null, lastLoginAt: null,
    };
    const base = data.startEmpty ? emptyState() : initial();
    const next: State = {
      ...base,
      users: [admin, ...(data.startEmpty ? [] : base.users.filter((u) => u.role !== "super_admin"))],
      settings: {
        ...base.settings,
        systemName: data.company,
        timezone: data.timezone,
        currency: data.currency,
      },
    };
    setS(next);
    setSession({ userId: admin.id, issuedAt: Date.now(), lastSeen: Date.now(), reauthAt: 0 });
    // audit rodará no próximo tick, mas garantimos entrada
    window.setTimeout(() => audit("setup_completed", "system", "install", `empresa ${data.company}`), 0);
    notify(`Ambiente pronto. Bem-vindo, ${data.adminName.split(" ")[0]}.`);
  };

  const value: Ctx = {
    s, view, setView, session, login, logout, touch, me, permits, scopeIds, notify, toast, markRead, markAllRead, pushNotif,
    saveClient, updateClient, deleteClient, mergeClients, addContact, saveLead, convertLead, moveStage, loseOpportunity,
    saveQuote, sendQuote, acceptQuote, createSale, saveTask, completeTask, uploadFile, downloadFile, deleteFile,
    saveUser, setRole, toggleUser, saveSettings, setConsent, revokeConsent, openRequest, closeRequest, exportCsv,
    runBackup, resetDemo,
    changePassword, toggleTwoFactor, updateProfile,
    exportBackup, importBackup, seedDemo, wipeAll,
    isFirstRun, completeSetup,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useCrm() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("Store ausente");
  return c;
}

export function scoreOf(data: Partial<Lead>): number {
  let s = 30;
  if (data.email) s += 15;
  if (data.phone) s += 15;
  if (data.company) s += 20;
  if (data.source === "Indicação") s += 20;
  if (data.source === "WhatsApp") s += 10;
  return Math.min(s, 100);
}

export function useVisible<T extends { ownerId: string }>(rows: T[]): T[] {
  const { scopeIds } = useCrm();
  return useMemo(() => {
    const scope = scopeIds();
    return scope === "all" ? rows : rows.filter((r) => scope.includes(r.ownerId));
  }, [rows, scopeIds]);
}
