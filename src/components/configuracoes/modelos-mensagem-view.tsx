"use client";

import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { modelosMensagem } from "@/services/configuracoes";

export function ModelosMensagemView({ modelos }: { modelos: typeof modelosMensagem }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Modelos de mensagens"
        description="Templates de lembrete, confirmação e cobrança para SMS, WhatsApp e e-mail."
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {modelos.map((modelo) => (
          <Card key={modelo.id}>
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>{modelo.nome}</CardTitle>
                <CardDescription>
                  <Badge tone="outline">{modelo.canal}</Badge>
                </CardDescription>
              </div>
              <Switch
                defaultChecked={modelo.ativo}
                onCheckedChange={() => toast.success("Modelo atualizado", { description: modelo.nome })}
                aria-label={`Ativar ${modelo.nome}`}
              />
            </CardHeader>
            <CardContent>
              <p className="rounded-lg bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground">
                {modelo.conteudo}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => toast.message("Edição de template disponível quando a API estiver ligada.")}
              >
                Editar texto
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
