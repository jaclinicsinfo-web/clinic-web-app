import type { CanalLembrete, DestinatarioLembrete, ModoCobranca, TipoLembrete } from "@/services/integracoes";

export const tipoLembreteLabels: Record<TipoLembrete, string> = {
  antecedencia: "Antecedência",
  confirmacao: "Confirmação",
  reagendamento: "Reagendamento",
  cancelamento: "Cancelamento",
};

export const canalLabels: Record<CanalLembrete, string> = {
  whatsapp: "WhatsApp",
  email: "E-mail",
};

export const destinatarioLabels: Record<DestinatarioLembrete, string> = {
  paciente: "Paciente",
  profissional: "Profissional",
  ambos: "Paciente e profissional",
};

export const cobrancaModoLabels: Record<ModoCobranca, string> = {
  conta_clinica: "Conta da clínica",
  repasse_plataforma: "Repasse da plataforma",
};

export function dicaCustoCobranca(modo?: ModoCobranca) {
  return modo === "repasse_plataforma" ? "A faturar pela plataforma" : "Cobrado na conta da clínica";
}

export const categoriaCustoLabels: Record<string, string> = {
  utility: "Utilidade (WhatsApp)",
  marketing: "Marketing (WhatsApp)",
  authentication: "Autenticação (WhatsApp)",
  service: "Serviço (WhatsApp)",
  padrao: "E-mail",
};

export function formatarAntecedencia(minutos: number | null) {
  if (!minutos) return "—";
  if (minutos % 1440 === 0) {
    const dias = minutos / 1440;
    return dias === 1 ? "1 dia antes" : `${dias} dias antes`;
  }
  if (minutos % 60 === 0) {
    const horas = minutos / 60;
    return horas === 1 ? "1 hora antes" : `${horas} horas antes`;
  }
  return `${minutos} min antes`;
}
