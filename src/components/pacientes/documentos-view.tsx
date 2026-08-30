"use client";

import * as React from "react";
import { Download, FileImage, FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-section";
import { formatDate, formatNumber } from "@/lib/format";
import type { DocumentoPaciente } from "@/services/pacientes";

const tiposDocumento = [
  "Exame laboratorial",
  "Exame de imagem",
  "Laudo",
  "Receita",
  "Atestado",
  "Termo de consentimento",
  "Documento pessoal",
];

export function DocumentosView({
  documentos,
  pacienteNome,
}: {
  documentos: DocumentoPaciente[];
  pacienteNome: string;
}) {
  const [uploadAberto, setUploadAberto] = React.useState(false);
  const [tipo, setTipo] = React.useState(tiposDocumento[0]);
  const [enviando, setEnviando] = React.useState(false);
  const [aRemover, setARemover] = React.useState<DocumentoPaciente | null>(null);

  async function enviar() {
    setEnviando(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setEnviando(false);
    setUploadAberto(false);
    toast.success("Documento anexado", { description: `${tipo} — ${pacienteNome}` });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Documentos e anexos</CardTitle>
            <CardDescription>
              {documentos.length} {documentos.length === 1 ? "arquivo vinculado" : "arquivos vinculados"} ao paciente
            </CardDescription>
          </div>
          <Button onClick={() => setUploadAberto(true)}>
            <Upload />
            Anexar documento
          </Button>
        </CardHeader>
        <CardContent className={documentos.length === 0 ? undefined : "px-0 pb-0"}>
          {documentos.length === 0 ? (
            <EmptyState
              title="Nenhum documento anexado"
              description="Envie exames, laudos e termos assinados para manter o histórico completo."
              icon={FileText}
              action={
                <Button onClick={() => setUploadAberto(true)}>
                  <Upload />
                  Anexar documento
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {documentos.map((documento) => {
                const Icon = documento.tipo.startsWith("image") ? FileImage : FileText;

                return (
                  <li key={documento.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                      <Icon className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{documento.nome}</p>
                      <p className="truncate text-xs text-muted-foreground">{documento.origem}</p>
                    </div>

                    <Badge tone="outline" className="hidden sm:inline-flex">
                      {formatNumber(documento.tamanhoKb)} KB
                    </Badge>

                    <span className="hidden w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground md:block">
                      {formatDate(documento.criadoEm)}
                    </span>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button variant="ghost" size="icon-sm" asChild aria-label={`Baixar ${documento.nome}`}>
                        <a href={documento.url} download>
                          <Download />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setARemover(documento)}
                        aria-label={`Excluir ${documento.nome}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={uploadAberto} onOpenChange={setUploadAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anexar documento</DialogTitle>
            <DialogDescription>{pacienteNome}</DialogDescription>
          </DialogHeader>

          <DialogBody className="space-y-4">
            <FormField label="Tipo de documento" required>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger aria-label="Tipo de documento">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposDocumento.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Arquivo" required hint="PDF, JPG ou PNG de até 10 MB.">
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png" />
            </FormField>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadAberto(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button onClick={enviar} loading={enviando}>
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={aRemover !== null}
        onOpenChange={(aberto) => !aberto && setARemover(null)}
        title="Excluir documento"
        description={`O arquivo "${aRemover?.nome}" será removido permanentemente do prontuário do paciente.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={() => {
          toast.success("Documento excluído", { description: aRemover?.nome });
          setARemover(null);
        }}
      />
    </>
  );
}
