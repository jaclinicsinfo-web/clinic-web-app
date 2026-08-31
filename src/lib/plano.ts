import type { CodigoPlano, PlanoAtual, UsoUsuarios } from "@/types";

export const LIMITES_PLANO: Record<CodigoPlano, number | null> = {
  essencial: 5,
  profissional: 20,
  ilimitado: null,
};

export function nomeDoPlano(codigo: CodigoPlano) {
  if (codigo === "essencial") return "Essencial";
  if (codigo === "profissional") return "Profissional";
  return "Ilimitado";
}

export function valorLimite(limite: number | null) {
  return limite === null ? Number.POSITIVE_INFINITY : limite;
}

export function planoEstaAcimaDoTeto(uso: UsoUsuarios | null) {
  if (!uso || uso.limite === null) return false;
  return uso.usados > uso.limite;
}

export function excedenteUsuarios(uso: UsoUsuarios | null) {
  if (!uso || uso.limite === null) return 0;
  return Math.max(0, uso.usados - uso.limite);
}

export function rotuloUso(uso: UsoUsuarios | null) {
  if (!uso) return "";
  if (uso.limite === null) return `${uso.usados} usuário${uso.usados === 1 ? "" : "s"} · sem limite`;
  return `${uso.usados} de ${uso.limite} usuário${uso.limite === 1 ? "" : "s"}`;
}

export function comparouPlanos(
  anterior: PlanoAtual | null | undefined,
  atual: PlanoAtual,
): "upgrade" | "downgrade" | "igual" {
  if (!anterior || anterior.codigo === atual.codigo) return "igual";
  const antes = valorLimite(anterior.limiteUsuarios);
  const agora = valorLimite(atual.limiteUsuarios);
  if (agora > antes) return "upgrade";
  if (agora < antes) return "downgrade";
  return "igual";
}

export function isAdministrador(perfil: string | undefined) {
  return perfil === "Administrador";
}

export function isGestor(perfil: string | undefined) {
  return perfil === "Gestor";
}

export function isAdminOuGestor(perfil: string | undefined) {
  return isAdministrador(perfil) || isGestor(perfil);
}

export function isProfissionalSaude(perfil: string | undefined) {
  return perfil === "Profissional de saúde";
}
