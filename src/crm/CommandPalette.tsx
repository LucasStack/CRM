import { useEffect, useMemo, useRef, useState } from "react";
import { useCrm } from "./store";
import type { View } from "./store";

const NAV_ITEMS: { id: View; label: string; hint: string }[] = [
  { id: "dashboard", label: "Dashboard", hint: "Painel" },
  { id: "clients", label: "Clientes", hint: "CRM" },
  { id: "leads", label: "Leads", hint: "CRM" },
  { id: "pipeline", label: "Pipeline", hint: "CRM" },
  { id: "catalog", label: "Produtos e serviços", hint: "Comercial" },
  { id: "quotes", label: "Propostas", hint: "Comercial" },
  { id: "sales", label: "Vendas", hint: "Comercial" },
  { id: "finance", label: "Financeiro", hint: "Comercial" },
  { id: "tasks", label: "Tarefas e agenda", hint: "Operação" },
  { id: "files", label: "Documentos", hint: "Operação" },
  { id: "reports", label: "Relatórios", hint: "Dados" },
  { id: "users", label: "Usuários", hint: "Governança" },
  { id: "audit", label: "Auditoria", hint: "Governança" },
  { id: "lgpd", label: "LGPD", hint: "Governança" },
  { id: "settings", label: "Configurações", hint: "Governança" },
  { id: "profile", label: "Meu perfil", hint: "Conta" },
];

interface Row {
  key: string;
  label: string;
  hint: string;
  action: () => void;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setView, s } = useCrm();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const rows: Row[] = useMemo(() => {
    const nav: Row[] = NAV_ITEMS.map((n) => ({
      key: `nav-${n.id}`,
      label: n.label,
      hint: `Ir para · ${n.hint}`,
      action: () => setView(n.id),
    }));
    const clients: Row[] = s.clients
      .filter((c) => !c.deletedAt)
      .map((c) => ({
        key: `cli-${c.uid}`,
        label: c.name,
        hint: `Cliente · ${c.city}/${c.state}`,
        action: () => setView("clients"),
      }));
    const leads: Row[] = s.leads.map((l) => ({
      key: `lead-${l.uid}`,
      label: l.name,
      hint: `Lead · ${l.source}`,
      action: () => setView("leads"),
    }));
    const opps: Row[] = s.opportunities.map((o) => ({
      key: `opp-${o.uid}`,
      label: o.title,
      hint: "Oportunidade · Pipeline",
      action: () => setView("pipeline"),
    }));
    return [...nav, ...clients, ...leads, ...opps];
  }, [s.clients, s.leads, s.opportunities, setView]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows.slice(0, 40);
    return rows
      .filter((r) => r.label.toLowerCase().includes(t) || r.hint.toLowerCase().includes(t))
      .slice(0, 40);
  }, [q, rows]);

  useEffect(() => {
    setIdx(0);
  }, [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#141512] overflow-hidden shadow-2xl rise"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
          <span className="font-mono text-[10px] text-[#c9a36a] tracking-[0.16em]">CMD</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              if (e.key === "Enter") {
                const r = filtered[idx];
                if (r) { r.action(); onClose(); }
              }
              if (e.key === "Escape") onClose();
            }}
            placeholder="Buscar cliente, lead, oportunidade ou ir para…"
            className="flex-1 bg-transparent outline-none text-[15px] text-[#efe8db] placeholder:text-white/25"
          />
          <span className="font-mono text-[10px] text-[#8d897e]">ESC</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto nexo-scroll">
          {filtered.length === 0 && (
            <p className="p-6 text-[13px] text-[#8d897e] text-center">Nada encontrado para "{q}".</p>
          )}
          {filtered.map((r, i) => (
            <button
              key={r.key}
              onClick={() => { r.action(); onClose(); }}
              onMouseEnter={() => setIdx(i)}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between gap-3 transition ${
                i === idx ? "bg-[#c8f54a]/10 text-[#efe8db]" : "text-[#cfc9bc]"
              }`}
            >
              <span className="text-[13.5px] truncate">{r.label}</span>
              <span className="font-mono text-[10.5px] text-[#8d897e] truncate">{r.hint}</span>
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-white/8 flex gap-4 text-[10.5px] text-[#8d897e] font-mono">
          <span>↑↓ navegar</span>
          <span>↵ selecionar</span>
          <span>esc fechar</span>
          <span className="ml-auto">{filtered.length} resultados</span>
        </div>
      </div>
    </div>
  );
}
