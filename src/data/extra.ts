export interface Endpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  scope: string;
  desc: string;
  limit: string;
}

export const endpoints: Endpoint[] = [
  { method: "GET", path: "/api/v1/clients", scope: "clients.read", desc: "Lista paginada com filtro e ordenação em allowlist", limit: "120/min" },
  { method: "POST", path: "/api/v1/clients", scope: "clients.write", desc: "Cria cliente com validação de CPF/CNPJ e duplicidade", limit: "30/min" },
  { method: "GET", path: "/api/v1/clients/{uid}", scope: "clients.read", desc: "Detalhe com contatos e endereços (escopo aplicado)", limit: "120/min" },
  { method: "PUT", path: "/api/v1/clients/{uid}", scope: "clients.write", desc: "Atualização parcial com locking otimista por version", limit: "30/min" },
  { method: "DELETE", path: "/api/v1/clients/{uid}", scope: "clients.delete", desc: "Soft delete com motivo obrigatório", limit: "10/min" },
  { method: "GET", path: "/api/v1/leads", scope: "leads.read", desc: "Leads do escopo, com score e origem", limit: "120/min" },
  { method: "POST", path: "/api/v1/leads", scope: "leads.write", desc: "Captura (inclusive via formulário público com captcha)", limit: "20/min" },
  { method: "POST", path: "/api/v1/leads/{uid}/convert", scope: "leads.convert", desc: "Converte em cliente + oportunidade (idempotente)", limit: "20/min" },
  { method: "GET", path: "/api/v1/opportunities", scope: "opportunities.read", desc: "Funil agregado por estágio", limit: "120/min" },
  { method: "POST", path: "/api/v1/opportunities/{uid}/stage", scope: "opportunities.write", desc: "Move estágio e grava histórico", limit: "60/min" },
  { method: "POST", path: "/api/v1/quotes", scope: "quotes.write", desc: "Cria proposta; totais recalculados no servidor", limit: "30/min" },
  { method: "POST", path: "/api/v1/quotes/{uid}/send", scope: "quotes.send", desc: "Enfileira envio por e-mail", limit: "20/min" },
  { method: "POST", path: "/api/v1/sales", scope: "sales.write", desc: "Fecha venda em transação única", limit: "20/min" },
  { method: "GET", path: "/api/v1/reports/sales", scope: "reports.read", desc: "Relatório agregado com filtro de período", limit: "30/min" },
  { method: "POST", path: "/api/v1/files", scope: "files.write", desc: "Upload com validação de MIME real", limit: "15/min" },
  { method: "GET", path: "/api/v1/me", scope: "profile.read", desc: "Perfil e permissões efetivas do token", limit: "60/min" },
  { method: "POST", path: "/api/v1/tokens", scope: "tokens.manage", desc: "Emite token (valor exibido uma única vez)", limit: "5/min" },
  { method: "DELETE", path: "/api/v1/tokens/{id}", scope: "tokens.manage", desc: "Revoga imediatamente", limit: "10/min" },
  { method: "GET", path: "/health", scope: "público", desc: "Banco, disco e fila — sem dado interno", limit: "—" },
  { method: "POST", path: "/webhooks/{provider}", scope: "assinatura HMAC", desc: "Recebe evento com idempotência", limit: "por provedor" },
];

export interface Resource {
  key: string;
  label: string;
  allow: Record<string, "T" | "E" | "P" | "—">;
}

export const ROLES = [
  "Super Admin",
  "Administrador",
  "Gerente",
  "Supervisor",
  "Vendedor",
  "Atendimento",
  "Financeiro",
  "Marketing",
] as const;

