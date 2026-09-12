# Usuários e perfis de acesso

Este documento descreve como funcionam as contas do painel e o controle de acesso por perfil (RBAC) no ClinicERP.

## Visão geral

Cada usuário pertence a **uma clínica**, tem **um perfil de acesso** e pode atuar em **uma ou mais unidades**.

O perfil define o que a pessoa vê no menu e quais rotas pode abrir. As ações por módulo (visualizar, criar, editar, excluir) ficam gravadas no perfil e valem para todos os usuários daquele perfil.

Não há lista mockada de usuários ou de perfis: os dados vêm do banco da clínica.

## Usuários

### Primeiro acesso

Na configuração inicial da clínica é criado o primeiro usuário, sempre com o perfil **Administrador**. Os demais acessos são criados depois em **Configurações › Usuários**.

### Quem gerencia contas

O **Administrador** e o **Gestor** podem:

- ver a lista de usuários
- alterar o perfil de outros usuários

Somente o **Administrador** pode:

- criar contas
- ativar ou inativar contas
- abrir **Perfis e permissões**
- atribuir o perfil Administrador ou alterar a conta de outro administrador

Não é possível alterar o próprio perfil, inativar a própria conta nem o último administrador da clínica.

### Dados da conta

| Campo | Observação |
|---|---|
| Nome | Identificação no painel |
| E-mail | Login; único no sistema |
| Senha | Mínimo de 8 caracteres |
| Perfil | Um dos perfis da clínica |
| Unidade | Pelo menos uma unidade de acesso |
| Status | `ativo` ou `inativo` |

Usuário inativo não entra no painel.

### Limite do plano

O número de contas ativas e de unidades segue o plano configurado no deploy (`essencial`, `profissional` ou `ilimitado`). Quando o limite estoura, o administrador precisa inativar o excesso para voltar a criar. Nada é excluído automaticamente.

| Plano | Contas | Unidades | Módulos |
|---|---|---|---|
| Essencial | até 5 | 1 | Núcleo operacional (dashboard, pacientes, agenda, prontuário, profissionais, convênios, configurações/LGPD) |
| Profissional | até 20 | várias | Núcleo + financeiro completo, relatórios e estoque |
| Ilimitado | sem limite | sem limite | Tudo + integrações e lembretes, Power BI e agente de IA |

O plano corta o módulo mesmo que o perfil tenha a permissão marcada. Integrações, Power BI e Agente de IA já aparecem no menu (com cadeado fora do Ilimitado). Integrações e lembretes estão implementados no plano Ilimitado.

### Unidade

Se a pessoa tem acesso a mais de uma unidade, escolhe a unidade da sessão no login. A troca de unidade no painel só vale para unidades liberadas na conta.

## Perfis de acesso

No primeiro setup a clínica recebe cinco **perfis de sistema**:

| Perfil | Função |
|---|---|
| Administrador | Acesso total, inclusive configurações e gestão de contas |
| Gestor | Opera a clínica e altera o perfil de outros usuários, sem o restante das configurações |
| Recepção | Pacientes, agenda e financeiro básico (recebimentos) |
| Profissional de saúde | Agenda e pacientes, sem financeiro geral nem cadastro de profissionais |
| Financeiro | Financeiro, convênios e relatórios, sem configurações |

Esses perfis nascem com `sistema = true`. As permissões do **Administrador** não podem ser alteradas (acesso total permanente). Os outros perfis de sistema podem ter a matriz ajustada em **Configurações › Perfis e permissões**; a alteração vale para todos os usuários daquele perfil.

## Módulos

O menu é agrupado assim:

| Grupo | Módulos |
|---|---|
| Operação | Dashboard, Pacientes, Agenda, Profissionais |
| Gestão | Financeiro, Convênios, Estoque, Relatórios |
| Avançado | Integrações e lembretes, Power BI, Agente de IA |
| Sistema | Configurações |

Cada módulo tem quatro ações:

- **Visualizar** — o item aparece no menu e a rota abre
- **Criar** — cadastrar registros
- **Editar** — alterar registros
- **Desativar** — inativar, arquivar, reativar ou remover (a chave no banco continua `excluir`)

