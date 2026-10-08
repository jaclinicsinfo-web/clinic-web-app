import { addMonths, differenceInDays, differenceInMonths, differenceInYears, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function toDate(value: Date | string) {
  return typeof value === "string" ? parseISO(value) : value;
}

/** Interpreta `yyyy-MM-dd` como data civil local, sem deslocar o dia por fuso. */
export function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatISODate(value: Date) {
  return format(value, "yyyy-MM-dd");
}

/** Converte Decimal/string da API em número para exibir e calcular preço. */
export function toMoneyNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim().replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value && typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    const parsed = Number(value.toNumber());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value != null) {
    const parsed = Number(String(value));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(toMoneyNumber(value));
}

/** Valor compacto para cards de indicador: R$ 12,4 mil */
export function formatCurrencyCompact(value: number) {
  if (Math.abs(value) < 1000) return formatCurrency(value);
  if (Math.abs(value) < 1_000_000) {
    return `R$ ${(value / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil`;
  }
  return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} mi`;
}

export function formatNumber(value: number, fractionDigits = 0) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${formatNumber(value, fractionDigits)}%`;
}

export function formatDate(value: Date | string) {
  return format(toDate(value), "dd/MM/yyyy");
}

export function formatDateLong(value: Date | string) {
  return format(toDate(value), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatDateTime(value: Date | string) {
  return format(toDate(value), "dd/MM/yyyy 'às' HH:mm");
}

export function formatTime(value: Date | string) {
  return format(toDate(value), "HH:mm");
}

export function formatWeekday(value: Date | string) {
  return format(toDate(value), "EEEE", { locale: ptBR });
}

function toBirthDate(value: Date | string) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return parseLocalDate(value.slice(0, 10));
  }
  return toDate(value);
}

export function calculateAge(birthDate: Date | string) {
  return differenceInYears(new Date(), toBirthDate(birthDate));
}

/** Menores de 1 ano aparecem em meses e dias. A partir de 1 ano, só os anos. */
export function formatIdade(birthDate: Date | string) {
  const nasc = toBirthDate(birthDate);
  const hoje = new Date();
  const anos = differenceInYears(hoje, nasc);
  if (anos >= 1) return anos === 1 ? "1 ano" : `${anos} anos`;

  const meses = Math.max(differenceInMonths(hoje, nasc), 0);
  const dias = Math.max(differenceInDays(hoje, addMonths(nasc, meses)), 0);
  if (meses === 0) return dias === 1 ? "1 dia" : `${dias} dias`;

  const parteMes = meses === 1 ? "1 mês" : `${meses} meses`;
  if (dias === 0) return parteMes;
  return `${parteMes} e ${dias === 1 ? "1 dia" : `${dias} dias`}`;
}

export function formatCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Oculta os dígitos centrais do CPF para perfis sem permissão de leitura completa. */
export function maskCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function formatCep(cep: string) {
  return cep.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

export function formatCnpj(cnpj: string) {
  const digits = cnpj.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`;
}
