import * as seed from "../seed";
import { useCrm, useVisible } from "../store";
import { ROLES } from "../rbac";
import { Badge, Btn, Empty, PageTitle, Panel, Stat, Td, Tr, Table, brl, dateBr, timeBr } from "../ui";
import { useMemo } from "react";
import { OnboardingCard } from "./Onboarding";

export function Dashboard() {
  const { s, me, setView, markRead } = useCrm();
  const u = me()!;
  const opps = useVisible(s.opportunities);
  const sales = useVisible(s.sales);
  const leads = useVisible(s.leads);
  const myTasks = s.tasks.filter((t) => t.ownerId === u.id && t.status !== "completed");
  const myNotifs = s.notifications.filter((n) => n.userId === u.id && !n.readAt);

  const gmv = sales.filter((v) => v.status !== "cancelada").reduce((a, v) => a + v.total, 0);
  const ticket = sales.length ? gmv / sales.length : 0;
  const open = opps.filter((o) => o.status === "aberta");
  const weighted = open.reduce((a, o) => {
    const p = seed.stages.find((x) => x.id === o.stageId)?.probability ?? 0;
    return a + o.value * (p / 100);
  }, 0);
  const conversion = leads.length ? Math.round((leads.filter((l) => l.status === "convertido").length / leads.length) * 100) : 0;

  const byStage = useMemo(
    () =>
      seed.stages
        .filter((st) => st.pipelineId === "p1")
        .map((st) => ({
          name: st.name,
          color: st.color,
          count: open.filter((o) => o.stageId === st.id).length,
          value: open.filter((o) => o.stageId === st.id).reduce((a, o) => a + o.value, 0),
        })),
    [open],
  );

  const byMonth = useMemo(() => {
    const buckets: Record<string, number> = {};
    sales.forEach((v) => {
      const k = v.soldAt.slice(0, 7);
      buckets[k] = (buckets[k] ?? 0) + v.total;
    });
    return Object.entries(buckets).sort().slice(-6);
  }, [sales]);

  const maxMonth = Math.max(1, ...byMonth.map(([, v]) => v));

  return (
    <div className="space-y-7 rise">
      <PageTitle
        kicker={`Painel · ${ROLES[u.role].label}`}
        title={`Olá, ${u.name.split(" ")[0]}`}
        desc="Indicadores calculados dentro do seu escopo de visão (próprio, equipe ou empresa)."
      />

      <OnboardingCard />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <Stat label="Vendas no escopo" value={brl(gmv)} hint={`${sales.length} pedidos`} />
        <Stat label="Ticket médio" value={brl(ticket)} hint="vendas ÷ pedidos" />
        <Stat label="Funil ponderado" value={brl(weighted)} hint={`${open.length} oportunidades abertas`} />
        <Stat label="Conversão de leads" value={`${conversion}%`} hint={`${leads.length} leads no escopo`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2 p-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e]">FUNIL · VENDA CONSULTIVA</p>
              <p className="font-serif text-2xl mt-1">Valor por estágio</p>
            </div>
            <Btn tone="ghost" onClick={() => setView("pipeline")}>
              Abrir funil
            </Btn>
          </div>
          <div className="space-y-2.5">
            {byStage.map((st) => (
              <div key={st.name} className="flex items-center gap-3">
                <span className="w-40 text-[13px] text-[#cfc9bc] shrink-0">{st.name}</span>
                <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg flex items-center px-2 text-[11px] font-mono text-[#0b0c0a]"
                    style={{ width: `${Math.max(6, (st.value / Math.max(1, ...byStage.map((x) => x.value))) * 100)}%`, background: st.color }}
                  >
                    {st.count}
                  </div>
                </div>
                <span className="font-mono text-[12px] text-[#8d897e] w-28 text-right">{brl(st.value)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e]">VENDAS POR MÊS</p>
          <div className="flex items-end gap-2 h-40 mt-5">
            {byMonth.length === 0 && <Empty text="Sem vendas registradas." />}
            {byMonth.map(([m, v]) => (
              <div key={m} className="flex-1 flex flex-col justify-end items-center gap-1 h-full">
                <div className="w-full rounded-t bg-[#c8f54a]/80" style={{ height: `${(v / maxMonth) * 100}%` }} />
                <span className="font-mono text-[9px] text-[#8d897e]">{m.slice(5)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel className="overflow-hidden">
          <div className="p-5 border-b border-white/8 flex items-center justify-between">
            <p className="font-serif text-xl">Minhas tarefas</p>
            <Btn tone="ghost" onClick={() => setView("tasks")}>
              Ver todas
            </Btn>
          </div>
          {myTasks.length === 0 ? (
            <Empty text="Nenhuma tarefa pendente." />
          ) : (
            <Table head={["Tarefa", "Prazo", "Prioridade", ""]}>
              {myTasks.map((t) => (
                <Tr key={t.uid}>
                  <Td>{t.title}</Td>
                  <Td muted mono>{timeBr(t.dueAt)}</Td>
                  <Td>
                    <Badge tone={t.priority === "alta" ? "red" : t.priority === "media" ? "gold" : "fog"}>{t.priority}</Badge>
                  </Td>
                  <Td>
                    <button className="text-[12px] text-[#c8f54a]" onClick={() => setView("tasks")}>
                      abrir
                    </button>
                  </Td>
                </Tr>
              ))}
            </Table>
          )}
        </Panel>

        <Panel className="overflow-hidden">
          <div className="p-5 border-b border-white/8 flex items-center justify-between">
            <p className="font-serif text-xl">Notificações</p>
            <span className="font-mono text-[11px] text-[#c9a36a]">{myNotifs.length} não lidas</span>
          </div>
          {myNotifs.length === 0 ? (
            <Empty text="Tudo em dia." />
          ) : (
            <div className="divide-y divide-white/5">
              {myNotifs.map((n) => (
                <div key={n.id} className="p-4 flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c8f54a] live-dot mt-2" />
                  <div className="flex-1">
                    <p className="text-[13.5px] text-[#efe8db]">{n.title}</p>
                    <p className="text-[12.5px] text-[#8d897e] mt-0.5">{n.body}</p>
                    <p className="font-mono text-[10px] text-[#8d897e] mt-1">{timeBr(n.createdAt)}</p>
                  </div>
                  <button onClick={() => markRead(n.id)} className="text-[11px] text-[#c9a36a]">
                    marcar lida
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <div className="p-5 border-b border-white/8">
          <p className="font-serif text-xl">Últimos eventos de auditoria</p>
        </div>
        {s.audit.length === 0 ? (
          <Empty text="Nenhum evento ainda. As ações que você executar aparecem aqui." />
        ) : (
          <Table head={["Quando", "Ação", "Entidade", "Usuário", "Detalhe"]}>
            {s.audit.slice(0, 8).map((a) => (
              <Tr key={a.id}>
                <Td muted mono>{dateBr(a.at)}</Td>
                <Td mono>{a.action}</Td>
                <Td muted mono>{a.entityType}</Td>
                <Td muted>{s.users.find((x) => x.id === a.userId)?.name ?? "sistema"}</Td>
                <Td muted>{a.detail}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
