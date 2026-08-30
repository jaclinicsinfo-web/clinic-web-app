import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMinutes } from "@/lib/format";
import { diasSemana } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { GradeHorario } from "@/types";

function minutosDoDia(horaInicio: string, horaFim: string) {
  const [inicioHora, inicioMin] = horaInicio.split(":").map(Number);
  const [fimHora, fimMin] = horaFim.split(":").map(Number);
  return fimHora * 60 + fimMin - (inicioHora * 60 + inicioMin);
}

export function GradeHorarios({ grade }: { grade: GradeHorario[] }) {
  const totalSemanal = grade.reduce((total, item) => total + minutosDoDia(item.horaInicio, item.horaFim), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade de horários</CardTitle>
        <CardDescription>Disponibilidade semanal considerada no cálculo de ocupação</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {diasSemana.map((dia, index) => {
          const doDia = grade.filter((item) => item.diaSemana === index);

          return (
            <div
              key={dia}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm",
                doDia.length > 0 ? "bg-primary-subtle" : "bg-muted/60",
              )}
            >
              <span className={cn("font-medium", doDia.length > 0 ? "text-accent-foreground" : "text-muted-foreground")}>
                {dia}
              </span>
              {doDia.length > 0 ? (
                <span className="tabular-nums text-accent-foreground">
                  {doDia.map((item) => `${item.horaInicio} – ${item.horaFim}`).join(" · ")}
                </span>
              ) : (
                <span className="text-muted-foreground">Sem atendimento</span>
              )}
            </div>
          );
        })}

        <p className="pt-2 text-xs text-muted-foreground">
          Carga semanal disponível: <span className="font-medium text-foreground">{formatMinutes(totalSemanal)}</span>
        </p>
      </CardContent>
    </Card>
  );
}
