import { addDays, addMonths, format, isBefore, isSameMonth, isWithinInterval, parseISO, startOfMonth, subDays, subMonths } from "date-fns";

import type {
  Cobranca,
  Comissao,
  Despesa,
  FluxoCaixaPonto,
  FormaPagamento,
  LoteConvenio,
  Parcela,
} from "@/types";
import { convenios } from "./catalogo";
import { agendamentos, hoje } from "./agenda";
import { pacientes, profissionais } from "./pessoas";

function makeRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

const formasPagamento: FormaPagamento[] = ["dinheiro", "cartao_credito", "cartao_debito", "pix", "boleto"];

function gerarCobrancas(): Cobranca[] {
  const rng = makeRng(4242);

  const relevantes = agendamentos.filter(
    (agendamento) => agendamento.status === "atendido" || agendamento.status === "confirmado",
  );

  return relevantes.map((agendamento, index) => {
    const vencimento = agendamento.data;
    const venceu = isBefore(parseISO(vencimento), hoje);
    const sorteio = rng();

    let status: Cobranca["status"];
    if (agendamento.status === "confirmado") {
      status = "pendente";
    } else if (sorteio < 0.74) {
      status = "pago";
    } else if (sorteio < 0.86) {
      status = venceu ? "atrasado" : "pendente";
    } else if (sorteio < 0.95) {
      status = "parcelado";
    } else {
      status = "cancelado";
    }

    const formaPagamento = agendamento.particular
      ? formasPagamento[Math.floor(rng() * formasPagamento.length)]
      : "convenio";

    const parcelas: Parcela[] =
      status === "parcelado"
        ? Array.from({ length: 3 }, (_, parcelaIndex) => {
            const vencimentoParcela = addMonths(parseISO(vencimento), parcelaIndex);
            const parcelaVenceu = isBefore(vencimentoParcela, hoje);
            return {
              numero: parcelaIndex + 1,
              valor: Number((agendamento.valor / 3).toFixed(2)),
              vencimento: format(vencimentoParcela, "yyyy-MM-dd"),
              status: parcelaIndex === 0 ? "pago" : parcelaVenceu ? "atrasado" : "pendente",
              pagoEm: parcelaIndex === 0 ? format(vencimentoParcela, "yyyy-MM-dd") : undefined,
            };
          })
        : [];

    return {
      id: `cob-${index + 1}`,
      pacienteId: agendamento.pacienteId,
      pacienteNome: agendamento.pacienteNome,
      agendamentoId: agendamento.id,
      descricao: agendamento.procedimentoNome,
      valor: agendamento.valor,
      formaPagamento: status === "pago" || status === "parcelado" ? formaPagamento : null,
      convenioId: agendamento.convenioId,
      status,
      vencimento,
      parcelas,
      pagoEm: status === "pago" ? vencimento : undefined,
      criadoEm: `${agendamento.data}T08:00:00Z`,
    };
  });
}

export const cobrancas: Cobranca[] = gerarCobrancas();

const categoriasDespesa = [
  "Aluguel",
  "Folha de pagamento",
  "Comissões",
  "Insumos e materiais",
  "Energia elétrica",
  "Água",
  "Internet e telefonia",
  "Software e sistemas",
  "Marketing",
  "Manutenção",
  "Impostos",
  "Limpeza",
];

