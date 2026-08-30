import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { calculateAge, formatPhone, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PatientCardPaciente {
  id: string;
  nome: string;
  telefone: string;
  cpf?: string;
  dataNascimento?: string;
  convenioId?: string | null;
  alergias?: string[];
  status?: string;
}

interface PatientCardProps {
  paciente: PatientCardPaciente;
  convenioNome?: string;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PatientCard({
  paciente,
  convenioNome,
  compact = false,
  selected = false,
  onClick,
  className,
}: PatientCardProps) {
  const idade = paciente.dataNascimento ? calculateAge(paciente.dataNascimento) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors",
        onClick && "hover:bg-muted",
        !onClick && "cursor-default",
        selected && "border-primary/30 bg-primary-subtle",
        className,
      )}
    >
      <Avatar className={cn("size-9", compact && "size-8")}>
        <AvatarFallback>{getInitials(paciente.nome)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{paciente.nome}</p>
        <p className="truncate text-xs text-muted-foreground">
          {formatPhone(paciente.telefone)}
          {idade !== null ? ` · ${idade} anos` : ""}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {convenioNome && (
          <Badge tone={convenioNome === "Particular" ? "outline" : "primary"}>{convenioNome}</Badge>
        )}
        {paciente.alergias && paciente.alergias.length > 0 && (
          <span className="text-[10px] font-medium text-danger">Alergia</span>
        )}
      </div>
    </button>
  );
}
