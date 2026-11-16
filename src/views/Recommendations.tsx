import { useMemo, useState } from "react";
import { products } from "../data/seed";
import { brl } from "../lib/format";
import { useStore } from "../state/Store";
import { Badge, Panel, Stars } from "../ui/primitives";

type Mode = "sold" | "rating" | "hybrid";

export function Recommendations() {
  const { setSelectedProduct, setView } = useStore();
  const [mode, setMode] = useState<Mode>("hybrid");

  const ranked = useMemo(() => {
    const maxSold = Math.max(...products.map((p) => p.sold));
    const list = [...products];
    if (mode === "sold") list.sort((a, b) => b.sold - a.sold);
    else if (mode === "rating") list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    else {
      list.sort((a, b) => {
        const sa = (a.sold / maxSold) * 0.55 + (a.rating / 5) * 0.35 + Math.min(a.reviewCount / 400, 1) * 0.1;
        const sb = (b.sold / maxSold) * 0.55 + (b.rating / 5) * 0.35 + Math.min(b.reviewCount / 400, 1) * 0.1;
        return sb - sa;
      });
    }
    return list;
  }, [mode]);

  return (
    <div className="space-y-6 rise">
      <div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">RANKING</p>
        <h1 className="font-serif text-4xl mt-1">Recomendações</h1>
        <p className="text-sm text-[#8d897e] mt-2 max-w-2xl">
          Materialized view `product_stats` a cada 5 min via worker. Híbrido: 55% volume, 35% nota, 10% volume de reviews. Sem ML no dia 1.
        </p>
      </div>
      <div className="flex gap-2">
        {(
          [
            ["sold", "Mais vendidos"],
            ["rating", "Maior nota"],
            ["hybrid", "Híbrido"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`rounded-full px-4 py-2 text-sm ${mode === id ? "bg-[#c8f54a] text-[#0b0c0a]" : "border border-white/10 text-[#cfc9bc]"}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {ranked.map((p, i) => (
          <button
            key={p.id}
            onClick={() => {
              setSelectedProduct(p.id);
              setView("products");
            }}
            className="text-left"
          >
            <Panel className="p-4 flex gap-4 hover:border-[#c9a36a]/40 transition">
              <span className="font-serif text-3xl text-[#c9a36a] w-8">{i + 1}</span>
              <img src={p.image} alt="" className="w-20 h-20 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl truncate">{p.name}</h3>
                  <Badge>{p.category}</Badge>
                </div>
                <Stars value={p.rating} />
                <p className="text-xs text-[#8d897e] mt-1">
                  {p.sold} vendas · {p.reviewCount} reviews · {brl(p.price)}
                </p>
              </div>
            </Panel>
          </button>
        ))}
      </div>
    </div>
  );
}
