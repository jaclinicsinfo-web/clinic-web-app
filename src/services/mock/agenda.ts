import { addDays, format, getDay, startOfDay } from "date-fns";

import type { Agendamento, AgendamentoStatus, Atendimento, AcompanhamentoClinico, BloqueioAgenda, ListaEsperaItem } from "@/types";
import { getConvenioNome, procedimentos, salas } from "./catalogo";
import { pacientes, profissionais } from "./pessoas";

/** Âncora estável (meia-noite de hoje) para que servidor e cliente gerem os mesmos dados. */
export const hoje = startOfDay(new Date());

/** Gerador pseudoaleatório determinístico — mantém o mock estável entre renders. */
function makeRng(seed: number) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function pick<T>(rng: () => number, items: T[]) {
  return items[Math.floor(rng() * items.length)];
}

function addMinutes(time: string, minutes: number) {
  const [hour, minute] = time.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const DIAS_PASSADOS = 30;
const DIAS_FUTUROS = 21;

function statusParaDia(rng: () => number, offsetDias: number, horaInicio: string): AgendamentoStatus {
  if (offsetDias < 0) {
    const sorteio = rng();
    if (sorteio < 0.82) return "atendido";
    if (sorteio < 0.91) return "faltou";
    return "cancelado";
  }

  if (offsetDias === 0) {
    const horaAtual = new Date().getHours();
    const horaSlot = Number(horaInicio.split(":")[0]);
    if (horaSlot < horaAtual - 1) return rng() < 0.9 ? "atendido" : "faltou";
    if (horaSlot <= horaAtual) return "em_atendimento";
    if (horaSlot === horaAtual + 1) return "check_in";
    return rng() < 0.6 ? "confirmado" : "agendado";
  }

  const sorteio = rng();
  if (sorteio < 0.45) return "confirmado";
  if (sorteio < 0.95) return "agendado";
  return "cancelado";
}

function gerarAgendamentos(): Agendamento[] {
  const lista: Agendamento[] = [];
  const ativos = profissionais.filter((profissional) => profissional.status === "ativo");
  const pacientesAtivos = pacientes.filter((paciente) => paciente.status !== "arquivado");
  let sequencia = 0;

  for (let offset = -DIAS_PASSADOS; offset <= DIAS_FUTUROS; offset += 1) {
    const data = addDays(hoje, offset);
    const diaSemana = getDay(data);
    if (diaSemana === 0) continue;

    const rng = makeRng((offset + 100) * 7919);

    for (const profissional of ativos) {
      const grade = profissional.gradeHorarios.find((item) => item.diaSemana === diaSemana);
      if (!grade) continue;

      const habilitados = procedimentos.filter(
        (procedimento) =>
          procedimento.status === "ativo" && profissional.procedimentosHabilitados.includes(procedimento.id),
      );
      if (habilitados.length === 0) continue;

      let horaAtual = grade.horaInicio;
      const limite = grade.horaFim;

      while (horaAtual < limite) {
        const procedimento = pick(rng, habilitados);
        const horaFim = addMinutes(horaAtual, procedimento.duracaoPadraoMin);
        if (horaFim > limite) break;

        // Deixa parte da grade livre para simular ocupação real da agenda.
        if (rng() < 0.28) {
          horaAtual = addMinutes(horaAtual, 30);
          continue;
        }

        const paciente = pick(rng, pacientesAtivos);
        const usaConvenio = Boolean(paciente.convenioId) && rng() < 0.75;
        const convenioId = usaConvenio ? paciente.convenioId : null;
        const valorConvenio = convenioId
          ? procedimento.valoresPorConvenio.find((item) => item.convenioId === convenioId)?.valor
          : undefined;

        sequencia += 1;
        lista.push({
          id: `ag-${sequencia}`,
          pacienteId: paciente.id,
          pacienteNome: paciente.nome,
          profissionalId: profissional.id,
          profissionalNome: profissional.nome,
          procedimentoId: procedimento.id,
          procedimentoNome: procedimento.nome,
          data: format(data, "yyyy-MM-dd"),
          horaInicio: horaAtual,
          horaFim,
          sala: pick(rng, salas),
          convenioId,
          particular: !convenioId,
          valor: valorConvenio ?? procedimento.valorParticular,
          status: statusParaDia(rng, offset, horaAtual),
          observacoes: rng() < 0.3 ? "Paciente relatou desconforto persistente." : undefined,
          lembreteEnviado: offset >= 0 ? rng() < 0.7 : true,
          criadoPor: "Priscila Gomes",
          criadoEm: format(addDays(data, -3), "yyyy-MM-dd'T'09:00:00'Z'"),
        });

        horaAtual = addMinutes(horaAtual, procedimento.duracaoPadraoMin);
      }
    }
  }

  return lista;
}

export const agendamentos: Agendamento[] = gerarAgendamentos();

export const bloqueiosAgenda: BloqueioAgenda[] = [
  {
    id: "blq-1",
    profissionalId: "prof-1",
    data: format(addDays(hoje, 1), "yyyy-MM-dd"),
    horaInicio: "12:00",
    horaFim: "13:00",
    motivo: "Almoço",
  },
  {
    id: "blq-2",
    profissionalId: "prof-3",
    data: format(addDays(hoje, 3), "yyyy-MM-dd"),
    horaInicio: "08:00",
    horaFim: "18:00",
    motivo: "Congresso de Dermatologia",
  },
  {
    id: "blq-3",
    profissionalId: "prof-2",
    data: format(addDays(hoje, 5), "yyyy-MM-dd"),
    horaInicio: "15:00",
    horaFim: "19:00",
    motivo: "Folga programada",
  },
];

export const listaEspera: ListaEsperaItem[] = [
  {
    id: "esp-1",
    pacienteId: "pac-6",
    pacienteNome: "Rodrigo Salgado Pinto",
    telefone: "16993210987",
    profissionalId: "prof-2",
    procedimentoNome: "Consulta clínica",
    preferenciaPeriodo: "tarde",
    criadoEm: format(addDays(hoje, -2), "yyyy-MM-dd'T'10:30:00'Z'"),
  },
  {
    id: "esp-2",
    pacienteId: "pac-9",
    pacienteNome: "Tatiane Duarte Rossi",
    telefone: "16990987654",
    profissionalId: "prof-5",
    procedimentoNome: "Avaliação nutricional",
    preferenciaPeriodo: "manha",
    criadoEm: format(addDays(hoje, -1), "yyyy-MM-dd'T'14:10:00'Z'"),
  },
  {
    id: "esp-3",
    pacienteId: "pac-12",
    pacienteNome: "Marcos Vinícius Teles",
    telefone: "16987654321",
    procedimentoNome: "Limpeza dental",
    preferenciaPeriodo: "qualquer",
    criadoEm: format(hoje, "yyyy-MM-dd'T'08:45:00'Z'"),
  },
];

/** Evoluções clínicas curadas — jornada da avaliação inicial até a alta, quando houver. */
const atendimentosCurados: Atendimento[] = [
  {
    id: "at-c2",
    agendamentoId: "ag-curado-2",
    pacienteId: "pac-1",
    profissionalId: "prof-1",
    profissionalNome: "Dra. Helena Marques",
    data: format(addDays(hoje, -75), "yyyy-MM-dd"),
    procedimentoRealizado: "Consulta clínica",
    evolucao:
      "Primeira avaliação cardiológica. Relata cefaleia occipital frequente e tontura ao levantar. PA 148/95 mmHg em duas medições. Iniciada losartana 50mg/dia e orientação dietética.",
    anexos: [],
    proximoRetornoSugerido: format(addDays(hoje, -14), "yyyy-MM-dd"),
    criadoEm: format(addDays(hoje, -75), "yyyy-MM-dd'T'11:00:00'Z'"),
    acompanhamentoId: "acomp-1",
    tipoRegistro: "avaliacao_inicial",
    queixaPrincipal: "Cefaleia occipital e tontura postural",
    quadroClinico: "Hipertensão não controlada. PA 148/95 mmHg. Cefaleia frequente, tontura ao levantar.",
    conduta: "Início de losartana 50 mg/dia, orientação dietética e retorno em 60 dias.",
    respostaAoTratamento: "estavel",
  },
  {
    id: "at-c1",
    agendamentoId: "ag-curado-1",
    pacienteId: "pac-1",
    profissionalId: "prof-1",
    profissionalNome: "Dra. Helena Marques",
    data: format(addDays(hoje, -14), "yyyy-MM-dd"),
    procedimentoRealizado: "Consulta cardiológica",
    evolucao:
      "Paciente refere melhora do quadro de cefaleia após ajuste da losartana. PA 128/82 mmHg. Mantida dose atual. Solicitado MAPA de 24h e reavaliação em 60 dias.",
    anexos: [
      {
        id: "anx-1",
        nome: "eletrocardiograma.pdf",
        tipo: "application/pdf",
        tamanhoKb: 412,
        url: "#",
        criadoEm: format(addDays(hoje, -14), "yyyy-MM-dd'T'10:20:00'Z'"),
      },
    ],
    proximoRetornoSugerido: format(addDays(hoje, 46), "yyyy-MM-dd"),
    criadoEm: format(addDays(hoje, -14), "yyyy-MM-dd'T'10:30:00'Z'"),
    acompanhamentoId: "acomp-1",
    tipoRegistro: "evolucao",
    queixaPrincipal: "Cefaleia em regressão",
    quadroClinico: "PA 128/82 mmHg. Cefaleia ocasional. Sem tontura. Boa adesão à medicação.",
    conduta: "Manter losartana 50 mg. Solicitar MAPA de 24h. Reavaliação em 60 dias.",
    respostaAoTratamento: "melhorou",
  },
  {
    id: "at-c2b",
    agendamentoId: "ag-curado-2b",
    pacienteId: "pac-2",
    profissionalId: "prof-1",
    profissionalNome: "Dra. Helena Marques",
    data: format(addDays(hoje, -96), "yyyy-MM-dd"),
    procedimentoRealizado: "Consulta clínica",
    evolucao:
      "Avaliação inicial de diabetes tipo 2 descompensado. Hemoglobina glicada 8,6%. Relata polidipsia e cansaço. Iniciada metformina 850 mg 2x/dia e orientação nutricional.",
    anexos: [],
    proximoRetornoSugerido: format(addDays(hoje, -9), "yyyy-MM-dd"),
    criadoEm: format(addDays(hoje, -96), "yyyy-MM-dd'T'14:00:00'Z'"),
    acompanhamentoId: "acomp-2",
    tipoRegistro: "avaliacao_inicial",
    queixaPrincipal: "Cansaço, sede excessiva e glicemia elevada",
    quadroClinico: "Diabetes tipo 2 descompensado. HbA1c 8,6%. Sobrepeso. Sedentário.",
    conduta: "Metformina 850 mg 2x/dia, plano alimentar e atividade física 150 min/semana.",
    respostaAoTratamento: "estavel",
  },
  {
    id: "at-c3",
    agendamentoId: "ag-curado-3",
    pacienteId: "pac-2",
    profissionalId: "prof-1",
    profissionalNome: "Dra. Helena Marques",
    data: format(addDays(hoje, -9), "yyyy-MM-dd"),
    procedimentoRealizado: "Retorno de consulta",
    evolucao:
      "Hemoglobina glicada 7,8% (anterior 8,6%). Boa adesão à metformina. Reforçada orientação de atividade física 150 min/semana. Encaminhado à nutrição.",
    anexos: [
      {
        id: "anx-2",
        nome: "hemograma-completo.pdf",
        tipo: "application/pdf",
        tamanhoKb: 288,
        url: "#",
        criadoEm: format(addDays(hoje, -9), "yyyy-MM-dd'T'15:00:00'Z'"),
      },
      {
        id: "anx-3",
        nome: "glicemia-jejum.pdf",
        tipo: "application/pdf",
        tamanhoKb: 156,
        url: "#",
        criadoEm: format(addDays(hoje, -9), "yyyy-MM-dd'T'15:02:00'Z'"),
      },
    ],
    proximoRetornoSugerido: format(addDays(hoje, 81), "yyyy-MM-dd"),
    criadoEm: format(addDays(hoje, -9), "yyyy-MM-dd'T'15:10:00'Z'"),
    acompanhamentoId: "acomp-2",
    tipoRegistro: "retorno",
    queixaPrincipal: "Controle glicêmico em evolução",
    quadroClinico: "HbA1c 7,8% (queda de 0,8 ponto). Melhora da sede e do cansaço. Ainda sedentário.",
    conduta: "Manter metformina. Encaminhamento à nutrição. Reavaliação em 90 dias.",
    respostaAoTratamento: "melhorou",
  },
  {
    id: "at-c4a",
    agendamentoId: "ag-curado-4a",
    pacienteId: "pac-3",
    profissionalId: "prof-3",
    profissionalNome: "Dra. Camila Ferraz",
    data: format(addDays(hoje, -42), "yyyy-MM-dd"),
    procedimentoRealizado: "Consulta clínica",
    evolucao:
      "Avaliação estética do terço superior. Queixa de linhas de expressão em glabela e região frontal. Sem contraindicações. Planejada toxina botulínica.",
    anexos: [],
    proximoRetornoSugerido: format(addDays(hoje, -21), "yyyy-MM-dd"),
    criadoEm: format(addDays(hoje, -42), "yyyy-MM-dd'T'16:00:00'Z'"),
    acompanhamentoId: "acomp-4",
    tipoRegistro: "avaliacao_inicial",
    queixaPrincipal: "Linhas de expressão em glabela e fronte",
    quadroClinico: "Rugas dinâmicas de terço superior, sem flacidez importante. Pele sem lesões ativas.",
    conduta: "Programar aplicação de toxina botulínica (glabela, frontal e periorbicular).",
    respostaAoTratamento: "estavel",
  },
  {
    id: "at-c4",
    agendamentoId: "ag-curado-4",
    pacienteId: "pac-3",
    profissionalId: "prof-3",
    profissionalNome: "Dra. Camila Ferraz",
    data: format(addDays(hoje, -21), "yyyy-MM-dd"),
    procedimentoRealizado: "Aplicação de toxina botulínica",
    evolucao:
      "Aplicação em terço superior da face — glabela, frontal e periorbicular. Total de 32 UI. Sem intercorrências. Orientada a evitar deitar-se nas 4 horas seguintes.",
    anexos: [
      {
        id: "anx-4",
        nome: "termo-consentimento.pdf",
        tipo: "application/pdf",
        tamanhoKb: 96,
        url: "#",
        criadoEm: format(addDays(hoje, -21), "yyyy-MM-dd'T'16:30:00'Z'"),
      },
    ],
    proximoRetornoSugerido: format(addDays(hoje, -7), "yyyy-MM-dd"),
    criadoEm: format(addDays(hoje, -21), "yyyy-MM-dd'T'16:45:00'Z'"),
    acompanhamentoId: "acomp-4",
    tipoRegistro: "evolucao",
    queixaPrincipal: "Linhas de expressão — tratamento aplicado",
    quadroClinico: "Aplicação realizada sem intercorrências. Efeito ainda em instalação.",
    conduta: "Retorno em 14 dias para avaliação do resultado e alta do protocolo.",
    respostaAoTratamento: "estavel",
  },
  {
    id: "at-c4b",
    agendamentoId: "ag-curado-4b",
    pacienteId: "pac-3",
    profissionalId: "prof-3",
    profissionalNome: "Dra. Camila Ferraz",
    data: format(addDays(hoje, -7), "yyyy-MM-dd"),
    procedimentoRealizado: "Retorno de consulta",
    evolucao:
      "Resultado satisfatório. Suavização das linhas glabelares e frontais, simetria preservada. Paciente satisfeita. Alta do protocolo atual, com retorno sugerido em 4 a 6 meses.",
    anexos: [],
    criadoEm: format(addDays(hoje, -7), "yyyy-MM-dd'T'16:20:00'Z'"),
    acompanhamentoId: "acomp-4",
    tipoRegistro: "alta",
    queixaPrincipal: "Reavaliação pós-toxina",
    quadroClinico: "Terço superior relaxado, sem assimetrias. Sem ptose ou complicações.",
    conduta: "Alta do protocolo. Retorno em 4–6 meses se desejar manutenção.",
    respostaAoTratamento: "resolvido",
  },
  {
    id: "at-c5a",
    agendamentoId: "ag-curado-5a",
    pacienteId: "pac-5",
    profissionalId: "prof-6",
    profissionalNome: "Dr. Everton Lima",
    data: format(addDays(hoje, -56), "yyyy-MM-dd"),
    procedimentoRealizado: "Sessão de fisioterapia",
    evolucao:
      "Avaliação inicial pós-artrose de joelho direito. Dor 8/10 na EVA. Flexão limitada a 70°. Marcha claudicante. Iniciado protocolo de 12 sessões: analgesia, ganho de amplitude e fortalecimento de quadríceps.",
    anexos: [],
    proximoRetornoSugerido: format(addDays(hoje, -42), "yyyy-MM-dd"),
    criadoEm: format(addDays(hoje, -56), "yyyy-MM-dd'T'09:40:00'Z'"),
    acompanhamentoId: "acomp-3",
    tipoRegistro: "avaliacao_inicial",
    queixaPrincipal: "Dor e limitação de movimento no joelho direito",
    quadroClinico: "Artrose de joelho D. Dor EVA 8/10. Flexão 70°. Marcha claudicante. Dificuldade para subir escadas.",
    conduta: "Protocolo de 12 sessões: analgesia, ADM e fortalecimento de quadríceps.",
    respostaAoTratamento: "estavel",
    escalaDor: 8,
  },
  {
    id: "at-c5b",
    agendamentoId: "ag-curado-5b",
    pacienteId: "pac-5",
    profissionalId: "prof-6",
    profissionalNome: "Dr. Everton Lima",
    data: format(addDays(hoje, -28), "yyyy-MM-dd"),
    procedimentoRealizado: "Sessão de fisioterapia",
    evolucao:
      "Sessão 4 de 12. Dor 5/10. Flexão em 90°. Ainda refere dificuldade em escadas, mas marcha mais estável. Progressão da carga no fortalecimento.",
    anexos: [],
    proximoRetornoSugerido: format(addDays(hoje, -4), "yyyy-MM-dd"),
    criadoEm: format(addDays(hoje, -28), "yyyy-MM-dd'T'09:45:00'Z'"),
    acompanhamentoId: "acomp-3",
    tipoRegistro: "evolucao",
    queixaPrincipal: "Dor em joelho direito em redução",
    quadroClinico: "EVA 5/10. Flexão 90°. Marcha mais estável. Escadas ainda limitadas.",
    conduta: "Progredir carga no quadríceps. Manter analgesia se necessário.",
    respostaAoTratamento: "melhorou",
    escalaDor: 5,
  },
  {
    id: "at-c5",
    agendamentoId: "ag-curado-5",
    pacienteId: "pac-5",
    profissionalId: "prof-6",
    profissionalNome: "Dr. Everton Lima",
    data: format(addDays(hoje, -4), "yyyy-MM-dd"),
    procedimentoRealizado: "Sessão de fisioterapia",
    evolucao:
      "Sessão 8 de 12. Ganho de amplitude em flexão de joelho direito (de 95° para 108°). Dor referida 3/10 na escala EVA. Mantido protocolo de fortalecimento de quadríceps.",
    anexos: [],
    proximoRetornoSugerido: format(addDays(hoje, 3), "yyyy-MM-dd"),
    criadoEm: format(addDays(hoje, -4), "yyyy-MM-dd'T'09:50:00'Z'"),
    acompanhamentoId: "acomp-3",
    tipoRegistro: "evolucao",
    queixaPrincipal: "Reabilitação de joelho direito",
    quadroClinico: "EVA 3/10. Flexão 108°. Sobe escadas com menor apoio. Independente na marcha.",
    conduta: "Manter protocolo até a 12ª sessão. Avaliar alta funcional na última sessão.",
    respostaAoTratamento: "melhorou",
    escalaDor: 3,
  },
  {
    id: "at-c6",
    agendamentoId: "ag-curado-6",
    pacienteId: "pac-8",
    profissionalId: "prof-1",
    profissionalNome: "Dra. Helena Marques",
    data: format(addDays(hoje, -2), "yyyy-MM-dd"),
    procedimentoRealizado: "Eletrocardiograma",
    evolucao:
      "ECG evidencia fibrilação atrial de baixa resposta ventricular. Encaminhado para avaliação de anticoagulação. Orientado retorno imediato em caso de dispneia ou dor precordial.",
    anexos: [
      {
        id: "anx-5",
        nome: "ecg-traçado.pdf",
        tipo: "application/pdf",
        tamanhoKb: 524,
        url: "#",
        criadoEm: format(addDays(hoje, -2), "yyyy-MM-dd'T'11:15:00'Z'"),
      },
    ],
    proximoRetornoSugerido: format(addDays(hoje, 5), "yyyy-MM-dd"),
    criadoEm: format(addDays(hoje, -2), "yyyy-MM-dd'T'11:20:00'Z'"),
    acompanhamentoId: "acomp-5",
    tipoRegistro: "avaliacao_inicial",
    queixaPrincipal: "Palpitações e achado de fibrilação atrial",
    quadroClinico: "FA de baixa resposta ventricular no ECG. Hemodinamicamente estável. Sem dor precordial no momento.",
    conduta: "Avaliar anticoagulação. Retorno em 7 dias ou imediato se dispneia/dor.",
    respostaAoTratamento: "estavel",
  },
];

/** Complementa o prontuário com evoluções resumidas dos agendamentos já atendidos. */
function gerarAtendimentosDeAgendamentos(): Atendimento[] {
  return agendamentos
    .filter((agendamento) => agendamento.status === "atendido")
    .slice(0, 60)
    .map((agendamento, index) => ({
      id: `at-g${index + 1}`,
      agendamentoId: agendamento.id,
      pacienteId: agendamento.pacienteId,
      profissionalId: agendamento.profissionalId,
      profissionalNome: agendamento.profissionalNome,
      data: agendamento.data,
      procedimentoRealizado: agendamento.procedimentoNome,
      evolucao: `${agendamento.procedimentoNome} realizado conforme planejado. Paciente estável, sem intercorrências durante o atendimento. Conduta mantida e orientações reforçadas.`,
      anexos: [],
      criadoEm: `${agendamento.data}T${agendamento.horaFim}:00Z`,
      tipoRegistro: "evolucao" as const,
      respostaAoTratamento: "estavel" as const,
    }));
}

export const atendimentos: Atendimento[] = [...atendimentosCurados, ...gerarAtendimentosDeAgendamentos()];

export const acompanhamentos: AcompanhamentoClinico[] = [
  {
    id: "acomp-1",
    pacienteId: "pac-1",
    profissionalId: "prof-1",
    profissionalNome: "Dra. Helena Marques",
    especialidade: "Cardiologia",
    titulo: "Hipertensão arterial e cefaleia",
    queixaInicial: "Cefaleia occipital frequente e tontura ao levantar.",
    quadroInicial: "PA 148/95 mmHg, cefaleia persistente, sem tratamento anti-hipertensivo prévio.",
    objetivo: "Controlar a pressão arterial e eliminar a cefaleia.",
    status: "em_andamento",
    inicioEm: format(addDays(hoje, -75), "yyyy-MM-dd"),
  },
  {
    id: "acomp-2",
    pacienteId: "pac-2",
    profissionalId: "prof-1",
    profissionalNome: "Dra. Helena Marques",
    especialidade: "Clínica Geral",
    titulo: "Diabetes tipo 2 descompensado",
    queixaInicial: "Cansaço, sede excessiva e glicemia elevada em exames de rotina.",
    quadroInicial: "HbA1c 8,6%, sedentarismo e sobrepeso. Sem acompanhamento nutricional.",
    objetivo: "Reduzir HbA1c para menos de 7% e estabelecer hábito de atividade física.",
    status: "em_andamento",
    inicioEm: format(addDays(hoje, -96), "yyyy-MM-dd"),
  },
  {
    id: "acomp-3",
    pacienteId: "pac-5",
    profissionalId: "prof-6",
    profissionalNome: "Dr. Everton Lima",
    especialidade: "Fisioterapia",
    titulo: "Reabilitação de joelho direito (artrose)",
    queixaInicial: "Dor intensa e dificuldade para andar e subir escadas após agravamento da artrose.",
    quadroInicial: "EVA 8/10, flexão de 70°, marcha claudicante. Protocolo de 12 sessões.",
    objetivo: "Reduzir a dor, ganhar amplitude e devolver independência na marcha e nas escadas.",
    status: "em_andamento",
    inicioEm: format(addDays(hoje, -56), "yyyy-MM-dd"),
  },
  {
    id: "acomp-4",
    pacienteId: "pac-3",
    profissionalId: "prof-3",
    profissionalNome: "Dra. Camila Ferraz",
    especialidade: "Estética",
    titulo: "Protocolo de toxina botulínica — terço superior",
    queixaInicial: "Linhas de expressão em glabela e região frontal.",
    quadroInicial: "Rugas dinâmicas de terço superior, sem contraindicações.",
    objetivo: "Suavizar linhas de expressão com simetria e sem complicações.",
    status: "alta",
    inicioEm: format(addDays(hoje, -42), "yyyy-MM-dd"),
    altaEm: format(addDays(hoje, -7), "yyyy-MM-dd"),
    resumoAlta:
      "Resultado satisfatório, simetria preservada, sem intercorrências. Alta do protocolo. Manutenção sugerida em 4 a 6 meses.",
  },
  {
    id: "acomp-5",
    pacienteId: "pac-8",
    profissionalId: "prof-1",
    profissionalNome: "Dra. Helena Marques",
    especialidade: "Cardiologia",
    titulo: "Fibrilação atrial de nova detecção",
    queixaInicial: "Palpitações. ECG com fibrilação atrial de baixa resposta ventricular.",
    quadroInicial: "FA documentada, hemodinamicamente estável, sem anticoagulação ainda definida.",
    objetivo: "Definir anticoagulação e prevenir eventos tromboembólicos.",
    status: "em_andamento",
    inicioEm: format(addDays(hoje, -2), "yyyy-MM-dd"),
  },
];

export function descreverConvenio(agendamento: Agendamento) {
  return agendamento.particular ? "Particular" : getConvenioNome(agendamento.convenioId);
}
