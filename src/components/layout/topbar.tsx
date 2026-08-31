"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Building2, LogOut, Menu, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useSessaoStore } from "@/hooks/use-sessao";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getAlertas } from "@/services/dashboard";
import { toast } from "sonner";

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const router = useRouter();
  const sessao = useSessaoStore((state) => state.sessao);
  const setUnidade = useSessaoStore((state) => state.setUnidade);
  const encerrarSessao = useSessaoStore((state) => state.encerrarSessao);

  const unidades = sessao?.unidades ?? [];
  const alertas = React.useMemo(() => getAlertas(), []);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileMenu} aria-label="Abrir menu">
        <Menu />
      </Button>

      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {sessao && unidades.length > 0 && (
          <Select
            value={sessao.unidadeAtualId}
            onValueChange={(id) => {
              void setUnidade(id).catch(() => {
                toast.error("Não foi possível trocar a unidade.");
              });
            }}
          >
            <SelectTrigger className="hidden w-52 md:flex" aria-label="Unidade">
              <span className="flex min-w-0 items-center gap-2">
                <Building2 className="size-4 shrink-0 text-muted-foreground" />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              {unidades.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
              <Bell />
              {alertas.length > 0 && (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Alertas</p>
              <Badge tone="outline">{alertas.length}</Badge>
            </div>
            {alertas.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhum alerta no momento.</p>
            ) : (
              <ul className="divide-y divide-border">
                {alertas.map((alerta) => (
                  <li key={alerta.id} className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-1.5 size-2 shrink-0 rounded-full",
                          alerta.severidade === "alta"
                            ? "bg-danger"
                            : alerta.severidade === "media"
                              ? "bg-warning"
                              : "bg-info",
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{alerta.titulo}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{alerta.descricao}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="size-8">
                <AvatarFallback>{getInitials(sessao?.nome ?? "")}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left lg:block">
                <span className="block text-sm font-medium leading-tight text-foreground">{sessao?.nome}</span>
                <span className="block text-xs leading-tight text-muted-foreground">{sessao?.perfil}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{sessao?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sessao?.perfil === "Administrador" && (
              <DropdownMenuItem asChild>
                <Link href="/configuracoes/usuarios">
                  <User />
                  Meu perfil
                </Link>
              </DropdownMenuItem>
            )}
            {sessao?.perfil === "Administrador" && <DropdownMenuSeparator />}
            <DropdownMenuItem
              destructive
              onSelect={() => {
                encerrarSessao();
                router.push("/login");
              }}
            >
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