function gerarDespesas(): Despesa[] {
  const rng = makeRng(9001);
  const base: Omit<Despesa, "id" | "vencimento" | "status" | "pagoEm">[] = [
    { descricao: "Aluguel da unidade Centro", categoria: "Aluguel", fornecedor: "Imobiliária Prado", valor: 12500, recorrente: true, formaPagamento: "boleto" },
    { descricao: "Folha de pagamento — administrativo", categoria: "Folha de pagamento", fornecedor: "Folha interna", valor: 38400, recorrente: true, formaPagamento: "pix" },
    { descricao: "Comissões de profissionais", categoria: "Comissões", fornecedor: "Corpo clínico", valor: 61200, recorrente: true, formaPagamento: "pix" },
    { descricao: "Materiais odontológicos", categoria: "Insumos e materiais", fornecedor: "Dental Supply SP", valor: 7850, recorrente: false, formaPagamento: "boleto" },
    { descricao: "Energia elétrica", categoria: "Energia elétrica", fornecedor: "CPFL Paulista", valor: 4320, recorrente: true, formaPagamento: "boleto" },
    { descricao: "Água e esgoto", categoria: "Água", fornecedor: "DAERP", valor: 890, recorrente: true, formaPagamento: "boleto" },
    { descricao: "Link dedicado e telefonia", categoria: "Internet e telefonia", fornecedor: "Vivo Empresas", valor: 1180, recorrente: true, formaPagamento: "boleto" },
    { descricao: "Licença do sistema de gestão", categoria: "Software e sistemas", fornecedor: "ClinicERP", valor: 2400, recorrente: true, formaPagamento: "cartao_credito" },
    { descricao: "Campanha de captação local", categoria: "Marketing", fornecedor: "Agência Nortear", valor: 5600, recorrente: false, formaPagamento: "pix" },
    { descricao: "Manutenção de equipamentos", categoria: "Manutenção", fornecedor: "TecnoMed Assistência", valor: 3250, recorrente: false, formaPagamento: "boleto" },
    { descricao: "Simples Nacional", categoria: "Impostos", fornecedor: "Receita Federal", valor: 18900, recorrente: true, formaPagamento: "boleto" },
    { descricao: "Serviço de limpeza terceirizado", categoria: "Limpeza", fornecedor: "Limpe Bem Serviços", valor: 4100, recorrente: true, formaPagamento: "pix" },
    { descricao: "Insumos de enfermagem", categoria: "Insumos e materiais", fornecedor: "MedFarma Distribuidora", valor: 6740, recorrente: false, formaPagamento: "boleto" },
    { descricao: "Descarte de resíduos", categoria: "Manutenção", fornecedor: "EcoSaúde Ambiental", valor: 1450, recorrente: true, formaPagamento: "boleto" },
  ];

  const lista: Despesa[] = [];
  let sequencia = 0;

  for (let mesOffset = 2; mesOffset >= 0; mesOffset -= 1) {
    const mes = startOfMonth(subMonths(hoje, mesOffset));

    for (const despesa of base) {
      if (!despesa.recorrente && rng() < 0.4) continue;

      sequencia += 1;
      const diaVencimento = 5 + Math.floor(rng() * 22);
      const vencimento = addDays(mes, diaVencimento - 1);
      const venceu = isBefore(vencimento, hoje);
      const pago = mesOffset > 0 ? rng() < 0.95 : venceu ? rng() < 0.7 : false;

      lista.push({
        ...despesa,
        id: `desp-${sequencia}`,
        valor: Number((despesa.valor * (0.92 + rng() * 0.16)).toFixed(2)),
        vencimento: format(vencimento, "yyyy-MM-dd"),
        status: pago ? "pago" : venceu ? "vencido" : "a_pagar",
        pagoEm: pago ? format(vencimento, "yyyy-MM-dd") : undefined,
      });
    }
  }

  return lista;
}

export const despesas: Despesa[] = gerarDespesas();
export { categoriasDespesa };

function gerarFluxoDiario(): FluxoCaixaPonto[] {
  const rng = makeRng(777);

  return Array.from({ length: 30 }, (_, index) => {
    const data = subDays(hoje, 29 - index);
    const diaSemana = data.getDay();
    const fatorDia = diaSemana === 0 ? 0.05 : diaSemana === 6 ? 0.45 : 1;
    const entradas = Number((9000 * fatorDia * (0.7 + rng() * 0.7)).toFixed(2));
    const saidas = Number((6200 * fatorDia * (0.6 + rng() * 0.8)).toFixed(2));

    return {
      periodo: format(data, "dd/MM"),
      entradas,
      saidas,
      saldo: Number((entradas - saidas).toFixed(2)),
    };
  });
}

function gerarFluxoMensal(): FluxoCaixaPonto[] {
  const rng = makeRng(313);

  return Array.from({ length: 12 }, (_, index) => {
    const data = subMonths(hoje, 11 - index);
    const crescimento = 1 + index * 0.028;
    const entradas = Number((178000 * crescimento * (0.9 + rng() * 0.2)).toFixed(2));
    const saidas = Number((131000 * crescimento * (0.9 + rng() * 0.18)).toFixed(2));

    return {
      periodo: format(data, "MMM/yy"),
      entradas,
      saidas,
      saldo: Number((entradas - saidas).toFixed(2)),
    };
  });
}

export const fluxoCaixaDiario: FluxoCaixaPonto[] = gerarFluxoDiario();
export const fluxoCaixaMensal: FluxoCaixaPonto[] = gerarFluxoMensal();

