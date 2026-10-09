import type { AcessoGratuito } from "@/types";

export function lerAcessoGratuito(
  bruto: { expiraEm?: string | null } | null | undefined,
): AcessoGratuito | null {
  if (!bruto?.expiraEm) return null;
  const expira = new Date(bruto.expiraEm);
  if (Number.isNaN(expira.getTime()) || expira.getTime() <= Date.now()) return null;
  return { expiraEm: expira.toISOString() };
}

export function detalhesValidadeTeste(
  expiraEm: string | null | undefined,
  planoNome?: string | null,
  agora = Date.now(),
) {
  if (!expiraEm) return null;
  const expira = new Date(expiraEm);
  if (Number.isNaN(expira.getTime()) || expira.getTime() <= agora) return null;

  const data = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(expira);
  const dias = Math.ceil((expira.getTime() - agora) / (24 * 60 * 60 * 1000));

  return {
    data,
    dias,
    prazo: dias === 1 ? "1 dia" : `${dias} dias`,
    plano: planoNome?.trim() || null,
  };
}

export function mensagemValidadeTeste(
  expiraEm: string | null | undefined,
  planoNome?: string | null,
  agora = Date.now(),
): string | null {
  const detalhes = detalhesValidadeTeste(expiraEm, planoNome, agora);
  if (!detalhes) return null;
  const plano = detalhes.plano ? ` do plano ${detalhes.plano}` : "";
  return `Acesso teste${plano}, válido até ${detalhes.data}.`;
}
