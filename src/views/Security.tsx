import { useEffect, useState } from "react";
import { mintTokens } from "../lib/format";
import { useStore } from "../state/Store";
import { Badge, GhostBtn, Panel, PrimaryBtn } from "../ui/primitives";

export function Security() {
  const { session, rotateRefresh, notify } = useStore();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const remain = session ? Math.max(0, session.accessTtlMs - (now - session.issuedAt)) : 0;
  const secs = Math.floor(remain / 1000);
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  const pct = session ? remain / session.accessTtlMs : 0;

  return (
    <div className="space-y-8 rise">
      <div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">TRUST BOUNDARY</p>
        <h1 className="font-serif text-4xl mt-1">Auth, senha e segredos</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel className="p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] text-[#8d897e]">ACCESS TOKEN · 12 MIN</p>
            <Badge tone={secs < 60 ? "red" : "lime"}>{mm}:{ss}</Badge>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-[#c8f54a]" style={{ width: `${pct * 100}%` }} />
          </div>
          <pre className="mt-4 text-[10px] leading-relaxed text-[#c9a36a] whitespace-pre-wrap break-all font-mono">
            {session?.accessToken}
          </pre>
          <p className="text-xs text-[#8d897e] mt-3">RS256 · kid nexo-auth-1 · aud nexo.api · cookie não se aplica no demo SPA.</p>
        </Panel>
        <Panel className="p-6">
          <p className="font-mono text-[10px] text-[#8d897e]">REFRESH · 14 D · ROTAÇÃO</p>
          <pre className="mt-4 text-[10px] leading-relaxed text-[#efe8db]/70 whitespace-pre-wrap break-all font-mono">
            {session?.refreshToken}
          </pre>
          <div className="flex gap-2 mt-5">
            <PrimaryBtn onClick={rotateRefresh}>Rotacionar família</PrimaryBtn>
            <GhostBtn
              onClick={() => {
                const t = mintTokens(session?.email ?? "iris.p@example.org");
                notify(`Reuse detectado em ${t.refreshToken.slice(-12)} — família fam_7c2 revogada.`);
              }}
            >
              Simular reuse
            </GhostBtn>
          </div>
          <p className="text-xs text-[#8d897e] mt-3">
            Reuso de refresh antigo invalida a família inteira. Isso corta token furtado mesmo depois de um leak pontual.
          </p>
        </Panel>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { n: "01", t: "Normaliza", d: "trim, NFC, limita 72 bytes. Recusa senha vazada (k-anonymity HIBP)." },
          { n: "02", t: "Pepper", d: "HMAC-SHA256 com chave no Secrets Manager. Pepper nunca no código nem no banco." },
          { n: "03", t: "Argon2id", d: "m=64MB, t=3, p=1. Hash no disco. Pepper fora. Salt único por usuário." },
        ].map((s) => (
          <Panel key={s.n} className="p-5">
            <p className="font-mono text-[#c9a36a] text-xs">{s.n}</p>
            <h3 className="font-serif text-2xl mt-1">{s.t}</h3>
            <p className="text-sm text-[#b7b3a8] mt-2 leading-relaxed">{s.d}</p>
          </Panel>
        ))}
      </div>

      <Panel className="p-6">
        <h3 className="font-serif text-2xl">Pagamento e dados pessoais</h3>
        <div className="grid md:grid-cols-2 gap-6 mt-4 text-sm text-[#b7b3a8] leading-relaxed">
          <ul className="space-y-2">
            <li>— Cartão: token do gateway. Sem PAN, sem CVV, sem trilha.</li>
            <li>— Pix: copia-e-cola gerado na intent; expira em 30 min.</li>
            <li>— Webhook com assinatura HMAC e idempotency-key.</li>
          </ul>
          <ul className="space-y-2">
            <li>— CPF: valida dígitos → HMAC → máscara na UI.</li>
            <li>— Endereço cifrado em coluna (AES-GCM, KMS).</li>
            <li>— Audit log append-only (quem leu o quê).</li>
          </ul>
        </div>
      </Panel>
    </div>
  );
}
