/**
 * Modelo de domínio do ERP de clínicas.
 * Espelha a seção 14 da especificação em docs/especificacao-erp-clinicas.md.
 */

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

// ---------------------------------------------------------------- Compartilhado

export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface Unidade {
  id: string;
  nome: string;
  cidade: string;
  ativo?: boolean;
}

// ------------------------------------------------------------------- Pacientes

export type PacienteStatus = "ativo" | "inativo" | "arquivado";
export type Sexo = "masculino" | "feminino" | "outro";
export type EstadoCivil = "solteiro" | "casado" | "divorciado" | "viuvo" | "uniao_estavel";

export interface Responsavel {
  nome: string;
  cpf: string;
  parentesco: string;
  telefone: string;
}

export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento: string;
  sexo: Sexo;
  estadoCivil?: EstadoCivil;
  profissao?: string;
  telefone: string;
  whatsapp?: string;
  email?: string;
  endereco: Endereco;
  convenioId: string | null;
  convenioNome?: string | null;
  numeroCarteirinha?: string;
  validadeCarteirinha?: string;
  responsavel?: Responsavel;
  alergias: string[];
  condicoesPreexistentes: string[];
  medicacoesEmUso: string[];
  profissionalPreferidoId?: string;
  profissionalPreferidoNome?: string | null;
  formaContatoPreferida?: "whatsapp" | "telefone" | "email";
  observacoes?: string;
  consentimentoLgpd: boolean;
  autorizacaoImagem: boolean;
  status: PacienteStatus;
  ultimoAtendimento?: string;
  proximoAgendamento?: string;
  saldoDevedor: number;
  criadoEm: string;
  atualizadoEm: string;
}

// --------------------------------------------------------------- Profissionais

export type TipoVinculo = "clt" | "pj" | "autonomo";
export type FormaRemuneracao = "fixo" | "comissao" | "misto";
export type ProfissionalStatus = "ativo" | "inativo";

export interface GradeHorario {
  diaSemana: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  horaInicio: string;
  horaFim: string;
}

export interface Profissional {
  id: string;
  usuarioId?: string | null;
  usuarioNome?: string | null;
  nome: string;
  cpf: string;
  rg?: string | null;
  email: string;
  telefone: string;
  comissaoPorProcedimento?: boolean;
  especialidades: string[];
  conselho: string;
  registroConselho: string;
  tipoVinculo: TipoVinculo;
  formaRemuneracao: FormaRemuneracao;
  dataAdmissao: string;
  percentualComissao: number;
  procedimentosHabilitados: string[];
  gradeHorarios: GradeHorario[];
  status: ProfissionalStatus;
  criadoEm: string;
}

// ------------------------------------------------------------------ Agenda

export type AgendamentoStatus =
  | "agendado"
  | "confirmado"
  | "check_in"
  | "em_atendimento"
  | "atendido"
  | "cancelado"
  | "faltou";

export type TipoAgendamento = "avaliacao" | "atendimento";

export interface Agendamento {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  profissionalId: string;
  profissionalNome: string;
  procedimentoId: string;
  procedimentoNome: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  sala?: string;
  convenioId: string | null;
  convenioNome?: string | null;
  particular: boolean;
  tipo: TipoAgendamento;
  valor: number;
  status: AgendamentoStatus;
  observacoes?: string;
  lembreteEnviado: boolean;
  criadoPor: string;
  criadoEm: string;
}

export interface BloqueioAgenda {
  id: string;
  profissionalId: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  motivo: string;
}

export interface ListaEsperaItem {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  telefone: string;
  profissionalId?: string;
  procedimentoNome: string;
  preferenciaPeriodo: "manha" | "tarde" | "qualquer";
  criadoEm: string;
}

// --------------------------------------------------- Atendimento / Prontuário

export interface Anexo {
  id: string;
  nome: string;
  tipo: string;
  tamanhoKb: number;
  url: string;
  criadoEm: string;
}

