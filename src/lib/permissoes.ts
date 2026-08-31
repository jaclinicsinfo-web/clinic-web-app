import { navGroups } from "@/lib/navigation";
import { isAdministrador, isAdminOuGestor } from "@/lib/plano";
import type { AcaoPermissao, ModuloSistema, Permissao } from "@/types";

const MODULOS: ModuloSistema[] = [
  "dashboard",
  "pacientes",
  "agenda",
  "profissionais",
  "financeiro",
  "convenios",
  "estoque",
  "relatorios",
  "configuracoes",
];

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
  return MODULOS.includes(segmento as ModuloSistema) ? (segmento as ModuloSistema) : null;
}

export function rotaExigeAdministrador(pathname: string) {
  return pathname.startsWith("/configuracoes/permissoes");
}

export function rotaExigeAdminOuGestor(pathname: string) {
  return pathname.startsWith("/configuracoes/usuarios");
}

export function primeiraRotaPermitida(permissoes: Permissao[] | undefined | null) {
  for (const grupo of navGroups) {
    for (const item of grupo.items) {
      if (temPermissao(permissoes, item.modulo)) return item.href;
    }
  }
  return "/dashboard";
}

export function podeAcessarRota(
  pathname: string,
  permissoes: Permissao[] | undefined | null,
  perfilNome: string | undefined,
) {
  if (rotaExigeAdministrador(pathname) && !isAdministrador(perfilNome)) return false;
  if (rotaExigeAdminOuGestor(pathname)) return isAdminOuGestor(perfilNome);
  const modulo = moduloDaRota(pathname);
  if (!modulo) return true;
  return temPermissao(permissoes, modulo);
}
