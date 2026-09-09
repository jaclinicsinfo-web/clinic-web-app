"use client";

import * as React from "react";
import { Download, FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Pode } from "@/components/auth/pode";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

interface Documento {
  id: string;
  nome: string;
  tipo: "Contrato" | "Certificação" | "Conselho de classe" | "Documento pessoal";
  tamanhoKb: number;
  criadoEm: string;
  validade?: string;
}

const documentosIniciais: Documento[] = [
  {
    id: "doc-1",
    nome: "Contrato de prestação de serviços.pdf",
    tipo: "Contrato",
    tamanhoKb: 412,
    criadoEm: "2023-02-14",
  },
  {
    id: "doc-2",
    nome: "Certidão de regularidade do conselho.pdf",
    tipo: "Conselho de classe",
    tamanhoKb: 186,
    criadoEm: "2024-01-09",
    validade: "2026-01-09",
  },
  {
    id: "doc-3",
    nome: "Diploma de graduação.pdf",
    tipo: "Certificação",
    tamanhoKb: 1520,
    criadoEm: "2023-02-14",
  },
  {
    id: "doc-4",
    nome: "Certificado de especialização.pdf",
    tipo: "Certificação",
    tamanhoKb: 980,
    criadoEm: "2023-06-27",
  },
  {
    id: "doc-5",
    nome: "RG e CPF digitalizados.pdf",
    tipo: "Documento pessoal",
    tamanhoKb: 244,
    criadoEm: "2023-02-14",
  },
];

const tipoTone: Record<Documento["tipo"], "primary" | "info" | "outline"> = {
  Contrato: "primary",
  "Conselho de classe": "info",
  Certificação: "outline",
  "Documento pessoal": "outline",
};

function formatTamanho(tamanhoKb: number) {
  if (tamanhoKb < 1024) return `${tamanhoKb} KB`;
  return `${(tamanhoKb / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
}

export function ProfissionalDocumentos({ profissionalNome }: { profissionalNome: string }) {
  const [documentos, setDocumentos] = React.useState<Documento[]>(documentosIniciais);
  const [removendo, setRemovendo] = React.useState<Documento | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>
              Contrato, certificações e documentos do conselho de classe de {profissionalNome}
            </CardDescription>
          </div>
          <Pode modulo="profissionais" acao="editar">
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => toast.info("Envio de documentos disponível em breve.")}
            >
              <Upload />
              Enviar documento
            </Button>
          </Pode>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {documentos.length === 0 ? (
            <EmptyState
              title="Nenhum documento anexado"
              description="Envie o contrato, as certificações e os documentos do conselho para manter o cadastro completo."
              icon={FileText}
              action={
                <Pode modulo="profissionais" acao="editar">
                  <Button variant="outline" onClick={() => toast.info("Envio de documentos disponível em breve.")}>
                    <Upload />
                    Enviar documento
                  </Button>
                </Pode>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {documentos.map((documento) => (
                <li key={documento.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                    <FileText className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{documento.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTamanho(documento.tamanhoKb)} · enviado em {formatDate(documento.criadoEm)}
                      {documento.validade ? ` · válido até ${formatDate(documento.validade)}` : ""}
                    </p>
                  </div>

                  <Badge tone={tipoTone[documento.tipo]} className="hidden sm:inline-flex">
                    {documento.tipo}
                  </Badge>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Baixar ${documento.nome}`}
                      onClick={() => toast.info("Download disponível quando o armazenamento estiver conectado.")}
                    >
                      <Download />
                    </Button>
                    <Pode modulo="profissionais" acao="editar">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Excluir ${documento.nome}`}
                      onClick={() => setRemovendo(documento)}
                    >
                      <Trash2 />
                    </Button>
                    </Pode>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Pode modulo="profissionais" acao="editar">
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-input bg-card px-6 py-10 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Upload className="size-5" />
        </span>
        <p className="mt-3 text-sm font-medium text-foreground">Arraste arquivos para cá</p>
        <p className="mt-1 text-sm text-muted-foreground">PDF, JPG ou PNG de até 10 MB por arquivo.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => toast.info("Envio de documentos disponível em breve.")}
        >
          Selecionar arquivos
        </Button>
      </div>
      </Pode>

      <ConfirmDialog
        open={Boolean(removendo)}
        onOpenChange={(aberto) => !aberto && setRemovendo(null)}
        title="Excluir documento?"
        description={`${removendo?.nome ?? ""} será removido do cadastro do profissional. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={() => {
          setDocumentos((atual) => atual.filter((documento) => documento.id !== removendo?.id));
          toast.success("Documento excluído", { description: removendo?.nome });
          setRemovendo(null);
        }}
      />
    </div>
  );
}
