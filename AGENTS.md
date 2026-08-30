# ClinicERP — Guia do Projeto

## Especificação de referência

A especificação funcional e estrutural completa está em
[`docs/especificacao-erp-clinicas.md`](docs/especificacao-erp-clinicas.md).

**Leia esse documento antes de criar ou alterar qualquer módulo, tela, rota ou entidade.**
Ele define os módulos, telas, fluxos, modelo de dados, componentes reutilizáveis e a ordem
de prioridade de implementação. Em caso de divergência entre o código atual e o documento,
o documento é a fonte da verdade.

## O que este sistema é

ERP web para gestão administrativa de clínicas multi-especialidade (médicas, odontológicas,
estéticas). **Somente back-office**: usado por administradores, gestores, recepção,
financeiro e profissionais de saúde.

Não existe acesso de paciente. Não há portal do paciente neste repositório.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · componentes estilo shadcn/ui (Radix)
· lucide-react · Recharts · React Hook Form + Zod · TanStack Table · TanStack Query
· Zustand · date-fns · sonner

## Convenções

- **Rotas em português**: `/pacientes`, `/agenda`, `/profissionais`, `/financeiro`,
  `/convenios`, `/estoque`, `/relatorios`, `/configuracoes`.
- **Route groups**: `(auth)` para telas públicas, `(app)` para o painel autenticado.
- **Idioma da UI**: português do Brasil. Datas `dd/MM/yyyy`, moeda `R$` (pt-BR).
- **Domínio em português** nos tipos e campos (`paciente`, `profissional`, `agendamento`),
  seguindo o modelo de dados da seção 14 da especificação.
- **Primitivos de UI** ficam em `src/components/ui`. Não use bibliotecas de componentes
  alternativas nem duplique primitivos dentro de módulos.
- **Componentes transversais** ficam em `src/components/shared`
  (`DataTable`, `StatusBadge`, `StatCard`, `EmptyState`, `ConfirmDialog`, `MoneyInput`,
  `FormSection`, `Timeline`, `PageHeader`).
- **Componentes de módulo** ficam em `src/components/<modulo>`.
- **Dados**: as telas consomem `src/services/*`. Hoje os services retornam mocks de
  `src/services/mock`; a troca para a API real deve acontecer apenas dentro de `services`.
- **Status** usam as cores padronizadas da seção 3.2 (verde confirmado/pago, amarelo
  pendente, vermelho cancelado/atrasado, azul agendado/em andamento, cinza inativo).
- **Responsividade**: desktop é prioridade, tablet precisa funcionar, mobile é secundário.

## Estrutura

```
src/
├── app/(auth)/          # login
├── app/(app)/           # painel: dashboard e módulos
├── components/ui/       # primitivos (Button, Input, Card, Dialog, Table...)
├── components/layout/   # AppShell, Sidebar, Topbar, Breadcrumbs
├── components/shared/   # componentes transversais
├── components/<modulo>/ # componentes específicos de módulo
├── hooks/
├── lib/                 # utils, formatadores, cliente de API
├── services/            # acesso a dados (+ services/mock)
└── types/               # tipos do domínio
```

## Comandos

```bash
npm run dev     # servidor de desenvolvimento
npm run build   # build de produção
npm run lint    # ESLint
```
