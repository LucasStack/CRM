import { ArrowRight, Boxes, FileCheck2, LineChart, Lock, ShieldCheck, Users2 } from "lucide-react";

interface Props {
  onOpenApp: () => void;
  onDoc: () => void;
}

const FEATURES = [
  { icon: Users2, t: "Clientes e leads", d: "PF/PJ com validação real de CPF/CNPJ, detecção de duplicidade e conversão de lead → cliente + oportunidade em uma única transação." },
  { icon: Boxes, t: "Funil configurável", d: "Kanban por estágio com probabilidade, histórico de cada movimentação e motivo de perda obrigatório." },
  { icon: FileCheck2, t: "Propostas e vendas", d: "Totais recalculados no servidor, desconto com limite e aprovação, venda atômica com lançamento financeiro e auditoria." },
  { icon: LineChart, t: "Relatórios com escopo", d: "Vendedor vê o próprio, supervisor a equipe, gerente a empresa. Exportação em CSV auditada." },
  { icon: ShieldCheck, t: "LGPD nativa", d: "Consentimento com base legal versionada, atendimento ao titular, anonimização preservando o fato econômico." },
  { icon: Lock, t: "Segurança séria", d: "RBAC granular, IDOR bloqueado no banco, upload por MIME real, sessão curta e trilha append-only." },
];

const NUMBERS = [
  ["+40", "tabelas modeladas"],
  ["30", "fases entregáveis"],
  ["6", "papéis com escopo próprio"],
  ["0", "dependências no runtime"],
];

const STEPS = [
  { t: "Configuração em 4 passos", d: "Empresa, admin, fuso/moeda e escolha entre dados de exemplo ou ambiente em branco. Menos de 2 minutos." },
  { t: "Convide sua equipe", d: "Papéis prontos (admin, gerente, supervisor, vendedor, financeiro). Alterar permissão gera auditoria imediata." },
  { t: "Importe ou comece", d: "CSV para clientes e leads, ou registre a primeira venda com produto/serviço, imprima a proposta e envie." },
  { t: "Monitore com trilha completa", d: "Cada ação relevante grava quem, quando, de onde e o que mudou — inclusive alteração de permissão e exportação." },
];

