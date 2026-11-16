import type {
  Appointment,
  Client,
  Consent,
  Contact,
  DataRequest,
  DocFile,
  FinancialEntry,
  Lead,
  Notification,
  Opportunity,
  Pipeline,
  Product,
  Quote,
  Sale,
  Settings,
  Stage,
  Task,
  User,
} from "./types";

const iso = (d: string) => d;

export const users: User[] = [
  { id: "u1", uid: "usr_admin", name: "Helena Costa", email: "xavier.y@example.org", pass: "Admin@2026", role: "super_admin", teamId: "t1", status: "active", twoFactor: true, failedAttempts: 0, lockedUntil: null, lastLoginAt: null },
  { id: "u2", uid: "usr_gerente", name: "Rafael Prado", email: "zoe.m@example.net", pass: "Gerente@2026", role: "gerente", teamId: "t1", status: "active", twoFactor: false, failedAttempts: 0, lockedUntil: null, lastLoginAt: null },
  { id: "u3", uid: "usr_sup", name: "Marina Alves", email: "iris.p@example.org", pass: "Super@2026", role: "supervisor", teamId: "t1", status: "active", twoFactor: false, failedAttempts: 0, lockedUntil: null, lastLoginAt: null },
  { id: "u4", uid: "usr_vend1", name: "Tiago Nunes", email: "ana.f@email.com", pass: "Vendas@2026", role: "vendedor", teamId: "t1", status: "active", twoFactor: false, failedAttempts: 0, lockedUntil: null, lastLoginAt: null },
  { id: "u5", uid: "usr_vend2", name: "Luana Dias", email: "rui.m@email.com", pass: "Vendas@2026", role: "vendedor", teamId: "t2", status: "active", twoFactor: false, failedAttempts: 0, lockedUntil: null, lastLoginAt: null },
  { id: "u6", uid: "usr_fin", name: "Caio Mello", email: "lia.p@email.com", pass: "Fin@2026", role: "financeiro", teamId: "t2", status: "active", twoFactor: false, failedAttempts: 0, lockedUntil: null, lastLoginAt: null },
];

export const clients: Client[] = [
  { id: "c1", uid: "cli_padaria", kind: "PJ", name: "Padaria Aurora Ltda", document: "12.345.678/0001-90", email: "contato@aurora.com", phone: "(11) 98877-6655", ownerId: "u4", city: "São Paulo", state: "SP", notes: "Compra recorrente de insumos.", createdAt: iso("2026-01-12"), deletedAt: null },
  { id: "c2", uid: "cli_mariana", kind: "PF", name: "Mariana Toledo", document: "529.982.247-25", email: "mariana@email.com", phone: "(21) 99999-1010", ownerId: "u4", city: "Rio de Janeiro", state: "RJ", notes: "Indicada por cliente antigo.", createdAt: iso("2026-01-28"), deletedAt: null },
  { id: "c3", uid: "cli_techsol", kind: "PJ", name: "TechSol Serviços", document: "98.765.432/0001-10", email: "comercial@techsol.com", phone: "(31) 3322-1100", ownerId: "u5", city: "Belo Horizonte", state: "MG", notes: "Contrato anual de manutenção.", createdAt: iso("2026-02-03"), deletedAt: null },
  { id: "c4", uid: "cli_bruno", kind: "PF", name: "Bruno Sarmento", document: "111.444.777-35", email: "bruno@email.com", phone: "(48) 98888-2020", ownerId: "u5", city: "Florianópolis", state: "SC", notes: "Aguardando retorno sobre proposta.", createdAt: iso("2026-02-19"), deletedAt: null },
  { id: "c5", uid: "cli_verte", kind: "PJ", name: "Verte Alimentos", document: "45.678.912/0001-23", email: "compras@verte.com", phone: "(19) 3456-7890", ownerId: "u4", city: "Campinas", state: "SP", notes: "Potencial de volume alto.", createdAt: iso("2026-03-05"), deletedAt: null },
];

