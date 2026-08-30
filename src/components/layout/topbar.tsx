"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Building2, LogOut, Menu, Search, Stethoscope, User, UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useSessaoStore } from "@/hooks/use-sessao";
import { getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getAlertas } from "@/services/dashboard";
import { listPacientes } from "@/services/pacientes";
import { listProfissionais } from "@/services/profissionais";
import { toast } from "sonner";

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

interface ResultadoBusca {
  id: string;
  nome: string;
  detalhe: string;
  href: string;
  tipo: "paciente" | "profissional";
}

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const router = useRouter();
  const sessao = useSessaoStore((state) => state.sessao);
  const setUnidade = useSessaoStore((state) => state.setUnidade);
  const encerrarSessao = useSessaoStore((state) => state.encerrarSessao);
  const [termo, setTermo] = React.useState("");
  const [buscaAberta, setBuscaAberta] = React.useState(false);

  const unidades = sessao?.unidades ?? [];
  const alertas = React.useMemo(() => getAlertas(), []);

  const resultados = React.useMemo<ResultadoBusca[]>(() => {
    const query = termo.trim().toLowerCase();
    if (query.length < 2) return [];

    const dePacientes = listPacientes()
      .filter(
        (paciente) =>
          paciente.nome.toLowerCase().includes(query) ||
          paciente.cpf.includes(query.replace(/\D/g, "")) ||
          paciente.telefone.includes(query.replace(/\D/g, "")),
      )
      .slice(0, 5)
      .map<ResultadoBusca>((paciente) => ({
        id: paciente.id,
        nome: paciente.nome,
        detalhe: "Paciente",
        href: `/pacientes/${paciente.id}`,
        tipo: "paciente",
      }));

    const deProfissionais = listProfissionais()
      .filter(
        (profissional) =>
          profissional.nome.toLowerCase().includes(query) ||
          profissional.especialidades.some((especialidade) => especialidade.toLowerCase().includes(query)),
      )
      .slice(0, 4)
      .map<ResultadoBusca>((profissional) => ({
        id: profissional.id,
        nome: profissional.nome,
        detalhe: profissional.especialidades.join(", "),
        href: `/profissionais/${profissional.id}`,
        tipo: "profissional",
      }));

    return [...dePacientes, ...deProfissionais];
  }, [termo]);

  function navegar(href: string) {
    setBuscaAberta(false);
    setTermo("");
    router.push(href);
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobileMenu} aria-label="Abrir menu">
        <Menu />
      </Button>

      <Popover open={buscaAberta && resultados.length > 0} onOpenChange={setBuscaAberta}>
        <PopoverTrigger asChild>
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={termo}
              onChange={(event) => {
                setTermo(event.target.value);
                setBuscaAberta(true);
              }}
              placeholder="Buscar paciente, CPF, telefone ou profissional..."
              className="pl-9"
              aria-label="Busca global"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(28rem,calc(100vw-2rem))] p-1.5"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <ul>
            {resultados.map((resultado) => (
              <li key={`${resultado.tipo}-${resultado.id}`}>
                <button
                  type="button"
                  onClick={() => navegar(resultado.href)}
                  className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-muted"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary">
                    {resultado.tipo === "paciente" ? (
                      <UserRound className="size-4" />
                    ) : (
                      <Stethoscope className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{resultado.nome}</span>
                    <span className="block truncate text-xs text-muted-foreground">{resultado.detalhe}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>

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
            <DropdownMenuItem asChild>
              <Link href="/configuracoes/usuarios">
                <User />
                Meu perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
