const digits = (v: string) => v.replace(/\D/g, "");

export function validateCpf(raw: string): boolean {
  const c = digits(raw);
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  const dv = (base: number) => {
    let sum = 0;
    for (let i = 0; i < base; i++) sum += Number(c[i]) * (base + 1 - i);
    const m = (sum * 10) % 11;
    return m === 10 ? 0 : m;
  };
  return dv(9) === Number(c[9]) && dv(10) === Number(c[10]);
}

export function validateCnpj(raw: string): boolean {
  const c = digits(raw);
  if (c.length !== 14 || /^(\d)\1{13}$/.test(c)) return false;
  const calc = (len: number) => {
    let pos = len - 7;
    let sum = 0;
    for (let i = 0; i < len; i++) {
      sum += Number(c[i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(c[12]) && calc(13) === Number(c[13]);
}

export function validateDoc(raw: string, kind: "PF" | "PJ"): boolean {
  return kind === "PF" ? validateCpf(raw) : validateCnpj(raw);
}

export function maskDoc(raw: string): string {
  const d = digits(raw);
  if (d.length === 11) return `***.***.***-${d.slice(9)}`;
  if (d.length === 14) return `**.***.***/****-${d.slice(12)}`;
  return raw;
}

export function normalizePhone(raw: string): string {
  const d = digits(raw);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw;
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
}
