export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const compact = (n: number) =>
  n.toLocaleString("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

export const dateBr = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const timeBr = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

export function validateCpf(raw: string) {
  const cpf = raw.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calc = (base: number) => {
    let sum = 0;
    for (let i = 0; i < base; i++) sum += Number(cpf[i]) * (base + 1 - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

export function maskCpf(raw: string) {
  const d = raw.replace(/\D/g, "").padStart(11, "0").slice(0, 11);
  return `***.***.***-${d.slice(9)}`;
}

export function fakeHash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `sha256:${(h >>> 0).toString(16).padStart(8, "0")}…`;
}

export function b64url(obj: unknown) {
  const json = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function mintTokens(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url({ alg: "RS256", typ: "JWT", kid: "nexo-auth-1" });
  const access = b64url({
    sub: "usr_ops_01",
    email,
    role: "operator",
    iss: "nexo.auth",
    aud: "nexo.api",
    iat: now,
    exp: now + 12 * 60,
    jti: `at_${now.toString(36)}`,
  });
  const refresh = b64url({
    sub: "usr_ops_01",
    typ: "refresh",
    iat: now,
    exp: now + 14 * 24 * 3600,
    jti: `rt_${now.toString(36)}`,
    fam: "fam_7c2",
  });
  return {
    accessToken: `${header}.${access}.n3x0-rs256-sig`,
    refreshToken: `${header}.${refresh}.n3x0-rt-sig`,
  };
}
