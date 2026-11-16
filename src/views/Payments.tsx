import { payments as seedPay } from "../data/seed";
import { brl } from "../lib/format";
import { useStore } from "../state/Store";
import { Badge, Panel, StatusDot } from "../ui/primitives";
import type { PayStatus } from "../types";

function tone(s: PayStatus) {
  if (s === "aprovado") return "lime" as const;
  if (s === "pendente") return "gold" as const;
  return "red" as const;
}

export function Payments() {
  const { query } = useStore();
  const rows = seedPay.filter((p) => !query || p.id.includes(query.toLowerCase()) || p.orderId.includes(query.toLowerCase()));
  const approved = rows.filter((p) => p.status === "aprovado").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 rise">
      <div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">LEDGER</p>
        <h1 className="font-serif text-4xl mt-1">Pagamentos</h1>
        <p className="text-sm text-[#8d897e] mt-2 max-w-2xl">
          Mercado Pago (Pix, cartão, boleto) + Stripe como failover internacional. PAN nunca persiste — só <span className="text-[#c9a36a]">tokenRef</span>. Webhooks entram na fila com idempotency-key.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <Panel className="p-5">
          <p className="font-mono text-[10px] text-[#8d897e]">APROVADO NESTA LISTA</p>
          <p className="font-serif text-3xl mt-1">{brl(approved)}</p>
        </Panel>
        <Panel className="p-5">
          <p className="font-mono text-[10px] text-[#8d897e]">GATEWAYS</p>
          <p className="font-serif text-3xl mt-1">MP · Stripe</p>
        </Panel>
        <Panel className="p-5">
          <p className="font-mono text-[10px] text-[#8d897e]">PCI</p>
          <p className="font-serif text-3xl mt-1">token only</p>
        </Panel>
      </div>
      <Panel className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left font-mono text-[10px] tracking-[0.14em] text-[#8d897e] border-b border-white/8">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Meio</th>
              <th className="px-4 py-3 font-medium">Gateway</th>
              <th className="px-4 py-3 font-medium">Token</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Valor</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.orderId}</td>
                <td className="px-4 py-3 uppercase text-xs">{p.method}</td>
                <td className="px-4 py-3">{p.gateway}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-[#c9a36a]">{p.tokenRef}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <StatusDot status={p.status} />
                    <Badge tone={tone(p.status)}>{p.status}</Badge>
                  </span>
                </td>
                <td className="px-4 py-3">{brl(p.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
