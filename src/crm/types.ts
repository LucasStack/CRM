export type RoleId = "super_admin" | "admin" | "gerente" | "supervisor" | "vendedor" | "financeiro";
export type Scope = "all" | "team" | "own";

export interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  pass: string;
  role: RoleId;
  teamId: string;
  status: "active" | "inactive" | "locked";
  twoFactor: boolean;
  failedAttempts: number;
  lockedUntil: number | null;
  lastLoginAt: string | null;
}

export interface Client {
  id: string;
  uid: string;
  kind: "PF" | "PJ";
  name: string;
  document: string;
  email: string;
  phone: string;
  ownerId: string;
  city: string;
  state: string;
  notes: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface Contact {
  id: string;
  clientUid: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Lead {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: "novo" | "contato" | "qualificado" | "desqualificado" | "convertido";
  ownerId: string;
  score: number;
  createdAt: string;
  convertedTo: string | null;
}

export interface Pipeline {
  id: string;
  name: string;
}

export interface Stage {
  id: string;
  pipelineId: string;
  name: string;
  position: number;
  probability: number;
  color: string;
}

export interface Opportunity {
  id: string;
  uid: string;
  title: string;
  clientUid: string | null;
  pipelineId: string;
  stageId: string;
  ownerId: string;
  value: number;
  expectedClose: string;
  status: "aberta" | "ganha" | "perdida";
  lostReason: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface StageHistory {
  id: string;
  oppUid: string;
  from: string;
  to: string;
  userId: string;
  at: string;
}

export interface Product {
  id: string;
  uid: string;
  kind: "product" | "service";
  name: string;
  sku: string;
  price: number;
  cost: number;
  category: string;
  status: "active" | "inactive";
}

export interface Item {
  productUid: string;
  qty: number;
  price: number;
}

export interface Quote {
  id: string;
  uid: string;
  number: string;
  clientUid: string;
  ownerId: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  items: Item[];
  discount: number;
  validUntil: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  uid: string;
  number: string;
  clientUid: string;
  ownerId: string;
  items: Item[];
  total: number;
  status: "paga" | "pendente" | "cancelada";
  soldAt: string;
}

export interface FinancialEntry {
  id: string;
  kind: "receita" | "despesa";
  description: string;
  amount: number;
  origin: string;
  dueAt: string;
}

export interface Task {
  id: string;
  uid: string;
  title: string;
  ownerId: string;
  dueAt: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "baixa" | "media" | "alta";
  related: string;
}

export interface Appointment {
  id: string;
  uid: string;
  title: string;
  ownerId: string;
  startAt: string;
  endAt: string;
  type: "reuniao" | "ligacao" | "followup";
}

export interface DocFile {
  id: string;
  uid: string;
  name: string;
  mime: string;
  size: number;
  ownerId: string;
  related: string;
  version: number;
  downloads: number;
  createdAt: string;
  deletedAt: string | null;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface AuditRow {
  id: string;
  userId: string;
  entityType: string;
  entityUid: string;
  action: string;
  detail: string;
  ip: string;
  at: string;
}

export interface Consent {
  id: string;
  clientUid: string;
  purpose: string;
  legalBasis: string;
  policyVersion: string;
  grantedAt: string;
  revokedAt: string | null;
}

export interface DataRequest {
  id: string;
  clientUid: string;
  kind: "acesso" | "correcao" | "exclusao" | "anonimizacao" | "portabilidade";
  status: "aberta" | "em_andamento" | "concluida" | "recusada";
  openedAt: string;
  dueAt: string;
  closedAt: string | null;
}

export interface Settings {
  systemName: string;
  timezone: string;
  currency: string;
  sessionIdle: number;
  passwordMin: number;
  maxLoginAttempts: number;
  backupDaily: boolean;
  maintenance: boolean;
}

export interface Session {
  userId: string;
  issuedAt: number;
  lastSeen: number;
  reauthAt: number;
}

export interface JobRow {
  id: string;
  name: string;
  queue: string;
  status: "pending" | "done" | "failed";
  createdAt: string;
}