export const contacts: Contact[] = [
  { id: "ct1", clientUid: "cli_padaria", name: "Sérgio Aurora", email: "sergio@aurora.com", phone: "(11) 97777-1111", role: "Sócio" },
  { id: "ct2", clientUid: "cli_techsol", name: "Paula Rocha", email: "paula@techsol.com", phone: "(31) 98888-2222", role: "Compras" },
  { id: "ct3", clientUid: "cli_verte", name: "Igor Lins", email: "igor@verte.com", phone: "(19) 99666-3333", role: "Financeiro" },
];

export const leads: Lead[] = [
  { id: "l1", uid: "lead_1", name: "Camila Freitas", email: "camila@email.com", phone: "(11) 91234-5678", company: "Freitas Café", source: "Site", status: "qualificado", ownerId: "u4", score: 78, createdAt: iso("2026-03-01"), convertedTo: null },
  { id: "l2", uid: "lead_2", name: "Otávio Lins", email: "otavio@email.com", phone: "(21) 99876-5432", company: "Lins Lab", source: "Indicação", status: "novo", ownerId: "u4", score: 41, createdAt: iso("2026-03-10"), convertedTo: null },
  { id: "l3", uid: "lead_3", name: "Beatriz Moraes", email: "bia@email.com", phone: "(31) 98765-4321", company: "Moraes Tech", source: "WhatsApp", status: "contato", ownerId: "u5", score: 63, createdAt: iso("2026-03-14"), convertedTo: null },
  { id: "l4", uid: "lead_4", name: "Henrique Sá", email: "henrique@email.com", phone: "(48) 96666-1111", company: "Sá Transportes", source: "Evento", status: "desqualificado", ownerId: "u5", score: 12, createdAt: iso("2026-02-22"), convertedTo: null },
  { id: "l5", uid: "lead_5", name: "Juliana Prado", email: "juliana@email.com", phone: "(19) 95555-0000", company: "Prado Studio", source: "Site", status: "novo", ownerId: "u4", score: 55, createdAt: iso("2026-03-20"), convertedTo: null },
];

export const pipelines: Pipeline[] = [
  { id: "p1", name: "Venda Consultiva" },
  { id: "p2", name: "Inside Sales" },
];

export const stages: Stage[] = [
  { id: "s1", pipelineId: "p1", name: "Novo Lead", position: 1, probability: 10, color: "#8fd3ff" },
  { id: "s2", pipelineId: "p1", name: "Contato realizado", position: 2, probability: 25, color: "#c9a36a" },
  { id: "s3", pipelineId: "p1", name: "Qualificação", position: 3, probability: 45, color: "#e8d5a8" },
  { id: "s4", pipelineId: "p1", name: "Proposta", position: 4, probability: 65, color: "#ffb38a" },
  { id: "s5", pipelineId: "p1", name: "Negociação", position: 5, probability: 80, color: "#c8f54a" },
  { id: "s6", pipelineId: "p1", name: "Fechado ganho", position: 6, probability: 100, color: "#7ee787" },
  { id: "s7", pipelineId: "p2", name: "Entrada", position: 1, probability: 15, color: "#8fd3ff" },
  { id: "s8", pipelineId: "p2", name: "Demo", position: 2, probability: 40, color: "#c9a36a" },
  { id: "s9", pipelineId: "p2", name: "Fechamento", position: 3, probability: 85, color: "#c8f54a" },
];

