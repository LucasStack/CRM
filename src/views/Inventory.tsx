import { products, sellers } from "../data/seed";
import { useStore } from "../state/Store";
import { Badge, Panel } from "../ui/primitives";

export function Inventory() {
  const { stock, adjustStock, query } = useStore();
  const rows = stock.filter((s) => {
    const p = products.find((x) => x.id === s.productId);
    const q = query.toLowerCase();
    return !q || p?.name.toLowerCase().includes(q) || p?.sku.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 rise">
      <div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">INVENTÁRIO</p>
        <h1 className="font-serif text-4xl mt-1">Estoque por SKU e vendedor</h1>
        <p className="text-[#8d897e] mt-2 max-w-2xl text-sm">
          Reserva atômica no checkout (`SELECT … FOR UPDATE`). Disponível = quantidade − reservado. Ajuste gera evento e invalida cache.
        </p>
      </div>

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left font-mono text-[10px] tracking-[0.14em] text-[#8d897e] border-b border-white/8">
              <tr>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Vendedor</th>
                <th className="px-4 py-3 font-medium">CD</th>
                <th className="px-4 py-3 font-medium">Qtd</th>
                <th className="px-4 py-3 font-medium">Res.</th>
                <th className="px-4 py-3 font-medium">Disp.</th>
                <th className="px-4 py-3 font-medium">Ajuste</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const p = products.find((x) => x.id === s.productId);
                const sl = sellers.find((x) => x.id === s.sellerId);
                const avail = s.quantity - s.reserved;
                const tone = avail < 10 ? "red" : avail < 30 ? "gold" : "lime";
                return (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p?.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p>{p?.name}</p>
                          <p className="text-[11px] text-[#8d897e]">{p?.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#cfc9bc]">{sl?.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{s.warehouse}</td>
                    <td className="px-4 py-3">{s.quantity}</td>
                    <td className="px-4 py-3 text-[#c9a36a]">{s.reserved}</td>
                    <td className="px-4 py-3">
                      <Badge tone={tone}>{avail}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => adjustStock(s.id, -1)}
                          className="w-8 h-8 rounded-lg border border-white/10 hover:border-[#ff6b5a]/50"
                        >
                          −
                        </button>
                        <button
                          onClick={() => adjustStock(s.id, 1)}
                          className="w-8 h-8 rounded-lg border border-white/10 hover:border-[#c8f54a]/50"
                        >
                          +
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
