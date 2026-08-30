import { isSameMonth, parseISO } from "date-fns";

import { agendamentos, hoje } from "./mock/agenda";
import {
  categoriasProcedimento,
  convenios,
  especialidades,
  getConvenioNome,
  getProcedimento,
  procedimentos,
  salas,
} from "./mock/catalogo";
import { pacientes } from "./mock/pessoas";
import { lotesConvenio } from "./mock/financeiro";

export { categoriasProcedimento, especialidades, getConvenioNome, getProcedimento, salas };

export function listConvenios() {
  return convenios;
}

export function getConvenioById(id: string) {
  return convenios.find((convenio) => convenio.id === id);
}

export function listProcedimentos() {
  return procedimentos;
}

export function getIndicadoresConvenio(convenioId: string) {
  const pacientesVinculados = pacientes.filter((paciente) => paciente.convenioId === convenioId);
  const atendimentosMes = agendamentos.filter(
    (agendamento) =>
      agendamento.convenioId === convenioId &&
      agendamento.status === "atendido" &&
      isSameMonth(parseISO(agendamento.data), hoje),
  );

  const lotes = lotesConvenio.filter((lote) => lote.convenioId === convenioId);
  const apresentado = lotes.reduce((total, lote) => total + lote.valorApresentado, 0);
  const glosado = lotes.reduce((total, lote) => total + lote.valorGlosado, 0);

  return {
    pacientesVinculados: pacientesVinculados.length,
    atendimentosMes: atendimentosMes.length,
    faturamentoMes: atendimentosMes.reduce((total, agendamento) => total + agendamento.valor, 0),
    valorApresentado: apresentado,
    taxaGlosa: apresentado > 0 ? (glosado / apresentado) * 100 : 0,
  };
}

export function getResumoConveniosCadastro() {
  return {
    total: convenios.length,
    ativos: convenios.filter((convenio) => convenio.status === "ativo").length,
    exigemAutorizacao: convenios.filter((convenio) => convenio.exigeAutorizacaoPrevia).length,
    prazoMedio: Math.round(
      convenios.reduce((total, convenio) => total + convenio.prazoPagamentoDias, 0) / convenios.length,
    ),
  };
}

/** Comparativo de valores: particular x cada convênio, por procedimento. */
export function getComparativoPrecos() {
  return procedimentos.map((procedimento) => ({
    procedimento,
    valores: convenios.map((convenio) => ({
      convenio,
      valor: procedimento.valoresPorConvenio.find((item) => item.convenioId === convenio.id)?.valor ?? null,
    })),
  }));
}

export function getPacientesDoConvenio(convenioId: string) {
  return pacientes.filter((paciente) => paciente.convenioId === convenioId);
}
