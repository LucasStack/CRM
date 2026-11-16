import { useMemo, useState } from "react";
import { ROLES } from "../rbac";
import { useCrm } from "../store";
import { Badge, Btn, Empty, Field, Input, PageTitle, Panel, Table, Td, Tr, timeBr } from "../ui";

export function Profile() {
  const { me, s, changePassword, toggleTwoFactor, updateProfile, session, logout } = useCrm();
  const u = me()!;
  const [name, setName] = useState(u.name);
  const [email, setEmail] = useState(u.email);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; msg: string } | null>(null);

  const [enrolling, setEnrolling] = useState(false);
  const [code, setCode] = useState("");
  const [twoFaMsg, setTwoFaMsg] = useState<string | null>(null);

  // "Secret" simulado (em produção sai do sodium). Determinístico para o usuário.
  const secret = useMemo(() => {
    const s = "JBSWY3DPEHPK3PXP" + u.uid.toUpperCase().replace(/[^A-Z0-9]/g, "");
    return s.slice(0, 32);
  }, [u.uid]);

  const strength = pwStrength(next);
  const own = s.audit.filter((a) => a.userId === u.id).slice(0, 10);

  return (
    <div className="space-y-6 rise">
      <PageTitle
        kicker="MINHA CONTA"
        title="Perfil e segurança"
        desc="Gerencie seus dados, senha, 2FA e veja a atividade recente da sua conta."
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel className="p-6">
          <p className="font-serif text-xl mb-4">Dados pessoais</p>
          <div className="grid gap-4">
            <Field label="Nome">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="E-mail">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/8 p-3">
                <p className="font-mono text-[10px] text-[#8d897e]">PAPEL</p>
                <p className="text-[13.5px] mt-1">{ROLES[u.role].label}</p>
              </div>
              <div className="rounded-xl border border-white/8 p-3">
                <p className="font-mono text-[10px] text-[#8d897e]">ESCOPO</p>
                <p className="text-[13.5px] mt-1 font-mono">{ROLES[u.role].scope}</p>
              </div>
            </div>
            <Btn onClick={() => updateProfile({ name, email })}>Salvar perfil</Btn>
          </div>
        </Panel>

        <Panel className="p-6">
          <p className="font-serif text-xl mb-4">Alterar senha</p>
          <div className="grid gap-4">
            <Field label="Senha atual">
              <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </Field>
            <Field label="Nova senha">
              <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
            </Field>
            <Field label="Confirmar nova senha">
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </Field>

            <div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-full flex-1"
                    style={{
                      background: i < strength.score ? strength.color : "transparent",
                      marginRight: i < 3 ? 2 : 0,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="font-mono text-[10px] text-[#8d897e]">força: {strength.label}</span>
                <span className="font-mono text-[10px] text-[#8d897e]">mín {s.settings.passwordMin}</span>
              </div>
            </div>

            {pwMsg && (
              <p
                className={`text-[13px] rounded-xl border p-3 ${
                  pwMsg.ok
                    ? "text-[#c8f54a] border-[#c8f54a]/30 bg-[#c8f54a]/8"
                    : "text-[#ff8b7a] border-[#ff6b5a]/30 bg-[#ff6b5a]/8"
                }`}
              >
                {pwMsg.msg}
              </p>
            )}
            <Btn
              onClick={() => {
                const r = changePassword(current, next, confirm);
                setPwMsg(r);
                if (r.ok) {
                  setCurrent("");
                  setNext("");
                  setConfirm("");
                }
              }}
            >
              Atualizar senha
            </Btn>
          </div>
        </Panel>

        <Panel className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="font-serif text-xl">Autenticação em dois fatores</p>
              <p className="text-[13px] text-[#8d897e] mt-1">
                {u.twoFactor
                  ? "TOTP ativo. Códigos gerados a cada 30 segundos pelo seu app autenticador."
                  : "Ative para exigir um código de 6 dígitos além da senha em cada login."}
              </p>
            </div>
            <Badge tone={u.twoFactor ? "lime" : "fog"}>{u.twoFactor ? "ativo" : "desativado"}</Badge>
          </div>

          {!u.twoFactor && !enrolling && (
            <Btn onClick={() => setEnrolling(true)}>Ativar 2FA</Btn>
          )}

          {!u.twoFactor && enrolling && (
            <div className="grid md:grid-cols-[240px_1fr] gap-6 items-start">
              <QrPlaceholder secret={secret} />
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.14em] text-[#8d897e] uppercase">Secret</p>
                  <p className="font-mono text-[12.5px] text-[#c9a36a] break-all mt-1">{secret}</p>
                  <p className="text-[12px] text-[#8d897e] mt-2 leading-relaxed">
                    No app (Authy, 1Password, Google Authenticator, Aegis…), escaneie o QR ou digite o código acima.
                  </p>
                </div>
                <Field label="Código gerado pelo app">
                  <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" />
                </Field>
                {twoFaMsg && <p className="text-[13px] text-[#ff8b7a]">{twoFaMsg}</p>}
                <div className="flex gap-2">
                  <Btn
                    onClick={() => {
                      const r = toggleTwoFactor(true, code);
                      if (!r.ok) return setTwoFaMsg(r.msg);
                      setEnrolling(false);
                      setCode("");
                      setTwoFaMsg(null);
                    }}
                  >
                    Ativar
                  </Btn>
                  <Btn tone="ghost" onClick={() => { setEnrolling(false); setCode(""); setTwoFaMsg(null); }}>
                    Cancelar
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {u.twoFactor && (
            <div className="flex items-center gap-3">
              <Btn tone="ghost" onClick={() => toggleTwoFactor(false)}>Desativar 2FA</Btn>
              <span className="text-[12px] text-[#8d897e]">
                Em produção, desativar exige reautenticação por senha.
              </span>
            </div>
          )}
        </Panel>

        <Panel className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="font-serif text-xl">Sessões ativas</p>
            <Btn tone="ghost" onClick={() => logout("encerrado pelo usuário no painel de perfil")}>
              Encerrar esta sessão
            </Btn>
          </div>
          <Table head={["Dispositivo", "Início", "Última atividade", "IP", "Status"]}>
            <Tr>
              <Td>Este navegador · {navigator.userAgent.split(" ")[0]}</Td>
              <Td muted mono>{session ? timeBr(new Date(session.issuedAt).toISOString()) : "—"}</Td>
              <Td muted mono>{session ? timeBr(new Date(session.lastSeen).toISOString()) : "—"}</Td>
              <Td muted mono>203.0.113.42</Td>
              <Td><Badge tone="lime">atual</Badge></Td>
            </Tr>
          </Table>
        </Panel>

        <Panel className="p-6 lg:col-span-2 overflow-hidden">
          <p className="font-serif text-xl mb-3">Atividade recente da minha conta</p>
          {own.length === 0 ? (
            <Empty text="Nada a exibir." />
          ) : (
            <Table head={["Quando", "Ação", "Entidade", "Detalhe", "IP"]}>
              {own.map((a) => (
                <Tr key={a.id}>
                  <Td muted mono>{timeBr(a.at)}</Td>
                  <Td mono>{a.action}</Td>
                  <Td muted mono>{a.entityType}</Td>
                  <Td muted>{a.detail}</Td>
                  <Td muted mono>{a.ip}</Td>
                </Tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>
    </div>
  );
}

function pwStrength(pw: string) {
  let n = 0;
  if (pw.length >= 8) n++;
  if (pw.length >= 12) n++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) n++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) n++;
  const map = [
    { label: "sem senha", color: "transparent" },
    { label: "fraca", color: "#ff6b5a" },
    { label: "razoável", color: "#e8d5a8" },
    { label: "forte", color: "#c9a36a" },
    { label: "excelente", color: "#c8f54a" },
  ];
  return { score: n, ...map[n] };
}

function QrPlaceholder({ secret }: { secret: string }) {
  const bits = Array.from({ length: 25 * 25 }, (_, i) => {
    let h = 0;
    const key = secret + i;
    for (let j = 0; j < key.length; j++) h = (h * 31 + key.charCodeAt(j)) & 0xffffffff;
    return (h & 1) === 1;
  });
  return (
    <div className="rounded-2xl border border-white/10 bg-white p-3 w-fit">
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(25, 8px)", gridAutoRows: "8px", gap: 0 }}
      >
        {bits.map((b, i) => (
          <div key={i} style={{ background: b ? "#0b0c0a" : "#ffffff", width: 8, height: 8 }} />
        ))}
      </div>
      <p className="text-center font-mono text-[9px] text-[#0b0c0a] mt-2">simulação visual · não escanear</p>
    </div>
  );
}
