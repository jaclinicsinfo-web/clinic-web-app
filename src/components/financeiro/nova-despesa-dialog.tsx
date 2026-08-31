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
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { hojeISO } from "@/components/financeiro/utils";
import { criarDespesaApi } from "@/services/financeiro";

const schema = z.object({
  descricao: z.string().min(3, "Informe a descrição."),
  categoria: z.string().min(1, "Selecione a categoria."),
  fornecedor: z.string().min(2, "Informe o fornecedor."),
  valor: z.number().positive("Informe o valor."),
  vencimento: z.string().min(10),
  recorrente: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function NovaDespesaDialog({
  categorias,
  onCriada,
}: {
  categorias: string[];
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
      descricao: "",
      categoria: categorias[0] ?? "Outros",
      fornecedor: "",
      valor: 0,
      vencimento: hojeISO(),
      recorrente: false,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await criarDespesaApi(values);
      toast.success("Despesa cadastrada");
      reset();
      setAberto(false);
      onCriada();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Não foi possível cadastrar a despesa.");
    }
  }

  const valor = watch("valor");
  const categoria = watch("categoria");
  const recorrente = watch("recorrente");

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nova despesa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova despesa</DialogTitle>
          <DialogDescription>Contas a pagar da clínica, fixas ou eventuais.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody className="space-y-4">
            <FormField label="Descrição" htmlFor="desp-desc" required>
              <Input id="desp-desc" {...register("descricao")} />
              {errors.descricao && <p className="text-xs text-danger">{errors.descricao.message}</p>}
            </FormField>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Categoria" required>
                <Select value={categoria} onValueChange={(value) => setValue("categoria", value)}>
                  <SelectTrigger aria-label="Categoria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Fornecedor" htmlFor="desp-forn" required>
                <Input id="desp-forn" {...register("fornecedor")} />
              </FormField>
              <FormField label="Valor" required>
                <MoneyInput value={valor} onChange={(numero) => setValue("valor", numero, { shouldValidate: true })} />
              </FormField>
              <FormField label="Vencimento" htmlFor="desp-venc" required>
                <Input id="desp-venc" type="date" {...register("vencimento")} />
              </FormField>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Recorrente mensal</p>
                <p className="text-xs text-muted-foreground">Marca a despesa como custo fixo da operação</p>
              </div>
              <Switch checked={recorrente} onCheckedChange={(checked) => setValue("recorrente", checked)} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
