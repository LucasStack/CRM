import { useState } from "react";
import * as seed from "../seed";
import { nowIso, useCrm, useVisible } from "../store";
import { Badge, Btn, Empty, Field, Input, Modal, PageTitle, Panel, Select, Table, Td, Tr, brl, timeBr } from "../ui";

export function Pipeline() {
  const { s, moveStage, loseOpportunity } = useCrm();
  const [pipeline, setPipeline] = useState("p1");
  const [losing, setLosing] = useState<string | null>(null);
  const [history, setHistory] = useState<string | null>(null);
  const opps = useVisible(s.opportunities.filter((o) => o.pipelineId === pipeline && o.status === "aberta"));
  const stages = seed.stages.filter((st) => st.pipelineId === pipeline);

  const total = opps.reduce((a, o) => a + o.value, 0);

  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="FUNIL"
        title="Pipeline"
        desc="Cada movimentação grava histórico de estágio e auditoria com antes/depois. A probabilidade vem do estágio."
      />
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={pipeline} onChange={(e) => setPipeline(e.target.value)} className="max-w-[220px]">
          {seed.pipelines.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
        <span className="ml-auto font-mono text-[12px] text-[#8d897e]">
          {opps.length} oportunidades · {brl(total)} em aberto
        </span>
      </div>

      <div className="grid md:grid-cols-3 xl:grid-cols-5 gap-3">
        {stages.map((st) => {
          const cards = opps.filter((o) => o.stageId === st.id);
          const idx = stages.findIndex((x) => x.id === st.id);
          const prev = stages[idx - 1];
          const next = stages[idx + 1];
          return (
            <div key={st.id} className="rounded-2xl border border-white/8 bg-[#0e0f0d] p-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: st.color }} />
                <p className="text-[13px] text-[#efe8db]">{st.name}</p>
                <span className="ml-auto font-mono text-[10px] text-[#8d897e]">{st.probability}%</span>
              </div>
              <div className="space-y-2">
                {cards.length === 0 && <p className="text-[11.5px] text-[#8d897e] px-1">vazio</p>}
                {cards.map((o) => (
                  <div key={o.uid} className="rounded-xl border border-white/8 bg-[#141512] p-3">
                    <p className="text-[13px] leading-snug">{o.title}</p>
                    <p className="font-mono text-[12px] text-[#c9a36a] mt-1">{brl(o.value)}</p>
                    <p className="text-[11px] text-[#8d897e] mt-1">
                      {s.clients.find((c) => c.uid === o.clientUid)?.name ?? "—"} · v{o.version}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {prev && (
                        <button onClick={() => moveStage(o.uid, prev.id)} className="text-[11px] px-2 py-1 rounded-lg border border-white/10 hover:border-[#c9a36a]/40">
                          ←
                        </button>
                      )}
                      {next && (
                        <button onClick={() => moveStage(o.uid, next.id)} className="text-[11px] px-2 py-1 rounded-lg border border-white/10 hover:border-[#c8f54a]/40">
                          →
                        </button>
                      )}
                      <button onClick={() => setHistory(o.uid)} className="text-[11px] px-2 py-1 rounded-lg border border-white/10">
                        histórico
                      </button>
                      <button onClick={() => setLosing(o.uid)} className="text-[11px] px-2 py-1 rounded-lg border border-white/10 text-[#ff8b7a]">
                        perder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {losing && (
        <LoseModal
          onClose={() => setLosing(null)}
          onConfirm={(reason) => {
            loseOpportunity(losing, reason);
            setLosing(null);
          }}
        />
      )}
      {history && (
        <Modal title="Histórico de estágio" onClose={() => setHistory(null)}>
          {s.stageHistory.filter((h) => h.oppUid === history).length === 0 ? (
            <Empty text="Nenhuma movimentação registrada ainda." />
          ) : (
            <div className="space-y-2">
              {s.stageHistory
                .filter((h) => h.oppUid === history)
                .map((h) => (
                  <div key={h.id} className="rounded-xl border border-white/8 p-3">
                    <p className="text-[13px]">
                      {h.from} <span className="text-[#c9a36a]">→</span> {h.to}
                    </p>
                    <p className="font-mono text-[11px] text-[#8d897e] mt-1">
                      {s.users.find((u) => u.id === h.userId)?.name ?? "sistema"} · {timeBr(h.at)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function LoseModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (r: string) => void }) {
  const [r, setR] = useState("");
  return (
    <Modal title="Marcar oportunidade como perdida" onClose={onClose}>
      <Field label="Motivo (obrigatório, vai para a auditoria)">
        <Input value={r} onChange={(e) => setR(e.target.value)} placeholder="Preço acima do orçamento" />
      </Field>
      <div className="flex gap-2 mt-5">
        <Btn tone="danger" disabled={r.trim().length < 4} onClick={() => onConfirm(r)}>
          Registrar perda
        </Btn>
        <Btn tone="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
}

export function Tasks() {
  const { s, saveTask, completeTask } = useCrm();
  const visible = useVisible(s.tasks);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<"todas" | "pending" | "in_progress" | "completed">("pending");

  const list = visible.filter((t) => filter === "todas" || t.status === filter);

  return (
    <div className="space-y-6 rise">
      <PageTitle kicker="OPERAÇÃO" title="Tarefas e compromissos" desc="Tarefas do escopo com prioridade, prazo e conclusão auditada." />
      <div className="flex flex-wrap gap-2 items-center">
        <Btn onClick={() => setCreating(true)}>Nova tarefa</Btn>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="max-w-[200px]">
          <option value="todas">Todas</option>
          <option value="pending">Pendentes</option>
          <option value="in_progress">Em andamento</option>
          <option value="completed">Concluídas</option>
        </Select>
        <span className="ml-auto font-mono text-[12px] text-[#8d897e]">{list.length} tarefas</span>
      </div>

      <Panel className="overflow-hidden">
        {list.length === 0 ? (
          <Empty text="Nada por aqui." />
        ) : (
          <Table head={["Tarefa", "Responsável", "Prazo", "Prioridade", "Status", ""]}>
            {list.map((t) => (
              <Tr key={t.uid}>
                <Td>{t.title}</Td>
                <Td muted>{s.users.find((u) => u.id === t.ownerId)?.name ?? "—"}</Td>
                <Td muted mono>{timeBr(t.dueAt)}</Td>
                <Td><Badge tone={t.priority === "alta" ? "red" : t.priority === "media" ? "gold" : "fog"}>{t.priority}</Badge></Td>
                <Td><Badge tone={t.status === "completed" ? "lime" : t.status === "pending" ? "gold" : "blue"}>{t.status}</Badge></Td>
                <Td>
                  {t.status !== "completed" && (
                    <button onClick={() => completeTask(t.uid)} className="text-[12px] text-[#c8f54a]">concluir</button>
                  )}
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel className="p-5">
        <p className="font-serif text-xl mb-3">Agenda</p>
        <div className="space-y-2">
          {s.appointments.map((a) => (
            <div key={a.uid} className="flex items-center gap-3 rounded-xl border border-white/8 p-3">
              <Badge tone={a.type === "reuniao" ? "blue" : a.type === "ligacao" ? "gold" : "fog"}>{a.type}</Badge>
              <span className="text-[13.5px]">{a.title}</span>
              <span className="ml-auto font-mono text-[11.5px] text-[#8d897e]">
                {timeBr(a.startAt)} · {s.users.find((u) => u.id === a.ownerId)?.name}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      {creating && (
        <Modal title="Nova tarefa" onClose={() => setCreating(false)}>
          <TaskForm
            onSave={(d) => {
              saveTask(d);
              setCreating(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function TaskForm({ onSave }: { onSave: (d: { title: string; priority: "baixa" | "media" | "alta"; dueAt: string }) => void }) {
  const { s } = useCrm();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"baixa" | "media" | "alta">("media");
  const [owner, setOwner] = useState(s.users[3]?.id ?? s.users[0].id);
  const [due, setDue] = useState(nowIso());

  return (
    <div className="space-y-4">
      <Field label="Título">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Prioridade">
          <Select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </Select>
        </Field>
        <Field label="Responsável">
          <Select value={owner} onChange={(e) => setOwner(e.target.value)}>
            {s.users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Prazo">
          <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>
      </div>
      <div className="flex gap-2">
        <Btn disabled={!title.trim()} onClick={() => onSave({ title, priority, dueAt: due })}>Salvar</Btn>
      </div>
    </div>
  );
}

export function Files() {
  const { s, uploadFile, downloadFile, deleteFile, permits } = useCrm();
  const visible = useVisible(s.files.filter((f) => !f.deletedAt));
  const [name, setName] = useState("contrato-cliente.pdf");
  const [mime, setMime] = useState("application/pdf");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="ARQUIVOS"
        title="Documentos"
        desc="Upload validado por MIME real e extensão, nome saneado, armazenamento privado e download auditado."
      />

      <Panel className="p-5">
        <p className="font-serif text-xl mb-4">Simular upload</p>
        <div className="grid sm:grid-cols-[1fr_240px_auto] gap-3 items-end">
          <Field label="Nome do arquivo">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="MIME type">
            <Select value={mime} onChange={(e) => setMime(e.target.value)}>
              <option value="application/pdf">application/pdf</option>
              <option value="image/png">image/png</option>
              <option value="text/csv">text/csv</option>
              <option value="application/x-php">application/x-php</option>
            </Select>
          </Field>
          <Btn
            onClick={() => {
              const r = uploadFile(name, mime, 240_000, "geral");
              setMsg(r.msg);
            }}
          >
            Enviar
          </Btn>
        </div>
        {msg && <p className="text-[13px] text-[#c9a36a] mt-3">{msg}</p>}
        {!permits("files.manage") && <p className="text-[13px] text-[#ff8b7a] mt-3">Seu papel não tem permissão files.manage.</p>}
      </Panel>

      <Panel className="overflow-hidden">
        {visible.length === 0 ? (
          <Empty text="Nenhum arquivo." />
        ) : (
          <Table head={["Arquivo", "MIME", "Tamanho", "Versão", "Downloads", "Enviado por", ""]}>
            {visible.map((f) => (
              <Tr key={f.uid}>
                <Td mono>{f.name}</Td>
                <Td muted mono>{f.mime}</Td>
                <Td muted mono>{(f.size / 1024).toFixed(0)} KB</Td>
                <Td muted mono>v{f.version}</Td>
                <Td muted mono>{f.downloads}</Td>
                <Td muted>{s.users.find((u) => u.id === f.ownerId)?.name ?? "—"}</Td>
                <Td>
                  <div className="flex gap-3">
                    <button onClick={() => downloadFile(f.uid)} className="text-[12px] text-[#c8f54a]">baixar</button>
                    <button onClick={() => deleteFile(f.uid)} className="text-[12px] text-[#ff8b7a]">excluir</button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