export type TipoRegistroClinico = "avaliacao_inicial" | "evolucao" | "retorno" | "alta";
export type RespostaTratamento = "melhorou" | "estavel" | "piorou" | "resolvido";
export type AcompanhamentoStatus = "em_andamento" | "alta" | "abandonado";

export interface Atendimento {
  id: string;
  agendamentoId: string;
  pacienteId: string;
  profissionalId: string;
  profissionalNome: string;
  data: string;
  procedimentoRealizado: string;
  evolucao: string;
  anexos: Anexo[];
  proximoRetornoSugerido?: string;
  criadoEm: string;
  acompanhamentoId?: string;
  tipoRegistro: TipoRegistroClinico;
  queixaPrincipal?: string;
  quadroClinico?: string;
  conduta?: string;
  respostaAoTratamento?: RespostaTratamento;
  /** Escala visual analógica de dor (0–10), quando aplicável. */
  escalaDor?: number;
}

export interface AcompanhamentoClinico {
  id: string;
  pacienteId: string;
  profissionalId: string;
  profissionalNome: string;
  especialidade: string;
  titulo: string;
  queixaInicial: string;
  quadroInicial: string;
  objetivo?: string;
  status: AcompanhamentoStatus;
  inicioEm: string;
  altaEm?: string;
  resumoAlta?: string;
}

// ---------------------------------------------------------------- Procedimento

export interface ValorConvenio {
  convenioId: string;
  valor: number;
}

export interface Procedimento {
  id: string;
  nome: string;
  categoria: string;
  duracaoPadraoMin: number;
  valorParticular: number;
  valoresPorConvenio: ValorConvenio[];
  status: "ativo" | "inativo";
}

// ------------------------------------------------------------------ Financeiro

export type FormaPagamento = "dinheiro" | "cartao_credito" | "cartao_debito" | "pix" | "boleto" | "convenio";
export type CobrancaStatus = "pendente" | "pago" | "atrasado" | "parcelado" | "cancelado";

export interface Parcela {
  numero: number;
  valor: number;
  vencimento: string;
  status: "pendente" | "pago" | "atrasado";
  pagoEm?: string;
}

export interface Cobranca {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  agendamentoId?: string;
  descricao: string;
  valor: number;
  formaPagamento: FormaPagamento | null;
  convenioId: string | null;
  convenioNome?: string | null;
  status: CobrancaStatus;
  vencimento: string;
  parcelas: Parcela[];
  pagoEm?: string;
  criadoEm: string;
  valorAberto?: number;
}

export type DespesaStatus = "a_pagar" | "pago" | "vencido";

export interface Despesa {
  id: string;
  descricao: string;
  categoria: string;
  fornecedor: string;
  valor: number;
  vencimento: string;
  status: DespesaStatus;
  recorrente: boolean;
  formaPagamento?: FormaPagamento;
  pagoEm?: string;
}

export interface FluxoCaixaPonto {
  periodo: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

export type LoteStatus = "aberto" | "enviado" | "pago" | "glosado" | "parcial";

export interface LoteConvenio {
  id: string;
  convenioId: string;
  convenioNome: string;
  competencia: string;
  quantidadeGuias: number;
  valorApresentado: number;
  valorGlosado: number;
  valorRecebido: number;
  status: LoteStatus;
  enviadoEm?: string;
  previsaoPagamento?: string;
}

export type ComissaoStatus = "prevista" | "aprovada" | "paga";

export interface Comissao {
  id: string;
  profissionalId: string;
  profissionalNome: string;
  competencia: string;
  atendimentos: number;
  faturamentoGerado: number;
  percentual: number;
  valorComissao: number;
  status: ComissaoStatus;
  pagoEm?: string;
}

// -------------------------------------------------------------------- Convênios

export interface Convenio {
  id: string;
  nome: string;
  registroAns?: string;
  prazoPagamentoDias: number;
  exigeAutorizacaoPrevia: boolean;
  contatoNome: string;
  contatoTelefone: string;
  portalUrl?: string;
  tabelaPrecos: { procedimentoId: string; valor: number }[];
  status: "ativo" | "inativo";
}

// ---------------------------------------------------------------------- Estoque

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  unidadeMedida: string;
  quantidadeAtual: number;
  estoqueMinimo: number;
  custoUnitario: number;
  fornecedor: string;
  ativo?: boolean;
  atualizadoEm: string;
}

