"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { FormField } from "@/components/shared/form-section";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { somarMinutos } from "@/services/agenda";
import type { BloqueioAgenda, Profissional } from "@/types";

const schema = z
  .object({
    profissionalId: z.string().min(1, "Selecione o profissional."),
    data: z.string().min(1, "Informe a data."),
    horaInicio: z.string().min(1, "Informe o início."),
    horaFim: z.string().min(1, "Informe o término."),
    motivo: z.string().min(3, "Descreva o motivo do bloqueio."),
  })
  .refine((values) => values.horaFim > values.horaInicio, {
    message: "O término deve ser posterior ao início.",
    path: ["horaFim"],
  });

type FormValues = z.infer<typeof schema>;

interface BloqueioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profissionais: Profissional[];
  dataPadrao: string;
  profissionalPadrao?: string;
  onSave: (bloqueio: Omit<BloqueioAgenda, "id">) => void | Promise<void>;
}

export function BloqueioDialog({
  open,
  onOpenChange,
  profissionais,
  dataPadrao,
  profissionalPadrao,
  onSave,
}: BloqueioDialogProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      profissionalId: profissionalPadrao ?? "",
      data: dataPadrao,
      horaInicio: "12:00",
      horaFim: "13:00",
      motivo: "",
    },
  });

  React.useEffect(() => {
    if (!open) return;
    reset({
      profissionalId: profissionalPadrao ?? "",
      data: dataPadrao,
      horaInicio: "12:00",
      horaFim: "13:00",
      motivo: "",
    });
  }, [open, dataPadrao, profissionalPadrao, reset]);

  const values = watch();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bloquear horário</DialogTitle>
          <DialogDescription>Folga, almoço ou indisponibilidade do profissional na grade.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (form) => {
            await onSave({
              profissionalId: form.profissionalId,
              data: form.data,
              horaInicio: form.horaInicio,
              horaFim: form.horaFim,
              motivo: form.motivo,
            });
          })}
        >
          <DialogBody className="space-y-4">
            <FormField label="Profissional" error={errors.profissionalId?.message} required>
              <Select
                value={values.profissionalId}
                onValueChange={(valor) => setValue("profissionalId", valor, { shouldValidate: true })}
              >
                <SelectTrigger aria-label="Profissional">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.map((profissional) => (
                    <SelectItem key={profissional.id} value={profissional.id}>
                      {profissional.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Data" htmlFor="bloqueio-data" error={errors.data?.message} required>
              <Input
                id="bloqueio-data"
                type="date"
                value={values.data}
                onChange={(event) => setValue("data", event.target.value, { shouldValidate: true })}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Início" htmlFor="bloqueio-inicio" error={errors.horaInicio?.message} required>
                <Input
                  id="bloqueio-inicio"
                  type="time"
                  value={values.horaInicio}
                  onChange={(event) => {
                    setValue("horaInicio", event.target.value);
                    if (!values.horaFim || values.horaFim <= event.target.value) {
                      setValue("horaFim", somarMinutos(event.target.value, 60));
                    }
                  }}
                />
              </FormField>
              <FormField label="Término" htmlFor="bloqueio-fim" error={errors.horaFim?.message} required>
                <Input
                  id="bloqueio-fim"
                  type="time"
                  value={values.horaFim}
                  onChange={(event) => setValue("horaFim", event.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Motivo" htmlFor="bloqueio-motivo" error={errors.motivo?.message} required>
              <Textarea
                id="bloqueio-motivo"
                rows={3}
                value={values.motivo}
                onChange={(event) => setValue("motivo", event.target.value, { shouldValidate: true })}
                placeholder="Almoço, congresso, folga programada..."
              />
            </FormField>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Bloquear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
