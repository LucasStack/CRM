import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { useStore } from "../state/Store";
import { Field, GhostBtn, Input, PrimaryBtn } from "../ui/primitives";

export function Login() {
  const { login, setRoute } = useStore();
  const [email, setEmail] = useState("iris.p@example.org");
  const [password, setPassword] = useState("••••••••••••");
  const [busy, setBusy] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    window.setTimeout(() => login(email), 700);
  };

  return (
    <div className="min-h-screen bg-[#0b0c0a] text-[#efe8db] grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-10 border-r border-white/8 relative overflow-hidden">
        <div className="absolute inset-0 grid-fine opacity-50" />
        <div className="relative">
          <button onClick={() => setRoute("landing")} className="flex items-center gap-2 text-sm text-[#8d897e] hover:text-[#c9a36a]">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>
        <div className="relative">
          <img src="/images/nexo-mark.png" alt="" className="w-16 h-16 rounded-2xl mb-8 border border-[#c9a36a]/30" />
          <h1 className="font-serif text-5xl leading-tight">
            Sessão curta.
            <br />
            <span className="italic text-[#c9a36a]">Segredo longo.</span>
          </h1>
          <p className="mt-5 text-[#b7b3a8] max-w-sm leading-relaxed">
            Access token de 12 minutos. Refresh de 14 dias, rotacionado a cada uso. Senha nunca viaja em texto: Argon2id + pepper no cofre.
          </p>
        </div>
        <p className="relative font-mono text-[10px] tracking-[0.2em] text-[#8d897e]">RS256 · KID nexo-auth-1</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">CONSOLE</p>
            <h2 className="font-serif text-4xl mt-2">Entrar</h2>
          </div>
          <Field label="E-mail">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </Field>
          <Field label="Senha (hash + pepper no servidor)">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </Field>
          <PrimaryBtn type="submit" disabled={busy} className="w-full">
            {busy ? "Assinando JWT…" : "Emitir access + refresh"}
          </PrimaryBtn>
          <GhostBtn type="button" className="w-full" onClick={() => setRoute("landing")}>
            Cancelar
          </GhostBtn>
          <p className="text-xs text-[#8d897e] leading-relaxed">
            Demo local: qualquer senha autentica. Em produção o pepper sai do AWS Secrets Manager e o hash nunca é logado.
          </p>
        </form>
      </div>
    </div>
  );
}
