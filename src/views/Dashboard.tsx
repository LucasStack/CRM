import { products, revenue, sellers } from "../data/seed";
import { brl, compact } from "../lib/format";
import { useStore } from "../state/Store";
import { Kpi, Panel } from "../ui/primitives";

export function Dashboard() {
  const { orders, stock } = useStore();
  const gmv = orders.filter((o) => o.status !== "cancelado" && o.status !== "pendente").reduce((s, o) => s + o.total, 0);
  const fee = orders.filter((o) => o.status !== "cancelado").reduce((s, o) => s + o.total * (o.feePct / 100), 0);
  const sold = products.reduce((s, p) => s + p.sold, 0);
  const low = stock.filter((s) => s.quantity - s.reserved < 10).length;
  const top = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const max = Math.max(...revenue.map((r) => r.gmv));

  return (
    <div className="space-y-8 rise">
      <div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">VENDAS · MAR 2026</p>
        <h1 className="font-serif text-4xl md:text-5xl mt-1">Faturamento e ritmo</h1>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <Kpi label="GMV líquido (pedidos ativos)" value={brl(gmv)} hint="+12% vs. fevereiro" up />
        <Kpi label="Take-rate NEXO" value={brl(fee)} hint="média ponderada 2,4%" />
        <Kpi label="Unidades vendidas (catálogo)" value={compact(sold)} hint={`${products.length} SKUs vivos`} />
        <Kpi label="SKUs em ruptura próxima" value={String(low)} hint="alerta < 10 disponíveis" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2 p-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-[#8d897e]">GMV × NET · 12 MESES</p>
              <p className="font-serif text-2xl mt-1">Curva de receita</p>
            </div>
            <p className="text-xs text-[#8d897e]">cache Redis 60s</p>
          </div>
          <div className="flex items-end gap-2 h-48">
            {revenue.map((r) => (
              <div key={r.month} className="flex-1 flex flex-col justify-end items-center gap-1 h-full">
                <div className="w-full flex flex-col justify-end items-stretch gap-0.5 h-[85%]">
                  <div
                    className="w-full rounded-sm bg-[#c8f54a]/80"
                    style={{ height: `${(r.net / max) * 100}%` }}
                    title={`Net ${brl(r.net)}`}
                  />
                </div>
                <span className="font-mono text-[9px] text-[#8d897e]">{r.month}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-[11px] text-[#8d897e]">
            <span className="flex items-center gap-1.5"><i className="w-2 h-2 bg-[#c8f54a] inline-block rounded-sm" /> Net após taxa</span>
          </div>
        </Panel>

        <Panel className="p-6">
          <p className="font-mono text-[10px] tracking-[0.18em] text-[#8d897e]">PRODUTOS VENDIDOS</p>
          <p className="font-serif text-2xl mt-1 mb-4">Ranking</p>
          <ol className="space-y-3">
            {top.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-[#c9a36a] w-4">{i + 1}</span>
                <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{p.name}</p>
                  <p className="text-[11px] text-[#8d897e]">{p.sold} un. · {brl(p.price)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel className="p-6">
        <p className="font-mono text-[10px] tracking-[0.18em] text-[#8d897e]">VENDEDORES</p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sellers.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-white/8 p-3">
              <img src={s.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="text-sm">{s.name}</p>
                <p className="text-[11px] text-[#8d897e]">{s.city} · {compact(s.sales)} vendas</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
