import { Printer, X } from "lucide-react";
import { useCrm } from "./store";
import { brl, dateBr } from "./ui";

export function PrintQuote({ uid, onClose }: { uid: string; onClose: () => void }) {
  const { s } = useCrm();
  const q = s.quotes.find((x) => x.uid === uid);
  if (!q) return null;
  const client = s.clients.find((c) => c.uid === q.clientUid);
  const owner = s.users.find((u) => u.id === q.ownerId);
  const subtotal = q.items.reduce((a, i) => a + i.price * i.qty, 0);
  const total = +(subtotal * (1 - q.discount / 100)).toFixed(2);

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 overflow-y-auto nexo-scroll" onClick={onClose}>
      <div className="min-h-screen py-8 px-4 flex flex-col items-center gap-4">
        <div className="w-full max-w-3xl flex items-center justify-between print:hidden">
          <p className="font-mono text-[11px] text-[#efe8db]">Prévia da proposta · {q.number}</p>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="rounded-full bg-[#c8f54a] text-[#0b0c0a] px-4 py-2 text-[13px] inline-flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir / salvar PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-full border border-white/20 text-white px-4 py-2 text-[13px] inline-flex items-center gap-2"
            >
              <X className="w-3.5 h-3.5" /> Fechar
            </button>
          </div>
        </div>

        <div
          className="w-full max-w-3xl bg-white text-[#0b0c0a] rounded-none print:rounded-none shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          id="print-area"
        >
          <div className="p-10 md:p-14">
            <header className="flex items-start justify-between border-b border-[#0b0c0a]/10 pb-6">
              <div>
                <p className="font-mono text-[10px] tracking-[0.22em] text-[#7a6238] uppercase">
                  {s.settings.systemName}
                </p>
                <h1 className="font-serif text-4xl leading-tight mt-2">Proposta comercial</h1>
                <p className="font-mono text-[11px] text-[#3a3a32] mt-2">{q.number}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#7a6238] font-mono">EMITIDA EM</p>
                <p className="font-serif text-lg">{dateBr(q.createdAt)}</p>
                <p className="text-[11px] text-[#7a6238] font-mono mt-3">VÁLIDA ATÉ</p>
                <p className="font-serif text-lg">{dateBr(q.validUntil)}</p>
              </div>
            </header>

            <section className="grid grid-cols-2 gap-6 py-6 border-b border-[#0b0c0a]/10">
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-[#7a6238] uppercase">Para</p>
                <p className="font-serif text-2xl mt-1">{client?.name ?? "—"}</p>
                <p className="text-[13px] text-[#3a3a32] mt-1">
                  {client?.document && `Doc.: ${client.document}`}
                </p>
                <p className="text-[13px] text-[#3a3a32]">{client?.email}</p>
                <p className="text-[13px] text-[#3a3a32]">
                  {client ? `${client.city}${client.state ? `/${client.state}` : ""}` : ""}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-[#7a6238] uppercase">De</p>
                <p className="font-serif text-2xl mt-1">{s.settings.systemName}</p>
                <p className="text-[13px] text-[#3a3a32] mt-1">Responsável: {owner?.name}</p>
                <p className="text-[13px] text-[#3a3a32]">{owner?.email}</p>
              </div>
            </section>

            <section className="py-6">
              <p className="font-mono text-[10px] tracking-[0.16em] text-[#7a6238] uppercase mb-3">Itens</p>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-left border-b border-[#0b0c0a]/15">
                    <th className="py-2 pr-2 font-mono text-[10px] uppercase text-[#7a6238]">Descrição</th>
                    <th className="py-2 px-2 font-mono text-[10px] uppercase text-[#7a6238] text-right">Qtd</th>
                    <th className="py-2 px-2 font-mono text-[10px] uppercase text-[#7a6238] text-right">Unit.</th>
                    <th className="py-2 pl-2 font-mono text-[10px] uppercase text-[#7a6238] text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {q.items.map((it, i) => {
                    const p = s.products.find((x) => x.uid === it.productUid);
                    return (
                      <tr key={i} className="border-b border-[#0b0c0a]/8">
                        <td className="py-2.5 pr-2">
                          <p className="font-serif text-[15px]">{p?.name ?? it.productUid}</p>
                          <p className="text-[11.5px] text-[#7a6238] font-mono">{p?.sku ?? ""}</p>
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono">{it.qty}</td>
                        <td className="py-2.5 px-2 text-right font-mono">{brl(it.price)}</td>
                        <td className="py-2.5 pl-2 text-right font-mono">{brl(it.price * it.qty)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            <section className="flex justify-end py-4 border-t border-[#0b0c0a]/10">
              <div className="w-72 space-y-1.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#7a6238]">Subtotal</span>
                  <span className="font-mono">{brl(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7a6238]">Desconto ({q.discount}%)</span>
                  <span className="font-mono">− {brl(subtotal - total)}</span>
                </div>
                <div className="flex justify-between border-t border-[#0b0c0a]/15 pt-2 mt-2">
                  <span className="font-serif text-xl">Total</span>
                  <span className="font-serif text-2xl">{brl(total)}</span>
                </div>
              </div>
            </section>

            <section className="py-6 border-t border-[#0b0c0a]/10 text-[12px] text-[#3a3a32] leading-relaxed">
              <p className="font-mono text-[10px] tracking-[0.16em] text-[#7a6238] uppercase mb-2">Observações</p>
              <p>
                Proposta válida até {dateBr(q.validUntil)}. Emissão automatizada pelo {s.settings.systemName}. Em caso
                de dúvidas, entre em contato com {owner?.name} pelo e-mail {owner?.email}. Documento gerado
                eletronicamente — dispensa assinatura física, mas o aceite fica registrado em auditoria com data, IP e
                usuário.
              </p>
            </section>

            <footer className="pt-6 border-t border-[#0b0c0a]/10 flex items-center justify-between text-[11px] text-[#7a6238] font-mono">
              <span>{q.number}</span>
              <span>{new Date().toISOString().slice(0, 19).replace("T", " ")}</span>
              <span>{s.settings.systemName}</span>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
