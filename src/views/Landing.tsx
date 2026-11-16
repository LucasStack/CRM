import { ArrowRight, Lock, Server, Zap } from "lucide-react";
import { HERO_SERVER, HERO_WAREHOUSE } from "../data/seed";
import { useStore } from "../state/Store";
import { GhostBtn, PrimaryBtn } from "../ui/primitives";

const LAYERS = [
  { k: "01", t: "Edge", d: "CloudFront + WAF. Cache de catálogo, rate-limit e bot filter antes da API." },
  { k: "02", t: "App", d: "Monolito modular NestJS em ECS Fargate. Auto-scale por CPU e profundidade de fila." },
  { k: "03", t: "Sync", d: "PostgreSQL RDS Multi-AZ + PgBouncer. Redis para sessão, cache e idempotência." },
  { k: "04", t: "Async", d: "BullMQ/SQS: webhooks de pagamento, e-mail, recálculo de recomendações, backups." },
];

const DECISIONS = [
  {
    q: "Monolito ou microsserviços?",
    a: "Monolito modular. Bounded contexts (auth, catálogo, pedidos, pagamentos) no mesmo deploy. Extraímos workers primeiro, serviços só com dor real de escala.",
  },
  {
    q: "Infinite ou AWS?",
    a: "Infinite só para spike/MVP. Produção em AWS: custo proporcional, Multi-AZ, PITR, WAF, Secrets Manager. Escala sem reescrever o contrato da API.",
  },
  {
    q: "Node, Java ou C#?",
    a: "TypeScript + NestJS. I/O bound (API, webhooks, filas) é o perfil. Um único tipo no front e no back. Java/C# vencem em CPU-bound — não é o caso.",
  },
  {
    q: "Assinatura ou taxa?",
    a: "Os dois. SaaS cobra plano (acesso). Marketplace cobra take-rate no GMV. Starter 4,9% · Growth 2,9% · Scale 1,4%.",
  },
];