Se **visualizar** estiver desligado, o módulo some do menu. Abrir a URL direto redireciona para a primeira tela permitida.

**Usuários** exige perfil Administrador ou Gestor. **Perfis e permissões** exige perfil Administrador, mesmo que Configurações esteja visível.

## Matriz padrão

Legenda: **V** visualizar · **C** criar · **E** editar · **X** desativar (inativar, arquivar ou remover). Célula vazia = sem acesso ao módulo.

### Administrador

Acesso total em todos os módulos (V C E X).

### Gestor

| Módulo | V | C | E | X |
|---|---|---|---|---|
| Dashboard | ● | | | |
| Pacientes | ● | ● | ● | ● |
| Agenda | ● | ● | ● | ● |
| Profissionais | ● | ● | ● | ● |
| Financeiro | ● | ● | ● | ● |
| Convênios | ● | ● | ● | ● |
| Estoque | ● | ● | ● | ● |
| Relatórios | ● | | | |
| Integrações e lembretes | ● | | | |
| Power BI | ● | | | |
| Agente de IA | ● | | | |
| Configurações | ● | | | |

### Recepção

| Módulo | V | C | E | X |
|---|---|---|---|---|
| Dashboard | ● | | | |
| Pacientes | ● | ● | ● | |
| Agenda | ● | ● | ● | |
| Profissionais | ● | | | |
| Financeiro | ● | ● | | |
| Convênios | ● | | | |
| Estoque | | | | |
| Relatórios | | | | |
| Configurações | | | | |

### Profissional de saúde

| Módulo | V | C | E | X |
|---|---|---|---|---|
| Dashboard | ● | | | |
| Pacientes | ● | | ● | |
| Agenda | ● | ● | ● | |
| Profissionais | | | | |
| Financeiro | | | | |
| Convênios | ● | | | |
| Estoque | ● | | | |
| Relatórios | | | | |
| Configurações | | | | |

No dashboard deste perfil, cards de faturamento, contas a receber/pagar, gráficos financeiros e alertas de gestão ficam ocultos.

### Financeiro

| Módulo | V | C | E | X |
|---|---|---|---|---|
| Dashboard | ● | | | |
| Pacientes | ● | | | |
| Agenda | ● | | | |
| Profissionais | ● | | | |
| Financeiro | ● | ● | ● | ● |
| Convênios | ● | ● | ● | ● |
| Estoque | ● | | | |
| Relatórios | ● | | | |
| Configurações | | | | |

## O que cada perfil vê no menu

| | Admin | Gestor | Recepção | Prof. saúde | Financeiro |
|---|---|---|---|---|---|
| Dashboard | ● | ● | ● | ● | ● |
| Pacientes | ● | ● | ● | ● | ● |
| Agenda | ● | ● | ● | ● | ● |
| Profissionais | ● | ● | ● | | ● |
| Financeiro | ● | ● | ● | | ● |
| Convênios | ● | ● | ● | ● | ● |
| Estoque | ● | ● | | ● | ● |
| Relatórios | ● | ● | | | ● |
| Integrações | ● | ● | | | |
| Power BI | ● | ● | | | |
| Agente de IA | ● | ● | | | |
| Configurações | ● | ● | | | |

O Gestor vê Configurações com dados da clínica e procedimentos em leitura, além da aba **Usuários**. Perfis e permissões continua só para o Administrador.

Prontuário, evolução e documentos clínicos seguem **Pacientes**: visualizar para ver, editar para registrar, desativar para apagar anexo. O profissional de saúde continua restrito aos próprios pacientes.

## Onde isso vive no produto

- **Configurações › Usuários** — contas da clínica (administrador e gestor; gestor altera perfil, sem criar/inativar)
- **Configurações › Perfis e permissões** — matriz por perfil, com gravação no banco (somente administrador; perfil Administrador bloqueado para edição)

As permissões do usuário logado entram na sessão no login e são atualizadas em `/auth/me`. O menu e a proteção de rotas usam esse perfil real, não uma lista fixa no frontend.
