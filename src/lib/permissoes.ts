import { navGroups } from "@/lib/navigation";
import { moduloVisivelForaDoPlano, planoIncluiModulo } from "@/lib/modulos-plano";
import { isAdministrador, isAdminOuGestor } from "@/lib/plano";
import type { AcaoPermissao, ModuloSistema, Permissao, PlanoAtual } from "@/types";

export const MODULOS: ModuloSistema[] = [
  "dashboard",
  "pacientes",
  "agenda",
  "profissionais",
  "financeiro",
  "convenios",
  "estoque",
  "relatorios",
  "rh",
  "configuracoes",
  "integracoes",
  "powerbi",
  "agenteia",
];

const ROTA_PARA_MODULO: Record<string, ModuloSistema> = {
  dashboard: "dashboard",
  pacientes: "pacientes",
  agenda: "agenda",
  profissionais: "profissionais",
  financeiro: "financeiro",
  convenios: "convenios",
  estoque: "estoque",
  relatorios: "relatorios",
  rh: "rh",
  configuracoes: "configuracoes",
  integracoes: "integracoes",
  "power-bi": "powerbi",
  "agente-ia": "agenteia",
};

export function normalizarPermissoes(raw: unknown): Permissao[] {
  const porModulo = new Map<string, Permissao>();

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const bruto = item as Partial<Permissao>;
      if (typeof bruto.modulo !== "string") continue;
      porModulo.set(bruto.modulo, {
        modulo: bruto.modulo as ModuloSistema,
        visualizar: Boolean(bruto.visualizar),
        criar: Boolean(bruto.criar),
        editar: Boolean(bruto.editar),
        excluir: Boolean(bruto.excluir),
      });
    }
  } else if (raw && typeof raw === "object") {
    for (const [modulo, acoes] of Object.entries(raw as Record<string, Partial<Permissao>>)) {
      porModulo.set(modulo, {
        modulo: modulo as ModuloSistema,
        visualizar: Boolean(acoes?.visualizar),
        criar: Boolean(acoes?.criar),
        editar: Boolean(acoes?.editar),
        excluir: Boolean(acoes?.excluir),
      });
    }
  }

  return MODULOS.map(
    (modulo) =>
      porModulo.get(modulo) ?? {
        modulo,
        visualizar: false,
        criar: false,
        editar: false,
        excluir: false,
      },
  );
}

export function temPermissao(
  permissoes: Permissao[] | undefined | null,
  modulo: ModuloSistema,
  acao: AcaoPermissao = "visualizar",
) {
  return Boolean(permissoes?.find((item) => item.modulo === modulo)?.[acao]);
}

export function moduloDaRota(pathname: string): ModuloSistema | null {
  const segmento = pathname.split("/").filter(Boolean)[0];
  return ROTA_PARA_MODULO[segmento] ?? null;
}

export function rotaExigeAdministrador(pathname: string) {
  return pathname.startsWith("/configuracoes/permissoes") || pathname.startsWith("/configuracoes/assinatura");
}

export function rotaExigeAdminOuGestor(pathname: string) {
  return pathname.startsWith("/configuracoes/usuarios");
}

function rotaExigeFinanceiroDoPlano(pathname: string) {
  if (pathname.startsWith("/configuracoes/pagamentos")) return true;
  if (/^\/pacientes\/[^/]+\/financeiro/.test(pathname)) return true;
  if (/^\/profissionais\/[^/]+\/comissoes/.test(pathname)) return true;
  return false;
}

export function primeiraRotaPermitida(permissoes: Permissao[] | undefined | null) {
  for (const grupo of navGroups) {
    for (const item of grupo.items) {
      if (temPermissao(permissoes, item.modulo)) return item.href;
    }
  }
  return "/dashboard";
}

function rotaForaDoEscopoProprio(pathname: string) {
  return (
    pathname.startsWith("/financeiro/contas-a-pagar") ||
    pathname.startsWith("/financeiro/convenios") ||
    pathname.startsWith("/configuracoes/usuarios") ||
    pathname.startsWith("/profissionais/novo")
  );
}

export function podeAcessarRota(
  pathname: string,
  permissoes: Permissao[] | undefined | null,
  perfilNome: string | undefined,
  plano?: PlanoAtual | null,
  isolarDados = false,
) {
  if (isolarDados && rotaForaDoEscopoProprio(pathname)) return false;
  if (rotaExigeAdministrador(pathname) && !isAdministrador(perfilNome)) return false;
  if (rotaExigeAdminOuGestor(pathname)) return isAdminOuGestor(perfilNome);

  if (rotaExigeFinanceiroDoPlano(pathname)) {
    if (!planoIncluiModulo(plano, "financeiro")) return false;
    if (!pathname.startsWith("/configuracoes/pagamentos") && !temPermissao(permissoes, "financeiro")) {
      return false;
    }
  }

  const modulo = moduloDaRota(pathname);
  if (!modulo) return true;

  if (moduloVisivelForaDoPlano(modulo)) {
    if (planoIncluiModulo(plano, modulo)) {
      return temPermissao(permissoes, modulo);
    }
    return isAdminOuGestor(perfilNome);
  }

  if (!planoIncluiModulo(plano, modulo)) return false;
  if (modulo === "configuracoes") {
    return temPermissao(permissoes, modulo) || isAdminOuGestor(perfilNome);
  }
  return temPermissao(permissoes, modulo);
}
