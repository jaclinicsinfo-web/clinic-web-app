/**
 * Acesso a dados de pacientes.
 * Hoje resolve a partir dos mocks; a troca para a API real deve acontecer aqui.
 */
import { compareDesc, isAfter, isBefore, parseISO } from "date-fns";

import type { Anexo, Paciente } from "@/types";
import { agendamentos, atendimentos, acompanhamentos, hoje } from "./mock/agenda";
import { cobrancas, getSaldoDevedorPaciente } from "./mock/financeiro";
import { pacientes } from "./mock/pessoas";

export function listPacientes(): Paciente[] {
  return pacientes.map((paciente) => ({
    ...paciente,
    saldoDevedor: getSaldoDevedorPaciente(paciente.id),
    ultimoAtendimento: getUltimoAtendimento(paciente.id),
    proximoAgendamento: getProximoAgendamento(paciente.id),
  }));
}

export function getPacienteById(id: string): Paciente | undefined {
  const paciente = pacientes.find((item) => item.id === id);
  if (!paciente) return undefined;

  return {
    ...paciente,
    saldoDevedor: getSaldoDevedorPaciente(paciente.id),
    ultimoAtendimento: getUltimoAtendimento(paciente.id),
    proximoAgendamento: getProximoAgendamento(paciente.id),
  };
}

function getUltimoAtendimento(pacienteId: string) {
  return agendamentos
    .filter(
      (agendamento) =>
        agendamento.pacienteId === pacienteId &&
        agendamento.status === "atendido" &&
        isBefore(parseISO(agendamento.data), hoje),
    )
    .sort((a, b) => compareDesc(parseISO(a.data), parseISO(b.data)))[0]?.data;
}

function getProximoAgendamento(pacienteId: string) {
  return agendamentos
    .filter(
      (agendamento) =>
        agendamento.pacienteId === pacienteId &&
        (agendamento.status === "agendado" || agendamento.status === "confirmado") &&
        !isBefore(parseISO(agendamento.data), hoje),
    )
    .sort((a, b) => parseISO(a.data).getTime() - parseISO(b.data).getTime())[0]?.data;
}

export function getResumoPacientes() {
  const lista = listPacientes();

  return {
    total: lista.length,
    ativos: lista.filter((paciente) => paciente.status === "ativo").length,
    inativos: lista.filter((paciente) => paciente.status === "inativo").length,
    arquivados: lista.filter((paciente) => paciente.status === "arquivado").length,
    comPendencia: lista.filter((paciente) => paciente.saldoDevedor > 0).length,
    valorEmAberto: lista.reduce((total, paciente) => total + paciente.saldoDevedor, 0),
  };
}

export function getAgendamentosDoPaciente(pacienteId: string) {
  return agendamentos
    .filter((agendamento) => agendamento.pacienteId === pacienteId)
    .sort((a, b) => parseISO(b.data).getTime() - parseISO(a.data).getTime());
}

export function getProximosAgendamentosDoPaciente(pacienteId: string) {
  return agendamentos
    .filter(
      (agendamento) =>
        agendamento.pacienteId === pacienteId &&
        isAfter(parseISO(agendamento.data), hoje) &&
        agendamento.status !== "cancelado",
    )
    .sort((a, b) => parseISO(a.data).getTime() - parseISO(b.data).getTime());
}

export function getAtendimentosDoPaciente(pacienteId: string) {
  return atendimentos
    .filter((atendimento) => atendimento.pacienteId === pacienteId)
    .sort((a, b) => compareDesc(parseISO(a.data), parseISO(b.data)));
}

export function getAcompanhamentosDoPaciente(pacienteId: string) {
  return acompanhamentos
    .filter((item) => item.pacienteId === pacienteId)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "em_andamento" ? -1 : 1;
      return compareDesc(parseISO(a.inicioEm), parseISO(b.inicioEm));
    });
}

export function getEvolucoesDoAcompanhamento(acompanhamentoId: string) {
  return atendimentos
    .filter((atendimento) => atendimento.acompanhamentoId === acompanhamentoId)
    .sort((a, b) => parseISO(a.data).getTime() - parseISO(b.data).getTime());
}

export function getCobrancasDoPaciente(pacienteId: string) {
  return cobrancas
    .filter((cobranca) => cobranca.pacienteId === pacienteId)
    .sort((a, b) => compareDesc(parseISO(a.vencimento), parseISO(b.vencimento)));
}

export interface DocumentoPaciente extends Anexo {
  origem: string;
}

export function getDocumentosDoPaciente(pacienteId: string): DocumentoPaciente[] {
  return getAtendimentosDoPaciente(pacienteId).flatMap((atendimento) =>
    atendimento.anexos.map((anexo) => ({
      ...anexo,
      origem: `${atendimento.procedimentoRealizado} — ${atendimento.profissionalNome}`,
    })),
  );
}

export function getAniversariantesDoMes() {
  const mesAtual = hoje.getMonth();

  return pacientes
    .filter((paciente) => parseISO(paciente.dataNascimento).getMonth() === mesAtual)
    .sort((a, b) => parseISO(a.dataNascimento).getDate() - parseISO(b.dataNascimento).getDate());
}
