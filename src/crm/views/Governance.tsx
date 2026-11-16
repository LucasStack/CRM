import { useState } from "react";
import { ROLES, PERMISSIONS } from "../rbac";
import { useCrm } from "../store";
import type { RoleId } from "../types";
import { maskDoc } from "../validators";
import {
  Badge, Btn, Empty, Field, Input, Modal, PageTitle, Panel, Select, Table, Td, Tr, dateBr, timeBr,
} from "../ui";

export function Users() {
  const { s, saveUser, setRole, toggleUser, permits, me } = useCrm();
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="ADMINISTRAÇÃO"
        title="Usuários e permissões"
        desc="RBAC granular: papel define o conjunto-base, escopo define o recorte do dado, e a Policy valida no servidor."
      />
      <div className="flex items-center gap-2">
        {permits("users.manage") && <Btn onClick={() => setCreating(true)}>Novo usuário</Btn>}
        <span className="ml-auto font-mono text-[12px] text-[#8d897e]">{s.users.length} usuários</span>
      </div>

      <Panel className="overflow-hidden">
        <Table head={["Nome", "E-mail", "Papel", "Escopo", "2FA", "Status", "Último login", ""]}>
          {s.users.map((u) => (
            <Tr key={u.id}>
              <Td>
                {u.name}
                {u.id === me()?.id && <Badge tone="lime">você</Badge>}
              </Td>
              <Td muted>{u.email}</Td>
              <Td>
                {permits("users.manage") ? (
                  <Select
                    value={u.role}
                    onChange={(e) => setRole(u.id, e.target.value as RoleId)}
                    className="py-1.5 text-[12px]"
                  >
                    {(Object.keys(ROLES) as RoleId[]).map((r) => (
                      <option key={r} value={r}>{ROLES[r].label}</option>
                    ))}
                  </Select>
                ) : (
                  <Badge tone="gold">{ROLES[u.role].label}</Badge>
                )}
              </Td>
              <Td muted mono>{ROLES[u.role].scope}</Td>
              <Td>{u.twoFactor ? <Badge tone="lime">ativo</Badge> : <Badge tone="fog">off</Badge>}</Td>
              <Td>
                <Badge tone={u.status === "active" ? "lime" : u.status === "locked" ? "red" : "fog"}>{u.status}</Badge>
              </Td>
              <Td muted mono>{u.lastLoginAt ? timeBr(u.lastLoginAt) : "—"}</Td>
              <Td>
                {permits("users.manage") && u.id !== me()?.id && (
                  <button onClick={() => toggleUser(u.id)} className="text-[12px] text-[#c9a36a]">
                    {u.status === "active" ? "desativar" : "ativar"}
                  </button>
                )}
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      <Panel className="p-5">
        <p className="font-serif text-xl mb-3">Matriz de permissões por papel</p>
        <div className="overflow-x-auto nexo-scroll">
          <table className="w-full text-[12px]">
            <thead>
              <tr>
                <th className="text-left py-2 pr-3 font-mono text-[10px] text-[#c9a36a] uppercase">Permissão</th>
                {(Object.keys(ROLES) as RoleId[]).map((r) => (
                  <th key={r} className="text-center py-2 px-2 font-mono text-[10px] text-[#8d897e] whitespace-nowrap">
                    {ROLES[r].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((p) => (
                <tr key={p} className="border-t border-white/5">
                  <td className="py-1.5 pr-3 font-mono text-[11px] text-[#efe8db]">{p}</td>
                  {(Object.keys(ROLES) as RoleId[]).map((r) => (
                    <td key={r} className="text-center py-1.5">
                      {ROLES[r].perms.includes(p) ? (
                        <span className="text-[#c8f54a]">●</span>
                      ) : (
                        <span className="text-white/12">·</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {creating && (
        <Modal title="Novo usuário" onClose={() => setCreating(false)}>
          <UserForm
            onSave={(d) => {
              if (saveUser(d).ok) setCreating(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function UserForm({ onSave }: { onSave: (d: { name: string; email: string; role: RoleId; pass: string }) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleId>("vendedor");
  const [pass, setPass] = useState("");
  return (
    <div className="space-y-4">
      <Field label="Nome">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="E-mail">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Papel">
        <Select value={role} onChange={(e) => setRole(e.target.value as RoleId)}>
          {(Object.keys(ROLES) as RoleId[]).map((r) => (
            <option key={r} value={r}>{ROLES[r].label}</option>
          ))}
        </Select>
      </Field>
      <Field label="Senha provisória (mín. 10)">
        <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
      </Field>
      <Btn disabled={name.length < 3 || !email.includes("@") || pass.length < 10} onClick={() => onSave({ name, email, role, pass })}>
        Criar usuário
      </Btn>
    </div>
  );
}

export function AuditView() {
  const { s, permits, exportCsv } = useCrm();
  const [filter, setFilter] = useState("");

  if (!permits("audit.view")) {
    return (
      <div className="space-y-6 rise">
        <PageTitle kicker="AUDITORIA" title="Trilha de auditoria" />
        <Panel className="p-8">
          <p className="text-[14px] text-[#ff8b7a]">403 — seu papel não possui audit.view.</p>
        </Panel>
      </div>
    );
  }

  const rows = s.audit.filter((a) => {
    const t = filter.toLowerCase();
    return !t || a.action.includes(t) || a.entityType.includes(t) || a.detail.toLowerCase().includes(t);
  });

  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="AUDITORIA"
        title="Trilha de auditoria"
        desc="Append-only: a aplicação tem INSERT e SELECT, nunca UPDATE ou DELETE. Purga acontece por job, registrando o que foi removido."
      />
      <div className="flex gap-2 items-center">
        <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar por ação, entidade ou detalhe…" className="max-w-md" />
        <Btn
          tone="ghost"
          onClick={() =>
            exportCsv(
              "auditoria",
              rows.map((a) => [a.at, a.action, a.entityType, a.entityUid, a.detail, a.ip]),
              ["Data", "Ação", "Entidade", "UID", "Detalhe", "IP"],
            )
          }
        >
          Exportar CSV
        </Btn>
        <span className="ml-auto font-mono text-[12px] text-[#8d897e]">{rows.length} eventos</span>
      </div>
      <Panel className="overflow-hidden">
        {rows.length === 0 ? (
          <Empty text="Sem eventos. Execute uma ação em qualquer módulo e ela aparecerá aqui." />
        ) : (
          <Table head={["Quando", "Ação", "Entidade", "UID", "Usuário", "IP", "Detalhe"]}>
            {rows.map((a) => (
              <Tr key={a.id}>
                <Td mono muted>{timeBr(a.at)}</Td>
                <Td mono>{a.action}</Td>
                <Td muted mono>{a.entityType}</Td>
                <Td muted mono>{a.entityUid}</Td>
                <Td muted>{s.users.find((u) => u.id === a.userId)?.name ?? "sistema"}</Td>
                <Td muted mono>{a.ip}</Td>
                <Td muted>{a.detail}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}

export function Lgpd() {
  const { s, setConsent, revokeConsent, openRequest, closeRequest } = useCrm();
  const [client, setClient] = useState(s.clients[0]?.uid ?? "");
  const [purpose, setPurpose] = useState("Comunicações comerciais");
  const [basis, setBasis] = useState("Consentimento");
  const [kind, setKind] = useState<"acesso" | "correcao" | "exclusao" | "anonimizacao" | "portabilidade">("acesso");

  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="LGPD"
        title="Privacidade e titular"
        desc="Minimização, base legal versionada e atendimento ao titular com prazo. Documento é mascarado na interface; a anonimização preserva o fato econômico."
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Panel className="p-5">
          <p className="font-serif text-xl mb-4">Consentimentos</p>
          <div className="grid sm:grid-cols-3 gap-2">
            <Select value={client} onChange={(e) => setClient(e.target.value)}>
              {s.clients.map((c) => (
                <option key={c.uid} value={c.uid}>{c.name}</option>
              ))}
            </Select>
            <Select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {["Comunicações comerciais", "Marketing por e-mail", "Análise de crédito"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
            <Select value={basis} onChange={(e) => setBasis(e.target.value)}>
              {["Consentimento", "Legítimo interesse", "Execução de contrato", "Obrigação legal"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>
          </div>
          <Btn className="mt-3" onClick={() => setConsent(client, purpose, basis)}>Registrar consentimento</Btn>
          <div className="mt-5 space-y-2">
            {s.consents.map((c) => (
              <div key={c.id} className="rounded-xl border border-white/8 p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[13px]">
                    {s.clients.find((x) => x.uid === c.clientUid)?.name} · {c.purpose}
                  </p>
                  <p className="font-mono text-[11px] text-[#8d897e]">
                    {c.legalBasis} · política {c.policyVersion} · {dateBr(c.grantedAt)}
                  </p>
                </div>
                {c.revokedAt ? (
                  <Badge tone="red">revogado {dateBr(c.revokedAt)}</Badge>
                ) : (
                  <button onClick={() => revokeConsent(c.id)} className="text-[12px] text-[#c9a36a]">revogar</button>
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <p className="font-serif text-xl mb-4">Solicitações do titular</p>
          <div className="grid sm:grid-cols-[1fr_180px_auto] gap-2 items-end">
            <Select value={client} onChange={(e) => setClient(e.target.value)}>
              {s.clients.map((c) => (
                <option key={c.uid} value={c.uid}>{c.name}</option>
              ))}
            </Select>
            <Select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
              {(["acesso", "correcao", "exclusao", "anonimizacao", "portabilidade"] as const).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </Select>
            <Btn onClick={() => openRequest(client, kind)}>Abrir</Btn>
          </div>
          <div className="mt-5 space-y-2">
            {s.dataRequests.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/8 p-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-[13px]">
                    {s.clients.find((x) => x.uid === r.clientUid)?.name} · {r.kind}
                  </p>
                  <p className="font-mono text-[11px] text-[#8d897e]">
                    aberta {dateBr(r.openedAt)} · prazo {dateBr(r.dueAt)}
                  </p>
                </div>
                <Badge tone={r.status === "concluida" ? "lime" : "gold"}>{r.status}</Badge>
                {r.status !== "concluida" && (
                  <button onClick={() => closeRequest(r.id)} className="text-[12px] text-[#c8f54a]">concluir</button>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <div className="p-5 border-b border-white/8">
          <p className="font-serif text-xl">Dados pessoais (minimizados na tela)</p>
        </div>
        <Table head={["Titular", "Documento", "E-mail", "Telefone", "Cidade"]}>
          {s.clients.map((c) => (
            <Tr key={c.uid}>
              <Td>{c.name}</Td>
              <Td mono muted>{maskDoc(c.document)}</Td>
              <Td muted>{c.email || "—"}</Td>
              <Td muted>{c.phone || "—"}</Td>
              <Td muted>{c.city || "—"}</Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}

export function SettingsView() {
  const { s, saveSettings, runBackup, resetDemo, permits, me, exportBackup, importBackup, seedDemo, wipeAll } = useCrm();
  const st = s.settings;
  const [form, setForm] = useState(st);
  const [importing, setImporting] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);
  const [confirmWipe, setConfirmWipe] = useState(false);

  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="PLATAFORMA"
        title="Configurações"
        desc="Alterações críticas exigem settings.manage e são registradas em auditoria."
      />
      <Panel className="p-6 grid sm:grid-cols-2 gap-4">
        <Field label="Nome do sistema">
          <Input value={form.systemName} onChange={(e) => setForm({ ...form, systemName: e.target.value })} />
        </Field>
        <Field label="Fuso horário">
          <Select value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
            <option value="America/Sao_Paulo">America/Sao_Paulo</option>
            <option value="UTC">UTC</option>
          </Select>
        </Field>
        <Field label="Moeda">
          <Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
          </Select>
        </Field>
        <Field label="Inatividade da sessão (min)">
          <Input type="number" value={form.sessionIdle} onChange={(e) => setForm({ ...form, sessionIdle: Number(e.target.value) })} />
        </Field>
        <Field label="Senha mínima">
          <Input type="number" value={form.passwordMin} onChange={(e) => setForm({ ...form, passwordMin: Number(e.target.value) })} />
        </Field>
        <Field label="Tentativas de login antes do bloqueio">
          <Input type="number" value={form.maxLoginAttempts} onChange={(e) => setForm({ ...form, maxLoginAttempts: Number(e.target.value) })} />
        </Field>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Btn onClick={() => saveSettings(form)}>Salvar configurações</Btn>
          <Btn tone="ghost" onClick={runBackup}>Simular backup diário</Btn>
          <Btn tone="ghost" onClick={resetDemo}>Restaurar demonstração</Btn>
        </div>
        {!permits("settings.manage") && (
          <p className="sm:col-span-2 text-[13px] text-[#ff8b7a]">
            Seu papel ({me()?.role}) não tem settings.manage: o salvamento será recusado no servidor.
          </p>
        )}
      </Panel>

      <Panel className="p-6">
        <p className="font-serif text-xl mb-2">Backup, restauração e dados</p>
        <p className="text-[13px] text-[#8d897e] mb-4 leading-relaxed">
          Exporte um JSON completo do ambiente (usuários, clientes, pipeline, vendas, auditoria etc.) para guardar em
          local seguro. A restauração substitui o estado atual pelo do arquivo. Toda operação vai para auditoria.
        </p>
        <div className="flex flex-wrap gap-2">
          <Btn onClick={exportBackup}>Exportar backup (JSON)</Btn>
          <Btn tone="ghost" onClick={() => setImporting(true)}>Importar backup</Btn>
          <Btn tone="ghost" onClick={() => { seedDemo(); setRestoreMsg("Dados de demonstração recarregados."); }}>
            Recarregar dados de exemplo
          </Btn>
          <Btn tone="danger" onClick={() => setConfirmWipe(true)}>Zerar ambiente</Btn>
        </div>
        {restoreMsg && <p className="text-[13px] text-[#c8f54a] mt-3">{restoreMsg}</p>}
      </Panel>

      {importing && (
        <Modal title="Importar backup" onClose={() => setImporting(false)}>
          <p className="text-[13px] text-[#8d897e] mb-3 leading-relaxed">
            Selecione o arquivo JSON exportado pelo CRM. A restauração é imediata e substitui todos os dados atuais.
          </p>
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = () => {
                const r = importBackup(String(reader.result ?? ""));
                setRestoreMsg(r.msg);
                if (r.ok) setImporting(false);
              };
              reader.readAsText(f);
            }}
            className="block w-full text-[13px] text-[#efe8db] file:mr-3 file:rounded-full file:border-0 file:bg-[#c8f54a] file:text-[#0b0c0a] file:px-4 file:py-2 file:font-medium"
          />
          <div className="flex gap-2 mt-4">
            <Btn tone="ghost" onClick={() => setImporting(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      {confirmWipe && (
        <Modal title="Zerar ambiente" onClose={() => setConfirmWipe(false)}>
          <p className="text-[13.5px] text-[#cfc9bc] leading-relaxed">
            Todos os dados serão apagados e o CRM voltará ao onboarding inicial. Esta ação não pode ser desfeita —
            faça um backup antes.
          </p>
          <div className="flex gap-2 mt-5">
            <Btn tone="danger" onClick={() => { wipeAll(); setConfirmWipe(false); }}>Zerar tudo</Btn>
            <Btn tone="ghost" onClick={() => setConfirmWipe(false)}>Cancelar</Btn>
          </div>
        </Modal>
      )}

      <Panel className="p-6">
        <p className="font-serif text-xl mb-3">Fila (jobs)</p>
        {s.jobs.length === 0 ? (
          <Empty text="Nenhum job enfileirado." />
        ) : (
          <Table head={["Job", "Fila", "Status", "Criado"]}>
            {s.jobs.map((j) => (
              <Tr key={j.id}>
                <Td mono>{j.name}</Td>
                <Td muted mono>{j.queue}</Td>
                <Td><Badge tone={j.status === "done" ? "lime" : "gold"}>{j.status}</Badge></Td>
                <Td muted mono>{timeBr(j.createdAt)}</Td>
              </Tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
