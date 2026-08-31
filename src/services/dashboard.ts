import { format, isSameMonth, parseISO, subMonths } from "date-fns";

import type { Paciente } from "@/types";
import { agendamentos, hoje } from "./mock/agenda";
import { cobrancas, getResumoContasAPagar, getResumoContasAReceber } from "./mock/financeiro";
import { pacientes, profissionais } from "./mock/pessoas";
import { produtos } from "./mock/estoque";
import { getFunilAgendamentos, getResumoDoDia, getTaxaFaltas, getTaxaOcupacao } from "./agenda";

export function getIndicadoresDashboard() {
  const resumoDia = getResumoDoDia(hoje);
  const receber = getResumoContasAReceber();
  const pagar = getResumoContasAPagar();

  const faturamentoMes = cobrancas
    .filter((cobranca) => cobranca.status === "pago" && isSameMonth(parseISO(cobranca.vencimento), hoje))
    .reduce((total, cobranca) => total + cobranca.valor, 0);

  const faturamentoMesAnterior = cobrancas
    .filter(
      (cobranca) => cobranca.status === "pago" && isSameMonth(parseISO(cobranca.vencimento), subMonths(hoje, 1)),
    )
    .reduce((total, cobranca) => total + cobranca.valor, 0);

  const novosPacientesMes = pacientes.filter((paciente) => isSameMonth(parseISO(paciente.criadoEm), hoje)).length;
  const novosPacientesMesAnterior = pacientes.filter((paciente) =>
    isSameMonth(parseISO(paciente.criadoEm), subMonths(hoje, 1)),
  ).length;

  const variacao = (atual: number, anterior: number) =>
    anterior === 0 ? (atual > 0 ? 100 : 0) : ((atual - anterior) / anterior) * 100;

  return {
    atendimentosHoje: resumoDia,
    faturamentoMes,
    variacaoFaturamento: variacao(faturamentoMes, faturamentoMesAnterior),
    faturamentoDia: resumoDia.faturamentoPrevisto,
    taxaOcupacao: getTaxaOcupacao(hoje),
    taxaFaltas: getTaxaFaltas(hoje),
    novosPacientes: novosPacientesMes,
    variacaoNovosPacientes: variacao(novosPacientesMes, novosPacientesMesAnterior),
    contasAReceber: receber,
    contasAPagar: pagar,
  };
}

/** Faturamento diário dos últimos 30 dias, com base nas cobranças pagas. */
export function getFaturamentoUltimos30Dias() {
  const mapa = new Map<string, number>();

  for (let index = 29; index >= 0; index -= 1) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - index);
    mapa.set(format(data, "yyyy-MM-dd"), 0);
  }

  cobrancas
    .filter((cobranca) => cobranca.status === "pago")
    .forEach((cobranca) => {
      if (mapa.has(cobranca.vencimento)) {
        mapa.set(cobranca.vencimento, (mapa.get(cobranca.vencimento) ?? 0) + cobranca.valor);
      }
    });

  return [...mapa.entries()].map(([data, valor]) => ({
    periodo: format(parseISO(data), "dd/MM"),
    valor: Number(valor.toFixed(2)),
  }));
}

export function getFaturamentoUltimos12Meses() {
  return Array.from({ length: 12 }, (_, index) => {
    const referencia = subMonths(hoje, 11 - index);
    const valor = cobrancas
      .filter((cobranca) => cobranca.status === "pago" && isSameMonth(parseISO(cobranca.vencimento), referencia))
      .reduce((total, cobranca) => total + cobranca.valor, 0);

    return { periodo: format(referencia, "MMM/yy"), valor: Number(valor.toFixed(2)) };
  });
}

export function getAtendimentosPorProfissional() {
  return profissionais
    .filter((profissional) => profissional.status === "ativo")
    .map((profissional) => {
      const doMes = agendamentos.filter(
        (agendamento) =>
          agendamento.profissionalId === profissional.id &&
          agendamento.status === "atendido" &&
          isSameMonth(parseISO(agendamento.data), hoje),
      );

      return {
        profissional: profissional.nome.replace(/^(Dra?\.)\s/, ""),
        atendimentos: doMes.length,
        faturamento: Number(doMes.reduce((total, agendamento) => total + agendamento.valor, 0).toFixed(2)),
      };
    })
    .sort((a, b) => b.atendimentos - a.atendimentos);
}

export function getDistribuicaoConvenioParticular() {
  const doMes = agendamentos.filter(
    (agendamento) => agendamento.status === "atendido" && isSameMonth(parseISO(agendamento.data), hoje),
  );

  const particular = doMes.filter((agendamento) => agendamento.particular).length;

  return [
    { nome: "Particular", valor: particular },
    { nome: "Convênio", valor: doMes.length - particular },
  ];
}

export function getFunilDoMes() {
  return getFunilAgendamentos(hoje);
}

export function getAlertas() {
  const estoqueBaixo = produtos.filter((produto) => produto.quantidadeAtual < produto.estoqueMinimo);

  const carteirinhasVencendo = pacientes.filter((paciente) => {
    if (!paciente.validadeCarteirinha) return false;
    const validade = parseISO(paciente.validadeCarteirinha);
    const limite = new Date(hoje);
    limite.setMonth(limite.getMonth() + 6);
    return validade <= limite;
  });

  const pagar = getResumoContasAPagar();

  const alertas: { id: string; titulo: string; descricao: string; severidade: "alta" | "media" | "baixa" }[] = [];

  if (estoqueBaixo.length > 0) {
    alertas.push({
      id: "alerta-estoque",
      titulo: `${estoqueBaixo.length} ${estoqueBaixo.length === 1 ? "item" : "itens"} abaixo do estoque mínimo`,
      descricao: estoqueBaixo
        .slice(0, 3)
        .map((produto) => produto.nome)
        .join(", "),
      severidade: "alta",
    });
  }

  if (pagar.quantidadeVencida > 0) {
    alertas.push({
      id: "alerta-pagar",
      titulo: `${pagar.quantidadeVencida} ${pagar.quantidadeVencida === 1 ? "despesa vencida" : "despesas vencidas"}`,
      descricao: "Verifique o módulo de contas a pagar para regularizar.",
      severidade: "alta",
    });
  }

  if (carteirinhasVencendo.length > 0) {
    alertas.push({
      id: "alerta-carteirinhas",
      titulo: `${carteirinhasVencendo.length} ${carteirinhasVencendo.length === 1 ? "carteirinha vence" : "carteirinhas vencem"} nos próximos 6 meses`,
      descricao: carteirinhasVencendo
        .slice(0, 3)
        .map((paciente) => paciente.nome)
        .join(", "),
      severidade: "media",
    });
  }

  return alertas;
}

export function getAniversariantes(): Paciente[] {
  return [];
}
