import {
  BarChart3,
  Boxes,
  CalendarDays,
  Clock,
  FileBarChart,
  LayoutDashboard,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { ModuloSistema } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  modulo: ModuloSistema;
  /** Sempre aparece para admin/gestor; trava se o plano não incluir o módulo. */
  reservado?: boolean;
  children?: { label: string; href: string }[];
}

export const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Operação",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, modulo: "dashboard" },
      { label: "Pacientes", href: "/pacientes", icon: Users, modulo: "pacientes" },
      { label: "Agenda", href: "/agenda", icon: CalendarDays, modulo: "agenda" },
      { label: "Profissionais", href: "/profissionais", icon: Stethoscope, modulo: "profissionais" },
    ],
  },
  {
    title: "Gestão",
    items: [
      {
        label: "Financeiro",
        href: "/financeiro",
        icon: Wallet,
        modulo: "financeiro",
        children: [
          { label: "Visão geral", href: "/financeiro" },
          { label: "Contas a receber", href: "/financeiro/contas-a-receber" },
          { label: "Contas a pagar", href: "/financeiro/contas-a-pagar" },
          { label: "Fluxo de caixa", href: "/financeiro/fluxo-de-caixa" },
          { label: "Faturamento de convênios", href: "/financeiro/convenios" },
          { label: "Comissões", href: "/financeiro/comissoes" },
        ],
      },
      { label: "Convênios", href: "/convenios", icon: ShieldCheck, modulo: "convenios" },
      { label: "Estoque", href: "/estoque", icon: Boxes, modulo: "estoque" },
      {
        label: "RH",
        href: "/rh",
        icon: Clock,
        modulo: "rh",
        children: [
          { label: "Visão geral", href: "/rh" },
          { label: "Controle de ponto", href: "/rh/ponto" },
          { label: "Holerites", href: "/rh/holerites" },
        ],
      },
      { label: "Relatórios", href: "/relatorios", icon: FileBarChart, modulo: "relatorios" },
    ],
  },
  {
    title: "Avançado",
    items: [
      {
        label: "Integrações e lembretes",
        href: "/integracoes",
        icon: MessageCircle,
        modulo: "integracoes",
        reservado: true,
        children: [
          { label: "Dashboard", href: "/integracoes" },
          { label: "Configurações", href: "/integracoes/configuracoes" },
          { label: "Lembretes", href: "/integracoes/lembretes" },
          { label: "Histórico de envios", href: "/integracoes/historico" },
        ],
      },
      { label: "Power BI", href: "/power-bi", icon: BarChart3, modulo: "powerbi", reservado: true },
      { label: "Agente de IA", href: "/agente-ia", icon: Sparkles, modulo: "agenteia", reservado: true },
    ],
  },
  {
    title: "Sistema",
    items: [
      {
        label: "Configurações",
        href: "/configuracoes/clinica",
        icon: Settings,
        modulo: "configuracoes",
        children: [
          { label: "Dados da clínica", href: "/configuracoes/clinica" },
          { label: "Usuários", href: "/configuracoes/usuarios" },
          { label: "Perfis e permissões", href: "/configuracoes/permissoes" },
          { label: "Procedimentos", href: "/configuracoes/procedimentos" },
          { label: "Formas de pagamento", href: "/configuracoes/pagamentos" },
          { label: "Estilização", href: "/configuracoes/estilizacao" },
        ],
      },
    ],
  },
];

/** Rótulos usados no breadcrumb para segmentos de rota conhecidos. */
export const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  pacientes: "Pacientes",
  agenda: "Agenda",
  profissionais: "Profissionais",
  financeiro: "Financeiro",
  "contas-a-receber": "Contas a receber",
  "contas-a-pagar": "Contas a pagar",
  "fluxo-de-caixa": "Fluxo de caixa",
  comissoes: "Comissões",
  convenios: "Convênios",
  estoque: "Estoque",
  rh: "RH",
  ponto: "Controle de ponto",
  holerites: "Holerites",
  relatorios: "Relatórios",
  configuracoes: "Configurações",
  clinica: "Dados da clínica",
  usuarios: "Usuários",
  permissoes: "Perfis e permissões",
  procedimentos: "Procedimentos",
  pagamentos: "Formas de pagamento",
  estilizacao: "Estilização",
  integracoes: "Integrações e lembretes",
  lembretes: "Lembretes",
  "power-bi": "Power BI",
  "agente-ia": "Agente de IA",
  novo: "Novo",
  prontuario: "Acompanhamento",
  historico: "Histórico",
  documentos: "Documentos",
  comissoes_prof: "Comissões",
};
