import { useState } from "react";
import { products, sellers } from "../data/seed";
import { timeBr } from "../lib/format";
import { useStore } from "../state/Store";
import { Input, Panel, PrimaryBtn, Stars } from "../ui/primitives";

export function Reviews() {
  const { reviews, replyReview, query } = useStore();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const rows = reviews.filter((r) => {
    const q = query.toLowerCase();
    return !q || r.comment.toLowerCase().includes(q) || r.userName.toLowerCase().includes(q);
  });
  const open = rows.filter((r) => !r.reply).length;

  return (
    <div className="space-y-6 rise">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">SUPORTE</p>
          <h1 className="font-serif text-4xl mt-1">Avaliações e respostas</h1>
          <p className="text-sm text-[#8d897e] mt-2">{open} comentários sem resposta. SLA interno: 24h.</p>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((r) => {
          const p = products.find((x) => x.id === r.productId);
          const s = sellers.find((x) => x.id === r.sellerId);
          return (
            <Panel key={r.id} className="p-5">
              <div className="flex gap-4">
                <img src={p?.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm">
                      {r.userName} · <span className="text-[#8d897e]">{p?.name}</span>
                    </p>
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-2 text-[#efe8db]">{r.comment}</p>
                  <p className="text-[11px] text-[#8d897e] mt-1">
                    {timeBr(r.createdAt)} · {s?.name}
                  </p>
                  {r.reply ? (
                    <div className="mt-3 rounded-xl bg-[#c8f54a]/8 border border-[#c8f54a]/20 p-3 text-sm">
                      <p className="font-mono text-[10px] text-[#c8f54a] mb-1">RESPOSTA DO VENDEDOR</p>
                      {r.reply}
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <Input
                        placeholder="Responder com empatia e SKU…"
                        value={draft[r.id] ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, [r.id]: e.target.value }))}
                      />
                      <PrimaryBtn
                        onClick={() => {
                          const t = draft[r.id]?.trim();
                          if (!t) return;
                          replyReview(r.id, t);
                        }}
                      >
                        Publicar
                      </PrimaryBtn>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
