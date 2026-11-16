import { PLANS, sellers } from "../data/seed";
import { brl, compact, dateBr } from "../lib/format";
import { Panel, PlanChip, Stars } from "../ui/primitives";

export function Sellers() {
  return (
    <div className="space-y-6 rise">
      <div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">TENANTS</p>
        <h1 className="font-serif text-4xl mt-1">Vendedores</h1>
        <p className="text-sm text-[#8d897e] mt-2">Cada vendedor é um tenant. Row-level `seller_id` em produto, estoque, pedido e avaliação.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {sellers.map((s) => {
          const plan = PLANS[s.plan];
          return (
            <Panel key={s.id} className="overflow-hidden">
              <div className="h-28 overflow-hidden">
                <img src={s.avatar} alt="" className="w-full h-full object-cover object-top opacity-80" />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-3xl">{s.name}</h2>
                    <p className="text-sm text-[#8d897e]">{s.city} · desde {dateBr(s.since)}</p>
                  </div>
                  <PlanChip plan={s.plan} />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Stars value={s.rating} />
                  <p className="text-sm">{compact(s.sales)} vendas</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[#b7b3a8]">
                  <div className="rounded-xl border border-white/8 p-3">
                    Assinatura {brl(plan.price)}/mês
                  </div>
                  <div className="rounded-xl border border-white/8 p-3">Take-rate {plan.fee}%</div>
                </div>
                <p className="mt-3 font-mono text-[11px] text-[#8d897e]">{s.email}</p>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
