import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/8 bg-[#141512] ${className}`}>{children}</div>;
}

export function Btn({
  children,
  onClick,
  type = "button",
  disabled,
  tone = "lime",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  tone?: "lime" | "ghost" | "danger";
  className?: string;
}) {
  const tones = {
    lime: "bg-[#c8f54a] text-[#0b0c0a] hover:bg-[#d6ff6e]",
    ghost: "border border-white/12 text-[#efe8db] hover:border-[#c9a36a]/50 hover:text-[#c9a36a]",
    danger: "bg-[#ff6b5a] text-[#0b0c0a] hover:bg-[#ff8b7a]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition disabled:opacity-40 ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8d897e]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full bg-[#0b0c0a] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#efe8db] outline-none focus:border-[#c9a36a]/50 placeholder:text-white/25";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Badge({ children, tone = "fog" }: { children: ReactNode; tone?: "fog" | "lime" | "gold" | "red" | "blue" }) {
  const map = {
    fog: "text-[#b7b3a8] bg-white/5 border-white/10",
    lime: "text-[#c8f54a] bg-[#c8f54a]/10 border-[#c8f54a]/20",
    gold: "text-[#c9a36a] bg-[#c9a36a]/12 border-[#c9a36a]/25",
    red: "text-[#ff8b7a] bg-[#ff6b5a]/10 border-[#ff6b5a]/20",
    blue: "text-[#8fd3ff] bg-[#8fd3ff]/10 border-[#8fd3ff]/20",
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-mono ${map[tone]}`}>{children}</span>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Panel className="p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8d897e]">{label}</p>
      <p className="font-serif text-3xl mt-1.5">{value}</p>
      {hint && <p className="text-[12px] text-[#8d897e] mt-1.5">{hint}</p>}
    </Panel>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto nexo-scroll">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-[#0e0f0d]">
            {head.map((h) => (
              <th key={h} className="text-left px-4 py-3 font-mono text-[10px] tracking-[0.14em] uppercase text-[#c9a36a] whitespace-nowrap border-b border-white/8">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <tr onClick={onClick} className={`border-b border-white/5 ${onClick ? "cursor-pointer hover:bg-white/[0.03]" : ""}`}>{children}</tr>;
}

export function Td({ children, mono, muted, className = "" }: { children: ReactNode; mono?: boolean; muted?: boolean; className?: string }) {
  return (
    <td className={`px-4 py-3 align-middle ${mono ? "font-mono text-[11.5px]" : ""} ${muted ? "text-[#8d897e]" : "text-[#efe8db]"} ${className}`}>
      {children}
    </td>
  );
}

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[88vh] overflow-y-auto nexo-scroll rounded-2xl border border-white/10 bg-[#141512] p-6 rise`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <h3 className="font-serif text-2xl">{title}</h3>
          <button onClick={onClose} className="text-[#8d897e] hover:text-[#efe8db]">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Confirmação destrutiva: exige digitar a palavra indicada (UX de confirmação do briefing). */
export function Confirm({
  word,
  label,
  consequence,
  onConfirm,
  onCancel,
}: {
  word: string;
  label: string;
  consequence: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  return (
    <Modal title={label} onClose={onCancel}>
      <p className="text-[14px] text-[#cfc9bc] leading-relaxed">{consequence}</p>
      <p className="text-[13px] text-[#8d897e] mt-3">
        Digite <span className="font-mono text-[#ff8b7a]">{word}</span> para confirmar.
      </p>
      <Input className="mt-2" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={word} />
      <div className="flex gap-2 mt-5">
        <Btn tone="danger" disabled={typed !== word} onClick={onConfirm}>
          Confirmar
        </Btn>
        <Btn tone="ghost" onClick={onCancel}>
          Cancelar
        </Btn>
      </div>
    </Modal>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="px-4 py-8 text-center text-[13px] text-[#8d897e]">{text}</p>;
}

export function PageTitle({ kicker, title, desc }: { kicker: string; title: string; desc?: string }) {
  return (
    <div className="mb-6">
      <p className="font-mono text-[10px] tracking-[0.22em] text-[#c9a36a] uppercase">{kicker}</p>
      <h1 className="font-serif text-3xl md:text-4xl mt-1.5">{title}</h1>
      {desc && <p className="text-[14px] text-[#8d897e] mt-2 leading-relaxed max-w-2xl">{desc}</p>}
    </div>
  );
}

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const dateBr = (iso: string) =>
  new Date(iso.length > 10 ? iso : iso + "T00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
export const timeBr = (iso: string) =>
  new Date(iso.length > 10 ? iso : iso + "T00:00").toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
