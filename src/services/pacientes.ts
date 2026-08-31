/**
 * Acesso a dados de pacientes via API.
 */
import { api } from "@/lib/api";
import type {
  AcompanhamentoClinico,
  Agendamento,
  Anexo,
  Atendimento,
  Cobranca,
  Paciente,
} from "@/types";

export interface DocumentoPaciente extends Anexo {
  origem: string;
}

export interface ResumoPacientes {
  total: number;
  ativos: number;
  inativos: number;
  arquivados: number;
  comPendencia: number;
  valorEmAberto: number;
}

export interface OpcaoPaciente {
  id: string;
  nome: string;
}

export interface ListaPacientesResponse {
  pacientes: Paciente[];
  resumo: ResumoPacientes;
  convenios: OpcaoPaciente[];
  profissionais: OpcaoPaciente[];
  somenteProprios: boolean;
}

export interface OpcoesPacientesResponse {
  convenios: OpcaoPaciente[];
  profissionais: OpcaoPaciente[];
}

export interface DetalhePacienteResponse {
  paciente: Paciente;
  proximosAgendamentos: Agendamento[];
  atendimentos: Atendimento[];
  acompanhamentos: AcompanhamentoClinico[];
  agendamentos: Agendamento[];
  cobrancas: Cobranca[];
  documentos: DocumentoPaciente[];
}

export interface PacientePayload {
  nome: string;
  cpf: string;
  rg?: string | null;
  dataNascimento: string;
  sexo: Paciente["sexo"];
  estadoCivil?: Paciente["estadoCivil"] | null;
  profissao?: string | null;
  telefone: string;
  whatsapp?: string | null;
  email?: string | null;
  endereco: Paciente["endereco"];
  convenioId: string | null;
  numeroCarteirinha?: string | null;
  validadeCarteirinha?: string | null;
  responsavel: Paciente["responsavel"] | null;
  alergias: string[];
  condicoesPreexistentes: string[];
  medicacoesEmUso: string[];
  profissionalPreferidoId: string | null;
  formaContatoPreferida?: Paciente["formaContatoPreferida"] | null;
  observacoes?: string | null;
  consentimentoLgpd: boolean;
  autorizacaoImagem: boolean;
}

function normalizarPaciente(paciente: Paciente): Paciente {
  return {
    ...paciente,
    rg: paciente.rg ?? undefined,
    estadoCivil: paciente.estadoCivil ?? undefined,
    profissao: paciente.profissao ?? undefined,
    whatsapp: paciente.whatsapp ?? undefined,
    email: paciente.email ?? undefined,
    numeroCarteirinha: paciente.numeroCarteirinha ?? undefined,
    validadeCarteirinha: paciente.validadeCarteirinha ?? undefined,
    responsavel: paciente.responsavel ?? undefined,
    profissionalPreferidoId: paciente.profissionalPreferidoId ?? undefined,
    formaContatoPreferida: paciente.formaContatoPreferida ?? undefined,
    observacoes: paciente.observacoes ?? undefined,
    ultimoAtendimento: paciente.ultimoAtendimento ?? undefined,
    proximoAgendamento: paciente.proximoAgendamento ?? undefined,
    alergias: paciente.alergias ?? [],
    condicoesPreexistentes: paciente.condicoesPreexistentes ?? [],
    medicacoesEmUso: paciente.medicacoesEmUso ?? [],
    saldoDevedor: paciente.saldoDevedor ?? 0,
  };
}

export async function listarPacientesApi() {
  const data = await api.get<ListaPacientesResponse>("/pacientes");
  return {
    ...data,
    pacientes: data.pacientes.map(normalizarPaciente),
  };
}

export async function opcoesPacientesApi() {
  return api.get<OpcoesPacientesResponse>("/pacientes/opcoes");
}

export async function obterPacienteApi(id: string) {
  const data = await api.get<DetalhePacienteResponse>(`/pacientes/${id}`);
  return {
    ...data,
    paciente: normalizarPaciente(data.paciente),
  };
}

export async function criarPacienteApi(payload: PacientePayload) {
  const data = await api.post<{ paciente: Paciente }>("/pacientes", payload);
  return normalizarPaciente(data.paciente);
}

export async function atualizarPacienteApi(id: string, payload: PacientePayload) {
  const data = await api.patch<{ paciente: Paciente }>(`/pacientes/${id}`, payload);
  return normalizarPaciente(data.paciente);
}

export async function arquivarPacienteApi(id: string) {
  const data = await api.patch<{ paciente: Paciente }>(`/pacientes/${id}/arquivar`);
  return normalizarPaciente(data.paciente);
}
