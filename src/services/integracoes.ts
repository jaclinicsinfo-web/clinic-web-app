import { api } from "@/lib/api";

export type CanalLembrete = "whatsapp" | "email";
export type TipoLembrete = "antecedencia" | "confirmacao" | "reagendamento" | "cancelamento";
export type DestinatarioLembrete = "paciente" | "profissional" | "ambos";
export type ModoCobranca = "conta_clinica" | "repasse_plataforma";
export type StatusEnvio =
  | "pendente"
  | "processando"
  | "enviado"
  | "entregue"
  | "lido"
  | "falhou"
  | "cancelado";

export interface FiltroIntegracoes {
  de?: string;
  ate?: string;
  canal?: CanalLembrete | "";
  status?: StatusEnvio | "";
  tipo?: TipoLembrete | "";
  busca?: string;
}

export interface IntegracoesResumo {
  total: number;
  hoje: number;
  whatsapp: number;
  email: number;
  enviados: number;
  entregues: number;
  falhos: number;
  pendentes: number;
  cancelados: number;
  lidos: number;
  custoTotal: number;
  custoWhatsapp: number;
  custoEmail: number;
  custoMedio: number;
  taxaSucesso: number;
  taxaFalha: number;
  agendamentosImpactados: number;
}

export interface EnvioLembrete {
  id: string;
  agendamentoId: string;
  agendamentoData: string | null;
  agendamentoHora: string;
  agendamentoStatus: string;
  pacienteNome: string;
  profissionalNome: string;
  regraNome: string | null;
  templateNome: string | null;
  canal: CanalLembrete;
  destinatarioTipo: "paciente" | "profissional";
  destinatarioNome: string;
  destinatarioContato: string;
  tipoLembrete: TipoLembrete;
  status: StatusEnvio;
  provedorMessageId: string | null;
  erro: string | null;
  custo: number;
  custoEstimado: boolean;
  tentativas: number;
  preview: string | null;
  processarEm: string | null;
  enviadoEm: string | null;
  entregueEm: string | null;
  lidoEm: string | null;
  criadoEm: string | null;
}

export interface IntegracoesDashboard {
  resumo: IntegracoesResumo;
  cobranca: {
    whatsapp: ModoCobranca;
    email: ModoCobranca;
  };
  envios: EnvioLembrete[];
}

export interface IntegracaoConfiguracao {
  clinicaId: string;
  lembretesAtivos: boolean;
  webhookUrl: string;
  whatsapp: {
    ativo: boolean;
    configurado: boolean;
    phoneNumberId: string | null;
    wabaId: string | null;
    appId: string | null;
    ambiente: string;
    accessTokenMascarado: string | null;
    appSecretMascarado: string | null;
    verifyTokenMascarado: string | null;
    cobrancaModo: ModoCobranca;
  };
}

export interface RegraLembrete {
  id: string;
  nome: string;
  tipo: TipoLembrete;
  antecedenciaMinutos: number | null;
  destinatarios: DestinatarioLembrete;
  canais: CanalLembrete[];
  templateWhatsappId: string | null;
  templateEmailId: string | null;
  templateWhatsappNome: string | null;
  templateEmailNome: string | null;
  ativo: boolean;
  sistema: boolean;
  ordem: number;
}

export interface TemplateMensagem {
  id: string;
  canal: CanalLembrete;
  tipo: TipoLembrete;
  nome: string;
  assunto: string | null;
  corpo: string;
  whatsappNomeTemplate: string | null;
  whatsappIdioma: string;
  whatsappCategoria: string;
  ativo: boolean;
  sistema: boolean;
}

export interface CustoEnvio {
  id: string;
  canal: CanalLembrete;
  categoria: string;
  valor: number;
  moeda: string;
  ativo: boolean;
}

function paramsDe(filtro?: FiltroIntegracoes) {
  return {
    de: filtro?.de || undefined,
    ate: filtro?.ate || undefined,
    canal: filtro?.canal || undefined,
    status: filtro?.status || undefined,
    tipo: filtro?.tipo || undefined,
    busca: filtro?.busca || undefined,
  };
}

export async function obterDashboardIntegracoesApi(filtro?: FiltroIntegracoes) {
  return api.get<IntegracoesDashboard>("/integracoes", { params: paramsDe(filtro) });
}

export async function obterConfiguracaoIntegracoesApi() {
  return api.get<IntegracaoConfiguracao>("/integracoes/configuracao");
}

export async function salvarConfiguracaoIntegracoesApi(body: Record<string, unknown>) {
  return api.patch<IntegracaoConfiguracao>("/integracoes/configuracao", body);
}

export async function testarWhatsappApi(para: string) {
  return api.post<{ ok: boolean; message: string }>("/integracoes/whatsapp/teste", { para });
}

export async function listarRegrasLembreteApi() {
  const data = await api.get<{ regras: RegraLembrete[] }>("/integracoes/regras");
  return data.regras;
}

export async function criarRegraLembreteApi(body: Omit<RegraLembrete, "id" | "sistema" | "templateWhatsappNome" | "templateEmailNome">) {
  const data = await api.post<{ regra: RegraLembrete }>("/integracoes/regras", body);
  return data.regra;
}

export async function atualizarRegraLembreteApi(
  id: string,
  body: Omit<RegraLembrete, "id" | "sistema" | "templateWhatsappNome" | "templateEmailNome">,
) {
  const data = await api.patch<{ regra: RegraLembrete }>(`/integracoes/regras/${id}`, body);
  return data.regra;
}

export async function excluirRegraLembreteApi(id: string) {
  return api.delete<void>(`/integracoes/regras/${id}`);
}

export async function listarTemplatesMensagemApi() {
  const data = await api.get<{ templates: TemplateMensagem[] }>("/integracoes/templates");
  return data.templates;
}

export async function criarTemplateMensagemApi(body: Omit<TemplateMensagem, "id" | "sistema">) {
  const data = await api.post<{ template: TemplateMensagem }>("/integracoes/templates", body);
  return data.template;
}

export async function atualizarTemplateMensagemApi(id: string, body: Omit<TemplateMensagem, "id" | "sistema">) {
  const data = await api.patch<{ template: TemplateMensagem }>(`/integracoes/templates/${id}`, body);
  return data.template;
}

export async function excluirTemplateMensagemApi(id: string) {
  return api.delete<void>(`/integracoes/templates/${id}`);
}

export async function listarCustosEnvioApi() {
  const data = await api.get<{ custos: CustoEnvio[] }>("/integracoes/custos");
  return data.custos;
}

export async function listarEnviosLembreteApi(filtro?: FiltroIntegracoes) {
  const data = await api.get<{ envios: EnvioLembrete[] }>("/integracoes/envios", { params: paramsDe(filtro) });
  return data.envios;
}

export async function processarIntegracoesApi() {
  return api.post<{ ok: boolean; processados: number }>("/integracoes/processar");
}