export const resources: Resource[] = [
  { key: "clients.view", label: "Clientes · ver", allow: { "Super Admin": "T", Administrador: "T", Gerente: "T", Supervisor: "E", Vendedor: "P", Atendimento: "E", Financeiro: "T", Marketing: "E" } },
  { key: "clients.create", label: "Clientes · criar", allow: { "Super Admin": "T", Administrador: "T", Gerente: "T", Supervisor: "E", Vendedor: "P", Atendimento: "E", Financeiro: "—", Marketing: "E" } },
  { key: "clients.update", label: "Clientes · editar", allow: { "Super Admin": "T", Administrador: "T", Gerente: "T", Supervisor: "E", Vendedor: "P", Atendimento: "E", Financeiro: "—", Marketing: "—" } },
  { key: "clients.delete", label: "Clientes · excluir", allow: { "Super Admin": "T", Administrador: "T", Gerente: "—", Supervisor: "—", Vendedor: "—", Atendimento: "—", Financeiro: "—", Marketing: "—" } },
  { key: "leads.convert", label: "Leads · converter", allow: { "Super Admin": "T", Administrador: "T", Gerente: "T", Supervisor: "E", Vendedor: "P", Atendimento: "—", Financeiro: "—", Marketing: "T" } },
  { key: "opportunities.update", label: "Oportunidades · mover", allow: { "Super Admin": "T", Administrador: "T", Gerente: "T", Supervisor: "E", Vendedor: "P", Atendimento: "—", Financeiro: "—", Marketing: "—" } },
  { key: "quotes.approve_discount", label: "Propostas · aprovar desconto", allow: { "Super Admin": "T", Administrador: "T", Gerente: "T", Supervisor: "E", Vendedor: "—", Atendimento: "—", Financeiro: "—", Marketing: "—" } },
  { key: "sales.view", label: "Vendas · ver", allow: { "Super Admin": "T", Administrador: "T", Gerente: "T", Supervisor: "E", Vendedor: "P", Atendimento: "P", Financeiro: "T", Marketing: "—" } },
  { key: "products.cost_view", label: "Produtos · ver custo", allow: { "Super Admin": "T", Administrador: "T", Gerente: "T", Supervisor: "—", Vendedor: "—", Atendimento: "—", Financeiro: "T", Marketing: "—" } },
  { key: "finance.view", label: "Financeiro · ver", allow: { "Super Admin": "T", Administrador: "T", Gerente: "T", Supervisor: "—", Vendedor: "—", Atendimento: "—", Financeiro: "T", Marketing: "—" } },
  { key: "reports.view", label: "Relatórios · ver", allow: { "Super Admin": "T", Administrador: "T", Gerente: "T", Supervisor: "E", Vendedor: "P", Atendimento: "E", Financeiro: "T", Marketing: "E" } },
  { key: "export.full", label: "Exportação completa", allow: { "Super Admin": "T", Administrador: "T", Gerente: "T", Supervisor: "—", Vendedor: "—", Atendimento: "—", Financeiro: "T", Marketing: "—" } },
  { key: "users.manage", label: "Usuários · gerenciar", allow: { "Super Admin": "T", Administrador: "T", Gerente: "—", Supervisor: "—", Vendedor: "—", Atendimento: "—", Financeiro: "—", Marketing: "—" } },
  { key: "settings.manage", label: "Configurações · alterar", allow: { "Super Admin": "T", Administrador: "T", Gerente: "—", Supervisor: "—", Vendedor: "—", Atendimento: "—", Financeiro: "—", Marketing: "—" } },
  { key: "audit.view", label: "Auditoria · ver", allow: { "Super Admin": "T", Administrador: "T", Gerente: "—", Supervisor: "—", Vendedor: "—", Atendimento: "—", Financeiro: "—", Marketing: "—" } },
  { key: "privacy.manage", label: "LGPD · titular", allow: { "Super Admin": "T", Administrador: "T", Gerente: "—", Supervisor: "—", Vendedor: "—", Atendimento: "—", Financeiro: "—", Marketing: "—" } },
];

export interface Job {
  name: string;
  queue: string;
  trigger: string;
  retry: string;
  idem: string;
}

export const jobs: Job[] = [
  { name: "SendPasswordReset", queue: "mail", trigger: "POST /forgot-password", retry: "3 × backoff 1m/5m/15m", idem: "token de reset (uso único)" },
  { name: "SendQuoteEmail", queue: "mail", trigger: "POST /quotes/{uid}/send", retry: "5 × backoff exponencial", idem: "quote_uid + número da versão" },
  { name: "NotifyTaskDue", queue: "default", trigger: "cron a cada 15 min", retry: "2", idem: "task_uid + data (chave única diária)" },
  { name: "GenerateExport", queue: "export", trigger: "POST /reports/export", retry: "2", idem: "request_id do usuário" },
  { name: "ProcessWebhook", queue: "webhook", trigger: "POST /webhooks/{provider}", retry: "5 com dead letter", idem: "UNIQUE(provider, event_id)" },
  { name: "RebuildProductStats", queue: "default", trigger: "cron 5 min", retry: "1", idem: "janela do lote" },
  { name: "CleanSessions", queue: "default", trigger: "cron diário", retry: "—", idem: "por expiração" },
  { name: "PurgeAudit", queue: "maintenance", trigger: "cron mensal", retry: "—", idem: "registra o que foi purgado" },
  { name: "RunBackup", queue: "maintenance", trigger: "cron 03:00", retry: "2", idem: "data do dump" },
  { name: "VerifyBackup", queue: "maintenance", trigger: "cron 03:15", retry: "1", idem: "hash do arquivo" },
  { name: "AnonymizeSubject", queue: "privacy", trigger: "solicitação aprovada", retry: "2", idem: "data_request_uid" },
  { name: "CheckAlerts", queue: "monitoring", trigger: "cron 10 min", retry: "1", idem: "janela do alerta" },
];

