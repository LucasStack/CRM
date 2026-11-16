import { Check, Circle } from "lucide-react";
import { useMemo } from "react";
import { useCrm } from "../store";
import type { View } from "../store";
import { Btn, Panel } from "../ui";

export function OnboardingCard() {
  const { s, me, setView } = useCrm();
  const u = me()!;

  const steps = useMemo(() => {
    const hasClient = s.clients.some((c) => !c.deletedAt);
    const hasLead = s.leads.length > 0;
    const hasProduct = s.products.length > 0;
    const hasQuote = s.quotes.length > 0;
    const hasSale = s.sales.length > 0;
    const has2fa = u.twoFactor;
    return [
      { done: hasProduct, label: "Cadastre 2 produtos ou serviços", view: "catalog" as View },
      { done: hasClient, label: "Adicione seu primeiro cliente", view: "clients" as View },
      { done: hasLead, label: "Registre um lead qualificado", view: "leads" as View },
      { done: hasQuote, label: "Emita uma proposta e envie", view: "quotes" as View },
      { done: hasSale, label: "Feche a primeira venda", view: "sales" as View },
      { done: has2fa, label: "Ative 2FA na sua conta", view: "profile" as View },
    ];
  }, [s, u]);

  const done = steps.filter((x) => x.done).length;
  if (done === steps.length) return null;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#c9a36a] uppercase">Primeiros passos</p>
          <p className="font-serif text-xl mt-1">Deixe o CRM pronto para o dia a dia</p>
          <p className="text-[13px] text-[#8d897e] mt-1">
            {done} de {steps.length} concluídos · {pct}%
          </p>
        </div>
        <div className="w-32">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#c8f54a]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-2">
        {steps.map((st) => (
          <button
            key={st.label}
            onClick={() => setView(st.view)}
            className={`text-left rounded-xl border p-3 flex items-center gap-3 transition ${
              st.done ? "border-[#c8f54a]/25 bg-[#c8f54a]/6" : "border-white/8 hover:border-[#c9a36a]/40"
            }`}
          >
            {st.done ? <Check className="w-4 h-4 text-[#c8f54a]" /> : <Circle className="w-4 h-4 text-[#8d897e]" />}
            <span className={`text-[13.5px] ${st.done ? "line-through text-[#8d897e]" : "text-[#efe8db]"}`}>
              {st.label}
            </span>
          </button>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <Btn tone="ghost" onClick={() => setView("profile")}>Ir para o perfil</Btn>
        <Btn tone="ghost" onClick={() => setView("settings")}>Configurações</Btn>
      </div>
    </Panel>
  );
}
