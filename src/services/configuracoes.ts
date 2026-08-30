import type { ModuloSistema } from "@/types";
import { clinica, perfisAcesso } from "./mock/pessoas";

export { clinica };

export function listPerfisAcesso() {
  return perfisAcesso;
}

export function getPerfilById(id: string) {
  return perfisAcesso.find((perfil) => perfil.id === id);
}

export function listUnidades() {
  return clinica.unidades;
}

export const modulosLabels: Record<ModuloSistema, string> = {
  dashboard: "Dashboard",
  pacientes: "Pacientes",
  agenda: "Agenda",
  profissionais: "Profissionais",
  financeiro: "Financeiro",
  convenios: "Convênios",
  estoque: "Estoque",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
};

export const formasPagamentoAceitas = [
  { id: "dinheiro", nome: "Dinheiro", ativo: true, taxa: 0 },
  { id: "pix", nome: "PIX", ativo: true, taxa: 0 },
  { id: "cartao_debito", nome: "Cartão de débito", ativo: true, taxa: 1.49 },
  { id: "cartao_credito", nome: "Cartão de crédito", ativo: true, taxa: 3.29 },
  { id: "boleto", nome: "Boleto bancário", ativo: true, taxa: 2.5 },
  { id: "convenio", nome: "Faturamento por convênio", ativo: true, taxa: 0 },
];

export const modelosMensagem = [
  {
    id: "msg-1",
    nome: "Lembrete de consulta — 24h",
    canal: "WhatsApp",
    ativo: true,
    conteudo:
      "Olá, {{paciente}}! Lembrando da sua consulta com {{profissional}} amanhã às {{hora}}. Para confirmar, responda SIM.",
  },
  {
    id: "msg-2",
    nome: "Confirmação de agendamento",
    canal: "WhatsApp",
    ativo: true,
    conteudo:
      "{{paciente}}, seu agendamento de {{procedimento}} foi confirmado para {{data}} às {{hora}} com {{profissional}}.",
  },
  {
    id: "msg-3",
    nome: "Aviso de cobrança em atraso",
    canal: "E-mail",
    ativo: true,
    conteudo:
      "Olá, {{paciente}}. Identificamos uma pendência de {{valor}} referente a {{descricao}}, vencida em {{vencimento}}.",
  },
  {
    id: "msg-4",
    nome: "Aniversário do paciente",
    canal: "SMS",
    ativo: false,
    conteudo: "A Clínica Vida Integrada deseja um feliz aniversário, {{paciente}}!",
  },
];

export const integracoes = [
  {
    id: "int-1",
    nome: "Gateway de pagamento",
    descricao: "Conciliação automática de PIX, boleto e cartão.",
    conectado: true,
    detalhe: "Conectado como vidaintegrada-prod",
  },
  {
    id: "int-2",
    nome: "WhatsApp Business API",
    descricao: "Envio de lembretes e confirmações de consulta.",
    conectado: true,
    detalhe: "Número +55 16 3321-4500",
  },
  {
    id: "int-3",
    nome: "Calendário externo",
    descricao: "Sincronização da agenda com Google Calendar.",
    conectado: false,
    detalhe: "Não configurado",
  },
  {
    id: "int-4",
    nome: "Emissor de NFS-e",
    descricao: "Emissão automática de nota fiscal de serviço.",
    conectado: false,
    detalhe: "Não configurado",
  },
];
