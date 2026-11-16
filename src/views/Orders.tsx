import { addresses, customers, products } from "../data/seed";
import { brl, timeBr } from "../lib/format";
import { useStore } from "../state/Store";
import { Badge, Panel, Select, StatusDot } from "../ui/primitives";
import type { OrderStatus } from "../types";

const NEXT: Record<OrderStatus, OrderStatus | null> = {
  pendente: "pago",
  pago: "enviado",
  enviado: "entregue",
  entregue: null,
  cancelado: null,
};

export function Orders() {
  const { orders, setOrderStatus, query } = useStore();
  const rows = orders.filter((o) => {
    const u = customers.find((c) => c.id === o.userId);
    const q = query.toLowerCase();
    return !q || o.id.includes(q) || u?.name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 rise">
      <div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">FULFILLMENT</p>
        <h1 className="font-serif text-4xl mt-1">Pedidos</h1>
        <p className="text-sm text-[#8d897e] mt-2">pedido → pagamento_id → endereço_id → usuário_id. Status avança só com pagamento aprovado.</p>
      </div>
      <div className="space-y-3">
        {rows.map((o) => {
          const user = customers.find((c) => c.id === o.userId);
          const adr = addresses.find((a) => a.id === o.addressId);
          const next = NEXT[o.status];
          const tone = o.status === "cancelado" ? "red" : o.status === "entregue" || o.status === "pago" ? "lime" : "gold";
          return (
            <Panel key={o.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusDot status={o.status} />
                    <span className="font-mono text-xs">{o.id}</span>
                    <Badge tone={tone}>{o.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm">
                    {user?.name} · {adr?.city}/{adr?.state} · {adr?.cep}
                  </p>
                  <p className="text-[11px] text-[#8d897e] mt-1">
                    {timeBr(o.createdAt)} · taxa {o.feePct}% · {brl(o.total * (o.feePct / 100))} NEXO
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-2xl">{brl(o.total)}</p>
                  {next ? (
                    <Select
                      className="mt-2"
                      value={o.status}
                      onChange={(e) => setOrderStatus(o.id, e.target.value as OrderStatus)}
                    >
                      <option value={o.status}>{o.status}</option>
                      <option value={next}>{next}</option>
                      <option value="cancelado">cancelado</option>
                    </Select>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {o.items
                  .filter((it) => it.qty > 0)
                  .map((it) => {
                    const p = products.find((x) => x.id === it.productId);
                    return (
                      <span key={it.productId} className="flex items-center gap-2 rounded-full border border-white/8 pr-3 text-xs">
                        <img src={p?.image} alt="" className="w-7 h-7 rounded-full object-cover" />
                        {p?.name} × {it.qty}
                      </span>
                    );
                  })}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
