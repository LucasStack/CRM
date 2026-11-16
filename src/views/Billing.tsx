import { Check } from "lucide-react";
import { PLANS, sellers } from "../data/seed";
import { brl } from "../lib/format";
import { Badge, Panel, PrimaryBtn } from "../ui/primitives";
import { useStore } from "../state/Store";

export function Billing() {
  const { notify } = useStore();
  const mrr = sellers.reduce((s, v) => s + PLANS[v.plan].price, 0);

  return (
    <div className="space-y-8 rise">
      <div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">MONETIZAÇÃO</p>
        <h1 className="font-serif text-4xl mt-1">Assinatura + taxa</h1>
        <p className="text-sm text-[#8d897e] mt-2 max-w-2xl">
          SaaS cobra o acesso. Marketplace cobra o GMV. Quem cresce desce a taxa. MRR desta conta demo: {brl(mrr)}.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {(Object.keys(PLANS) as (keyof typeof PLANS)[]).map((k) => {
          const p = PLANS[k];
          const featured = k === "growth";
          return (
            <Panel
              key={k}
              className={`p-6 ${featured ? "border-[#c8f54a]/40 bg-[#c8f54a]/5" : ""}`}
            >
              {featured && <Badge tone="lime">mais escolhido</Badge>}
              <h2 className="font-serif text-3xl mt-3">{p.label}</h2>
              <p className="mt-2">
                <span className="font-serif text-4xl">{brl(p.price)}</span>
                <span className="text-[#8d897e] text-sm"> /mês</span>
              </p>
              <p className="mt-1 text-[#c9a36a]">{p.fee}% por pedido aprovado</p>
              <ul className="mt-5 space-y-2 text-sm text-[#cfc9bc]">
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-[#c8f54a]" />{" "}
                  {p.orders === Infinity ? "pedidos ilimitados" : `até ${p.orders} pedidos/mês`}
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-[#c8f54a]" /> Pix, cartão, boleto
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-[#c8f54a]" /> dashboard + avaliações
                </li>
                <li className="flex gap-2">
                  <Check className="w-4 h-4 text-[#c8f54a]" /> {k === "starter" ? "e-mail 48h" : "fila prioritária"}
                </li>
              </ul>
              <PrimaryBtn
                className={`w-full mt-6 ${featured ? "" : "bg-[#efe8db]"}`}
                onClick={() => notify(`Plano ${p.label} selecionado — checkout Mercado Pago.`)}
              >
                Assinar
              </PrimaryBtn>
            </Panel>
          );
        })}
      </div>

      <Panel className="p-6">
        <h3 className="font-serif text-2xl">Por que os dois?</h3>
        <div className="grid md:grid-cols-2 gap-6 mt-4 text-sm text-[#b7b3a8] leading-relaxed">
          <p>
            <strong className="text-[#efe8db]">Assinatura</strong> paga a plataforma (auth, cache, backups, suporte). Previsível. Evita vendedor zumbi que não transaciona.
          </p>
          <p>
            <strong className="text-[#efe8db]">Taxa</strong> alinha incentivo: NEXO ganha quando o vendedor vende. Cai com o plano para reter quem escala — sem trancar no contrato eterno.
          </p>
        </div>
      </Panel>
    </div>
  );
}
