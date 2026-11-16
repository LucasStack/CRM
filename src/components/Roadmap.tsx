import { useState } from "react";
import { phases, type PhaseSpec, type Track } from "../data/phases";

const TRACK_COLOR: Record<Track, string> = {
  Fundação: "text-[#c9a36a] border-[#c9a36a]/30 bg-[#c9a36a]/10",
  Núcleo: "text-[#c8f54a] border-[#c8f54a]/30 bg-[#c8f54a]/10",
  Comercial: "text-[#8fd3ff] border-[#8fd3ff]/30 bg-[#8fd3ff]/10",
  Plataforma: "text-[#e8d5a8] border-[#e8d5a8]/30 bg-[#e8d5a8]/10",
  Operação: "text-[#ffb38a] border-[#ffb38a]/30 bg-[#ffb38a]/10",
};

const TRACKS: Track[] = ["Fundação", "Núcleo", "Comercial", "Plataforma", "Operação"];

export function Roadmap() {
  const [track, setTrack] = useState<Track | "Todas">("Todas");
  const [open, setOpen] = useState<number | null>(3);
  const [tab, setTab] = useState<"spec" | "qa">("spec");

  const list = phases.filter((p) => track === "Todas" || p.track === track);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(["Todas", ...TRACKS] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTrack(t as Track | "Todas")}
            className={`rounded-full px-3.5 py-1.5 text-xs transition ${
              track === t ? "bg-[#c8f54a] text-[#0b0c0a]" : "border border-white/10 text-[#b7b3a8] hover:border-[#c9a36a]/40"
            }`}
          >
            {t}
            <span className="ml-1.5 opacity-60">
              {t === "Todas" ? phases.length : phases.filter((p) => p.track === t).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {list.map((p) => (
          <PhaseRow
            key={p.n}
            phase={p}
            open={open === p.n}
            tab={tab}
            onTab={setTab}
            onToggle={() => setOpen(open === p.n ? null : p.n)}
          />
        ))}
      </div>
    </div>
  );
}

function Field({ label, items, mono }: { label: string; items: string[]; mono?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase">{label}</p>
      <div className="mt-1.5 space-y-1.5">
        {items.map((it) => (
          <p key={it} className={`text-[13.5px] text-[#cfc9bc] leading-relaxed ${mono ? "font-mono text-[12px] text-[#c9a36a]" : ""}`}>
            {it}
          </p>
        ))}
      </div>
    </div>
  );
}

function PhaseRow({
  phase: p,
  open,
  tab,
  onTab,
  onToggle,
}: {
  phase: PhaseSpec;
  open: boolean;
  tab: "spec" | "qa";
  onTab: (t: "spec" | "qa") => void;
  onToggle: () => void;
}) {
  return (
    <div className={`rounded-xl border transition ${open ? "border-[#c9a36a]/40 bg-[#141512]" : "border-white/8 bg-[#0e0f0d]"}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-4 px-4 py-3 text-left">
        <span className="font-mono text-xs text-[#c9a36a] w-7 shrink-0">{String(p.n).padStart(2, "0")}</span>
        <span className="font-serif text-lg text-[#efe8db] flex-1">{p.name}</span>
        <span className={`hidden sm:inline-block text-[10px] font-mono rounded-full border px-2 py-0.5 ${TRACK_COLOR[p.track]}`}>
          {p.track}
        </span>
        <span className="text-[#8d897e] text-sm w-4 text-center">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-white/6">
          <div className="flex gap-1 px-4 pt-3">
            {(["spec", "qa"] as const).map((t) => (
              <button
                key={t}
                onClick={() => onTab(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-mono tracking-wide ${
                  tab === t ? "bg-[#c9a36a]/15 text-[#c9a36a]" : "text-[#8d897e] hover:text-[#efe8db]"
                }`}
              >
                {t === "spec" ? "ESPECIFICAÇÃO" : "TESTES · SAÍDA · FALHAS"}
              </button>
            ))}
          </div>

          {tab === "spec" ? (
            <div className="p-4 space-y-5">
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase">Objetivo</p>
                <p className="text-[15px] text-[#efe8db] mt-1.5 leading-relaxed">{p.objective}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Requisitos" items={p.requirements} />
                <Field label="Dependências" items={[p.deps]} />
                <div className="md:col-span-2">
                  <Field label="Arquitetura da fase" items={[p.architecture]} />
                </div>
                <Field label="Tabelas envolvidas" items={[p.tables]} mono />
                <Field label="Índices / constraints" items={[p.indexes]} mono />
                <Field label="Backend (controllers, models, services, validators, middleware)" items={p.backend} />
                <Field label="Frontend (telas, componentes, JS)" items={p.frontend} />
                <Field label="Rotas" items={p.routes} mono />
                <Field label="Permissões" items={p.permissions} mono />
                <div className="md:col-span-2">
                  <Field label="Segurança" items={p.security} />
                </div>
                <Field label="Tratamento de erros" items={p.errors} />
                <Field label="Logs e auditoria" items={[...p.logs.map((l) => "log: " + l), ...p.audit.map((a) => "audit: " + a)]} />
              </div>
              {p.code && (
                <div className="rounded-xl border border-[#c9a36a]/18 overflow-hidden">
                  <div className="px-4 py-2 bg-[#141512] border-b border-white/8">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-[#c9a36a] uppercase">código-chave · {p.code.lang}</span>
                  </div>
                  <pre className="p-4 overflow-x-auto nexo-scroll bg-[#0b0c0a] font-mono text-[12px] leading-[1.7] text-[#c9d1c0]">
{p.code.code.join("\n")}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 grid md:grid-cols-2 gap-5">
              <Field label="Testes necessários" items={p.tests} />
              <Field label="Critérios de aprovação" items={p.exit} />
              <div className="md:col-span-2">
                <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-2">
                  Possíveis falhas · como diagnosticar · como corrigir
                </p>
                <div className="space-y-2">
                  {p.failures.map((f) => (
                    <div key={f.f} className="rounded-xl border border-white/8 p-4 grid sm:grid-cols-3 gap-3">
                      <div>
                        <p className="font-mono text-[10px] text-[#ff8b7a]">FALHA</p>
                        <p className="text-[13.5px] text-[#efe8db] mt-1">{f.f}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-[#c9a36a]">DIAGNÓSTICO</p>
                        <p className="text-[13.5px] text-[#cfc9bc] mt-1">{f.d}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-[#c8f54a]">CORREÇÃO</p>
                        <p className="text-[13.5px] text-[#cfc9bc] mt-1">{f.c}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