export interface Alert {
  name: string;
  signal: string;
  threshold: string;
  channel: string;
}

export const alerts: Alert[] = [
  { name: "Erro 500 em sequência", signal: "canal error", threshold: "≥ 5 em 5 min", channel: "e-mail + notificação interna" },
  { name: "Tentativas de login falhas", signal: "login_failed", threshold: "≥ 10 em 10 min (mesmo e-mail ou IP)", channel: "e-mail ao admin" },
  { name: "Fila parada", signal: "jobs pendentes", threshold: "sem processamento há 15 min", channel: "e-mail + notificação" },
  { name: "Falha de SMTP", signal: "mail.failed", threshold: "≥ 3 em 15 min", channel: "e-mail + notificação" },
  { name: "Backup ausente", signal: "nenhum dump nas últimas 26h", threshold: "1 ocorrência", channel: "e-mail crítico" },
  { name: "Disco acima do limite", signal: "/health", threshold: "≥ 85%", channel: "e-mail" },
  { name: "Exportação atípica", signal: "export_data", threshold: "≥ 3 exportações completas em 1h", channel: "e-mail ao admin + auditoria" },
  { name: "Alteração de permissão", signal: "permission_changed", threshold: "toda ocorrência", channel: "notificação ao admin" },
  { name: "Webhook rejeitado", signal: "assinatura inválida", threshold: "≥ 5 em 10 min", channel: "e-mail" },
  { name: "Sessões anômalas", signal: "novo IP/dispositivo", threshold: "IP fora do padrão do usuário", channel: "e-mail ao próprio usuário" },
];

export const tokens: { name: string; value: string; use: string }[] = [
  { name: "--color-bg", value: "#0b0c0a", use: "fundo da aplicação" },
  { name: "--color-surface", value: "#141512", use: "cards, tabelas, painéis" },
  { name: "--color-text", value: "#efe8db", use: "texto principal" },
  { name: "--color-muted", value: "#8d897e", use: "rótulos, metadados" },
  { name: "--color-accent", value: "#c9a36a", use: "destaque, links, numeração" },
  { name: "--color-ok", value: "#c8f54a", use: "sucesso, aprovação" },
  { name: "--color-danger", value: "#ff6b5a", use: "erro, exclusão" },
  { name: "--color-info", value: "#8fd3ff", use: "informação, API" },
  { name: "--radius", value: "12px", use: "cantos de card e input" },
  { name: "--shadow", value: "0 10px 30px rgba(0,0,0,.35)", use: "modal e dropdown" },
  { name: "--space", value: "4 / 8 / 16 / 24 / 40", use: "escala de espaçamento" },
  { name: "--font-display", value: "Instrument Serif", use: "títulos" },
  { name: "--font-ui", value: "IBM Plex Sans", use: "interface" },
  { name: "--font-mono", value: "IBM Plex Mono", use: "código, IDs, tabelas técnicas" },
];

export const breakpoints = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];

export const a11y = [
  "Todo input com <label> associado (for/id)",
  "Foco visível em todos os elementos interativos (outline nunca removido sem substituto)",
  "Navegação completa por teclado, com ordem de tabulação lógica",
  "aria-live nas mensagens de erro e toasts",
  "Contraste mínimo 4.5:1 em texto, 3:1 em elementos grandes",
  "Erro de formulário associado ao campo (aria-describedby)",
  "Tabela com <caption> e <th scope>",
  "Nenhuma informação transmitida apenas por cor (sempre ícone ou texto)",
];

