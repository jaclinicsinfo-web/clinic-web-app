import { addDays, isBefore, isSameMonth, isWithinInterval, parseISO, subMonths } from "date-fns";

import type { Cobranca, Comissao, Despesa, LoteConvenio } from "@/types";
import { hoje } from "./mock/agenda";
import {
  cobrancas,
  comissoes,
  despesas,
  fluxoCaixaDiario,
  fluxoCaixaMensal,
  getPacientesInadimplentes,
  lotesConvenio,
} from "./mock/financeiro";

export { getPacientesInadimplentes };

export function listCobrancas(): Cobranca[] {
  return [...cobrancas].sort((a, b) => parseISO(b.vencimento).getTime() - parseISO(a.vencimento).getTime());
}

export function listDespesas(): Despesa[] {
  return [...despesas].sort((a, b) => parseISO(b.vencimento).getTime() - parseISO(a.vencimento).getTime());
}

export function listLotesConvenio(): LoteConvenio[] {
  return [...lotesConvenio].sort((a, b) => b.competencia.localeCompare(a.competencia));
}

export function listComissoes(): Comissao[] {
  return [...comissoes].sort((a, b) => b.competencia.localeCompare(a.competencia));
}

export function getFluxoCaixaDiario() {
  return fluxoCaixaDiario;
}

export function getFluxoCaixaMensal() {
  return fluxoCaixaMensal;
}

export function getResumoContasAReceber() {
  const emAberto = cobrancas.filter((cobranca) => cobranca.status === "pendente" || cobranca.status === "parcelado");
  const atrasadas = cobrancas.filter((cobranca) => cobranca.status === "atrasado");
  const recebidoMes = cobrancas.filter(
    (cobranca) => cobranca.status === "pago" && isSameMonth(parseISO(cobranca.vencimento), hoje),
  );

  const proximos7Dias = cobrancas.filter((cobranca) => {
    if (cobranca.status !== "pendente") return false;
    const vencimento = parseISO(cobranca.vencimento);
    return isWithinInterval(vencimento, { start: hoje, end: addDays(hoje, 7) });
  });

  const somar = (lista: Cobranca[]) => lista.reduce((total, cobranca) => total + cobranca.valor, 0);

  return {
    totalEmAberto: somar(emAberto),
    totalAtrasado: somar(atrasadas),
    recebidoNoMes: somar(recebidoMes),
    vencendo7Dias: somar(proximos7Dias),
    quantidadeAtrasada: atrasadas.length,
    quantidadeEmAberto: emAberto.length,
    quantidadeVencendo7Dias: proximos7Dias.length,
  };
}

export function getResumoContasAPagar() {
  const aPagar = despesas.filter((despesa) => despesa.status === "a_pagar");
  const vencidas = despesas.filter((despesa) => despesa.status === "vencido");
  const pagasMes = despesas.filter(
    (despesa) => despesa.status === "pago" && isSameMonth(parseISO(despesa.vencimento), hoje),
  );

  const proximos7Dias = aPagar.filter((despesa) =>
    isWithinInterval(parseISO(despesa.vencimento), { start: hoje, end: addDays(hoje, 7) }),
  );

  const somar = (lista: Despesa[]) => lista.reduce((total, despesa) => total + despesa.valor, 0);

  return {
    totalAPagar: somar(aPagar),
    totalVencido: somar(vencidas),
    pagoNoMes: somar(pagasMes),
    vencendo7Dias: somar(proximos7Dias),
    quantidadeVencida: vencidas.length,
    quantidadeAPagar: aPagar.length,
    quantidadeVencendo7Dias: proximos7Dias.length,
  };
}

export function getResumoFluxoCaixa() {
  const mesAtual = fluxoCaixaMensal[fluxoCaixaMensal.length - 1];
  const mesAnterior = fluxoCaixaMensal[fluxoCaixaMensal.length - 2];

  const variacao = (atual: number, anterior: number) =>
    anterior === 0 ? 0 : ((atual - anterior) / anterior) * 100;

  return {
    entradasMes: mesAtual.entradas,
    saidasMes: mesAtual.saidas,
    saldoMes: mesAtual.saldo,
    variacaoEntradas: variacao(mesAtual.entradas, mesAnterior.entradas),
    variacaoSaidas: variacao(mesAtual.saidas, mesAnterior.saidas),
    variacaoSaldo: variacao(mesAtual.saldo, mesAnterior.saldo),
  };
}

