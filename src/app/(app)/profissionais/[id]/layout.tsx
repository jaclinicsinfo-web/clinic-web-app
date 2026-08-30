import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, Mail, Pencil, Phone } from "lucide-react";

import { ProfissionalTabs } from "@/components/profissionais/profissional-tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPhone, getInitials } from "@/lib/format";
import { tipoVinculoLabels } from "@/lib/status";
import { getProfissionalById } from "@/services/profissionais";

export default async function ProfissionalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profissional = getProfissionalById(id);

  if (!profissional) notFound();

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <Avatar className="size-16">
              {profissional.fotoUrl && <AvatarImage src={profissional.fotoUrl} alt={profissional.nome} />}
              <AvatarFallback className="text-lg">{getInitials(profissional.nome)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{profissional.nome}</h1>
                <StatusBadge domain="profissional" status={profissional.status} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {profissional.especialidades.map((especialidade) => (
                  <Badge key={especialidade} tone="primary">
                    {especialidade}
                  </Badge>
                ))}
                <Badge tone="outline">
                  {profissional.conselho} {profissional.registroConselho}
                </Badge>
                <Badge tone="outline">{tipoVinculoLabels[profissional.tipoVinculo]}</Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {profissional.email}
                </span>
                <span className="flex items-center gap-1.5 tabular-nums">
                  <Phone className="size-3.5" />
                  {formatPhone(profissional.telefone)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/profissionais/${profissional.id}/editar`}>
                <Pencil />
                Editar
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/agenda?profissional=${profissional.id}&novo=1`}>
                <CalendarPlus />
                Novo agendamento
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <ProfissionalTabs profissionalId={profissional.id} />

      {children}
    </div>
  );
}
