import { useState } from "react";
import { useCrm, useVisible } from "../store";
import type { Item } from "../types";
import { PrintQuote } from "../PrintQuote";
import { Badge, Btn, Empty, Field, Input, Modal, PageTitle, Panel, Select, Stat, Table, Td, Tr, brl, dateBr } from "../ui";

export function Catalog() {
  const { s, permits } = useCrm();
  const showCost = permits("products.cost_view");
  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="COMERCIAL"
        title="Produtos e serviços"
        desc={showCost ? "Custo visível: seu papel tem products.cost_view." : "Custo oculto: seu papel não tem products.cost_view — a coluna nem sai do servidor."}
      />
      <Panel className="overflow-hidden">
        <Table head={["Item", "Tipo", "SKU", "Categoria", "Preço", ...(showCost ? ["Custo", "Margem"] : []), "Status"]}>
          {s.products.map((p) => (
            <Tr key={p.uid}>
              <Td>{p.name}</Td>
              <Td><Badge tone={p.kind === "service" ? "blue" : "gold"}>{p.kind === "service" ? "serviço" : "produto"}</Badge></Td>
              <Td mono muted>{p.sku}</Td>
              <Td muted>{p.category}</Td>
              <Td mono>{brl(p.price)}</Td>
              {showCost && <Td mono muted>{brl(p.cost)}</Td>}
              {showCost && <Td mono>{Math.round(((p.price - p.cost) / p.price) * 100)}%</Td>}
              <Td><Badge tone={p.status === "active" ? "lime" : "fog"}>{p.status}</Badge></Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}

export function Quotes() {
  const { s, saveQuote, sendQuote, acceptQuote, createSale } = useCrm();
  const visible = useVisible(s.quotes);
  const [creating, setCreating] = useState(false);
  const [printing, setPrinting] = useState<string | null>(null);

  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="COMERCIAL"
        title="Propostas"
        desc="Totais recalculados no servidor; desconto acima de 15% entra em aprovação; proposta expirada não pode ser aceita."
      />
      <div className="flex items-center gap-2">
        <Btn onClick={() => setCreating(true)}>Nova proposta</Btn>
        <span className="ml-auto font-mono text-[12px] text-[#8d897e]">{visible.length} propostas</span>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {visible.length === 0 && <Empty text="Nenhuma proposta no escopo." />}
        {visible.map((q) => {
          const subtotal = q.items.reduce((a, i) => a + i.price * i.qty, 0);
          const total = +(subtotal * (1 - q.discount / 100)).toFixed(2);
          const expired = new Date(q.validUntil) < new Date();
          return (
            <Panel key={q.uid} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-serif text-xl">{q.number}</p>
                  <p className="text-[12.5px] text-[#8d897e] mt-0.5">
                    {s.clients.find((c) => c.uid === q.clientUid)?.name ?? "—"} · até {dateBr(q.validUntil)}
                  </p>
                </div>
                <Badge tone={q.status === "accepted" ? "lime" : q.status === "sent" ? "blue" : expired ? "red" : "gold"}>
                  {expired && q.status === "sent" ? "expirada" : q.status}
                </Badge>
              </div>
              <div className="mt-3 space-y-1">
                {q.items.map((i) => {
                  const p = s.products.find((x) => x.uid === i.productUid);
                  return (
                    <p key={i.productUid} className="text-[12.5px] text-[#b7b3a8]">
                      {i.qty}× {p?.name ?? i.productUid} — {brl(i.price * i.qty)}
                    </p>
                  );
                })}
              </div>
              <div className="flex items-end justify-between mt-4 pt-3 border-t border-white/8">
                <div>
                  <p className="font-mono text-[10px] text-[#8d897e]">SUBTOTAL {brl(subtotal)} · DESC {q.discount}%</p>
                  <p className="font-serif text-2xl">{brl(total)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Btn tone="ghost" onClick={() => setPrinting(q.uid)}>Ver / imprimir</Btn>
                  {q.status === "draft" && <Btn onClick={() => sendQuote(q.uid)}>Enviar</Btn>}
                  {q.status === "sent" && !expired && <Btn onClick={() => acceptQuote(q.uid)}>Aceitar</Btn>}
                  {q.status === "accepted" && (
                    <Btn tone="ghost" onClick={() => createSale({ clientUid: q.clientUid, items: q.items, status: "pendente" })}>
                      Gerar venda
                    </Btn>
                  )}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      {creating && <QuoteForm onClose={() => setCreating(false)} onSave={saveQuote} />}
      {printing && <PrintQuote uid={printing} onClose={() => setPrinting(null)} />}
    </div>
  );
}

function QuoteForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (d: { clientUid: string; items: Item[]; discount: number; validUntil: string }) => void;
}) {
  const { s } = useCrm();
  const [clientUid, setClientUid] = useState(s.clients[0]?.uid ?? "");
  const [items, setItems] = useState<Item[]>([{ productUid: s.products[0]?.uid ?? "", qty: 1, price: s.products[0]?.price ?? 0 }]);
  const [discount, setDiscount] = useState(0);
  const [validUntil, setValidUntil] = useState("2026-04-30");

  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const total = +(subtotal * (1 - discount / 100)).toFixed(2);

  return (
    <Modal title="Nova proposta" onClose={onClose} wide>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Cliente">
          <Select value={clientUid} onChange={(e) => setClientUid(e.target.value)}>
            {s.clients.filter((c) => !c.deletedAt).map((c) => (
              <option key={c.uid} value={c.uid}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Desconto (%)">
          <Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
        </Field>
        <Field label="Validade">
          <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </Field>
      </div>

      <div className="mt-5 space-y-2">
        {items.map((it, idx) => (
          <div key={idx} className="grid sm:grid-cols-[1fr_90px_140px_auto] gap-2 items-end">
            <Field label="Item">
              <Select
                value={it.productUid}
                onChange={(e) => {
                  const p = s.products.find((x) => x.uid === e.target.value)!;
                  const next = [...items];
                  next[idx] = { productUid: p.uid, qty: it.qty, price: p.price };
                  setItems(next);
                }}
              >
                {s.products.map((p) => (
                  <option key={p.uid} value={p.uid}>{p.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Qtd">
              <Input type="number" value={it.qty} onChange={(e) => { const n = [...items]; n[idx] = { ...it, qty: Number(e.target.value) }; setItems(n); }} />
            </Field>
            <Field label="Preço unit.">
              <Input type="number" value={it.price} onChange={(e) => { const n = [...items]; n[idx] = { ...it, price: Number(e.target.value) }; setItems(n); }} />
            </Field>
            <button
              onClick={() => setItems(items.filter((_, i) => i !== idx))}
              className="text-[12px] text-[#ff8b7a] pb-2.5"
            >
              remover
            </button>
          </div>
        ))}
        <Btn
          tone="ghost"
          onClick={() => setItems([...items, { productUid: s.products[0].uid, qty: 1, price: s.products[0].price }])}
        >
          + item
        </Btn>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-[11px] text-[#8d897e]">SUBTOTAL {brl(subtotal)}</p>
          <p className="font-serif text-3xl">{brl(total)}</p>
          {discount > 15 && <p className="text-[12px] text-[#ff8b7a] mt-1">Acima de 15%: exigirá aprovação.</p>}
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => { onSave({ clientUid, items, discount, validUntil }); onClose(); }}>Salvar proposta</Btn>
          <Btn tone="ghost" onClick={onClose}>Cancelar</Btn>
        </div>
      </div>
    </Modal>
  );
}

export function Sales() {
  const { s, createSale } = useCrm();
  const visible = useVisible(s.sales);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="COMERCIAL"
        title="Vendas"
        desc="A venda é atômica: itens, lançamento financeiro e auditoria na mesma transação. Falha no meio = rollback."
      />
      <div className="flex items-center gap-2">
        <Btn onClick={() => setCreating(true)}>Registrar venda</Btn>
        <span className="ml-auto font-mono text-[12px] text-[#8d897e]">
          {visible.length} vendas · {brl(visible.reduce((a, v) => a + v.total, 0))}
        </span>
      </div>

      <Panel className="overflow-hidden">
        {visible.length === 0 ? (
          <Empty text="Nenhuma venda no escopo." />
        ) : (
          <Table head={["Número", "Cliente", "Responsável", "Itens", "Total", "Status", "Data"]}>
            {visible.map((v) => (
              <Tr key={v.uid}>
                <Td mono>{v.number}</Td>
                <Td>{s.clients.find((c) => c.uid === v.clientUid)?.name ?? "—"}</Td>
                <Td muted>{s.users.find((u) => u.id === v.ownerId)?.name ?? "—"}</Td>
                <Td muted mono>{v.items.reduce((a, i) => a + i.qty, 0)}</Td>
                <Td mono>{brl(v.total)}</Td>
                <Td><Badge tone={v.status === "paga" ? "lime" : v.status === "pendente" ? "gold" : "red"}>{v.status}</Badge></Td>
                <Td muted mono>{dateBr(v.soldAt)}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>

      {creating && <SaleForm onClose={() => setCreating(false)} onCreate={createSale} />}
    </div>
  );
}

function SaleForm({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (d: { clientUid: string; items: Item[]; status: "paga" | "pendente" | "cancelada" }) => void;
}) {
  const { s } = useCrm();
  const [clientUid, setClientUid] = useState(s.clients[0]?.uid ?? "");
  const [status, setStatus] = useState<"paga" | "pendente">("paga");
  const [items, setItems] = useState<Item[]>([{ productUid: s.products[0].uid, qty: 1, price: s.products[0].price }]);
  const total = items.reduce((a, i) => a + i.price * i.qty, 0);

  return (
    <Modal title="Registrar venda" onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Cliente">
          <Select value={clientUid} onChange={(e) => setClientUid(e.target.value)}>
            {s.clients.filter((c) => !c.deletedAt).map((c) => (
              <option key={c.uid} value={c.uid}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="paga">paga</option>
            <option value="pendente">pendente</option>
          </Select>
        </Field>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_80px] gap-2 items-end">
            <Field label="Item">
              <Select
                value={it.productUid}
                onChange={(e) => {
                  const p = s.products.find((x) => x.uid === e.target.value)!;
                  const n = [...items];
                  n[idx] = { productUid: p.uid, qty: it.qty, price: p.price };
                  setItems(n);
                }}
              >
                {s.products.map((p) => (
                  <option key={p.uid} value={p.uid}>{p.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Qtd">
              <Input type="number" value={it.qty} onChange={(e) => { const n = [...items]; n[idx] = { ...it, qty: Number(e.target.value) }; setItems(n); }} />
            </Field>
          </div>
        ))}
        <Btn tone="ghost" onClick={() => setItems([...items, { productUid: s.products[0].uid, qty: 1, price: s.products[0].price }])}>
          + item
        </Btn>
      </div>
      <div className="mt-6 flex items-end justify-between">
        <p className="font-serif text-3xl">{brl(total)}</p>
        <div className="flex gap-2">
          <Btn onClick={() => { onCreate({ clientUid, items, status }); onClose(); }}>Confirmar venda</Btn>
          <Btn tone="ghost" onClick={onClose}>Cancelar</Btn>
        </div>
      </div>
    </Modal>
  );
}

export function Finance() {
  const { s, permits } = useCrm();
  if (!permits("finance.view")) {
    return (
      <div className="space-y-6 rise">
        <PageTitle kicker="FINANCEIRO" title="Financeiro" desc="Módulo isolado do comercial." />
        <Panel className="p-8">
          <p className="text-[14px] text-[#ff8b7a]">403 — seu papel não possui finance.view.</p>
          <p className="text-[13px] text-[#8d897e] mt-2">
            A checagem acontece no servidor: a tela nem recebe os dados.
          </p>
        </Panel>
      </div>
    );
  }
  const receitas = s.financial.filter((f) => f.kind === "receita").reduce((a, f) => a + f.amount, 0);
  const despesas = s.financial.filter((f) => f.kind === "despesa").reduce((a, f) => a + f.amount, 0);

  return (
    <div className="space-y-6 rise">
      <PageTitle kicker="FINANCEIRO" title="Receitas e despesas" desc="Todo lançamento nasce de um fato (venda, custo) e é imutável: corrigir é estornar e lançar de novo." />
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Receitas" value={brl(receitas)} />
        <Stat label="Despesas" value={brl(despesas)} />
        <Stat label="Resultado" value={brl(receitas - despesas)} />
      </div>
      <Panel className="overflow-hidden">
        <Table head={["Tipo", "Descrição", "Origem", "Vencimento", "Valor"]}>
          {s.financial.map((f) => (
            <Tr key={f.id}>
              <Td><Badge tone={f.kind === "receita" ? "lime" : "red"}>{f.kind}</Badge></Td>
              <Td>{f.description}</Td>
              <Td muted mono>{f.origin}</Td>
              <Td muted mono>{dateBr(f.dueAt)}</Td>
              <Td mono>{brl(f.amount)}</Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}

export function Reports() {
  const { s, exportCsv, permits } = useCrm();
  const bySeller = s.users
    .map((u) => ({
      name: u.name,
      vendas: s.sales.filter((v) => v.ownerId === u.id).length,
      total: s.sales.filter((v) => v.ownerId === u.id).reduce((a, v) => a + v.total, 0),
    }))
    .filter((x) => x.vendas > 0);

  const bySource = [...new Set(s.leads.map((l) => l.source))].map((src) => ({
    src,
    count: s.leads.filter((l) => l.source === src).length,
    score: Math.round(s.leads.filter((l) => l.source === src).reduce((a, l) => a + l.score, 0) / Math.max(1, s.leads.filter((l) => l.source === src).length)),
  }));

  const totalSales = s.sales.reduce((a, v) => a + v.total, 0);

  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="DADOS"
        title="Relatórios"
        desc="Exportações exigem permissão export.*, passam por auditoria e saem em CSV UTF-8 com BOM."
      />
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Vendas total" value={brl(totalSales)} />
        <Stat label="Leads" value={String(s.leads.length)} />
        <Stat label="Ticket médio" value={brl(s.sales.length ? totalSales / s.sales.length : 0)} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel className="overflow-hidden">
          <div className="p-5 border-b border-white/8 flex items-center justify-between">
            <p className="font-serif text-xl">Por vendedor</p>
            <Btn
              tone="ghost"
              onClick={() =>
                exportCsv(
                  "vendedores",
                  bySeller.map((x) => [x.name, String(x.vendas), x.total.toFixed(2)]),
                  ["Vendedor", "Vendas", "Total"],
                )
              }
            >
              Exportar CSV
            </Btn>
          </div>
          <Table head={["Vendedor", "Vendas", "Total"]}>
            {bySeller.map((x) => (
              <Tr key={x.name}>
                <Td>{x.name}</Td>
                <Td mono muted>{x.vendas}</Td>
                <Td mono>{brl(x.total)}</Td>
              </Tr>
            ))}
          </Table>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="p-5 border-b border-white/8 flex items-center justify-between">
            <p className="font-serif text-xl">Origem dos leads</p>
            <Btn
              tone="ghost"
              onClick={() =>
                exportCsv(
                  "leads-origem",
                  bySource.map((x) => [x.src, String(x.count), String(x.score)]),
                  ["Origem", "Leads", "Score médio"],
                )
              }
            >
              Exportar CSV
            </Btn>
          </div>
          <Table head={["Origem", "Leads", "Score médio"]}>
            {bySource.map((x) => (
              <Tr key={x.src}>
                <Td>{x.src}</Td>
                <Td mono muted>{x.count}</Td>
                <Td mono>{x.score}</Td>
              </Tr>
            ))}
          </Table>
        </Panel>
      </div>

      {!permits("export.full") && (
        <p className="text-[13px] text-[#8d897e]">
          Seu papel não tem export.full: a exportação completa é bloqueada no servidor, mesmo que o botão apareça.
        </p>
      )}
    </div>
  );
}
