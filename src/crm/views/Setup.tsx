import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useCrm } from "../store";
import { Badge, Btn, Field, Input, Panel, Select } from "../ui";

const STEPS = ["Empresa", "Administrador", "Preferências", "Dados iniciais"] as const;

export function Setup({ onExit }: { onExit: () => void }) {
  const { completeSetup } = useCrm();
  const [step, setStep] = useState(0);

  const [company, setCompany] = useState("Minha Empresa");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [currency, setCurrency] = useState("BRL");

  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminConfirm, setAdminConfirm] = useState("");

  const [startEmpty, setStartEmpty] = useState(false);
  const [accept, setAccept] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canNext = () => {
    setErr(null);
    if (step === 0 && company.trim().length < 2) return setErr("Informe o nome da empresa."), false;
    if (step === 1) {
      if (adminName.trim().length < 3) return setErr("Informe seu nome completo."), false;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(adminEmail)) return setErr("E-mail inválido."), false;
      if (adminPass.length < 10) return setErr("Senha mínima de 10 caracteres."), false;
      if (!/[A-Z]/.test(adminPass) || !/[0-9]/.test(adminPass) || !/[^A-Za-z0-9]/.test(adminPass))
        return setErr("Use maiúscula, número e símbolo."), false;
      if (adminPass !== adminConfirm) return setErr("As senhas não coincidem."), false;
    }
    return true;
  };

  const finish = () => {
    if (!accept) return setErr("Aceite a política para concluir a instalação.");
    completeSetup({ company, adminName, adminEmail, adminPass, timezone, currency, startEmpty });
  };

  return (
    <div className="min-h-screen bg-[#0b0c0a] text-[#efe8db] grid lg:grid-cols-[420px_1fr]">
      <aside className="hidden lg:flex flex-col justify-between p-8 border-r border-white/8 relative overflow-hidden">
        <div className="absolute inset-0 grid-fine opacity-40" />
        <div className="relative">
          <button onClick={onExit} className="flex items-center gap-2 text-[12px] text-[#8d897e] hover:text-[#c8f54a]">
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao site
          </button>
        </div>
        <div className="relative">
          <p className="font-mono text-[11px] tracking-[0.24em] text-[#c9a36a]">INSTALAÇÃO</p>
          <h1 className="font-serif text-4xl mt-3 leading-tight">
            Configuração inicial
            <br />
            <span className="italic text-[#c9a36a]">em 4 passos.</span>
          </h1>
          <p className="mt-5 text-[#b7b3a8] leading-relaxed">
            Ao final, você entra direto no console como Super Administrador e o instalador é bloqueado.
          </p>
        </div>
        <ol className="relative space-y-3">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <span
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-mono ${
                  i < step
                    ? "border-[#c8f54a] bg-[#c8f54a] text-[#0b0c0a]"
                    : i === step
                    ? "border-[#c9a36a] text-[#c9a36a]"
                    : "border-white/10 text-[#8d897e]"
                }`}
              >
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              <span className={`text-[13px] ${i === step ? "text-[#efe8db]" : "text-[#8d897e]"}`}>{s}</span>
            </li>
          ))}
        </ol>
      </aside>

      <main className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-lg">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[#c9a36a] uppercase">
            Passo {step + 1} de {STEPS.length}
          </p>
          <h2 className="font-serif text-3xl mt-2 mb-6">{STEPS[step]}</h2>

          {step === 0 && (
            <div className="space-y-4">
              <Field label="Nome da empresa (aparece no topo do sistema)">
                <Input value={company} onChange={(e) => setCompany(e.target.value)} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Panel className="p-4 border-[#c9a36a]/30">
                <p className="text-[13px] text-[#cfc9bc] leading-relaxed">
                  Esta conta será <strong>Super Administrador</strong>. Guarde a senha em local seguro — não há como
                  recuperá-la sem outro admin autenticado.
                </p>
              </Panel>
              <Field label="Nome completo">
                <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} />
              </Field>
              <Field label="E-mail">
                <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Senha (mín. 10, com maiúscula, número e símbolo)">
                  <Input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} />
                </Field>
                <Field label="Confirmar senha">
                  <Input type="password" value={adminConfirm} onChange={(e) => setAdminConfirm(e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Field label="Fuso horário da operação">
                <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                  <option value="America/Manaus">America/Manaus</option>
                  <option value="America/Belem">America/Belem</option>
                  <option value="America/Fortaleza">America/Fortaleza</option>
                  <option value="UTC">UTC</option>
                </Select>
              </Field>
              <Field label="Moeda padrão">
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="BRL">Real (BRL)</option>
                  <option value="USD">Dólar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </Select>
              </Field>
              <p className="text-[12.5px] text-[#8d897e] leading-relaxed">
                Timestamps são armazenados em UTC. A conversão para o fuso da operação acontece só na exibição.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-[14px] text-[#cfc9bc]">Como quer começar?</p>
              <button
                onClick={() => setStartEmpty(false)}
                className={`w-full text-left rounded-2xl border p-4 transition ${
                  !startEmpty ? "border-[#c8f54a] bg-[#c8f54a]/6" : "border-white/10 hover:border-[#c9a36a]/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Badge tone={!startEmpty ? "lime" : "fog"}>recomendado</Badge>
                  <p className="font-serif text-lg">Com dados de exemplo</p>
                </div>
                <p className="text-[13px] text-[#8d897e] mt-1.5">
                  Clientes, leads, funil, propostas e vendas fictícios para você explorar tudo antes de importar seus dados reais.
                </p>
              </button>
              <button
                onClick={() => setStartEmpty(true)}
                className={`w-full text-left rounded-2xl border p-4 transition ${
                  startEmpty ? "border-[#c8f54a] bg-[#c8f54a]/6" : "border-white/10 hover:border-[#c9a36a]/40"
                }`}
              >
                <p className="font-serif text-lg">Ambiente em branco</p>
                <p className="text-[13px] text-[#8d897e] mt-1.5">
                  Só a sua conta admin. Você importa a base ou começa do zero. Ideal para produção.
                </p>
              </button>

              <label className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={accept}
                  onChange={(e) => setAccept(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-[13px] text-[#cfc9bc] leading-relaxed">
                  Declaro estar ciente de que sou o controlador dos dados que serão inseridos neste sistema e que
                  a base legal de cada tratamento (LGPD) é decisão minha.
                </span>
              </label>
            </div>
          )}

          {err && (
            <p className="mt-4 rounded-xl border border-[#ff6b5a]/30 bg-[#ff6b5a]/8 p-3 text-[13px] text-[#ff8b7a]">
              {err}
            </p>
          )}

          <div className="flex justify-between mt-8">
            <Btn tone="ghost" onClick={() => (step === 0 ? onExit() : setStep(step - 1))}>
              <ArrowLeft className="w-3.5 h-3.5" /> {step === 0 ? "Cancelar" : "Voltar"}
            </Btn>
            {step < STEPS.length - 1 ? (
              <Btn onClick={() => canNext() && setStep(step + 1)}>
                Continuar <ArrowRight className="w-3.5 h-3.5" />
              </Btn>
            ) : (
              <Btn onClick={finish}>
                Concluir instalação <Check className="w-3.5 h-3.5" />
              </Btn>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
