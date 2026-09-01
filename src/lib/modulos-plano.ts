import type { CodigoPlano, ModuloSistema, PlanoAtual } from "@/types";

export const MODULOS_NUCLEO: ModuloSistema[] = [
  "dashboard",
  "pacientes",
  "agenda",
  "profissionais",
  "convenios",
  "configuracoes",
];

export const MODULOS_GESTAO: ModuloSistema[] = ["financeiro", "estoque", "relatorios"];

export const MODULOS_RESERVADOS: ModuloSistema[] = ["integracoes", "powerbi", "agenteia"];

export const LIMITES_UNIDADES: Record<CodigoPlano, number | null> = {
  essencial: 1,
  profissional: null,
  ilimitado: null,
};

export function modulosDoPlano(codigo: CodigoPlano): ModuloSistema[] {
  if (codigo === "ilimitado") return [...MODULOS_NUCLEO, ...MODULOS_GESTAO, ...MODULOS_RESERVADOS];
  if (codigo === "profissional") return [...MODULOS_NUCLEO, ...MODULOS_GESTAO];
  return [...MODULOS_NUCLEO];
}

export function planoIncluiModulo(plano: PlanoAtual | null | undefined, modulo: ModuloSistema): boolean {
  const codigo = plano?.codigo ?? "essencial";
  const lista = plano?.modulos?.length ? plano.modulos : modulosDoPlano(codigo);
  return lista.includes(modulo);
}

export function limiteUnidadesDoPlano(plano: PlanoAtual | null | undefined): number | null {
  if (!plano) return LIMITES_UNIDADES.essencial;
  if (plano.limiteUnidades !== undefined) return plano.limiteUnidades;
  return LIMITES_UNIDADES[plano.codigo];
}

export function planoMinimoDoModulo(modulo: ModuloSistema): CodigoPlano {
  if (MODULOS_RESERVADOS.includes(modulo)) return "ilimitado";
  if (MODULOS_GESTAO.includes(modulo)) return "profissional";
  return "essencial";
}

export function moduloEstaReservado(modulo: ModuloSistema): boolean {
  return MODULOS_RESERVADOS.includes(modulo);
}
