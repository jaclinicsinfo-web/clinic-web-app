import type { ModuloSistema } from "@/types";
import { clinica } from "./mock/pessoas";

export { clinica };

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

