"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { FormField } from "@/components/shared/form-section";
import { MoneyInput } from "@/components/shared/money-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/lib/api";
import { hojeISO } from "@/components/financeiro/utils";
import { criarCobrancaApi } from "@/services/financeiro";

const schema = z.object({
  pacienteId: z.string().min(1, "Selecione o paciente."),
  descricao: z.string().min(3, "Informe a descrição."),
  valor: z.number().positive("Informe o valor."),
  vencimento: z.string().min(10, "Informe o vencimento."),
  convenioId: z.string(),
  parcelas: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function NovaCobrancaDialog({
  pacientes,
  convenios,
  onCriada,
}: {
  pacientes: { id: string; nome: string }[];
  convenios: { id: string; nome: string }[];
  onCriada: () => void;
}) {
  const [aberto, setAberto] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      pacienteId: "",
      descricao: "",
      valor: 0,
      vencimento: hojeISO(),
      convenioId: "particular",
      parcelas: "1",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const quantidade = Number(values.parcelas);
      await criarCobrancaApi({
        pacienteId: values.pacienteId,
        descricao: values.descricao,
        valor: values.valor,
        vencimento: values.vencimento,
        convenioId: values.convenioId === "particular" ? null : values.convenioId,
        parcelas: quantidade >= 2 ? quantidade : undefined,
      });
      toast.success("Cobrança gerada");
      reset();
      setAberto(false);
      onCriada();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível gerar a cobrança.");
    }
  }

  const valor = watch("valor");
  const convenioId = watch("convenioId");
  const parcelas = watch("parcelas");
  const pacienteId = watch("pacienteId");

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Gerar cobrança
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova cobrança</DialogTitle>
          <DialogDescription>Lançamento avulso ou particular, com parcelamento opcional.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody className="space-y-4">
            <FormField label="Paciente" required>
              <Select value={pacienteId} onValueChange={(value) => setValue("pacienteId", value, { shouldValidate: true })}>
                <SelectTrigger aria-label="Paciente">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((paciente) => (
                    <SelectItem key={paciente.id} value={paciente.id}>
                      {paciente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pacienteId && <p className="text-xs text-danger">{errors.pacienteId.message}</p>}
            </FormField>

            <FormField label="Descrição" htmlFor="cob-desc" required>
              <Input id="cob-desc" {...register("descricao")} />
              {errors.descricao && <p className="text-xs text-danger">{errors.descricao.message}</p>}
            </FormField>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Valor" required>
                <MoneyInput value={valor} onChange={(numero) => setValue("valor", numero, { shouldValidate: true })} />
                {errors.valor && <p className="text-xs text-danger">{errors.valor.message}</p>}
              </FormField>
              <FormField label="Vencimento" htmlFor="cob-venc" required>
                <Input id="cob-venc" type="date" {...register("vencimento")} />
              </FormField>
              <FormField label="Origem">
                <Select value={convenioId} onValueChange={(value) => setValue("convenioId", value)}>
                  <SelectTrigger aria-label="Origem">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Particular</SelectItem>
                    {convenios.map((convenio) => (
                      <SelectItem key={convenio.id} value={convenio.id}>
                        {convenio.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Parcelas">
                <Select value={parcelas} onValueChange={(value) => setValue("parcelas", value)}>
                  <SelectTrigger aria-label="Parcelas">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">À vista</SelectItem>
                    {[2, 3, 4, 5, 6, 10, 12].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}x
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Gerar cobrança
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