export const opportunities: Opportunity[] = [
  { id: "o1", uid: "opp_1", title: "Fornecimento mensal — Aurora", clientUid: "cli_padaria", pipelineId: "p1", stageId: "s4", ownerId: "u4", value: 48000, expectedClose: iso("2026-04-15"), status: "aberta", lostReason: null, version: 1, createdAt: iso("2026-02-10"), updatedAt: iso("2026-03-18") },
  { id: "o2", uid: "opp_2", title: "Consultoria de TI — TechSol", clientUid: "cli_techsol", pipelineId: "p1", stageId: "s5", ownerId: "u5", value: 92000, expectedClose: iso("2026-04-05"), status: "aberta", lostReason: null, version: 1, createdAt: iso("2026-02-25"), updatedAt: iso("2026-03-22") },
  { id: "o3", uid: "opp_3", title: "Kit corporativo — Verte", clientUid: "cli_verte", pipelineId: "p1", stageId: "s2", ownerId: "u4", value: 15500, expectedClose: iso("2026-05-10"), status: "aberta", lostReason: null, version: 1, createdAt: iso("2026-03-08"), updatedAt: iso("2026-03-20") },
  { id: "o4", uid: "opp_4", title: "Projeto residencial — Mariana", clientUid: "cli_mariana", pipelineId: "p2", stageId: "s8", ownerId: "u4", value: 32000, expectedClose: iso("2026-04-28"), status: "aberta", lostReason: null, version: 1, createdAt: iso("2026-03-12"), updatedAt: iso("2026-03-19") },
  { id: "o5", uid: "opp_5", title: "Upgrade de licenças — Bruno", clientUid: "cli_bruno", pipelineId: "p2", stageId: "s9", ownerId: "u5", value: 7400, expectedClose: iso("2026-03-30"), status: "aberta", lostReason: null, version: 1, createdAt: iso("2026-03-15"), updatedAt: iso("2026-03-24") },
];

export const products: Product[] = [
  { id: "pr1", uid: "prd_setup", kind: "service", name: "Implantação e setup", sku: "SRV-SET-01", price: 4800, cost: 2100, category: "Serviços", status: "active" },
  { id: "pr2", uid: "prd_licenca", kind: "product", name: "Licença anual (usuário)", sku: "PRD-LIC-01", price: 890, cost: 320, category: "Software", status: "active" },
  { id: "pr3", uid: "prd_suporte", kind: "service", name: "Suporte premium 12 meses", sku: "SRV-SUP-12", price: 9600, cost: 4300, category: "Serviços", status: "active" },
  { id: "pr4", uid: "prd_treinamento", kind: "service", name: "Treinamento de equipe", sku: "SRV-TRN-01", price: 3500, cost: 1500, category: "Serviços", status: "active" },
  { id: "pr5", uid: "prd_kit", kind: "product", name: "Kit corporativo 50 un.", sku: "PRD-KIT-50", price: 1250, cost: 610, category: "Produtos", status: "active" },
];

export const quotes: Quote[] = [
  {
    id: "q1", uid: "quo_1", number: "PRO-2026-001", clientUid: "cli_padaria", ownerId: "u4",
    status: "sent", discount: 5, validUntil: iso("2026-04-10"),
    items: [{ productUid: "prd_setup", qty: 1, price: 4800 }, { productUid: "prd_suporte", qty: 1, price: 9600 }],
    createdAt: iso("2026-03-11"),
  },
  {
    id: "q2", uid: "quo_2", number: "PRO-2026-002", clientUid: "cli_techsol", ownerId: "u5",
    status: "accepted", discount: 10, validUntil: iso("2026-04-02"),
    items: [{ productUid: "prd_licenca", qty: 80, price: 890 }, { productUid: "prd_treinamento", qty: 2, price: 3500 }],
    createdAt: iso("2026-03-02"),
  },
];

export const sales: Sale[] = [
  {
    id: "v1", uid: "sal_1", number: "VEN-2026-001", clientUid: "cli_techsol", ownerId: "u5",
    items: [{ productUid: "prd_licenca", qty: 80, price: 890 }],
    total: 71200, status: "paga", soldAt: iso("2026-03-20"),
  },
  {
    id: "v2", uid: "sal_2", number: "VEN-2026-002", clientUid: "cli_mariana", ownerId: "u4",
    items: [{ productUid: "prd_treinamento", qty: 1, price: 3500 }],
    total: 3500, status: "pendente", soldAt: iso("2026-03-25"),
  },
];

export const financial: FinancialEntry[] = [
  { id: "f1", kind: "receita", description: "VEN-2026-001 · TechSol", amount: 71200, origin: "sale:sal_1", dueAt: iso("2026-04-20") },
  { id: "f2", kind: "receita", description: "VEN-2026-002 · Mariana Toledo", amount: 3500, origin: "sale:sal_2", dueAt: iso("2026-04-25") },
  { id: "f3", kind: "despesa", description: "Infraestrutura — mensal", amount: 4800, origin: "cost:infra", dueAt: iso("2026-04-05") },
];