export function Landing({ onOpenApp, onDoc }: Props) {
  return (
    <div className="min-h-screen bg-[#0b0c0a] text-[#efe8db]">
      <div className="pointer-events-none fixed inset-0 grid-fine opacity-25" />
      <div className="pointer-events-none fixed inset-0 noise opacity-[0.06]" />

      <header className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#c8f54a] live-dot" />
          <span className="font-mono text-[11px] tracking-[0.28em]">CRM CORE</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onDoc} className="hidden sm:block text-[12px] font-mono text-[#8d897e] hover:text-[#c8f54a]">
            blueprint
          </button>
          <button
            onClick={onOpenApp}
            className="rounded-full bg-[#c8f54a] text-[#0b0c0a] px-4 py-2 text-[13px] font-medium hover:bg-[#d6ff6e] transition inline-flex items-center gap-2"
          >
            Abrir console <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-14 md:pt-24 pb-16 text-center">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#c9a36a] uppercase">
          CRM COMERCIAL · PHP NATIVO · MYSQL 8 · LGPD READY
        </p>
        <h1 className="font-serif text-[44px] md:text-[86px] leading-[0.98] mt-6">
          Vendas com controle.
          <br />
          <span className="italic text-[#c9a36a]">Dado com trilha.</span>
        </h1>
        <p className="mt-7 text-lg md:text-xl text-[#b7b3a8] max-w-2xl mx-auto leading-relaxed font-light">
          O CRM Core organiza sua operação comercial — leads, funil, propostas, vendas, financeiro — com segurança
          pensada desde o primeiro clique e auditoria em toda ação relevante.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <button
            onClick={onOpenApp}
            className="rounded-full bg-[#c8f54a] text-[#0b0c0a] px-6 py-3 text-sm font-medium hover:bg-[#d6ff6e] transition inline-flex items-center gap-2"
          >
            Começar agora <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-full border border-white/12 px-6 py-3 text-sm text-[#efe8db] hover:border-[#c9a36a]/50 hover:text-[#c9a36a] transition"
          >
            Ver funcionalidades
          </button>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/8 pt-8">
          {NUMBERS.map(([v, l]) => (
            <div key={l}>
              <p className="font-serif text-4xl md:text-5xl text-[#c9a36a]">{v}</p>
              <p className="font-mono text-[10px] tracking-[0.18em] text-[#8d897e] uppercase mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <p className="font-mono text-[11px] tracking-[0.28em] text-[#c9a36a] uppercase mb-3">O que vem pronto</p>
        <h2 className="font-serif text-3xl md:text-5xl max-w-2xl leading-tight">
          Tudo que uma equipe comercial precisa — e nada além do que ela merece.
        </h2>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <article key={f.t} className="rounded-2xl border border-white/8 bg-[#141512] p-6 hover:border-[#c9a36a]/40 transition">
              <div className="w-10 h-10 rounded-xl border border-[#c9a36a]/30 bg-[#c9a36a]/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-[#c9a36a]" />
              </div>
              <h3 className="font-serif text-2xl mt-4">{f.t}</h3>
              <p className="text-sm text-[#b7b3a8] mt-2 leading-relaxed">{f.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-[28px] bg-[#efe8db] text-[#0b0c0a] p-8 md:p-14 grid md:grid-cols-[1fr_1.2fr] gap-10">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-[#7a6238]">COMO COMEÇA</p>
            <h2 className="font-serif text-4xl md:text-5xl mt-3 leading-[1.05]">Do zero ao primeiro pedido em minutos.</h2>
            <p className="mt-5 text-[15px] text-[#3a3a32] leading-relaxed">
              A instalação guiada cria a empresa, o super administrador e as configurações. Depois, é só usar.
            </p>
            <button
              onClick={onOpenApp}
              className="mt-8 rounded-full bg-[#0b0c0a] text-[#efe8db] px-6 py-3 text-sm font-medium hover:bg-[#1c1e19] transition inline-flex items-center gap-2"
            >
              Iniciar instalação <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.t} className="rounded-2xl bg-[#0b0c0a] text-[#efe8db] p-5 flex gap-4">
                <span className="font-serif text-3xl text-[#c9a36a] w-10 shrink-0">0{i + 1}</span>
                <div>
                  <p className="font-serif text-xl">{s.t}</p>
                  <p className="text-[13.5px] text-[#b7b3a8] mt-1 leading-relaxed">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-[#c9a36a] uppercase">Para quem manda</p>
            <h2 className="font-serif text-3xl md:text-5xl mt-3 leading-tight">
              Gerência com <span className="italic text-[#c9a36a]">visão real</span>, vendedor com <span className="italic text-[#c9a36a]">foco no seu</span>.
            </h2>
            <p className="mt-5 text-[15px] text-[#b7b3a8] leading-relaxed max-w-lg">
              Cada papel vê exatamente o que precisa: escopo próprio, escopo de equipe ou tudo da empresa.
              Nada de esconder botão — o filtro é aplicado no servidor, na consulta.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#141512] p-6">
            <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase">Trecho da política de acesso</p>
            <pre className="mt-4 text-[11.5px] leading-[1.75] text-[#c9d1c0] font-mono overflow-x-auto nexo-scroll">
{`if (!$u->has('clients.update')) return false;
return match ($u->scope()) {
    'all'     => true,
    'team'    => $u->teamIdsContain($c->owner_id),
    'own'     => $c->owner_id === $u->id,
    default   => false,
};`}
            </pre>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/8 px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between text-[12px] text-[#8d897e]">
          <span className="font-mono tracking-[0.22em]">CRM CORE © 2026</span>
          <div className="flex gap-6">
            <button onClick={onDoc} className="hover:text-[#c8f54a]">Blueprint arquitetural</button>
            <button onClick={onOpenApp} className="hover:text-[#c8f54a]">Abrir console</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