export interface MovimentacaoEstoque {
  id: string;
  produtoId: string;
  produtoNome: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  motivo: string;
  responsavel: string;
  procedimentoId?: string | null;
  procedimentoNome?: string | null;
  data: string;
}

export interface ConsumoEstoque {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  ocorrencias: number;
}

export interface Notificacao {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  href: string | null;
  severidade: "alta" | "media" | "baixa";
  lida: boolean;
  criadoEm: string;
}

export type StatusPonto = "completo" | "em_andamento" | "incompleto";
export type TipoBatida = "entrada" | "saida_intervalo" | "retorno_intervalo" | "saida";
export type OrigemPonto = "manual" | "proprio";

export interface UsuarioRh {
  id: string;
  nome: string;
  email: string;
  status: "ativo" | "inativo";
  perfilNome: string;
}

export interface RegistroPonto {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  perfilNome: string;
  data: string;
  entrada: string | null;
  saidaIntervalo: string | null;
  retornoIntervalo: string | null;
  saida: string | null;
  observacao: string | null;
  origem: OrigemPonto;
  status: StatusPonto;
  minutosTrabalhados: number | null;
  horasTrabalhadas: string | null;
  registradoPorNome: string;
  atualizadoEm: string;
}

export interface Holerite {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  perfilNome: string;
  competencia: string;
  nomeArquivo: string;
  mimeType: string;
  tamanhoKb: number;
  criadoPorNome: string;
  criadoEm: string;
}

// ------------------------------------------------------- Usuários e permissões

export type ModuloSistema =
  | "dashboard"
  | "pacientes"
  | "agenda"
  | "profissionais"
  | "financeiro"
  | "convenios"
  | "estoque"
  | "relatorios"
  | "rh"
  | "configuracoes"
  | "integracoes"
  | "powerbi"
  | "agenteia";

export interface Permissao {
  modulo: ModuloSistema;
  visualizar: boolean;
  criar: boolean;
  editar: boolean;
  excluir: boolean;
}

export type AcaoPermissao = keyof Omit<Permissao, "modulo">;

export interface PerfilAcesso {
  id: string;
  nome: string;
  descricao: string;
  sistema: boolean;
  isolarDados: boolean;
  permissoes: Permissao[];
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfilId: string;
  perfilNome: string;
  unidadesAcesso: string[];
  status: "ativo" | "inativo";
  ultimoAcesso?: string;
  tema?: "claro" | "escuro";
}

export type CodigoPlano = "essencial" | "profissional" | "ilimitado";

export interface PlanoAtual {
  codigo: CodigoPlano;
  nome: string;
  limiteUsuarios: number | null;
  limiteUnidades: number | null;
  modulos: ModuloSistema[];
}

export interface UsoUsuarios {
  usados: number;
  limite: number | null;
  podeAdicionar: boolean;
}

export interface PerfilSessao {
  id: string;
  nome: string;
  isolarDados?: boolean;
  permissoes: Permissao[];
}

/** Sessão do painel autenticado. */
export interface SessaoUsuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  perfilId: string;
  permissoes: Permissao[] | null;
  isolarDados: boolean;
  unidadeAtualId: string;
  unidadesAcesso: string[];
  unidades: Unidade[];
  clinicaNome: string | null;
  clinicaId: string | null;
  plano: PlanoAtual | null;
  usoUsuarios: UsoUsuarios | null;
  planoEvento: "upgrade" | "downgrade" | null;
  tema?: "claro" | "escuro";
  primeiroAcesso?: boolean;
}

export interface Clinica {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: Endereco;
  temLogo: boolean;
  logoUrl?: string;
  unidades: Unidade[];
}
