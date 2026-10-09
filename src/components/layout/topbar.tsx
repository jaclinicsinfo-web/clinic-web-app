"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Building2, LogOut, Menu, Moon, Palette, Sun, User } from "lucide-react";

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
import { AvisoTeste } from "@/components/layout/aviso-teste";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { useSessaoStore } from "@/hooks/use-sessao";
import { useTema } from "@/hooks/use-tema";
import { getInitials } from "@/lib/format";
import { temPermissao } from "@/lib/permissoes";
import { cn } from "@/lib/utils";
import { listarNotificacoesApi, marcarNotificacaoLidaApi, marcarNotificacoesLidasApi } from "@/services/notificacoes";
import type { Notificacao } from "@/types";
import { toast } from "sonner";

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const router = useRouter();
  const sessao = useSessaoStore((state) => state.sessao);
  const setUnidade = useSessaoStore((state) => state.setUnidade);
  const encerrarSessao = useSessaoStore((state) => state.encerrarSessao);
  const { toggleTema } = useTema();

  const unidades = sessao?.unidades ?? [];
  const [notificacoes, setNotificacoes] = React.useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = React.useState(0);

  const carregar = React.useCallback(() => {
    listarNotificacoesApi()
      .then((data) => {
        setNotificacoes(data.notificacoes);
        setNaoLidas(data.naoLidas);
      })
      .catch(() => {
        // Sino não deve derrubar a sessão se a API falhar.
      });
  }, []);

  React.useEffect(() => {
    if (!sessao) return;
    carregar();
    const timer = window.setInterval(carregar, 60_000);
    return () => window.clearInterval(timer);
  }, [sessao, carregar]);

  async function marcarUma(notificacao: Notificacao) {
    if (!notificacao.lida) {
      try {
        const atualizada = await marcarNotificacaoLidaApi(notificacao.id);
        setNotificacoes((atual) => atual.map((item) => (item.id === atualizada.id ? atualizada : item)));
        setNaoLidas((atual) => Math.max(0, atual - 1));
      } catch {
        toast.error("Não foi possível marcar a notificação como lida.");
        return;
      }
    }
    if (notificacao.href) router.push(notificacao.href);
  }

  async function marcarTodas() {
    try {
      const data = await marcarNotificacoesLidasApi();
      setNotificacoes(data.notificacoes);
      setNaoLidas(data.naoLidas);
    } catch {
      toast.error("Não foi possível marcar as notificações como lidas.");
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3 sm:h-16 sm:gap-3 sm:px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="touch-manipulation shrink-0 xl:hidden" onClick={onOpenMobileMenu} aria-label="Abrir menu">
        <Menu />
      </Button>

      <div className="min-w-0 flex-1 overflow-hidden">
        <Breadcrumbs />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
        <AvisoTeste />
        {sessao && unidades.length > 0 && (
          <Select
            value={sessao.unidadeAtualId}
            onValueChange={(id) => {
              void setUnidade(id).catch(() => {
                toast.error("Não foi possível trocar a unidade.");
              });
            }}
          >
            <SelectTrigger className="hidden w-36 md:flex lg:w-52" aria-label="Unidade">
              <span className="flex min-w-0 items-center gap-2 overflow-hidden">
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

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTema}
          aria-label="Alternar entre tema claro e escuro"
        >
          <Sun className="hidden dark:block" />
          <Moon className="block dark:hidden" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
              <Bell />
              {naoLidas > 0 && (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(20rem,calc(100vw-1.5rem))] p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notificações</p>
              <div className="flex items-center gap-2">
                <Badge tone="outline">{naoLidas}</Badge>
                {naoLidas > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => void marcarTodas()}>
                    Marcar lidas
                  </Button>
                )}
              </div>
            </div>
            {notificacoes.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhuma notificação no momento.</p>
            ) : (
              <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                {notificacoes.map((notificacao) => (
                  <li key={notificacao.id}>
                    <button
                      type="button"
                      className={cn(
                        "w-full px-4 py-3 text-left transition-colors hover:bg-muted",
                        !notificacao.lida && "bg-primary-subtle/40",
                      )}
                      onClick={() => void marcarUma(notificacao)}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-1.5 size-2 shrink-0 rounded-full",
                            notificacao.severidade === "alta"
                              ? "bg-danger"
                              : notificacao.severidade === "media"
                                ? "bg-warning"
                                : "bg-info",
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">{notificacao.titulo}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{notificacao.descricao}</p>
                        </div>
                      </div>
                    </button>
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
              <span className="hidden text-left xl:block">
                <span className="block text-sm font-medium leading-tight text-foreground">{sessao?.nome}</span>
                <span className="block text-xs leading-tight text-muted-foreground">{sessao?.perfil}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{sessao?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {temPermissao(sessao?.permissoes, "configuracoes") && (
              <DropdownMenuItem asChild>
                <Link href="/configuracoes/estilizacao">
                  <Palette />
                  Estilização
                </Link>
              </DropdownMenuItem>
            )}
            {sessao?.perfil === "Administrador" && (
              <DropdownMenuItem asChild>
                <Link href="/configuracoes/usuarios">
                  <User />
                  Meu perfil
                </Link>
              </DropdownMenuItem>
            )}
            {(temPermissao(sessao?.permissoes, "configuracoes") || sessao?.perfil === "Administrador") && (
              <DropdownMenuSeparator />
            )}
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
