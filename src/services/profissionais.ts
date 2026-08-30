import { isSameMonth, parseISO } from "date-fns";

import type { Profissional } from "@/types";
import { agendamentos, hoje } from "./mock/agenda";
import { comissoes } from "./mock/financeiro";
import { pacientes, profissionais } from "./mock/pessoas";

export function listProfissionais(): Profissional[] {
  return profissionais;
}

export function getProfissionalById(id: string) {
  return profissionais.find((profissional) => profissional.id === id);
}

export function getIndicadoresProfissional(profissionalId: string) {
  const doProfissional = agendamentos.filter((agendamento) => agendamento.profissionalId === profissionalId);
  const doMes = doProfissional.filter((agendamento) => isSameMonth(parseISO(agendamento.data), hoje));
  const atendidosMes = doMes.filter((agendamento) => agendamento.status === "atendido");
  const faltasMes = doMes.filter((agendamento) => agendamento.status === "faltou");

  const profissional = getProfissionalById(profissionalId);
  const horasSemanais =
    profissional?.gradeHorarios.reduce((total, grade) => {
      const [inicioHora, inicioMin] = grade.horaInicio.split(":").map(Number);
      const [fimHora, fimMin] = grade.horaFim.split(":").map(Number);
      return total + (fimHora * 60 + fimMin - (inicioHora * 60 + inicioMin)) / 60;
    }, 0) ?? 0;

  const minutosAgendadosSemana = doProfissional
    .filter((agendamento) => agendamento.status !== "cancelado")
    .slice(0, 40)
    .reduce((total, agendamento) => {
      const [inicioHora, inicioMin] = agendamento.horaInicio.split(":").map(Number);
      const [fimHora, fimMin] = agendamento.horaFim.split(":").map(Number);
      return total + (fimHora * 60 + fimMin - (inicioHora * 60 + inicioMin));
    }, 0);

  const capacidadeMensalMin = horasSemanais * 60 * 4.3;
  const ocupacao = capacidadeMensalMin > 0 ? Math.min((minutosAgendadosSemana / capacidadeMensalMin) * 100, 100) : 0;

  return {
    atendimentosMes: atendidosMes.length,
    agendamentosMes: doMes.length,
    faturamentoGerado: atendidosMes.reduce((total, agendamento) => total + agendamento.valor, 0),
    taxaOcupacao: ocupacao,
    taxaFaltas: doMes.length > 0 ? (faltasMes.length / doMes.length) * 100 : 0,
    pacientesAtendidos: new Set(
      doProfissional
        .filter((agendamento) => agendamento.status === "atendido")
        .map((agendamento) => agendamento.pacienteId),
    ).size,
    horasSemanais,
  };
}

export function getPacientesDoProfissional(profissionalId: string) {
  const ids = new Set(
    agendamentos
      .filter((agendamento) => agendamento.profissionalId === profissionalId)
      .map((agendamento) => agendamento.pacienteId),
  );

  return pacientes
    .filter((paciente) => ids.has(paciente.id))
    .map((paciente) => {
      const doPaciente = agendamentos.filter(
        (agendamento) => agendamento.profissionalId === profissionalId && agendamento.pacienteId === paciente.id,
      );

      return {
        paciente,
        atendimentos: doPaciente.filter((agendamento) => agendamento.status === "atendido").length,
        ultimaVisita: doPaciente
          .filter((agendamento) => agendamento.status === "atendido")
          .sort((a, b) => parseISO(b.data).getTime() - parseISO(a.data).getTime())[0]?.data,
      };
    })
    .sort((a, b) => b.atendimentos - a.atendimentos);
}

export function getComissoesDoProfissional(profissionalId: string) {
  return comissoes
    .filter((comissao) => comissao.profissionalId === profissionalId)
    .sort((a, b) => b.competencia.localeCompare(a.competencia));
}

export function getAgendaDoProfissional(profissionalId: string) {
  return agendamentos
    .filter((agendamento) => agendamento.profissionalId === profissionalId)
    .sort((a, b) => `${a.data}${a.horaInicio}`.localeCompare(`${b.data}${b.horaInicio}`));
}

export function getResumoProfissionais() {
  return {
    total: profissionais.length,
    ativos: profissionais.filter((profissional) => profissional.status === "ativo").length,
    especialidades: new Set(profissionais.flatMap((profissional) => profissional.especialidades)).size,
    comissaoMedia:
      profissionais.filter((profissional) => profissional.percentualComissao > 0).reduce(
        (total, profissional) => total + profissional.percentualComissao,
        0,
      ) / Math.max(profissionais.filter((profissional) => profissional.percentualComissao > 0).length, 1),
  };
}