/** DRE simplificado: receitas e despesas agrupadas por categoria no mês corrente. */
export function getDreSimplificado() {
  const receitaPorForma = new Map<string, number>();
  cobrancas
    .filter((cobranca) => cobranca.status === "pago" && isSameMonth(parseISO(cobranca.vencimento), hoje))
    .forEach((cobranca) => {
      const chave = cobranca.convenioId ? "Convênio" : "Particular";
      receitaPorForma.set(chave, (receitaPorForma.get(chave) ?? 0) + cobranca.valor);
    });

  const despesaPorCategoria = new Map<string, number>();
  despesas
    .filter((despesa) => isSameMonth(parseISO(despesa.vencimento), hoje))
    .forEach((despesa) => {
      despesaPorCategoria.set(despesa.categoria, (despesaPorCategoria.get(despesa.categoria) ?? 0) + despesa.valor);
    });

  return {
    receitas: [...receitaPorForma.entries()]
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor),
    despesas: [...despesaPorCategoria.entries()]
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor),
  };
}

export function getResumoConvenios() {
  const somar = (campo: keyof Pick<LoteConvenio, "valorApresentado" | "valorGlosado" | "valorRecebido">) =>
    lotesConvenio.reduce((total, lote) => total + lote[campo], 0);

  const apresentado = somar("valorApresentado");
  const glosado = somar("valorGlosado");

  return {
    valorApresentado: apresentado,
    valorGlosado: glosado,
    valorRecebido: somar("valorRecebido"),
    taxaGlosa: apresentado > 0 ? (glosado / apresentado) * 100 : 0,
    lotesAbertos: lotesConvenio.filter((lote) => lote.status === "aberto").length,
    lotesAguardando: lotesConvenio.filter((lote) => lote.status === "enviado").length,
  };
}

export function getResumoComissoes() {
  const competenciaAtual = comissoes.reduce((maior, comissao) =>
    comissao.competencia > maior ? comissao.competencia : maior,
    comissoes[0]?.competencia ?? "",
  );

  const doMes = comissoes.filter((comissao) => comissao.competencia === competenciaAtual);

  return {
    competencia: competenciaAtual,
    totalPrevisto: doMes.reduce((total, comissao) => total + comissao.valorComissao, 0),
    aprovadas: comissoes
      .filter((comissao) => comissao.status === "aprovada")
      .reduce((total, comissao) => total + comissao.valorComissao, 0),
    pagas: comissoes
      .filter((comissao) => comissao.status === "paga")
      .reduce((total, comissao) => total + comissao.valorComissao, 0),
    profissionaisComissionados: doMes.length,
  };
}

/** Faturamento dos últimos 6 meses agrupado por convênio x particular. */
export function getFaturamentoPorOrigem() {
  const particular = cobrancas
    .filter((cobranca) => cobranca.status === "pago" && !cobranca.convenioId)
    .reduce((total, cobranca) => total + cobranca.valor, 0);

  const convenio = cobrancas
    .filter((cobranca) => cobranca.status === "pago" && cobranca.convenioId)
    .reduce((total, cobranca) => total + cobranca.valor, 0);

  return [
    { origem: "Particular", valor: Number(particular.toFixed(2)) },
    { origem: "Convênio", valor: Number(convenio.toFixed(2)) },
  ];
}

export function getCobrancasVencendoHoje() {
  return cobrancas.filter(
    (cobranca) => cobranca.status === "pendente" && cobranca.vencimento === hoje.toISOString().slice(0, 10),
  );
}

export function getDespesasRecentesVencidas() {
  return despesas
    .filter((despesa) => despesa.status === "vencido" && isBefore(subMonths(hoje, 2), parseISO(despesa.vencimento)))
    .sort((a, b) => parseISO(a.vencimento).getTime() - parseISO(b.vencimento).getTime());
}