export function Landing() {
  const { setRoute } = useStore();
  return (
    <div className="min-h-screen bg-[#0b0c0a] text-[#efe8db]">
      <div className="pointer-events-none fixed inset-0 grid-fine opacity-40" />
      <div className="pointer-events-none fixed inset-0 noise opacity-[0.07]" />

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-3">
          <img src="/images/nexo-mark.png" alt="NEXO" className="w-9 h-9 rounded-lg object-cover border border-[#c9a36a]/30" />
          <span className="font-mono text-xs tracking-[0.28em]">NEXO</span>
        </div>
        <div className="flex items-center gap-3">
          <GhostBtn
            onClick={() => document.getElementById("stack")?.scrollIntoView({ behavior: "smooth" })}
            className="hidden sm:inline-flex"
          >
            Arquitetura
          </GhostBtn>
          <PrimaryBtn onClick={() => setRoute("login")}>
            Entrar no console <ArrowRight className="w-4 h-4" />
          </PrimaryBtn>
        </div>
      </nav>

      <header className="relative z-10 max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#c9a36a] uppercase">Marketplace OS · Brasil</p>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-[88px] leading-[0.95] mt-6 max-w-4xl">
          A estrutura certa.
          <span className="italic text-[#c9a36a]"> Desde o primeiro pedido.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-[#b7b3a8] leading-relaxed font-light">
          NEXO é um monolito modular para vendedores: JWT curto, estoque com lock, pagamentos tokenizados e filas para o que não pode travar a compra.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <PrimaryBtn onClick={() => setRoute("login")}>Abrir console demo</PrimaryBtn>
          <GhostBtn
            onClick={() => {
              document.getElementById("stack")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Ver stack
          </GhostBtn>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/8 pt-8">
          {[
            ["p95 API", "42 ms"],
            ["cache hit", "94%"],
            ["fila", "12 jobs"],
            ["uptime", "99.95%"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8d897e]">{k}</p>
              <p className="font-serif text-3xl mt-1">{v}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-4">
        <figure className="relative overflow-hidden rounded-3xl h-72 md:h-[420px] border border-white/8">
          <img src={HERO_WAREHOUSE} alt="Fulfillment" className="w-full h-full object-cover" />
          <figcaption className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#c8f54a]">FULFILLMENT</p>
            <p className="font-serif text-2xl mt-1">Estoque com reserva atômica</p>
          </figcaption>
        </figure>
        <figure className="relative overflow-hidden rounded-3xl h-72 md:h-[420px] border border-white/8">
          <img src={HERO_SERVER} alt="Datacenter" className="w-full h-full object-cover" />
          <figcaption className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#c9a36a]">CONTROL PLANE</p>
            <p className="font-serif text-2xl mt-1">RDS Multi-AZ · Redis · Secrets</p>
          </figcaption>
        </figure>
      </section>

      <section id="stack" className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#c9a36a]">DINÂMICA</p>
        <h2 className="font-serif text-4xl md:text-5xl mt-3 max-w-2xl">Velocidade no request. Segurança no contrato. Escala no worker.</h2>
        <div className="mt-12 grid md:grid-cols-2 gap-4">
          {LAYERS.map((l) => (
            <article key={l.k} className="rounded-2xl border border-[#c9a36a]/16 bg-[#141512] p-7 hover:border-[#c9a36a]/40 transition">
              <p className="font-mono text-[#c9a36a] text-xs">{l.k}</p>
              <h3 className="font-serif text-3xl mt-2">{l.t}</h3>
              <p className="text-[#b7b3a8] mt-3 leading-relaxed">{l.d}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {[
            { icon: Zap, t: "Cache-aside", d: "Catálogo, dashboard e ranking de recomendações no Redis. TTL 30s–5min. Invalidação por evento." },
            { icon: Lock, t: "Zero PAN", d: "Cartão nunca toca o disco. Mercado Pago / Stripe devolvem token. Webhook idempotente na fila." },
            { icon: Server, t: "Backup em 2 eixos", d: "RDS: snapshot + PITR. Objetos: S3 versionado. Servidor: AMI, mas o banco não depende dele." },
          ].map((c) => (
            <article key={c.t} className="rounded-2xl border border-white/8 p-6">
              <c.icon className="w-5 h-5 text-[#c8f54a]" />
              <h3 className="font-serif text-2xl mt-4">{c.t}</h3>
              <p className="text-sm text-[#b7b3a8] mt-2 leading-relaxed">{c.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#c9a36a]">DECISÕES TRAVADAS</p>
        <div className="mt-8 grid md:grid-cols-2 gap-px bg-white/8 rounded-3xl overflow-hidden border border-white/8">
          {DECISIONS.map((d) => (
            <article key={d.q} className="bg-[#0b0c0a] p-8">
              <h3 className="font-serif text-2xl">{d.q}</h3>
              <p className="text-[#b7b3a8] mt-3 leading-relaxed">{d.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="rounded-[28px] bg-[#efe8db] text-[#0b0c0a] p-8 md:p-14 grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-[#7a6238]">AUTH · PAGAMENTO · COBRANÇA</p>
            <h2 className="font-serif text-4xl md:text-5xl mt-3 leading-[1.05]">Access de 12 min. Pepper no cofre. Taxa no GMV.</h2>
            <ul className="mt-6 space-y-2 text-sm text-[#3a3a32]">
              <li>— JWT RS256 + refresh rotacionado em cookie httpOnly</li>
              <li>— Senha: normaliza → HMAC-pepper (Secrets Manager) → Argon2id</li>
              <li>— IDT (CPF): dígitos verificadores + hash HMAC; UI só mostra máscara</li>
              <li>— Planos R$ 49 / 149 / 490 + take-rate 4,9% → 1,4%</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-[#0b0c0a] text-[#efe8db] p-6 font-mono text-[11px] leading-relaxed border border-[#c9a36a]/20">
            <p className="text-[#c8f54a]">POST /v1/checkout</p>
            <p className="text-white/40 mt-3">1. WAF → JWT → tenant_id</p>
            <p className="text-white/40">2. SELECT … FOR UPDATE estoque</p>
            <p className="text-white/40">3. intent no Mercado Pago</p>
            <p className="text-white/40">4. enqueue webhook.payment</p>
            <p className="text-white/40">5. cache DEL product:{`{id}`}</p>
            <p className="text-[#c9a36a] mt-4">idempotency-key: ord_907</p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 pb-10 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-[#8d897e]">
        <span className="font-mono tracking-[0.2em]">NEXO · CONSOLE DEMO</span>
        <button className="text-[#c9a36a]" onClick={() => setRoute("login")}>
          iris.p@example.org — entrar
        </button>
      </footer>
    </div>
  );
}
