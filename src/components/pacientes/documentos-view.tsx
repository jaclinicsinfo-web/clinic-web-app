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
import { ApiError } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/format";
import {
  baixarDocumentoApi,
  enviarDocumentoApi,
  excluirDocumentoApi,
  type DocumentoPaciente,
} from "@/services/pacientes";

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
  documentos: documentosIniciais,
  pacienteId,
  pacienteNome,
  podeRegistrar = false,
  onAtualizado,
}: {
  documentos: DocumentoPaciente[];
  pacienteId: string;
  pacienteNome: string;
  podeRegistrar?: boolean;
  onAtualizado?: (documentos: DocumentoPaciente[]) => void;
}) {
  const [documentos, setDocumentos] = React.useState(documentosIniciais);
  const [uploadAberto, setUploadAberto] = React.useState(false);
  const [tipo, setTipo] = React.useState(tiposDocumento[0]);
  const [arquivo, setArquivo] = React.useState<File | null>(null);
  const [enviando, setEnviando] = React.useState(false);
  const [aRemover, setARemover] = React.useState<DocumentoPaciente | null>(null);

  React.useEffect(() => {
    setDocumentos(documentosIniciais);
  }, [documentosIniciais]);

  async function enviar() {
    if (!arquivo) {
      toast.error("Selecione um arquivo PDF, JPG ou PNG.");
      return;
    }
    setEnviando(true);
    try {
      const criado = await enviarDocumentoApi(pacienteId, arquivo, tipo);
      const lista = [criado, ...documentos];
      setDocumentos(lista);
      onAtualizado?.(lista);
      setUploadAberto(false);
      setArquivo(null);
      toast.success("Documento anexado", { description: `${tipo} — ${pacienteNome}` });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível enviar o documento.");
    } finally {
      setEnviando(false);
    }
  }

  async function baixar(documento: DocumentoPaciente) {
    try {
      const blob = await baixarDocumentoApi(pacienteId, documento.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = documento.nome;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível baixar o arquivo.");
    }
  }

  async function excluir() {
    if (!aRemover) return;
    try {
      await excluirDocumentoApi(pacienteId, aRemover.id);
      const lista = documentos.filter((item) => item.id !== aRemover.id);
      setDocumentos(lista);
      onAtualizado?.(lista);
      toast.success("Documento excluído", { description: aRemover.nome });
      setARemover(null);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível excluir o documento.");
    }
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
          {podeRegistrar && (
            <Button onClick={() => setUploadAberto(true)}>
              <Upload />
              Anexar documento
            </Button>
          )}
        </CardHeader>
        <CardContent className={documentos.length === 0 ? undefined : "px-0 pb-0"}>
          {documentos.length === 0 ? (
            <EmptyState
              title="Nenhum documento anexado"
              description="Envie exames, laudos e termos assinados para manter o histórico completo."
              icon={FileText}
              action={
                podeRegistrar ? (
                  <Button onClick={() => setUploadAberto(true)}>
                    <Upload />
                    Anexar documento
                  </Button>
                ) : undefined
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
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => void baixar(documento)}
                        aria-label={`Baixar ${documento.nome}`}
                      >
                        <Download />
                      </Button>
                      {podeRegistrar && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setARemover(documento)}
                          aria-label={`Excluir ${documento.nome}`}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={uploadAberto}
        onOpenChange={(aberto) => {
          setUploadAberto(aberto);
          if (!aberto) setArquivo(null);
        }}
      >
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
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(event) => setArquivo(event.target.files?.[0] ?? null)}
              />
            </FormField>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadAberto(false)} disabled={enviando}>
              Cancelar
            </Button>
            <Button onClick={() => void enviar()} loading={enviando} disabled={!arquivo}>
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
        onConfirm={() => void excluir()}
      />
    </>
  );
}
