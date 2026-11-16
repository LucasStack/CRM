import { useMemo, useState } from "react";
import { products, sellers, stock } from "../data/seed";
import { brl } from "../lib/format";
import { useStore } from "../state/Store";
import { Badge, GhostBtn, Panel, Select, Stars } from "../ui/primitives";

export function Products() {
  const { query, selectedProduct, setSelectedProduct, reviews, stock: liveStock } = useStore();
  const [cat, setCat] = useState("todos");
  const cats = ["todos", ...Array.from(new Set(products.map((p) => p.category)))];

  const list = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => {
      const okCat = cat === "todos" || p.category === cat;
      const okQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [cat, query]);

  const selected = products.find((p) => p.id === selectedProduct) ?? null;
  const seller = sellers.find((s) => s.id === selected?.sellerId);
  const stk = (liveStock.length ? liveStock : stock).find((s) => s.productId === selected?.id);
  const prReviews = reviews.filter((r) => r.productId === selected?.id);

  return (
    <div className="space-y-6 rise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">CATÁLOGO</p>
          <h1 className="font-serif text-4xl mt-1">Produtos</h1>
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value)}>
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((p) => {
          const sl = sellers.find((s) => s.id === p.sellerId);
          const st = liveStock.find((s) => s.productId === p.id);
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProduct(p.id)}
              className="text-left rounded-2xl overflow-hidden border border-white/8 bg-[#141512] hover:border-[#c9a36a]/40 transition"
            >
              <div className="aspect-[4/3] overflow-hidden bg-black">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover hover:scale-[1.03] transition duration-500" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge>{p.category}</Badge>
                  <span className="font-mono text-[11px] text-[#8d897e]">{p.sku}</span>
                </div>
                <h3 className="font-serif text-2xl mt-2">{p.name}</h3>
                <p className="text-sm text-[#b7b3a8] mt-1">{sl?.name}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[#c8f54a]">{brl(p.price)}</span>
                  <Stars value={p.rating} />
                </div>
                <p className="text-[11px] text-[#8d897e] mt-2">
                  {st ? `${st.quantity - st.reserved} disp. · ${st.reserved} res.` : "sem estoque"} · {p.sold} vendidos
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/55" onClick={() => setSelectedProduct(null)}>
          <aside
            className="w-full max-w-md h-full bg-[#10110e] border-l border-white/10 overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={selected.image} alt="" className="w-full h-52 object-cover rounded-2xl" />
            <p className="font-mono text-[11px] text-[#c9a36a] mt-5">{selected.sku}</p>
            <h2 className="font-serif text-3xl">{selected.name}</h2>
            <p className="text-[#b7b3a8] mt-2 leading-relaxed">{selected.description}</p>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <Panel className="p-3">
                <p className="text-[10px] font-mono text-[#8d897e]">PREÇO</p>
                <p className="text-lg">{brl(selected.price)}</p>
              </Panel>
              <Panel className="p-3">
                <p className="text-[10px] font-mono text-[#8d897e]">ESTOQUE</p>
                <p className="text-lg">{stk ? stk.quantity - stk.reserved : 0}</p>
              </Panel>
              <Panel className="p-3">
                <p className="text-[10px] font-mono text-[#8d897e]">VENDEDOR</p>
                <p className="text-sm">{seller?.name}</p>
              </Panel>
              <Panel className="p-3">
                <p className="text-[10px] font-mono text-[#8d897e]">AVALIAÇÃO</p>
                <Stars value={selected.rating} />
              </Panel>
            </div>
            <h3 className="font-serif text-xl mt-8 mb-3">Comentários</h3>
            <div className="space-y-3">
              {prReviews.length === 0 && <p className="text-sm text-[#8d897e]">Nenhum comentário neste recorte.</p>}
              {prReviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-white/8 p-3">
                  <div className="flex justify-between">
                    <span className="text-sm">{r.userName}</span>
                    <Stars value={r.rating} />
                  </div>
                  <p className="text-sm text-[#cfc9bc] mt-1">{r.comment}</p>
                  {r.reply && <p className="text-xs text-[#c9a36a] mt-2">↳ {r.reply}</p>}
                </div>
              ))}
            </div>
            <GhostBtn className="mt-6 w-full" onClick={() => setSelectedProduct(null)}>
              Fechar
            </GhostBtn>
          </aside>
        </div>
      )}
    </div>
  );
}
