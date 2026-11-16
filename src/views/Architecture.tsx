import { useState } from "react";
import { Panel } from "../ui/primitives";

const NODES = [
  {
    id: "edge",
    title: "Edge",
    items: ["CloudFront (catálogo, imagens, SPA)", "WAF — rate limit, bot, geo", "TLS 1.3 only"],
  },
  {
    id: "app",
    title: "Compute",
    items: ["ECS Fargate · NestJS modular", "Autoscale CPU + profundidade de fila", "Health: /ready lê Redis+RDS"],
  },
  {
    id: "data",
    title: "Data",
    items: ["RDS Postgres Multi-AZ + PITR 35d", "PgBouncer pool", "Read replica para dashboard"],
  },
  {
    id: "hot",
    title: "Hot path",
    items: ["ElastiCache Redis", "sessão / cache-aside / rate-limit", "idempotency keys 24h"],
  },
  {
    id: "async",
    title: "Filas",
    items: ["BullMQ sobre Redis (ou SQS)", "payment.webhook", "mail, recs, stock.rebuild"],
  },
  {
    id: "backup",
    title: "Backup",
    items: ["AWS Backup: RDS + S3", "S3 versioning + Object Lock", "AMI semanal — DB nunca só no disco da VM"],
  },
];

const MODULES = [
  "AuthModule",
  "CatalogModule",
  "InventoryModule",
  "OrdersModule",
  "PaymentsModule",
  "ReviewsModule",
  "RecsModule",
  "BillingModule",
  "NotifyModule",
  "AuditModule",
];

export function Architecture() {
  const [open, setOpen] = useState("app");
  const node = NODES.find((n) => n.id === open)!;

  return (
    <div className="space-y-8 rise">
      <div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">BLUEPRINT</p>
        <h1 className="font-serif text-4xl mt-1">Monolito modular, pronto para partir</h1>
        <p className="text-sm text-[#8d897e] mt-2 max-w-2xl">
          Um processo, muitos bounded contexts. Workers compartilham o código e escalam em serviço separado quando a fila cresce. Microserviços só depois do produto doer.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        <Panel className="p-6">
          <svg viewBox="0 0 720 340" className="w-full h-auto">
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#c9a36a" />
                <stop offset="1" stopColor="#c8f54a" />
              </linearGradient>
            </defs>
            <line x1="80" y1="50" x2="640" y2="50" className="flow-line" stroke="url(#g)" strokeWidth="1.2" fill="none" />
            <line x1="360" y1="90" x2="360" y2="150" stroke="#c9a36a" strokeWidth="1" opacity="0.5" />
            <line x1="160" y1="190" x2="560" y2="190" stroke="#c9a36a" strokeWidth="1" opacity="0.25" />
            {[
              [80, 20, "CDN"],
              [300, 20, "WAF / ALB"],
              [560, 20, "TLS"],
              [250, 150, "NestJS API"],
              [430, 150, "Workers"],
              [80, 250, "RDS"],
              [240, 250, "Redis"],
              [400, 250, "S3"],
              [560, 250, "Secrets"],
            ].map(([x, y, label]) => {
              const id = String(label).toLowerCase();
              const active =
                (open === "edge" && ["cdn", "waf / alb", "tls"].includes(id)) ||
                (open === "app" && ["nestjs api", "workers"].includes(id)) ||
                (open === "data" && id === "rds") ||
                (open === "hot" && id === "redis") ||
                (open === "async" && id === "workers") ||
                (open === "backup" && ["rds", "s3"].includes(id));
              return (
                <g key={String(label)} transform={`translate(${x},${y})`}>
                  <rect
                    width="140"
                    height="44"
                    rx="10"
                    fill={active ? "#c8f54a" : "#141512"}
                    stroke={active ? "#c8f54a" : "#c9a36a55"}
                  />
                  <text
                    x="70"
                    y="27"
                    textAnchor="middle"
                    fontSize="12"
                    fontFamily="IBM Plex Mono"
                    fill={active ? "#0b0c0a" : "#efe8db"}
                  >
                    {label as string}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="flex flex-wrap gap-2 mt-4">
            {NODES.map((n) => (
              <button
                key={n.id}
                onClick={() => setOpen(n.id)}
                className={`rounded-full px-3 py-1.5 text-xs ${open === n.id ? "bg-[#c8f54a] text-[#0b0c0a]" : "border border-white/10"}`}
              >
                {n.title}
              </button>
            ))}
          </div>
        </Panel>
        <Panel className="p-5">
          <p className="font-mono text-[10px] text-[#c9a36a]">{node.title.toUpperCase()}</p>
          <ul className="mt-3 space-y-2 text-sm text-[#cfc9bc]">
            {node.items.map((i) => (
              <li key={i}>— {i}</li>
            ))}
          </ul>
        </Panel>
      </div>

      <div>
        <p className="font-mono text-[10px] text-[#8d897e] mb-3">MÓDULOS DO MONOLITO</p>
        <div className="flex flex-wrap gap-2">
          {MODULES.map((m) => (
            <span key={m} className="font-mono text-xs rounded-lg border border-white/10 px-3 py-1.5 text-[#c9a36a]">
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-sm">
        <Panel className="p-5">
          <p className="font-serif text-2xl">Por que Node</p>
          <p className="text-[#b7b3a8] mt-2 leading-relaxed">
            Carga é I/O: HTTP, Redis, webhooks. TypeScript único com o console. Java/C# entram se aparecer batch pesado — não agora.
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="font-serif text-2xl">Por que AWS</p>
          <p className="text-[#b7b3a8] mt-2 leading-relaxed">
            Infinite é teto. AWS é curva: Fargate cresce com o checkout, RDS com o catálogo. Custo segue o tamanho, não o contrário.
          </p>
        </Panel>
        <Panel className="p-5">
          <p className="font-serif text-2xl">Filas, sim</p>
          <p className="text-[#b7b3a8] mt-2 leading-relaxed">
            Checkout responde em dezenas de ms. E-mail, recs e conciliação de pagamento acontecem depois, com retry e dead-letter.
          </p>
        </Panel>
      </div>
    </div>
  );
}
