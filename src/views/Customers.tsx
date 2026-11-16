import { useState } from "react";
import { addresses, customers } from "../data/seed";
import { dateBr, maskCpf, validateCpf } from "../lib/format";
import { Badge, Field, Input, Panel, PrimaryBtn } from "../ui/primitives";
import { useStore } from "../state/Store";

export function Customers() {
  const { query, notify } = useStore();
  const [cpf, setCpf] = useState("");
  const rows = customers.filter((c) => {
    const q = query.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.email.includes(q);
  });
  const valid = cpf.replace(/\D/g, "").length === 11 ? validateCpf(cpf) : null;

  return (
    <div className="space-y-6 rise">
      <div>
        <p className="font-mono text-[11px] tracking-[0.22em] text-[#c9a36a]">IDENTIDADE</p>
        <h1 className="font-serif text-4xl mt-1">Clientes & IDT</h1>
        <p className="text-sm text-[#8d897e] mt-2 max-w-2xl">
          CPF é validado pelos dígitos verificadores no cadastro, depois HMAC + pepper. Persistimos hash e os 2 últimos dígitos — nunca o documento cru.
        </p>
      </div>

      <Panel className="p-5 grid md:grid-cols-[1fr_auto] gap-4 items-end">
        <Field label="Simular validação de CPF">
          <Input
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
        </Field>
        <PrimaryBtn
          type="button"
          onClick={() =>
            notify(
              valid
                ? `CPF válido · UI ${maskCpf(cpf)} · hash HMAC no cofre`
                : "CPF inválido — cadastro bloqueado",
            )
          }
        >
          Validar IDT
        </PrimaryBtn>
        {valid !== null && (
          <p className="md:col-span-2 text-sm">
            {valid ? (
              <Badge tone="lime">válido · {maskCpf(cpf)}</Badge>
            ) : (
              <Badge tone="red">dígitos verificadores falharam</Badge>
            )}
          </p>
        )}
      </Panel>

      <Panel className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left font-mono text-[10px] tracking-[0.14em] text-[#8d897e] border-b border-white/8">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">IDT máscara</th>
              <th className="px-4 py-3 font-medium">Hash</th>
              <th className="px-4 py-3 font-medium">Endereço</th>
              <th className="px-4 py-3 font-medium">Desde</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const adr = addresses.find((a) => a.ownerId === c.id);
              return (
                <tr key={c.id} className="border-b border-white/5">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3 text-[#b7b3a8]">{c.email}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.idtMasked}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#c9a36a]">{c.idtHash}</td>
                  <td className="px-4 py-3 text-xs text-[#b7b3a8]">
                    {adr ? `${adr.city}/{adr.state}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">{dateBr(c.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
