"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = true,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [pendente, setPendente] = useState(false);
  const ocupado = loading || pendente;

  async function confirmar() {
    setPendente(true);
    try {
      await onConfirm();
    } finally {
      setPendente(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <div className="flex gap-4 px-6 pb-2 pt-6">
          <span
            className={
              destructive
                ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-bg text-danger"
                : "flex size-10 shrink-0 items-center justify-center rounded-full bg-warning-bg text-warning"
            }
          >
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 pt-0.5">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription className="mt-1">{description}</DialogDescription>
          </div>
        </div>
        <DialogFooter className="border-t-0 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={ocupado}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? "destructive" : "default"} onClick={() => void confirmar()} loading={ocupado}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
