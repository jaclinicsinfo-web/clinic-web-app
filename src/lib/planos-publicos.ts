export interface PlanoPublico {
  codigo: string;
  nome: string;
  limiteUsuarios: number | null;
  limiteUnidades: number | null;
  precoMensal: number;
  modulos: string[];
}

export const RECURSOS_PLANO: Record<string, string[]> = {
  essencial: ["Agenda, pacientes e prontuário", "Até 5 usuários", "1 unidade"],
  profissional: ["Tudo do Essencial", "Financeiro, estoque e relatórios", "Até 20 usuários", "Unidades sem limite"],
  ilimitado: ["Tudo do Profissional", "Integrações, Power BI e agente de IA", "Usuários sem limite"],
};

export function reais(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function listarPlanosPublicos(): Promise<PlanoPublico[] | null> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  if (!base) return null;

  try {
    const resposta = await fetch(`${base}/planos`, { cache: "no-store" });
    if (!resposta.ok) return null;
    const corpo = (await resposta.json()) as { planos?: PlanoPublico[] };
    return corpo.planos ?? null;
  } catch {
    return null;
  }
}