function gerarLotesConvenio(): LoteConvenio[] {
  const rng = makeRng(5150);
  const lista: LoteConvenio[] = [];
  let sequencia = 0;

  for (let mesOffset = 3; mesOffset >= 0; mesOffset -= 1) {
    const competencia = format(subMonths(hoje, mesOffset), "yyyy-MM");

    for (const convenio of convenios.filter((item) => item.status === "ativo")) {
      sequencia += 1;
      const quantidadeGuias = 40 + Math.floor(rng() * 180);
      const valorApresentado = Number((quantidadeGuias * (85 + rng() * 60)).toFixed(2));
      const glosaPercentual = rng() * 0.12;
      const valorGlosado = Number((valorApresentado * glosaPercentual).toFixed(2));

      let status: LoteConvenio["status"];
      let valorRecebido = 0;

      if (mesOffset === 0) {
        status = "aberto";
      } else if (mesOffset === 1) {
        status = "enviado";
      } else if (glosaPercentual > 0.09) {
        status = "glosado";
        valorRecebido = Number((valorApresentado - valorGlosado).toFixed(2));
      } else if (rng() < 0.25) {
        status = "parcial";
        valorRecebido = Number(((valorApresentado - valorGlosado) * 0.6).toFixed(2));
      } else {
        status = "pago";
        valorRecebido = Number((valorApresentado - valorGlosado).toFixed(2));
      }

      const enviadoEm =
        status === "aberto" ? undefined : format(addDays(startOfMonth(subMonths(hoje, mesOffset - 1)), 4), "yyyy-MM-dd");

      lista.push({
        id: `lote-${sequencia}`,
        convenioId: convenio.id,
        convenioNome: convenio.nome,
        competencia,
        quantidadeGuias,
        valorApresentado,
        valorGlosado: status === "aberto" || status === "enviado" ? 0 : valorGlosado,
        valorRecebido,
        status,
        enviadoEm,
        previsaoPagamento: enviadoEm
          ? format(addDays(parseISO(enviadoEm), convenio.prazoPagamentoDias), "yyyy-MM-dd")
          : undefined,
      });
    }
  }

  return lista;
}

export const lotesConvenio: LoteConvenio[] = gerarLotesConvenio();

function gerarComissoes(): Comissao[] {
  const rng = makeRng(2718);
  const lista: Comissao[] = [];
  let sequencia = 0;

  for (let mesOffset = 2; mesOffset >= 0; mesOffset -= 1) {
    const competencia = format(subMonths(hoje, mesOffset), "yyyy-MM");

    for (const profissional of profissionais) {
      if (profissional.status === "inativo" && mesOffset === 0) continue;
      if (profissional.formaRemuneracao === "fixo") continue;

      sequencia += 1;
      const atendimentosMes = 28 + Math.floor(rng() * 90);
      const faturamentoGerado = Number((atendimentosMes * (150 + rng() * 220)).toFixed(2));
      const valorComissao = Number(((faturamentoGerado * profissional.percentualComissao) / 100).toFixed(2));

      lista.push({
        id: `com-${sequencia}`,
        profissionalId: profissional.id,
        profissionalNome: profissional.nome,
        competencia,
        atendimentos: atendimentosMes,
        faturamentoGerado,
        percentual: profissional.percentualComissao,
        valorComissao,
        status: mesOffset === 0 ? "prevista" : mesOffset === 1 ? "aprovada" : "paga",
        pagoEm: mesOffset === 2 ? format(addDays(startOfMonth(subMonths(hoje, 1)), 9), "yyyy-MM-dd") : undefined,
      });
    }
  }

  return lista;
}

export const comissoes: Comissao[] = gerarComissoes();

export function getSaldoDevedorPaciente(pacienteId: string) {
  return cobrancas
    .filter(
      (cobranca) =>
        cobranca.pacienteId === pacienteId && (cobranca.status === "pendente" || cobranca.status === "atrasado"),
    )
    .reduce((total, cobranca) => total + cobranca.valor, 0);
}

export function getPacientesInadimplentes() {
  return pacientes
    .map((paciente) => ({
      paciente,
      valorEmAberto: cobrancas
        .filter((cobranca) => cobranca.pacienteId === paciente.id && cobranca.status === "atrasado")
        .reduce((total, cobranca) => total + cobranca.valor, 0),
    }))
    .filter((item) => item.valorEmAberto > 0)
    .sort((a, b) => b.valorEmAberto - a.valorEmAberto);
}

/** Usado pelo dashboard enquanto ele ainda é mock. */
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
