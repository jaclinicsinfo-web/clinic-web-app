import {
  differenceInDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import { formatISODate } from "@/lib/format";
import { getConvenioNome, convenios, procedimentos } from "./mock/catalogo";
import { agendamentos, hoje } from "./mock/agenda";
import { cobrancas, comissoes } from "./mock/financeiro";
import { pacientes, profissionais } from "./mock/pessoas";

export type PeriodoRelatorio = "mes" | "anterior" | "30d" | "12m" | "ano";

export const periodosRelatorio: { id: PeriodoRelatorio; label: string }[] = [
  { id: "mes", label: "Este mês" },
  { id: "anterior", label: "Mês anterior" },
  { id: "30d", label: "Últimos 30 dias" },
  { id: "12m", label: "Últimos 12 meses" },
  { id: "ano", label: "Ano corrente" },
];

export function resolverPeriodo(periodo: PeriodoRelatorio, referencia = hoje) {
  const fim = referencia;
  if (periodo === "anterior") {
    const inicio = startOfMonth(subMonths(referencia, 1));
    const termino = endOfMonth(subMonths(referencia, 1));
    return { inicio, fim: termino, label: format(inicio, "MMMM yyyy", { locale: ptBR }) };
  }
  if (periodo === "30d") {
    return { inicio: subDays(fim, 29), fim, label: "Últimos 30 dias" };
  }
  if (periodo === "12m") {
    return { inicio: subMonths(startOfMonth(fim), 11), fim, label: "Últimos 12 meses" };
  }
  if (periodo === "ano") {
    return { inicio: startOfYear(fim), fim, label: format(fim, "yyyy") };
  }
  return {
    inicio: startOfMonth(fim),
    fim: endOfMonth(fim),
    label: format(fim, "MMMM yyyy", { locale: ptBR }),
  };
}

function noPeriodo(dataIso: string, inicio: Date, fim: Date) {
  const data = parseISO(`${dataIso}T12:00:00`);
  return isWithinInterval(data, { start: inicio, end: fim });
}

export function getRelatorios(periodo: PeriodoRelatorio) {
  const intervalo = resolverPeriodo(periodo);
  const { inicio, fim } = intervalo;
  const agruparPorMes = differenceInDays(fim, inicio) > 45;

  const agendamentosPeriodo = agendamentos.filter((item) => noPeriodo(item.data, inicio, fim));
  const atendidos = agendamentosPeriodo.filter((item) => item.status === "atendido");
  const cancelados = agendamentosPeriodo.filter((item) => item.status === "cancelado");
  const faltas = agendamentosPeriodo.filter((item) => item.status === "faltou");

  const pontosTempo = agruparPorMes
    ? eachMonthOfInterval({ start: inicio, end: fim }).map((data) => ({
        chave: format(data, "yyyy-MM"),
        label: format(data, "MMM", { locale: ptBR }),
        testa: (iso: string) => iso.startsWith(format(data, "yyyy-MM")),
      }))
    : eachDayOfInterval({ start: inicio, end: fim }).map((data) => ({
        chave: formatISODate(data),
        label: format(data, "dd/MM"),
        testa: (iso: string) => iso === formatISODate(data),
      }));

  const porProfissional = profissionais
    .map((profissional) => {
      const lista = atendidos.filter((item) => item.profissionalId === profissional.id);
      return {
        id: profissional.id,
        nome: profissional.nome,
        atendimentos: lista.length,
        valor: lista.reduce((total, item) => total + item.valor, 0),
      };
    })
    .filter((item) => item.atendimentos > 0)
    .sort((a, b) => b.valor - a.valor);

  const porConvenioMap = new Map<string, { nome: string; atendimentos: number; valor: number }>();
  atendidos.forEach((item) => {
    const chave = item.convenioId ?? "particular";
    const atual = porConvenioMap.get(chave) ?? {
      nome: item.particular ? "Particular" : getConvenioNome(item.convenioId),
      atendimentos: 0,
      valor: 0,
    };
    atual.atendimentos += 1;
    atual.valor += item.valor;
    porConvenioMap.set(chave, atual);
  });

  const porProcedimento = procedimentos
    .map((procedimento) => {
      const lista = atendidos.filter((item) => item.procedimentoId === procedimento.id);
      return {
        id: procedimento.id,
        nome: procedimento.nome,
        quantidade: lista.length,
        valor: lista.reduce((total, item) => total + item.valor, 0),
      };
    })
    .filter((item) => item.quantidade > 0)
    .sort((a, b) => b.valor - a.valor);

  const cobrancasAtrasadas = cobrancas.filter((cobranca) => cobranca.status === "atrasado");
  const inadimplentesMap = new Map<string, { nome: string; valor: number; cobrancas: number }>();
  cobrancasAtrasadas.forEach((cobranca) => {
    const atual = inadimplentesMap.get(cobranca.pacienteId) ?? {
      nome: cobranca.pacienteNome,
      valor: 0,
      cobrancas: 0,
    };
    atual.valor += cobranca.valor;
    atual.cobrancas += 1;
    inadimplentesMap.set(cobranca.pacienteId, atual);
  });

  const novos = pacientes.filter((paciente) => noPeriodo(paciente.criadoEm.slice(0, 10), inicio, fim));
  const idsNovos = new Set(novos.map((paciente) => paciente.id));
  const idsAtendidos = new Set(atendidos.map((item) => item.pacienteId));
  const recorrentes = [...idsAtendidos].filter((id) => !idsNovos.has(id)).length;

  const produtividade = profissionais
    .filter((profissional) => profissional.status === "ativo")
    .map((profissional) => {
      const lista = agendamentosPeriodo.filter((item) => item.profissionalId === profissional.id);
      const realizados = lista.filter((item) => item.status === "atendido");
      const faltou = lista.filter((item) => item.status === "faltou");
      return {
        id: profissional.id,
        nome: profissional.nome,
        especialidade: profissional.especialidades[0] ?? "—",
        agendamentos: lista.length,
        realizados: realizados.length,
        faltas: faltou.length,
        faturamento: realizados.reduce((total, item) => total + item.valor, 0),
        ocupacao: lista.length === 0 ? 0 : (realizados.length / lista.length) * 100,
      };
    })
    .sort((a, b) => b.realizados - a.realizados);

  const comissoesPeriodo = comissoes.filter((comissao) => {
    const [ano, mes] = comissao.competencia.split("-").map(Number);
    const data = new Date(ano, mes - 1, 15);
    return !isBefore(data, inicio) && !isAfter(data, fim);
  });

  return {
    intervalo: {
      inicio: formatISODate(inicio),
      fim: formatISODate(fim),
      label: intervalo.label,
    },
    faturamento: {
      total: atendidos.reduce((total, item) => total + item.valor, 0),
      quantidade: atendidos.length,
      ticketMedio:
        atendidos.length === 0 ? 0 : atendidos.reduce((total, item) => total + item.valor, 0) / atendidos.length,
      evolucao: pontosTempo.map((ponto) => ({
        periodo: ponto.label,
        valor: atendidos.filter((item) => ponto.testa(item.data)).reduce((total, item) => total + item.valor, 0),
      })),
      porProfissional,
      porConvenio: [...porConvenioMap.entries()].map(([id, item]) => ({ id, ...item })),
      porProcedimento,
    },
    atendimentos: {
      realizados: atendidos.length,
      cancelados: cancelados.length,
      faltas: faltas.length,
      total: agendamentosPeriodo.length,
      porStatus: [
        { nome: "Atendido", valor: atendidos.length },
        { nome: "Cancelado", valor: cancelados.length },
        { nome: "Faltou", valor: faltas.length },
        {
          nome: "Demais",
          valor: agendamentosPeriodo.length - atendidos.length - cancelados.length - faltas.length,
        },
      ],
      evolucao: pontosTempo.map((ponto) => ({
        periodo: ponto.label,
        realizados: atendidos.filter((item) => ponto.testa(item.data)).length,
        cancelados: cancelados.filter((item) => ponto.testa(item.data)).length,
        faltas: faltas.filter((item) => ponto.testa(item.data)).length,
      })),
    },
    inadimplencia: {
      total: cobrancasAtrasadas.reduce((soma, item) => soma + item.valor, 0),
      quantidade: cobrancasAtrasadas.length,
      pacientes: [...inadimplentesMap.entries()]
        .map(([id, item]) => ({ id, ...item }))
        .sort((a, b) => b.valor - a.valor),
    },
    pacientes: {
      novos: novos.length,
      recorrentes,
      evolucao: pontosTempo.map((ponto) => ({
        periodo: ponto.label,
        novos: novos.filter((paciente) => ponto.testa(paciente.criadoEm.slice(0, 10))).length,
        recorrentes: atendidos.filter(
          (item) => ponto.testa(item.data) && !idsNovos.has(item.pacienteId),
        ).length,
      })),
    },
    produtividade,
    comissoes: {
      total: comissoesPeriodo.reduce((total, item) => total + item.valorComissao, 0),
      lista: comissoesPeriodo,
    },
    conveniosAtivos: convenios.filter((convenio) => convenio.status === "ativo").length,
  };
}

export type RelatoriosData = ReturnType<typeof getRelatorios>;