export const tasks: Task[] = [
  { id: "t1", uid: "tsk_1", title: "Ligar para Verte sobre proposta", ownerId: "u4", dueAt: iso("2026-03-27T10:00"), status: "pending", priority: "alta", related: "cli_verte" },
  { id: "t2", uid: "tsk_2", title: "Enviar aditivo para TechSol", ownerId: "u5", dueAt: iso("2026-03-28T14:00"), status: "in_progress", priority: "media", related: "cli_techsol" },
  { id: "t3", uid: "tsk_3", title: "Follow-up lead Camila Freitas", ownerId: "u4", dueAt: iso("2026-03-26T09:00"), status: "completed", priority: "media", related: "lead_1" },
  { id: "t4", uid: "tsk_4", title: "Revisar margem da proposta 001", ownerId: "u2", dueAt: iso("2026-03-30T16:00"), status: "pending", priority: "baixa", related: "quo_1" },
];

export const appointments: Appointment[] = [
  { id: "a1", uid: "apt_1", title: "Reunião de fechamento — TechSol", ownerId: "u5", startAt: iso("2026-03-27T10:00"), endAt: iso("2026-03-27T11:00"), type: "reuniao" },
  { id: "a2", uid: "apt_2", title: "Ligação com Aurora", ownerId: "u4", startAt: iso("2026-03-27T15:00"), endAt: iso("2026-03-27T15:30"), type: "ligacao" },
  { id: "a3", uid: "apt_3", title: "Follow-up Verte", ownerId: "u4", startAt: iso("2026-03-30T09:00"), endAt: iso("2026-03-30T09:30"), type: "followup" },
];

export const files: DocFile[] = [
  { id: "fl1", uid: "fil_1", name: "contrato-techsol.pdf", mime: "application/pdf", size: 284_000, ownerId: "u5", related: "cli_techsol", version: 2, downloads: 4, createdAt: iso("2026-03-20"), deletedAt: null },
  { id: "fl2", uid: "fil_2", name: "proposta-aurora.pdf", mime: "application/pdf", size: 156_000, ownerId: "u4", related: "quo_1", version: 1, downloads: 2, createdAt: iso("2026-03-11"), deletedAt: null },
];

export const notifications: Notification[] = [
  { id: "n1", userId: "u4", type: "task", title: "Tarefa vencendo", body: "Ligar para Verte sobre proposta — hoje.", createdAt: iso("2026-03-26T08:00"), readAt: null },
  { id: "n2", userId: "u1", type: "security", title: "Alteração de permissão", body: "Papel de Marina Alves atualizado.", createdAt: iso("2026-03-25T17:30"), readAt: null },
];

export const consents: Consent[] = [
  { id: "cs1", clientUid: "cli_padaria", purpose: "Comunicações comerciais", legalBasis: "Legítimo interesse", policyVersion: "v1.2", grantedAt: iso("2026-01-12"), revokedAt: null },
  { id: "cs2", clientUid: "cli_mariana", purpose: "Marketing por e-mail", legalBasis: "Consentimento", policyVersion: "v1.2", grantedAt: iso("2026-01-28"), revokedAt: null },
  { id: "cs3", clientUid: "cli_techsol", purpose: "Comunicações comerciais", legalBasis: "Legítimo interesse", policyVersion: "v1.1", grantedAt: iso("2026-02-03"), revokedAt: iso("2026-03-01") },
];

export const dataRequests: DataRequest[] = [
  { id: "dr1", clientUid: "cli_bruno", kind: "acesso", status: "em_andamento", openedAt: iso("2026-03-18"), dueAt: iso("2026-04-02"), closedAt: null },
  { id: "dr2", clientUid: "cli_techsol", kind: "anonimizacao", status: "aberta", openedAt: iso("2026-03-01"), dueAt: iso("2026-03-31"), closedAt: null },
];

export const settings: Settings = {
  systemName: "CRM Core",
  timezone: "America/Sao_Paulo",
  currency: "BRL",
  sessionIdle: 30,
  passwordMin: 10,
  maxLoginAttempts: 5,
  backupDaily: true,
  maintenance: false,
};