export const cssFiles = [
  { f: "variables.css", d: "tokens de cor, tipografia, espaço, raio e sombra" },
  { f: "layout.css", d: "shell, sidebar, topbar, grid, breadcrumbs" },
  { f: "components.css", d: "cards, badges, modais, dropdowns, toasts, paginação" },
  { f: "forms.css", d: "inputs, labels, estados de erro, loading, disabled" },
  { f: "tables.css", d: "tabela responsiva, cabeçalho fixo, densidade" },
  { f: "responsive.css", d: "breakpoints e adaptações de 320px a 1920px" },
];

export const jsFiles = [
  { f: "app.js", d: "bootstrap, delegação de eventos, navegação" },
  { f: "api.js", d: "fetch com CSRF, tratamento de erro e envelope JSON" },
  { f: "modal.js", d: "abrir/fechar, foco preso, ESC, backdrop" },
  { f: "toast.js", d: "fila de mensagens com aria-live" },
  { f: "forms.js", d: "validação de UX, loading, erros por campo" },
  { f: "clients.js / leads.js / sales.js / calendar.js / dashboard.js", d: "um módulo por domínio, carregado sob demanda" },
];

export const futureExtensions = [
  { t: "WhatsApp", d: "Fila de mensagens + template + consentimento; webhook do provedor entra no receiver já previsto.", gate: "Fase 21 (webhooks) + LGPD" },
  { t: "Telefonia / VoIP", d: "Registro de chamada como atividade; gravação vai para storage privado com retenção própria.", gate: "Fase 16 (arquivos)" },
  { t: "Automação de marketing", d: "Gatilhos por evento do CRM → fila → envio. Requer opt-in explícito por finalidade.", gate: "Fase 18 + 23" },
  { t: "IA (resumo, pontuação, próxima ação)", d: "Camada de serviço externa; nunca envia dado sem base legal e sem mascarar documento.", gate: "Fase 23 (LGPD) + Fase 21" },
  { t: "ERP e financeiro", d: "Integração por API com idempotência e conciliação; módulo financeiro opcional já isolado.", gate: "Fase 15 + 21" },
  { t: "Gateway de pagamento", d: "Nunca toca em cartão: provider, transaction_id, status, amount. Webhook assinado.", gate: "Fase 21" },
  { t: "Assinatura digital", d: "Proposta com hash do conteúdo + trilha de aceite (data, IP, UA).", gate: "Fase 14" },
  { t: "BI / data warehouse", d: "Exportação agendada por fila para o warehouse; leitura nunca contra o banco transacional.", gate: "Fase 19 + 29" },
  { t: "Aplicativo mobile", d: "Consome a mesma /api/v1 com token e escopo; nenhuma regra nova no backend.", gate: "Fase 20" },
  { t: "Multiempresa (tenant)", d: "Ligar o isolamento por company_id no Repository; já previsto desde a Fase 3.", gate: "Fase 3 + 6" },
];

export const financialRules = [
  "Todo lançamento nasce de um fato: venda, despesa, recebimento ou estorno — nunca de digitação avulsa sem origem.",
  "Lançamento é imutável: correção é feita por estorno + novo lançamento, nunca por UPDATE silencioso.",
  "Cada movimento registra: competência, caixa (se houver), centro de custo, responsável e origem (sale_uid, quote_uid).",
  "Vendedor não vê custo nem margem sem products.cost_view; financeiro não altera pipeline.",
  "Conciliação compara gateway × lançamento; divergência vira pendência, não ajuste automático.",
  "Relatório financeiro e relatório de vendas precisam bater: é o teste de integridade da Fase 15.",
];

export const i18nNotes = [
  "date_default_timezone_set('UTC') no bootstrap; conversão para America/Sao_Paulo apenas na camada de apresentação.",
  "Dados no banco em UTC (DATETIME(3)); filtros de período convertidos na entrada, nunca implicitamente.",
  "Camada de idioma com arquivo por locale (pt-BR primeiro), chaves estáveis; nenhum texto solto em View ou Service.",
  "Formatação com intl: moeda BRL, data curta, número decimal — nunca concatenação manual.",
  "Mensagens de erro e validação também traduzidas; código de erro técnico fica no log, não na tela.",
  "Preparado para en e es: estrutura de diretórios e chaves prontas desde a Fase 2.",
];
