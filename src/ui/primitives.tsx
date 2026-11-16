import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { PLANS } from "../data/seed";
import type { OrderStatus, PayStatus, Plan } from "../types";

export function Badge({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "lime" | "fog" | "red" | "paper";
}) {
  const map = {
    gold: "text-[#c9a36a] bg-[#c9a36a]/12 border-[#c9a36a]/25",
    lime: "text-[#c8f54a] bg-[#c8f54a]/10 border-[#c8f54a]/20",
    fog: "text-[#b7b3a8] bg-white/5 border-white/10",
    red: "text-[#ff8b7a] bg-[#ff6b5a]/10 border-[#ff6b5a]/20",
    paper: "text-[#0b0c0a] bg-[#efe8db] border-transparent",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] tracking-wide uppercase font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: OrderStatus | PayStatus }) {
  const color: Record<string, string> = {
    pago: "bg-[#c8f54a]",
    aprovado: "bg-[#c8f54a]",
    entregue: "bg-[#c8f54a]",
    enviado: "bg-[#c9a36a]",
    pendente: "bg-[#e8d5a8]",
    cancelado: "bg-[#ff6b5a]",
    recusado: "bg-[#ff6b5a]",
    estornado: "bg-[#8d897e]",
  };
  return <span className={`w-1.5 h-1.5 rounded-full ${color[status] ?? "bg-white/40"}`} />;
}

export function PlanChip({ plan }: { plan: Plan }) {
  const p = PLANS[plan];
  return (
    <Badge tone={plan === "scale" ? "lime" : plan === "growth" ? "gold" : "fog"}>
      {p.label} · {p.fee}%
    </Badge>
  );
}

export function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="font-mono text-[11px] text-[#c9a36a] tracking-widest">
      {"★".repeat(full)}
      <span className="text-white/20">{"★".repeat(5 - full)}</span>
      <span className="ml-1.5 text-[#efe8db]/70 tracking-normal">{value.toFixed(1)}</span>
    </span>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-[rgba(201,163,106,0.16)] bg-[#141512]/80 ${className}`}>
      {children}
    </div>
  );
}

export function Kpi({
  label,
  value,
  hint,
  up,
}: {
  label: string;
  value: string;
  hint?: string;
  up?: boolean;
}) {
  return (
    <Panel className="p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8d897e]">{label}</p>
      <p className="font-serif text-3xl mt-2 text-[#efe8db]">{value}</p>
      {hint && (
        <p className={`text-xs mt-2 ${up ? "text-[#c8f54a]" : "text-[#8d897e]"}`}>{hint}</p>
      )}
    </Panel>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8d897e]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-[#0b0c0a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#efe8db] outline-none focus:border-[#c9a36a]/50 placeholder:text-white/25 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`bg-[#0b0c0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#efe8db] outline-none focus:border-[#c9a36a]/50 ${props.className ?? ""}`}
    />
  );
}

export function PrimaryBtn({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[#c8f54a] text-[#0b0c0a] px-5 py-2.5 text-sm font-medium hover:bg-[#d6ff6e] disabled:opacity-40 transition ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostBtn({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/12 px-5 py-2.5 text-sm text-[#efe8db] hover:border-[#c9a36a]/50 hover:text-[#c9a36a] transition ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}
