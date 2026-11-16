import { useEffect, useState, type ReactNode } from "react";
import { Blocks } from "../components/Blocks";
import { ApiExplorer } from "../components/ApiExplorer";
import { DesignSystem } from "../components/DesignSystem";
import { FinancialRules, Future, I18nNotes } from "../components/Future";
import { AlertsTable, JobsTable } from "../components/JobsAlerts";
import { Roadmap } from "../components/Roadmap";
import { TestMatrix } from "../components/TestMatrix";
import { sections } from "../data/blueprint";

const GROUPS: { label: string; ids: string[] }[] = [
  { label: "Fundamentos", ids: ["overview", "architecture", "modules", "flow", "ux"] },
  { label: "Segurança", ids: ["security", "auth", "authz", "logs", "audit"] },
  { label: "Dados", ids: ["database", "er", "directories", "tenancy", "jobs", "finance", "api"] },
  { label: "Operação", ids: ["lgpd", "backup", "obs", "deploy", "i18n", "deps"] },
  { label: "Qualidade", ids: ["risks", "quality", "qa"] },
  { label: "Execução", ids: ["roadmap", "phase1", "future"] },
];

const byId = Object.fromEntries(sections.map((s) => [s.id, s]));

const EXTRA: Record<string, ReactNode> = {
  ux: <DesignSystem />,
  jobs: <JobsTable />,
  finance: <FinancialRules />,
  api: <ApiExplorer />,
  obs: <AlertsTable />,
  i18n: <I18nNotes />,
  qa: <TestMatrix />,
  roadmap: <Roadmap />,
  future: <Future />,
};

export function BlueprintDoc({ onBack }: { onBack: () => void }) {
  const [active, setActive] = useState(sections[0].id);
  const [nav, setNav] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const probe = window.scrollY + window.innerHeight * 0.28;
      let current = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= probe) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 24, behavior: "smooth" });
    setNav(false);
  };

  const idx = sections.findIndex((s) => s.id === active);
  const progress = ((idx + 1) / sections.length) * 100;

  return (
    <div className="min-h-screen bg-[#0b0c0a] text-[#efe8db]">
      <div className="pointer-events-none fixed inset-0 grid-fine opacity-30" />
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-white/5 z-50">
        <div className="h-full bg-[#c8f54a] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <header className="fixed top-0.5 left-0 right-0 z-40 bg-[#0b0c0a]/85 backdrop-blur border-b border-white/8">
        <div className="max-w-[1400px] mx-auto px-5 h-14 flex items-center gap-4">
          <button onClick={() => setNav(!nav)} className="lg:hidden text-xs font-mono text-[#c9a36a] border border-white/10 rounded-lg px-2.5 py-1.5">
            ÍNDICE
          </button>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#c8f54a] live-dot" />
            <span className="font-mono text-[11px] tracking-[0.26em]">CRM CORE</span>
          </div>
          <span className="hidden sm:block text-[11px] text-[#8d897e] font-mono">/ blueprint arquitetural</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden md:block text-[11px] text-[#8d897e] font-mono">
              {String(idx + 1).padStart(2, "0")} / {sections.length}
            </span>
            <button
              onClick={onBack}
              className="rounded-full bg-[#c8f54a] text-[#0b0c0a] text-[10px] font-mono px-3 py-1.5"
            >
              VOLTAR AO CONSOLE
            </button>
          </div>
        </div>
      </header>

      {nav && (
        <div className="fixed inset-0 z-30 bg-[#0b0c0a] pt-16 px-5 overflow-y-auto lg:hidden">
          {GROUPS.map((g) => (
            <div key={g.label} className="mb-6">
              <p className="font-mono text-[10px] tracking-[0.18em] text-[#8d897e] mb-2">{g.label.toUpperCase()}</p>
              {g.ids.map((id) => (
                <button key={id} onClick={() => go(id)} className="block w-full text-left py-2 text-sm text-[#cfc9bc]">
                  <span className="font-mono text-[#c9a36a] mr-2">{byId[id].num}</span>
                  {byId[id].title}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      <aside className="hidden lg:block fixed left-0 top-14 bottom-0 w-[264px] overflow-y-auto nexo-scroll border-r border-white/8 px-4 py-6 z-20">
        {GROUPS.map((g) => (
          <div key={g.label} className="mb-6">
            <p className="font-mono text-[10px] tracking-[0.18em] text-[#8d897e] mb-2 px-2">{g.label.toUpperCase()}</p>
            <div className="space-y-0.5">
              {g.ids.map((id) => {
                const s = byId[id];
                const on = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    className={`w-full text-left rounded-lg px-2 py-1.5 flex gap-2.5 items-start transition ${
                      on ? "bg-[#c8f54a]/10 text-[#c8f54a]" : "text-[#a9a49a] hover:bg-white/5 hover:text-[#efe8db]"
                    }`}
                  >
                    <span className="font-mono text-[10px] mt-0.5 opacity-70">{s.num}</span>
                    <span className="text-[13px] leading-snug">{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </aside>

      <main className="lg:pl-[264px] pt-14">
        <section className="border-b border-white/8">
          <div className="max-w-3xl mx-auto px-5 py-16 md:py-24">
            <p className="font-mono text-[11px] tracking-[0.28em] text-[#c9a36a]">
              PHP 8.3 NATIVO · MYSQL 8 / INNODB · PDO · MVC MANUAL
            </p>
            <h1 className="font-serif text-[44px] md:text-[76px] leading-[0.98] mt-6">
              Arquitetura de um CRM
              <span className="italic text-[#c9a36a]"> profissional</span>
            </h1>
            <p className="mt-7 text-lg text-[#b7b3a8] leading-relaxed font-light max-w-2xl">
              Vinte e nove seções antes da primeira linha de código: camadas, módulos, interface, segurança, banco,
              filas, financeiro, API, LGPD, observabilidade e um roadmap de 30 fases detalhado em 28 itens cada.
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
              <button
                onClick={() => go("roadmap")}
                className="rounded-full bg-[#c8f54a] text-[#0b0c0a] px-6 py-3 text-sm font-medium hover:bg-[#d6ff6e] transition"
              >
                Ver roadmap
              </button>
              <button
                onClick={() => go("phase1")}
                className="rounded-full border border-white/12 px-6 py-3 text-sm text-[#efe8db] hover:border-[#c9a36a]/50 hover:text-[#c9a36a] transition"
              >
                Ir para a Fase 1
              </button>
            </div>
          </div>
        </section>

        {sections.map((s) => (
          <section key={s.id} id={s.id} className="border-b border-white/6">
            <div className="max-w-3xl mx-auto px-5 py-14 md:py-20">
              <div className="flex items-baseline gap-4 mb-5">
                <span className="font-mono text-[#c9a36a] text-xs">{s.num}</span>
                <span className="font-mono text-[10px] tracking-[0.22em] text-[#8d897e] uppercase">{s.kicker}</span>
              </div>
              <h2 className="font-serif text-3xl md:text-[42px] leading-tight">{s.title}</h2>
              <p className="mt-4 text-[17px] text-[#b7b3a8] leading-relaxed font-light">{s.lead}</p>
              <div className="mt-9">
                <Blocks blocks={s.blocks} />
                {EXTRA[s.id] && (
                  <div className="mt-9 p-5 md:p-7 rounded-2xl border border-[#c9a36a]/16 bg-[#0e0f0d]">
                    {EXTRA[s.id]}
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
