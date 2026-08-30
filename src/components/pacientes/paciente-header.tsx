import Link from "next/link";
import { CalendarPlus, Mail, MapPin, Pencil, Phone, ShieldAlert } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { calculateAge, formatCurrency, formatPhone, getInitials, maskCpf } from "@/lib/format";
import { getConvenioNome } from "@/services/catalogo";
import type { Paciente } from "@/types";

export function PacienteHeader({ paciente }: { paciente: Paciente }) {
  const convenio = getConvenioNome(paciente.convenioId);

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <Avatar className="size-14 shrink-0">
            <AvatarFallback className="text-base">{getInitials(paciente.nome)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">{paciente.nome}</h1>
              <StatusBadge domain="paciente" status={paciente.status} />
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {calculateAge(paciente.dataNascimento)} anos · CPF {maskCpf(paciente.cpf)}
              {paciente.profissao ? ` · ${paciente.profissao}` : ""}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={paciente.convenioId ? "primary" : "outline"}>{convenio}</Badge>
              {paciente.numeroCarteirinha && <Badge tone="outline">Carteirinha {paciente.numeroCarteirinha}</Badge>}
              {paciente.alergias.map((alergia) => (
                <Badge key={alergia} tone="danger">
                  <ShieldAlert className="size-3" />
                  {alergia}
                </Badge>
              ))}
              {paciente.saldoDevedor > 0 && (
                <Badge tone="warning">Em aberto: {formatCurrency(paciente.saldoDevedor)}</Badge>
              )}
            </div>

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Phone className="size-3.5" />
                <dd className="tabular-nums">{formatPhone(paciente.whatsapp ?? paciente.telefone)}</dd>
              </div>
              {paciente.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  <dd className="truncate">{paciente.email}</dd>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                <dd>
                  {paciente.endereco.bairro}, {paciente.endereco.cidade}/{paciente.endereco.uf}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/pacientes/${paciente.id}/editar`}>
              <Pencil />
              Editar
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/agenda?paciente=${paciente.id}`}>
              <CalendarPlus />
              Agendar
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
