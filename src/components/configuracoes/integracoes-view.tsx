"use client";

import { Plug, PlugZap } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { integracoes } from "@/services/configuracoes";

export function IntegracoesView({ itens }: { itens: typeof integracoes }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrações"
        description="Gateway de pagamento, WhatsApp, calendário externo e emissão de NFS-e."
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {itens.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {item.conectado ? <PlugZap className="size-4 text-success" /> : <Plug className="size-4 text-muted-foreground" />}
                  {item.nome}
                </CardTitle>
                <CardDescription>{item.descricao}</CardDescription>
              </div>
              <Badge tone={item.conectado ? "success" : "neutral"}>
                {item.conectado ? "Conectado" : "Desconectado"}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{item.detalhe}</p>
              <Button
                variant={item.conectado ? "outline" : "default"}
                size="sm"
                onClick={() =>
                  toast.success(item.conectado ? "Integração desconectada" : "Integração conectada", {
                    description: item.nome,
                  })
                }
              >
                {item.conectado ? "Desconectar" : "Conectar"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
