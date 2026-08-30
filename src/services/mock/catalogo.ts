import type { Convenio, Procedimento } from "@/types";

export const especialidades = [
  "Clínica Geral",
  "Cardiologia",
  "Dermatologia",
  "Ortopedia",
  "Pediatria",
  "Ginecologia",
  "Odontologia",
  "Nutrição",
  "Fisioterapia",
  "Estética",
] as const;

export const categoriasProcedimento = [
  "Consulta",
  "Exame",
  "Procedimento cirúrgico",
  "Odontologia",
  "Estética",
  "Terapia",
] as const;

export const convenios: Convenio[] = [
  {
    id: "conv-1",
    nome: "Unimed",
    registroAns: "393321",
    prazoPagamentoDias: 30,
    exigeAutorizacaoPrevia: true,
    contatoNome: "Central de Relacionamento",
    contatoTelefone: "1140041234",
    portalUrl: "https://portal.unimed.coop.br",
    tabelaPrecos: [
      { procedimentoId: "proc-1", valor: 90 },
      { procedimentoId: "proc-2", valor: 110 },
      { procedimentoId: "proc-3", valor: 75 },
      { procedimentoId: "proc-5", valor: 160 },
    ],
    status: "ativo",
  },
  {
    id: "conv-2",
    nome: "Bradesco Saúde",
    registroAns: "005711",
    prazoPagamentoDias: 45,
    exigeAutorizacaoPrevia: true,
    contatoNome: "Atendimento Prestador",
    contatoTelefone: "1130042000",
    portalUrl: "https://www.bradescosaude.com.br",
    tabelaPrecos: [
      { procedimentoId: "proc-1", valor: 105 },
      { procedimentoId: "proc-2", valor: 125 },
      { procedimentoId: "proc-4", valor: 240 },
    ],
    status: "ativo",
  },
  {
    id: "conv-3",
    nome: "SulAmérica",
    registroAns: "006246",
    prazoPagamentoDias: 40,
    exigeAutorizacaoPrevia: false,
    contatoNome: "Núcleo de Credenciados",
    contatoTelefone: "1135531900",
    tabelaPrecos: [
      { procedimentoId: "proc-1", valor: 98 },
      { procedimentoId: "proc-3", valor: 82 },
      { procedimentoId: "proc-6", valor: 190 },
    ],
    status: "ativo",
  },
  {
    id: "conv-4",
    nome: "Amil",
    registroAns: "326305",
    prazoPagamentoDias: 60,
    exigeAutorizacaoPrevia: true,
    contatoNome: "Relacionamento Amil",
    contatoTelefone: "1140044000",
    tabelaPrecos: [
      { procedimentoId: "proc-1", valor: 88 },
      { procedimentoId: "proc-7", valor: 145 },
    ],
    status: "ativo",
  },
  {
    id: "conv-5",
    nome: "Porto Seguro Saúde",
    registroAns: "348520",
    prazoPagamentoDias: 35,
    exigeAutorizacaoPrevia: false,
    contatoNome: "Suporte Credenciado",
    contatoTelefone: "1130039000",
    tabelaPrecos: [{ procedimentoId: "proc-1", valor: 100 }],
    status: "inativo",
  },
];

export const procedimentos: Procedimento[] = [
  {
    id: "proc-1",
    nome: "Consulta clínica",
    categoria: "Consulta",
    duracaoPadraoMin: 30,
    valorParticular: 250,
    valoresPorConvenio: [
      { convenioId: "conv-1", valor: 90 },
      { convenioId: "conv-2", valor: 105 },
      { convenioId: "conv-3", valor: 98 },
      { convenioId: "conv-4", valor: 88 },
    ],
    status: "ativo",
  },
  {
    id: "proc-2",
    nome: "Consulta cardiológica",
    categoria: "Consulta",
    duracaoPadraoMin: 40,
    valorParticular: 350,
    valoresPorConvenio: [
      { convenioId: "conv-1", valor: 110 },
      { convenioId: "conv-2", valor: 125 },
    ],
    status: "ativo",
  },
  {
    id: "proc-3",
    nome: "Retorno de consulta",
    categoria: "Consulta",
    duracaoPadraoMin: 20,
    valorParticular: 150,
    valoresPorConvenio: [
      { convenioId: "conv-1", valor: 75 },
      { convenioId: "conv-3", valor: 82 },
    ],
    status: "ativo",
  },
  {
    id: "proc-4",
    nome: "Ultrassonografia",
    categoria: "Exame",
    duracaoPadraoMin: 30,
    valorParticular: 420,
    valoresPorConvenio: [{ convenioId: "conv-2", valor: 240 }],
    status: "ativo",
  },
  {
    id: "proc-5",
    nome: "Eletrocardiograma",
    categoria: "Exame",
    duracaoPadraoMin: 20,
    valorParticular: 220,
    valoresPorConvenio: [{ convenioId: "conv-1", valor: 160 }],
    status: "ativo",
  },
  {
    id: "proc-6",
    nome: "Sessão de fisioterapia",
    categoria: "Terapia",
    duracaoPadraoMin: 50,
    valorParticular: 180,
    valoresPorConvenio: [{ convenioId: "conv-3", valor: 190 }],
    status: "ativo",
  },
  {
    id: "proc-7",
    nome: "Limpeza dental",
    categoria: "Odontologia",
    duracaoPadraoMin: 45,
    valorParticular: 280,
    valoresPorConvenio: [{ convenioId: "conv-4", valor: 145 }],
    status: "ativo",
  },
  {
    id: "proc-8",
    nome: "Aplicação de toxina botulínica",
    categoria: "Estética",
    duracaoPadraoMin: 60,
    valorParticular: 1450,
    valoresPorConvenio: [],
    status: "ativo",
  },
  {
    id: "proc-9",
    nome: "Avaliação nutricional",
    categoria: "Consulta",
    duracaoPadraoMin: 50,
    valorParticular: 300,
    valoresPorConvenio: [],
    status: "ativo",
  },
  {
    id: "proc-10",
    nome: "Pequena cirurgia dermatológica",
    categoria: "Procedimento cirúrgico",
    duracaoPadraoMin: 90,
    valorParticular: 1800,
    valoresPorConvenio: [],
    status: "inativo",
  },
];

export const salas = ["Consultório 1", "Consultório 2", "Consultório 3", "Sala de Exames", "Sala Cirúrgica"];

export function getConvenioNome(convenioId: string | null) {
  if (!convenioId) return "Particular";
  return convenios.find((convenio) => convenio.id === convenioId)?.nome ?? "Particular";
}

export function getProcedimento(procedimentoId: string) {
  return procedimentos.find((procedimento) => procedimento.id === procedimentoId);
}
