"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";

import { Pode } from "@/components/auth/pode";
import { RegraDialog } from "@/components/integracoes/regra-dialog";
import { TemplateDialog } from "@/components/integracoes/template-dialog";
import { canalLabels, destinatarioLabels, formatarAntecedencia, tipoLembreteLabels } from "@/components/integracoes/labels";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessaoStore } from "@/hooks/use-sessao";
import { ApiError } from "@/lib/api";
import { temPermissao } from "@/lib/permissoes";
import {
  excluirRegraLembreteApi,
  excluirTemplateMensagemApi,
  listarRegrasLembreteApi,
  listarTemplatesMensagemApi,
  type RegraLembrete,
  type TemplateMensagem,
} from "@/services/integracoes";

export function LembretesWorkspace() {
  const sessao = useSessaoStore((state) => state.sessao);
  const podeCriar = temPermissao(sessao?.permissoes, "integracoes", "criar");
  const [regras, setRegras] = React.useState<RegraLembrete[] | null>(null);
  const [templates, setTemplates] = React.useState<TemplateMensagem[]>([]);
  const [erro, setErro] = React.useState<string | null>(null);
  const [regraEdicao, setRegraEdicao] = React.useState<RegraLembrete | null | undefined>(undefined);
  const [templateEdicao, setTemplateEdicao] = React.useState<TemplateMensagem | null | undefined>(undefined);
  const [excluirRegra, setExcluirRegra] = React.useState<RegraLembrete | null>(null);
  const [excluirTemplate, setExcluirTemplate] = React.useState<TemplateMensagem | null>(null);

  async function recarregar() {
    const [listaRegras, listaTemplates] = await Promise.all([listarRegrasLembreteApi(), listarTemplatesMensagemApi()]);
    setRegras(listaRegras);
    setTemplates(listaTemplates);
  }

  React.useEffect(() => {
    recarregar().catch((error) => {
      setErro(error instanceof ApiError ? error.message : "Não foi possível carregar as regras.");
    });
  }, []);

  const colunasRegras = React.useMemo<ColumnDef<RegraLembrete>[]>(
    () => [
      { accessorKey: "nome", header: "Regra" },
      {
        accessorKey: "tipo",
        header: "Tipo",
        cell: ({ row }) => tipoLembreteLabels[row.original.tipo],
      },
      {
        id: "quando",
        header: "Quando",
        cell: ({ row }) =>
          row.original.tipo === "antecedencia" ? formatarAntecedencia(row.original.antecedenciaMinutos) : tipoLembreteLabels[row.original.tipo],
      },
      {
        accessorKey: "destinatarios",
        header: "Destinatários",
        cell: ({ row }) => destinatarioLabels[row.original.destinatarios],
      },
      {
        id: "canais",
        header: "Canais",
        cell: ({ row }) => row.original.canais.map((canal) => canalLabels[canal]).join(", "),
      },
      {
        accessorKey: "ativo",
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="generico" status={row.original.ativo ? "ativo" : "inativo"} />,
      },
    ],
    [],
  );

  const colunasTemplates = React.useMemo<ColumnDef<TemplateMensagem>[]>(
    () => [
      { accessorKey: "nome", header: "Template" },
      { accessorKey: "canal", header: "Canal", cell: ({ row }) => canalLabels[row.original.canal] },
      { accessorKey: "tipo", header: "Tipo", cell: ({ row }) => tipoLembreteLabels[row.original.tipo] },
      {
        accessorKey: "whatsappNomeTemplate",
        header: "Template Meta",
        cell: ({ row }) => row.original.whatsappNomeTemplate || "—",
      },
      {
        accessorKey: "ativo",
        header: "Status",
        cell: ({ row }) => <StatusBadge domain="generico" status={row.original.ativo ? "ativo" : "inativo"} />,
      },
    ],
    [],
  );

  if (erro) return <EmptyState title="Não foi possível carregar" description={erro} />;
  if (!regras) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lembretes"
        description="Regras e templates aplicados automaticamente aos agendamentos. Não é possível criar um lembrete avulso."
        actions={
          <Pode modulo="integracoes" acao="criar">
            <Button onClick={() => setRegraEdicao(null)}>Nova regra</Button>
          </Pode>
        }
      />

      <Tabs defaultValue="regras">
        <TabsList>
          <TabsTrigger value="regras">Regras</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="regras">
          <DataTable
            columns={colunasRegras}
            data={regras}
            searchPlaceholder="Buscar regra..."
            emptyTitle="Nenhuma regra"
            emptyDescription="Crie uma regra vinculada à agenda, por exemplo 24 horas antes."
            onRowClick={(regra) => setRegraEdicao(regra)}
          />
        </TabsContent>
        <TabsContent value="templates">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Templates</CardTitle>
                <CardDescription>
                  Placeholders: {"{{paciente.nome}}"}, {"{{profissional.nome}}"}, {"{{data}}"}, {"{{horario}}"}, {"{{procedimento}}"}, {"{{unidade}}"}.
                </CardDescription>
              </div>
              {podeCriar ? (
                <Button variant="outline" onClick={() => setTemplateEdicao(null)}>
                  Novo template
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              <DataTable
                columns={colunasTemplates}
                data={templates}
                searchPlaceholder="Buscar template..."
                onRowClick={(template) => setTemplateEdicao(template)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {regraEdicao !== undefined ? (
        <RegraDialog
          regra={regraEdicao}
          templates={templates}
          onOpenChange={(aberto) => {
            if (!aberto) setRegraEdicao(undefined);
          }}
          onSalvo={async () => {
            await recarregar();
            setRegraEdicao(undefined);
          }}
          onExcluir={regraEdicao ? () => setExcluirRegra(regraEdicao) : undefined}
        />
      ) : null}

      {templateEdicao !== undefined ? (
        <TemplateDialog
          template={templateEdicao}
          onOpenChange={(aberto) => {
            if (!aberto) setTemplateEdicao(undefined);
          }}
          onSalvo={async () => {
            await recarregar();
            setTemplateEdicao(undefined);
          }}
          onExcluir={templateEdicao && !templateEdicao.sistema ? () => setExcluirTemplate(templateEdicao) : undefined}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(excluirRegra)}
        onOpenChange={(aberto) => {
          if (!aberto) setExcluirRegra(null);
        }}
        title="Excluir regra?"
        description="Os envios já registrados permanecem no histórico."
        onConfirm={async () => {
          if (!excluirRegra) return;
          await excluirRegraLembreteApi(excluirRegra.id);
          toast.success("Regra excluída.");
          setExcluirRegra(null);
          setRegraEdicao(undefined);
          await recarregar();
        }}
      />

      <ConfirmDialog
        open={Boolean(excluirTemplate)}
        onOpenChange={(aberto) => {
          if (!aberto) setExcluirTemplate(null);
        }}
        title="Excluir template?"
        description="Só é possível excluir templates que não são padrão do sistema."
        onConfirm={async () => {
          if (!excluirTemplate) return;
          await excluirTemplateMensagemApi(excluirTemplate.id);
          toast.success("Template excluído.");
          setExcluirTemplate(null);
          setTemplateEdicao(undefined);
          await recarregar();
        }}
      />
    </div>
  );
}
