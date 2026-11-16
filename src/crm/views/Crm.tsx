import { useState } from "react";
import { scoreOf, useCrm, useVisible } from "../store";
import { maskDoc, normalizePhone, validateDoc } from "../validators";
import {
  Badge, Btn, Confirm, Empty, Field, Input, Modal, PageTitle, Panel, Select, Table, Td, TextArea, Tr, brl, dateBr,
} from "../ui";
import type { Client, Lead } from "../types";

export function Clients() {
  const { s, saveClient, updateClient, deleteClient, mergeClients, addContact } = useCrm();
  const visible = useVisible(s.clients.filter((c) => !c.deletedAt));
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [merging, setMerging] = useState<{ from: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const list = visible.filter((c) => {
    const t = q.toLowerCase();
    return !t || c.name.toLowerCase().includes(t) || c.document.includes(t) || c.email.toLowerCase().includes(t);
  });

  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="CRM"
        title="Clientes"
        desc="Validação de CPF/CNPJ por dígito verificador, detecção de duplicidade antes de salvar e mesclagem transacional."
      />
      <div className="flex flex-wrap gap-2 items-center">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, documento ou e-mail…" className="max-w-sm" />
        <Btn onClick={() => setCreating(true)}>Novo cliente</Btn>
        <Btn tone="ghost" onClick={() => setMerging({ from: "" })}>Mesclar duplicados</Btn>
        <span className="ml-auto font-mono text-[11px] text-[#8d897e]">{list.length} no seu escopo</span>
      </div>

      <Panel className="overflow-hidden">
        {list.length === 0 ? (
          <Empty text="Nenhum cliente encontrado." />
        ) : (
          <Table head={["Cliente", "Documento", "Contato", "Responsável", "Criado", ""]}>
            {list.map((c) => (
              <Tr key={c.uid} onClick={() => setDetail(c.uid)}>
                <Td>
                  <div className="flex items-center gap-2">
                    <Badge tone={c.kind === "PJ" ? "blue" : "gold"}>{c.kind}</Badge>
                    {c.name}
                  </div>
                </Td>
                <Td mono muted>{c.document ? maskDoc(c.document) : "—"}</Td>
                <Td muted>{c.email || c.phone || "—"}</Td>
                <Td muted>{s.users.find((u) => u.id === c.ownerId)?.name ?? "—"}</Td>
                <Td muted mono>{dateBr(c.createdAt)}</Td>
                <Td>
                  <span className="text-[12px] text-[#c9a36a]">abrir</span>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>

      {creating && <ClientForm onClose={() => setCreating(false)} onSave={saveClient} />}
      {detail && (
        <ClientDetail
          uid={detail}
          onClose={() => setDetail(null)}
          onUpdate={updateClient}
          onDelete={(u) => setDeleting(u)}
          onAddContact={addContact}
        />
      )}
      {merging && (
        <MergeModal
          clients={visible}
          onClose={() => setMerging(null)}
          onMerge={(from, to, just) => {
            mergeClients(from, to, just);
            setMerging(null);
          }}
        />
      )}
      {deleting && (
        <Confirm
          word="EXCLUIR"
          label="Arquivar cliente"
          consequence="O cliente será arquivado (exclusão lógica). Atividades e vínculos permanecem para fins de auditoria."
          onConfirm={() => {
            deleteClient(deleting, "solicitado pelo usuário");
            setDeleting(null);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function ClientForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (d: Partial<Client>) => { ok: boolean; msg: string; duplicate?: Client };
}) {
  const [kind, setKind] = useState<"PF" | "PJ">("PF");
  const [name, setName] = useState("");
  const [doc, setDoc] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [force, setForce] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [dup, setDup] = useState<Client | null>(null);

  const submit = () => {
    if (!validateDoc(doc, kind)) {
      setMsg("Documento inválido: os dígitos verificadores não conferem.");
      return;
    }
    const res = onSave({ kind, name, document: doc, email, phone, city, state });
    if (res.ok) return onClose();
    if (res.duplicate && !force) {
      setDup(res.duplicate);
      setMsg(res.msg);
      return;
    }
    if (res.duplicate && force) {
      onSave({ kind, name, document: doc, email, phone, city, state });
      return onClose();
    }
    setMsg(res.msg);
  };

  return (
    <Modal title="Novo cliente" onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Tipo">
          <Select value={kind} onChange={(e) => setKind(e.target.value as "PF" | "PJ")}>
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </Select>
        </Field>
        <Field label="Nome / Razão social">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={kind === "PF" ? "CPF" : "CNPJ"}>
          <Input value={doc} onChange={(e) => setDoc(e.target.value)} placeholder={kind === "PF" ? "000.000.000-00" : "00.000.000/0000-00"} />
        </Field>
        <Field label="Telefone">
          <Input value={phone} onChange={(e) => setPhone(normalizePhone(e.target.value))} />
        </Field>
        <Field label="E-mail">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Cidade">
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </Field>
        <Field label="UF">
          <Input value={state} onChange={(e) => setState(e.target.value.slice(0, 2).toUpperCase())} />
        </Field>
      </div>

      {msg && (
        <div className="mt-4 rounded-xl border border-[#ff6b5a]/30 bg-[#ff6b5a]/8 p-4">
          <p className="text-[13px] text-[#ff8b7a]">{msg}</p>
          {dup && (
            <div className="flex flex-wrap gap-2 mt-3">
              <Btn tone="ghost" onClick={onClose}>Cancelar</Btn>
              <Btn tone="ghost" onClick={() => { setDup(null); setMsg(null); onClose(); }}>Mesclar (abrir ferramenta)</Btn>
              <Btn onClick={() => { setForce(true); submit(); }}>Continuar com justificativa</Btn>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-6">
        <Btn onClick={submit}>Salvar</Btn>
        <Btn tone="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
}

function ClientDetail({
  uid,
  onClose,
  onUpdate,
  onDelete,
  onAddContact,
}: {
  uid: string;
  onClose: () => void;
  onUpdate: (uid: string, patch: Partial<Client>) => void;
  onDelete: (uid: string) => void;
  onAddContact: (clientUid: string, c: { name: string; email: string; phone: string; role: string }) => void;
}) {
  const { s, permits } = useCrm();
  const c = s.clients.find((x) => x.uid === uid)!;
  const contacts = s.contacts.filter((x) => x.clientUid === uid);
  const opps = s.opportunities.filter((o) => o.clientUid === uid);
  const sales = s.sales.filter((v) => v.clientUid === uid);
  const [ct, setCt] = useState({ name: "", email: "", phone: "", role: "" });

  return (
    <Modal title={c.name} onClose={onClose} wide>
      <div className="grid sm:grid-cols-3 gap-3">
        <Info label="Documento" value={maskDoc(c.document)} mono />
        <Info label="E-mail" value={c.email || "—"} />
        <Info label="Telefone" value={c.phone || "—"} />
        <Info label="Cidade" value={`${c.city}/${c.state}`} />
        <Info label="Responsável" value={s.users.find((u) => u.id === c.ownerId)?.name ?? "—"} />
        <Info label="Cliente desde" value={dateBr(c.createdAt)} />
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-2">Contatos</p>
          <div className="space-y-2">
            {contacts.length === 0 && <p className="text-[13px] text-[#8d897e]">Nenhum contato.</p>}
            {contacts.map((x) => (
              <div key={x.id} className="rounded-xl border border-white/8 p-3">
                <p className="text-[13.5px]">{x.name} <span className="text-[#8d897e]">· {x.role}</span></p>
                <p className="text-[12px] text-[#8d897e]">{x.email} · {x.phone}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Input placeholder="Nome" value={ct.name} onChange={(e) => setCt({ ...ct, name: e.target.value })} />
            <Input placeholder="Cargo" value={ct.role} onChange={(e) => setCt({ ...ct, role: e.target.value })} />
            <Input placeholder="E-mail" value={ct.email} onChange={(e) => setCt({ ...ct, email: e.target.value })} />
            <Input placeholder="Telefone" value={ct.phone} onChange={(e) => setCt({ ...ct, phone: normalizePhone(e.target.value) })} />
          </div>
          <Btn
            className="mt-2"
            onClick={() => {
              if (!ct.name) return;
              onAddContact(uid, ct);
              setCt({ name: "", email: "", phone: "", role: "" });
            }}
          >
            Adicionar contato
          </Btn>
        </div>

        <div>
          <p className="font-mono text-[10px] tracking-[0.16em] text-[#8d897e] uppercase mb-2">Histórico comercial</p>
          <div className="space-y-2">
            {opps.map((o) => (
              <div key={o.uid} className="rounded-xl border border-white/8 p-3 flex justify-between">
                <span className="text-[13px]">{o.title}</span>
                <span className="font-mono text-[12px] text-[#c9a36a]">{brl(o.value)}</span>
              </div>
            ))}
            {sales.map((v) => (
              <div key={v.uid} className="rounded-xl border border-white/8 p-3 flex justify-between">
                <span className="text-[13px]">{v.number}</span>
                <Badge tone={v.status === "paga" ? "lime" : v.status === "pendente" ? "gold" : "red"}>{v.status}</Badge>
              </div>
            ))}
            {opps.length + sales.length === 0 && <p className="text-[13px] text-[#8d897e]">Sem movimentação.</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-6">
        <Btn
          tone="ghost"
          onClick={() => {
            const note = window.prompt("Nova observação:", c.notes);
            if (note !== null) onUpdate(uid, { notes: note });
          }}
        >
          Editar observações
        </Btn>
        {permits("clients.delete") && (
          <Btn tone="danger" onClick={() => onDelete(uid)}>Arquivar</Btn>
        )}
        <Btn tone="ghost" onClick={onClose}>Fechar</Btn>
      </div>
    </Modal>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-white/8 p-3">
      <p className="font-mono text-[10px] tracking-[0.14em] text-[#8d897e] uppercase">{label}</p>
      <p className={`text-[13.5px] mt-1 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function MergeModal({
  clients,
  onClose,
  onMerge,
}: {
  clients: Client[];
  onClose: () => void;
  onMerge: (from: string, to: string, just: string) => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [just, setJust] = useState("");

  return (
    <Modal title="Mesclar clientes duplicados" onClose={onClose}>
      <p className="text-[13px] text-[#8d897e] leading-relaxed">
        A mesclagem roda em uma única transação: reatribui oportunidades, propostas e vendas, arquiva a origem e grava auditoria com a justificativa.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <Field label="Origem (será arquivada)">
          <Select value={from} onChange={(e) => setFrom(e.target.value)}>
            <option value="">Selecione…</option>
            {clients.map((c) => (
              <option key={c.uid} value={c.uid}>{c.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Destino (permanece)">
          <Select value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">Selecione…</option>
            {clients.filter((c) => c.uid !== from).map((c) => (
              <option key={c.uid} value={c.uid}>{c.name}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Justificativa (obrigatória)">
        <TextArea className="mt-1.5" rows={3} value={just} onChange={(e) => setJust(e.target.value)} placeholder="Mesmo CNPJ, cadastro duplicado após importação." />
      </Field>
      <div className="flex gap-2 mt-5">
        <Btn disabled={!from || !to || just.trim().length < 5} onClick={() => onMerge(from, to, just)}>
          Mesclar em transação
        </Btn>
        <Btn tone="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
}

export function Leads() {
  const { s, saveLead, convertLead, permits } = useCrm();
  const visible = useVisible(s.leads);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="CRM"
        title="Leads"
        desc="Pontuação automática por completude e origem. A conversão cria cliente e oportunidade na mesma transação."
      />
      <div className="flex items-center gap-2">
        <Btn onClick={() => setCreating(true)}>Novo lead</Btn>
        <span className="ml-auto font-mono text-[11px] text-[#8d897e]">{visible.length} no escopo</span>
      </div>

      <Panel className="overflow-hidden">
        {visible.length === 0 ? (
          <Empty text="Nenhum lead no seu escopo." />
        ) : (
          <Table head={["Nome / Empresa", "Origem", "Status", "Score", "Responsável", "Criado", ""]}>
            {visible.map((l) => (
              <Tr key={l.uid}>
                <Td>
                  <p>{l.name}</p>
                  <p className="text-[11.5px] text-[#8d897e]">{l.company || "—"}</p>
                </Td>
                <Td muted>{l.source}</Td>
                <Td>
                  <Badge tone={l.status === "convertido" ? "lime" : l.status === "desqualificado" ? "red" : "gold"}>{l.status}</Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-[#c8f54a]" style={{ width: `${l.score}%` }} />
                    </div>
                    <span className="font-mono text-[11px] text-[#c9a36a]">{l.score}</span>
                  </div>
                </Td>
                <Td muted>{s.users.find((u) => u.id === l.ownerId)?.name ?? "—"}</Td>
                <Td muted mono>{dateBr(l.createdAt)}</Td>
                <Td>
                  {l.status !== "convertido" && permits("leads.convert") && (
                    <button onClick={() => convertLead(l.uid)} className="text-[12px] text-[#c8f54a]">
                      converter
                    </button>
                  )}
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>

      {creating && <LeadForm onClose={() => setCreating(false)} onSave={saveLead} />}
    </div>
  );
}

function LeadForm({ onClose, onSave }: { onClose: () => void; onSave: (d: Partial<Lead>) => { ok: boolean; msg: string } }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", company: "", source: "Site" });
  const preview = scoreOf({ ...f });
  return (
    <Modal title="Novo lead" onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nome">
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <Field label="Empresa">
          <Input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} />
        </Field>
        <Field label="E-mail">
          <Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Field>
        <Field label="Telefone">
          <Input value={f.phone} onChange={(e) => setF({ ...f, phone: normalizePhone(e.target.value) })} />
        </Field>
        <Field label="Origem">
          <Select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })}>
            {["Site", "Indicação", "WhatsApp", "Evento", "Tráfego pago"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </Field>
        <Field label="Score calculado">
          <div className="flex items-center gap-2 h-[42px]">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#c8f54a]" style={{ width: `${preview}%` }} />
            </div>
            <span className="font-mono text-[12px] text-[#c9a36a]">{preview}</span>
          </div>
        </Field>
      </div>
      <div className="flex gap-2 mt-6">
        <Btn onClick={() => { if (onSave({ ...f, score: preview }).ok) onClose(); }}>Salvar</Btn>
        <Btn tone="ghost" onClick={onClose}>Cancelar</Btn>
      </div>
    </Modal>
  );
}
