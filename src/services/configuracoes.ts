import { api } from "@/lib/api";
import type { Clinica, ModuloSistema, Unidade } from "@/types";

export const modulosLabels: Record<ModuloSistema, string> = {
  dashboard: "Dashboard",
  pacientes: "Pacientes",
  agenda: "Agenda",
  profissionais: "Profissionais",
  financeiro: "Financeiro",
  convenios: "Convênios",
  estoque: "Estoque",
  relatorios: "Relatórios",
  rh: "RH",
  configuracoes: "Configurações",
  integracoes: "Integrações e lembretes",
  powerbi: "Power BI",
  agenteia: "Agente de IA",
};

export interface ClinicaPayload {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
}

export interface UnidadePayload {
  nome: string;
  cidade: string;
}

export interface UnidadeMutacao {
  unidade: Unidade;
  unidadesSessao: Unidade[];
}

export async function obterClinicaApi() {
  const data = await api.get<{ clinica: Clinica }>("/clinica");
  return data.clinica;
}

export async function salvarClinicaApi(payload: ClinicaPayload) {
  const data = await api.patch<{ clinica: Clinica }>("/clinica", payload);
  return data.clinica;
}

export async function enviarLogoClinicaApi(arquivo: File) {
  const form = new FormData();
  form.append("arquivo", arquivo);
  const data = await api.upload<{ clinica: Clinica }>("/clinica/logo", form);
  return data.clinica;
}

export async function baixarLogoClinicaApi() {
  return api.blob("/clinica/logo");
}

export async function removerLogoClinicaApi() {
  const data = await api.delete<{ clinica: Clinica }>("/clinica/logo");
  return data.clinica;
}

export async function criarUnidadeApi(payload: UnidadePayload) {
  return api.post<UnidadeMutacao>("/clinica/unidades", payload);
}

export async function atualizarUnidadeApi(id: string, payload: UnidadePayload) {
  return api.patch<UnidadeMutacao>(`/clinica/unidades/${id}`, payload);
}

export async function inativarUnidadeApi(id: string) {
  return api.patch<UnidadeMutacao>(`/clinica/unidades/${id}/inativar`);
}

export async function ativarUnidadeApi(id: string) {
  return api.patch<UnidadeMutacao>(`/clinica/unidades/${id}/ativar`);
}
